package service

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"fixora-server/models"
	"fixora-server/pkg/apperrors"
	"fixora-server/repository"

	"github.com/google/uuid"
)

type JobService struct {
	JobRepo *repository.JobRepository
}

func NewJobService(jobRepo *repository.JobRepository) *JobService {
	return &JobService{JobRepo: jobRepo}
}

func (s *JobService) GetNearbyProviders(ctx context.Context, req models.SearchProviderRequest) ([]models.ProviderSearchResponse, error) {
	targetLat, targetLng, err := s.JobRepo.GetAddressLatLng(ctx, req.AddressID)
	if err != nil {
		return nil, err
	}

	radiusKM := 5.0
	results, err := s.JobRepo.FindNearbyProviders(ctx, req.ProfessionID, targetLat, targetLng, radiusKM)
	if err != nil {
		return nil, err
	}

	if results == nil {
		return []models.ProviderSearchResponse{}, nil
	}

	offset := 0.00009
	for i := range results {
		if results[i].Latitude == targetLat && results[i].Longitude == targetLng {
			results[i].Latitude += offset
			results[i].Longitude += offset
		}
	}

	return results, nil
}

func (s *JobService) BookExpert(ctx context.Context, userID uuid.UUID, providerID uuid.UUID, existingJobID *uuid.UUID, req models.CreateJobRequest) (*uuid.UUID, error) {
	if req.UserOfferPrice != nil {
		minCharge, err := s.JobRepo.GetProviderMinCharge(ctx, providerID)
		if err != nil && err != sql.ErrNoRows {
			return nil, err
		}
		if *req.UserOfferPrice < minCharge {
			return nil, apperrors.ErrOfferPriceTooLow
		}
	}

	activeBroadcastID, err := s.JobRepo.GetActiveBroadcastByUserAndProvider(ctx, userID, providerID)
	if err != nil {
		return nil, err
	}
	if activeBroadcastID != nil {
		return nil, apperrors.ErrAlreadyRequested
	}

	var targetJobID uuid.UUID

	if existingJobID == nil {
		targetJobID = uuid.New()
		err = s.JobRepo.CreateJobRequest(ctx, targetJobID, userID, req)
		if err != nil {
			return nil, err
		}
	} else {
		targetJobID = *existingJobID
		exists, err := s.JobRepo.CheckBroadcastExists(ctx, targetJobID, providerID)
		if err != nil {
			return nil, err
		}
		if exists {
			return nil, apperrors.ErrAlreadyRequested
		}
	}

	broadcastID := uuid.New()
	err = s.JobRepo.CreateJobBroadcast(ctx, broadcastID, targetJobID, providerID, req.UserOfferPrice)
	if err != nil {
		return nil, err
	}

	return &targetJobID, nil
}

func (s *JobService) SubmitProviderOffer(ctx context.Context, providerID uuid.UUID, jobID uuid.UUID, offerPrice float64) error {
	job, err := s.JobRepo.GetJobInfo(ctx, jobID)
	if err != nil {
		return err
	}
	if job.JobStatus != models.JobStatusPending {
		return errors.New("job is no longer pending, cannot submit offer")
	}

	return s.JobRepo.UpdateProviderOffer(ctx, jobID, providerID, offerPrice)
}

func (s *JobService) UpdateUserOffer(ctx context.Context, userID uuid.UUID, jobID uuid.UUID, providerID uuid.UUID, offerPrice float64) error {
	job, err := s.JobRepo.GetJobInfo(ctx, jobID)
	if err != nil {
		return err
	}
	if job.UserID != userID {
		return apperrors.ErrUnauthorized
	}
	if job.JobStatus != models.JobStatusPending {
		return errors.New("job is no longer pending, cannot update offer")
	}

	minCharge, err := s.JobRepo.GetProviderMinCharge(ctx, providerID)
	if err != nil && err != sql.ErrNoRows {
		return err
	}
	if offerPrice < minCharge {
		return apperrors.ErrOfferPriceTooLow
	}

	return s.JobRepo.UpdateUserOffer(ctx, jobID, providerID, offerPrice)
}

func (s *JobService) AcceptJob(ctx context.Context, providerID uuid.UUID, jobID uuid.UUID) error {
	job, err := s.JobRepo.GetJobInfo(ctx, jobID)
	if err != nil {
		return err
	}
	if job.JobStatus != models.JobStatusPending {
		return errors.New("job is no longer pending")
	}

	return s.JobRepo.UpdateJobAndBroadcastStatus(ctx, jobID, providerID, models.JobStatusAccepted)
}

func (s *JobService) CancelJobByUser(ctx context.Context, userID uuid.UUID, jobID uuid.UUID, reason string) error {
	job, err := s.JobRepo.GetJobInfo(ctx, jobID)
	if err != nil {
		return err
	}

	if job.UserID != userID {
		return apperrors.ErrUnauthorized
	}

	if job.JobStatus != models.JobStatusPending {
		return errors.New("cannot cancel job: it has already been accepted or completed by a provider")
	}

	return s.JobRepo.CancelJobByUser(ctx, jobID, reason)
}

func (s *JobService) CancelJobByProvider(ctx context.Context, providerID uuid.UUID, jobID uuid.UUID, reason string) error {
	job, err := s.JobRepo.GetJobInfo(ctx, jobID)
	if err != nil {
		return err
	}

	if job.AcceptedProviderID == nil || *job.AcceptedProviderID != providerID {
		return errors.New("unauthorized: you did not accept this job")
	}

	if job.JobStatus != models.JobStatusAccepted {
		return errors.New("cannot cancel job: it is already completed or in an invalid state")
	}

	return s.JobRepo.ResetJobToPending(ctx, jobID, providerID, reason)
}

func (s *JobService) CompleteJobByProvider(ctx context.Context, providerID uuid.UUID, jobID uuid.UUID) error {
	job, err := s.JobRepo.GetJobInfo(ctx, jobID)
	if err != nil {
		return err
	}

	if job.AcceptedProviderID == nil || *job.AcceptedProviderID != providerID {
		return errors.New("unauthorized: you are not the assigned provider for this job")
	}

	if job.JobStatus != models.JobStatusAccepted {
		return errors.New("job is not in accepted status")
	}

	return s.JobRepo.CompleteJob(ctx, jobID, providerID)
}

func (s *JobService) GetUserDashboard(ctx context.Context, userID uuid.UUID) (*models.UserDashboardResponse, error) {
	activeJobs, err := s.JobRepo.GetUserActiveJobs(ctx, userID)
	if err != nil {
		return nil, err
	}

	history, err := s.JobRepo.GetUserJobHistory(ctx, userID)
	if err != nil {
		return nil, err
	}

	return &models.UserDashboardResponse{ActiveJobs: activeJobs, JobHistory: history}, nil
}

func (s *JobService) GetProviderDashboard(ctx context.Context, providerID uuid.UUID) (*models.ProviderDashboardResponse, error) {
	active, err := s.JobRepo.GetProviderActiveJob(ctx, providerID)
	if err != nil {
		return nil, err
	}

	if active != nil && active.AcceptedAt != nil {
		if time.Since(*active.AcceptedAt) < 30*time.Minute {
			hiddenStr := "Hidden for 30 mins"
			active.Address = hiddenStr
			active.PhoneNumber = hiddenStr
			active.FullName = hiddenStr
		}
	}

	requests, err := s.JobRepo.GetPendingBroadcasts(ctx, providerID)
	if err != nil {
		return nil, err
	}

	history, err := s.JobRepo.GetProviderJobHistory(ctx, providerID)
	if err != nil {
		return nil, err
	}

	return &models.ProviderDashboardResponse{
		ActiveJob:       active,
		PendingRequests: requests,
		JobHistory:      history,
	}, nil
}
