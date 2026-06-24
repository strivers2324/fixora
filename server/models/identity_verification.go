package models

import "github.com/google/uuid"

type IdentityVerification struct {
	ProviderID uuid.UUID `json:"provider_id" db:"provider_id"`
	Name       string    `json:"name" db:"name"`
	FrontImage string    `json:"front_image"`
	BackImage  string    `json:"back_image"`
	Status     NIDStatus `json:"status" db:"nid_status"`
}
