package handlers

import (
	"net/http"

	"fixora-server/models"
	"fixora-server/pkg/response"
	"fixora-server/service"

	"github.com/gin-gonic/gin"
)

type OTPHandler struct {
	OTPService *service.OTPService
}

func NewOTPHandler(otpService *service.OTPService) *OTPHandler {
	return &OTPHandler{OTPService: otpService}
}

func (h *OTPHandler) ResendOTPHandler(c *gin.Context) {
	var req models.ResendOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "otp_id is required", "BAD_REQUEST")
		return
	}

	newOtpID, err := h.OTPService.ResendOTP(c.Request.Context(), req.OtpID)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", gin.H{"otp_id": newOtpID})
}

func (h *OTPHandler) GetOTPInfoHandler(c *gin.Context) {
	otpID := c.Param("otp_id")
	if otpID == "" {
		response.SendError(c.Writer, http.StatusBadRequest, "otp_id is required", "BAD_REQUEST")
		return
	}

	expiry, phone, err := h.OTPService.OTPExpirationInfo(c.Request.Context(), otpID)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", gin.H{
		"otp_id":     otpID,
		"expires_at": expiry.UTC(),
		"phone":      phone,
	})
}
