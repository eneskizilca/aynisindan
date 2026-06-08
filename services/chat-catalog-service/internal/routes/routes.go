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

		// Internal REST Endpoints
		internal := api.Group("/internal")
		{
			internal.POST("/orders/complete", portfolioHandler.InternalCompleteOrder)
			internal.POST("/orders/review", portfolioHandler.InternalReviewOrder)
		}

		// Protected Portfolio Endpoints (Artisan Only)
		protected := api.Group("/portfolios")
		protected.Use(middleware.JWTAuth(jwtSecret))
		{
			protected.POST("", middleware.RequireRole("ARTISAN"), portfolioHandler.UpdatePortfolio)
			protected.POST("/items", middleware.RequireRole("ARTISAN"), portfolioHandler.CreatePortfolioItem)
		}
	}
}
