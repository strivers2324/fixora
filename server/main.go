package main

import (
	"embed"
	"fixora-server/database"
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

	router.NoRoute(func(c *gin.Context) {
		// Only serve index.html for non-API routes
		if !strings.HasPrefix(c.Request.RequestURI, "/api") {
			index, err := distFS.Open("index.html")
			if err != nil {
				log.Fatal(err)
			}
			defer index.Close()
			stat, _ := index.Stat()
			http.ServeContent(c.Writer, c.Request, "index.html", stat.ModTime(), index)
		}
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
