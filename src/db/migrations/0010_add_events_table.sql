-- Add events table for tracking shows, concerts, sporting events, etc.
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  destination_id TEXT REFERENCES trip_destinations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  venue TEXT,
  category TEXT DEFAULT 'show',
  date TEXT,
  time TEXT,
  duration_minutes INTEGER,
  price_min NUMERIC(10, 2),
  price_max NUMERIC(10, 2),
  currency TEXT DEFAULT 'EUR',
  tickets_needed INTEGER DEFAULT 1,
  booking_url TEXT,
  status TEXT DEFAULT 'researched',
  notes TEXT,
  rating DOUBLE PRECISION,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_trip_id ON events(trip_id);
CREATE INDEX IF NOT EXISTS idx_events_destination_id ON events(destination_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
