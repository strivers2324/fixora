package models

import "time"

type UserRegisterRequest struct {
	Phone        string    `json:"phone"`
	UUID         string    `json:"uuid"`
	PasswordHash string    `json:"password_hash"`
	FullName     string    `json:"full_name"`
	District     string    `json:"district"`
	Area         string    `json:"area"`
	SubArea      string    `json:"sub_area"`
	CreatedAt    time.Time `json:"created_at"`
}
