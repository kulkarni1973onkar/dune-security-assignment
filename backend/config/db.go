// ConnectMongo initializes and validates a MongoDB connection using env vars.

package config

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Client is a shared reference to the Mongo client.
// Useful for disconnecting or reusing across packages.
var Client *mongo.Client

// ConnectMongo establishes a MongoDB connection using env variables.
// Exits early if MONGO_URI or DB_NAME are not set.
func ConnectMongo() (*mongo.Client, *mongo.Database) {
	uri := os.Getenv("MONGO_URI")
	dbName := os.Getenv("DB_NAME")
	if uri == "" || dbName == "" {
		log.Fatal("MONGO_URI or DB_NAME not set")
	}

	// external calls to avoid hanging.
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatal(err)
	}

	//health check to ensure connection is actually alive.
	if err := client.Ping(ctx, nil); err != nil {
		log.Fatalf("Mongo ping failed: %v", err)
	}

	Client = client
	db := client.Database(dbName)
	log.Println("Connected to MongoDB!!!!!!")
	return client, db
}

// ConnectDB is kept as a backward-compatibility shim.
// Can be removed once all callers migrate to ConnectMongo().
func ConnectDB() (*mongo.Client, *mongo.Database) {
	return ConnectMongo()
}
