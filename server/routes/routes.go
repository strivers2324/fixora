package routes

import (
	"fixora-server/handlers"
	"fixora-server/handlers/admin_handler"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine,
	authHandler *handlers.AuthHandler,
	otpHandler *handlers.OTPHandler,
	accountHandler *handlers.AccountHandler,
	profileHandler *handlers.ProfileHandler,
	jobHandler *handlers.JobHandler,
	adminAuthHandler *admin_handler.AdminAuthHandler,
	adminIdentityHandler *admin_handler.IdentityVerificationHandler) {
	apiGroup := router.Group("/api/v1")

	SetAuthRoutes(apiGroup, authHandler)
	SetOTPRoutes(apiGroup, otpHandler)
	SetAccountRoutes(apiGroup, accountHandler)
	SetProfileRoutes(apiGroup, profileHandler)
	SetJobRoutes(apiGroup, jobHandler)
	SetAdminAuthRoutes(apiGroup, adminAuthHandler)
	SetAdminServiceRoutes(apiGroup, adminIdentityHandler)

}
