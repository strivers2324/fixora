package routes

import (
	"fixora-server/handlers/admin_handler"
	"fixora-server/middleware"

	"github.com/gin-gonic/gin"
)

func SetAdminServiceRoutes(apiGroup *gin.RouterGroup, handler *admin_handler.IdentityVerificationHandler) {
	adminVerificationRoutes := apiGroup.Group("/admin/verifications")
	adminVerificationRoutes.Use(middleware.RequireAdminAuth())
	{
		adminVerificationRoutes.GET("", handler.GetVerificationsByStatusHandler)
		adminVerificationRoutes.PATCH("/:id/status", handler.UpdateVerificationStatusHandler)
	}
}
