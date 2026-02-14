package apperrors

import (
	"errors"
	"net/http"
)

var (
	ErrPhoneExists = NewCustomError(http.StatusConflict, "Phone number already registered. Please login.", "PHONE_EXISTS")

	ErrInvalidCredentials = NewCustomError(http.StatusUnauthorized, "Invalid phone or password.", "INVALID_CREDENTIALS")
	ErrUserNotFound       = NewCustomError(http.StatusNotFound, "Account not found. Please register first.", "USER_NOT_FOUND")
	ErrNotVerified        = NewCustomError(http.StatusForbidden, "Account not verified. Please verify OTP.", "NOT_VERIFIED")

	ErrUnauthorized = NewCustomError(http.StatusUnauthorized, "Unauthorized access. Please login.", "UNAUTHORIZED")
	ErrTokenExpired = NewCustomError(http.StatusUnauthorized, "Session expired. Please login again.", "TOKEN_EXPIRED")
	ErrInvalidToken = NewCustomError(http.StatusUnauthorized, "Invalid session. Please login again.", "INVALID_TOKEN")

	ErrInvalidOTP = NewCustomError(http.StatusBadRequest, "Invalid OTP. Please resend a new code.", "INVALID_OTP")

	ErrInternalServer = NewCustomError(http.StatusInternalServerError, "Something went wrong. Please contact support.", "INTERNAL_ERROR")
)

type AppError struct {
	StatusCode int    `json:"-"`
	Message    string `json:"error"`
	Code       string `json:"code"`
}

func (e *AppError) Error() string {
	return e.Message
}

func NewCustomError(statusCode int, message, code string) *AppError {
	return &AppError{
		StatusCode: statusCode,
		Message:    message,
		Code:       code,
	}
}

func ToAppError(err error) *AppError {
	var appErr *AppError
	if errors.As(err, &appErr) {
		return appErr
	}
	return ErrInternalServer
}
