package repository

import (
	"context"
	"database/sql"
	"fixora-server/models"
)

type AuthRepository struct {
	db *sql.DB
}

func NewAuthRepository(db *sql.DB) *AuthRepository {
	return &AuthRepository{
		db: db,
	}
}

func (r *AuthRepository) CreateUser(user models.User) error {
	query := `
		INSERT INTO users 
		(phone, password_hash, full_name, district, area, sub_area)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := r.db.ExecContext(context.Background(), query,
		user.Phone, user.PasswordHash,
		user.FullName, user.District, user.Area, user.SubArea,
	)
	return err
}

func (r *AuthRepository) CreateServiceProvider(sp models.ServiceProvider) error {
	query := `
		INSERT INTO service_providers 
		(phone, profession, password_hash, full_name, district, area, sub_area, nid_number, nid_front_url, nid_back_url)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	_, err := r.db.ExecContext(context.Background(), query,
		sp.Phone, sp.Profession, sp.PasswordHash,
		sp.FullName, sp.District, sp.Area, sp.SubArea, sp.NidNumber, sp.NidFrontUrl, sp.NidBackUrl,
	)
	return err
}
