package routes

import (
	"fixora-server/handlers"
	"fixora-server/middleware"

	"github.com/gin-gonic/gin"
)

func SetProfileRoutes(apiGroup *gin.RouterGroup, handler *handlers.ProfileHandler) {
	profileRoutes := apiGroup.Group("")

	profileRoutes.Use(middleware.RequireAuth())
	{
		profileRoutes.POST("/user/update-profile", handler.UpdateUserProfileHandler)
		profileRoutes.GET("/user/profile", handler.GetUserProfileHandler)

		profileRoutes.GET("/user/addresses", handler.GetUserAddressesHandler)
		profileRoutes.POST("/user/addresses", handler.SubmitUserAddressHandler)
		profileRoutes.PUT("/user/addresses/:id", handler.UpdateUserAddressHandler)
		profileRoutes.DELETE("/user/addresses/:id", handler.DeleteUserAddressHandler)

		profileRoutes.POST("/service-provider/update-profile", handler.UpdateServiceProviderProfileHandler)
		profileRoutes.GET("/service-provider/profile", handler.GetServiceProviderProfileHandler)

		profileRoutes.GET("/service-provider/address", handler.GetServiceProviderAddressHandler)
		profileRoutes.POST("/service-provider/address", handler.SaveServiceProviderAddressHandler)

		profileRoutes.POST("/service-provider/submit-nid", handler.SubmitNIDHandler)
		profileRoutes.GET("/service-provider/nid-status", handler.GetNIDStatusHandler)

		profileRoutes.POST("/service-provider/service/catalog", handler.UpdateServiceCatalogHandler)
		profileRoutes.GET("/service-provider/service/catalog", handler.GetServiceCatalogHandler)
	}
}
