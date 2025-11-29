package routes

import (
	"fixora-server/handlers"

	"github.com/gin-gonic/gin"
)

func SetAuthRoutes(router *gin.Engine, handler *handlers.AuthHandler) {
	router.POST("/api/register-service-provider", handler.ServiceProviderRegisterHandler)
	router.POST("/api/register-user", handler.UserRegisterHandler)

	router.POST("/api/check-user", handler.CheckUserPhoneHandler)
	router.POST("/api/check-service-provider", handler.CheckServiceProviderPhoneHandler)

	router.POST("/api/login", handler.LoginHandler)
	router.POST("/api/refresh", handler.RefreshHandler)
	router.POST("/api/logout", handler.LogoutHandler)
}
