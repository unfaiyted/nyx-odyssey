-- Add event tracking fields to destination_events
-- Some columns may already exist from prior migrations; use IF NOT EXISTS pattern

DO $$ BEGIN
  -- Drop old columns that are being replaced
  ALTER TABLE destination_events DROP COLUMN IF EXISTS dates;
  ALTER TABLE destination_events DROP COLUMN IF EXISTS website_url;
  ALTER TABLE destination_events DROP COLUMN IF EXISTS price;
  ALTER TABLE destination_events DROP COLUMN IF EXISTS interested;
  ALTER TABLE destination_events DROP COLUMN IF EXISTS booked;

  -- Add new columns
  ALTER TABLE destination_events ADD COLUMN IF NOT EXISTS end_time text;
  ALTER TABLE destination_events ADD COLUMN IF NOT EXISTS venue text;
  ALTER TABLE destination_events ADD COLUMN IF NOT EXISTS venue_address text;
  ALTER TABLE destination_events ADD COLUMN IF NOT EXISTS status text DEFAULT 'researched';
  ALTER TABLE destination_events ADD COLUMN IF NOT EXISTS booking_url text;
  ALTER TABLE destination_events ADD COLUMN IF NOT EXISTS confirmation_code text;
  ALTER TABLE destination_events ADD COLUMN IF NOT EXISTS group_size integer DEFAULT 1;
  ALTER TABLE destination_events ADD COLUMN IF NOT EXISTS total_cost numeric(10,2);

  -- Rename ticket_url if it doesn't exist as ticket_url (it already does in DB)
  -- ticket_price_from and ticket_price_to already exist
  -- currency already exists
  -- start_time already exists
END $$;
