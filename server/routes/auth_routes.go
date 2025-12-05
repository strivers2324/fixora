package routes

import (
	"fixora-server/handlers"

	"github.com/gin-gonic/gin"
)

func SetAuthRoutes(router *gin.Engine, handler *handlers.AuthHandler) {
	router.POST("/api/auth/service_provider/registration", handler.ServiceProviderRegisterHandler)
	router.POST("/api/auth/user/registration", handler.UserRegisterHandler)

	router.POST("/api/auth/user/verify", handler.VerifyUserPhoneHandler)
	router.POST("/api/auth/service_provider/verify", handler.VerifyServiceProviderOTPHandler)

	router.POST("/api/auth/login", handler.LoginHandler)
	router.POST("/api/auth/refresh", handler.RefreshHandler)
	router.POST("/api/auth/logout", handler.LogoutHandler)
}
