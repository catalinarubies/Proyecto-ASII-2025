package dto

type CreateBookingDTO struct {
	FieldID   string `json:"field_id" binding:"required"`
	UserID    uint   `json:"user_id" binding:"required"`
	Date      string `json:"date" binding:"required"`       // "2024-12-25"
	StartTime string `json:"start_time" binding:"required"` // "14:00"
	EndTime   string `json:"end_time" binding:"required"`   // "16:00"
}
