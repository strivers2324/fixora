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

type JobHandler struct {
	JobService *service.JobService
}

func NewJobHandler(jobService *service.JobService) *JobHandler {
	return &JobHandler{JobService: jobService}
}

func (h *JobHandler) SearchProvidersHandler(c *gin.Context) {
	var req models.SearchProviderRequest

	if err := c.ShouldBindQuery(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid search parameters", "BAD_REQUEST")
		return
	}

	results, err := h.JobService.GetNearbyProviders(c.Request.Context(), req)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "Nearby providers fetched successfully", results)
}

func (h *JobHandler) BookExpertHandler(c *gin.Context) {
	userID, ok := utils.GetUserID(c)
	if !ok || userID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "User not authenticated", "UNAUTHORIZED")
		return
	}

	var payload models.BookExpertPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid payload", "BAD_REQUEST")
		return
	}

	jobID, err := h.JobService.BookExpert(c.Request.Context(), userID, payload.ProviderID, payload.JobID, payload.JobDetails)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "Job requested successfully", gin.H{"job_id": jobID})
}

func (h *JobHandler) ProviderOfferHandler(c *gin.Context) {
	jobIDParam := c.Param("job_id")
	jobID, err := uuid.Parse(jobIDParam)
	if err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid Job ID", "BAD_REQUEST")
		return
	}

	providerID, ok := utils.GetUserID(c)
	if !ok || providerID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "Provider not authenticated", "UNAUTHORIZED")
		return
	}

	var payload models.ProviderOfferPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid payload", "BAD_REQUEST")
		return
	}

	err = h.JobService.SubmitProviderOffer(c.Request.Context(), providerID, jobID, payload.ProviderOfferPrice)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "Offer submitted successfully", nil)
}

func (h *JobHandler) UpdateUserOfferHandler(c *gin.Context) {
	jobIDParam := c.Param("job_id")
	jobID, err := uuid.Parse(jobIDParam)
	if err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid Job ID", "BAD_REQUEST")
		return
	}

	userID, ok := utils.GetUserID(c)
	if !ok || userID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "User not authenticated", "UNAUTHORIZED")
		return
	}

	var payload models.UserOfferPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid payload", "BAD_REQUEST")
		return
	}

	err = h.JobService.UpdateUserOffer(c.Request.Context(), userID, jobID, payload.ProviderID, payload.UserOfferPrice)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "User offer updated successfully", nil)
}

func (h *JobHandler) AcceptJobHandler(c *gin.Context) {
	jobIDParam := c.Param("job_id")
	jobID, err := uuid.Parse(jobIDParam)
	if err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid Job ID", "BAD_REQUEST")
		return
	}

	providerID, ok := utils.GetUserID(c)
	if !ok || providerID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "Provider not authenticated", "UNAUTHORIZED")
		return
	}

	err = h.JobService.AcceptJob(c.Request.Context(), providerID, jobID)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "Job accepted successfully", nil)
}

func (h *JobHandler) CancelJobByUserHandler(c *gin.Context) {
	jobIDParam := c.Param("job_id")
	jobID, err := uuid.Parse(jobIDParam)
	if err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid Job ID", "BAD_REQUEST")
		return
	}

	userID, ok := utils.GetUserID(c)
	if !ok || userID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "User not authenticated", "UNAUTHORIZED")
		return
	}

	var payload models.CancelJobPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Cancellation reason is required", "BAD_REQUEST")
		return
	}

	err = h.JobService.CancelJobByUser(c.Request.Context(), userID, jobID, payload.Reason)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "Job cancelled successfully by user", nil)
}

func (h *JobHandler) CancelJobByProviderHandler(c *gin.Context) {
	jobIDParam := c.Param("job_id")
	jobID, err := uuid.Parse(jobIDParam)
	if err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid Job ID", "BAD_REQUEST")
		return
	}

	providerID, ok := utils.GetUserID(c)
	if !ok || providerID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "Provider not authenticated", "UNAUTHORIZED")
		return
	}

	var payload models.CancelJobPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Cancellation reason is required", "BAD_REQUEST")
		return
	}

	err = h.JobService.CancelJobByProvider(c.Request.Context(), providerID, jobID, payload.Reason)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "Job cancelled and reset to pending successfully", nil)
}

func (h *JobHandler) CompleteJobHandler(c *gin.Context) {
	jobIDParam := c.Param("job_id")
	jobID, err := uuid.Parse(jobIDParam)
	if err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid Job ID", "BAD_REQUEST")
		return
	}

	providerID, ok := utils.GetUserID(c)
	if !ok || providerID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "Provider not authenticated", "UNAUTHORIZED")
		return
	}

	err = h.JobService.CompleteJobByProvider(c.Request.Context(), providerID, jobID)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "Job completed successfully", nil)
}

func (h *JobHandler) GetUserDashboardHandler(c *gin.Context) {
	userID, ok := utils.GetUserID(c)
	if !ok || userID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "User not authenticated", "UNAUTHORIZED")
		return
	}

	data, err := h.JobService.GetUserDashboard(c.Request.Context(), userID)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}
	response.SendSuccess(c.Writer, "User dashboard data fetched", data)
}

func (h *JobHandler) GetProviderDashboardHandler(c *gin.Context) {
	providerID, ok := utils.GetUserID(c)
	if !ok || providerID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "Provider not authenticated", "UNAUTHORIZED")
		return
	}

	data, err := h.JobService.GetProviderDashboard(c.Request.Context(), providerID)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}
	response.SendSuccess(c.Writer, "Provider dashboard data fetched", data)
}
