CREATE TABLE user_addresses (
    address_id SERIAL PRIMARY KEY, 
    user_id UUID NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    district VARCHAR(100) NOT NULL,
    thana VARCHAR(100) NOT NULL,
    area VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),

    CONSTRAINT fk_user_address
        FOREIGN KEY (user_id) 
        REFERENCES users(user_id) 
        ON DELETE CASCADE
);