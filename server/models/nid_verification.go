package models

import "mime/multipart"

type NIDStatus string

const (
	PENDING  NIDStatus = "PENDING"
	ACCEPTED NIDStatus = "ACCEPTED"
	REJECTED NIDStatus = "REJECTED"
)

type NIDSubmitRequest struct {
	NIDFront *multipart.FileHeader `form:"nid_front" binding:"required"`
	NIDBack  *multipart.FileHeader `form:"nid_back" binding:"required"`
}

type NIDStatusResponse struct {
	Status NIDStatus `json:"status"`
}
