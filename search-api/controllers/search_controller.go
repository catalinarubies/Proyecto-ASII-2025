package controllers

import (
	"net/http"
	"search-api/cache"
	"search-api/domain"
	"search-api/repositories"
	"search-api/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

var searchService services.SearchService

// InitSearchService inicializa el servicio con sus dependencias
func InitSearchService(localCache *cache.LocalCache, memcachedCache *cache.MemcachedCache) {
	solrRepo := repositories.NewSolrRepository()
	searchService = services.NewSearchService(solrRepo, localCache, memcachedCache)
}

// SearchFields maneja el endpoint GET /search
// Query params:
// - query: término de búsqueda (opcional)
// - sport: filtro por deporte (opcional)
// - location: filtro por ubicación (opcional)
// - min_price: precio mínimo (opcional)
// - max_price: precio máximo (opcional)
// - sort_by: campo para ordenar (opcional: price_per_hour, name)
// - sort_desc: orden descendente (opcional: true/false)
// - page: número de página (default: 1)
// - size: tamaño de página (default: 10)
func SearchFields(c *gin.Context) {
	query := &domain.SearchQuery{
		Query:    c.Query("query"),
		Sport:    c.Query("sport"),
		Location: c.Query("location"),
		SortBy:   c.Query("sort_by"),
		Page:     parseIntWithDefault(c.Query("page"), 1),
		Size:     parseIntWithDefault(c.Query("size"), 10),
	}

	// Parsear sort_desc
	if c.Query("sort_desc") == "true" {
		query.SortDesc = true
	}

	// Parsear min_price
	if minPriceStr := c.Query("min_price"); minPriceStr != "" {
		if minPrice, err := strconv.ParseFloat(minPriceStr, 64); err == nil {
			query.MinPrice = &minPrice
		}
	}

	// Parsear max_price
	if maxPriceStr := c.Query("max_price"); maxPriceStr != "" {
		if maxPrice, err := strconv.ParseFloat(maxPriceStr, 64); err == nil {
			query.MaxPrice = &maxPrice
		}
	}

	// Ejecutar búsqueda
	result, err := searchService.Search(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// parseIntWithDefault convierte un string a int, o retorna el default si falla
func parseIntWithDefault(s string, defaultValue int) int {
	if s == "" {
		return defaultValue
	}
	val, err := strconv.Atoi(s)
	if err != nil {
		return defaultValue
	}
	return val
}
