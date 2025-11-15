package dto

type CreateFieldDTO struct {
	Name         string  `json:"name" binding:"required"`
	Sport        string  `json:"sport" binding:"required"`
	Location     string  `json:"location" binding:"required"`
	PricePerHour float64 `json:"price_per_hour" binding:"required,gt=0"`
	Image        string  `json:"image"`
	Description  string  `json:"description"`
	OwnerID      uint    `json:"owner_id" binding:"required"`
}

type UpdateFieldDTO struct {
	Name         string  `json:"name"`
	Sport        string  `json:"sport"`
	Location     string  `json:"location"`
	PricePerHour float64 `json:"price_per_hour" binding:"omitempty,gt=0"`
	Image        string  `json:"image"`
	Description  string  `json:"description"`
	Available    *bool   `json:"available"`
}
