package utils

import "os"

func GetSecretKey() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		panic("FATAL: JWT_SECRET environment variable is not set")
	}
	return []byte(secret)
}
