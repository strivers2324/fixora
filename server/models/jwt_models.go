package models

import "github.com/golang-jwt/jwt/v5"

type Role string

const (
	USER             Role = "user"
	SERVICE_PROVIDER Role = "service_provider"
)

type LoginRequest struct {
	Phone    string `json:"phone"`
	Password string `json:"password"`
	Role     Role   `json:"role"`
}

type AppClaims struct {
	Phone string `json:"phone"`
	Role  Role   `json:"role"`
	jwt.RegisteredClaims
}
