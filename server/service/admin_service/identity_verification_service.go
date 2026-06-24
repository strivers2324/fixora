package admin_service

import (
	"context"
	"fmt"
	"log"

	"fixora-server/database/supabase"
	"fixora-server/models"
	"fixora-server/pkg/apperrors"
	"fixora-server/repository/admin_repository"

	"github.com/google/uuid"
)

type IdentityVerificationService struct {
	VerifyRepo *admin_repository.IdentityVerificationRepository
}

func NewIdentityVerificationService(verifyRepo *admin_repository.IdentityVerificationRepository) *IdentityVerificationService {
	return &IdentityVerificationService{VerifyRepo: verifyRepo}
}

func (s *IdentityVerificationService) GetVerificationsByStatus(ctx context.Context, status models.NIDStatus) ([]models.IdentityVerification, error) {
	verifications, err := s.VerifyRepo.GetVerificationsByStatus(ctx, status)
	if err != nil {
		log.Printf("Failed to fetch verifications: %v", err)
		return nil, apperrors.ErrInternalServer
	}

	for i, v := range verifications {
		pID := v.ProviderID.String()

		frontBase := fmt.Sprintf("%s_front.png", pID)
		frontURL, err := supabase.GetSignedURL("nids", frontBase, 3600)
		if err == nil {
			verifications[i].FrontImage = frontURL
		} else {
			frontBaseJpg := fmt.Sprintf("%s_front.jpg", pID)
			frontURLJpg, errJpg := supabase.GetSignedURL("nids", frontBaseJpg, 3600)
			if errJpg == nil {
				verifications[i].FrontImage = frontURLJpg
			}
		}

		backBase := fmt.Sprintf("%s_back.png", pID)
		backURL, err := supabase.GetSignedURL("nids", backBase, 3600)
		if err == nil {
			verifications[i].BackImage = backURL
		} else {
			backBaseJpg := fmt.Sprintf("%s_back.jpg", pID)
			backURLJpg, errJpg := supabase.GetSignedURL("nids", backBaseJpg, 3600)
			if errJpg == nil {
				verifications[i].BackImage = backURLJpg
			}
		}
	}

	return verifications, nil
}

func (s *IdentityVerificationService) UpdateVerificationStatus(ctx context.Context, providerID uuid.UUID, status models.NIDStatus) error {
	err := s.VerifyRepo.UpdateVerificationStatus(ctx, providerID, status)
	if err != nil {
		log.Printf("Status update failed: %v", err)
		return apperrors.ErrInternalServer
	}
	return nil
}
