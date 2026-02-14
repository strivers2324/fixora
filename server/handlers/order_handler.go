package handlers

import (
	"net/http"

	"fixora-server/models"
	"fixora-server/pkg/response"
	"fixora-server/service"

	"github.com/gin-gonic/gin"
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

	updatedProfile, err := h.OrderService.UpdateUserProfile(c.Request.Context(), req)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", updatedProfile)
}

func (h *OrderHandler) GetUserProfileHandler(c *gin.Context) {
	phone := c.Query("phone")
	if phone == "" {
		response.SendError(c.Writer, http.StatusBadRequest, "phone is required", "BAD_REQUEST")
		return
	}

	profile, err := h.OrderService.GetUserProfileData(c.Request.Context(), phone)
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

	updatedProfile, err := h.OrderService.UpdateServiceProviderProfile(c.Request.Context(), req)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", updatedProfile)
}

func (h *OrderHandler) GetServiceProviderProfileHandler(c *gin.Context) {
	phone := c.Query("phone")
	if phone == "" {
		response.SendError(c.Writer, http.StatusBadRequest, "phone is required", "BAD_REQUEST")
		return
	}

	profile, err := h.OrderService.GetServiceProviderProfileData(c.Request.Context(), phone)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", profile)
}
