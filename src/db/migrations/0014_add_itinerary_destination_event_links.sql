-- Add destination_id and event_id to itinerary_items for linking back to source
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS destination_id TEXT REFERENCES trip_destinations(id) ON DELETE SET NULL;
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS event_id TEXT REFERENCES destination_events(id) ON DELETE SET NULL;

-- Backfill destination_id from existing destination_highlight_id
UPDATE itinerary_items
SET destination_id = dh.destination_id
FROM destination_highlights dh
WHERE itinerary_items.destination_highlight_id = dh.id
  AND itinerary_items.destination_id IS NULL;
