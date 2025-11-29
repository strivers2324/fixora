package models

import "github.com/golang-jwt/jwt/v5"

type LoginRequest struct {
	Phone    string `json:"phone"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type AppClaims struct {
	Phone string `json:"phone"`
	Role  string `json:"role"`
	jwt.RegisteredClaims
}
