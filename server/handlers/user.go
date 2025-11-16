package handlers

import (
	"fixora-server/database"
	"fixora-server/models"
	"net/http"

	"golang.org/x/crypto/bcrypt"

	"github.com/gin-gonic/gin"
)

func UserRegisterHandler(c *gin.Context) {
	var req struct {
		Phone    string `json:"phone"`
		Password string `json:"password"`
		FullName string `json:"full_name"`
		District string `json:"district"`
		Area     string `json:"area"`
		SubArea  string `json:"sub_area"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error creating password hash"})
		return
	}

	sp := models.User{
		Phone:        req.Phone,
		PasswordHash: string(hash),
		FullName:     req.FullName,
		District:     req.District,
		Area:         req.Area,
		SubArea:      req.SubArea,
	}

	if err := database.CreateUser(database.DB, sp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not register"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Registration successful"})
}
