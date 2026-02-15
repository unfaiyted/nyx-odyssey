-- Add home base fields to trips table
ALTER TABLE trips ADD COLUMN home_base_name text;
ALTER TABLE trips ADD COLUMN home_base_lat double precision;
ALTER TABLE trips ADD COLUMN home_base_lng double precision;
ALTER TABLE trips ADD COLUMN home_base_address text;
ALTER TABLE trips ADD COLUMN home_base_currency text;

-- Set Italy 2026 trip home base to Vicenza
UPDATE trips SET
  home_base_name = 'Vicenza (Home)',
  home_base_lat = 45.5485,
  home_base_lng = 11.5479,
  home_base_address = 'Contrà S. Rocco #60, Vicenza',
  home_base_currency = 'EUR'
WHERE name ILIKE '%italy%' OR name ILIKE '%italia%';
