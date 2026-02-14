package repository

import (
	"context"
	"database/sql"
	"fixora-server/models"

	"github.com/google/uuid"
)

type OrderRepository struct {
	db *sql.DB
}

func NewOrderRepository(db *sql.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

func (r *OrderRepository) GetUserID(ctx context.Context, phone string) (uuid.UUID, error) {
	var userID uuid.UUID

	query := `SELECT user_id FROM users WHERE phone = $1`

	err := r.db.QueryRowContext(ctx, query, phone).Scan(&userID)
	if err != nil {
		return uuid.Nil, err
	}
	return userID, nil
}

func (r *OrderRepository) GetServiceProviderID(ctx context.Context, phone string) (uuid.UUID, error) {
	var providerId uuid.UUID
	query := `SELECT provider_id FROM service_providers WHERE phone=$1`
	err := r.db.QueryRowContext(ctx, query, phone).Scan(&providerId)
	if err != nil {
		return uuid.Nil, err
	}
	return providerId, nil
}

func (r *OrderRepository) UpdateUserProfile(ctx context.Context, userID uuid.UUID, req models.UserProfileDataRequest) (*models.UserProfileData, error) {

	query := `
		INSERT INTO user_profiles (user_id, name, email, district, area, sub_area, profile_picture)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT (user_id) 
		DO UPDATE SET 
			name = EXCLUDED.name,
			email = EXCLUDED.email,
			district = EXCLUDED.district,
			area = EXCLUDED.area,
			sub_area = EXCLUDED.sub_area,
			profile_picture = EXCLUDED.profile_picture
		RETURNING name, email, district, area, sub_area, profile_picture`

	updatedProfile := models.UserProfileData{}

	err := r.db.QueryRowContext(ctx, query,
		userID,
		req.Name,
		req.Email,
		req.District,
		req.Area,
		req.SubArea,
		req.ProfilePicture,
	).Scan(
		&updatedProfile.Name,
		&updatedProfile.Email,
		&updatedProfile.District,
		&updatedProfile.Area,
		&updatedProfile.SubArea,
		&updatedProfile.ProfilePicture,
	)

	if err != nil {
		return nil, err
	}

	return &updatedProfile, nil
}

func (r *OrderRepository) UpdateServiceProviderProfile(ctx context.Context, providerID uuid.UUID, req models.ServiceProviderProfileDataRequest) (*models.ServiceProviderProfileData, error) {
	query := `
        INSERT INTO service_provider_profiles (provider_id, name, email, district, area, sub_area, profile_picture)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (provider_id)
        DO UPDATE SET 
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            district = EXCLUDED.district,
            area = EXCLUDED.area,
            sub_area = EXCLUDED.sub_area,
            profile_picture = EXCLUDED.profile_picture
        RETURNING name, email, district, area, sub_area, profile_picture`

	updatedProfile := models.ServiceProviderProfileData{}
	err := r.db.QueryRowContext(ctx, query,
		providerID,
		req.Name,
		req.Email,
		req.District,
		req.Area,
		req.SubArea,
		req.ProfilePicture,
	).Scan(
		&updatedProfile.Name,
		&updatedProfile.Email,
		&updatedProfile.District,
		&updatedProfile.Area,
		&updatedProfile.SubArea,
		&updatedProfile.ProfilePicture,
	)
	if err != nil {
		return nil, err
	}
	return &updatedProfile, nil
}

func (r *OrderRepository) GetUserProfileData(ctx context.Context, userID uuid.UUID) (*models.UserProfileData, error) {
	var profiledata models.UserProfileData

	query := `
		SELECT name, email, district, area, sub_area, profile_picture 
		FROM user_profiles 
		WHERE user_id = $1`

	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&profiledata.Name,
		&profiledata.Email,
		&profiledata.District,
		&profiledata.Area,
		&profiledata.SubArea,
		&profiledata.ProfilePicture,
	)
	if err != nil {
		return nil, err
	}
	return &profiledata, nil
}

func (r *OrderRepository) GetServiceProviderProfileData(ctx context.Context, providerID uuid.UUID) (*models.ServiceProviderProfileData, error) {
	var profiledata models.ServiceProviderProfileData
	query := `
        SELECT name, email, district, area, sub_area, profile_picture 
        FROM service_provider_profiles 
        WHERE provider_id = $1`

	err := r.db.QueryRowContext(ctx, query, providerID).Scan(
		&profiledata.Name, &profiledata.Email, &profiledata.District,
		&profiledata.Area, &profiledata.SubArea, &profiledata.ProfilePicture,
	)
	if err != nil {
		return nil, err
	}
	return &profiledata, nil
}
