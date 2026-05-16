package service

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"fixora-server/models"
	"fixora-server/pkg/apperrors"
	"fixora-server/pkg/utils"
	"fixora-server/repository"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	AuthRepo       *repository.AuthRepository
	OTPService     *OTPService
	AccountService *AccountService
}

func NewAuthService(authRepo *repository.AuthRepository, otpservice *OTPService, accountservice *AccountService) *AuthService {
	return &AuthService{
		AuthRepo:       authRepo,
		OTPService:     otpservice,
		AccountService: accountservice,
	}
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

	if err := s.AuthRepo.CreateUser(ctx, userID, req.Phone, string(hash)); err != nil {
		return "", apperrors.ErrInternalServer
	}

	return s.OTPService.GenerateAndSaveOTP(ctx, userID, models.USER, models.REGISTER)
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

	if err := s.AuthRepo.CreateServiceProvider(ctx, providerID, req.Phone, req.ProfessionID, string(hash)); err != nil {
		return "", apperrors.ErrInternalServer
	}

	return s.OTPService.GenerateAndSaveOTP(ctx, providerID, models.SERVICE_PROVIDER, models.REGISTER)
}

func (s *AuthService) VerifyUserPhone(ctx context.Context, otpID, code string) error {
	return s.VerifyPhoneNumber(ctx, otpID, code, models.USER)
}

func (s *AuthService) VerifyServiceProviderPhone(ctx context.Context, otpID, code string) error {
	return s.VerifyPhoneNumber(ctx, otpID, code, models.SERVICE_PROVIDER)
}

func (s *AuthService) VerifyPhoneNumber(ctx context.Context, otpID, code string, role models.Role) error {
	otp, err := s.OTPService.GetOTPInfo(ctx, otpID)
	if err != nil {
		return err
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

	if err := s.OTPService.DeleteOTP(ctx, otpID); err != nil {
		return err
	}

	if err := s.OTPService.UpdateOTPAttempt(ctx, &models.OTPAttempt{
		EntityID:      otp.EntityID,
		Count:         0,
		LastAttemptAt: time.Now().UTC(),
	}); err != nil {
		return err
	}

	return nil
}

func (s *AuthService) Login(ctx context.Context, req models.LoginRequest) (string, string, string, bool, string, string, error) {
	var savedHash string
	var isVerified bool
	var profession string
	var userID uuid.UUID

	if req.Role == models.USER {
		data, err := s.AuthRepo.GetUserLoginData(ctx, req.Phone)
		if err != nil {
			if err == sql.ErrNoRows {
				return "", "", "", false, "", "", apperrors.ErrInvalidCredentials
			}
			return "", "", "", false, "", "", apperrors.ErrInternalServer
		}
		userID = data.UserID
		savedHash = data.PasswordHash
		isVerified = data.IsPhoneVerified
		profession = ""
	} else if req.Role == models.SERVICE_PROVIDER {
		data, err := s.AuthRepo.GetServiceProviderLoginData(ctx, req.Phone)
		if err != nil {
			if err == sql.ErrNoRows {
				return "", "", "", false, "", "", apperrors.ErrInvalidCredentials
			}
			return "", "", "", false, "", "", apperrors.ErrInternalServer
		}
		userID = data.ProviderID
		savedHash = data.PasswordHash
		isVerified = data.IsPhoneVerified
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
		if fetchedOtpID, err := s.OTPService.GetOTPID(ctx, userID); err == nil {
			otpID = fetchedOtpID.String()
		}
	}

	return accessToken, refreshToken, req.Phone, isVerified, otpID, profession, nil
}

func (s *AuthService) GetSessionData(ctx context.Context, userID uuid.UUID, role string) (*models.SessionResponse, error) {
	var data *models.SessionResponse
	var err error

	if models.Role(role) == models.USER {
		data, err = s.AuthRepo.GetUserSessionData(ctx, userID)
	} else if models.Role(role) == models.SERVICE_PROVIDER {
		data, err = s.AuthRepo.GetServiceProviderSessionData(ctx, userID)
	} else {
		return nil, apperrors.NewCustomError(400, "Invalid role specified", "INVALID_ROLE")
	}

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, apperrors.ErrUserNotFound
		}
		return nil, apperrors.ErrInternalServer
	}

	if !data.IsPhoneVerified {
		otpID, otpErr := s.OTPService.GetOTPID(ctx, userID)

		if otpErr == nil && otpID != uuid.Nil {
			data.OtpID = otpID.String()
		}
	}

	return data, nil
}

func (s *AuthService) RefreshToken(ctx context.Context, oldRefreshToken string) (string, error) {
	userID, expiresAt, err := s.AuthRepo.FindRefreshToken(ctx, oldRefreshToken)
	if err != nil {
		return "", apperrors.ErrInvalidToken
	}

	if time.Now().UTC().After(expiresAt) {
		if err := s.AuthRepo.DeleteRefreshToken(ctx, oldRefreshToken); err != nil {
			log.Printf("Failed to delete expired refresh token: %v", err)
		}
		return "", apperrors.ErrTokenExpired
	}

	token, err := jwt.Parse(oldRefreshToken, func(token *jwt.Token) (interface{}, error) {
		return utils.GetSecretKey(), nil
	})

	if err != nil || !token.Valid {
		return "", apperrors.ErrInvalidToken
	}

	var userRole string
	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		userRole = claims["role"].(string)
	} else {
		return "", apperrors.ErrInternalServer
	}

	secretKey := utils.GetSecretKey()
	accessToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, models.AppClaims{
		Role:   models.Role(userRole),
		UserID: userID.String(),
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

func (s *AuthService) UpdatePhoneAndResendOTP(ctx context.Context, oldOtpID string, newPhone string) (string, error) {
	oldOTP, err := s.OTPService.GetOTPInfo(ctx, oldOtpID)
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
		err = s.AccountService.UpdateUserPhone(ctx, oldOTP.EntityID, newPhone)
	} else {
		err = s.AccountService.UpdateServiceProviderPhone(ctx, oldOTP.EntityID, newPhone)
	}

	if err != nil {
		return "", err
	}

	if err := s.OTPService.DeleteOTP(ctx, oldOTP.ID.String()); err != nil {
		return "", err
	}

	return s.OTPService.GenerateAndSaveOTP(ctx, oldOTP.EntityID, models.Role(oldOTP.Role), models.Type(oldOTP.Type))
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

	return s.OTPService.GenerateAndSaveOTP(ctx, entityID, role, models.RESET_PASSWORD)
}

func (s *AuthService) VerifyPasswordResetOTP(ctx context.Context, otpID, code string) (string, error) {
	otp, err := s.OTPService.GetOTPInfo(ctx, otpID)
	if err != nil {
		return "", err
	}

	if time.Now().UTC().After(otp.ExpiresAt) {
		return "", apperrors.NewCustomError(400, "OTP has expired", "OTP_EXPIRED")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(otp.OTPToken), []byte(code)); err != nil {
		return "", apperrors.ErrInvalidOTP
	}

	secretKey := utils.GetSecretKey()
	claims := models.ResetPasswordClaims{
		OtpID: otpID,
		Type:  models.RESET_PASSWORD,
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
	secretKey := utils.GetSecretKey()

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
	if !ok || claims.Type != models.RESET_PASSWORD {
		return apperrors.NewCustomError(400, "Invalid token type", "INVALID_TOKEN")
	}

	otpID := claims.OtpID

	otp, err := s.OTPService.GetOTPInfo(ctx, otpID)
	if err != nil {
		return err
	}

	newHash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return apperrors.ErrInternalServer
	}

	if otp.Role == models.USER {
		err = s.AccountService.UpdateUserPassword(ctx, otp.EntityID, string(newHash))
	} else {
		err = s.AccountService.UpdateServiceProviderPassword(ctx, otp.EntityID, string(newHash))
	}

	if err != nil {
		return err
	}

	if err := s.OTPService.DeleteOTP(ctx, otpID); err != nil {
		return err
	}

	if err := s.OTPService.UpdateOTPAttempt(ctx, &models.OTPAttempt{
		EntityID:      otp.EntityID,
		Count:         0,
		LastAttemptAt: time.Now().UTC(),
	}); err != nil {
		return err
	}

	return nil
}

func (s *AuthService) GetProfessions(ctx context.Context) ([]models.Profession, error) {
	return s.AuthRepo.GetAllProfessions(ctx)
}

func (s *AuthService) generateAndSaveTokens(ctx context.Context, role models.Role, userID uuid.UUID) (string, string, error) {
	secretKey := utils.GetSecretKey()

	accessToken, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, models.AppClaims{
		Role:   role,
		UserID: userID.String(),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().UTC().Add(15 * time.Minute)),
			Issuer:    "fixora",
		},
	}).SignedString(secretKey)

	refreshToken, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID.String(),
		"role":    string(role),
		"exp":     time.Now().UTC().Add(15 * 24 * time.Hour).Unix(),
	}).SignedString(secretKey)

	err := s.AuthRepo.SaveRefreshToken(ctx, userID, refreshToken, time.Now().UTC().Add(15*24*time.Hour))
	return accessToken, refreshToken, err
}

func (s *AuthService) CheckUserExists(ctx context.Context, phone string) (bool, error) {
	return s.AuthRepo.CheckUserExists(ctx, phone)
}

func (s *AuthService) CheckServiceProviderExists(ctx context.Context, phone string) (bool, error) {
	return s.AuthRepo.CheckServiceProviderExists(ctx, phone)
}
