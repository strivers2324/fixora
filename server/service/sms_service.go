package service

import (
	"bytes"
	"encoding/json"
	"fixora-server/models"
	"fixora-server/pkg/utils"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type SmsService struct {
	smsSecret utils.SmsSecrets
}

func NewSmsService(smsSecrets utils.SmsSecrets) *SmsService {
	return &SmsService{
		smsSecret: smsSecrets,
	}
}

func (s *SmsService) SendSMS(phone, otp string) error {
	formattedPhone := strings.TrimPrefix(phone, "+")

	payload := models.SMSPayload{
		APIKey:   s.smsSecret.ApiKey,
		SenderID: s.smsSecret.SenderID,
		Number:   formattedPhone,
		Message:  fmt.Sprintf("Your Fixora OTP code is: %s. This code is valid for 3 minutes.", otp),
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", s.smsSecret.ApiUrl, bytes.NewBuffer(jsonPayload))
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
