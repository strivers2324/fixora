package handlers

import (
	"errors"
	"fixora-server/models"
	"fixora-server/service"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	AuthService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{AuthService: authService}
}

// Register Handlers

func (h *AuthHandler) UserRegisterHandler(c *gin.Context) {
	var req models.UserRegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body"})
		return
	}

	if err := h.AuthService.RegisterUser(c.Request.Context(), req); err != nil {
		if errors.Is(err, service.ErrUserAlreadyExists) {
			c.JSON(http.StatusConflict, gin.H{"message": "Phone number already registered. Please login."})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Registration failed"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "User created. Please verify OTP."})
}

func (h *AuthHandler) ServiceProviderRegisterHandler(c *gin.Context) {
	var req models.ServiceProviderRegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body"})
		return
	}

	if err := h.AuthService.RegisterServiceProvider(c.Request.Context(), req); err != nil {
		if errors.Is(err, service.ErrUserAlreadyExists) {
			c.JSON(http.StatusConflict, gin.H{"message": "Phone number already registered. Please login."})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Registration failed"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Please verify OTP."})
}

// Verify Handlers

func (h *AuthHandler) VerifyUserPhoneHandler(c *gin.Context) {
	var req struct {
		Phone string `json:"phone"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
		return
	}

	accessToken, refreshToken, err := h.AuthService.VerifyUserPhone(c.Request.Context(), req.Phone)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Verification failed"})
		return
	}

	h.setAuthCookies(c, accessToken, refreshToken)
	c.JSON(http.StatusOK, gin.H{"message": "Verified and logged in", "role": models.USER})
}

func (h *AuthHandler) VerifyServiceProviderPhoneHandler(c *gin.Context) {
	var req struct {
		Phone string `json:"phone"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
		return
	}

	accessToken, refreshToken, err := h.AuthService.VerifyServiceProviderPhone(c.Request.Context(), req.Phone)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Verification failed"})
		return
	}

	h.setAuthCookies(c, accessToken, refreshToken)
	c.JSON(http.StatusOK, gin.H{"message": "Verified and logged in", "role": models.SERVICE_PROVIDER})
}

// Login Handler

func (h *AuthHandler) LoginHandler(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
		return
	}

	accessToken, refreshToken, err := h.AuthService.Login(c.Request.Context(), req)
	if err != nil {
		if errors.Is(err, service.ErrNotVerified) {
			c.JSON(http.StatusForbidden, gin.H{"message": "Account not verified", "code": "NOT_VERIFIED", "phone": req.Phone, "role": req.Role})
			return
		}
		if errors.Is(err, service.ErrInvalidCredentials) {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid phone or password"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Login failed"})
		return
	}

	h.setAuthCookies(c, accessToken, refreshToken)
	c.JSON(http.StatusOK, gin.H{"message": "Login successful", "role": req.Role})
}

// Token Handlers

func (h *AuthHandler) RefreshHandler(c *gin.Context) {
	cookieToken, err := c.Cookie("refresh_token")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "No refresh token provided"})
		return
	}

	newAccessToken, err := h.AuthService.RefreshToken(c.Request.Context(), cookieToken)
	if err != nil {
		h.clearAuthCookies(c)
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid refresh token"})
		return
	}

	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie("access_token", newAccessToken, int(15*time.Minute.Seconds()), "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Token refreshed"})
}

// Logout Handler

func (h *AuthHandler) LogoutHandler(c *gin.Context) {
	cookieToken, err := c.Cookie("refresh_token")
	if err == nil {
		_ = h.AuthService.Logout(c.Request.Context(), cookieToken)
	}
	h.clearAuthCookies(c)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out"})
}

func (h *AuthHandler) setAuthCookies(c *gin.Context, accessToken, refreshToken string) {
	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie("access_token", accessToken, int(15*time.Minute.Seconds()), "/", "", false, true)
	c.SetCookie("refresh_token", refreshToken, int(15*24*time.Hour.Seconds()), "/api/auth/refresh", "", false, true)
}

func (h *AuthHandler) clearAuthCookies(c *gin.Context) {
	c.SetCookie("access_token", "", -1, "/", "", false, true)
	c.SetCookie("refresh_token", "", -1, "/api/auth/refresh", "", false, true)
}
