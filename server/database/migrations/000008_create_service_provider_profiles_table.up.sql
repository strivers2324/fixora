CREATE TABLE service_provider_profiles (
                                           provider_id UUID PRIMARY KEY,
                                           name VARCHAR(255) NOT NULL,
                                           email VARCHAR(255),
                                           profile_picture_url VARCHAR(512),

                                           CONSTRAINT fk_provider
                                               FOREIGN KEY (provider_id)
                                                   REFERENCES service_providers(provider_id)
                                                   ON DELETE CASCADE
);