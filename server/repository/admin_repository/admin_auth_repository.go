package admin_repository

import (
	"context"
	"database/sql"
	"fixora-server/models"
	"time"

	"github.com/google/uuid"
)

type AdminAuthRepository struct {
	db *sql.DB
}

func NewAdminAuthRepository(db *sql.DB) *AdminAuthRepository {
	return &AdminAuthRepository{db: db}
}

func (r *AdminAuthRepository) GetAdminLoginData(ctx context.Context, email string) (*models.AdminLoginData, error) {
	query := `SELECT admin_id, password_hash FROM admin WHERE email = $1`
	var data models.AdminLoginData

	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&data.AdminID,
		&data.PasswordHash,
	)
	if err != nil {
		return nil, err
	}
	return &data, nil
}

func (r *AdminAuthRepository) SaveRefreshToken(ctx context.Context, adminID uuid.UUID, token string, expiresAt time.Time) error {
	query := `
		INSERT INTO admin_refresh_tokens (admin_id, token, expires_at)
		VALUES ($1, $2, $3)
		ON CONFLICT (admin_id) DO UPDATE SET token = EXCLUDED.token, expires_at = EXCLUDED.expires_at`

	_, err := r.db.ExecContext(ctx, query, adminID.String(), token, expiresAt)
	return err
}

func (r *AdminAuthRepository) FindRefreshToken(ctx context.Context, token string) (uuid.UUID, time.Time, error) {
	var adminID uuid.UUID
	var expiresAt time.Time

	query := `SELECT admin_id, expires_at FROM admin_refresh_tokens WHERE token = $1`
	err := r.db.QueryRowContext(ctx, query, token).Scan(&adminID, &expiresAt)
	if err != nil {
		return uuid.Nil, time.Time{}, err
	}
	return adminID, expiresAt, nil
}

func (r *AdminAuthRepository) DeleteRefreshToken(ctx context.Context, token string) error {
	query := `DELETE FROM admin_refresh_tokens WHERE token = $1`
	_, err := r.db.ExecContext(ctx, query, token)
	return err
}
