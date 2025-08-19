package config

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client // optional: keep a reference if you want to disconnect later

// ConnectMongo connects using env vars and returns (client, db).
// Requires backend/.env with MONGO_URI and DB_NAME set.
func ConnectMongo() (*mongo.Client, *mongo.Database) {
	uri := os.Getenv("MONGO_URI")
	dbName := os.Getenv("DB_NAME")
	if uri == "" || dbName == "" {
		log.Fatal("MONGO_URI or DB_NAME not set")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatal(err)
	}
	if err := client.Ping(ctx, nil); err != nil {
		log.Fatalf("Mongo ping failed: %v", err)
	}

	Client = client
	db := client.Database(dbName)
	log.Println("Connected to MongoDB!!!!!!")
	return client, db
}

// Optional shim so older code calling config.ConnectDB still compiles.
func ConnectDB() (*mongo.Client, *mongo.Database) {
	return ConnectMongo()
}
