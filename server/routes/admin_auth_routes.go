package routes

import (
	"fixora-server/handlers/admin_handler"
	"fixora-server/middleware"

	"github.com/gin-gonic/gin"
)

func SetAdminAuthRoutes(apiGroup *gin.RouterGroup, handler *admin_handler.AdminAuthHandler) {
	adminAuthRoutes := apiGroup.Group("/admin/auth")
	{
		adminAuthRoutes.POST("/login", handler.AdminLoginHandler)
		adminAuthRoutes.POST("/refresh", handler.AdminRefreshHandler)
		adminAuthRoutes.POST("/logout", handler.AdminLogoutHandler)
		adminAuthRoutes.GET("/verify", middleware.RequireAdminAuth(), handler.VerifyAdminSessionHandler)
	}
}
