package service

import (
	"context"
	"database/sql"
	"errors"
	"fixora-server/models"
	"fixora-server/repository"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrUserAlreadyExists  = errors.New("user already exists")
	ErrInvalidCredentials = errors.New("invalid phone or password")
	ErrNotVerified        = errors.New("account not verified")
	ErrTokenExpired       = errors.New("refresh token expired")
	ErrInvalidToken       = errors.New("invalid token")
)

type AuthService struct {
	AuthRepo *repository.AuthRepository
}

func NewAuthService(authRepo *repository.AuthRepository) *AuthService {
	return &AuthService{AuthRepo: authRepo}
}

// User Logic

func (s *AuthService) RegisterUser(ctx context.Context, req models.UserRegisterRequest) error {
	_, err := s.AuthRepo.FindUserByPhone(ctx, req.Phone)
	if err == nil {
		return ErrUserAlreadyExists
	}
	if err != sql.ErrNoRows {
		return err
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	userID, err := uuid.NewV7()
	if err != nil {
		return err
	}

	return s.AuthRepo.CreateUser(ctx, userID.String(), req.Phone, string(hash))
}

func (s *AuthService) VerifyUserPhone(ctx context.Context, phone string) (string, string, error) {
	creds, err := s.AuthRepo.FindUserByPhone(ctx, phone)
	if err != nil {
		return "", "", errors.New("user not found")
	}

	if err := s.AuthRepo.UpdateUserVerification(ctx, phone); err != nil {
		return "", "", err
	}

	return s.generateAndSaveTokens(ctx, models.USER, creds.UserID)
}

// Service Provider Logic

func (s *AuthService) RegisterServiceProvider(ctx context.Context, req models.ServiceProviderRegisterRequest) error {
	_, err := s.AuthRepo.FindServiceProviderByPhone(ctx, req.Phone)
	if err == nil {
		return ErrUserAlreadyExists
	}
	if err != sql.ErrNoRows {
		return err
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	userID, err := uuid.NewV7()
	if err != nil {
		return err
	}

	return s.AuthRepo.CreateServiceProvider(ctx, userID.String(), req.Phone, req.Profession, string(hash))
}

func (s *AuthService) VerifyServiceProviderPhone(ctx context.Context, phone string) (string, string, error) {
	creds, err := s.AuthRepo.FindServiceProviderByPhone(ctx, phone)
	if err != nil {
		return "", "", errors.New("provider not found")
	}

	if err := s.AuthRepo.UpdateServiceProviderVerification(ctx, phone); err != nil {
		return "", "", err
	}

	return s.generateAndSaveTokens(ctx, models.SERVICE_PROVIDER, creds.UserID)
}

// Login logic

func (s *AuthService) Login(ctx context.Context, req models.LoginRequest) (string, string, error) {
	var creds *models.LoginCredentials
	var err error

	if req.Role == models.USER {
		creds, err = s.AuthRepo.FindUserByPhone(ctx, req.Phone)
	} else if req.Role == models.SERVICE_PROVIDER {
		creds, err = s.AuthRepo.FindServiceProviderByPhone(ctx, req.Phone)
	} else {
		return "", "", errors.New("invalid role")
	}

	if err != nil {
		if err == sql.ErrNoRows {
			return "", "", ErrInvalidCredentials
		}
		return "", "", err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(creds.PasswordHash), []byte(req.Password)); err != nil {
		return "", "", ErrInvalidCredentials
	}

	if !creds.IsPhoneVerified {
		return "", "", ErrNotVerified
	}

	return s.generateAndSaveTokens(ctx, req.Role, creds.UserID)
}

// Token Logic

func (s *AuthService) RefreshToken(ctx context.Context, oldRefreshToken string) (string, error) {
	userID, roleStr, expiresAt, err := s.AuthRepo.FindRefreshToken(ctx, oldRefreshToken)
	if err != nil {
		return "", ErrInvalidToken
	}

	if time.Now().After(expiresAt) {
		_ = s.AuthRepo.DeleteRefreshToken(ctx, oldRefreshToken)
		return "", ErrTokenExpired
	}

	secretKey := s.getSecretKey()
	accessToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, models.AppClaims{
		Role:   models.Role(roleStr),
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
			Issuer:    "fixora",
		},
	}).SignedString(secretKey)

	return accessToken, err
}

// Logout Logic

func (s *AuthService) Logout(ctx context.Context, token string) error {
	return s.AuthRepo.DeleteRefreshToken(ctx, token)
}

func (s *AuthService) generateAndSaveTokens(ctx context.Context, role models.Role, userID string) (string, string, error) {
	secretKey := s.getSecretKey()

	accessToken, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, models.AppClaims{
		Role:   role,
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
			Issuer:    "fixora",
		},
	}).SignedString(secretKey)

	refreshToken, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(15 * 24 * time.Hour).Unix(),
	}).SignedString(secretKey)

	err := s.AuthRepo.SaveRefreshToken(ctx, userID, refreshToken, time.Now().Add(15*24*time.Hour))
	return accessToken, refreshToken, err
}

func (s *AuthService) getSecretKey() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return []byte("default-secret-key")
	}
	return []byte(secret)
}
