CREATE TABLE service_catalogs (
    provider_id UUID PRIMARY KEY,
    min_charge NUMERIC(10, 2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_catalog_provider 
        FOREIGN KEY (provider_id) 
        REFERENCES service_providers(provider_id) 
        ON DELETE CASCADE
);