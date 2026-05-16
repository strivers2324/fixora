package repository

import (
	"context"
	"database/sql"

	"github.com/google/uuid"
)

type AccountRepository struct {
	db *sql.DB
}

func NewAccountRepository(db *sql.DB) *AccountRepository {
	return &AccountRepository{db: db}
}

func (r *AccountRepository) GetUserPassword(ctx context.Context, userID uuid.UUID) (string, error) {
	var hash string
	query := `SELECT password_hash FROM users WHERE user_id = $1`
	err := r.db.QueryRowContext(ctx, query, userID).Scan(&hash)
	if err != nil {
		return "", err
	}
	return hash, nil
}

func (r *AccountRepository) GetServiceProviderPassword(ctx context.Context, providerID uuid.UUID) (string, error) {
	var hash string
	query := `SELECT password_hash FROM service_providers WHERE provider_id = $1`
	err := r.db.QueryRowContext(ctx, query, providerID).Scan(&hash)
	if err != nil {
		return "", err
	}
	return hash, nil
}

func (r *AccountRepository) UpdateUserPhone(ctx context.Context, userID uuid.UUID, newPhone string) error {
	query := `UPDATE users SET phone = $1 WHERE user_id = $2`
	_, err := r.db.ExecContext(ctx, query, newPhone, userID)
	return err
}

func (r *AccountRepository) UpdateServiceProviderPhone(ctx context.Context, providerID uuid.UUID, newPhone string) error {
	query := `UPDATE service_providers SET phone = $1 WHERE provider_id = $2`
	_, err := r.db.ExecContext(ctx, query, newPhone, providerID)
	return err
}

func (r *AccountRepository) UpdateUserPassword(ctx context.Context, userID uuid.UUID, newHash string) error {
	query := `UPDATE users SET password_hash = $1 WHERE user_id = $2`
	result, err := r.db.ExecContext(ctx, query, newHash, userID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}

func (r *AccountRepository) UpdateServiceProviderPassword(ctx context.Context, providerID uuid.UUID, newHash string) error {
	query := `UPDATE service_providers SET password_hash = $1 WHERE provider_id = $2`
	result, err := r.db.ExecContext(ctx, query, newHash, providerID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}
