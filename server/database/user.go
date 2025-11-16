package database

import (
	"context"
	"database/sql"
	"fixora-server/models"
)

func CreateUser(db *sql.DB, user models.User) error {
	query := `
		INSERT INTO users 
		(phone, password_hash, full_name, district, area, sub_area)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := db.ExecContext(context.Background(), query,
		user.Phone, user.PasswordHash,
		user.FullName, user.District, user.Area, user.SubArea,
	)
	return err
}
