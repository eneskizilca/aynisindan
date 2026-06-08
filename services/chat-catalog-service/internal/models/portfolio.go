package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PortfolioItem struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	OrderID     string             `bson:"order_id,omitempty" json:"order_id,omitempty"`
	Title       string             `bson:"title" json:"title"`
	Description string             `bson:"description" json:"description"`
	ImageURL    string             `bson:"image_url" json:"image_url"`
	Price       float64            `bson:"price" json:"price"`
	CompletedAt time.Time          `bson:"completed_at" json:"completed_at"`
	Rating      int                `bson:"rating,omitempty" json:"rating,omitempty"`
	Comment     string             `bson:"comment,omitempty" json:"comment,omitempty"`
	IsManual    bool               `bson:"is_manual" json:"is_manual"`
}

type Portfolio struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ArtisanID   string             `bson:"artisan_id" json:"artisan_id"`
	FullName    string             `bson:"full_name" json:"full_name"`
	Bio         string             `bson:"bio" json:"bio"`
	Profession  string             `bson:"profession" json:"profession"`
	Skills      []string           `bson:"skills" json:"skills"`
	RatingSum   int                `bson:"rating_sum" json:"rating_sum"`
	RatingCount int                `bson:"rating_count" json:"rating_count"`
	Items       []PortfolioItem    `bson:"items" json:"items"`
}
