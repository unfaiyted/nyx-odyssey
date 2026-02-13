-- Enhanced attractions table with detailed information
CREATE TABLE IF NOT EXISTS attractions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id TEXT NOT NULL REFERENCES trip_destinations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'attraction', -- museum, landmark, restaurant, nature, cultural, entertainment, shopping, other
  description TEXT,
  short_description TEXT,
  
  -- Practical info
  hours_json TEXT, -- JSON object with opening hours
  ticket_info TEXT,
  booking_url TEXT,
  official_url TEXT,
  
  -- Location
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  phone TEXT,
  email TEXT,
  
  -- Media
  hero_image_url TEXT,
  photos_json TEXT, -- JSON array of photo URLs
  
  -- Content
  history TEXT,
  visitor_tips TEXT, -- JSON array of tips
  
  -- Research status
  research_status TEXT DEFAULT 'pending', -- pending, in_progress, completed, needs_review
  research_priority TEXT DEFAULT 'low', -- low, medium, high
  research_requested_at TIMESTAMP,
  research_completed_at TIMESTAMP,
  research_request_count INTEGER DEFAULT 0,
  
  -- Metadata
  rating DOUBLE PRECISION,
  price_level INTEGER, -- 1-4 ($-$$$$)
  duration TEXT, -- e.g., "2-3 hours"
  
  -- Ordering
  order_index INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_attractions_destination_id ON attractions(destination_id);
CREATE INDEX IF NOT EXISTS idx_attractions_research_status ON attractions(research_status);
CREATE INDEX IF NOT EXISTS idx_attractions_type ON attractions(type);

-- Research requests table for tracking user requests
CREATE TABLE IF NOT EXISTS attraction_research_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  attraction_id TEXT REFERENCES attractions(id) ON DELETE CASCADE,
  destination_id TEXT NOT NULL REFERENCES trip_destinations(id) ON DELETE CASCADE,
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  
  -- Request details
  missing_hours BOOLEAN DEFAULT FALSE,
  missing_tickets BOOLEAN DEFAULT FALSE,
  missing_photos BOOLEAN DEFAULT FALSE,
  missing_history BOOLEAN DEFAULT FALSE,
  missing_tips BOOLEAN DEFAULT FALSE,
  missing_booking_links BOOLEAN DEFAULT FALSE,
  missing_other TEXT,
  
  priority TEXT DEFAULT 'low', -- low, medium, high
  notes TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'open', -- open, in_progress, completed, closed
  nyx_console_issue_id TEXT, -- Reference to external issue
  
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_research_requests_attraction_id ON attraction_research_requests(attraction_id);
CREATE INDEX IF NOT EXISTS idx_research_requests_status ON attraction_research_requests(status);
CREATE INDEX IF NOT EXISTS idx_research_requests_trip_id ON attraction_research_requests(trip_id);

-- Migrate existing highlights to attractions
INSERT INTO attractions (
  id, destination_id, name, type, description, address, lat, lng, 
  hero_image_url, official_url, rating, price_level, duration, 
  order_index, created_at, updated_at, research_status
)
SELECT 
  id, destination_id, title, category, description, address, lat, lng,
  image_url, website_url, rating, price_level, duration,
  order_index, created_at, updated_at, 'completed'
FROM destination_highlights
ON CONFLICT (id) DO NOTHING;
