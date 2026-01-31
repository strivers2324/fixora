package routes

import (
	"fixora-server/handlers"

	"github.com/gin-gonic/gin"
)

func SetAuthRoutes(router *gin.Engine, handler *handlers.AuthHandler) {

	authRoutes := router.Group("/api/auth")
	{
		authRoutes.GET("/professions", handler.GetProfessionsHandler)
		authRoutes.POST("/service-provider/registration", handler.ServiceProviderRegisterHandler)
		authRoutes.POST("/user/registration", handler.UserRegisterHandler)
		authRoutes.GET("/otp/info/:otp_id", handler.GetOTPInfoHandler)
		authRoutes.POST("/verify/otp", handler.VerifyOTPHandler)

		authRoutes.POST("/resend-otp", handler.ResendOTPHandler)
		authRoutes.PUT("/update-phone", handler.UpdatePhoneHandler)

		authRoutes.POST("/user/verify", handler.VerifyUserPhoneHandler)
		authRoutes.POST("/service-provider/verify", handler.VerifyServiceProviderPhoneHandler)

		authRoutes.POST("/login", handler.LoginHandler)
		authRoutes.POST("/refresh", handler.RefreshHandler)
		authRoutes.POST("/logout", handler.LogoutHandler)

		authRoutes.POST("/forgot-password", handler.ForgotPasswordHandler)
		authRoutes.POST("/reset-password", handler.ResetPasswordHandler)
	}
}
