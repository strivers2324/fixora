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
	hash, err := bcrypt.GenerateFromPassword([]byte(req.PasswordHash), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user := models.UserRegisterRequest{
		Phone:        req.Phone,
		PasswordHash: string(hash),
		FullName:     req.FullName,
		District:     req.District,
		Area:         req.Area,
		SubArea:      req.SubArea,
		CreatedAt:    req.CreatedAt,
	}

	return s.AuthRepo.CreateUser(user)
}

func (s *AuthService) RegisterServiceProvider(req models.ServiceProviderRegisterRequest) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(req.PasswordHash), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	serviceprovider := models.ServiceProviderRegisterRequest{
		Phone:        req.Phone,
		Profession:   req.Profession,
		PasswordHash: string(hash),
		FullName:     req.FullName,
		District:     req.District,
		Area:         req.Area,
		SubArea:      req.SubArea,
		NidNumber:    req.NidNumber,
		NidFrontUrl:  req.NidFrontUrl,
		NidBackUrl:   req.NidBackUrl,
		CreatedAt:    req.CreatedAt,
	}

	return s.AuthRepo.CreateServiceProvider(serviceprovider)
}
