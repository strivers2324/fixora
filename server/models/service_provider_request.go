package models

type ServiceProviderRegisterRequest struct {
	User_ID    string `json:"user_id"`
	Phone      string `json:"phone"`
	Profession string `json:"profession"`
	Password   string `json:"password"`
}
