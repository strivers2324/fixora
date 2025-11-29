package handlers

import (
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
	return &AuthHandler{
		AuthService: authService,
	}
}

func (h *AuthHandler) UserRegisterHandler(c *gin.Context) {
	var req models.UserRegisterRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body"})
		return
	}

	if err := h.AuthService.RegisterUser(req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not register"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Registration successful"})
}

func (h *AuthHandler) ServiceProviderRegisterHandler(c *gin.Context) {
	var req models.ServiceProviderRegisterRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body"})
		return
	}

	if err := h.AuthService.RegisterServiceProvider(req); err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not register"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Registration successful"})
}

func (h *AuthHandler) CheckUserPhoneHandler(c *gin.Context) {
	var req struct {
		Phone string `json:"phone"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body"})
		return
	}

	exists, err := h.AuthService.CheckUserPhone(req.Phone)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Server error checking phone"})
		return
	}

	if exists {
		c.JSON(http.StatusConflict, gin.H{"message": "Phone number already exists"})
		return
	}
}

func (h *AuthHandler) CheckServiceProviderPhoneHandler(c *gin.Context) {
	var req struct {
		Phone string `json:"phone"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body"})
		return
	}

	exists, err := h.AuthService.CheckServiceProviderPhone(req.Phone)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Server error checking phone"})
		return
	}

	if exists {
		c.JSON(http.StatusConflict, gin.H{"message": "Phone number already exists"})
		return
	}
}

func (h *AuthHandler) LoginHandler(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
		return
	}

	accessToken, refreshToken, err := h.AuthService.Login(req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": err.Error()})
		return
	}

	// JWT token
	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie("access_token", accessToken, int(15*time.Minute.Seconds()), "/", "", false, true)

	//Refresh token for self identity after 15 min
	c.SetCookie("refresh_token", refreshToken, int(15*24*time.Hour.Seconds()), "/api/refresh", "", false, true)

	c.JSON(http.StatusOK, gin.H{"message": "Login successful"})
}

func (h *AuthHandler) RefreshHandler(c *gin.Context) {
	cookieToken, err := c.Cookie("refresh_token")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "No refresh token provided"})
		return
	}

	newAccessToken, err := h.AuthService.RefreshToken(cookieToken)
	if err != nil {
		c.SetCookie("access_token", "", -1, "/", "", false, true)
		c.SetCookie("refresh_token", "", -1, "/api/refresh", "", false, true)
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid refresh token"})
		return
	}

	//renewwed token
	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie("access_token", newAccessToken, int(15*time.Minute.Seconds()), "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{"message": "Token refreshed"})
}

func (h *AuthHandler) LogoutHandler(c *gin.Context) {
	cookieToken, err := c.Cookie("refresh_token")
	if err == nil {
		h.AuthService.Logout(cookieToken)
	}

	c.SetCookie("access_token", "", -1, "/", "", false, true)
	c.SetCookie("refresh_token", "", -1, "/api/refresh", "", false, true)

	c.JSON(http.StatusOK, gin.H{"message": "Logged out"})
}
