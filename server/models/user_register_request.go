package models

type UserRegisterRequest struct {
	Phone    string `json:"phone"`
	Password string `json:"password"`
	FullName string `json:"full_name"`
	District string `json:"district"`
	Area     string `json:"area"`
	SubArea  string `json:"sub_area"`
}
