package admin_service

import (
	"context"
	"database/sql"
	"log"
	"time"

	"fixora-server/models"
	"fixora-server/pkg/apperrors"
	"fixora-server/pkg/utils"
	"fixora-server/repository/admin_repository"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AdminAuthService struct {
	AdminRepo *admin_repository.AdminAuthRepository
}

func NewAdminAuthService(adminRepo *admin_repository.AdminAuthRepository) *AdminAuthService {
	return &AdminAuthService{
		AdminRepo: adminRepo,
	}
}

func (s *AdminAuthService) AdminLogin(ctx context.Context, req models.AdminLoginRequest) (string, string, error) {
	data, err := s.AdminRepo.GetAdminLoginData(ctx, req.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", "", apperrors.ErrInvalidCredentials
		}
		return "", "", apperrors.ErrInternalServer
	}

	if err := bcrypt.CompareHashAndPassword([]byte(data.PasswordHash), []byte(req.Password)); err != nil {
		return "", "", apperrors.ErrInvalidCredentials
	}

	accessToken, refreshToken, err := s.generateAndSaveAdminTokens(ctx, "admin", data.AdminID)
	if err != nil {
		return "", "", apperrors.ErrInternalServer
	}

	return accessToken, refreshToken, nil
}

func (s *AdminAuthService) generateAndSaveAdminTokens(ctx context.Context, role string, adminID uuid.UUID) (string, string, error) {
	secretKey := utils.GetSecretKey()

	accessToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, models.AdminClaims{
		Role:    role,
		AdminID: adminID.String(),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().UTC().Add(15 * time.Minute)),
			Issuer:    "fixora",
		},
	}).SignedString(secretKey)
	if err != nil {
		return "", "", apperrors.ErrInternalServer
	}

	refreshToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"admin_id": adminID.String(),
		"role":     role,
		"exp":      time.Now().UTC().Add(15 * 24 * time.Hour).Unix(),
	}).SignedString(secretKey)
	if err != nil {
		return "", "", apperrors.ErrInternalServer
	}

	err = s.AdminRepo.SaveRefreshToken(ctx, adminID, refreshToken, time.Now().UTC().Add(15*24*time.Hour))
	if err != nil {
		return "", "", apperrors.ErrInternalServer
	}

	return accessToken, refreshToken, nil
}

func (s *AdminAuthService) RefreshToken(ctx context.Context, oldRefreshToken string) (string, error) {
	adminID, expiresAt, err := s.AdminRepo.FindRefreshToken(ctx, oldRefreshToken)
	if err != nil {
		return "", apperrors.ErrInvalidToken
	}

	if time.Now().UTC().After(expiresAt) {
		if err := s.AdminRepo.DeleteRefreshToken(ctx, oldRefreshToken); err != nil {
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

	var adminRole string
	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		adminRole = claims["role"].(string)
	} else {
		return "", apperrors.ErrInternalServer
	}

	secretKey := utils.GetSecretKey()
	accessToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, models.AdminClaims{
		Role:    adminRole,
		AdminID: adminID.String(),
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

func (s *AdminAuthService) Logout(ctx context.Context, token string) error {
	return s.AdminRepo.DeleteRefreshToken(ctx, token)
}
