package models

import "github.com/golang-jwt/jwt/v5"

type AppClaims struct {
	Role   Role   `json:"role"`
	UserID string `json:"user_id"`
	jwt.RegisteredClaims
}

type ResetPasswordClaims struct {
	OtpID string `json:"otp_id"`
	Type  string `json:"type"`
	jwt.RegisteredClaims
}
