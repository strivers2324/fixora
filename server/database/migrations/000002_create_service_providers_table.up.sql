CREATE TABLE service_providers (
    user_id UUID PRIMARY KEY, 
    phone VARCHAR(15) NOT NULL UNIQUE,
    profession VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_phone_verified BOOLEAN DEFAULT FALSE
);