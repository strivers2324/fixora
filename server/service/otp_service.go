package service

import (
	"context"
	"crypto/rand"
	"database/sql"
	"io"
	"log"
	"time"

	"fixora-server/models"
	"fixora-server/pkg/apperrors"
	"fixora-server/repository"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type OTPService struct {
	OTPRepo    *repository.OTPRepository
	smsService *SmsService
}

func NewOTPService(otpRepo *repository.OTPRepository, smsService *SmsService) *OTPService {
	return &OTPService{OTPRepo: otpRepo, smsService: smsService}
}

func (s *OTPService) generateOTP(n int) string {
	const digits = "0123456789"
	b := make([]byte, n)
	_, err := io.ReadAtLeast(rand.Reader, b, n)
	if err != nil {
		log.Printf("Failed to generate random OTP: %v", err)
	}
	for i := range b {
		b[i] = digits[int(b[i])%len(digits)]
	}
	return string(b)
}

func (s *OTPService) GenerateAndSaveOTP(ctx context.Context, entityID uuid.UUID, role models.Role, otpType models.Type) (string, error) {
	attempt, err := s.OTPRepo.GetOTPAttemptInfo(ctx, entityID)
	if err != nil && err != sql.ErrNoRows {
		log.Printf("Error checking OTP attempt for entity %s: %v", entityID.String(), err)
		return "", apperrors.ErrInternalServer
	}

	newCount := 1
	maxLimit := 3
	if otpType == models.REGISTER {
		maxLimit = 5
	}

	if attempt != nil {
		if attempt.Count >= maxLimit {
			log.Printf("Blocked user %s for exceeding OTP limit", entityID.String())
			return "", apperrors.NewCustomError(429, "Maximum resend limit reached, please contact support", "LIMIT_REACHED")
		}
		newCount = attempt.Count + 1
	}

	if err := s.OTPRepo.UpdateOTPAttempt(ctx, &models.OTPAttempt{
		EntityID:      entityID,
		Count:         newCount,
		LastAttemptAt: time.Now().UTC(),
	}); err != nil {
		log.Printf("Failed to update OTP attempt before generating OTP: %v", err)
		return "", apperrors.ErrInternalServer
	}

	otpID, err := uuid.NewV7()
	if err != nil {
		return "", apperrors.ErrInternalServer
	}

	rawCode := s.generateOTP(4)
	hashCode, err := bcrypt.GenerateFromPassword([]byte(rawCode), bcrypt.DefaultCost)
	if err != nil {
		return "", apperrors.ErrInternalServer
	}

	otp := &models.OTP{
		ID:        otpID,
		EntityID:  entityID,
		Role:      role,
		Type:      otpType,
		OTPToken:  string(hashCode),
		ExpiresAt: time.Now().UTC().Add(3 * time.Minute),
	}

	if err := s.OTPRepo.InsertOTPInfo(ctx, otp); err != nil {
		return "", apperrors.ErrInternalServer
	}

	var phone string
	if role == models.USER {
		p, err := s.GetUserPhone(ctx, entityID)
		if err == nil {
			phone = p
		}
	} else if role == models.SERVICE_PROVIDER {
		p, err := s.GetServiceProviderPhone(ctx, entityID)
		if err == nil {
			phone = p
		}
	}

	if phone != "" {
		go func(targetPhone, otpCode string) {
			err := s.smsService.SendSMS(targetPhone, otpCode)
			if err != nil {
				log.Printf("Failed to send OTP SMS to %s: %v", targetPhone, err)
			} else {
				log.Printf("Successfully sent OTP SMS to %s", targetPhone)
			}
		}(phone, rawCode)
	} else {
		log.Printf("Phone number not found for entity: %s. Could not send SMS.", entityID.String())
	}

	// fmt.Printf(">>> [DEBUG SMS] Raw Code: %s (Save as Hash) for Entity: %s | Target Phone: %s\n", rawCode, entityID.String(), phone)

	return otpID.String(), nil
}

func (s *OTPService) CheckResendEligibility(ctx context.Context, otpID string) (*models.OTP, error) {
	oldOTP, err := s.OTPRepo.GetOTPInfo(ctx, otpID)
	if err != nil {
		return nil, apperrors.NewCustomError(400, "Invalid or expired OTP session", "INVALID_SESSION")
	}
	return oldOTP, nil
}

func (s *OTPService) PerformResend(ctx context.Context, oldOTP *models.OTP) (string, error) {
	if err := s.OTPRepo.DeleteOTP(ctx, oldOTP.ID.String()); err != nil {
		log.Printf("Failed to delete old OTP before resend: %v", err)
	}
	return s.GenerateAndSaveOTP(ctx, oldOTP.EntityID, models.Role(oldOTP.Role), models.Type(oldOTP.Type))
}

func (s *OTPService) ResendOTP(ctx context.Context, oldOtpID string) (string, error) {
	oldOTP, err := s.CheckResendEligibility(ctx, oldOtpID)
	if err != nil {
		return "", err
	}
	return s.PerformResend(ctx, oldOTP)
}

func (s *OTPService) OTPExpirationInfo(ctx context.Context, otpID string) (time.Time, string, error) {
	otp, err := s.OTPRepo.GetOTPInfo(ctx, otpID)
	if err != nil {
		return time.Time{}, "", apperrors.NewCustomError(400, "OTP session not found", "INVALID_SESSION")
	}

	var phone string
	if otp.Role == models.USER {
		p, err := s.OTPRepo.GetUserPhone(ctx, otp.EntityID)
		if err == nil {
			phone = p
		}
	} else if otp.Role == models.SERVICE_PROVIDER {
		p, err := s.OTPRepo.GetServiceProviderPhone(ctx, otp.EntityID)
		if err == nil {
			phone = p
		}
	}

	return otp.ExpiresAt, phone, nil
}

func (s *OTPService) GetOTPInfo(ctx context.Context, otpID string) (*models.OTP, error) {
	otp, err := s.OTPRepo.GetOTPInfo(ctx, otpID)
	if err != nil {
		return nil, apperrors.NewCustomError(400, "Invalid or expired OTP session", "INVALID_SESSION")
	}
	return otp, nil
}

func (s *OTPService) DeleteOTP(ctx context.Context, otpID string) error {
	err := s.OTPRepo.DeleteOTP(ctx, otpID)
	if err != nil {
		log.Printf("Failed to delete OTP %s: %v", otpID, err)
		return apperrors.ErrInternalServer
	}
	return nil
}

func (s *OTPService) UpdateOTPAttempt(ctx context.Context, attempt *models.OTPAttempt) error {
	err := s.OTPRepo.UpdateOTPAttempt(ctx, attempt)
	if err != nil {
		log.Printf("Failed to update OTP attempt for entity %s: %v", attempt.EntityID.String(), err)
		return apperrors.ErrInternalServer
	}
	return nil
}

func (s *OTPService) GetOTPID(ctx context.Context, entityID uuid.UUID) (uuid.UUID, error) {
	otpID, err := s.OTPRepo.GetOTPID(ctx, entityID)
	if err != nil {
		if err == sql.ErrNoRows {
			return uuid.Nil, apperrors.NewCustomError(404, "OTP not found", "NOT_FOUND")
		}
		return uuid.Nil, apperrors.ErrInternalServer
	}
	return otpID, nil
}

func (s *OTPService) GetUserPhone(ctx context.Context, userID uuid.UUID) (string, error) {
	phone, err := s.OTPRepo.GetUserPhone(ctx, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", apperrors.ErrUserNotFound
		}
		return "", apperrors.ErrInternalServer
	}
	return phone, nil
}

func (s *OTPService) GetServiceProviderPhone(ctx context.Context, providerID uuid.UUID) (string, error) {
	phone, err := s.OTPRepo.GetServiceProviderPhone(ctx, providerID)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", apperrors.ErrUserNotFound
		}
		return "", apperrors.ErrInternalServer
	}
	return phone, nil
}
