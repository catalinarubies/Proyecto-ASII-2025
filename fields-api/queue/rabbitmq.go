package queue

import (
	"encoding/json"
	"log"
	"os"
	"sync"

	"github.com/streadway/amqp"
)

var (
	conn    *amqp.Connection
	channel *amqp.Channel
	mu      sync.Mutex // Para thread-safety
)

const (
	ExchangeName = "fields_events"
	QueueName    = "fields_queue"
)

type EventMessage struct {
	Operation  string `json:"operation"`
	EntityID   string `json:"entity_id"`
	EntityType string `json:"entity_type"`
}

func InitRabbitMQ() {
	rabbitURL := os.Getenv("RABBITMQ_URL")
	if rabbitURL == "" {
		log.Fatal("RABBITMQ_URL environment variable not set")
	}

	var err error
	conn, err = amqp.Dial(rabbitURL)
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}

	channel, err = conn.Channel()
	if err != nil {
		log.Fatalf("Failed to open a channel: %v", err)
	}

	// Declarar exchange
	err = channel.ExchangeDeclare(
		ExchangeName,
		"topic",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Failed to declare exchange: %v", err)
	}

	// Declarar queue
	_, err = channel.QueueDeclare(
		QueueName,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Failed to declare queue: %v", err)
	}

	// Bind queue to exchange
	err = channel.QueueBind(
		QueueName,
		"fields.*",
		ExchangeName,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Failed to bind queue: %v", err)
	}

	log.Println("RabbitMQ initialized successfully")
}

func PublishEvent(operation, entityID, entityType string) error {
	mu.Lock()
	defer mu.Unlock()

	// Verificar si la conexión está cerrada y reconectar
	if conn == nil || conn.IsClosed() {
		log.Println("RabbitMQ connection closed, reconnecting...")
		InitRabbitMQ()
	}

	message := EventMessage{
		Operation:  operation,
		EntityID:   entityID,
		EntityType: entityType,
	}

	body, err := json.Marshal(message)
	if err != nil {
		return err
	}

	err = channel.Publish(
		ExchangeName,
		"fields."+entityType,
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		},
	)

	if err != nil {
		log.Printf("Failed to publish message: %v", err)
		return err
	}

	log.Printf("Published event: %s %s %s", operation, entityType, entityID)
	return nil
}

func CloseRabbitMQ() {
	if channel != nil {
		channel.Close()
	}
	if conn != nil {
		conn.Close()
	}
}
