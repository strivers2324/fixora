package admin_handler

import (
	"net/http"

	"fixora-server/models"
	"fixora-server/pkg/response"
	"fixora-server/pkg/utils"
	"fixora-server/service/admin_service"

	"github.com/gin-gonic/gin"
)

type AdminAuthHandler struct {
	AdminAuthService *admin_service.AdminAuthService
}

func NewAdminAuthHandler(adminAuthService *admin_service.AdminAuthService) *AdminAuthHandler {
	return &AdminAuthHandler{AdminAuthService: adminAuthService}
}

func (h *AdminAuthHandler) AdminLoginHandler(c *gin.Context) {
	var req models.AdminLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid request body", "BAD_REQUEST")
		return
	}

	accessToken, refreshToken, err := h.AdminAuthService.AdminLogin(c.Request.Context(), req)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	utils.SetAuthCookies(c, accessToken, refreshToken)

	response.SendSuccess(c.Writer, "Admin login successful", nil)
}

func (h *AdminAuthHandler) AdminRefreshHandler(c *gin.Context) {
	cookieToken, err := c.Cookie("refresh_token")
	if err != nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "No refresh token provided", "NO_TOKEN")
		return
	}

	newAccessToken, err := h.AdminAuthService.RefreshToken(c.Request.Context(), cookieToken)
	if err != nil {
		utils.ClearAuthCookies(c)
		response.HandleError(c.Writer, err)
		return
	}

	utils.SetAuthCookies(c, newAccessToken, cookieToken)
	response.SendSuccess(c.Writer, "", nil)
}

func (h *AdminAuthHandler) AdminLogoutHandler(c *gin.Context) {
	cookieToken, err := c.Cookie("refresh_token")
	if err == nil {
		if logoutErr := h.AdminAuthService.Logout(c.Request.Context(), cookieToken); logoutErr != nil {
			response.HandleError(c.Writer, logoutErr)
			return
		}
	}

	utils.ClearAuthCookies(c)
	response.SendSuccess(c.Writer, "Logged out successfully", nil)
}

func (h *AdminAuthHandler) VerifyAdminSessionHandler(c *gin.Context) {
	adminSession := gin.H{
		"role": "ADMIN",
	}
	response.SendSuccess(c.Writer, "Admin session is valid", adminSession)
}
