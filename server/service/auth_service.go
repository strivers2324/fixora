package service

import (
	"errors"
	"fixora-server/models"
	"fixora-server/repository"
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
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

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user := models.UserRegisterRequest{
		Phone:     req.Phone,
		Password:  string(hash),
		FullName:  req.FullName,
		District:  req.District,
		Area:      req.Area,
		SubArea:   req.SubArea,
		CreatedAt: req.CreatedAt,
	}

	return s.AuthRepo.CreateUser(user)
}

func (s *AuthService) RegisterServiceProvider(req models.ServiceProviderRegisterRequest) error {

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	serviceprovider := models.ServiceProviderRegisterRequest{
		Phone:       req.Phone,
		Profession:  req.Profession,
		Password:    string(hash),
		FullName:    req.FullName,
		District:    req.District,
		Area:        req.Area,
		SubArea:     req.SubArea,
		NidNumber:   req.NidNumber,
		NidFrontUrl: req.NidFrontUrl,
		NidBackUrl:  req.NidBackUrl,
		CreatedAt:   req.CreatedAt,
	}

	return s.AuthRepo.CreateServiceProvider(serviceprovider)
}

func (s *AuthService) CheckUserPhone(phone string) (bool, error) {
	return s.AuthRepo.CheckUserExists(phone)
}

func (s *AuthService) CheckServiceProviderPhone(phone string) (bool, error) {
	return s.AuthRepo.CheckServiceProviderExists(phone)
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

func (s *AuthService) GenerateTokenPair(phone, role string) (string, string, error) {
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

	phone, role, err := s.AuthRepo.CheckRefreshToken(oldRefreshToken)
	if err != nil {
		return "", err
	}
	//new access token
	secretKey := s.getSecretKey()
	accessClaims := models.AppClaims{
		Phone: phone,
		Role:  role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
			Issuer:    "fixora",
		},
	}
	accessToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims).SignedString(secretKey)

	return accessToken, err
}
