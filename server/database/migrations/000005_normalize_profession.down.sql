ALTER TABLE service_providers 
DROP CONSTRAINT IF EXISTS fk_service_provider_profession;

ALTER TABLE service_providers 
DROP COLUMN IF EXISTS profession_id;

ALTER TABLE service_providers 
ADD COLUMN profession VARCHAR(50);

DROP TABLE IF EXISTS professions;