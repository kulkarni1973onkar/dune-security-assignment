// FormAnalytics aggregates submission data (counts, ratings, options) for a form.

package handlers

import (
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// FormAnalytics aggregates response data for a given form (counts, ratings, options).
func FormAnalytics(c *fiber.Ctx) error {
	respCol := c.Locals("responses").(*mongo.Collection)

	formID, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid id"})
	}

	// total submissions
	total, err := respCol.CountDocuments(c.Context(), bson.M{"formId": formID})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed counting responses"})
	}

	// Pipeline to compute rating stats (avg, min, max, count) per numeric field.
	ratingPipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"formId": formID}}},
		{{Key: "$project", Value: bson.M{"answers": 1}}},
		{
			{Key: "$project", Value: bson.M{
				"kv": bson.M{
					"$objectToArray": "$answers",
				},
			}},
		},
		{
			{Key: "$unwind", Value: "$kv"},
		},

		{
			{Key: "$match", Value: bson.M{"kv.v": bson.M{"$type": "number"}}},
		},
		{
			{Key: "$group", Value: bson.M{
				"_id":   "$kv.k", // fieldId
				"avg":   bson.M{"$avg": "$kv.v"},
				"min":   bson.M{"$min": "$kv.v"},
				"max":   bson.M{"$max": "$kv.v"},
				"count": bson.M{"$sum": 1},
			}},
		},
	}

	cur, err := respCol.Aggregate(c.Context(), ratingPipeline)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed rating aggregation"})
	}
	var ratings []bson.M
	if err := cur.All(c.Context(), &ratings); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed reading aggregation"})
	}

	// Pipeline to count selected options per field (handles both scalars and arrays).
	optionPipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"formId": formID}}},
		{{Key: "$project", Value: bson.M{"answers": 1}}},
		{
			{Key: "$project", Value: bson.M{"kv": bson.M{"$objectToArray": "$answers"}}},
		},
		{{Key: "$unwind", Value: "$kv"}},
		{
			{Key: "$project", Value: bson.M{
				"fieldId": "$kv.k",
				"val":     "$kv.v",
				"isArray": bson.M{"$eq": bson.A{bson.M{"$type": "$kv.v"}, "array"}},
			}},
		},

		{
			{Key: "$facet", Value: bson.M{
				"arrays": mongo.Pipeline{
					{{Key: "$match", Value: bson.M{"isArray": true}}},
					{{Key: "$unwind", Value: "$val"}},
					{{Key: "$project", Value: bson.M{"fieldId": 1, "option": "$val"}}},
				},
				"scalars": mongo.Pipeline{
					{{Key: "$match", Value: bson.M{"isArray": false}}},
					{{Key: "$project", Value: bson.M{"fieldId": 1, "option": "$val"}}},
				},
			}},
		},
		{{Key: "$project", Value: bson.M{"all": bson.M{"$concatArrays": bson.A{"$arrays", "$scalars"}}}}},
		{{Key: "$unwind", Value: "$all"}},
		{{Key: "$replaceRoot", Value: bson.M{"newRoot": "$all"}}},
		{
			{Key: "$group", Value: bson.M{
				"_id":   bson.M{"fieldId": "$fieldId", "option": "$option"},
				"count": bson.M{"$sum": 1},
			}},
		},
	}

	cur2, err := respCol.Aggregate(c.Context(), optionPipeline)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed option aggregation"})
	}
	var optionCounts []bson.M
	if err := cur2.All(c.Context(), &optionCounts); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed reading option aggregation"})
	}

	// Return summary: total count, rating stats, and option counts.
	return c.JSON(fiber.Map{
		"totalResponses": total,
		"ratings":        ratings,
		"optionCounts":   optionCounts,
	})
}
