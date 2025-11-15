package main

import (
	"log"
	"os"
	"users-api/controllers"
	"users-api/db"

	"github.com/gin-gonic/gin"
)

func main() {
	// Inicializar conexión a la base de datos
	db.InitDB()

	router := gin.Default()

	// CORS middleware (para que el frontend pueda acceder)
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

	router.POST("/users", controllers.CreateUser)
	router.GET("/users/:id", controllers.GetUserByID)
	router.POST("/login", controllers.Login)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Users API running on port %s", port)
	router.Run(":" + port)
}
