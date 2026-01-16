package models

import "github.com/golang-jwt/jwt/v5"

type Role string

const (
	USER             Role = "user"
	SERVICE_PROVIDER Role = "service_provider"
)

type LoginRequest struct {
	Phone    string `json:"phone" binding:"required"`
	Password string `json:"password" binding:"required"`
	Role     Role   `json:"role" binding:"required"`
}

type LoginCredentials struct {
	UserID          string
	PasswordHash    string
	IsPhoneVerified bool
}

type AppClaims struct {
	Role   Role   `json:"role"`
	UserID string `json:"user_id"`
	jwt.RegisteredClaims
}
