package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Field struct {
	ID       string   `bson:"id" json:"id"`
	Type     string   `bson:"type" json:"type"`
	Label    string   `bson:"label" json:"label"`
	Required bool     `bson:"required" json:"required"`
	Options  []string `bson:"options,omitempty" json:"options,omitempty"`
	Min      *int     `bson:"min,omitempty" json:"min,omitempty"`
	Max      *int     `bson:"max,omitempty" json:"max,omitempty"`
}

type Form struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Title       string             `bson:"title" json:"title"`
	Description string             `bson:"description" json:"description"`
	Fields      []Field            `bson:"fields" json:"fields"`
	IsPublished bool               `bson:"isPublished" json:"isPublished"`
	CreatedAt   primitive.DateTime `bson:"createdAt" json:"createdAt"`
	UpdatedAt   primitive.DateTime `bson:"updatedAt" json:"updatedAt"`
}
