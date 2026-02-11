-- Add transport fields to destination_research table
ALTER TABLE destination_research
ADD COLUMN IF NOT EXISTS drive_time_minutes integer,
ADD COLUMN IF NOT EXISTS drive_distance_km double precision,
ADD COLUMN IF NOT EXISTS drive_cost_euros numeric(10,2),
ADD COLUMN IF NOT EXISTS drive_route_notes text,
ADD COLUMN IF NOT EXISTS train_time_minutes integer,
ADD COLUMN IF NOT EXISTS train_cost_euros numeric(10,2),
ADD COLUMN IF NOT EXISTS train_route_notes text,
ADD COLUMN IF NOT EXISTS bus_time_minutes integer,
ADD COLUMN IF NOT EXISTS bus_cost_euros numeric(10,2),
ADD COLUMN IF NOT EXISTS bus_route_notes text,
ADD COLUMN IF NOT EXISTS taxi_time_minutes integer,
ADD COLUMN IF NOT EXISTS taxi_cost_euros numeric(10,2),
ADD COLUMN IF NOT EXISTS taxi_route_notes text,
ADD COLUMN IF NOT EXISTS route_polyline text;