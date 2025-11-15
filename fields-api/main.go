package main

import (
	"fields-api/controllers"
	"fields-api/db"
	"fields-api/queue"
	"log"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	db.InitDB()

	queue.InitRabbitMQ()
	defer queue.CloseRabbitMQ()

	router := gin.Default()

	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
	//Rutas de canchas
	router.POST("/fields", controllers.CreateField)
	router.GET("/fields/:id", controllers.GetFieldByID)
	router.PUT("/fields/:id", controllers.UpdateField)
	router.DELETE("/fields/:id", controllers.DeleteField)

	//Rutas de booking
	router.POST("/bookings", controllers.CreateBooking)
	router.GET("/bookings/:id", controllers.GetBookingByID)
	router.GET("/bookings/user/:userId", controllers.GetBookingsByUser)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	log.Printf("Fields API running on port %s", port)
	router.Run(":" + port)
}
