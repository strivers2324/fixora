package models

type ServiceCatalogDataRequest struct {
	MinCharge   float64 `json:"min_charge" binding:"required"`
	Description string  `json:"description"`
	IsActive    bool    `json:"is_active"`
}

type ServiceCatalogData struct {
	MinCharge   float64 `json:"min_charge"`
	Description string  `json:"description"`
	IsActive    bool    `json:"is_active"`
}
