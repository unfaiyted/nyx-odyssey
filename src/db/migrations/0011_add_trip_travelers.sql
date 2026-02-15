-- Trip Travelers
CREATE TABLE IF NOT EXISTS trip_travelers (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth TEXT,
  gender TEXT,
  -- Passport info
  passport_number TEXT,
  passport_country TEXT,
  passport_expiry TEXT,
  -- Travel docs
  tsa_precheck_number TEXT,
  global_entry_number TEXT,
  known_traveler_number TEXT,
  -- Preferences
  dietary_needs TEXT, -- JSON array
  meal_preference TEXT,
  seat_preference TEXT, -- window, aisle, middle
  special_assistance TEXT,
  -- Meta
  notes TEXT,
  is_primary BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Traveler Loyalty Programs
CREATE TABLE IF NOT EXISTS traveler_loyalty_programs (
  id TEXT PRIMARY KEY,
  traveler_id TEXT NOT NULL REFERENCES trip_travelers(id) ON DELETE CASCADE,
  program_type TEXT NOT NULL, -- airline, hotel, car_rental, other
  program_name TEXT NOT NULL,
  member_number TEXT NOT NULL,
  tier_status TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Traveler Emergency Contacts
CREATE TABLE IF NOT EXISTS traveler_emergency_contacts (
  id TEXT PRIMARY KEY,
  traveler_id TEXT NOT NULL REFERENCES trip_travelers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_trip_travelers_trip_id ON trip_travelers(trip_id);
CREATE INDEX IF NOT EXISTS idx_traveler_loyalty_traveler_id ON traveler_loyalty_programs(traveler_id);
CREATE INDEX IF NOT EXISTS idx_traveler_emergency_traveler_id ON traveler_emergency_contacts(traveler_id);
