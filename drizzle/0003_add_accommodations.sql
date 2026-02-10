CREATE TABLE IF NOT EXISTS "accommodations" (
  "id" text PRIMARY KEY NOT NULL,
  "trip_id" text NOT NULL,
  "destination_id" text,
  "name" text NOT NULL,
  "type" text DEFAULT 'hotel',
  "status" text DEFAULT 'researched',
  "address" text,
  "check_in" text,
  "check_out" text,
  "confirmation_code" text,
  "cost_per_night" numeric(10, 2),
  "total_cost" numeric(10, 2),
  "currency" text DEFAULT 'USD',
  "booking_url" text,
  "contact_phone" text,
  "contact_email" text,
  "rating" double precision,
  "notes" text,
  "booked" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "accommodations" ADD CONSTRAINT "accommodations_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "accommodations" ADD CONSTRAINT "accommodations_destination_id_trip_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "trip_destinations"("id") ON DELETE set null ON UPDATE no action;
