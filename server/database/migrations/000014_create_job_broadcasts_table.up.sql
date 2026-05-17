CREATE TYPE broadcast_status AS ENUM ('PENDING', 'ACCEPTED', 'MISSED', 'CANCELLED');

CREATE TABLE job_broadcasts (
    broadcast_id UUID PRIMARY KEY,
    job_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    job_broadcast_status broadcast_status DEFAULT 'PENDING',
    user_offer_price NUMERIC(10, 2), 
    provider_offer_price NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_broadcast_job
        FOREIGN KEY (job_id)
        REFERENCES job_requests(job_id) 
        ON DELETE CASCADE,
        
    CONSTRAINT fk_broadcast_provider 
        FOREIGN KEY (provider_id) 
        REFERENCES service_providers(provider_id) 
        ON DELETE CASCADE,

    CONSTRAINT uq_job_provider
        UNIQUE (job_id, provider_id)
);