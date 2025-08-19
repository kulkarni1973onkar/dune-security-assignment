// EnsureIndexes defines and creates MongoDB indexes needed for common queries.

package config

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// EnsureIndexes declares the query patterns we care about and creates matching indexes.
// Called once on startup from main.go. Non-fatal on failure: logs and continues.
func EnsureIndexes(db *mongo.Database) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	forms := db.Collection("forms")
	responses := db.Collection("responses")

	//----------------------forms indexes------------------------------------

	// Dashboard listing: filter by ownerId, sort by updatedAt (recent first).
	// Order matters: compound index matches the query shape (ownerId equality, then -updatedAt sort).
	if _, err := forms.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{
			{Key: "ownerId", Value: 1},
			{Key: "updatedAt", Value: -1},
		},
	}); err != nil {
		log.Printf("index create (forms ownerId+updatedAt) failed: %v", err)
	}

	// Unique slug for public/shareable links.
	// Sparse ensures uniqueness only when slug exists (allows null/absent).
	if _, err := forms.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "slug", Value: 1}},
		Options: options.Index().SetUnique(true).SetSparse(true),
	}); err != nil {
		log.Printf("index create (forms slug) failed: %v", err)
	}

	//----------------------------responses indexes---------------------------------

	// Analytics + fetch latest responses per form: formId equality + submittedAt desc.
	if _, err := responses.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{
			{Key: "formId", Value: 1},
			{Key: "submittedAt", Value: -1},
		},
	}); err != nil {
		log.Printf("index create (responses formId+submittedAt) failed: %v", err)
	}

	// Wildcard index on answers.* for flexible filtering; monitor size/perf impact.
	if _, err := responses.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "answers.$**", Value: 1}},
		Options: options.Index().SetBackground(true),
	}); err != nil {
		log.Printf("index create (responses answers wildcard) failed: %v", err)
	}

	log.Println("Indexes ensured")
}
