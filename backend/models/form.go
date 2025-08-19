// Data models for form structure and fields stored in MongoDB.

package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Field struct {
	ID        string   `json:"id" bson:"id"`
	Type      string   `json:"type" bson:"type"`
	Label     string   `json:"label" bson:"label"`
	Required  bool     `json:"required" bson:"required"`
	Options   []string `json:"options,omitempty" bson:"options,omitempty"`
	Min       *int     `json:"min,omitempty" bson:"min,omitempty"`
	Max       *int     `json:"max,omitempty" bson:"max,omitempty"`
	MinLength *int     `json:"minLength,omitempty" bson:"minLength,omitempty"`
	MaxLength *int     `json:"maxLength,omitempty" bson:"maxLength,omitempty"`
	Pattern   string   `json:"pattern,omitempty"   bson:"pattern,omitempty"`
}

type Form struct {
	ID          primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Title       string             `json:"title" bson:"title"`
	Description string             `json:"description,omitempty" bson:"description,omitempty"`
	Status      string             `json:"status" bson:"status"`
	Slug        string             `json:"slug,omitempty" bson:"slug,omitempty"`
	Fields      []Field            `json:"fields" bson:"fields"`
	CreatedAt   time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt   time.Time          `json:"updatedAt" bson:"updatedAt"`
}
