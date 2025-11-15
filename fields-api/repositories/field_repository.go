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

type FieldRepository interface {
	Create(field *domain.Field) error
	GetByID(id string) (*domain.Field, error)
	Update(id string, field *domain.Field) error
	Delete(id string) error
}

type fieldRepository struct {
	collection *mongo.Collection
}

func NewFieldRepository() FieldRepository {
	return &fieldRepository{
		collection: db.GetCollection("fields"),
	}
}

func (r *fieldRepository) Create(field *domain.Field) error {
	field.CreatedAt = time.Now()
	field.UpdatedAt = time.Now()
	field.Available = true

	result, err := r.collection.InsertOne(context.Background(), field)
	if err != nil {
		return err
	}

	field.ID = result.InsertedID.(primitive.ObjectID)
	return nil
}

func (r *fieldRepository) GetByID(id string) (*domain.Field, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var field domain.Field
	err = r.collection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&field)
	if err != nil {
		return nil, err
	}

	return &field, nil
}

func (r *fieldRepository) Update(id string, field *domain.Field) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	field.UpdatedAt = time.Now()

	update := bson.M{"$set": field}
	_, err = r.collection.UpdateOne(context.Background(), bson.M{"_id": objectID}, update)
	return err
}

func (r *fieldRepository) Delete(id string) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	_, err = r.collection.DeleteOne(context.Background(), bson.M{"_id": objectID})
	return err
}
