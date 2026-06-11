package utils

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func SetAuthCookies(c *gin.Context, accessToken, refreshToken string) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("access_token", accessToken, int(15*time.Minute.Seconds()), "/", "", false, true)
	c.SetCookie("refresh_token", refreshToken, int(15*24*time.Hour.Seconds()), "/", "", false, true)
}

func ClearAuthCookies(c *gin.Context) {
	c.SetCookie("access_token", "", -1, "/", "", false, true)
	c.SetCookie("refresh_token", "", -1, "/", "", false, true)
}
