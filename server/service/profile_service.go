package service

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"strings"

	"fixora-server/database/supabase"
	"fixora-server/models"
	"fixora-server/pkg/apperrors"
	"fixora-server/pkg/utils"
	"fixora-server/repository"

	"github.com/google/uuid"
)

type ProfileService struct {
	ProfileRepo *repository.ProfileRepository
}

func NewProfileService(profileRepo *repository.ProfileRepository) *ProfileService {
	return &ProfileService{ProfileRepo: profileRepo}
}

func (s *ProfileService) UpdateUserProfile(ctx context.Context, userID uuid.UUID, req models.UserProfileDataRequest) (*models.UserProfileData, error) {
	var profilePicURL string
	var err error

	if req.ProfilePicture != nil {
		ext := utils.GetFileExtension(req.ProfilePicture.Filename)

		randomImageID, err := uuid.NewV7()
		if err != nil {
			return nil, apperrors.ErrInternalServer
		}
		filePath := fmt.Sprintf("users/%s%s", randomImageID.String(), ext)

		profilePicURL, err = supabase.UploadToSupabase(req.ProfilePicture, "profile_pictures", filePath)
		if err != nil {
			log.Printf("Profile-Picture Upload Failed: %v", err)

			errorMessage := err.Error()
			if strings.Contains(errorMessage, "413") || strings.Contains(errorMessage, "size") || strings.Contains(errorMessage, "too large") {
				return nil, apperrors.ErrFileTooLarge
			}

			return nil, apperrors.ErrUploadFailed
		}
	}

	updatedProfile, err := s.ProfileRepo.UpdateUserProfile(ctx, userID, req, profilePicURL)
	if err != nil {
		return nil, apperrors.ErrInternalServer
	}

	return updatedProfile, nil
}

func (s *ProfileService) GetUserProfileData(ctx context.Context, userID uuid.UUID) (*models.UserProfileData, error) {
	profiledata, err := s.ProfileRepo.GetUserProfileData(ctx, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, apperrors.NewCustomError(404, "User profile not found", "PROFILE_NOT_FOUND")
		}
		return nil, apperrors.ErrInternalServer
	}

	return profiledata, nil
}

func (s *ProfileService) UpdateServiceProviderProfile(ctx context.Context, providerID uuid.UUID, req models.ServiceProviderProfileDataRequest) (*models.ServiceProviderProfileData, error) {
	var profilePicURL string
	var err error

	if req.ProfilePicture != nil {
		ext := utils.GetFileExtension(req.ProfilePicture.Filename)

		randomImageID, err := uuid.NewV7()
		if err != nil {
			return nil, apperrors.ErrInternalServer
		}

		filePath := fmt.Sprintf("providers/%s%s", randomImageID.String(), ext)

		profilePicURL, err = supabase.UploadToSupabase(req.ProfilePicture, "profile_pictures", filePath)
		if err != nil {
			log.Printf("Profile-Picture Upload Failed: %v", err)

			errorMessage := err.Error()
			if strings.Contains(errorMessage, "413") || strings.Contains(errorMessage, "size") || strings.Contains(errorMessage, "too large") {
				return nil, apperrors.ErrFileTooLarge
			}

			return nil, apperrors.ErrUploadFailed
		}
	}

	updatedProfile, err := s.ProfileRepo.UpdateServiceProviderProfile(ctx, providerID, req, profilePicURL)
	if err != nil {
		return nil, apperrors.ErrInternalServer
	}

	return updatedProfile, nil
}

func (s *ProfileService) GetServiceProviderProfileData(ctx context.Context, providerID uuid.UUID) (*models.ServiceProviderProfileData, error) {
	profiledata, err := s.ProfileRepo.GetServiceProviderProfileData(ctx, providerID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, apperrors.NewCustomError(404, "Service Provider profile not found", "PROFILE_NOT_FOUND")
		}
		return nil, apperrors.ErrInternalServer
	}

	return profiledata, nil
}

func (s *ProfileService) GetUserAddresses(ctx context.Context, userID uuid.UUID) ([]models.UserAddressResponse, error) {
	addresses, err := s.ProfileRepo.GetUserAddresses(ctx, userID)
	if err != nil {
		return nil, apperrors.ErrInternalServer
	}
	return addresses, nil
}

func (s *ProfileService) SubmitUserAddress(ctx context.Context, userID uuid.UUID, req models.UserAddressRequest) (*models.UserAddressResponse, error) {
	if req.IsDefault {
		if err := s.ProfileRepo.ClearUserDefaultAddress(ctx, userID); err != nil {
			return nil, apperrors.ErrInternalServer
		}
	}

	address, err := s.ProfileRepo.InsertUserAddress(ctx, userID, req)
	if err != nil {
		return nil, apperrors.ErrInternalServer
	}
	return address, nil
}

func (s *ProfileService) UpdateUserAddress(ctx context.Context, userID uuid.UUID, addressID int, req models.UserAddressRequest) (*models.UserAddressResponse, error) {
	if req.IsDefault {
		if err := s.ProfileRepo.ClearUserDefaultAddress(ctx, userID); err != nil {
			return nil, apperrors.ErrInternalServer
		}
	}

	address, err := s.ProfileRepo.UpdateUserAddress(ctx, userID, addressID, req)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, apperrors.NewCustomError(404, "Address not found", "NOT_FOUND")
		}
		return nil, apperrors.ErrInternalServer
	}
	return address, nil
}

func (s *ProfileService) DeleteUserAddress(ctx context.Context, userID uuid.UUID, addressID int) error {
	err := s.ProfileRepo.DeleteUserAddress(ctx, userID, addressID)
	if err != nil {
		return apperrors.ErrInternalServer
	}
	return nil
}

func (s *ProfileService) GetServiceProviderAddress(ctx context.Context, providerID uuid.UUID) (*models.SPAddressResponse, error) {
	address, err := s.ProfileRepo.GetServiceProviderAddress(ctx, providerID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, apperrors.NewCustomError(404, "Address not found", "NOT_FOUND")
		}
		return nil, apperrors.ErrInternalServer
	}
	return address, nil
}

func (s *ProfileService) SaveServiceProviderAddress(ctx context.Context, providerID uuid.UUID, req models.SPAddressRequest) (*models.SPAddressResponse, error) {
	address, err := s.ProfileRepo.SaveServiceProviderAddress(ctx, providerID, req)
	if err != nil {
		return nil, apperrors.ErrInternalServer
	}
	return address, nil
}

func (s *ProfileService) SubmitNIDDetails(ctx context.Context, providerID uuid.UUID, req models.NIDSubmitRequest) error {
	existingData, err := s.ProfileRepo.GetNIDStatus(ctx, providerID)
	if err != nil && err != sql.ErrNoRows {
		return apperrors.ErrInternalServer
	}

	if existingData != nil {
		if existingData.Status == models.ACCEPTED {
			return apperrors.NewCustomError(400, "Your NID is already accepted. Cannot resubmit.", "BAD_REQUEST")
		}
		if existingData.Status == models.PENDING {
			return apperrors.NewCustomError(400, "Your NID is already under review. Please wait.", "BAD_REQUEST")
		}
	}

	frontExt := utils.GetFileExtension(req.NIDFront.Filename)
	frontPath := fmt.Sprintf("%s_front%s", providerID.String(), frontExt)
	_, err = supabase.UploadToSupabase(req.NIDFront, "nids", frontPath)
	if err != nil {
		log.Printf("NID Front Upload Failed: %v", err)

		errorMessage := err.Error()
		if strings.Contains(errorMessage, "413") || strings.Contains(errorMessage, "size") || strings.Contains(errorMessage, "too large") {
			return apperrors.ErrFileTooLarge
		}
		return apperrors.ErrInternalServer
	}

	backExt := utils.GetFileExtension(req.NIDBack.Filename)
	backPath := fmt.Sprintf("%s_back%s", providerID.String(), backExt)
	_, err = supabase.UploadToSupabase(req.NIDBack, "nids", backPath)
	if err != nil {
		log.Printf("NID Back Upload Failed: %v", err)
		errorMessage := err.Error()
		if strings.Contains(errorMessage, "413") || strings.Contains(errorMessage, "size") || strings.Contains(errorMessage, "too large") {
			return apperrors.ErrFileTooLarge
		}
		return apperrors.ErrInternalServer
	}

	err = s.ProfileRepo.SaveNIDData(ctx, providerID)
	if err != nil {
		return apperrors.ErrInternalServer
	}

	return nil
}

func (s *ProfileService) GetNIDStatus(ctx context.Context, providerID uuid.UUID) (*models.NIDStatusResponse, error) {
	statusResponse, err := s.ProfileRepo.GetNIDStatus(ctx, providerID)
	if err != nil {
		return nil, apperrors.ErrInternalServer
	}

	if statusResponse == nil {
		return nil, apperrors.NewCustomError(404, "NID data not found", "NOT_FOUND")
	}

	return statusResponse, nil
}

func (s *ProfileService) UpdateServiceCatalog(ctx context.Context, providerID uuid.UUID, req models.ServiceCatalogDataRequest) (*models.ServiceCatalogData, error) {
	profile, err := s.ProfileRepo.GetServiceProviderProfileData(ctx, providerID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, apperrors.ErrProfileMissing
		}
		return nil, apperrors.ErrInternalServer
	}
	if profile.Name == "" {
		return nil, apperrors.ErrProfileIncomplete
	}

	address, err := s.ProfileRepo.GetServiceProviderAddress(ctx, providerID)
	if err != nil || address == nil {
		return nil, apperrors.NewCustomError(400, "Please update your address before setting up the catalog", "PROFILE_INCOMPLETE")
	}

	updatedCatalog, err := s.ProfileRepo.UpdateServiceCatalog(ctx, providerID, req)
	if err != nil {
		return nil, apperrors.ErrInternalServer
	}
	return updatedCatalog, nil
}

func (s *ProfileService) GetServiceCatalog(ctx context.Context, providerID uuid.UUID) (*models.ServiceCatalogData, error) {
	catalog, err := s.ProfileRepo.GetServiceCatalog(ctx, providerID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, apperrors.NewCustomError(404, "Service catalog not found", "CATALOG_NOT_FOUND")
		}
		return nil, apperrors.ErrInternalServer
	}
	return catalog, nil
}
