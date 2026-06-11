package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"fixora-server/models"

	"github.com/google/uuid"
)

type JobRepository struct {
	DB *sql.DB
}

func NewJobRepository(db *sql.DB) *JobRepository {
	return &JobRepository{DB: db}
}

func (r *JobRepository) GetAddressLatLng(ctx context.Context, addressID int) (float64, float64, error) {
	var lat, lng float64
	query := `SELECT latitude, longitude FROM user_addresses WHERE address_id = $1`
	err := r.DB.QueryRowContext(ctx, query, addressID).Scan(&lat, &lng)
	if err != nil {
		fmt.Println("==== GET ADDRESS ERROR ====", err)
		return 0, 0, err
	}
	return lat, lng, nil
}

func (r *JobRepository) GetProviderMinCharge(ctx context.Context, providerID uuid.UUID) (float64, error) {
	var minCharge float64
	query := `SELECT COALESCE(min_charge, 0) FROM service_catalogs WHERE provider_id = $1`
	err := r.DB.QueryRowContext(ctx, query, providerID).Scan(&minCharge)
	return minCharge, err
}

func (r *JobRepository) FindNearbyProviders(ctx context.Context, professionID int, targetLat float64, targetLng float64, radiusKM float64) ([]models.ProviderSearchResponse, error) {
	providers := make([]models.ProviderSearchResponse, 0)

	query := `
		SELECT 
			spp.provider_id, 
			spp.name, 
			COALESCE(spp.profile_picture_url, ''), 
			sp.profession_id, 
			spa.latitude, 
			spa.longitude,
			COALESCE(sc.min_charge, 0),
			COALESCE(sc.description, '')
		FROM 
			service_provider_profiles spp
		JOIN 
			service_providers sp ON spp.provider_id = sp.provider_id
		JOIN 
			service_catalogs sc ON sp.provider_id = sc.provider_id
		JOIN 
			service_provider_addresses spa ON sp.provider_id = spa.provider_id
		WHERE 
			sp.profession_id = $1
			AND spa.latitude IS NOT NULL 
			AND spa.longitude IS NOT NULL
			AND (
				6371 * acos(
					LEAST(1.0::float, GREATEST(-1.0::float, 
						cos(radians($2)) * cos(radians(spa.latitude)) * cos(radians(spa.longitude) - radians($3)) + 
						sin(radians($2)) * sin(radians(spa.latitude))
					))
				)
			) <= $4
	`

	rows, err := r.DB.QueryContext(ctx, query, professionID, targetLat, targetLng, radiusKM)
	if err != nil {
		fmt.Println("==== SQL QUERY ERROR ====", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var p models.ProviderSearchResponse
		if err := rows.Scan(
			&p.ProviderID,
			&p.Name,
			&p.ProfilePictureURL,
			&p.ProfessionID,
			&p.Latitude,
			&p.Longitude,
			&p.MinCharge,
			&p.Description,
		); err != nil {
			fmt.Println("==== ROW SCAN ERROR ====", err)
			return nil, err
		}
		providers = append(providers, p)
	}

	return providers, nil
}

func (r *JobRepository) GetActiveBroadcastByUserAndProvider(ctx context.Context, userID uuid.UUID, providerID uuid.UUID) (*uuid.UUID, error) {
	query := `
		SELECT jb.broadcast_id 
		FROM job_broadcasts jb
		JOIN job_requests jr ON jb.job_id = jr.job_id
		WHERE jr.user_id = $1 
		  AND jb.provider_id = $2 
		  AND jb.job_broadcast_status IN ('PENDING', 'ACCEPTED')
		  AND jr.job_status IN ('PENDING', 'ACCEPTED')
		LIMIT 1
	`
	var broadcastID uuid.UUID
	err := r.DB.QueryRowContext(ctx, query, userID, providerID).Scan(&broadcastID)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &broadcastID, nil
}

func (r *JobRepository) CheckBroadcastExists(ctx context.Context, jobID uuid.UUID, providerID uuid.UUID) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM job_broadcasts WHERE job_id = $1 AND provider_id = $2)`
	err := r.DB.QueryRowContext(ctx, query, jobID, providerID).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

func (r *JobRepository) GetPendingProvidersForJob(ctx context.Context, jobID uuid.UUID) ([]uuid.UUID, error) {
	query := `SELECT provider_id FROM job_broadcasts WHERE job_id = $1 AND job_broadcast_status = 'PENDING'`
	rows, err := r.DB.QueryContext(ctx, query, jobID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var providerIDs []uuid.UUID
	for rows.Next() {
		var id uuid.UUID
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		providerIDs = append(providerIDs, id)
	}
	return providerIDs, nil
}

func (r *JobRepository) CreateJobRequest(ctx context.Context, jobID uuid.UUID, userID uuid.UUID, req models.CreateJobRequest) error {
	query := `
		INSERT INTO job_requests (job_id, user_id, profession_id, problem_details, address_id, job_status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.DB.ExecContext(ctx, query, jobID, userID, req.ProfessionID, req.ProblemDetails, req.AddressID, models.JobStatusPending, time.Now())
	return err
}

func (r *JobRepository) CreateJobBroadcast(ctx context.Context, broadcastID uuid.UUID, jobID uuid.UUID, providerID uuid.UUID, userOfferPrice *float64) error {
	query := `
		INSERT INTO job_broadcasts (broadcast_id, job_id, provider_id, job_broadcast_status, user_offer_price, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := r.DB.ExecContext(ctx, query, broadcastID, jobID, providerID, models.BroadcastStatusPending, userOfferPrice, time.Now())
	return err
}

func (r *JobRepository) UpdateProviderOffer(ctx context.Context, jobID uuid.UUID, providerID uuid.UUID, offerPrice float64) error {
	query := `UPDATE job_broadcasts SET provider_offer_price = $1 WHERE job_id = $2 AND provider_id = $3 AND job_broadcast_status = 'PENDING'`
	res, err := r.DB.ExecContext(ctx, query, offerPrice, jobID, providerID)
	if err != nil {
		return err
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return errors.New("no pending request found to update offer")
	}
	return nil
}

func (r *JobRepository) UpdateUserOffer(ctx context.Context, jobID uuid.UUID, providerID uuid.UUID, offerPrice float64) error {
	query := `UPDATE job_broadcasts SET user_offer_price = $1 WHERE job_id = $2 AND provider_id = $3 AND job_broadcast_status = 'PENDING'`
	res, err := r.DB.ExecContext(ctx, query, offerPrice, jobID, providerID)
	if err != nil {
		return err
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return errors.New("no pending request found for this provider to update offer")
	}
	return nil
}

func (r *JobRepository) GetJobInfo(ctx context.Context, jobID uuid.UUID) (*models.JobRequest, error) {
	query := `
		SELECT job_id, user_id, profession_id, problem_details, address_id, job_status, accepted_provider_id, accepted_at, agreed_price, created_at
		FROM job_requests WHERE job_id = $1
	`
	var job models.JobRequest
	err := r.DB.QueryRowContext(ctx, query, jobID).Scan(
		&job.JobID, &job.UserID, &job.ProfessionID, &job.ProblemDetails, &job.AddressID, &job.JobStatus, &job.AcceptedProviderID, &job.AcceptedAt, &job.AgreedPrice, &job.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &job, nil
}

func (r *JobRepository) UpdateJobAndBroadcastStatus(ctx context.Context, jobID uuid.UUID, providerID uuid.UUID, status models.JobStatus, agreedPrice float64) error {
	tx, err := r.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}

	now := time.Now()
	_, err = tx.ExecContext(ctx, `UPDATE job_requests SET job_status = $1, accepted_provider_id = $2, accepted_at = $3, agreed_price = $4 WHERE job_id = $5`, status, providerID, now, agreedPrice, jobID)
	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.ExecContext(ctx, `UPDATE job_broadcasts SET job_broadcast_status = $1 WHERE job_id = $2 AND provider_id = $3`, models.BroadcastStatusAccepted, jobID, providerID)
	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.ExecContext(ctx, `UPDATE job_broadcasts SET job_broadcast_status = $1 WHERE job_id = $2 AND provider_id != $3`, models.BroadcastStatusMissed, jobID, providerID)
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}

func (r *JobRepository) CancelJobByUser(ctx context.Context, jobID uuid.UUID, reason string) error {
	tx, err := r.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}

	_, err = tx.ExecContext(ctx, `UPDATE job_requests SET job_status = $1, user_cancellation_reason = $2 WHERE job_id = $3`, models.JobStatusCancelled, reason, jobID)
	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.ExecContext(ctx, `UPDATE job_broadcasts SET job_broadcast_status = $1 WHERE job_id = $2`, models.BroadcastStatusCancelled, jobID)
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}

func (r *JobRepository) ResetJobToPending(ctx context.Context, jobID uuid.UUID, providerID uuid.UUID, reason string) error {
	tx, err := r.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}

	_, err = tx.ExecContext(ctx, `UPDATE job_requests SET job_status = $1, accepted_provider_id = NULL, accepted_at = NULL, agreed_price = NULL WHERE job_id = $2`, models.JobStatusPending, jobID)
	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.ExecContext(ctx, `UPDATE job_broadcasts SET job_broadcast_status = $1, provider_cancellation_reason = $2 WHERE job_id = $3 AND provider_id = $4`, models.BroadcastStatusCancelled, reason, jobID, providerID)
	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.ExecContext(ctx, `UPDATE job_broadcasts SET job_broadcast_status = $1 WHERE job_id = $2 AND provider_id != $3 AND job_broadcast_status = $4`, models.BroadcastStatusPending, jobID, providerID, models.BroadcastStatusMissed)
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}

func (r *JobRepository) CompleteJob(ctx context.Context, jobID uuid.UUID, providerID uuid.UUID) error {
	_, err := r.DB.ExecContext(ctx, `UPDATE job_requests SET job_status = $1 WHERE job_id = $2 AND accepted_provider_id = $3`, models.JobStatusCompleted, jobID, providerID)
	return err
}

func (r *JobRepository) GetUserActiveJobs(ctx context.Context, userID uuid.UUID) ([]models.JobSummaryForUser, error) {
	query := `
		SELECT 
			jr.job_id, 
			COALESCE(jr.problem_details, ''), 
			jr.job_status, 
			COALESCE(ua.district, ''), 
			COALESCE(ua.thana, ''), 
			COALESCE(ua.area, ''), 
			COALESCE(ua.address, ''), 
			ua.latitude, ua.longitude,
			jb.provider_id,
			spp.name as provider_name, sp.phone as provider_phone,
			jb.user_offer_price, jb.provider_offer_price,
			jr.agreed_price,
			jr.accepted_at, jr.created_at
		FROM job_requests jr
		JOIN user_addresses ua ON jr.address_id = ua.address_id
		-- EKHYANE CHANGE: jb.job_broadcast_status IN ('PENDING', 'ACCEPTED') add kora hoyeche
		LEFT JOIN job_broadcasts jb ON jr.job_id = jb.job_id 
			AND (jr.accepted_provider_id IS NULL OR jb.provider_id = jr.accepted_provider_id)
			AND jb.job_broadcast_status IN ('PENDING', 'ACCEPTED')
		LEFT JOIN service_provider_profiles spp ON jr.accepted_provider_id = spp.provider_id
		LEFT JOIN service_providers sp ON jr.accepted_provider_id = sp.provider_id
		WHERE jr.user_id = $1 AND jr.job_status IN ('PENDING', 'ACCEPTED')
		ORDER BY jr.created_at DESC
	`
	rows, err := r.DB.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jobs []models.JobSummaryForUser
	for rows.Next() {
		var job models.JobSummaryForUser
		if err := rows.Scan(
			&job.JobID, &job.ProblemDetails, &job.JobStatus,
			&job.District, &job.Thana, &job.Area, &job.Address,
			&job.Latitude, &job.Longitude,
			&job.ProviderID,
			&job.ProviderName, &job.ProviderPhone,
			&job.UserOfferPrice, &job.ProviderOfferPrice,
			&job.AgreedPrice,
			&job.AcceptedAt, &job.CreatedAt,
		); err != nil {
			return nil, err
		}
		jobs = append(jobs, job)
	}
	return jobs, nil
}

func (r *JobRepository) GetUserJobHistory(ctx context.Context, userID uuid.UUID) ([]models.JobSummaryForUser, error) {
	query := `
		SELECT 
			jr.job_id, 
			COALESCE(jr.problem_details, ''), 
			jr.job_status, 
			COALESCE(ua.district, ''), 
			COALESCE(ua.thana, ''), 
			COALESCE(ua.area, ''), 
			COALESCE(ua.address, ''), 
			ua.latitude, ua.longitude,
			jb.provider_id,
			spp.name as provider_name, sp.phone as provider_phone,
			jb.user_offer_price, jb.provider_offer_price,
			jr.agreed_price,
			jr.accepted_at, jr.created_at
		FROM job_requests jr
		JOIN user_addresses ua ON jr.address_id = ua.address_id
		LEFT JOIN job_broadcasts jb ON jr.job_id = jb.job_id AND (jr.accepted_provider_id IS NULL OR jb.provider_id = jr.accepted_provider_id)
		LEFT JOIN service_provider_profiles spp ON jr.accepted_provider_id = spp.provider_id
		LEFT JOIN service_providers sp ON jr.accepted_provider_id = sp.provider_id
		WHERE jr.user_id = $1 AND jr.job_status IN ('COMPLETED', 'CANCELLED')
		ORDER BY jr.created_at DESC
	`
	rows, err := r.DB.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jobs []models.JobSummaryForUser
	for rows.Next() {
		var job models.JobSummaryForUser
		if err := rows.Scan(
			&job.JobID, &job.ProblemDetails, &job.JobStatus,
			&job.District, &job.Thana, &job.Area, &job.Address,
			&job.Latitude, &job.Longitude,
			&job.ProviderID,
			&job.ProviderName, &job.ProviderPhone,
			&job.UserOfferPrice, &job.ProviderOfferPrice,
			&job.AgreedPrice,
			&job.AcceptedAt, &job.CreatedAt,
		); err != nil {
			return nil, err
		}
		jobs = append(jobs, job)
	}
	return jobs, nil
}

func (r *JobRepository) GetProviderActiveJob(ctx context.Context, providerID uuid.UUID) (*models.JobSummaryForProvider, error) {
	query := `
		SELECT 
			jr.job_id, 
			COALESCE(jr.problem_details, ''), 
			jr.job_status, 
			ua.full_name, 
			ua.phone_number,
			COALESCE(ua.district, ''), 
			COALESCE(ua.thana, ''), 
			COALESCE(ua.area, ''), 
			COALESCE(ua.address, ''), 
			ua.latitude, ua.longitude,
			jb.user_offer_price, jb.provider_offer_price,
			jr.agreed_price,
			jr.accepted_at, jr.created_at
		FROM job_requests jr
		JOIN user_addresses ua ON jr.address_id = ua.address_id
		LEFT JOIN job_broadcasts jb ON jr.job_id = jb.job_id AND jb.provider_id = $1
		WHERE jr.accepted_provider_id = $1 AND jr.job_status = 'ACCEPTED'
		LIMIT 1
	`
	var job models.JobSummaryForProvider
	err := r.DB.QueryRowContext(ctx, query, providerID).Scan(
		&job.JobID, &job.ProblemDetails, &job.JobStatus,
		&job.FullName, &job.PhoneNumber,
		&job.District, &job.Thana, &job.Area, &job.Address,
		&job.Latitude, &job.Longitude,
		&job.UserOfferPrice, &job.ProviderOfferPrice,
		&job.AgreedPrice,
		&job.AcceptedAt, &job.CreatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &job, nil
}

func (r *JobRepository) GetPendingBroadcasts(ctx context.Context, providerID uuid.UUID) ([]models.JobSummaryForProvider, error) {
	query := `
		SELECT 
			jr.job_id, 
			COALESCE(jr.problem_details, ''), 
			jr.job_status, 
			ua.full_name, 
			ua.phone_number,
			COALESCE(ua.district, ''), 
			COALESCE(ua.thana, ''), 
			COALESCE(ua.area, ''), 
			COALESCE(ua.address, ''), 
			ua.latitude, ua.longitude,
			jb.user_offer_price, jb.provider_offer_price,
			jr.agreed_price,
			jr.created_at, jb.job_broadcast_status
		FROM job_broadcasts jb
		JOIN job_requests jr ON jb.job_id = jr.job_id
		JOIN user_addresses ua ON jr.address_id = ua.address_id
		WHERE jb.provider_id = $1 AND jb.job_broadcast_status = 'PENDING' AND jr.job_status = 'PENDING'
		ORDER BY jb.created_at DESC
	`
	rows, err := r.DB.QueryContext(ctx, query, providerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jobs []models.JobSummaryForProvider
	for rows.Next() {
		var job models.JobSummaryForProvider
		if err := rows.Scan(
			&job.JobID, &job.ProblemDetails, &job.JobStatus,
			&job.FullName, &job.PhoneNumber,
			&job.District, &job.Thana, &job.Area, &job.Address,
			&job.Latitude, &job.Longitude,
			&job.UserOfferPrice, &job.ProviderOfferPrice,
			&job.AgreedPrice,
			&job.CreatedAt, &job.BroadcastStatus,
		); err != nil {
			return nil, err
		}
		jobs = append(jobs, job)
	}
	return jobs, nil
}

func (r *JobRepository) GetBroadcastOfferDetails(ctx context.Context, jobID uuid.UUID, providerID uuid.UUID) (*float64, *float64, error) {
	var userOffer, providerOffer *float64
	query := `SELECT user_offer_price, provider_offer_price FROM job_broadcasts WHERE job_id = $1 AND provider_id = $2 AND job_broadcast_status = 'PENDING'`

	err := r.DB.QueryRowContext(ctx, query, jobID, providerID).Scan(&userOffer, &providerOffer)
	if err != nil {
		return nil, nil, err
	}
	return userOffer, providerOffer, nil
}

func (r *JobRepository) GetProviderJobHistory(ctx context.Context, providerID uuid.UUID) ([]models.JobSummaryForProvider, error) {
	query := `
		SELECT 
			jr.job_id, 
			COALESCE(jr.problem_details, ''), 
			jr.job_status, 
			ua.full_name, 
			ua.phone_number,
			COALESCE(ua.district, ''), 
			COALESCE(ua.thana, ''), 
			COALESCE(ua.area, ''), 
			COALESCE(ua.address, ''), 
			ua.latitude, ua.longitude,
			jb.user_offer_price, jb.provider_offer_price,
			jr.agreed_price,
			jr.accepted_at, jr.created_at
		FROM job_requests jr
		JOIN user_addresses ua ON jr.address_id = ua.address_id
		LEFT JOIN job_broadcasts jb ON jr.job_id = jb.job_id AND jb.provider_id = $1
		WHERE jr.accepted_provider_id = $1 AND jr.job_status IN ('COMPLETED', 'CANCELLED')
		ORDER BY jr.created_at DESC
	`
	rows, err := r.DB.QueryContext(ctx, query, providerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jobs []models.JobSummaryForProvider
	for rows.Next() {
		var job models.JobSummaryForProvider
		if err := rows.Scan(
			&job.JobID, &job.ProblemDetails, &job.JobStatus,
			&job.FullName, &job.PhoneNumber,
			&job.District, &job.Thana, &job.Area, &job.Address,
			&job.Latitude, &job.Longitude,
			&job.UserOfferPrice, &job.ProviderOfferPrice,
			&job.AgreedPrice,
			&job.AcceptedAt, &job.CreatedAt,
		); err != nil {
			return nil, err
		}
		jobs = append(jobs, job)
	}
	return jobs, nil
}
