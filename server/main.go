package main

import (
	"embed"
	"fixora-server/database"
	"fixora-server/handlers"
	"log"
	"net/http"
	"strings"

	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

//go:embed "dist"
var embeddedFiles embed.FS

func main() {
	router := gin.Default()
	distFS := getFileSystem("dist")
	router.Use(static.Serve("/", distFS))

	database.InitDB()

	// ------ Service provider registration API route ------
	router.POST("/api/register-service-provider", handlers.ServiceProviderRegisterHandler)

	//Serve frontend
	router.NoRoute(func(c *gin.Context) {
		// Only serve index.html
		if !strings.HasPrefix(c.Request.RequestURI, "/api") {
			index, err := distFS.Open("index.html")
			if err != nil {
				log.Fatal(err)
			}
			defer index.Close()
			stat, _ := index.Stat()
			http.ServeContent(c.Writer, c.Request, "index.html", stat.ModTime(), index)
			return
		}
		c.JSON(http.StatusNotFound, gin.H{"message": "API route not found"})
	})

	router.Run(":8080")
}

func getFileSystem(path string) static.ServeFileSystem {
	fs, err := static.EmbedFolder(embeddedFiles, path)
	if err != nil {
		log.Fatal(err)
	}
	return fs
}
