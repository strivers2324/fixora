package routes

import (
	"fixora-server/handlers"

	"github.com/gin-gonic/gin"
)

func SetOTPRoutes(apiGroup *gin.RouterGroup, handler *handlers.OTPHandler) {
	otpRoutes := apiGroup.Group("")
	{
		otpRoutes.GET("otp/info/:otp_id", handler.GetOTPInfoHandler)
		otpRoutes.POST("/resend-otp", handler.ResendOTPHandler)
	}
}
