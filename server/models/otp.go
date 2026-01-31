package models

import (
	"time"

	"github.com/google/uuid"
)

type OTP struct {
	ID        uuid.UUID `json:"id" db:"id"`
	EntityID  uuid.UUID `json:"entity_id" db:"entity_id"`
	Role      Role      `json:"role" db:"role"`
	OTPToken  string    `json:"-" db:"otp_token"`
	ExpiresAt time.Time `json:"expires_at" db:"expires_at"`
}

type OTPAttempt struct {
	EntityID      uuid.UUID `db:"entity_id"`
	Count         int       `db:"count"`
	LastAttemptAt time.Time `db:"last_attempt_at"`
}

type OTPVerifyRequest struct {
	OtpID   string `json:"otp_id" binding:"required"`
	OtpCode string `json:"otp_code" binding:"required"`
}

type ResendOTPRequest struct {
	OtpID string `json:"otp_id" binding:"required"`
}

type UpdatePhoneRequest struct {
	OtpID    string `json:"otp_id" binding:"required"`
	NewPhone string `json:"new_phone" binding:"required,min=11,max=14"`
}
