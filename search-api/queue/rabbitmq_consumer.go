package queue

import (
	"encoding/json"
	"log"
	"os"
	"search-api/cache"
	"search-api/clients"
	"search-api/domain"
	"search-api/repositories"

	amqp "github.com/rabbitmq/amqp091-go"
)

type EventMessage struct {
	Operation  string `json:"operation"`   // create, update, delete
	EntityID   string `json:"entity_id"`   // ID de la cancha
	EntityType string `json:"entity_type"` // field, booking
}

type Consumer struct {
	conn           *amqp.Connection
	channel        *amqp.Channel
	solrRepo       repositories.SolrRepository
	localCache     *cache.LocalCache
	memcachedCache *cache.MemcachedCache
}

// NewConsumer crea un nuevo consumidor de RabbitMQ
func NewConsumer(solrRepo repositories.SolrRepository, localCache *cache.LocalCache, memcachedCache *cache.MemcachedCache) *Consumer {
	rabbitURL := os.Getenv("RABBITMQ_URL")
	if rabbitURL == "" {
		log.Fatal("RABBITMQ_URL environment variable not set")
	}

	conn, err := amqp.Dial(rabbitURL)
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}

	channel, err := conn.Channel()
	if err != nil {
		log.Fatalf("Failed to open channel: %v", err)
	}

	log.Println("RabbitMQ consumer initialized")

	return &Consumer{
		conn:           conn,
		channel:        channel,
		solrRepo:       solrRepo,
		localCache:     localCache,
		memcachedCache: memcachedCache,
	}
}

// Start comienza a consumir mensajes de RabbitMQ
func (c *Consumer) Start() {
	// Conectar a la cola "fields_queue"
	msgs, err := c.channel.Consume(
		"fields_queue", // queue name
		"",             // consumer tag
		true,           // auto-ack
		false,          // exclusive
		false,          // no-local
		false,          // no-wait
		nil,            // args
	)
	if err != nil {
		log.Fatalf("Failed to register consumer: %v", err)
	}

	log.Println("Waiting for messages from RabbitMQ...")

	// Procesar mensajes en un goroutine
	go func() {
		for msg := range msgs {
			c.handleMessage(msg.Body)
		}
	}()
}

// handleMessage procesa un mensaje recibido de RabbitMQ
func (c *Consumer) handleMessage(body []byte) {
	var event EventMessage
	err := json.Unmarshal(body, &event)
	if err != nil {
		log.Printf("Error unmarshalling message: %v", err)
		return
	}

	log.Printf("Received event: %s %s %s", event.Operation, event.EntityType, event.EntityID)

	// Solo procesar eventos de tipo "field"
	if event.EntityType != "field" {
		return
	}

	// Limpiar caché porque los datos cambiaron
	c.clearCaches()

	switch event.Operation {
	case "create", "update":
		// Obtener la cancha completa desde fields-api
		field, err := clients.GetFieldByID(event.EntityID)
		if err != nil {
			log.Printf("Error fetching field %s: %v", event.EntityID, err)
			return
		}

		if field == nil {
			log.Printf("Field %s not found, skipping index", event.EntityID)
			return
		}

		// Convertir a FieldSearch
		fieldSearch := &domain.FieldSearch{
			ID:           field.ID,
			Name:         field.Name,
			Sport:        field.Sport,
			Location:     field.Location,
			PricePerHour: field.PricePerHour,
			Image:        field.Image,
			Description:  field.Description,
			Available:    field.Available,
		}

		// Indexar en Solr
		if event.Operation == "create" {
			err = c.solrRepo.Index(fieldSearch)
		} else {
			err = c.solrRepo.Update(fieldSearch)
		}

		if err != nil {
			log.Printf("Error indexing field %s: %v", event.EntityID, err)
		}

	case "delete":
		// Eliminar del índice de Solr
		err = c.solrRepo.Delete(event.EntityID)
		if err != nil {
			log.Printf("Error deleting field %s: %v", event.EntityID, err)
		}
	}
}

// clearCaches limpia ambas cachés cuando hay cambios en los datos
func (c *Consumer) clearCaches() {
	c.localCache.Clear()

	if c.memcachedCache != nil {
		c.memcachedCache.Clear()
	}
}

// Close cierra la conexión a RabbitMQ
func (c *Consumer) Close() {
	if c.channel != nil {
		c.channel.Close()
	}
	if c.conn != nil {
		c.conn.Close()
	}
}
