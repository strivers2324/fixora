package models

import (
	"time"

	"github.com/google/uuid"
)

type JobStatus string

const (
	JobStatusPending   JobStatus = "PENDING"
	JobStatusAccepted  JobStatus = "ACCEPTED"
	JobStatusCompleted JobStatus = "COMPLETED"
	JobStatusCancelled JobStatus = "CANCELLED"
)

type BroadcastStatus string

const (
	BroadcastStatusPending   BroadcastStatus = "PENDING"
	BroadcastStatusAccepted  BroadcastStatus = "ACCEPTED"
	BroadcastStatusMissed    BroadcastStatus = "MISSED"
	BroadcastStatusCancelled BroadcastStatus = "CANCELLED"
)

type JobRequest struct {
	JobID              uuid.UUID  `json:"job_id" db:"job_id"`
	UserID             uuid.UUID  `json:"user_id" db:"user_id"`
	ProfessionID       int        `json:"profession_id" db:"profession_id"`
	ProblemDetails     string     `json:"problem_details" db:"problem_details"`
	AddressID          int        `json:"address_id" db:"address_id"`
	JobStatus          JobStatus  `json:"status" db:"job_status"`
	AcceptedProviderID *uuid.UUID `json:"accepted_provider_id" db:"accepted_provider_id"`
	AcceptedAt         *time.Time `json:"accepted_at" db:"accepted_at"`
	CancellationReason *string    `json:"cancellation_reason" db:"cancellation_reason"`
	CreatedAt          time.Time  `json:"created_at" db:"created_at"`
}

type JobBroadcast struct {
	BroadcastID        uuid.UUID       `json:"broadcast_id" db:"broadcast_id"`
	JobID              uuid.UUID       `json:"job_id" db:"job_id"`
	ProviderID         uuid.UUID       `json:"provider_id" db:"provider_id"`
	JobBroadcastStatus BroadcastStatus `json:"job_broadcast_status" db:"job_broadcast_status"`
	UserOfferPrice     *float64        `json:"user_offer_price" db:"user_offer_price"`
	ProviderOfferPrice *float64        `json:"provider_offer_price" db:"provider_offer_price"`
	CreatedAt          time.Time       `json:"created_at" db:"created_at"`
}

type CreateJobRequest struct {
	ProfessionID   int      `json:"profession_id" validate:"required"`
	ProblemDetails string   `json:"problem_details" validate:"required"`
	AddressID      int      `json:"address_id" validate:"required"`
	UserOfferPrice *float64 `json:"user_offer_price"`
}

type SearchProviderRequest struct {
	ProfessionID int `form:"profession_id" binding:"required"`
	AddressID    int `form:"address_id" binding:"required"`
}

type ProviderSearchResponse struct {
	ProviderID        uuid.UUID `json:"provider_id" db:"provider_id"`
	Name              string    `json:"name" db:"name"`
	ProfilePictureURL string    `json:"profile_picture_url" db:"profile_picture_url"`
	ProfessionID      int       `json:"profession_id" db:"profession_id"`
	Latitude          float64   `json:"latitude" db:"latitude"`
	Longitude         float64   `json:"longitude" db:"longitude"`
	MinCharge         float64   `json:"min_charge" db:"min_charge"`
	Description       string    `json:"description" db:"description"`
}

type BookExpertPayload struct {
	JobID      *uuid.UUID       `json:"job_id"`
	ProviderID uuid.UUID        `json:"provider_id" binding:"required"`
	JobDetails CreateJobRequest `json:"job_details"`
}

type ProviderOfferPayload struct {
	ProviderOfferPrice float64 `json:"provider_offer_price" binding:"required"`
}

type UserOfferPayload struct {
	ProviderID     uuid.UUID `json:"provider_id" binding:"required"`
	UserOfferPrice float64   `json:"user_offer_price" binding:"required"`
}

type CancelJobPayload struct {
	Reason string `json:"reason" binding:"required"`
}

type JobSummaryForUser struct {
	JobID              uuid.UUID  `json:"job_id" db:"job_id"`
	ProblemDetails     string     `json:"problem_details" db:"problem_details"`
	JobStatus          JobStatus  `json:"status" db:"job_status"`
	District           string     `json:"district" db:"district"`
	Thana              string     `json:"thana" db:"thana"`
	Area               string     `json:"area" db:"area"`
	Address            string     `json:"address" db:"address"`
	Latitude           *float64   `json:"latitude" db:"latitude"`
	Longitude          *float64   `json:"longitude" db:"longitude"`
	ProviderID         *uuid.UUID `json:"provider_id" db:"provider_id"`
	ProviderName       *string    `json:"provider_name" db:"provider_name"`
	ProviderPhone      *string    `json:"provider_phone" db:"provider_phone"`
	UserOfferPrice     *float64   `json:"user_offer_price" db:"user_offer_price"`
	ProviderOfferPrice *float64   `json:"provider_offer_price" db:"provider_offer_price"`
	AcceptedAt         *time.Time `json:"accepted_at" db:"accepted_at"`
	CreatedAt          time.Time  `json:"created_at" db:"created_at"`
}

type JobSummaryForProvider struct {
	JobID              uuid.UUID        `json:"job_id" db:"job_id"`
	ProblemDetails     string           `json:"problem_details" db:"problem_details"`
	JobStatus          JobStatus        `json:"status" db:"job_status"`
	FullName           string           `json:"full_name" db:"full_name"`
	PhoneNumber        string           `json:"phone_number" db:"phone_number"`
	District           string           `json:"district" db:"district"`
	Thana              string           `json:"thana" db:"thana"`
	Area               string           `json:"area" db:"area"`
	Address            string           `json:"address" db:"address"`
	Latitude           *float64         `json:"latitude" db:"latitude"`
	Longitude          *float64         `json:"longitude" db:"longitude"`
	UserOfferPrice     *float64         `json:"user_offer_price" db:"user_offer_price"`
	ProviderOfferPrice *float64         `json:"provider_offer_price" db:"provider_offer_price"`
	BroadcastStatus    *BroadcastStatus `json:"broadcast_status" db:"job_broadcast_status"`
	AcceptedAt         *time.Time       `json:"accepted_at" db:"accepted_at"`
	CreatedAt          time.Time        `json:"created_at" db:"created_at"`
}

type UserDashboardResponse struct {
	ActiveJobs []JobSummaryForUser `json:"active_jobs"`
	JobHistory []JobSummaryForUser `json:"history"`
}

type ProviderDashboardResponse struct {
	ActiveJob       *JobSummaryForProvider  `json:"active_job"`
	PendingRequests []JobSummaryForProvider `json:"requests"`
	JobHistory      []JobSummaryForProvider `json:"history"`
}
