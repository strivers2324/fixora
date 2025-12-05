package service

import (
	"errors"
	"fixora-server/models"
	"fixora-server/repository"
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	AuthRepo *repository.AuthRepository
}

func NewAuthService(authRepo *repository.AuthRepository) *AuthService {
	return &AuthService{
		AuthRepo: authRepo,
	}
}

func (s *AuthService) RegisterUser(req models.UserRegisterRequest) error {

	exists, err := s.AuthRepo.CheckUserExists(req.Phone)
	if err != nil {
		return errors.New("database error, checking user")
	}
	if exists {
		return errors.New("user already exists")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return errors.New("could not hash password")
	}

	newUserID := uuid.New().String()

	user := models.UserRegisterRequest{
		User_ID:  newUserID,
		Phone:    req.Phone,
		Password: string(hash),
	}

	if err := s.AuthRepo.CreateUser(user); err != nil {
		return errors.New("failed to create user")
	}

	return nil
}

func (s *AuthService) VerifyUserPhone(phone string) error {
	return s.AuthRepo.VerifyUserPhone(phone)
}

func (s *AuthService) RegisterServiceProvider(req models.ServiceProviderRegisterRequest) error {

	exists, err := s.AuthRepo.CheckServiceProviderExists(req.Phone)
	if err != nil {
		return errors.New("database error")
	}
	if exists {
		return errors.New("provider phone already exists")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	newUserID := uuid.New().String()

	serviceprovider := models.ServiceProviderRegisterRequest{
		User_ID:    newUserID,
		Phone:      req.Phone,
		Profession: req.Profession,
		Password:   string(hash),
	}

	return s.AuthRepo.CreateServiceProvider(serviceprovider)
}

func (s *AuthService) VerifyServiceProvider(phone string) error {
	return s.AuthRepo.VerifyServiceProviderPhone(phone)
}

func (s *AuthService) getSecretKey() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return []byte("default-secret-key")
	}
	return []byte(secret)
}

func (s *AuthService) Login(req models.LoginRequest) (string, string, error) {

	storedHash, err := s.AuthRepo.GetloginCredentials(req.Phone, req.Role)
	if err != nil {
		return "", "", errors.New("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(req.Password)); err != nil {
		return "", "", errors.New("invalid credentials")
	}

	accessToken, refreshToken, err := s.GenerateTokenPair(req.Phone, req.Role)
	if err != nil {
		return "", "", err
	}

	if err := s.AuthRepo.StoreRefreshToken(req.Phone, req.Role, refreshToken); err != nil {
		fmt.Println("DEBUG: Token Store DB Error:", err)
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

func (s *AuthService) Logout(token string) error {
	return s.AuthRepo.DeleteRefreshToken(token)
}

func (s *AuthService) GenerateTokenPair(phone string, role models.Role) (string, string, error) {
	secretKey := s.getSecretKey()

	// Access Token
	accessToken, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, models.AppClaims{
		Phone:            phone,
		Role:             role,
		RegisteredClaims: jwt.RegisteredClaims{ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute))},
	}).SignedString(secretKey)

	// Refresh Token
	refreshToken, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"phone": phone,
		"role":  role,
		"exp":   time.Now().Add(15 * 24 * time.Hour).Unix(),
	}).SignedString(secretKey)

	return accessToken, refreshToken, nil
}

func (s *AuthService) RefreshToken(oldRefreshToken string) (string, error) {

	phone, roleStr, err := s.AuthRepo.CheckRefreshToken(oldRefreshToken)
	if err != nil {
		return "", err
	}
	//new access token
	secretKey := s.getSecretKey()
	accessClaims := models.AppClaims{
		Phone: phone,
		Role:  models.Role(roleStr),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
			Issuer:    "fixora",
		},
	}
	accessToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims).SignedString(secretKey)

	return accessToken, err
}
