package models

type ForgotPasswordRequest struct {
	Phone string `json:"phone" binding:"required"`
	Role  Role   `json:"role" binding:"required,oneof=user service_provider"`
}

type ResetPasswordRequest struct {
	ResetToken  string `json:"reset_token" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}
