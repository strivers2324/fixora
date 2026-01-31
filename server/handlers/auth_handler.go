package handlers

import (
	"net/http"
	"time"

	"fixora-server/models"
	"fixora-server/pkg/response"
	"fixora-server/pkg/utils"
	"fixora-server/service"

	"github.com/gin-gonic/gin"
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

func (h *AuthHandler) ResendOTPHandler(c *gin.Context) {
	var req models.ResendOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "otp_id is required", "BAD_REQUEST")
		return
	}

	newOtpID, err := h.AuthService.ResendOTP(c.Request.Context(), req.OtpID)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	response.SendSuccess(c.Writer, "", gin.H{"otp_id": newOtpID})
}

func (h *AuthHandler) UpdatePhoneHandler(c *gin.Context) {
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

func (h *AuthHandler) GetOTPInfoHandler(c *gin.Context) {
	otpID := c.Param("otp_id")
	if otpID == "" {
		response.SendError(c.Writer, http.StatusBadRequest, "otp_id is required", "BAD_REQUEST")
		return
	}
	expiry, phone, err := h.AuthService.OTPExpirationInfo(c.Request.Context(), otpID)
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

func (h *AuthHandler) LoginHandler(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c.Writer, http.StatusBadRequest, "Invalid request body", "BAD_REQUEST")
		return
	}

	accessToken, refreshToken, phone, isVerified, otpID, err := h.AuthService.Login(c.Request.Context(), req)
	if err != nil {
		response.HandleError(c.Writer, err)
		return
	}

	utils.SetAuthCookies(c, accessToken, refreshToken)

	response.SendSuccess(c.Writer, "", gin.H{
		"accountinfo": gin.H{
			"phone":             phone,
			"role":              req.Role,
			"is_phone_verified": isVerified,
		},
		"otp_id": otpID,
	})
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

	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie("access_token", newAccessToken, int(15*time.Minute.Seconds()), "/", "", false, true)

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

	resetToken, err := h.AuthService.VerifyOTP(c.Request.Context(), req.OtpID, req.OtpCode)
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
