package admin_repository

import (
	"context"
	"database/sql"
	"fixora-server/models"

	"github.com/google/uuid"
)

type IdentityVerificationRepository struct {
	db *sql.DB
}

func NewIdentityVerificationRepository(db *sql.DB) *IdentityVerificationRepository {
	return &IdentityVerificationRepository{db: db}
}

func (r *IdentityVerificationRepository) GetVerificationsByStatus(ctx context.Context, status models.NIDStatus) ([]models.IdentityVerification, error) {
	query := `
		SELECT 
			n.provider_id, 
			COALESCE(p.name, 'New Provider') AS name, 
			n.nid_status
		FROM 
			service_provider_nids n
		LEFT JOIN 
			service_provider_profiles p ON n.provider_id = p.provider_id
		WHERE 
			n.nid_status = $1`

	rows, err := r.db.QueryContext(ctx, query, string(status))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var verifications []models.IdentityVerification
	for rows.Next() {
		var v models.IdentityVerification
		if err := rows.Scan(
			&v.ProviderID,
			&v.Name,
			&v.Status,
		); err != nil {
			return nil, err
		}
		verifications = append(verifications, v)
	}

	if verifications == nil {
		verifications = []models.IdentityVerification{}
	}
	return verifications, nil
}
func (r *IdentityVerificationRepository) UpdateVerificationStatus(ctx context.Context, providerID uuid.UUID, status models.NIDStatus) error {
	query := `
		UPDATE service_provider_nids 
		SET nid_status = $1
		WHERE provider_id = $2`

	_, err := r.db.ExecContext(ctx, query, string(status), providerID)
	return err
}
