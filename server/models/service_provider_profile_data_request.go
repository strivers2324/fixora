package models

type ServiceProviderProfileDataRequest struct {
	Name           string `json:"name" binding:"required"`
	Email          string `json:"email"`
	District       string `json:"district" binding:"required"`
	Area           string `json:"area" binding:"required"`
	SubArea        string `json:"sub_area" binding:"required"`
	ProfilePicture string `json:"profile_picture"`
}

type ServiceProviderProfileData struct {
	Name           string `json:"name"`
	Email          string `json:"email"`
	District       string `json:"district"`
	Area           string `json:"area"`
	SubArea        string `json:"sub_area"`
	ProfilePicture string `json:"profile_picture"`
}
