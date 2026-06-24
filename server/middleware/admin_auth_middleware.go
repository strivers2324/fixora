package middleware

import (
	"errors"
	"log"
	"net/http"
	"strings"

	"fixora-server/models"
	"fixora-server/pkg/response"
	"fixora-server/pkg/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func RequireAdminAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString, err := c.Cookie("access_token")
		if err != nil {
			response.SendError(c.Writer, http.StatusUnauthorized, "Unauthorized - no access token", "NO_TOKEN")
			c.Abort()
			return
		}

		claims := &models.AppClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return utils.GetSecretKey(), nil
		})

		if err != nil {
			if errors.Is(err, jwt.ErrTokenExpired) {
				response.SendError(c.Writer, http.StatusUnauthorized, "Token expired", "TOKEN_EXPIRED")
				c.Abort()
				return
			}
			log.Printf("RequireAdminAuth: token parse error: %v", err)
			response.SendError(c.Writer, http.StatusUnauthorized, "Invalid token", "INVALID_TOKEN")
			c.Abort()
			return
		}

		if !token.Valid {
			response.SendError(c.Writer, http.StatusUnauthorized, "Invalid token", "INVALID_TOKEN")
			c.Abort()
			return
		}

		if strings.ToUpper(string(claims.Role)) != "ADMIN" {
			response.SendError(c.Writer, http.StatusForbidden, "Forbidden - Admin access required", "FORBIDDEN_ACCESS")
			c.Abort()
			return
		}
		c.Next()
	}
}
