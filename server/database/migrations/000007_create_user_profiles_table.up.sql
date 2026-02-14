CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY,  
    name VARCHAR(255),
    email VARCHAR(255),
    profile_picture VARCHAR(512),
    district VARCHAR(100),
    area VARCHAR(100),
    sub_area VARCHAR(100),
    

    CONSTRAINT fk_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(user_id) 
        ON DELETE CASCADE
);