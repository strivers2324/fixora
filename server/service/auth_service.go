package service

import (
	"fixora-server/models"
	"fixora-server/repository"

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

	sp := models.User{
		Phone:        req.Phone,
		PasswordHash: string(hash),
		FullName:     req.FullName,
		District:     req.District,
		Area:         req.Area,
		SubArea:      req.SubArea,
	}

	return s.AuthRepo.CreateUser(sp)
}
