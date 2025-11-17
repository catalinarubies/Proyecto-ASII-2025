package main

import (
	"log"
	"os"
	"search-api/cache"
	"search-api/controllers"
	"search-api/queue"
	"search-api/repositories"

	"github.com/gin-gonic/gin"
)

func main() {
	log.Println("Starting search-api...")

	// 1. Inicializar caché local (CCache)
	localCache := cache.NewLocalCache()

	// 2. Inicializar caché distribuida (Memcached)
	memcachedCache := cache.NewMemcachedCache()

	// 3. Inicializar servicio de búsqueda
	controllers.InitSearchService(localCache, memcachedCache)

	// 4. Inicializar repositorio de Solr
	solrRepo := repositories.NewSolrRepository()

	// 5. Inicializar consumer de RabbitMQ
	consumer := queue.NewConsumer(solrRepo, localCache, memcachedCache)
	consumer.Start()
	defer consumer.Close()

	// 6. Configurar router HTTP
	router := gin.Default()

	// CORS middleware
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

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Endpoint de búsqueda
	router.GET("/search", controllers.SearchFields)

	// Obtener puerto
	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}

	log.Printf("Search API running on port %s", port)
	router.Run(":" + port)
}
