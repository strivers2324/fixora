package models

type UserAddressRequest struct {
	FullName    string  `json:"full_name" binding:"required"`
	PhoneNumber string  `json:"phone_number" binding:"required"`
	District    string  `json:"district" binding:"required"`
	Thana       string  `json:"thana" binding:"required"`
	Area        string  `json:"area" binding:"required"`
	Address     string  `json:"address" binding:"required"`
	IsDefault   bool    `json:"is_default"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
}

type UserAddressResponse struct {
	AddressID   int     `json:"address_id"`
	FullName    string  `json:"full_name"`
	PhoneNumber string  `json:"phone_number"`
	District    string  `json:"district"`
	Thana       string  `json:"thana"`
	Area        string  `json:"area"`
	Address     string  `json:"address"`
	IsDefault   bool    `json:"is_default"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
}

type SPAddressRequest struct {
	District  string  `json:"district" binding:"required"`
	Thana     string  `json:"thana" binding:"required"`
	Area      string  `json:"area" binding:"required"`
	Address   string  `json:"address" binding:"required"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type SPAddressResponse struct {
	District  string  `json:"district"`
	Thana     string  `json:"thana"`
	Area      string  `json:"area"`
	Address   string  `json:"address"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}
