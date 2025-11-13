CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    phone VARCHAR(15) PRIMARY KEY NOT NULL UNIQUE,
    uuid UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,   
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    district VARCHAR(50),
    area VARCHAR(50),
    sub_area VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);