package services

import (
	"errors"
	"fields-api/clients"
	"fields-api/domain"
	"fields-api/dto"
	"fields-api/queue"
	"fields-api/repositories"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type BookingService interface {
	CreateBooking(bookingDTO dto.CreateBookingDTO) (*domain.Booking, error)
	GetBookingByID(id string) (*domain.Booking, error)
	GetBookingsByUser(userID uint) ([]domain.Booking, error)
}

type bookingService struct {
	repo      repositories.BookingRepository
	fieldRepo repositories.FieldRepository
}

func NewBookingService(repo repositories.BookingRepository, fieldRepo repositories.FieldRepository) BookingService {
	return &bookingService{
		repo:      repo,
		fieldRepo: fieldRepo,
	}
}

func (s *bookingService) CreateBooking(bookingDTO dto.CreateBookingDTO) (*domain.Booking, error) {
	// Validar que el usuario existe
	_, err := clients.ValidateUser(bookingDTO.UserID)
	if err != nil {
		return nil, errors.New("invalid user: user does not exist")
	}

	// Validar que la cancha existe
	field, err := s.fieldRepo.GetByID(bookingDTO.FieldID)
	if err != nil {
		return nil, errors.New("invalid field: field does not exist")
	}

	if !field.Available {
		return nil, errors.New("field is not available")
	}

	// Parsear fecha
	date, err := time.Parse("2006-01-02", bookingDTO.Date)
	if err != nil {
		return nil, errors.New("invalid date format, use YYYY-MM-DD")
	}

	// Convertir field ID a ObjectID
	fieldObjID, err := primitive.ObjectIDFromHex(bookingDTO.FieldID)
	if err != nil {
		return nil, errors.New("invalid field ID")
	}

	// Calcular precio total (horas * precio por hora)
	// Simplificado: asumimos 2 horas siempre por ahora
	hours := 2.0
	totalPrice := field.PricePerHour * hours

	// Crear reserva
	booking := &domain.Booking{
		FieldID:    fieldObjID,
		UserID:     bookingDTO.UserID,
		Date:       date,
		StartTime:  bookingDTO.StartTime,
		EndTime:    bookingDTO.EndTime,
		TotalPrice: totalPrice,
	}

	err = s.repo.Create(booking)
	if err != nil {
		return nil, errors.New("error creating booking")
	}

	// Publicar evento
	queue.PublishEvent("create", booking.ID.Hex(), "booking")

	return booking, nil
}

func (s *bookingService) GetBookingByID(id string) (*domain.Booking, error) {
	booking, err := s.repo.GetByID(id)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("booking not found")
		}
		return nil, errors.New("error getting booking")
	}
	return booking, nil
}

func (s *bookingService) GetBookingsByUser(userID uint) ([]domain.Booking, error) {
	bookings, err := s.repo.GetByUserID(userID)
	if err != nil {
		return nil, errors.New("error getting bookings")
	}
	return bookings, nil
}
