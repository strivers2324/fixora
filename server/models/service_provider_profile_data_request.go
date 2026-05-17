package models

import "mime/multipart"

type ServiceProviderProfileDataRequest struct {
	Name           string                `form:"name" binding:"required"`
	Email          string                `form:"email"`
	ProfilePicture *multipart.FileHeader `form:"profile_picture"`
}

type ServiceProviderProfileData struct {
	Name           string `json:"name"`
	Email          string `json:"email"`
	ProfilePicture string `json:"profile_picture"`
}
