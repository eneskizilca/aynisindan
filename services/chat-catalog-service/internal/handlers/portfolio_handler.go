package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/aynisindan/chat-catalog-service/internal/db"
	"github.com/aynisindan/chat-catalog-service/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type PortfolioHandler struct{}

func NewPortfolioHandler() *PortfolioHandler {
	return &PortfolioHandler{}
}

// 1. GET /api/v1/portfolios/:artisanId
func (h *PortfolioHandler) GetPortfolio(c *gin.Context) {
	artisanID := c.Param("artisanId")
	if artisanID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Artisan ID is required"})
		return
	}

	collection := db.GetCollection("portfolios")
	var portfolio models.Portfolio

	err := collection.FindOne(context.TODO(), bson.M{"artisan_id": artisanID}).Decode(&portfolio)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// Return default empty structure instead of 404 to gracefully support new artisans
			c.JSON(http.StatusOK, models.Portfolio{
				ArtisanID:   artisanID,
				FullName:    "Zanaatkâr",
				Bio:         "",
				Profession:  "",
				Skills:      []string{},
				RatingSum:   0,
				RatingCount: 0,
				Items:       []models.PortfolioItem{},
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, portfolio)
}

// 2. POST /api/v1/portfolios
type UpdatePortfolioInput struct {
	FullName   string   `json:"full_name" binding:"required"`
	Bio        string   `json:"bio"`
	Profession string   `json:"profession"`
	Skills     []string `json:"skills"`
}

func (h *PortfolioHandler) UpdatePortfolio(c *gin.Context) {
	artisanID, exists := c.Get("userId")
	if !exists || artisanID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input UpdatePortfolioInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	collection := db.GetCollection("portfolios")
	filter := bson.M{"artisan_id": artisanID}
	update := bson.M{
		"$set": bson.M{
			"full_name":  input.FullName,
			"bio":        input.Bio,
			"profession": input.Profession,
			"skills":     input.Skills,
		},
	}

	opts := options.Update().SetUpsert(true)
	_, err := collection.UpdateOne(context.TODO(), filter, update, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Portfolio updated successfully"})
}

// 3. POST /api/v1/portfolios/items (Artisan only manual upload)
type CreateItemInput struct {
	Title       string  `json:"title" binding:"required"`
	Description string  `json:"description"`
	ImageURL    string  `json:"image_url" binding:"required"`
	Price       float64 `json:"price"`
}

func (h *PortfolioHandler) CreatePortfolioItem(c *gin.Context) {
	artisanID, exists := c.Get("userId")
	if !exists || artisanID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input CreateItemInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	collection := db.GetCollection("portfolios")

	newItem := models.PortfolioItem{
		ID:          primitive.NewObjectID(),
		Title:       input.Title,
		Description: input.Description,
		ImageURL:    input.ImageURL,
		Price:       input.Price,
		CompletedAt: time.Now(),
		IsManual:    true,
	}

	// Update portfolio items by pushing to the items array
	filter := bson.M{"artisan_id": artisanID}
	update := bson.M{
		"$push": bson.M{"items": newItem},
	}

	// In case the portfolio doc doesn't exist yet, we can upsert it
	opts := options.Update().SetUpsert(true)
	_, err := collection.UpdateOne(context.TODO(), filter, update, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, newItem)
}

// 4. GET /api/v1/catalog
type CatalogFeedItem struct {
	ID          primitive.ObjectID `bson:"id" json:"id"`
	OrderID     string             `bson:"order_id,omitempty" json:"order_id,omitempty"`
	ArtisanID   string             `bson:"artisan_id" json:"artisan_id"`
	ArtisanName string             `bson:"artisan_name" json:"artisan_name"`
	Title       string             `bson:"title" json:"title"`
	Description string             `bson:"description" json:"description"`
	ImageURL    string             `bson:"image_url" json:"image_url"`
	Price       float64            `bson:"price" json:"price"`
	CompletedAt time.Time          `bson:"completed_at" json:"completed_at"`
	Rating      int                `bson:"rating,omitempty" json:"rating,omitempty"`
	Comment     string             `bson:"comment,omitempty" json:"comment,omitempty"`
	IsManual    bool               `bson:"is_manual" json:"is_manual"`
}

func (h *PortfolioHandler) GetCatalogFeed(c *gin.Context) {
	collection := db.GetCollection("portfolios")

	// Aggregate and unwind the embedded items array to retrieve all items sorted by completed_at desc
	pipeline := mongo.Pipeline{
		{{Key: "$unwind", Value: "$items"}},
		{{Key: "$sort", Value: bson.D{{Key: "items.completed_at", Value: -1}}}},
		{{Key: "$project", Value: bson.D{
			{Key: "id", Value: "$items._id"},
			{Key: "order_id", Value: "$items.order_id"},
			{Key: "artisan_id", Value: "$artisan_id"},
			{Key: "artisan_name", Value: "$full_name"},
			{Key: "title", Value: "$items.title"},
			{Key: "description", Value: "$items.description"},
			{Key: "image_url", Value: "$items.image_url"},
			{Key: "price", Value: "$items.price"},
			{Key: "completed_at", Value: "$items.completed_at"},
			{Key: "rating", Value: "$items.rating"},
			{Key: "comment", Value: "$items.comment"},
			{Key: "is_manual", Value: "$items.is_manual"},
		}}},
	}

	cursor, err := collection.Aggregate(context.TODO(), pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(context.TODO())

	feed := []CatalogFeedItem{}
	if err = cursor.All(context.TODO(), &feed); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, feed)
}

// 5. POST /api/v1/internal/orders/complete (Internal REST API)
type InternalCompleteOrderInput struct {
	OrderID     string    `json:"orderId" binding:"required"`
	ArtisanID   string    `json:"artisanId" binding:"required"`
	ArtisanName string    `json:"artisanName" binding:"required"`
	Title       string    `json:"title" binding:"required"`
	Description string    `json:"description"`
	ImageURL    string    `json:"imageUrl"`
	Price       float64   `json:"price"`
	CompletedAt time.Time `json:"completedAt"`
}

func (h *PortfolioHandler) InternalCompleteOrder(c *gin.Context) {
	var input InternalCompleteOrderInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	collection := db.GetCollection("portfolios")

	newItem := models.PortfolioItem{
		ID:          primitive.NewObjectID(),
		OrderID:     input.OrderID,
		Title:       input.Title,
		Description: input.Description,
		ImageURL:    input.ImageURL,
		Price:       input.Price,
		CompletedAt: input.CompletedAt,
		IsManual:    false,
	}

	filter := bson.M{"artisan_id": input.ArtisanID}
	update := bson.M{
		"$setOnInsert": bson.M{
			"bio":         "",
			"profession":  "",
			"skills":      []string{},
			"rating_sum":   0,
			"rating_count": 0,
		},
		"$set": bson.M{
			"full_name": input.ArtisanName,
		},
		"$push": bson.M{
			"items": newItem,
		},
	}

	opts := options.Update().SetUpsert(true)
	_, err := collection.UpdateOne(context.TODO(), filter, update, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order completion synced to portfolio successfully"})
}

// 6. POST /api/v1/internal/orders/review (Internal REST API)
type InternalReviewInput struct {
	OrderID string `json:"orderId" binding:"required"`
	Rating  int    `json:"rating" binding:"required"`
	Comment string `json:"comment"`
}

func (h *PortfolioHandler) InternalReviewOrder(c *gin.Context) {
	var input InternalReviewInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	collection := db.GetCollection("portfolios")

	// Find the portfolio containing the item with matching order_id and update it
	filter := bson.M{"items.order_id": input.OrderID}
	update := bson.M{
		"$set": bson.M{
			"items.$.rating":  input.Rating,
			"items.$.comment": input.Comment,
		},
		"$inc": bson.M{
			"rating_sum":   input.Rating,
			"rating_count": 1,
		},
	}

	result, err := collection.UpdateOne(context.TODO(), filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Portfolio item with matching order ID not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Review synced to portfolio successfully"})
}
