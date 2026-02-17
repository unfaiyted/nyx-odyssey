-- Add lat/lng to accommodations for distance calculations
ALTER TABLE accommodations ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE accommodations ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
