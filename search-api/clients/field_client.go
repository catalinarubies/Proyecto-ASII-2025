package clients

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

// FieldResponse representa la respuesta de fields-api al obtener una cancha
type FieldResponse struct {
	ID           string  `json:"id"`
	Name         string  `json:"name"`
	Sport        string  `json:"sport"`
	Location     string  `json:"location"`
	PricePerHour float64 `json:"price_per_hour"`
	Image        string  `json:"image"`
	Description  string  `json:"description"`
	Available    bool    `json:"available"`
}

// Cliente HTTP reutilizable con timeout
var httpClient = &http.Client{
	Timeout: 10 * time.Second,
}

// GetFieldByID obtiene una cancha completa desde fields-api
// Se usa para sincronizar datos completos cuando llega un evento de RabbitMQ
func GetFieldByID(fieldID string) (*FieldResponse, error) {
	fieldsAPIURL := os.Getenv("FIELDS_API_URL")
	if fieldsAPIURL == "" {
		return nil, fmt.Errorf("FIELDS_API_URL not configured")
	}

	url := fmt.Sprintf("%s/fields/%s", fieldsAPIURL, fieldID)

	resp, err := httpClient.Get(url)
	if err != nil {
		return nil, fmt.Errorf("error calling fields API: %v", err)
	}
	defer resp.Body.Close()

	// Si la cancha no existe (404), retornar nil sin error
	// Esto puede pasar si se eliminó entre el evento y la consulta
	if resp.StatusCode == 404 {
		return nil, nil
	}

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("fields API returned status %d: %s", resp.StatusCode, string(body))
	}

	var field FieldResponse
	err = json.NewDecoder(resp.Body).Decode(&field)
	if err != nil {
		return nil, fmt.Errorf("error decoding field response: %v", err)
	}

	return &field, nil
}