package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/aynisindan/chat-catalog-service/internal/config"
	"github.com/aynisindan/chat-catalog-service/internal/db"
	"github.com/aynisindan/chat-catalog-service/internal/handlers"
	"github.com/aynisindan/chat-catalog-service/internal/routes"
)

func main() {
	log.Println("Starting Chat & Catalog Service...")

	// 1. Load config
	cfg := config.Load()

	// 2. Connect to MongoDB
	db.Connect(cfg.MongoURI)

	// 3. Initialize Gin Engine
	r := gin.Default()

	// 4. Simple CORS Middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// 5. Start WebSocket Hub coordinator
	go handlers.GlobalHub.Run()

	// 6. Setup Routes
	routes.Setup(r, cfg.JWTSecret)

	// 7. Start HTTP Server
	log.Printf("Server starting on port %s...", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
