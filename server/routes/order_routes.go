package routes

import (
	"fixora-server/handlers"

	"github.com/gin-gonic/gin"
)

func SetOrderRoutes(router *gin.Engine, handler *handlers.OrderHandler) {

	orderRoutes := router.Group("/api/order")
	{
		orderRoutes.POST("/user/update-profile", handler.UpdateUserProfileHandler)
		orderRoutes.GET("/user/profile", handler.GetUserProfileHandler)
		orderRoutes.POST("/service-provider/update-profile", handler.UpdateServiceProviderProfileHandler)
		orderRoutes.GET("/service-provider/profile", handler.GetServiceProviderProfileHandler)
	}
}
