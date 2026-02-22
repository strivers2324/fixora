CREATE TYPE status AS ENUM ('pending', 'accepted', 'rejected');

CREATE TABLE IF NOT EXISTS service_provider_nids (
    provider_id UUID PRIMARY KEY,
    nid_number VARCHAR(50) NOT NULL,
    storage_folder_id VARCHAR(255) NOT NULL,
    nid_status status DEFAULT 'pending'
);