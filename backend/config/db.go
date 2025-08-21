package config

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client

func ConnectMongo() (*mongo.Client, *mongo.Database) {
	uri := os.Getenv("MONGODB_URI")
	if uri == "" {

		uri = os.Getenv("MONGO_URI")
	}
	dbName := os.Getenv("DB_NAME")
	if uri == "" || dbName == "" {
		log.Fatal("Missing required env vars: MONGODB_URI (or MONGO_URI) and DB_NAME")
	}

	clientOpts := options.Client().
		ApplyURI(uri).
		SetServerSelectionTimeout(10 * time.Second).
		SetConnectTimeout(10 * time.Second)

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		log.Fatalf("Mongo connect failed: %v", err)
	}

	pingCtx, pingCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer pingCancel()
	if err := client.Ping(pingCtx, nil); err != nil {
		log.Fatalf("Mongo ping failed: %v", err)
	}

	Client = client
	db := client.Database(dbName)
	log.Println("Connected to MongoDB")
	return client, db
}

func DisconnectMongo(ctx context.Context) {
	if Client != nil {
		_ = Client.Disconnect(ctx)
	}
}
