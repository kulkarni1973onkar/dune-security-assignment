// Handler for fetching a published form by slug for public access.

package handlers

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// GET /public/forms/:slug
func GetFormBySlug(c *fiber.Ctx) error {
	col := c.Locals("forms").(*mongo.Collection)
	slug := c.Params("slug")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Return a "public-safe" view of the form (no admin metadata)
	var form struct {
		Title  string      `bson:"title" json:"title"`
		Fields interface{} `bson:"fields" json:"fields"`
		Slug   string      `bson:"slug" json:"slug"`
		Status string      `bson:"status" json:"status"`
	}

	if err := col.FindOne(ctx, bson.M{"slug": slug, "status": "published"}).Decode(&form); err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "form not found or unpublished"})
	}

	return c.JSON(form)
}
