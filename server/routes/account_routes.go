package routes

import (
	"fixora-server/handlers"
	"fixora-server/middleware"

	"github.com/gin-gonic/gin"
)

func SetAccountRoutes(apiGroup *gin.RouterGroup, handler *handlers.AccountHandler) {
	accountRoutes := apiGroup.Group("")

	accountRoutes.Use(middleware.RequireAuth())
	{
		accountRoutes.POST("/change-password", handler.ChangePasswordHandler)
		accountRoutes.POST("/change-phone", handler.ChangePhoneHandler)
		accountRoutes.POST("/update/phone", handler.VerifyOTPAndChangePhoneHandler)

	}
}
