package main

import (
	"context"
	"embed"
	"fixora-server/database"
	"fixora-server/handlers"
	"fixora-server/repository"
	"fixora-server/routes"
	"fixora-server/service"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

//go:embed "dist"
var embeddedFiles embed.FS

func main() {
	//environment variables
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	router := gin.Default()
	distFS := getFileSystem("dist")
	router.Use(static.Serve("/", distFS))

	db := database.InitDB()
	defer database.CloseDB(db)

	// Initialize repositories
	authRepo := repository.NewAuthRepository(db)

	// Initialize services
	authService := service.NewAuthService(authRepo)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)

	// Set up routes
	routes.SetAuthRoutes(router, authHandler)

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

	srv := &http.Server{
		Addr:    ":8080",
		Handler: router,
	}
	go func() {
		log.Println("Server is starting on port :8080")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown: ", err)
	}
	log.Println("Server exiting")
}

func getFileSystem(path string) static.ServeFileSystem {
	fs, err := static.EmbedFolder(embeddedFiles, path)
	if err != nil {
		log.Fatal(err)
	}
	return fs
}
