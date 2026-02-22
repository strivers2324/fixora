CREATE TABLE service_provider_profiles (
    provider_id UUID PRIMARY KEY,  
    name VARCHAR(255),
    email VARCHAR(255),
    profile_picture VARCHAR(512),
    district VARCHAR(100),
    area VARCHAR(100),
    sub_area VARCHAR(100),
    

    CONSTRAINT fk_provider
        FOREIGN KEY (provider_id) 
        REFERENCES service_providers(provider_id) 
        ON DELETE CASCADE
);