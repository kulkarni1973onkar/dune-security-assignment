package main

import (
	"context"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"

	"backend/config"
	"backend/handlers"
)

func main() {
	_ = godotenv.Load() // loads backend/.env in dev

	client, db := config.ConnectMongo()
	defer func() { _ = client.Disconnect(context.Background()) }()

	config.EnsureIndexes(db)

	app := fiber.New()

	// Expose collections to handlers
	app.Use(func(c *fiber.Ctx) error {
		c.Locals("db", db)
		c.Locals("forms", db.Collection("forms"))
		c.Locals("responses", db.Collection("responses"))
		return c.Next()
	})

	app.Get("/healthz", func(c *fiber.Ctx) error { return c.SendString("API is running 🚀") })

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server running on port %s", port)
	log.Fatal(app.Listen(":" + port))

	app.Get("/forms/:id", handlers.GetForm)

}
