package repository

import (
	"context"
	"database/sql"
	"fixora-server/models"

	"github.com/google/uuid"
)

type OTPRepository struct {
	db *sql.DB
}

func NewOTPRepository(db *sql.DB) *OTPRepository {
	return &OTPRepository{db: db}
}

func (r *OTPRepository) InsertOTPInfo(ctx context.Context, otp *models.OTP) error {
	query := `
		INSERT INTO otps (id, entity_id, role, type, otp_token, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6)`
	_, err := r.db.ExecContext(ctx, query, otp.ID.String(), otp.EntityID.String(), otp.Role, otp.Type, otp.OTPToken, otp.ExpiresAt)
	return err
}

func (r *OTPRepository) GetOTPInfo(ctx context.Context, otpID string) (*models.OTP, error) {
	otp := &models.OTP{}
	query := `SELECT id, entity_id, role, type, otp_token, expires_at FROM otps WHERE id = $1`
	err := r.db.QueryRowContext(ctx, query, otpID).Scan(&otp.ID, &otp.EntityID, &otp.Role, &otp.Type, &otp.OTPToken, &otp.ExpiresAt)
	if err != nil {
		return nil, err
	}
	return otp, nil
}

func (r *OTPRepository) GetOTPID(ctx context.Context, entityID uuid.UUID) (uuid.UUID, error) {
	var otpID uuid.UUID
	query := `SELECT id FROM otps WHERE entity_id = $1`
	err := r.db.QueryRowContext(ctx, query, entityID.String()).Scan(&otpID)
	if err != nil {
		return uuid.Nil, err
	}
	return otpID, nil
}

func (r *OTPRepository) DeleteOTP(ctx context.Context, otpID string) error {
	query := `DELETE FROM otps WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, otpID)
	return err
}

func (r *OTPRepository) GetOTPAttemptInfo(ctx context.Context, entityID uuid.UUID) (*models.OTPAttempt, error) {
	attempt := &models.OTPAttempt{}
	query := `SELECT entity_id, count, last_attempt_at FROM otp_attempts WHERE entity_id = $1`
	err := r.db.QueryRowContext(ctx, query, entityID.String()).Scan(&attempt.EntityID, &attempt.Count, &attempt.LastAttemptAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return attempt, err
}

func (r *OTPRepository) UpdateOTPAttempt(ctx context.Context, attempt *models.OTPAttempt) error {
	query := `
		INSERT INTO otp_attempts (entity_id, count, last_attempt_at) 
		VALUES ($1, $2, $3)
		ON CONFLICT (entity_id) DO UPDATE SET count = $2, last_attempt_at = $3`
	_, err := r.db.ExecContext(ctx, query, attempt.EntityID.String(), attempt.Count, attempt.LastAttemptAt)
	return err
}

func (r *OTPRepository) GetUserPhone(ctx context.Context, userID uuid.UUID) (string, error) {
	var phone string
	query := `SELECT phone FROM users WHERE user_id = $1`
	err := r.db.QueryRowContext(ctx, query, userID).Scan(&phone)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", nil
		}
		return "", err
	}
	return phone, nil
}

func (r *OTPRepository) GetServiceProviderPhone(ctx context.Context, providerID uuid.UUID) (string, error) {
	var phone string
	query := `SELECT phone FROM service_providers WHERE provider_id = $1`
	err := r.db.QueryRowContext(ctx, query, providerID).Scan(&phone)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", nil
		}
		return "", err
	}
	return phone, nil
}
