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

type AuthHandler struct {
	AuthService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{AuthService: authService}
}

func (h *AuthHandler) UserRegisterHandler(c *gin.Context) {
	var req models.UserRegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid request body", "BAD_REQUEST")
		return
	}

	otpID, err := h.AuthService.RegisterUser(c.Request.Context(), req)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", gin.H{"otp_id": otpID})
}

func (h *AuthHandler) ServiceProviderRegisterHandler(c *gin.Context) {
	var req models.ServiceProviderRegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid request body", "BAD_REQUEST")
		return
	}

	otpID, err := h.AuthService.RegisterServiceProvider(c.Request.Context(), req)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", gin.H{"otp_id": otpID})
}

func (h *AuthHandler) VerifyUserPhoneHandler(c *gin.Context) {
	var req models.OTPVerifyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "otp_id and otp_code are required", "BAD_REQUEST")
		return
	}

	if err := h.AuthService.VerifyUserPhone(c.Request.Context(), req.OtpID, req.OtpCode); err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", nil)
}

func (h *AuthHandler) VerifyServiceProviderPhoneHandler(c *gin.Context) {
	var req models.OTPVerifyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "otp_id and otp_code are required", "BAD_REQUEST")
		return
	}

	if err := h.AuthService.VerifyServiceProviderPhone(c.Request.Context(), req.OtpID, req.OtpCode); err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", nil)
}

func (h *AuthHandler) LoginHandler(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid request body", "BAD_REQUEST")
		return
	}

	accessToken, refreshToken, phone, isVerified, otpID, profession, err := h.AuthService.Login(c.Request.Context(), req)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	utils.SetAuthCookies(c, accessToken, refreshToken)

	accountInfo := gin.H{
		"phone":             phone,
		"role":              req.Role,
		"is_phone_verified": isVerified,
	}

	if req.Role == "service_provider" {
		accountInfo["profession"] = profession
	}

	response.SendSuccess(c.Writer, "Login successful", gin.H{
		"accountinfo": accountInfo,
		"otp_id":      otpID,
	})
}

func (h *AuthHandler) VerifySessionHandler(c *gin.Context) {
	userID, ok := utils.GetUserID(c)
	if !ok || userID == uuid.Nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "User ID not found in token", "UNAUTHORIZED")
		return
	}

	userRoleModelsRole, ok := utils.GetUserRole(c)
	if !ok {
		response.SendError(c.Writer, http.StatusUnauthorized, "User role not found in token", "UNAUTHORIZED")
		return
	}

	userRole := string(userRoleModelsRole)

	sessionData, err := h.AuthService.GetSessionData(c.Request.Context(), userID, userRole)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", sessionData)
}

func (h *AuthHandler) RefreshHandler(c *gin.Context) {
	cookieToken, err := c.Cookie("refresh_token")
	if err != nil {
		response.SendError(c.Writer, http.StatusUnauthorized, "No refresh token provided", "NO_TOKEN")
		return
	}

	newAccessToken, err := h.AuthService.RefreshToken(c.Request.Context(), cookieToken)
	if err != nil {
		utils.ClearAuthCookies(c)
		response.HandleError(c.Writer, err)
		return
	}

	utils.SetAuthCookies(c, newAccessToken, cookieToken)
	response.SendSuccess(c.Writer, "", nil)
}

func (h *AuthHandler) LogoutHandler(c *gin.Context) {
	cookieToken, err := c.Cookie("refresh_token")
	if err == nil {
		if logoutErr := h.AuthService.Logout(c.Request.Context(), cookieToken); logoutErr != nil {
			response.HandleError(c.Writer, logoutErr)
			return
		}
	}
	utils.ClearAuthCookies(c)
	response.SendSuccess(c.Writer, "", nil)
}

func (h *AuthHandler) ForgotPasswordHandler(c *gin.Context) {
	var req models.ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid request body", "BAD_REQUEST")
		return
	}

	otpID, err := h.AuthService.ForgotPassword(c.Request.Context(), req.Phone, req.Role)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", gin.H{"otp_id": otpID})
}

func (h *AuthHandler) VerifyOTPHandler(c *gin.Context) {
	var req models.OTPVerifyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "otp_id and otp_code are required", "BAD_REQUEST")
		return
	}

	resetToken, err := h.AuthService.VerifyPasswordResetOTP(c.Request.Context(), req.OtpID, req.OtpCode)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", gin.H{"reset_token": resetToken})
}

func (h *AuthHandler) ResetPasswordHandler(c *gin.Context) {
	var req models.ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid request body", "BAD_REQUEST")
		return
	}

	err := h.AuthService.ResetPassword(c.Request.Context(), req.ResetToken, req.NewPassword)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", nil)
}

func (h *AuthHandler) GetProfessionsHandler(c *gin.Context) {
	professions, err := h.AuthService.GetProfessions(c.Request.Context())
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}
	response.SendSuccess(c.Writer, "", professions)
}

func (h *AuthHandler) UpdatePhoneAndResendOTPHandler(c *gin.Context) {
	var req models.UpdatePhoneRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid phone number or otp_id", "BAD_REQUEST")
		return
	}

	newOtpID, err := h.AuthService.UpdatePhoneAndResendOTP(c.Request.Context(), req.OtpID, req.NewPhone)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", gin.H{"otp_id": newOtpID})
}
