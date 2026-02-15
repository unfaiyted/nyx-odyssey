-- Add detail fields to destination_highlights
ALTER TABLE destination_highlights ADD COLUMN IF NOT EXISTS opening_hours text;
ALTER TABLE destination_highlights ADD COLUMN IF NOT EXISTS booking_url text;
ALTER TABLE destination_highlights ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE destination_highlights ADD COLUMN IF NOT EXISTS tips text; -- JSON array of tips
ALTER TABLE destination_highlights ADD COLUMN IF NOT EXISTS why_visit text;
ALTER TABLE destination_highlights ADD COLUMN IF NOT EXISTS estimated_visit_minutes integer;
ALTER TABLE destination_highlights ADD COLUMN IF NOT EXISTS notes text;

-- Highlight photos table for galleries
CREATE TABLE IF NOT EXISTS highlight_photos (
  id text PRIMARY KEY,
  highlight_id text NOT NULL REFERENCES destination_highlights(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp DEFAULT now() NOT NULL
);
