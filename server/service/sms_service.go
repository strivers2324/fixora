package service

import (
	"bytes"
	"encoding/json"
	"fixora-server/models"
	"fixora-server/pkg/utils"
	"fmt"
	"io"
	"math/rand"
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

func (s *SmsService) getRandomSenderID() string {
	senderIDs := strings.Split(s.smsSecret.SenderID, ",")

	r := rand.New(rand.NewSource(time.Now().UnixNano()))

	return senderIDs[r.Intn(len(senderIDs))]
}

func (s *SmsService) SendSMS(phone, otp string) error {
	formattedPhone := strings.TrimPrefix(phone, "+")

	selectedSenderID := s.getRandomSenderID()

	fmt.Printf(">>> [DEBUG SMS] Sending OTP via SenderID: %s to %s\n", selectedSenderID, phone)

	payload := models.SMSPayload{
		APIKey:   s.smsSecret.ApiKey,
		SenderID: selectedSenderID,
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
