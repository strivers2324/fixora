CREATE TABLE otps (
    id UUID PRIMARY KEY,
    entity_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL,
    type VARCHAR(50) NOT NULL,
    otp_token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE otp_attempts (
    entity_id UUID PRIMARY KEY,
    count INT DEFAULT 1,
    last_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL
);