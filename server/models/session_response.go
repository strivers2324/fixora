package models

type SessionResponse struct {
	Phone           string `json:"phone"`
	Role            string `json:"role"`
	IsPhoneVerified bool   `json:"is_phone_verified"`
	Profession      string `json:"profession,omitempty"`
	OtpID           string `json:"otp_id,omitempty"`
}
