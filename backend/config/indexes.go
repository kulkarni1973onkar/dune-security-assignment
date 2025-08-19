package config

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// indexes on startup.
func EnsureIndexes(db *mongo.Database) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	forms := db.Collection("forms")
	responses := db.Collection("responses")

	// forms: ownerId + updatedAt
	if _, err := forms.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "ownerId", Value: 1}, {Key: "updatedAt", Value: -1}},
	}); err != nil {
		log.Printf("index create (forms) failed: %v", err)
	}

	// responses: formId + createdAt
	if _, err := responses.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "formId", Value: 1}, {Key: "createdAt", Value: -1}},
	}); err != nil {
		log.Printf("index create (responses 1) failed: %v", err)
	}

	// responses: formId + answers.fieldId
	if _, err := responses.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "formId", Value: 1}, {Key: "answers.fieldId", Value: 1}},
		Options: options.Index().SetBackground(true),
	}); err != nil {
		log.Printf("index create (responses 2) failed: %v", err)
	}

	log.Println("Indexes ensured")
}
