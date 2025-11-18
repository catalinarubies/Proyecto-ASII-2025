package domain

// FieldSearch representa una cancha indexada en Solr
// Esta estructura debe coincidir con el schema de Solr

type FieldSearch struct {
	ID           string  `json:"id"`             // ObjectID de MongoDB como string
	Name         string  `json:"name"`           // Nombre de la cancha
	Sport        string  `json:"sport"`          // Deporte (Fútbol, Básquet, etc.)
	Location     string  `json:"location"`       // Ubicación
	PricePerHour float64 `json:"price_per_hour"` // Precio por hora
	Image        string  `json:"image"`          // URL de la imagen
	Description  string  `json:"description"`    // Descripción
	Available    bool    `json:"available"`      // Disponibilidad
}

// SearchQuery representa los parámetros de búsqueda

type SearchQuery struct {
	Query    string   // Término de búsqueda (ej: "futbol")
	Sport    string   // Filtro por deporte
	Location string   // Filtro por ubicación
	MinPrice *float64 // Precio mínimo
	MaxPrice *float64 // Precio máximo
	SortBy   string   // Campo para ordenar (price_per_hour, name)
	SortDesc bool     // Orden descendente
	Page     int      // Número de página (empieza en 1)
	Size     int      // Tamaño de página (resultados por página)
}

// SearchResult representa el resultado de una búsqueda

type SearchResult struct {
	Fields     []FieldSearch `json:"fields"`      // Lista de canchas encontradas
	TotalCount int64         `json:"total_count"` // Total de resultados
	Page       int           `json:"page"`        // Página actual
	Size       int           `json:"size"`        // Tamaño de página
	TotalPages int           `json:"total_pages"` // Total de páginas
}
