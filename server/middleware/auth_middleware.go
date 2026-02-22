package middleware

import (
	"errors"
	"log"
	"net/http"
	"os"

	"fixora-server/models"
	"fixora-server/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString, err := c.Cookie("access_token")
		if err != nil {
			response.SendError(c.Writer, http.StatusUnauthorized, "Unauthorized - no access token", "NO_TOKEN")
			c.Abort()
			return
		}

		claims := &models.AppClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			secret := os.Getenv("JWT_SECRET")
			return []byte(secret), nil
		})

		if err != nil {
			if errors.Is(err, jwt.ErrTokenExpired) {
				response.SendError(c.Writer, http.StatusUnauthorized, "Token expired", "TOKEN_EXPIRED")
				c.Abort()
				return
			}
			log.Printf("RequireAuth: token parse error: %v", err)
			response.SendError(c.Writer, http.StatusUnauthorized, "Invalid token", "INVALID_TOKEN")
			c.Abort()
			return
		}

		if !token.Valid {
			response.SendError(c.Writer, http.StatusUnauthorized, "Invalid token", "INVALID_TOKEN")
			c.Abort()
			return
		}

		parsedUUID, err := uuid.Parse(claims.UserID)
		if err != nil {
			log.Printf("RequireAuth: invalid user id in token: %v", err)
			response.SendError(c.Writer, http.StatusUnauthorized, "Invalid user ID in token", "INVALID_TOKEN")
			c.Abort()
			return
		}
		c.Set("userID", parsedUUID)

		c.Set("userRole", claims.Role)

		c.Next()
	}
}
