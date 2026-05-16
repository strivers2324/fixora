CREATE TYPE job_status AS ENUM ('PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED');

CREATE TABLE job_requests (
    job_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    profession_id INT NOT NULL,
    problem_details TEXT NOT NULL, 
    address_id INT NOT NULL,   
    job_status job_status DEFAULT 'PENDING',
    accepted_provider_id UUID,
    accepted_at TIMESTAMP WITH TIME ZONE, 
    cancellation_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_job_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(user_id) 
        ON DELETE CASCADE,
        
    CONSTRAINT fk_job_profession 
        FOREIGN KEY (profession_id) 
        REFERENCES professions(id),
        
    CONSTRAINT fk_job_address 
        FOREIGN KEY (address_id) 
        REFERENCES user_addresses(address_id),
        
    CONSTRAINT fk_job_accepted_provider 
        FOREIGN KEY (accepted_provider_id) 
        REFERENCES service_providers(provider_id)
);