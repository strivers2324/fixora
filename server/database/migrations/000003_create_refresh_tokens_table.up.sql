CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(15) NOT NULL,
    role VARCHAR(50) NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);