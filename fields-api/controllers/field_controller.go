package controllers

import (
	"fields-api/dto"
	"fields-api/repositories"
	"fields-api/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

var fieldService services.FieldService

func getFieldService() services.FieldService {
	if fieldService == nil {
		repo := repositories.NewFieldRepository()
		fieldService = services.NewFieldService(repo)
	}
	return fieldService
}

func CreateField(c *gin.Context) {
	var fieldDTO dto.CreateFieldDTO

	if err := c.ShouldBindJSON(&fieldDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	field, err := getFieldService().CreateField(fieldDTO)
	if err != nil {
		if err.Error() == "invalid owner: user does not exist" {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, field)
}

func GetFieldByID(c *gin.Context) {
	id := c.Param("id")

	field, err := getFieldService().GetFieldByID(id)
	if err != nil {
		if err.Error() == "field not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, field)
}

func UpdateField(c *gin.Context) {
	id := c.Param("id")
	var fieldDTO dto.UpdateFieldDTO

	if err := c.ShouldBindJSON(&fieldDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	field, err := getFieldService().UpdateField(id, fieldDTO)
	if err != nil {
		if err.Error() == "field not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, field)
}

func DeleteField(c *gin.Context) {
	id := c.Param("id")

	err := getFieldService().DeleteField(id)
	if err != nil {
		if err.Error() == "field not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "field deleted successfully"})
}
