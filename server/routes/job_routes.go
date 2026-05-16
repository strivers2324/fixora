package routes

import (
	"fixora-server/handlers"
	"fixora-server/middleware"

	"github.com/gin-gonic/gin"
)

func SetJobRoutes(apiGroup *gin.RouterGroup, jobHandler *handlers.JobHandler) {
	jobRoutes := apiGroup.Group("/jobs")

	jobRoutes.Use(middleware.RequireAuth())
	{
		jobRoutes.GET("/search-providers", jobHandler.SearchProvidersHandler)

		jobRoutes.POST("/book", jobHandler.BookExpertHandler)
		jobRoutes.POST("/:job_id/cancel", jobHandler.CancelJobByUserHandler)

		jobRoutes.POST("/:job_id/provider-offer", jobHandler.ProviderOfferHandler)
		jobRoutes.POST("/:job_id/user-offer", jobHandler.UpdateUserOfferHandler)

		jobRoutes.POST("/:job_id/accept", jobHandler.AcceptJobHandler)
		jobRoutes.POST("/:job_id/provider-cancel", jobHandler.CancelJobByProviderHandler)
		jobRoutes.POST("/:job_id/complete", jobHandler.CompleteJobHandler)

		jobRoutes.GET("/user-dashboard", jobHandler.GetUserDashboardHandler)
		jobRoutes.GET("/provider-dashboard", jobHandler.GetProviderDashboardHandler)
	}
}
