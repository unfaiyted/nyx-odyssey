-- Flight research/comparison tables
-- flight_searches: search parameters and tracking
-- flight_options: individual flight options found during research
-- flight_price_history: price snapshots over time
-- price_alerts: price drop notifications

CREATE TABLE IF NOT EXISTS flight_searches (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  origin_city TEXT,
  destination_city TEXT,
  departure_date TEXT NOT NULL,
  return_date TEXT,
  passengers INTEGER NOT NULL DEFAULT 1,
  cabin_class TEXT DEFAULT 'economy',
  flexible BOOLEAN DEFAULT false,
  flexibility_days INTEGER,
  trip_type TEXT DEFAULT 'round_trip',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS flight_options (
  id TEXT PRIMARY KEY,
  search_id TEXT NOT NULL REFERENCES flight_searches(id) ON DELETE CASCADE,
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  airline TEXT NOT NULL,
  flight_numbers TEXT,
  route_type TEXT DEFAULT 'direct',
  stops INTEGER DEFAULT 0,
  layover_airports TEXT,
  layover_durations TEXT,
  departure_airport TEXT NOT NULL,
  arrival_airport TEXT NOT NULL,
  departure_date TEXT NOT NULL,
  departure_time TEXT,
  arrival_date TEXT NOT NULL,
  arrival_time TEXT,
  duration TEXT,
  return_departure_date TEXT,
  return_departure_time TEXT,
  return_arrival_date TEXT,
  return_arrival_time TEXT,
  return_duration TEXT,
  return_stops INTEGER,
  return_layover_airports TEXT,
  return_layover_durations TEXT,
  price_per_person NUMERIC(10,2),
  total_price NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  cabin_class TEXT DEFAULT 'economy',
  baggage_included TEXT,
  refundable BOOLEAN DEFAULT false,
  booking_url TEXT,
  booking_source TEXT,
  status TEXT DEFAULT 'found',
  comparison_notes TEXT,
  rating INTEGER,
  booked_flight_id TEXT REFERENCES flights(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS flight_price_history (
  id TEXT PRIMARY KEY,
  flight_option_id TEXT NOT NULL REFERENCES flight_options(id) ON DELETE CASCADE,
  price NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  source TEXT,
  checked_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS price_alerts (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  search_id TEXT REFERENCES flight_searches(id) ON DELETE SET NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_date TEXT NOT NULL,
  return_date TEXT,
  target_price NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  current_lowest_price NUMERIC(10,2),
  last_checked TIMESTAMP,
  triggered BOOLEAN DEFAULT false,
  triggered_at TIMESTAMP,
  active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for common queries
CREATE INDEX idx_flight_searches_trip_id ON flight_searches(trip_id);
CREATE INDEX idx_flight_options_search_id ON flight_options(search_id);
CREATE INDEX idx_flight_options_trip_id ON flight_options(trip_id);
CREATE INDEX idx_flight_options_status ON flight_options(status);
CREATE INDEX idx_flight_price_history_option_id ON flight_price_history(flight_option_id);
CREATE INDEX idx_price_alerts_trip_id ON price_alerts(trip_id);
CREATE INDEX idx_price_alerts_active ON price_alerts(active);
