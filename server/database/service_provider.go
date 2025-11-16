package database

import (
	"context"
	"database/sql"
	"fixora-server/models"
)

func CreateServiceProvider(db *sql.DB, sp models.ServiceProvider) error {
	query := `
		INSERT INTO service_providers 
		(phone, profession, password_hash, full_name, district, area, sub_area, nid_number, nid_front_url, nid_back_url)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	_, err := db.ExecContext(context.Background(), query,
		sp.Phone, sp.Profession, sp.PasswordHash,
		sp.FullName, sp.District, sp.Area, sp.SubArea, sp.NidNumber, sp.NidFrontUrl, sp.NidBackUrl,
	)
	return err
}
