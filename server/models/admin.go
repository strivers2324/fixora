package models

import (
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type AdminLoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type AdminLoginData struct {
	AdminID      uuid.UUID `db:"admin_id"`
	PasswordHash string    `db:"password_hash"`
}

type AdminClaims struct {
	Role    string `json:"role"`
	AdminID string `json:"admin_id"`
	jwt.RegisteredClaims
}
