package cache

import (
	"encoding/json"
	"log"
	"os"
	"search-api/domain"

	"github.com/bradfitz/gomemcache/memcache"
)

// MemcachedCache es la caché distribuida
type MemcachedCache struct {
	client *memcache.Client
}

// NewMemcachedCache crea una nueva instancia de Memcached
func NewMemcachedCache() *MemcachedCache {
	memcachedHost := os.Getenv("MEMCACHED_HOST")
	if memcachedHost == "" {
		log.Println("WARNING: MEMCACHED_HOST not set, using default localhost:11211")
		memcachedHost = "localhost:11211"
	}

	client := memcache.New(memcachedHost)

	// Verificar conexión
	err := client.Ping()
	if err != nil {
		log.Printf("WARNING: Could not connect to Memcached: %v", err)
		return nil
	}

	log.Printf("Connected to Memcached: %s", memcachedHost)
	return &MemcachedCache{
		client: client,
	}
}

// Get obtiene un resultado desde Memcached
func (c *MemcachedCache) Get(key string) (*domain.SearchResult, bool) {
	if c.client == nil {
		return nil, false
	}

	item, err := c.client.Get(key)
	if err != nil {
		// No está en caché (o error de conexión)
		return nil, false
	}

	// Deserializar JSON
	var result domain.SearchResult
	err = json.Unmarshal(item.Value, &result)
	if err != nil {
		log.Printf("Error unmarshalling from Memcached: %v", err)
		return nil, false
	}

	log.Printf("Cache HIT (memcached): %s", key)
	return &result, true
}

// Set guarda un resultado en Memcached
// Expiration: 300 segundos (5 minutos)
func (c *MemcachedCache) Set(key string, result *domain.SearchResult) {
	if c.client == nil {
		return
	}

	// Serializar a JSON
	data, err := json.Marshal(result)
	if err != nil {
		log.Printf("Error marshalling to Memcached: %v", err)
		return
	}

	item := &memcache.Item{
		Key:        key,
		Value:      data,
		Expiration: 300, // 5 minutos
	}

	err = c.client.Set(item)
	if err != nil {
		log.Printf("Error setting Memcached key: %v", err)
		return
	}

	log.Printf("Cache SET (memcached): %s", key)
}

// Delete elimina una entrada de Memcached
func (c *MemcachedCache) Delete(key string) {
	if c.client == nil {
		return
	}

	c.client.Delete(key)
	log.Printf("Cache DELETE (memcached): %s", key)
}

// Clear limpia toda la caché de Memcached
func (c *MemcachedCache) Clear() {
	if c.client == nil {
		return
	}

	err := c.client.FlushAll()
	if err != nil {
		log.Printf("Error flushing Memcached: %v", err)
		return
	}

	log.Println("Memcached cache cleared")
}
