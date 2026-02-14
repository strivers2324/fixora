package service

import (
	"context"
	"crypto/rand"
	"database/sql"
	"fmt"
	"io"
	"log"
	"os"
	"time"

	"fixora-server/models"
	"fixora-server/pkg/apperrors"
	"fixora-server/repository"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	AuthRepo *repository.AuthRepository
}

func NewAuthService(authRepo *repository.AuthRepository) *AuthService {
	return &AuthService{AuthRepo: authRepo}
}

func (s *AuthService) RegisterUser(ctx context.Context, req models.UserRegisterRequest) (string, error) {
	exists, err := s.AuthRepo.CheckUserExists(ctx, req.Phone)
	if err != nil {
		return "", apperrors.ErrInternalServer
	}
	if exists {
		return "", apperrors.ErrPhoneExists
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return "", apperrors.ErrInternalServer
	}

	userID, err := uuid.NewV7()
	if err != nil {
		return "", apperrors.ErrInternalServer
	}

	if err := s.AuthRepo.CreateUser(ctx, userID.String(), req.Phone, string(hash)); err != nil {
		return "", apperrors.ErrInternalServer
	}

	return s.generateAndSaveOTP(ctx, userID, models.USER, models.REGISTER)
}

func (s *AuthService) RegisterServiceProvider(ctx context.Context, req models.ServiceProviderRegisterRequest) (string, error) {
	exists, err := s.AuthRepo.CheckServiceProviderExists(ctx, req.Phone)
	if err != nil {
		return "", apperrors.ErrInternalServer
	}
	if exists {
		return "", apperrors.ErrPhoneExists
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return "", apperrors.ErrInternalServer
	}

	providerID, err := uuid.NewV7()
	if err != nil {
		return "", apperrors.ErrInternalServer
	}

	if err := s.AuthRepo.CreateServiceProvider(ctx, providerID.String(), req.Phone, req.ProfessionID, string(hash)); err != nil {
		return "", apperrors.ErrInternalServer
	}

	return s.generateAndSaveOTP(ctx, providerID, models.SERVICE_PROVIDER, models.REGISTER)
}

func (s *AuthService) VerifyUserPhone(ctx context.Context, otpID, code string) error {
	return s.VerifyPhoneNumber(ctx, otpID, code, models.USER)
}

func (s *AuthService) VerifyServiceProviderPhone(ctx context.Context, otpID, code string) error {
	return s.VerifyPhoneNumber(ctx, otpID, code, models.SERVICE_PROVIDER)
}

func (s *AuthService) Login(ctx context.Context, req models.LoginRequest) (string, string, string, bool, string, string, error) {
	var savedHash, userID, profession string
	var isVerified bool
	var err error

	if req.Role == models.USER {
		data, err := s.AuthRepo.GetUserLoginData(ctx, req.Phone)
		if err != nil {
			if err == sql.ErrNoRows {
				return "", "", "", false, "", "", apperrors.ErrInvalidCredentials
			}
			return "", "", "", false, "", "", apperrors.ErrInternalServer
		}
		userID, savedHash, isVerified = data.UserID, data.PasswordHash, data.IsPhoneVerified
		profession = ""

	} else if req.Role == models.SERVICE_PROVIDER {
		data, err := s.AuthRepo.GetServiceProviderLoginData(ctx, req.Phone)
		if err != nil {
			if err == sql.ErrNoRows {
				return "", "", "", false, "", "", apperrors.ErrInvalidCredentials
			}
			return "", "", "", false, "", "", apperrors.ErrInternalServer
		}
		userID, savedHash, isVerified = data.ProviderID, data.PasswordHash, data.IsPhoneVerified
		profession = data.ProfessionName

	} else {
		return "", "", "", false, "", "", apperrors.NewCustomError(400, "Invalid role specified", "INVALID_ROLE")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(savedHash), []byte(req.Password)); err != nil {
		return "", "", "", false, "", "", apperrors.ErrInvalidCredentials
	}

	accessToken, refreshToken, err := s.generateAndSaveTokens(ctx, req.Role, userID)
	if err != nil {
		return "", "", "", false, "", "", apperrors.ErrInternalServer
	}

	var otpID string
	if !isVerified {
		if fetchedOtpID, err := s.AuthRepo.GetOTPID(ctx, userID); err == nil {
			otpID = fetchedOtpID
		}
	}

	return accessToken, refreshToken, req.Phone, isVerified, otpID, profession, nil
}

func (s *AuthService) RefreshToken(ctx context.Context, oldRefreshToken string) (string, error) {
	userID, roleStr, expiresAt, err := s.AuthRepo.FindRefreshToken(ctx, oldRefreshToken)
	if err != nil {
		return "", apperrors.ErrInvalidToken
	}

	if time.Now().UTC().After(expiresAt) {
		if err := s.AuthRepo.DeleteRefreshToken(ctx, oldRefreshToken); err != nil {
			log.Printf("Failed to delete expired refresh token: %v", err)
		}
		return "", apperrors.ErrTokenExpired
	}

	secretKey := s.getSecretKey()
	accessToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, models.AppClaims{
		Role:   models.Role(roleStr),
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().UTC().Add(15 * time.Minute)),
			Issuer:    "fixora",
		},
	}).SignedString(secretKey)

	if err != nil {
		return "", apperrors.ErrInternalServer
	}

	return accessToken, nil
}

func (s *AuthService) Logout(ctx context.Context, token string) error {
	return s.AuthRepo.DeleteRefreshToken(ctx, token)
}

func (s *AuthService) CheckResendEligibility(ctx context.Context, otpID string) (*models.OTP, *models.OTPAttempt, error) {
	oldOTP, err := s.AuthRepo.GetOTPInfo(ctx, otpID)
	if err != nil {
		return nil, nil, apperrors.NewCustomError(400, "Invalid or expired OTP session", "INVALID_SESSION")
	}

	attempt, err := s.AuthRepo.GetOTPAttemptInfo(ctx, oldOTP.EntityID)
	if err != nil {
		return nil, nil, apperrors.ErrInternalServer
	}
	maxResendLimit := 3
	if oldOTP.Type == models.REGISTER {
		maxResendLimit = 5
	}
	if attempt != nil && attempt.Count >= maxResendLimit {
		return nil, nil, apperrors.NewCustomError(429, "Maximum resend limit reached, please contact support", "LIMIT_REACHED")
	}

	return oldOTP, attempt, nil
}

func (s *AuthService) PerformResend(ctx context.Context, oldOTP *models.OTP, attempt *models.OTPAttempt) (string, error) {
	newCount := 1
	if attempt != nil {
		newCount = attempt.Count + 1
	}

	if err := s.AuthRepo.UpdateOTPAttempt(ctx, &models.OTPAttempt{
		EntityID:      oldOTP.EntityID,
		Count:         newCount,
		LastAttemptAt: time.Now().UTC(),
	}); err != nil {
		return "", apperrors.ErrInternalServer
	}

	if err := s.AuthRepo.DeleteOTP(ctx, oldOTP.ID.String()); err != nil {
		log.Printf("Failed to delete old OTP before resend: %v", err)
	}

	return s.generateAndSaveOTP(ctx, oldOTP.EntityID, models.Role(oldOTP.Role), models.Type(oldOTP.Type))
}

func (s *AuthService) ResendOTP(ctx context.Context, oldOtpID string) (string, error) {
	oldOTP, attempt, err := s.CheckResendEligibility(ctx, oldOtpID)
	if err != nil {
		return "", err
	}

	return s.PerformResend(ctx, oldOTP, attempt)
}

func (s *AuthService) UpdatePhoneAndResendOTP(ctx context.Context, oldOtpID string, newPhone string) (string, error) {
	oldOTP, attempt, err := s.CheckResendEligibility(ctx, oldOtpID)
	if err != nil {
		return "", err
	}

	var exists bool
	if oldOTP.Role == models.USER {
		exists, err = s.AuthRepo.CheckUserExists(ctx, newPhone)
	} else {
		exists, err = s.AuthRepo.CheckServiceProviderExists(ctx, newPhone)
	}

	if err != nil {
		return "", apperrors.ErrInternalServer
	}
	if exists {
		return "", apperrors.ErrPhoneExists
	}

	if oldOTP.Role == models.USER {
		err = s.AuthRepo.UpdateUserPhone(ctx, oldOTP.EntityID.String(), newPhone)
	} else {
		err = s.AuthRepo.UpdateServiceProviderPhone(ctx, oldOTP.EntityID.String(), newPhone)
	}

	if err != nil {
		return "", apperrors.ErrInternalServer
	}

	return s.PerformResend(ctx, oldOTP, attempt)
}

func (s *AuthService) OTPExpirationInfo(ctx context.Context, otpID string) (time.Time, string, error) {
	otp, err := s.AuthRepo.GetOTPInfo(ctx, otpID)
	if err != nil {
		return time.Time{}, "", apperrors.NewCustomError(400, "OTP session not found", "INVALID_SESSION")
	}

	var phone string
	if otp.Role == models.USER {
		p, err := s.AuthRepo.GetUserPhone(ctx, otp.EntityID.String())
		if err == nil {
			phone = p
		}
	} else if otp.Role == models.SERVICE_PROVIDER {
		p, err := s.AuthRepo.GetServiceProviderPhone(ctx, otp.EntityID.String())
		if err == nil {
			phone = p
		}
	}

	return otp.ExpiresAt, phone, nil
}

func (s *AuthService) ForgotPassword(ctx context.Context, phone string, role models.Role) (string, error) {
	var entityID uuid.UUID
	var err error

	if role == models.USER {
		entityID, err = s.AuthRepo.GetUserID(ctx, phone)
	} else if role == models.SERVICE_PROVIDER {
		entityID, err = s.AuthRepo.GetServiceProviderID(ctx, phone)
	} else {
		return "", apperrors.NewCustomError(400, "Invalid role", "INVALID_ROLE")
	}

	if err != nil {
		return "", apperrors.ErrUserNotFound
	}

	return s.generateAndSaveOTP(ctx, entityID, role, models.RESET_PASSWORD)
}

func (s *AuthService) VerifyPasswordResetOTP(ctx context.Context, otpID, code string) (string, error) {
	otp, err := s.AuthRepo.GetOTPInfo(ctx, otpID)
	if err != nil {
		return "", apperrors.NewCustomError(400, "Invalid or expired OTP session", "INVALID_SESSION")
	}

	if time.Now().UTC().After(otp.ExpiresAt) {
		return "", apperrors.NewCustomError(400, "OTP has expired", "OTP_EXPIRED")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(otp.OTPToken), []byte(code)); err != nil {
		return "", apperrors.ErrInvalidOTP
	}

	secretKey := s.getSecretKey()
	claims := models.ResetPasswordClaims{
		OtpID: otpID,
		Type:  "password_reset",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().UTC().Add(15 * time.Minute)),
			Issuer:    "fixora",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString(secretKey)
	if err != nil {
		return "", apperrors.ErrInternalServer
	}

	return signedToken, nil
}

func (s *AuthService) ResetPassword(ctx context.Context, resetToken, newPassword string) error {
	secretKey := s.getSecretKey()

	token, err := jwt.ParseWithClaims(resetToken, &models.ResetPasswordClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return secretKey, nil
	})

	if err != nil || !token.Valid {
		return apperrors.NewCustomError(401, "Invalid or expired reset token", "INVALID_TOKEN")
	}

	claims, ok := token.Claims.(*models.ResetPasswordClaims)
	if !ok || claims.Type != "password_reset" {
		return apperrors.NewCustomError(400, "Invalid token type", "INVALID_TOKEN")
	}

	otpID := claims.OtpID
	otp, err := s.AuthRepo.GetOTPInfo(ctx, otpID)
	if err != nil {
		return apperrors.NewCustomError(400, "Session not found or expired", "INVALID_SESSION")
	}

	newHash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return apperrors.ErrInternalServer
	}

	if otp.Role == models.USER {
		err = s.AuthRepo.UpdateUserPassword(ctx, otp.EntityID.String(), string(newHash))
	} else {
		err = s.AuthRepo.UpdateServiceProviderPassword(ctx, otp.EntityID.String(), string(newHash))
	}

	if err != nil {
		return apperrors.ErrInternalServer
	}

	if err := s.AuthRepo.DeleteOTP(ctx, otpID); err != nil {
		log.Printf("Failed to delete used OTP: %v", err)
	}

	if err := s.AuthRepo.UpdateOTPAttempt(ctx, &models.OTPAttempt{
		EntityID:      otp.EntityID,
		Count:         0,
		LastAttemptAt: time.Now().UTC(),
	}); err != nil {
		log.Printf("Failed to reset attempt count: %v", err)
	}

	return nil
}

func (s *AuthService) GetProfessions(ctx context.Context) ([]models.Profession, error) {
	return s.AuthRepo.GetAllProfessions(ctx)
}

func (s *AuthService) VerifyPhoneNumber(ctx context.Context, otpID, code string, role models.Role) error {
	otp, err := s.AuthRepo.GetOTPInfo(ctx, otpID)
	if err != nil {
		return apperrors.NewCustomError(400, "Invalid or expired OTP session", "INVALID_SESSION")
	}

	if otp.Role != role {
		return apperrors.ErrUnauthorized
	}

	if time.Now().UTC().After(otp.ExpiresAt) {
		return apperrors.NewCustomError(400, "OTP has expired", "OTP_EXPIRED")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(otp.OTPToken), []byte(code)); err != nil {
		return apperrors.ErrInvalidOTP
	}

	if role == models.USER {
		err = s.AuthRepo.UpdateUserVerification(ctx, otp.EntityID)
	} else {
		err = s.AuthRepo.UpdateServiceProviderVerification(ctx, otp.EntityID)
	}
	if err != nil {
		return apperrors.ErrInternalServer
	}

	if err := s.AuthRepo.DeleteOTP(ctx, otpID); err != nil {
		log.Printf("Failed to delete used OTP: %v", err)
	}

	if err := s.AuthRepo.UpdateOTPAttempt(ctx, &models.OTPAttempt{
		EntityID:      otp.EntityID,
		Count:         0,
		LastAttemptAt: time.Now().UTC(),
	}); err != nil {
		log.Printf("Failed to reset attempt count: %v", err)
	}

	return nil
}

func (s *AuthService) generateAndSaveOTP(ctx context.Context, entityID uuid.UUID, role models.Role, otpType models.Type) (string, error) {
	otpID, err := uuid.NewV7()
	if err != nil {
		return "", apperrors.ErrInternalServer
	}

	rawCode := s.generateOTP(4)
	hashCode, err := bcrypt.GenerateFromPassword([]byte(rawCode), bcrypt.DefaultCost)
	if err != nil {
		return "", apperrors.ErrInternalServer
	}

	otp := &models.OTP{
		ID:        otpID,
		EntityID:  entityID,
		Role:      role,
		Type:      otpType,
		OTPToken:  string(hashCode),
		ExpiresAt: time.Now().UTC().Add(3 * time.Minute),
	}

	if err := s.AuthRepo.InsertOTPInfo(ctx, otp); err != nil {
		return "", apperrors.ErrInternalServer
	}

	fmt.Printf(">>> [DEBUG SMS] Raw Code: %s (Save as Hash) for Entity: %s\n", rawCode, entityID)

	return otpID.String(), nil
}

func (s *AuthService) generateAndSaveTokens(ctx context.Context, role models.Role, userID string) (string, string, error) {
	secretKey := s.getSecretKey()

	accessToken, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, models.AppClaims{
		Role:   role,
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().UTC().Add(15 * time.Minute)),
			Issuer:    "fixora",
		},
	}).SignedString(secretKey)

	refreshToken, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().UTC().Add(15 * 24 * time.Hour).Unix(),
	}).SignedString(secretKey)

	err := s.AuthRepo.SaveRefreshToken(ctx, userID, refreshToken, time.Now().UTC().Add(15*24*time.Hour))
	return accessToken, refreshToken, err
}

func (s *AuthService) generateOTP(n int) string {
	const digits = "0123456789"
	b := make([]byte, n)
	_, err := io.ReadAtLeast(rand.Reader, b, n)
	if err != nil {
		log.Printf("Failed to generate random OTP: %v", err)
	}
	for i := range b {
		b[i] = digits[int(b[i])%len(digits)]
	}
	return string(b)
}

func (s *AuthService) getSecretKey() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		panic("FATAL: JWT_SECRET environment variable is not set")
	}
	return []byte(secret)
}
