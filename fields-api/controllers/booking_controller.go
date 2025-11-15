package controllers

import (
	"fields-api/dto"
	"fields-api/repositories"
	"fields-api/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

var bookingService services.BookingService

func getBookingService() services.BookingService {
	if bookingService == nil {
		bookingRepo := repositories.NewBookingRepository()
		fieldRepo := repositories.NewFieldRepository()
		bookingService = services.NewBookingService(bookingRepo, fieldRepo)
	}
	return bookingService
}

func CreateBooking(c *gin.Context) {
	var bookingDTO dto.CreateBookingDTO

	if err := c.ShouldBindJSON(&bookingDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	booking, err := getBookingService().CreateBooking(bookingDTO)
	if err != nil {
		if err.Error() == "invalid user: user does not exist" ||
			err.Error() == "invalid field: field does not exist" ||
			err.Error() == "field is not available" {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, booking)
}

func GetBookingByID(c *gin.Context) {
	id := c.Param("id")

	booking, err := getBookingService().GetBookingByID(id)
	if err != nil {
		if err.Error() == "booking not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, booking)
}

func GetBookingsByUser(c *gin.Context) {
	userIDParam := c.Param("userId")
	userID, err := strconv.ParseUint(userIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	bookings, err := getBookingService().GetBookingsByUser(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, bookings)
}
