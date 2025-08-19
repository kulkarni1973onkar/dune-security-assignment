// DeleteForm removes a form by ID and cascades delete to its responses.

package handlers

import (
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// DELETE /forms/:id
func DeleteForm(c *fiber.Ctx) error {
	formsCol := c.Locals("forms").(*mongo.Collection)
	responsesCol := c.Locals("responses").(*mongo.Collection)

	oid, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid id"})
	}

	// Delete the form document by _id.
	result, err := formsCol.DeleteOne(c.Context(), bson.M{"_id": oid})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to delete form"})
	}
	if result.DeletedCount == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "form not found"})
	}

	if _, err := responsesCol.DeleteMany(c.Context(), bson.M{"formId": oid}); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "form deleted, but failed to delete responses"})
	}

	// No content returned on success.
	return c.SendStatus(204)
}
