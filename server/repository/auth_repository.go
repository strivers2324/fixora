package repository

import (
	"context"
	"database/sql"
	"errors"
	"fixora-server/models"
	"time"
)

type AuthRepository struct {
	db *sql.DB
}

func NewAuthRepository(db *sql.DB) *AuthRepository {
	return &AuthRepository{
		db: db,
	}
}

func (r *AuthRepository) CheckUserExists(phone string) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM users WHERE phone = $1)`
	err := r.db.QueryRowContext(context.Background(), query, phone).Scan(&exists)

	if err != nil {
		return false, err
	}
	return exists, nil
}

func (r *AuthRepository) CheckServiceProviderExists(phone string) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM service_providers WHERE phone = $1)`
	err := r.db.QueryRowContext(context.Background(), query, phone).Scan(&exists)

	if err != nil {
		return false, err
	}
	return exists, nil
}

func (r *AuthRepository) CreateUser(user models.UserRegisterRequest) error {
	query := `
		INSERT INTO users 
		(phone, password_hash, full_name, district, area, sub_area)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := r.db.ExecContext(context.Background(), query,
		user.Phone, user.Password,
		user.FullName, user.District, user.Area, user.SubArea,
	)
	return err
}

func (r *AuthRepository) CreateServiceProvider(sp models.ServiceProviderRegisterRequest) error {
	query := `
		INSERT INTO service_providers
		(phone, profession, password_hash, full_name, district, area, sub_area, nid_number, nid_front_url, nid_back_url)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	_, err := r.db.ExecContext(context.Background(), query,
		sp.Phone, sp.Profession, sp.Password,
		sp.FullName, sp.District, sp.Area, sp.SubArea, sp.NidNumber, sp.NidFrontUrl, sp.NidBackUrl,
	)
	return err
}

func (r *AuthRepository) GetloginCredentials(phone string, role string) (string, error) {
	var passwordHash string
	var query string

	if role == "user" {
		query = `SELECT password_hash FROM users WHERE phone = $1`
	} else if role == "service-provider" {
		query = `SELECT password_hash FROM service_providers WHERE phone = $1`
	} else {
		return "", errors.New("invalid role")
	}

	err := r.db.QueryRowContext(context.Background(), query, phone).Scan(&passwordHash)
	return passwordHash, err
}

func (r *AuthRepository) StoreRefreshToken(phone, role, token string) error {
	expiresAt := time.Now().Add(15 * 24 * time.Hour)
	query := `INSERT INTO refresh_tokens(phone_number, role, token, expires_at) VALUES ($1, $2, $3, $4)`
	_, err := r.db.Exec(query, phone, role, token, expiresAt)
	return err
}

func (r *AuthRepository) CheckRefreshToken(token string) (string, string, error) {
	var phone, role string
	var expiresAt time.Time

	query := `SELECT phone_number, role, expires_at FROM refresh_tokens WHERE token = $1`
	err := r.db.QueryRow(query, token).Scan(&phone, &role, &expiresAt)
	if err != nil {
		return "", "", err
	}

	if time.Now().After(expiresAt) {
		_ = r.DeleteRefreshToken(token)
		return "", "", errors.New("token expired")
	}
	return phone, role, nil
}

func (r *AuthRepository) DeleteRefreshToken(token string) error {
	_, err := r.db.ExecContext(context.Background(), `DELETE FROM refresh_tokens WHERE token = $1`, token)
	return err
}
