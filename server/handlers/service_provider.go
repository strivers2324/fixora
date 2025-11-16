package handlers

import (
	"fixora-server/database"
	"fixora-server/models"
	"net/http"

	"golang.org/x/crypto/bcrypt"

	"github.com/gin-gonic/gin"
)

func ServiceProviderRegisterHandler(c *gin.Context) {
	var req struct {
		Phone       string `json:"phone"`
		Profession  string `json:"profession"`
		Password    string `json:"password"`
		FullName    string `json:"full_name"`
		District    string `json:"district"`
		Area        string `json:"area"`
		SubArea     string `json:"sub_area"`
		NidNumber   string `json:"nid_number"`
		NidFrontUrl string `json:"nid_front_url"`
		NidBackUrl  string `json:"nid_back_url"`
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

	sp := models.ServiceProvider{
		Phone:        req.Phone,
		Profession:   req.Profession,
		PasswordHash: string(hash),
		FullName:     req.FullName,
		District:     req.District,
		Area:         req.Area,
		SubArea:      req.SubArea,
		NidNumber:    req.NidNumber,
		NidFrontUrl:  req.NidFrontUrl,
		NidBackUrl:   req.NidBackUrl,
	}

	if err := database.CreateServiceProvider(database.DB, sp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Could not register"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Registration successful"})
}
