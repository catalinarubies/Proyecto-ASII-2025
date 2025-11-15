package queue

import (
	"encoding/json"
	"log"
	"os"

	"github.com/streadway/amqp"
)

var conn *amqp.Connection
var channel *amqp.Channel

const (
	ExchangeName = "fields_events"
	QueueName    = "fields_queue"
)

type EventMessage struct {
	Operation  string `json:"operation"` // create, update, delete
	EntityID   string `json:"entity_id"`
	EntityType string `json:"entity_type"` // field, booking
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

	// Exchange
	err = channel.ExchangeDeclare(
		ExchangeName, // name
		"topic",      // type
		true,         // durable
		false,        // auto-deleted
		false,        // internal
		false,        // no-wait
		nil,          // arguments
	)
	if err != nil {
		log.Fatalf("Failed to declare exchange: %v", err)
	}

	// Queue
	_, err = channel.QueueDeclare(
		QueueName, // name
		true,      // durable
		false,     // delete when unused
		false,     // exclusive
		false,     // no-wait
		nil,       // arguments
	)
	if err != nil {
		log.Fatalf("Failed to declare queue: %v", err)
	}

	// Bind queue to exchange
	err = channel.QueueBind(
		QueueName,    // queue name
		"fields.*",   // routing key
		ExchangeName, // exchange
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Failed to bind queue: %v", err)
	}

	log.Println("RabbitMQ initialized successfully")
}

func PublishEvent(operation, entityID, entityType string) error {
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
		ExchangeName,         // exchange
		"fields."+entityType, // routing key
		false,                // mandatory
		false,                // immediate
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
