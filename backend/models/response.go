// Data model for storing form responses with answers and submission time.

package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Response struct {
	ID          primitive.ObjectID     `json:"id" bson:"_id,omitempty"`
	FormID      primitive.ObjectID     `json:"formId" bson:"formId"`
	Answers     map[string]interface{} `json:"answers" bson:"answers"`
	SubmittedAt time.Time              `json:"submittedAt" bson:"submittedAt"`
}
