-- Add event_id column to itinerary_items referencing destination_events
ALTER TABLE itinerary_items ADD COLUMN event_id TEXT REFERENCES destination_events(id) ON DELETE SET NULL;
CREATE INDEX idx_itinerary_items_event_id ON itinerary_items(event_id);
