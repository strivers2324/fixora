package handlers

import (
	"fixora-server/models"
	"fixora-server/service"
	"net/http"

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
