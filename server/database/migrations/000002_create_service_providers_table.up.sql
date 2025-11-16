CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE service_providers (
    phone VARCHAR(15) PRIMARY KEY NOT NULL UNIQUE,
    uuid UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE, 
    profession VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    district VARCHAR(50),
    area VARCHAR(50),
    sub_area VARCHAR(50),
    nid_number VARCHAR(30),
    nid_front_url TEXT,
    nid_back_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);