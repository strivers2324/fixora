CREATE TABLE professions (
    id SERIAL PRIMARY KEY,
    profession_name VARCHAR(80) NOT NULL UNIQUE
);

INSERT INTO professions (profession_name) VALUES 
('Electrician'),
('AC Technician'),
('Refrigerator Mechanic'),
('Plumber'),
('Carpenter'),
('CCTV Installer'),
('Broadband Internet Provider'),
('IPS/Inverter Technician'),
('Washing Machine Technician'),
('Computer Technician'),
('TV Technician'),
('Automobile Mechanic'),
('Lift Technician'),
('Water Pump Technician'),
('Home Appliance Technician');

ALTER TABLE service_providers 
ADD COLUMN profession_id INT;

ALTER TABLE service_providers 
ADD CONSTRAINT fk_service_provider_profession
FOREIGN KEY (profession_id) 
REFERENCES professions(id);

ALTER TABLE service_providers 
DROP COLUMN profession;