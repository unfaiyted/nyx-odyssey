-- Migration: Add trip_travelers table
-- Tracks who is on each trip with passport, loyalty, dietary, and emergency info

CREATE TABLE IF NOT EXISTS trip_travelers (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth TEXT,
  gender TEXT,
  passport_number TEXT,
  passport_expiry TEXT,
  passport_country TEXT,
  nationality TEXT,
  tsa_precheck TEXT,
  global_entry_number TEXT,
  known_traveler_number TEXT,
  airline_loyalty TEXT,
  hotel_loyalty TEXT,
  dietary_restrictions TEXT,
  accessibility_needs TEXT,
  medical_notes TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  seat_preference TEXT,
  room_preference TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trip_travelers_trip_id ON trip_travelers(trip_id);
