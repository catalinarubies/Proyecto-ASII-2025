package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Booking struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	FieldID    primitive.ObjectID `bson:"field_id" json:"field_id"`
	UserID     uint               `bson:"user_id" json:"user_id"`
	Date       time.Time          `bson:"date" json:"date"`
	StartTime  string             `bson:"start_time" json:"start_time"` // "14:00"
	EndTime    string             `bson:"end_time" json:"end_time"`     // "16:00"
	TotalPrice float64            `bson:"total_price" json:"total_price"`
	Status     string             `bson:"status" json:"status"` // "confirmed", "cancelled"
	CreatedAt  time.Time          `bson:"created_at" json:"created_at"`
}
