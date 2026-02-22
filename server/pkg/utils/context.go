package utils

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"fixora-server/models"
)

func GetUserID(c *gin.Context) (uuid.UUID, bool) {
	v, ok := c.Get("userID")
	if !ok {
		return uuid.Nil, false
	}
	if id, ok := v.(uuid.UUID); ok {
		return id, true
	}
	if s, ok := v.(string); ok {
		parsed, err := uuid.Parse(s)
		if err == nil {
			return parsed, true
		}
	}
	return uuid.Nil, false
}

func GetUserRole(c *gin.Context) (models.Role, bool) {
	v, ok := c.Get("userRole")
	if !ok {
		return "", false
	}
	if r, ok := v.(models.Role); ok {
		return r, true
	}
	if s, ok := v.(string); ok {
		return models.Role(s), true
	}
	return "", false
}
