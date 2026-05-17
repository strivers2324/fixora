CREATE TABLE service_provider_addresses (
    provider_id UUID PRIMARY KEY,
    district VARCHAR(100) NOT NULL,
    thana VARCHAR(100) NOT NULL,
    area VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),

    CONSTRAINT fk_provider_address
        FOREIGN KEY (provider_id) 
        REFERENCES service_providers(provider_id) 
        ON DELETE CASCADE
);