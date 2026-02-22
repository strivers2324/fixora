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

func (r *OrderRepository) GetUserPassword(ctx context.Context, userID uuid.UUID) (string, error) {
	var hash string
	query := `SELECT password_hash FROM users WHERE user_id = $1`
	err := r.db.QueryRowContext(ctx, query, userID).Scan(&hash)
	if err != nil {
		return "", err
	}
	return hash, nil
}

func (r *OrderRepository) GetServiceProviderPassword(ctx context.Context, providerID uuid.UUID) (string, error) {
	var hash string
	query := `SELECT password_hash FROM service_providers WHERE provider_id = $1`
	err := r.db.QueryRowContext(ctx, query, providerID).Scan(&hash)
	if err != nil {
		return "", err
	}
	return hash, nil
}

func (r *OrderRepository) UpdateUserPassword(ctx context.Context, userID uuid.UUID, newHash string) error {
	query := `UPDATE users SET password_hash = $1 WHERE user_id = $2`

	result, err := r.db.ExecContext(ctx, query, newHash, userID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}

func (r *OrderRepository) UpdateServiceProviderPassword(ctx context.Context, providerID uuid.UUID, newHash string) error {
	query := `UPDATE service_providers SET password_hash = $1 WHERE provider_id = $2`

	result, err := r.db.ExecContext(ctx, query, newHash, providerID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}

func (r *OrderRepository) SaveNIDData(ctx context.Context, providerID uuid.UUID, req models.NIDSubmitRequest) error {
	query := `
		INSERT INTO service_provider_nids (provider_id, nid_number, storage_folder_id, nid_status)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (provider_id) 
		DO UPDATE SET 
			nid_number = EXCLUDED.nid_number,
			storage_folder_id = EXCLUDED.storage_folder_id,
			nid_status = 'pending'
	`
	_, err := r.db.ExecContext(ctx, query, providerID, req.NIDNumber, req.StorageFolderID, models.PENDING)
	return err
}

func (r *OrderRepository) GetNIDStatus(ctx context.Context, providerID uuid.UUID) (*models.NIDStatusResponse, error) {
	var response models.NIDStatusResponse

	query := `
		SELECT nid_status 
		FROM service_provider_nids 
		WHERE provider_id = $1
	`

	err := r.db.QueryRowContext(ctx, query, providerID).Scan(&response.Status)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &response, nil
}
