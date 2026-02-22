package models

type NIDStatus string

const (
	ACCEPTED NIDStatus = "accepted"
	PENDING  NIDStatus = "pending"
	REJECTED NIDStatus = "rejected"
)

type NIDSubmitRequest struct {
	NIDNumber       string `json:"nid_number" binding:"required"`
	StorageFolderID string `json:"storage_folder_id" binding:"required"`
}

type NIDStatusResponse struct {
	Status NIDStatus `json:"status"`
}
