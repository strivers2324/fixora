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

type OrderHandler struct {
	OrderService *service.OrderService
}

func NewOrderHandler(orderService *service.OrderService) *OrderHandler {
	return &OrderHandler{OrderService: orderService}
}

func (h *OrderHandler) UpdateUserProfileHandler(c *gin.Context) {
	var req models.UserProfileDataRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid request body", "BAD_REQUEST")
		return
	}

	parsedUserID, ok := utils.GetUserID(c)
	if !ok || parsedUserID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "User ID not found in token", "UNAUTHORIZED")
		return
	}

	updatedProfile, err := h.OrderService.UpdateUserProfile(c.Request.Context(), parsedUserID, req)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", updatedProfile)
}

func (h *OrderHandler) GetUserProfileHandler(c *gin.Context) {
	parsedUserID, ok := utils.GetUserID(c)
	if !ok || parsedUserID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "User ID not found in token", "UNAUTHORIZED")
		return
	}

	profile, err := h.OrderService.GetUserProfileData(c.Request.Context(), parsedUserID)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", profile)
}

func (h *OrderHandler) UpdateServiceProviderProfileHandler(c *gin.Context) {
	var req models.ServiceProviderProfileDataRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid request body", "BAD_REQUEST")
		return
	}

	parsedProviderID, ok := utils.GetUserID(c)
	if !ok || parsedProviderID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "Provider ID not found in token", "UNAUTHORIZED")
		return
	}

	updatedProfile, err := h.OrderService.UpdateServiceProviderProfile(c.Request.Context(), parsedProviderID, req)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", updatedProfile)
}

func (h *OrderHandler) GetServiceProviderProfileHandler(c *gin.Context) {
	parsedProviderID, ok := utils.GetUserID(c)
	if !ok || parsedProviderID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "Provider ID not found in token", "UNAUTHORIZED")
		return
	}

	profile, err := h.OrderService.GetServiceProviderProfileData(c.Request.Context(), parsedProviderID)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", profile)
}

func (h *OrderHandler) ChangePasswordHandler(c *gin.Context) {
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

	if err := h.OrderService.ChangePassword(c.Request.Context(), parsedID, userRole, req); err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", nil)
}

func (h *OrderHandler) SubmitNIDHandler(c *gin.Context) {
	var req models.NIDSubmitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid request body", "BAD_REQUEST")
		return
	}

	parsedProviderID, ok := utils.GetUserID(c)
	if !ok || parsedProviderID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "Provider ID not found in token", "UNAUTHORIZED")
		return
	}

	err := h.OrderService.SubmitNIDDetails(c.Request.Context(), parsedProviderID, req)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", nil)
}

func (h *OrderHandler) GetNIDStatusHandler(c *gin.Context) {
	parsedProviderID, ok := utils.GetUserID(c)
	if !ok || parsedProviderID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "Provider ID not found in token", "UNAUTHORIZED")
		return
	}

	statusResponse, err := h.OrderService.GetNIDStatus(c.Request.Context(), parsedProviderID)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}
	response.SendSuccess(c.Writer, "", statusResponse)
}
