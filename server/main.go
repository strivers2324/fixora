package main

import (
	"context"
	"embed"
	"fixora-server/database"
	"fixora-server/handlers"
	"fixora-server/handlers/admin_handler"
	"fixora-server/pkg/utils"
	"fixora-server/repository"
	"fixora-server/repository/admin_repository"
	"fixora-server/routes"
	"fixora-server/service"
	"fixora-server/service/admin_service"

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

//go:embed dist
var embeddedFiles embed.FS

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: No .env file found. Falling back to system/docker environment variables.")
	}
	smsSecrets := utils.GetSmsSecrets()
	router := gin.Default()
	distFS := getFileSystem("dist")
	router.Use(static.Serve("/", distFS))

	db := database.InitDB()
	defer database.CloseDB(db)

	authRepo := repository.NewAuthRepository(db)
	otpRepo := repository.NewOTPRepository(db)
	accountRepo := repository.NewAccountRepository(db)
	profileRepo := repository.NewProfileRepository(db)
	jobRepo := repository.NewJobRepository(db)
	adminAuthRepo := admin_repository.NewAdminAuthRepository(db)
	adminIdentityRepo := admin_repository.NewIdentityVerificationRepository(db)

	smsService := service.NewSmsService(smsSecrets)
	otpService := service.NewOTPService(otpRepo, smsService)
	profileService := service.NewProfileService(profileRepo)
	accountService := service.NewAccountService(accountRepo, otpService, nil)
	authService := service.NewAuthService(authRepo, otpService, accountService)
	accountService.AuthService = authService
	jobService := service.NewJobService(jobRepo)
	adminAuthService := admin_service.NewAdminAuthService(adminAuthRepo)
	adminIdentityService := admin_service.NewIdentityVerificationService(adminIdentityRepo)

	authHandler := handlers.NewAuthHandler(authService)
	otpHandler := handlers.NewOTPHandler(otpService)
	accountHandler := handlers.NewAccountHandler(accountService)
	profileHandler := handlers.NewProfileHandler(profileService)
	jobHandler := handlers.NewJobHandler(jobService)
	adminAuthHandler := admin_handler.NewAdminAuthHandler(adminAuthService)
	adminIdentityHandler := admin_handler.NewIdentityVerificationHandler(adminIdentityService)

	routes.SetupRoutes(router, authHandler, otpHandler, accountHandler, profileHandler, jobHandler, adminAuthHandler, adminIdentityHandler)

	router.NoRoute(func(c *gin.Context) {
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
		Addr:    ":80",
		Handler: router,
	}
	go func() {
		log.Println("Server is starting on port :80")
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
