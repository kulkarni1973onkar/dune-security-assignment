// Handlers for creating a new form and retrieving a form by ID.

package handlers

import (
	"errors"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"backend/models"
)

// POST /forms
func CreateForm(c *fiber.Ctx) error {
	col := c.Locals("forms").(*mongo.Collection)

	var body models.Form
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}

	// validation
	if body.Title == "" || len(body.Fields) == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "title and at least one field are required"})
	}
	for _, f := range body.Fields {
		if f.ID == "" || f.Type == "" || f.Label == "" {
			return c.Status(400).JSON(fiber.Map{"error": "each field requires id, type, label"})
		}
		if (f.Type == "mc" || f.Type == "checkbox") && len(f.Options) == 0 {
			return c.Status(400).JSON(fiber.Map{"error": "mc/checkbox require options"})
		}
		if f.Type == "rating" && (f.Min == nil || f.Max == nil || *f.Min >= *f.Max) {
			return c.Status(400).JSON(fiber.Map{"error": "rating needs valid min/max"})
		}
	}

	// field IDs
	seen := make(map[string]struct{}, len(body.Fields))
	for _, f := range body.Fields {
		if _, dup := seen[f.ID]; dup {
			return c.Status(400).JSON(fiber.Map{"error": "duplicate field id: " + f.ID})
		}
		seen[f.ID] = struct{}{}
	}

	now := time.Now()
	if body.Slug == "" {
		body.Slug = primitive.NewObjectID().Hex()[:8]
	}
	body.Status = "draft"
	body.CreatedAt = now
	body.UpdatedAt = now

	res, err := col.InsertOne(c.Context(), body)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to save form"})
	}

	if oid, ok := res.InsertedID.(primitive.ObjectID); ok {
		body.ID = oid
	}
	return c.Status(201).JSON(body)
}

// GET /forms/:id
func GetForm(c *fiber.Ctx) error {
	col := c.Locals("forms").(*mongo.Collection)

	oid, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid id"})
	}

	var form models.Form
	if err := col.FindOne(c.Context(), bson.M{"_id": oid}).Decode(&form); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return c.Status(404).JSON(fiber.Map{"error": "form not found"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "failed to fetch form"})
	}

	return c.JSON(form)
}
