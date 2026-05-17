package handlers

import (
	"net/http"
	"strconv"

	"fixora-server/models"
	"fixora-server/pkg/response"
	"fixora-server/pkg/utils"
	"fixora-server/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ProfileHandler struct {
	ProfileService *service.ProfileService
}

func NewProfileHandler(profileService *service.ProfileService) *ProfileHandler {
	return &ProfileHandler{ProfileService: profileService}
}

func (h *ProfileHandler) UpdateUserProfileHandler(c *gin.Context) {
	var req models.UserProfileDataRequest
	if err := c.ShouldBind(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid request body", "BAD_REQUEST")
		return
	}

	parsedUserID, ok := utils.GetUserID(c)
	if !ok || parsedUserID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "User ID not found in token", "UNAUTHORIZED")
		return
	}

	updatedProfile, err := h.ProfileService.UpdateUserProfile(c.Request.Context(), parsedUserID, req)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", updatedProfile)
}

func (h *ProfileHandler) GetUserProfileHandler(c *gin.Context) {
	parsedUserID, ok := utils.GetUserID(c)
	if !ok || parsedUserID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "User ID not found in token", "UNAUTHORIZED")
		return
	}

	profile, err := h.ProfileService.GetUserProfileData(c.Request.Context(), parsedUserID)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", profile)
}

func (h *ProfileHandler) UpdateServiceProviderProfileHandler(c *gin.Context) {
	var req models.ServiceProviderProfileDataRequest
	if err := c.ShouldBind(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid request body", "BAD_REQUEST")
		return
	}

	parsedProviderID, ok := utils.GetUserID(c)
	if !ok || parsedProviderID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "Provider ID not found in token", "UNAUTHORIZED")
		return
	}

	updatedProfile, err := h.ProfileService.UpdateServiceProviderProfile(c.Request.Context(), parsedProviderID, req)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", updatedProfile)
}

func (h *ProfileHandler) GetServiceProviderProfileHandler(c *gin.Context) {
	parsedProviderID, ok := utils.GetUserID(c)
	if !ok || parsedProviderID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "Provider ID not found in token", "UNAUTHORIZED")
		return
	}

	profile, err := h.ProfileService.GetServiceProviderProfileData(c.Request.Context(), parsedProviderID)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", profile)
}

func (h *ProfileHandler) SubmitUserAddressHandler(c *gin.Context) {
	var req models.UserAddressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid request body", "BAD_REQUEST")
		return
	}

	parsedUserID, ok := utils.GetUserID(c)
	if !ok || parsedUserID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "User ID not found", "UNAUTHORIZED")
		return
	}

	address, err := h.ProfileService.SubmitUserAddress(c.Request.Context(), parsedUserID, req)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "Address added successfully", address)
}

func (h *ProfileHandler) GetUserAddressesHandler(c *gin.Context) {
	parsedUserID, ok := utils.GetUserID(c)
	if !ok || parsedUserID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "User ID not found", "UNAUTHORIZED")
		return
	}

	addresses, err := h.ProfileService.GetUserAddresses(c.Request.Context(), parsedUserID)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", addresses)
}

func (h *ProfileHandler) UpdateUserAddressHandler(c *gin.Context) {
	idParam := c.Param("id")
	addressID, err := strconv.Atoi(idParam)
	if err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid address ID", "BAD_REQUEST")
		return
	}

	var req models.UserAddressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid request body", "BAD_REQUEST")
		return
	}

	parsedUserID, ok := utils.GetUserID(c)
	if !ok || parsedUserID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "User ID not found", "UNAUTHORIZED")
		return
	}

	address, err := h.ProfileService.UpdateUserAddress(c.Request.Context(), parsedUserID, addressID, req)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "Address updated successfully", address)
}

func (h *ProfileHandler) DeleteUserAddressHandler(c *gin.Context) {
	idParam := c.Param("id")
	addressID, err := strconv.Atoi(idParam)
	if err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid address ID", "BAD_REQUEST")
		return
	}

	parsedUserID, ok := utils.GetUserID(c)
	if !ok || parsedUserID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "User ID not found", "UNAUTHORIZED")
		return
	}

	err = h.ProfileService.DeleteUserAddress(c.Request.Context(), parsedUserID, addressID)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "Address deleted successfully", gin.H{"success": true})
}

func (h *ProfileHandler) SaveServiceProviderAddressHandler(c *gin.Context) {
	var req models.SPAddressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid request body", "BAD_REQUEST")
		return
	}

	parsedProviderID, ok := utils.GetUserID(c)
	if !ok || parsedProviderID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "Provider ID not found", "UNAUTHORIZED")
		return
	}

	address, err := h.ProfileService.SaveServiceProviderAddress(c.Request.Context(), parsedProviderID, req)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "Address saved successfully", address)
}

func (h *ProfileHandler) GetServiceProviderAddressHandler(c *gin.Context) {
	parsedProviderID, ok := utils.GetUserID(c)
	if !ok || parsedProviderID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "Provider ID not found", "UNAUTHORIZED")
		return
	}

	address, err := h.ProfileService.GetServiceProviderAddress(c.Request.Context(), parsedProviderID)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", address)
}

func (h *ProfileHandler) SubmitNIDHandler(c *gin.Context) {
	var req models.NIDSubmitRequest
	if err := c.ShouldBind(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid request body", "BAD_REQUEST")
		return
	}

	parsedProviderID, ok := utils.GetUserID(c)
	if !ok || parsedProviderID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "Provider ID not found in token", "UNAUTHORIZED")
		return
	}

	err := h.ProfileService.SubmitNIDDetails(c.Request.Context(), parsedProviderID, req)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", nil)
}

func (h *ProfileHandler) GetNIDStatusHandler(c *gin.Context) {
	parsedProviderID, ok := utils.GetUserID(c)
	if !ok || parsedProviderID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "Provider ID not found in token", "UNAUTHORIZED")
		return
	}

	statusResponse, err := h.ProfileService.GetNIDStatus(c.Request.Context(), parsedProviderID)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}
	response.SendSuccess(c.Writer, "", statusResponse)
}

func (h *ProfileHandler) UpdateServiceCatalogHandler(c *gin.Context) {
	var req models.ServiceCatalogDataRequest
	if err := c.ShouldBind(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid request body", "BAD_REQUEST")
		return
	}

	parsedProviderID, ok := utils.GetUserID(c)
	if !ok || parsedProviderID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "Provider ID not found in token", "UNAUTHORIZED")
		return
	}

	updatedCatalog, err := h.ProfileService.UpdateServiceCatalog(c.Request.Context(), parsedProviderID, req)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", updatedCatalog)
}

func (h *ProfileHandler) GetServiceCatalogHandler(c *gin.Context) {
	parsedProviderID, ok := utils.GetUserID(c)
	if !ok || parsedProviderID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "Provider ID not found in token", "UNAUTHORIZED")
		return
	}

	catalog, err := h.ProfileService.GetServiceCatalog(c.Request.Context(), parsedProviderID)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", catalog)
}
