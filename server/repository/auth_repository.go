package repository

import (
	"context"
	"database/sql"
	"fixora-server/models"
	"time"

	"github.com/google/uuid"
)

type AuthRepository struct {
	db *sql.DB
}

func NewAuthRepository(db *sql.DB) *AuthRepository {
	return &AuthRepository{db: db}
}

func (r *AuthRepository) CheckUserExists(ctx context.Context, phone string) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM users WHERE phone = $1)`
	err := r.db.QueryRowContext(ctx, query, phone).Scan(&exists)
	return exists, err
}

func (r *AuthRepository) CreateUser(ctx context.Context, userID uuid.UUID, phone, passwordHash string) error {
	query := `INSERT INTO users (user_id, phone, password_hash, is_phone_verified) VALUES ($1, $2, $3, $4)`
	_, err := r.db.ExecContext(ctx, query, userID.String(), phone, passwordHash, false)
	return err
}

func (r *AuthRepository) GetUserLoginData(ctx context.Context, phone string) (*models.UserLoginData, error) {
	query := `SELECT user_id, password_hash, is_phone_verified FROM users WHERE phone = $1`
	var data models.UserLoginData
	err := r.db.QueryRowContext(ctx, query, phone).Scan(
		&data.UserID,
		&data.PasswordHash,
		&data.IsPhoneVerified,
	)
	if err != nil {
		return nil, err
	}
	return &data, nil
}

func (r *AuthRepository) GetUserID(ctx context.Context, phone string) (uuid.UUID, error) {
	var userID uuid.UUID
	query := `SELECT user_id FROM users WHERE phone = $1`
	err := r.db.QueryRowContext(ctx, query, phone).Scan(&userID)
	return userID, err
}

func (r *AuthRepository) GetUserPhone(ctx context.Context, userID uuid.UUID) (string, error) {
	var phone string
	query := `SELECT phone FROM users WHERE user_id = $1`
	err := r.db.QueryRowContext(ctx, query, userID.String()).Scan(&phone)
	return phone, err
}

func (r *AuthRepository) UpdateUserVerification(ctx context.Context, userID uuid.UUID) error {
	query := `UPDATE users SET is_phone_verified = TRUE WHERE user_id = $1`
	_, err := r.db.ExecContext(ctx, query, userID.String())
	return err
}

func (r *AuthRepository) UpdateUserPhone(ctx context.Context, userID uuid.UUID, newPhone string) error {
	query := `UPDATE users SET phone = $1 WHERE user_id = $2`
	_, err := r.db.ExecContext(ctx, query, newPhone, userID.String())
	return err
}

func (r *AuthRepository) UpdateUserPassword(ctx context.Context, userID uuid.UUID, newPasswordHash string) error {
	query := `UPDATE users SET password_hash = $1 WHERE user_id = $2`
	_, err := r.db.ExecContext(ctx, query, newPasswordHash, userID.String())
	return err
}

func (r *AuthRepository) CheckServiceProviderExists(ctx context.Context, phone string) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM service_providers WHERE phone = $1)`
	err := r.db.QueryRowContext(ctx, query, phone).Scan(&exists)
	return exists, err
}

func (r *AuthRepository) CreateServiceProvider(ctx context.Context, providerID uuid.UUID, phone string, professionID int, passwordHash string) error {
	query := `INSERT INTO service_providers (provider_id, phone, profession_id, password_hash, is_phone_verified) VALUES ($1, $2, $3, $4, $5)`
	_, err := r.db.ExecContext(ctx, query, providerID.String(), phone, professionID, passwordHash, false)
	return err
}

func (r *AuthRepository) GetServiceProviderLoginData(ctx context.Context, phone string) (*models.ServiceProviderLoginData, error) {
	query := `
        SELECT 
            sp.provider_id, 
            sp.password_hash, 
            sp.is_phone_verified,
            COALESCE(p.profession_name, '') as profession_name
        FROM service_providers sp
        LEFT JOIN professions p ON sp.profession_id = p.id
        WHERE sp.phone = $1
    `
	var data models.ServiceProviderLoginData
	err := r.db.QueryRowContext(ctx, query, phone).Scan(
		&data.ProviderID,
		&data.PasswordHash,
		&data.IsPhoneVerified,
		&data.ProfessionName,
	)
	if err != nil {
		return nil, err
	}
	return &data, nil
}

func (r *AuthRepository) GetServiceProviderID(ctx context.Context, phone string) (uuid.UUID, error) {
	var providerID uuid.UUID
	query := `SELECT provider_id FROM service_providers WHERE phone = $1`
	err := r.db.QueryRowContext(ctx, query, phone).Scan(&providerID)
	return providerID, err
}

func (r *AuthRepository) GetServiceProviderPhone(ctx context.Context, providerID uuid.UUID) (string, error) {
	var phone string
	query := `SELECT phone FROM service_providers WHERE provider_id = $1`
	err := r.db.QueryRowContext(ctx, query, providerID.String()).Scan(&phone)
	return phone, err
}

func (r *AuthRepository) UpdateServiceProviderVerification(ctx context.Context, providerID uuid.UUID) error {
	query := `UPDATE service_providers SET is_phone_verified = TRUE WHERE provider_id = $1`
	_, err := r.db.ExecContext(ctx, query, providerID.String())
	return err
}

func (r *AuthRepository) UpdateServiceProviderPhone(ctx context.Context, providerID uuid.UUID, newPhone string) error {
	query := `UPDATE service_providers SET phone = $1 WHERE provider_id = $2`
	_, err := r.db.ExecContext(ctx, query, newPhone, providerID.String())
	return err
}

func (r *AuthRepository) UpdateServiceProviderPassword(ctx context.Context, providerID uuid.UUID, newPasswordHash string) error {
	query := `UPDATE service_providers SET password_hash = $1 WHERE provider_id = $2`
	_, err := r.db.ExecContext(ctx, query, newPasswordHash, providerID.String())
	return err
}

func (r *AuthRepository) InsertOTPInfo(ctx context.Context, otp *models.OTP) error {
	query := `
        INSERT INTO otps (id, entity_id, role, type, otp_token, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6)`
	_, err := r.db.ExecContext(ctx, query, otp.ID.String(), otp.EntityID.String(), otp.Role, otp.Type, otp.OTPToken, otp.ExpiresAt)
	return err
}

func (r *AuthRepository) GetOTPInfo(ctx context.Context, otpID string) (*models.OTP, error) {
	otp := &models.OTP{}
	query := `SELECT id, entity_id, role, type, otp_token, expires_at FROM otps WHERE id = $1`
	err := r.db.QueryRowContext(ctx, query, otpID).Scan(&otp.ID, &otp.EntityID, &otp.Role, &otp.Type, &otp.OTPToken, &otp.ExpiresAt)
	if err != nil {
		return nil, err
	}
	return otp, nil
}

func (r *AuthRepository) GetOTPID(ctx context.Context, entityID uuid.UUID) (uuid.UUID, error) {
	var otpID uuid.UUID
	query := `SELECT id FROM otps WHERE entity_id = $1`
	err := r.db.QueryRowContext(ctx, query, entityID.String()).Scan(&otpID)
	if err != nil {
		return uuid.Nil, err
	}
	return otpID, nil
}

func (r *AuthRepository) DeleteOTP(ctx context.Context, otpID string) error {
	query := `DELETE FROM otps WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, otpID)
	return err
}

func (r *AuthRepository) GetOTPAttemptInfo(ctx context.Context, entityID uuid.UUID) (*models.OTPAttempt, error) {
	attempt := &models.OTPAttempt{}
	query := `SELECT entity_id, count, last_attempt_at FROM otp_attempts WHERE entity_id = $1`
	err := r.db.QueryRowContext(ctx, query, entityID.String()).Scan(&attempt.EntityID, &attempt.Count, &attempt.LastAttemptAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return attempt, err
}

func (r *AuthRepository) UpdateOTPAttempt(ctx context.Context, attempt *models.OTPAttempt) error {
	query := `
        INSERT INTO otp_attempts (entity_id, count, last_attempt_at) 
        VALUES ($1, $2, $3)
        ON CONFLICT (entity_id) DO UPDATE SET count = $2, last_attempt_at = $3`
	_, err := r.db.ExecContext(ctx, query, attempt.EntityID.String(), attempt.Count, attempt.LastAttemptAt)
	return err
}

func (r *AuthRepository) SaveRefreshToken(ctx context.Context, userID uuid.UUID, token string, expiresAt time.Time) error {
	query := `
        INSERT INTO refresh_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id) DO UPDATE SET token = EXCLUDED.token, expires_at = EXCLUDED.expires_at`
	_, err := r.db.ExecContext(ctx, query, userID.String(), token, expiresAt)
	return err
}

func (r *AuthRepository) FindRefreshToken(ctx context.Context, token string) (uuid.UUID, time.Time, error) {
	var userID uuid.UUID
	var expiresAt time.Time
	query := `SELECT user_id, expires_at FROM refresh_tokens WHERE token = $1`
	err := r.db.QueryRowContext(ctx, query, token).Scan(&userID, &expiresAt)
	if err != nil {
		return uuid.Nil, time.Time{}, err
	}
	return userID, expiresAt, nil
}

func (r *AuthRepository) DeleteRefreshToken(ctx context.Context, token string) error {
	query := `DELETE FROM refresh_tokens WHERE token = $1`
	_, err := r.db.ExecContext(ctx, query, token)
	return err
}

func (r *AuthRepository) GetAllProfessions(ctx context.Context) ([]models.Profession, error) {
	query := `SELECT id, profession_name FROM professions ORDER BY id ASC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var professions []models.Profession
	for rows.Next() {
		var p models.Profession
		if err := rows.Scan(&p.ID, &p.ProfessionName); err != nil {
			return nil, err
		}
		professions = append(professions, p)
	}
	return professions, nil
}
