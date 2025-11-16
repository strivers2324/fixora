package routes

import (
	"fixora-server/handlers"

	"github.com/gin-gonic/gin"
)

func SetAuthRoutes(router *gin.Engine, handler *handlers.AuthHandler) {
	// router.POST("/api/register-service-provider", handler.ServiceProviderRegisterHandler)
	router.POST("/api/register-user", handler.UserRegisterHandler)
}
