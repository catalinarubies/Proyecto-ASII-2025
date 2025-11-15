package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Field struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name         string             `bson:"name" json:"name"`
	Sport        string             `bson:"sport" json:"sport"`
	Location     string             `bson:"location" json:"location"`
	PricePerHour float64            `bson:"price_per_hour" json:"price_per_hour"`
	Image        string             `bson:"image" json:"image"`
	Description  string             `bson:"description" json:"description"`
	OwnerID      uint               `bson:"owner_id" json:"owner_id"`
	Available    bool               `bson:"available" json:"available"`
	CreatedAt    time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt    time.Time          `bson:"updated_at" json:"updated_at"`
}
