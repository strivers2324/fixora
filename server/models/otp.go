package models

import (
	"time"

	"github.com/google/uuid"
)

type Type string

const (
	REGISTER       Type = "REGISTER"
	RESET_PASSWORD Type = "RESET_PASSWORD"
	CHANGE_PHONE   Type = "CHANGE_PHONE"
)

type OTP struct {
	ID        uuid.UUID `json:"id" db:"id"`
	EntityID  uuid.UUID `json:"entity_id" db:"entity_id"`
	Role      Role      `json:"role" db:"role"`
	Type      Type      `json:"purpose" db:"purpose"`
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

type SMSPayload struct {
	APIKey   string `json:"api_key"`
	SenderID string `json:"senderid"`
	Number   string `json:"number"`
	Message  string `json:"message"`
}
