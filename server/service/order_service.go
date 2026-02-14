package service

import (
	"context"
	"database/sql"
	"fixora-server/models"
	"fixora-server/pkg/apperrors"
	"fixora-server/repository"

	"github.com/google/uuid"
)

type OrderService struct {
	OrderRepo *repository.OrderRepository
}

func NewOrderService(orderRepo *repository.OrderRepository) *OrderService {
	return &OrderService{OrderRepo: orderRepo}
}

func (s *OrderService) UpdateUserProfile(ctx context.Context, req models.UserProfileDataRequest) (*models.UserProfileData, error) {
	userID, err := s.GetUserID(ctx, req.Phone)
	if err != nil {
		return nil, err
	}

	updatedProfile, err := s.OrderRepo.UpdateUserProfile(ctx, userID, req)
	if err != nil {
		return nil, apperrors.ErrInternalServer
	}

	return updatedProfile, nil
}

func (s *OrderService) GetUserProfileData(ctx context.Context, phone string) (*models.UserProfileData, error) {
	userID, err := s.GetUserID(ctx, phone)
	if err != nil {
		return nil, err
	}

	profiledata, err := s.OrderRepo.GetUserProfileData(ctx, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, apperrors.NewCustomError(404, "User profile not found", "PROFILE_NOT_FOUND")
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

func (s *OrderService) UpdateServiceProviderProfile(ctx context.Context, req models.ServiceProviderProfileDataRequest) (*models.ServiceProviderProfileData, error) {
	providerID, err := s.GetServiceProviderID(ctx, req.Phone)
	if err != nil {
		return nil, err
	}

	updatedProfile, err := s.OrderRepo.UpdateServiceProviderProfile(ctx, providerID, req)
	if err != nil {
		return nil, apperrors.ErrInternalServer
	}

	return updatedProfile, nil
}

func (s *OrderService) GetServiceProviderProfileData(ctx context.Context, phone string) (*models.ServiceProviderProfileData, error) {
	providerID, err := s.GetServiceProviderID(ctx, phone)
	if err != nil {
		return nil, err
	}

	profiledata, err := s.OrderRepo.GetServiceProviderProfileData(ctx, providerID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, apperrors.NewCustomError(404, "Service Provider profile not found", "PROFILE_NOT_FOUND")
		}
		return nil, apperrors.ErrInternalServer
	}

	return profiledata, nil
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
