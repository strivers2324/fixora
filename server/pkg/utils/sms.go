package utils

import (
	"bytes"
	"encoding/json"
	"fixora-server/models"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

func SendSMS(phone, otp string) error {
	apiUrl := os.Getenv("SMS_API_URL")
	apiKey := os.Getenv("SMS_API_KEY")
	senderID := os.Getenv("SMS_SENDER_ID")

	formattedPhone := strings.TrimPrefix(phone, "+")

	payload := models.SMSPayload{
		APIKey:   apiKey,
		SenderID: senderID,
		Number:   formattedPhone,
		Message:  fmt.Sprintf("Your Fixora OTP code is: %s. This code is valid for 3 minutes.", otp),
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", apiUrl, bytes.NewBuffer(jsonPayload))
	if err != nil {
		return err
	}

	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	fmt.Println(">>> OneCodeSoft Actual Response:", string(bodyBytes))

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to send SMS, status code: %d", resp.StatusCode)
	}

	return nil
}
