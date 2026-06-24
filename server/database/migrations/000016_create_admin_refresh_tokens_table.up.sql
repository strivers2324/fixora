CREATE TABLE admin_refresh_tokens (
    admin_id UUID PRIMARY KEY,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL
);