package models

type ServiceProviderRegisterRequest struct {
	UserID     string `json:"user_id"`
	Phone      string `json:"phone"`
	Profession string `json:"profession"`
	Password   string `json:"password"`
}
