// Handler for listing responses of a form with pagination and sorting.

package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// GET /forms
func ListResponses(c *fiber.Ctx) error {
	col := c.Locals("responses").(*mongo.Collection)

	formID, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid id"})
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(c.Query("limit", "50"))
	if limit < 1 || limit > 200 {
		limit = 50
	}
	skip := int64((page - 1) * limit)

	filter := bson.M{"formId": formID}
	opts := options.Find().
		SetSort(bson.D{{Key: "submittedAt", Value: -1}}).
		SetSkip(skip).
		SetLimit(int64(limit))

	cur, err := col.Find(c.Context(), filter, opts)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to list responses"})
	}
	var items []bson.M
	if err := cur.All(c.Context(), &items); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to read responses"})
	}

	total, err := col.CountDocuments(c.Context(), filter)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to count responses"})
	}

	return c.JSON(fiber.Map{
		"items": items,
		"page":  page,
		"limit": limit,
		"total": total,
	})
}
