package routes

import (
	"fixora-server/handlers"
	"fixora-server/middleware"

	"github.com/gin-gonic/gin"
)

func SetOrderRoutes(router *gin.Engine, handler *handlers.OrderHandler) {
	orderRoutes := router.Group("/api/order")

	orderRoutes.Use(middleware.RequireAuth())
	{
		orderRoutes.POST("/user/update-profile", handler.UpdateUserProfileHandler)
		orderRoutes.GET("/user/profile", handler.GetUserProfileHandler)
		orderRoutes.POST("/service-provider/update-profile", handler.UpdateServiceProviderProfileHandler)
		orderRoutes.GET("/service-provider/profile", handler.GetServiceProviderProfileHandler)
		orderRoutes.POST("/change-password", handler.ChangePasswordHandler)
		orderRoutes.POST("/service-provider/submit-nid", handler.SubmitNIDHandler)
		orderRoutes.GET("/service-provider/nid-status", handler.GetNIDStatusHandler)
	}
}
