package models

import "github.com/google/uuid"

type Role string

const (
	USER             Role = "USER"
	SERVICE_PROVIDER Role = "SERVICE_PROVIDER"
)

type LoginRequest struct {
	Phone    string `json:"phone" binding:"required"`
	Password string `json:"password" binding:"required"`
	Role     Role   `json:"role" binding:"required"`
}

type UserLoginData struct {
	UserID          uuid.UUID `db:"user_id"`
	PasswordHash    string    `db:"password_hash"`
	IsPhoneVerified bool      `db:"is_phone_verified"`
}

type ServiceProviderLoginData struct {
	ProviderID      uuid.UUID `db:"provider_id"`
	PasswordHash    string    `db:"password_hash"`
	IsPhoneVerified bool      `db:"is_phone_verified"`
	ProfessionName  string    `db:"profession_name"`
}
