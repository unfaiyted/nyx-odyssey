-- Add new columns to itinerary_items for highlight linking and travel info
ALTER TABLE "itinerary_items" ADD COLUMN "destination_highlight_id" text;
ALTER TABLE "itinerary_items" ADD COLUMN "lat" double precision;
ALTER TABLE "itinerary_items" ADD COLUMN "lng" double precision;
ALTER TABLE "itinerary_items" ADD COLUMN "travel_time_minutes" integer;
ALTER TABLE "itinerary_items" ADD COLUMN "travel_mode" text;
ALTER TABLE "itinerary_items" ADD COLUMN "travel_from_location" text;
ALTER TABLE "itinerary_items" ADD COLUMN "notes" text;

-- Add lat/lng to destination_highlights for travel calculations
ALTER TABLE "destination_highlights" ADD COLUMN "lat" double precision;
ALTER TABLE "destination_highlights" ADD COLUMN "lng" double precision;
