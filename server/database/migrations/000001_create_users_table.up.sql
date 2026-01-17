CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    phone VARCHAR(15) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
    is_phone_verified BOOLEAN DEFAULT FALSE
);