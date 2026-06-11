package apperrors

import (
	"errors"
	"net/http"
)

var (
	ErrPhoneExists = NewCustomError(http.StatusConflict, "Phone number already registered. Please login.", "PHONE_EXISTS")

	ErrInvalidCredentials = NewCustomError(http.StatusUnauthorized, "Invalid phone or password.", "INVALID_CREDENTIALS")
	ErrInvalidOldPassword = NewCustomError(http.StatusBadRequest, "Incorrect old password", "INVALID_PASSWORD")
	ErrUserNotFound       = NewCustomError(http.StatusNotFound, "Account not found. Please register first.", "USER_NOT_FOUND")
	ErrNotVerified        = NewCustomError(http.StatusForbidden, "Account not verified. Please verify OTP.", "NOT_VERIFIED")

	ErrUnauthorized = NewCustomError(http.StatusUnauthorized, "Unauthorized access. Please login.", "UNAUTHORIZED")
	ErrTokenExpired = NewCustomError(http.StatusUnauthorized, "Session expired. Please login again.", "TOKEN_EXPIRED")
	ErrInvalidToken = NewCustomError(http.StatusUnauthorized, "Invalid session. Please login again.", "INVALID_TOKEN")

	ErrInvalidOTP = NewCustomError(http.StatusBadRequest, "Invalid or Expired OTP.", "INVALID_OTP")

	ErrInternalServer = NewCustomError(http.StatusInternalServerError, "Something went wrong. Please contact support.", "INTERNAL_ERROR")

	ErrFileTooLarge = NewCustomError(http.StatusBadRequest, "File too large (Max 500KB).", "FILE_TOO_LARGE")
	ErrUploadFailed = NewCustomError(http.StatusInternalServerError, "File upload failed. Try again.", "UPLOAD_FAILED")

	ErrUserExists     = NewCustomError(http.StatusConflict, "Phone number is already in use by another user", "USER_ALREADY_EXISTS")
	ErrProviderExists = NewCustomError(http.StatusConflict, "Phone number is already in use by another provider", "PROVIDER_ALREADY_EXISTS")

	ErrProfileMissing    = NewCustomError(http.StatusBadRequest, "Please complete your profile first before updating the service catalog.", "PROFILE_INCOMPLETE")
	ErrProfileIncomplete = NewCustomError(http.StatusBadRequest, "Your profile is incomplete. Please fill out all, before updating your service catalog.", "PROFILE_INCOMPLETE")

	ErrAlreadyRequested = NewCustomError(http.StatusConflict, "Request already sent to this provider for this job.", "ALREADY_REQUESTED")
	ErrOfferPriceTooLow = NewCustomError(http.StatusBadRequest, "Offering price cannot be less than provider's minimum charge.", "OFFER_PRICE_TOO_LOW")

	ErrCannotDeleteDefaultAddress = NewCustomError(http.StatusBadRequest, "Cannot delete the default address. Please set another address as default first.", "BAD_REQUEST")
	ErrInvalidUserOffer           = NewCustomError(http.StatusBadRequest, "You cannot offer less than the user's current offer", "INVALID_OFFER")
	ErrInvalidProviderOffer       = NewCustomError(http.StatusBadRequest, "You cannot increase your previous offer price", "INVALID_OFFER")
	ErrInvalidOffer               = NewCustomError(http.StatusBadRequest, "You do not need to offer more than the provider's asking price", "INVALID_OFFER")
	ErrCannotDecreaseOffer        = NewCustomError(http.StatusBadRequest, "You cannot decrease your offer", "INVALID_OFFER")
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
