CREATE TYPE nid_status_enum AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

CREATE TABLE service_provider_nids (
    provider_id UUID PRIMARY KEY,
    nid_status nid_status_enum DEFAULT 'PENDING'
);