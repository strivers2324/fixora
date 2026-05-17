package models

type ChangePhoneNumberRequest struct {
	NewPhone string `json:"new_phone" binding:"required"`
}

type VerifyAndUpdatePhoneRequest struct {
	OtpID    string `json:"otp_id" binding:"required"`
	OtpCode  string `json:"otp_code" binding:"required"`
	NewPhone string `json:"new_phone" binding:"required"`
}
