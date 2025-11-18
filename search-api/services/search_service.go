package services

import (
	"errors"
	"log"
	"search-api/cache"
	"search-api/domain"
	"search-api/repositories"
)

type SearchService interface {
	Search(query *domain.SearchQuery) (*domain.SearchResult, error)
}

type searchService struct {
	solrRepo       repositories.SolrRepository
	localCache     *cache.LocalCache
	memcachedCache *cache.MemcachedCache
}

// NewSearchService crea una nueva instancia del servicio
func NewSearchService(
	solrRepo repositories.SolrRepository,
	localCache *cache.LocalCache,
	memcachedCache *cache.MemcachedCache,
) SearchService {
	return &searchService{
		solrRepo:       solrRepo,
		localCache:     localCache,
		memcachedCache: memcachedCache,
	}
}

// Search realiza una búsqueda con doble capa de caché
// 1. Intenta caché local (CCache) - más rápida
// 2. Si no está, intenta caché distribuida (Memcached)
// 3. Si no está, consulta Solr y guarda en ambas cachés
func (s *searchService) Search(query *domain.SearchQuery) (*domain.SearchResult, error) {
	// Validaciones básicas
	if query.Page < 1 {
		query.Page = 1
	}
	if query.Size < 1 || query.Size > 100 {
		query.Size = 10
	}

	// Generar clave de caché
	cacheKey := cache.GenerateKey(query)

	// 1. Intentar caché local
	if result, found := s.localCache.Get(cacheKey); found {
		return result, nil
	}

	// 2. Intentar caché distribuida
	if s.memcachedCache != nil {
		if result, found := s.memcachedCache.Get(cacheKey); found {
			// Guardar en caché local para próxima vez
			s.localCache.Set(cacheKey, result)
			return result, nil
		}
	}

	// 3. Consultar Solr
	log.Printf("Cache MISS: Querying Solr for: %+v", query)
	result, err := s.solrRepo.Search(query)
	if err != nil {
		return nil, errors.New("error searching in Solr")
	}

	// Guardar en ambas cachés
	s.localCache.Set(cacheKey, result)
	if s.memcachedCache != nil {
		s.memcachedCache.Set(cacheKey, result)
	}

	return result, nil
}
