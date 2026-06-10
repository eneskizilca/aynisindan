package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/aynisindan/chat-catalog-service/internal/handlers"
	"github.com/aynisindan/chat-catalog-service/internal/middleware"
)

func Setup(r *gin.Engine, jwtSecret string) {
	portfolioHandler := handlers.NewPortfolioHandler()

	api := r.Group("/api/v1")
	{
		// Public Catalog Feed
		api.GET("/catalog", portfolioHandler.GetCatalogFeed)

		// Public Portfolio Query
		api.GET("/portfolios/:artisanId", portfolioHandler.GetPortfolio)

		// WebSocket Chat Route (token parsed inside)
		api.GET("/chat/ws", func(c *gin.Context) {
			handlers.HandleWS(c, jwtSecret)
		})

		// Internal REST Endpoints
		internal := api.Group("/internal")
		{
			internal.POST("/orders/complete", portfolioHandler.InternalCompleteOrder)
			internal.POST("/orders/review", portfolioHandler.InternalReviewOrder)
		}

		// Protected Chat & Portfolio Endpoints
		protected := api.Group("")
		protected.Use(middleware.JWTAuth(jwtSecret))
		{
			// Chat REST API
			protected.GET("/chat/conversations", handlers.GetConversations)
			protected.GET("/chat/history", handlers.GetChatHistory)

			// Portfolio Endpoints (Artisan Only)
			portfolios := protected.Group("/portfolios")
			{
				portfolios.POST("", middleware.RequireRole("ARTISAN"), portfolioHandler.UpdatePortfolio)
				portfolios.POST("/items", middleware.RequireRole("ARTISAN"), portfolioHandler.CreatePortfolioItem)
			}
		}
	}
}
