package repository

import (
	"context"
	"database/sql"
	"fixora-server/models"
	"time"
)

type AuthRepository struct {
	db *sql.DB
}

func NewAuthRepository(db *sql.DB) *AuthRepository {
	return &AuthRepository{db: db}
}

//  User Operations

func (r *AuthRepository) FindUserByPhone(ctx context.Context, phone string) (*models.LoginCredentials, error) {
	query := `SELECT user_id, password_hash, is_phone_verified FROM users WHERE phone = $1`

	var creds models.LoginCredentials
	err := r.db.QueryRowContext(ctx, query, phone).Scan(
		&creds.UserID,
		&creds.PasswordHash,
		&creds.IsPhoneVerified,
	)
	if err != nil {
		return nil, err
	}
	return &creds, nil
}

func (r *AuthRepository) CreateUser(ctx context.Context, userID, phone, passwordHash string) error {
	query := `INSERT INTO users (user_id, phone, password_hash, is_phone_verified) VALUES ($1, $2, $3, $4)`
	_, err := r.db.ExecContext(ctx, query, userID, phone, passwordHash, false)
	return err
}

func (r *AuthRepository) UpdateUserVerification(ctx context.Context, phone string) error {
	query := `UPDATE users SET is_phone_verified = TRUE WHERE phone = $1`
	_, err := r.db.ExecContext(ctx, query, phone)
	return err
}

//  Service Provider Operations

func (r *AuthRepository) FindServiceProviderByPhone(ctx context.Context, phone string) (*models.LoginCredentials, error) {
	query := `SELECT user_id, password_hash, is_phone_verified FROM service_providers WHERE phone = $1`

	var creds models.LoginCredentials
	err := r.db.QueryRowContext(ctx, query, phone).Scan(
		&creds.UserID,
		&creds.PasswordHash,
		&creds.IsPhoneVerified,
	)
	if err != nil {
		return nil, err
	}
	return &creds, nil
}

func (r *AuthRepository) CreateServiceProvider(ctx context.Context, userID, phone, profession, passwordHash string) error {
	query := `INSERT INTO service_providers (user_id, phone, profession, password_hash, is_phone_verified) VALUES ($1, $2, $3, $4, $5)`
	_, err := r.db.ExecContext(ctx, query, userID, phone, profession, passwordHash, false)
	return err
}

func (r *AuthRepository) UpdateServiceProviderVerification(ctx context.Context, phone string) error {
	query := `UPDATE service_providers SET is_phone_verified = TRUE WHERE phone = $1`
	_, err := r.db.ExecContext(ctx, query, phone)
	return err
}

// Token Operations

func (r *AuthRepository) SaveRefreshToken(ctx context.Context, userID, token string, expiresAt time.Time) error {
	query := `
		INSERT INTO refresh_tokens (user_id, token, expires_at)
		VALUES ($1, $2, $3)
		ON CONFLICT (user_id) DO UPDATE SET token = EXCLUDED.token, expires_at = EXCLUDED.expires_at`
	_, err := r.db.ExecContext(ctx, query, userID, token, expiresAt)
	return err
}

func (r *AuthRepository) FindRefreshToken(ctx context.Context, token string) (string, string, time.Time, error) {
	var userID, role string
	var expiresAt time.Time
	query := `SELECT user_id, role, expires_at FROM refresh_tokens WHERE token = $1`
	err := r.db.QueryRowContext(ctx, query, token).Scan(&userID, &role, &expiresAt)
	if err != nil {
		return "", "", time.Time{}, err
	}
	return userID, role, expiresAt, nil
}

func (r *AuthRepository) DeleteRefreshToken(ctx context.Context, token string) error {
	query := `DELETE FROM refresh_tokens WHERE token = $1`
	_, err := r.db.ExecContext(ctx, query, token)
	return err
}
