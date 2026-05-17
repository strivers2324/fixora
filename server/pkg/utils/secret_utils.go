package utils

import "os"

func GetSecretKey() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		panic("FATAL: JWT_SECRET environment variable is not set")
	}
	return []byte(secret)
}

type SmsSecrets struct {
	ApiUrl   string
	ApiKey   string
	SenderID string
}

func GetSmsSercrets() SmsSecrets {
	apiUrl := os.Getenv("SMS_API_URL")
	apiKey := os.Getenv("SMS_API_KEY")
	senderID := os.Getenv("SMS_SENDER_ID")

	return SmsSecrets{
		ApiUrl:   apiUrl,
		ApiKey:   apiKey,
		SenderID: senderID,
	}
}
