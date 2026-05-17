package routes

import (
	"fixora-server/handlers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine,
	authHandler *handlers.AuthHandler,
	otpHandler *handlers.OTPHandler,
	accountHandler *handlers.AccountHandler,
	profileHandler *handlers.ProfileHandler,
	jobHandler *handlers.JobHandler,
) {
	apiGroup := router.Group("/api/v1")

	SetAuthRoutes(apiGroup, authHandler)
	SetOTPRoutes(apiGroup, otpHandler)
	SetAccountRoutes(apiGroup, accountHandler)
	SetProfileRoutes(apiGroup, profileHandler)
	SetJobRoutes(apiGroup, jobHandler)
}
