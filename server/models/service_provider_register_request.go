package models

type ServiceProviderRegisterRequest struct {
	Phone        string `json:"phone"`
	ProfessionID int    `json:"profession_id"`
	Password     string `json:"password"`
}
