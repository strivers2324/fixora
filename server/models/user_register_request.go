package models

type UserRegisterRequest struct {
	UserID   string `json:"user_id"`
	Phone    string `json:"phone"`
	Password string `json:"password"`
}
