package services

import (
	"errors"
	"fields-api/clients"
	"fields-api/domain"
	"fields-api/dto"
	"fields-api/queue"
	"fields-api/repositories"

	"go.mongodb.org/mongo-driver/mongo"
)

type FieldService interface {
	CreateField(fieldDTO dto.CreateFieldDTO) (*domain.Field, error)
	GetFieldByID(id string) (*domain.Field, error)
	UpdateField(id string, fieldDTO dto.UpdateFieldDTO) (*domain.Field, error)
	DeleteField(id string) error
}

type fieldService struct {
	repo repositories.FieldRepository
}

func NewFieldService(repo repositories.FieldRepository) FieldService {
	return &fieldService{repo: repo}
}

func (s *fieldService) CreateField(fieldDTO dto.CreateFieldDTO) (*domain.Field, error) {
	// Validar que el owner (usuario) existe
	_, err := clients.ValidateUser(fieldDTO.OwnerID)
	if err != nil {
		return nil, errors.New("invalid owner: user does not exist")
	}

	// Crear cancha
	field := &domain.Field{
		Name:         fieldDTO.Name,
		Sport:        fieldDTO.Sport,
		Location:     fieldDTO.Location,
		PricePerHour: fieldDTO.PricePerHour,
		Image:        fieldDTO.Image,
		Description:  fieldDTO.Description,
		OwnerID:      fieldDTO.OwnerID,
	}

	err = s.repo.Create(field)
	if err != nil {
		return nil, errors.New("error creating field")
	}

	// Publicar evento a RabbitMQ
	queue.PublishEvent("create", field.ID.Hex(), "field")

	return field, nil
}

func (s *fieldService) GetFieldByID(id string) (*domain.Field, error) {
	field, err := s.repo.GetByID(id)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("field not found")
		}
		return nil, errors.New("error getting field")
	}
	return field, nil
}

func (s *fieldService) UpdateField(id string, fieldDTO dto.UpdateFieldDTO) (*domain.Field, error) {
	// Verificar que la cancha existe
	existingField, err := s.repo.GetByID(id)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("field not found")
		}
		return nil, errors.New("error getting field")
	}

	// Actualizar solo los campos que vienen en el DTO
	if fieldDTO.Name != "" {
		existingField.Name = fieldDTO.Name
	}
	if fieldDTO.Sport != "" {
		existingField.Sport = fieldDTO.Sport
	}
	if fieldDTO.Location != "" {
		existingField.Location = fieldDTO.Location
	}
	if fieldDTO.PricePerHour > 0 {
		existingField.PricePerHour = fieldDTO.PricePerHour
	}
	if fieldDTO.Image != "" {
		existingField.Image = fieldDTO.Image
	}
	if fieldDTO.Description != "" {
		existingField.Description = fieldDTO.Description
	}
	if fieldDTO.Available != nil {
		existingField.Available = *fieldDTO.Available
	}

	err = s.repo.Update(id, existingField)
	if err != nil {
		return nil, errors.New("error updating field")
	}

	// Publicar evento
	queue.PublishEvent("update", id, "field")

	return existingField, nil
}

func (s *fieldService) DeleteField(id string) error {
	// Verificar que existe
	_, err := s.repo.GetByID(id)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return errors.New("field not found")
		}
		return errors.New("error getting field")
	}

	err = s.repo.Delete(id)
	if err != nil {
		return errors.New("error deleting field")
	}

	// Publicar evento
	queue.PublishEvent("delete", id, "field")

	return nil
}
