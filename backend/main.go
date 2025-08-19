// Application entrypoint: sets up DB, middleware, routes, and starts the server.

package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"

	"backend/config"
	"backend/handlers"
	"backend/middleware"
)

func main() {
	_ = godotenv.Load()

	client, db := config.ConnectMongo()
	defer func() { _ = client.Disconnect(context.Background()) }()

	config.EnsureIndexes(db)

	app := fiber.New()
	app.Use(cors.New())

	// Expose collections to handlers
	app.Use(func(c *fiber.Ctx) error {
		c.Locals("db", db)
		c.Locals("forms", db.Collection("forms"))
		c.Locals("responses", db.Collection("responses"))
		return c.Next()
	})

	// Health check
	app.Get("/healthz", func(c *fiber.Ctx) error {
		return c.SendString("API is running")
	})

	app.Get("/readyz", func(c *fiber.Ctx) error {
		ctx, cancel := context.WithTimeout(c.Context(), 2*time.Second)
		defer cancel()
		if err := client.Ping(ctx, nil); err != nil {
			return c.Status(503).JSON(fiber.Map{"status": "not ready"})
		}
		return c.JSON(fiber.Map{"status": "ready"})
	})

	// Public routes
	app.Get("/public/forms/:slug", handlers.GetFormBySlug)
	app.Post("/forms/:id/responses", handlers.SubmitResponse)
	app.Get("/forms/:id/analytics", handlers.FormAnalytics)
	app.Get("/forms/:id/analytics/stream", handlers.StreamAnalytics)
	app.Get("/forms/:id/responses", handlers.ListResponses)

	// Admin routes
	admin := app.Group("/", middleware.APIKey())
	admin.Post("/forms", handlers.CreateForm)
	admin.Get("/forms", handlers.ListForms)
	admin.Get("/forms/:id", handlers.GetForm)
	admin.Patch("/forms/:id", handlers.UpdateForm)
	admin.Delete("/forms/:id", handlers.DeleteForm)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server running on port %s", port)
	log.Fatal(app.Listen(":" + port))
}
