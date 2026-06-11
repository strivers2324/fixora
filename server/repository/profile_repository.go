package repository

import (
	"context"
	"database/sql"
	"fixora-server/models"

	"github.com/google/uuid"
)

type ProfileRepository struct {
	db *sql.DB
}

func NewProfileRepository(db *sql.DB) *ProfileRepository {
	return &ProfileRepository{db: db}
}

func (r *ProfileRepository) UpdateUserProfile(ctx context.Context, userID uuid.UUID, req models.UserProfileDataRequest, profilePicURL string) (*models.UserProfileData, error) {
	query := `
        INSERT INTO user_profiles (user_id, name, email, profile_picture_url)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            profile_picture_url = CASE WHEN EXCLUDED.profile_picture_url = '' THEN user_profiles.profile_picture_url ELSE EXCLUDED.profile_picture_url END
        RETURNING name, email, profile_picture_url`

	updatedProfile := models.UserProfileData{}
	err := r.db.QueryRowContext(ctx, query,
		userID,
		req.Name,
		req.Email,
		profilePicURL,
	).Scan(
		&updatedProfile.Name,
		&updatedProfile.Email,
		&updatedProfile.ProfilePicture,
	)

	if err != nil {
		return nil, err
	}
	return &updatedProfile, nil
}

func (r *ProfileRepository) UpdateServiceProviderProfile(ctx context.Context, providerID uuid.UUID, req models.ServiceProviderProfileDataRequest, profilePicURL string) (*models.ServiceProviderProfileData, error) {
	query := `
        INSERT INTO service_provider_profiles (provider_id, name, email, profile_picture_url)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (provider_id)
        DO UPDATE SET 
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            profile_picture_url = CASE WHEN EXCLUDED.profile_picture_url = '' THEN service_provider_profiles.profile_picture_url ELSE EXCLUDED.profile_picture_url END
        RETURNING name, email, profile_picture_url`

	updatedProfile := models.ServiceProviderProfileData{}
	err := r.db.QueryRowContext(ctx, query,
		providerID,
		req.Name,
		req.Email,
		profilePicURL,
	).Scan(
		&updatedProfile.Name,
		&updatedProfile.Email,
		&updatedProfile.ProfilePicture,
	)
	if err != nil {
		return nil, err
	}
	return &updatedProfile, nil
}

func (r *ProfileRepository) GetUserProfileData(ctx context.Context, userID uuid.UUID) (*models.UserProfileData, error) {
	var profiledata models.UserProfileData
	query := `
        SELECT name, email, profile_picture_url
        FROM user_profiles 
        WHERE user_id = $1`

	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&profiledata.Name,
		&profiledata.Email,
		&profiledata.ProfilePicture,
	)
	if err != nil {
		return nil, err
	}
	return &profiledata, nil
}

func (r *ProfileRepository) GetServiceProviderProfileData(ctx context.Context, providerID uuid.UUID) (*models.ServiceProviderProfileData, error) {
	var profiledata models.ServiceProviderProfileData
	query := `
        SELECT name, email, profile_picture_url
        FROM service_provider_profiles 
        WHERE provider_id = $1`

	err := r.db.QueryRowContext(ctx, query, providerID).Scan(
		&profiledata.Name,
		&profiledata.Email,
		&profiledata.ProfilePicture,
	)
	if err != nil {
		return nil, err
	}
	return &profiledata, nil
}

func (r *ProfileRepository) GetUserAddresses(ctx context.Context, userID uuid.UUID) ([]models.UserAddressResponse, error) {
	query := `
        SELECT address_id, full_name, phone_number, district, thana, area, address, is_default, COALESCE(latitude, 0), COALESCE(longitude, 0)
        FROM user_addresses
        WHERE user_id = $1
        ORDER BY is_default DESC, address_id DESC`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var addresses []models.UserAddressResponse
	for rows.Next() {
		var addr models.UserAddressResponse
		if err := rows.Scan(
			&addr.AddressID, &addr.FullName, &addr.PhoneNumber, &addr.District,
			&addr.Thana, &addr.Area, &addr.Address, &addr.IsDefault, &addr.Latitude, &addr.Longitude,
		); err != nil {
			return nil, err
		}
		addresses = append(addresses, addr)
	}

	if addresses == nil {
		addresses = []models.UserAddressResponse{}
	}
	return addresses, nil
}

func (r *ProfileRepository) ClearUserDefaultAddress(ctx context.Context, userID uuid.UUID) error {
	query := `UPDATE user_addresses SET is_default = false WHERE user_id = $1`
	_, err := r.db.ExecContext(ctx, query, userID)
	return err
}

func (r *ProfileRepository) InsertUserAddress(ctx context.Context, userID uuid.UUID, req models.UserAddressRequest) (*models.UserAddressResponse, error) {
	query := `
        INSERT INTO user_addresses (user_id, full_name, phone_number, district, thana, area, address, is_default, latitude, longitude)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING address_id, full_name, phone_number, district, thana, area, address, is_default, COALESCE(latitude, 0), COALESCE(longitude, 0)`

	addr := models.UserAddressResponse{}
	err := r.db.QueryRowContext(ctx, query,
		userID, req.FullName, req.PhoneNumber, req.District, req.Thana, req.Area, req.Address, req.IsDefault, req.Latitude, req.Longitude,
	).Scan(
		&addr.AddressID, &addr.FullName, &addr.PhoneNumber, &addr.District, &addr.Thana, &addr.Area, &addr.Address, &addr.IsDefault, &addr.Latitude, &addr.Longitude,
	)
	if err != nil {
		return nil, err
	}
	return &addr, nil
}

func (r *ProfileRepository) UpdateUserAddress(ctx context.Context, userID uuid.UUID, addressID int, req models.UserAddressRequest) (*models.UserAddressResponse, error) {
	query := `
        UPDATE user_addresses 
        SET full_name = $1, phone_number = $2, district = $3, thana = $4, area = $5, address = $6, is_default = $7, latitude = $8, longitude = $9
        WHERE address_id = $10 AND user_id = $11
        RETURNING address_id, full_name, phone_number, district, thana, area, address, is_default, COALESCE(latitude, 0), COALESCE(longitude, 0)`

	addr := models.UserAddressResponse{}
	err := r.db.QueryRowContext(ctx, query,
		req.FullName, req.PhoneNumber, req.District, req.Thana, req.Area, req.Address, req.IsDefault, req.Latitude, req.Longitude,
		addressID, userID,
	).Scan(
		&addr.AddressID, &addr.FullName, &addr.PhoneNumber, &addr.District, &addr.Thana, &addr.Area, &addr.Address, &addr.IsDefault, &addr.Latitude, &addr.Longitude,
	)
	if err != nil {
		return nil, err
	}
	return &addr, nil
}

func (r *ProfileRepository) GetDefaultAddressInfo(ctx context.Context, userID uuid.UUID, addressID int) (bool, error) {
	var isDefault bool
	query := `SELECT is_default FROM user_addresses WHERE address_id = $1 AND user_id = $2`
	err := r.db.QueryRowContext(ctx, query, addressID, userID).Scan(&isDefault)
	if err != nil {
		return false, err
	}
	return isDefault, nil
}

func (r *ProfileRepository) DeleteUserAddress(ctx context.Context, userID uuid.UUID, addressID int) error {
	query := `DELETE FROM user_addresses WHERE address_id = $1 AND user_id = $2`
	_, err := r.db.ExecContext(ctx, query, addressID, userID)
	return err
}

func (r *ProfileRepository) GetServiceProviderAddress(ctx context.Context, providerID uuid.UUID) (*models.SPAddressResponse, error) {
	var addr models.SPAddressResponse
	query := `
        SELECT district, thana, area, address, COALESCE(latitude, 0), COALESCE(longitude, 0)
        FROM service_provider_addresses
        WHERE provider_id = $1`

	err := r.db.QueryRowContext(ctx, query, providerID).Scan(
		&addr.District, &addr.Thana, &addr.Area, &addr.Address, &addr.Latitude, &addr.Longitude,
	)
	if err != nil {
		return nil, err
	}
	return &addr, nil
}

func (r *ProfileRepository) SaveServiceProviderAddress(ctx context.Context, providerID uuid.UUID, req models.SPAddressRequest) (*models.SPAddressResponse, error) {
	query := `
        INSERT INTO service_provider_addresses (provider_id, district, thana, area, address, latitude, longitude)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (provider_id)
        DO UPDATE SET 
            district = EXCLUDED.district,
            thana = EXCLUDED.thana,
            area = EXCLUDED.area,
            address = EXCLUDED.address,
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude
        RETURNING district, thana, area, address, COALESCE(latitude, 0), COALESCE(longitude, 0)`

	addr := models.SPAddressResponse{}
	err := r.db.QueryRowContext(ctx, query,
		providerID, req.District, req.Thana, req.Area, req.Address, req.Latitude, req.Longitude,
	).Scan(
		&addr.District, &addr.Thana, &addr.Area, &addr.Address, &addr.Latitude, &addr.Longitude,
	)
	if err != nil {
		return nil, err
	}
	return &addr, nil
}

func (r *ProfileRepository) SaveNIDData(ctx context.Context, providerID uuid.UUID) error {
	query := `
        INSERT INTO service_provider_nids (provider_id, nid_status)
        VALUES ($1, $2)
        ON CONFLICT (provider_id) 
        DO UPDATE SET 
            nid_status = 'PENDING'
    `
	_, err := r.db.ExecContext(ctx, query, providerID, models.PENDING)
	return err
}

func (r *ProfileRepository) GetNIDStatus(ctx context.Context, providerID uuid.UUID) (*models.NIDStatusResponse, error) {
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

func (r *ProfileRepository) UpdateServiceCatalog(ctx context.Context, providerID uuid.UUID, req models.ServiceCatalogDataRequest) (*models.ServiceCatalogData, error) {
	query := `
		INSERT INTO service_catalogs (provider_id, min_charge, description, is_active)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (provider_id)
		DO UPDATE SET 
			min_charge = EXCLUDED.min_charge,
			description = EXCLUDED.description,
			is_active = EXCLUDED.is_active
		RETURNING min_charge, description, is_active`

	updatedCatalog := models.ServiceCatalogData{}

	err := r.db.QueryRowContext(ctx, query,
		providerID,
		req.MinCharge,
		req.Description,
		req.IsActive,
	).Scan(
		&updatedCatalog.MinCharge,
		&updatedCatalog.Description,
		&updatedCatalog.IsActive,
	)

	if err != nil {
		return nil, err
	}

	return &updatedCatalog, nil
}

func (r *ProfileRepository) GetServiceCatalog(ctx context.Context, providerID uuid.UUID) (*models.ServiceCatalogData, error) {
	var catalog models.ServiceCatalogData

	query := `
		SELECT min_charge, description, is_active
		FROM service_catalogs
		WHERE provider_id = $1`

	err := r.db.QueryRowContext(ctx, query, providerID).Scan(
		&catalog.MinCharge,
		&catalog.Description,
		&catalog.IsActive,
	)

	if err != nil {
		return nil, err
	}
	return &catalog, nil
}
