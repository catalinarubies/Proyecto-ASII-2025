package repositories

import (
	"context"
	"fields-api/db"
	"fields-api/domain"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type BookingRepository interface {
	Create(booking *domain.Booking) error
	GetByID(id string) (*domain.Booking, error)
	GetByUserID(userID uint) ([]domain.Booking, error)
}

type bookingRepository struct {
	collection *mongo.Collection
}

func NewBookingRepository() BookingRepository {
	return &bookingRepository{
		collection: db.GetCollection("bookings"),
	}
}

func (r *bookingRepository) Create(booking *domain.Booking) error {
	booking.CreatedAt = time.Now()
	booking.Status = "confirmed"

	result, err := r.collection.InsertOne(context.Background(), booking)
	if err != nil {
		return err
	}

	booking.ID = result.InsertedID.(primitive.ObjectID)
	return nil
}

func (r *bookingRepository) GetByID(id string) (*domain.Booking, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var booking domain.Booking
	err = r.collection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&booking)
	if err != nil {
		return nil, err
	}

	return &booking, nil
}

func (r *bookingRepository) GetByUserID(userID uint) ([]domain.Booking, error) {
	cursor, err := r.collection.Find(context.Background(), bson.M{"user_id": userID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var bookings []domain.Booking
	err = cursor.All(context.Background(), &bookings)
	if err != nil {
		return nil, err
	}

	return bookings, nil
}
