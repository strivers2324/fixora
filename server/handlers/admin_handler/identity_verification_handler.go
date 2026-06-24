package admin_handler

import (
	"net/http"

	"fixora-server/models"
	"fixora-server/pkg/response"
	"fixora-server/service/admin_service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type IdentityVerificationHandler struct {
	VerifyService *admin_service.IdentityVerificationService
}

func NewIdentityVerificationHandler(verifyService *admin_service.IdentityVerificationService) *IdentityVerificationHandler {
	return &IdentityVerificationHandler{VerifyService: verifyService}
}

func (h *IdentityVerificationHandler) GetVerificationsByStatusHandler(c *gin.Context) {
	statusQuery := c.Query("status")
	if statusQuery == "" {
		statusQuery = "PENDING"
	}

	status := models.NIDStatus(statusQuery)

	verifications, err := h.VerifyService.GetVerificationsByStatus(c.Request.Context(), status)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", verifications)
}

func (h *IdentityVerificationHandler) UpdateVerificationStatusHandler(c *gin.Context) {
	idParam := c.Param("id")
	providerID, err := uuid.Parse(idParam)
	if err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid provider ID format", "BAD_REQUEST")
		return
	}

	var req struct {
		Status models.NIDStatus `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid request body", "BAD_REQUEST")
		return
	}

	err = h.VerifyService.UpdateVerificationStatus(c.Request.Context(), providerID, req.Status)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "Verification status updated successfully", nil)
}
