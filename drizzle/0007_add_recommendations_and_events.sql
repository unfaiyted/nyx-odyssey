-- Add trip recommendations and destination events tables

-- Trip Recommendations
CREATE TABLE IF NOT EXISTS trip_recommendations (
  id text PRIMARY KEY DEFAULT nanoid(),
  trip_id text NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  destination_id text REFERENCES trip_destinations(id) ON DELETE SET NULL,
  recommendation_number text NOT NULL,
  title text NOT NULL,
  description text,
  what text,
  why_special text,
  logistics text,
  notes text,
  pro_tips text,
  events text,
  status text DEFAULT 'pending',
  added_date text,
  screenshot_path text,
  home_base_address text,
  home_base_lat double precision,
  home_base_lng double precision,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

-- Destination Events
CREATE TABLE IF NOT EXISTS destination_events (
  id text PRIMARY KEY DEFAULT nanoid(),
  destination_id text NOT NULL REFERENCES trip_destinations(id) ON DELETE CASCADE,
  recommendation_id text REFERENCES trip_recommendations(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  event_type text DEFAULT 'performance',
  dates text,
  start_date text,
  end_date text,
  website_url text,
  booking_url text,
  price text,
  notes text,
  created_at timestamp DEFAULT now() NOT NULL
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_trip_recommendations_trip_id ON trip_recommendations(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_recommendations_destination_id ON trip_recommendations(destination_id);
CREATE INDEX IF NOT EXISTS idx_trip_recommendations_status ON trip_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_destination_events_destination_id ON destination_events(destination_id);
CREATE INDEX IF NOT EXISTS idx_destination_events_recommendation_id ON destination_events(recommendation_id);
