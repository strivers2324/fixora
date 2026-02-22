package service

import (
	"context"
	"database/sql"
	"errors"
	"fixora-server/models"
	"fixora-server/pkg/apperrors"
	"fixora-server/repository"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type OrderService struct {
	OrderRepo *repository.OrderRepository
}

func NewOrderService(orderRepo *repository.OrderRepository) *OrderService {
	return &OrderService{OrderRepo: orderRepo}
}

func (s *OrderService) UpdateUserProfile(ctx context.Context, userID uuid.UUID, req models.UserProfileDataRequest) (*models.UserProfileData, error) {
	updatedProfile, err := s.OrderRepo.UpdateUserProfile(ctx, userID, req)
	if err != nil {
		return nil, apperrors.ErrInternalServer
	}

	return updatedProfile, nil
}

func (s *OrderService) GetUserProfileData(ctx context.Context, userID uuid.UUID) (*models.UserProfileData, error) {
	profiledata, err := s.OrderRepo.GetUserProfileData(ctx, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, apperrors.NewCustomError(404, "User profile not found", "PROFILE_NOT_FOUND")
		}
		return nil, apperrors.ErrInternalServer
	}

	return profiledata, nil
}

func (s *OrderService) UpdateServiceProviderProfile(ctx context.Context, providerID uuid.UUID, req models.ServiceProviderProfileDataRequest) (*models.ServiceProviderProfileData, error) {
	updatedProfile, err := s.OrderRepo.UpdateServiceProviderProfile(ctx, providerID, req)
	if err != nil {
		return nil, apperrors.ErrInternalServer
	}

	return updatedProfile, nil
}

func (s *OrderService) GetServiceProviderProfileData(ctx context.Context, providerID uuid.UUID) (*models.ServiceProviderProfileData, error) {
	profiledata, err := s.OrderRepo.GetServiceProviderProfileData(ctx, providerID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, apperrors.NewCustomError(404, "Service Provider profile not found", "PROFILE_NOT_FOUND")
		}
		return nil, apperrors.ErrInternalServer
	}

	return profiledata, nil
}

func (s *OrderService) GetUserID(ctx context.Context, phone string) (uuid.UUID, error) {
	userID, err := s.OrderRepo.GetUserID(ctx, phone)
	if err != nil {
		if err == sql.ErrNoRows {
			return uuid.Nil, apperrors.ErrUserNotFound
		}
		return uuid.Nil, apperrors.ErrInternalServer
	}
	return userID, nil
}

func (s *OrderService) GetServiceProviderID(ctx context.Context, phone string) (uuid.UUID, error) {
	providerID, err := s.OrderRepo.GetServiceProviderID(ctx, phone)
	if err != nil {
		if err == sql.ErrNoRows {
			return uuid.Nil, apperrors.ErrUserNotFound
		}
		return uuid.Nil, apperrors.ErrInternalServer
	}
	return providerID, nil
}

func (s *OrderService) ChangePassword(ctx context.Context, entityID uuid.UUID, role models.Role, req models.ChangePasswordRequest) error {
	var currentHash string
	var err error

	if role == models.USER {
		currentHash, err = s.OrderRepo.GetUserPassword(ctx, entityID)
	} else if role == models.SERVICE_PROVIDER {
		currentHash, err = s.OrderRepo.GetServiceProviderPassword(ctx, entityID)
	} else {
		return apperrors.NewCustomError(403, "Invalid user role", "FORBIDDEN")
	}

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return apperrors.ErrUserNotFound
		}
		return apperrors.ErrInternalServer
	}

	if err := bcrypt.CompareHashAndPassword([]byte(currentHash), []byte(req.OldPassword)); err != nil {
		return apperrors.ErrInvalidOldPassword
	}

	newHashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return apperrors.ErrInternalServer
	}

	if role == models.USER {
		return s.OrderRepo.UpdateUserPassword(ctx, entityID, string(newHashedPassword))
	} else {
		return s.OrderRepo.UpdateServiceProviderPassword(ctx, entityID, string(newHashedPassword))
	}
}

func (s *OrderService) SubmitNIDDetails(ctx context.Context, providerID uuid.UUID, req models.NIDSubmitRequest) error {
	existingData, err := s.OrderRepo.GetNIDStatus(ctx, providerID)
	if err != nil {
		return apperrors.ErrInternalServer
	}

	if existingData != nil && existingData.Status == models.ACCEPTED {
		return apperrors.NewCustomError(400, "Your NID is already accepted. Cannot resubmit.", "BAD_REQUEST")
	}

	err = s.OrderRepo.SaveNIDData(ctx, providerID, req)
	if err != nil {
		return apperrors.ErrInternalServer
	}

	return nil
}

func (s *OrderService) GetNIDStatus(ctx context.Context, providerID uuid.UUID) (*models.NIDStatusResponse, error) {
	statusResponse, err := s.OrderRepo.GetNIDStatus(ctx, providerID)
	if err != nil {
		return nil, apperrors.ErrInternalServer
	}

	if statusResponse == nil {
		return nil, apperrors.NewCustomError(404, "NID data not found", "NOT_FOUND")
	}

	return statusResponse, nil
}
