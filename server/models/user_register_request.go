package models

type UserRegisterRequest struct {
	User_ID  string `json:"user_id"`
	Phone    string `json:"phone"`
	Password string `json:"password"`
}
