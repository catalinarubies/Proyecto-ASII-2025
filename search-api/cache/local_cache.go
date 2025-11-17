package cache

import (
	"encoding/json"
	"fmt"
	"log"
	"search-api/domain"
	"time"

	"github.com/muesli/cache2go"
)

// LocalCache es la caché en memoria local (CCache)
type LocalCache struct {
	cache *cache2go.CacheTable
}

// NewLocalCache crea una nueva instancia de caché local
func NewLocalCache() *LocalCache {
	// Crear tabla de caché con nombre "search_cache"
	cache := cache2go.Cache("search_cache")
	log.Println("Local cache (CCache) initialized")

	return &LocalCache{
		cache: cache,
	}
}

// Get obtiene un resultado de búsqueda desde la caché
// La clave es un string que representa los parámetros de búsqueda
func (c *LocalCache) Get(key string) (*domain.SearchResult, bool) {
	item, err := c.cache.Value(key)
	if err != nil {
		// No está en caché
		return nil, false
	}

	// Convertir de interface{} a SearchResult
	if result, ok := item.Data().(*domain.SearchResult); ok {
		log.Printf("Cache HIT (local): %s", key)
		return result, true
	}

	return nil, false
}

// Set guarda un resultado de búsqueda en la caché
// TTL (Time To Live): 5 minutos
func (c *LocalCache) Set(key string, result *domain.SearchResult) {
	c.cache.Add(key, 5*time.Minute, result)
	log.Printf("Cache SET (local): %s", key)
}

// Delete elimina una entrada de la caché
func (c *LocalCache) Delete(key string) {
	c.cache.Delete(key)
	log.Printf("Cache DELETE (local): %s", key)
}

// Clear limpia toda la caché
// Se usa cuando hay cambios en los datos (create, update, delete)
func (c *LocalCache) Clear() {
	c.cache.Flush()
	log.Println("Local cache cleared")
}

// GenerateKey genera una clave única basada en los parámetros de búsqueda
func GenerateKey(query *domain.SearchQuery) string {
	// Serializar a JSON para crear una clave única
	data, _ := json.Marshal(query)
	return fmt.Sprintf("search:%s", string(data))
}
