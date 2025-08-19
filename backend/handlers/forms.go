package handlers

import (
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"backend/models"
)

// helper: field validation
func validateFields(fields []models.Field) error {
	if len(fields) == 0 {
		return fiber.NewError(400, "at least one field is required")
	}
	for _, f := range fields {
		if f.ID == "" || f.Type == "" || f.Label == "" {
			return fiber.NewError(400, "each field needs id, type, and label")
		}
		if f.Type == "mc" || f.Type == "checkbox" {
			if len(f.Options) == 0 {
				return fiber.NewError(400, "mc/checkbox require options")
			}
		}
		if f.Type == "rating" {
			if f.Min == nil || f.Max == nil || *f.Min >= *f.Max {
				return fiber.NewError(400, "rating needs valid min/max")
			}
		}
	}
	return nil
}

func GetForm(c *fiber.Ctx) error {
	id := c.Params("id")
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid id"})
	}

	forms := c.Locals("forms").(*mongo.Collection)

	var doc bson.M
	if err := forms.FindOne(c.Context(), bson.M{"_id": oid}).Decode(&doc); err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	return c.JSON(doc)
}
