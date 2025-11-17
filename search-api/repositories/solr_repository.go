package repositories

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"search-api/domain"
	"strconv"
	"strings"
	"time"
)

type SolrRepository interface {
	Index(field *domain.FieldSearch) error
	Update(field *domain.FieldSearch) error
	Delete(id string) error
	Search(query *domain.SearchQuery) (*domain.SearchResult, error)
}

type solrRepository struct {
	baseURL string
	client  *http.Client
}

// SolrResponse representa la respuesta de Solr
type SolrResponse struct {
	Response struct {
		NumFound int64                    `json:"numFound"`
		Start    int                      `json:"start"`
		Docs     []map[string]interface{} `json:"docs"`
	} `json:"response"`
}

func NewSolrRepository() SolrRepository {
	solrURL := os.Getenv("SOLR_URL")
	if solrURL == "" {
		log.Fatal("SOLR_URL environment variable not set")
	}

	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	log.Printf("Connected to Solr: %s", solrURL)

	return &solrRepository{
		baseURL: solrURL,
		client:  client,
	}
}

// Index agrega una cancha al índice de Solr
func (r *solrRepository) Index(field *domain.FieldSearch) error {
	doc := map[string]interface{}{
		"id":             field.ID,
		"name":           field.Name,
		"sport":          field.Sport,
		"location":       field.Location,
		"price_per_hour": field.PricePerHour,
		"image":          field.Image,
		"description":    field.Description,
		"available":      field.Available,
	}

	// Crear request body
	body := map[string]interface{}{
		"add": []map[string]interface{}{doc},
	}

	jsonData, err := json.Marshal(body)
	if err != nil {
		return fmt.Errorf("error marshalling document: %v", err)
	}

	// POST al endpoint de update
	url := fmt.Sprintf("%s/update?commit=true", r.baseURL)
	resp, err := r.client.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("error indexing field: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("solr returned status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	log.Printf("Indexed field: %s - %s", field.ID, field.Name)
	return nil
}

// Update actualiza una cancha en el índice
func (r *solrRepository) Update(field *domain.FieldSearch) error {
	// En Solr, actualizar es lo mismo que indexar (sobrescribe el documento)
	return r.Index(field)
}

// Delete elimina una cancha del índice
func (r *solrRepository) Delete(id string) error {
	body := map[string]interface{}{
		"delete": map[string]string{
			"id": id,
		},
	}

	jsonData, err := json.Marshal(body)
	if err != nil {
		return fmt.Errorf("error marshalling delete request: %v", err)
	}

	url := fmt.Sprintf("%s/update?commit=true", r.baseURL)
	resp, err := r.client.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("error deleting field: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("solr returned status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	log.Printf("Deleted field from index: %s", id)
	return nil
}

// Search realiza una búsqueda en Solr con filtros, paginación y ordenamiento
func (r *solrRepository) Search(query *domain.SearchQuery) (*domain.SearchResult, error) {
	// Construir query de Solr (parte lógica, todavía sin encode)
	q := "*:*"
	if query.Query != "" {
		// Buscar en nombre, deporte, ubicación y descripción (con wildcards)
		q = fmt.Sprintf(
			"name:*%[1]s* OR sport:*%[1]s* OR location:*%[1]s* OR description:*%[1]s*",
			query.Query,
		)
	}

	// Filtros
	var filters []string

	if query.Sport != "" {
		filters = append(filters, fmt.Sprintf("sport:\"%s\"", query.Sport))
	}

	if query.Location != "" {
		filters = append(filters, fmt.Sprintf("location:*%s*", query.Location))
	}

	if query.MinPrice != nil {
		filters = append(filters, fmt.Sprintf("price_per_hour:[%f TO *]", *query.MinPrice))
	}

	if query.MaxPrice != nil {
		filters = append(filters, fmt.Sprintf("price_per_hour:[* TO %f]", *query.MaxPrice))
	}

	// Solo mostrar canchas disponibles
	filters = append(filters, "available:true")

	fq := strings.Join(filters, " AND ")

	// Ordenamiento
	sort := ""
	if query.SortBy != "" {
		sortOrder := "asc"
		if query.SortDesc {
			sortOrder = "desc"
		}
		sort = fmt.Sprintf("%s %s", query.SortBy, sortOrder)
	}

	// Paginación
	if query.Page < 1 {
		query.Page = 1
	}
	if query.Size < 1 {
		query.Size = 10
	}

	start := (query.Page - 1) * query.Size

	// Usamos url.Values para encodear bien parámetros
	params := url.Values{}
	params.Set("q", q)
	if fq != "" {
		params.Set("fq", fq)
	}
	params.Set("start", strconv.Itoa(start))
	params.Set("rows", strconv.Itoa(query.Size))
	params.Set("wt", "json")
	if sort != "" {
		params.Set("sort", sort)
	}

	fullURL := fmt.Sprintf("%s/select?%s", r.baseURL, params.Encode())
	log.Printf("Querying Solr with URL: %s", fullURL)

	// Ejecutar búsqueda
	resp, err := r.client.Get(fullURL)
	if err != nil {
		return nil, fmt.Errorf("error searching in Solr: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("solr returned status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	// Parsear respuesta
	var solrResp SolrResponse
	err = json.NewDecoder(resp.Body).Decode(&solrResp)
	if err != nil {
		return nil, fmt.Errorf("error decoding Solr response: %v", err)
	}

	// Convertir documentos a FieldSearch
	fields := make([]domain.FieldSearch, 0)
	for _, doc := range solrResp.Response.Docs {
		field := domain.FieldSearch{
			ID:           getStringValue(doc, "id"),
			Name:         getStringValue(doc, "name"),
			Sport:        getStringValue(doc, "sport"),
			Location:     getStringValue(doc, "location"),
			PricePerHour: getFloatValue(doc, "price_per_hour"),
			Image:        getStringValue(doc, "image"),
			Description:  getStringValue(doc, "description"),
			Available:    getBoolValue(doc, "available"),
		}
		fields = append(fields, field)
	}

	// Calcular total de páginas
	totalPages := int(solrResp.Response.NumFound) / query.Size
	if int(solrResp.Response.NumFound)%query.Size > 0 {
		totalPages++
	}

	result := &domain.SearchResult{
		Fields:     fields,
		TotalCount: solrResp.Response.NumFound,
		Page:       query.Page,
		Size:       query.Size,
		TotalPages: totalPages,
	}

	return result, nil
}

// Funciones auxiliares para extraer valores de los documentos de Solr
func getStringValue(doc map[string]interface{}, key string) string {
	if val, ok := doc[key]; ok {
		if strVal, ok := val.(string); ok {
			return strVal
		}
	}
	return ""
}

func getFloatValue(doc map[string]interface{}, key string) float64 {
	if val, ok := doc[key]; ok {
		switch v := val.(type) {
		case float64:
			return v
		case float32:
			return float64(v)
		case int:
			return float64(v)
		}
	}
	return 0
}

func getBoolValue(doc map[string]interface{}, key string) bool {
	if val, ok := doc[key]; ok {
		if boolVal, ok := val.(bool); ok {
			return boolVal
		}
	}
	return false
}
