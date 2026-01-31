package models

type UserRegisterRequest struct {
	Phone    string `json:"phone"`
	Password string `json:"password"`
}
