package models

import "time"

type ServiceProviderRegisterRequest struct {
	Phone        string    `json:"phone"`
	UUID         string    `json:"uuid"`
	Profession   string    `json:"profession"`
	PasswordHash string    `json:"password_hash"`
	FullName     string    `json:"full_name"`
	District     string    `json:"district"`
	Area         string    `json:"area"`
	SubArea      string    `json:"sub_area"`
	NidNumber    string    `json:"nid_number"`
	NidFrontUrl  string    `json:"nid_front_url"`
	NidBackUrl   string    `json:"nid_back_url"`
	CreatedAt    time.Time `json:"created_at"`
}
