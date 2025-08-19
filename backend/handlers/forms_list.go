// ListForms returns paginated forms filtered by status, sorted by last update.

package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// returns paginated forms filtered by status, sorted by last update.
func ListForms(c *fiber.Ctx) error {
	col := c.Locals("forms").(*mongo.Collection)

	// query params
	status := c.Query("status", "")
	pageStr := c.Query("page", "1")
	limitStr := c.Query("limit", "20")

	page, _ := strconv.Atoi(pageStr)
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(limitStr)
	if limit < 1 || limit > 100 {
		limit = 20
	}
	skip := int64((page - 1) * limit)

	filter := bson.M{}
	if status != "" {
		filter["status"] = status
	}

	opts := options.Find().
		SetSort(bson.D{{Key: "updatedAt", Value: -1}}).
		SetSkip(skip).
		SetLimit(int64(limit))

	cur, err := col.Find(c.Context(), filter, opts)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to list forms"})
	}
	var out []bson.M
	if err := cur.All(c.Context(), &out); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to read forms"})
	}

	total, err := col.CountDocuments(c.Context(), filter)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to count forms"})
	}

	return c.JSON(fiber.Map{
		"items": out,
		"page":  page,
		"limit": limit,
		"total": total,
	})
}
