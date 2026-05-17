package service

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"fixora-server/models"
	"fixora-server/pkg/apperrors"
	"fixora-server/repository"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AccountService struct {
	AccountRepo *repository.AccountRepository
	OTPService  *OTPService
	AuthService *AuthService
}

func NewAccountService(accountRepo *repository.AccountRepository, otpService *OTPService, authService *AuthService) *AccountService {
	return &AccountService{
		AccountRepo: accountRepo,
		OTPService:  otpService,
		AuthService: authService,
	}
}

func (s *AccountService) ChangePassword(ctx context.Context, entityID uuid.UUID, role models.Role, req models.ChangePasswordRequest) error {
	var currentHash string
	var err error

	if role == models.USER {
		currentHash, err = s.AccountRepo.GetUserPassword(ctx, entityID)
	} else if role == models.SERVICE_PROVIDER {
		currentHash, err = s.AccountRepo.GetServiceProviderPassword(ctx, entityID)
	} else {
		return apperrors.NewCustomError(403, "Invalid user role", "FORBIDDEN")
	}

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return apperrors.ErrUserNotFound
		}
		return apperrors.ErrInternalServer
	}

	if err := bcrypt.CompareHashAndPassword([]byte(currentHash), []byte(req.OldPassword)); err != nil {
		return apperrors.ErrInvalidOldPassword
	}

	newHashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return apperrors.ErrInternalServer
	}

	if role == models.USER {
		return s.AccountRepo.UpdateUserPassword(ctx, entityID, string(newHashedPassword))
	} else {
		return s.AccountRepo.UpdateServiceProviderPassword(ctx, entityID, string(newHashedPassword))
	}
}

func (s *AccountService) ChangePhoneNumber(ctx context.Context, entityID uuid.UUID, role models.Role, newPhone string) (string, error) {
	var exists bool
	var err error

	if role == models.USER {
		exists, err = s.AuthService.CheckUserExists(ctx, newPhone)
	} else if role == models.SERVICE_PROVIDER {
		exists, err = s.AuthService.CheckServiceProviderExists(ctx, newPhone)
	} else {
		return "", apperrors.NewCustomError(400, "Invalid user role", "INVALID_ROLE")
	}

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			exists = false
		}
		return "", apperrors.ErrInternalServer
	}

	if exists {
		return "", apperrors.ErrUserExists
	}

	otpID, err := s.OTPService.GenerateAndSaveOTP(ctx, entityID, role, models.CHANGE_PHONE)
	if err != nil {
		return "", err
	}

	return otpID, nil
}

func (s *AccountService) VerifyOTPAndChangePhone(ctx context.Context, otpID, code, newPhone string) error {
	otp, err := s.OTPService.GetOTPInfo(ctx, otpID)
	if err != nil {
		return err
	}

	if time.Now().UTC().After(otp.ExpiresAt) {
		s.OTPService.DeleteOTP(ctx, otpID)
		return apperrors.NewCustomError(400, "OTP has expired", "OTP_EXPIRED")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(otp.OTPToken), []byte(code)); err != nil {
		return apperrors.ErrInvalidOTP
	}

	var exists bool

	if otp.Role == models.USER {
		exists, err = s.AuthService.CheckUserExists(ctx, newPhone)
		if err != nil {
			return apperrors.ErrInternalServer
		}
		if exists {
			return apperrors.ErrUserExists
		}

		err = s.AccountRepo.UpdateUserPhone(ctx, otp.EntityID, newPhone)

	} else if otp.Role == models.SERVICE_PROVIDER {
		exists, err = s.AuthService.CheckServiceProviderExists(ctx, newPhone)
		if err != nil {
			return apperrors.ErrInternalServer
		}
		if exists {
			return apperrors.ErrProviderExists
		}

		err = s.AccountRepo.UpdateServiceProviderPhone(ctx, otp.EntityID, newPhone)

	} else {
		return apperrors.NewCustomError(400, "Invalid role found in session", "INVALID_ROLE")
	}

	if err != nil {
		return apperrors.ErrInternalServer
	}

	if err := s.OTPService.DeleteOTP(ctx, otpID); err != nil {
		return err
	}

	if err := s.OTPService.UpdateOTPAttempt(ctx, &models.OTPAttempt{
		EntityID:      otp.EntityID,
		Count:         0,
		LastAttemptAt: time.Now().UTC(),
	}); err != nil {
		return err
	}

	return nil
}

func (s *AccountService) UpdateUserPhone(ctx context.Context, userID uuid.UUID, newPhone string) error {
	if err := s.AccountRepo.UpdateUserPhone(ctx, userID, newPhone); err != nil {
		return apperrors.ErrInternalServer
	}
	return nil
}

func (s *AccountService) UpdateServiceProviderPhone(ctx context.Context, providerID uuid.UUID, newPhone string) error {
	if err := s.AccountRepo.UpdateServiceProviderPhone(ctx, providerID, newPhone); err != nil {
		return apperrors.ErrInternalServer
	}
	return nil
}

func (s *AccountService) UpdateUserPassword(ctx context.Context, userID uuid.UUID, newHash string) error {
	if err := s.AccountRepo.UpdateUserPassword(ctx, userID, newHash); err != nil {
		return apperrors.ErrInternalServer
	}
	return nil
}

func (s *AccountService) UpdateServiceProviderPassword(ctx context.Context, providerID uuid.UUID, newHash string) error {
	if err := s.AccountRepo.UpdateServiceProviderPassword(ctx, providerID, newHash); err != nil {
		return apperrors.ErrInternalServer
	}
	return nil
}
