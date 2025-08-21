// Handler for updating form details, fields, and status with validation.

package handlers

import (
	"errors"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/kulkarni1973onkar/dune-security-assignment/backend/models"
)

// PATCH /forms/:id
func UpdateForm(c *fiber.Ctx) error {
	col := c.Locals("forms").(*mongo.Collection)

	oid, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid id"})
	}

	var body struct {
		Title  *string         `json:"title"`
		Fields *[]models.Field `json:"fields"`
		Status *string         `json:"status"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}

	update := bson.M{}
	set := bson.M{"updatedAt": time.Now()}

	if body.Title != nil {
		if *body.Title == "" {
			return c.Status(400).JSON(fiber.Map{"error": "title cannot be empty"})
		}
		set["title"] = *body.Title
	}
	if body.Fields != nil {
		if len(*body.Fields) == 0 {
			return c.Status(400).JSON(fiber.Map{"error": "fields cannot be empty"})
		}

		//field IDs
		seen := make(map[string]struct{}, len(*body.Fields))
		for _, f := range *body.Fields {
			if _, dup := seen[f.ID]; dup {
				return c.Status(400).JSON(fiber.Map{"error": "duplicate field id: " + f.ID})
			}
			seen[f.ID] = struct{}{}
		}

		// validation
		for _, f := range *body.Fields {
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
		set["fields"] = *body.Fields
	}
	if body.Status != nil {
		if *body.Status != "draft" && *body.Status != "published" {
			return c.Status(400).JSON(fiber.Map{"error": "invalid status"})
		}
		set["status"] = *body.Status
	}

	if len(set) == 1 {
		return c.Status(400).JSON(fiber.Map{"error": "no updatable fields provided"})
	}

	update["$set"] = set

	res := col.FindOneAndUpdate(
		c.Context(),
		bson.M{"_id": oid},
		update,
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	)

	var out models.Form
	if err := res.Decode(&out); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return c.Status(404).JSON(fiber.Map{"error": "form not found"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "failed to update form"})
	}

	return c.JSON(out)
}
