package routes

import (
	"fixora-server/handlers"
	"fixora-server/middleware"

	"github.com/gin-gonic/gin"
)

func SetAuthRoutes(apiGroup *gin.RouterGroup, handler *handlers.AuthHandler) {
	authRoutes := apiGroup.Group("/auth")
	{
		authRoutes.GET("/professions", handler.GetProfessionsHandler)
		authRoutes.POST("/user/registration", handler.UserRegisterHandler)
		authRoutes.POST("/service-provider/registration", handler.ServiceProviderRegisterHandler)

		authRoutes.POST("/user/verify", handler.VerifyUserPhoneHandler)
		authRoutes.POST("/service-provider/verify", handler.VerifyServiceProviderPhoneHandler)

		authRoutes.POST("/login", handler.LoginHandler)
		authRoutes.POST("/refresh", handler.RefreshHandler)
		authRoutes.POST("/logout", handler.LogoutHandler)

		authRoutes.POST("/forgot-password", handler.ForgotPasswordHandler)
		authRoutes.POST("/verify/otp", handler.VerifyOTPHandler)
		authRoutes.POST("/reset-password", handler.ResetPasswordHandler)

		authRoutes.PUT("/update-phone", handler.UpdatePhoneAndResendOTPHandler)

		authRoutes.GET("/verify", middleware.RequireAuth(), handler.VerifySessionHandler)
	}
}
