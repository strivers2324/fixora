CREATE TABLE refresh_tokens (
    user_id UUID PRIMARY KEY,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL
);