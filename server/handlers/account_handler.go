package handlers

import (
	"net/http"

	"fixora-server/models"
	"fixora-server/pkg/response"
	"fixora-server/pkg/utils"
	"fixora-server/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AccountHandler struct {
	AccountService *service.AccountService
}

func NewAccountHandler(accountService *service.AccountService) *AccountHandler {
	return &AccountHandler{AccountService: accountService}
}

func (h *AccountHandler) ChangePasswordHandler(c *gin.Context) {
	var req models.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid request format", "BAD_REQUEST")
		return
	}

	parsedID, ok := utils.GetUserID(c)
	if !ok || parsedID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "User ID not found or invalid", "UNAUTHORIZED")
		return
	}

	userRole, ok := utils.GetUserRole(c)
	if !ok {
		response.SendError(c.Writer, http.StatusUnauthorized, "User role not found", "UNAUTHORIZED")
		return
	}

	if err := h.AccountService.ChangePassword(c.Request.Context(), parsedID, userRole, req); err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", nil)
}

func (h *AccountHandler) ChangePhoneHandler(c *gin.Context) {
	var req models.ChangePhoneNumberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "new phone number is required", "BAD_REQUEST")
		return
	}

	entityID, ok := utils.GetUserID(c)
	if !ok || entityID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "User ID not found in token", "UNAUTHORIZED")
		return
	}

	role, ok := utils.GetUserRole(c)
	if !ok {
		response.SendError(c.Writer, http.StatusUnauthorized, "User role not found", "UNAUTHORIZED")
		return
	}

	otpID, err := h.AccountService.ChangePhoneNumber(c.Request.Context(), entityID, role, req.NewPhone)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", gin.H{"otp_id": otpID})
}

func (h *AccountHandler) VerifyOTPAndChangePhoneHandler(c *gin.Context) {
	var req models.VerifyAndUpdatePhoneRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "otp_id, otp_code and new_phone are required", "BAD_REQUEST")
		return
	}

	err := h.AccountService.VerifyOTPAndChangePhone(c.Request.Context(), req.OtpID, req.OtpCode, req.NewPhone)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "Phone number updated successfully", nil)
}
