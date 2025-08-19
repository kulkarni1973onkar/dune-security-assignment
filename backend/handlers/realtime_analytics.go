// Handler for streaming real-time form analytics via Server-Sent Events (SSE).

package handlers

import (
	"bufio"
	"encoding/json"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// GET /forms
func StreamAnalytics(c *fiber.Ctx) error {
	respCol := c.Locals("responses").(*mongo.Collection)

	formOID, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid id"})
	}
	formID := formOID.Hex()

	c.Set("Content-Type", "text/event-stream")
	c.Set("Cache-Control", "no-cache")
	c.Set("Connection", "keep-alive")
	c.Context().SetBodyStreamWriter(func(w *bufio.Writer) {

		ch, unsubscribe := rtSubscribe(formID)
		defer unsubscribe()

		// heartbeat to keep proxies alive
		heartbeat := time.NewTicker(15 * time.Second)
		defer heartbeat.Stop()

		// helper to run the same aggregations
		sendAnalytics := func() error {
			payload, err := computeAnalytics(c, respCol, formOID)
			if err != nil {
				// send minimal error event (optional)
				fmt.Fprintf(w, "event: error\ndata: %q\n\n", err.Error())
				w.Flush()
				return nil
			}
			b, _ := json.Marshal(payload)
			fmt.Fprintf(w, "event: analytics\ndata: %s\n\n", b)
			return nil
		}

		// initial push
		_ = sendAnalytics()

		for {
			select {
			case <-c.Context().Done():
				return
			case <-heartbeat.C:

				fmt.Fprint(w, ": ping\n\n")
				w.Flush()
			case <-ch:
				_ = sendAnalytics()
			}
		}
	})

	return nil
}

// computeAnalytics mirrors handlers.FormAnalytics logic
func computeAnalytics(c *fiber.Ctx, respCol *mongo.Collection, formID primitive.ObjectID) (map[string]interface{}, error) {
	total, err := respCol.CountDocuments(c.Context(), bson.M{"formId": formID})
	if err != nil {
		return nil, err
	}

	// ratings agg
	ratingPipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"formId": formID}}},
		{{Key: "$project", Value: bson.M{"answers": 1}}},
		{{Key: "$project", Value: bson.M{"kv": bson.M{"$objectToArray": "$answers"}}}},
		{{Key: "$unwind", Value: "$kv"}},
		{{Key: "$match", Value: bson.M{"kv.v": bson.M{"$type": "number"}}}},
		{{Key: "$group", Value: bson.M{
			"_id":   "$kv.k",
			"avg":   bson.M{"$avg": "$kv.v"},
			"min":   bson.M{"$min": "$kv.v"},
			"max":   bson.M{"$max": "$kv.v"},
			"count": bson.M{"$sum": 1},
		}}},
	}
	cur, err := respCol.Aggregate(c.Context(), ratingPipeline)
	if err != nil {
		return nil, err
	}
	var ratings []bson.M
	if err := cur.All(c.Context(), &ratings); err != nil {
		return nil, err
	}

	// option counts
	optionPipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"formId": formID}}},
		{{Key: "$project", Value: bson.M{"kv": bson.M{"$objectToArray": "$answers"}}}},
		{{Key: "$unwind", Value: "$kv"}},
		{{Key: "$project", Value: bson.M{
			"fieldId": "$kv.k",
			"val":     "$kv.v",
			"isArray": bson.M{"$eq": bson.A{bson.M{"$type": "$kv.v"}, "array"}},
		}}},
		{{Key: "$facet", Value: bson.M{
			"arrays": mongo.Pipeline{
				{{Key: "$match", Value: bson.M{"isArray": true}}},
				{{Key: "$unwind", Value: "$val"}},
				{{Key: "$project", Value: bson.M{"fieldId": 1, "option": "$val"}}},
			},
			"scalars": mongo.Pipeline{
				{{Key: "$match", Value: bson.M{"isArray": false}}},
				{{Key: "$project", Value: bson.M{"fieldId": 1, "option": "$val"}}},
			},
		}}},
		{{Key: "$project", Value: bson.M{"all": bson.M{"$concatArrays": bson.A{"$arrays", "$scalars"}}}}},
		{{Key: "$unwind", Value: "$all"}},
		{{Key: "$replaceRoot", Value: bson.M{"newRoot": "$all"}}},
		{{Key: "$group", Value: bson.M{
			"_id":   bson.M{"fieldId": "$fieldId", "option": "$option"},
			"count": bson.M{"$sum": 1},
		}}},
	}
	cur2, err := respCol.Aggregate(c.Context(), optionPipeline)
	if err != nil {
		return nil, err
	}
	var optionCounts []bson.M
	if err := cur2.All(c.Context(), &optionCounts); err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"totalResponses": total,
		"ratings":        ratings,
		"optionCounts":   optionCounts,
	}, nil
}
