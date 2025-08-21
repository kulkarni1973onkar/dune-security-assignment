// Handler for submitting a form response with full field-level validation.

package handlers

import (
	"errors"
	"fmt"
	"regexp"
	"slices"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/kulkarni1973onkar/dune-security-assignment/backend/models"
)

// POST /forms/:id/responses
func SubmitResponse(c *fiber.Ctx) error {
	formsCol := c.Locals("forms").(*mongo.Collection)
	respCol := c.Locals("responses").(*mongo.Collection)

	formID, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid id"})
	}

	// 1) Load form
	var form models.Form
	if err := formsCol.FindOne(c.Context(), bson.M{"_id": formID}).Decode(&form); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return c.Status(404).JSON(fiber.Map{"error": "form not found"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "failed to load form"})
	}

	// block submissions unless the form is published
	if form.Status != "published" {
		return c.Status(403).JSON(fiber.Map{
			"error": "form is not published",
		})
	}

	var answers map[string]interface{}
	if err := c.BodyParser(&answers); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}
	if len(answers) == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "answers required"})
	}

	//Validate answers
	if err := validateAnswers(form, answers); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	//Save response
	doc := models.Response{
		FormID:      form.ID,
		Answers:     answers,
		SubmittedAt: time.Now(),
	}
	res, err := respCol.InsertOne(c.Context(), doc)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to save response"})
	}
	if oid, ok := res.InsertedID.(primitive.ObjectID); ok {
		doc.ID = oid
	}
	rtNotify(form.ID.Hex())
	return c.Status(201).JSON(doc)
}

func validateAnswers(form models.Form, answers map[string]interface{}) error {
	// Build lookup for required
	fieldByID := map[string]models.Field{}
	for _, f := range form.Fields {
		fieldByID[f.ID] = f
	}

	for _, f := range form.Fields {
		val, present := answers[f.ID]

		if f.Required && !present {
			return fmt.Errorf("missing required field: %s", f.ID)
		}
		if !present {
			continue
		}

		if f.Required {

			v, present := answers[f.ID]
			if !present {
				return fmt.Errorf("field %s is required", f.ID)
			}

			switch f.Type {
			case "text":
				s, ok := v.(string)
				if !ok || len(strings.TrimSpace(s)) == 0 {
					return fmt.Errorf("field %s is required", f.ID)
				}
			case "mc":
				s, ok := v.(string)
				if !ok || strings.TrimSpace(s) == "" {
					return fmt.Errorf("field %s is required", f.ID)
				}
			case "checkbox":
				arr, ok := v.([]interface{})
				if !ok || len(arr) == 0 {
					return fmt.Errorf("field %s is required", f.ID)
				}
			case "rating", "number":

				if _, ok := v.(float64); !ok {
					return fmt.Errorf("field %s is required", f.ID)
				}
			default:

				if v == nil {
					return fmt.Errorf("field %s is required", f.ID)
				}
			}
		}

		switch f.Type {
		case "text":
			s, ok := val.(string)
			if !ok {
				return fmt.Errorf("field %s must be text", f.ID)
			}
			trimmed := strings.TrimSpace(s)

			if f.MinLength != nil && len(trimmed) < *f.MinLength {
				return fmt.Errorf("field %s must be at least %d characters", f.ID, *f.MinLength)
			}
			if f.MaxLength != nil && len(trimmed) > *f.MaxLength {
				return fmt.Errorf("field %s must be at most %d characters", f.ID, *f.MaxLength)
			}
			if f.Pattern != "" {
				re, err := regexp.Compile(f.Pattern)
				if err != nil {
					return fmt.Errorf("field %s has invalid pattern", f.ID)
				}
				if !re.MatchString(trimmed) {
					return fmt.Errorf("field %s does not match required format", f.ID)
				}
			}

		case "rating":
			num, ok := val.(float64)
			if !ok {
				return fmt.Errorf("field %s must be number", f.ID)
			}
			if f.Min != nil && f.Max != nil {
				if int(num) < *f.Min || int(num) > *f.Max {
					return fmt.Errorf("field %s rating must be between %d and %d", f.ID, *f.Min, *f.Max)
				}
			}
		case "mc":
			choice, ok := val.(string)
			if !ok {
				return fmt.Errorf("field %s must be string (single choice)", f.ID)
			}
			if len(f.Options) == 0 || !slices.Contains(f.Options, choice) {
				return fmt.Errorf("field %s must be one of %v", f.ID, f.Options)
			}
		case "checkbox":
			arr, ok := val.([]interface{})
			if !ok {
				return fmt.Errorf("field %s must be an array of strings", f.ID)
			}
			if len(f.Options) == 0 {
				return fmt.Errorf("field %s has no options configured", f.ID)
			}
			for _, v := range arr {
				s, ok := v.(string)
				if !ok || !slices.Contains(f.Options, s) {
					return fmt.Errorf("field %s contains invalid option %v", f.ID, v)
				}
			}
		default:
			return fmt.Errorf("unsupported field type: %s", f.Type)
		}
	}

	return nil
}
