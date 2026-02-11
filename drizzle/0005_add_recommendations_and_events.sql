-- Add trip recommendations table
CREATE TABLE IF NOT EXISTS "trip_recommendations" (
	"id" text PRIMARY KEY NOT NULL,
	"trip_id" text NOT NULL,
	"destination_id" text,
	"recommendation_number" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"added_date" text,
	"status" text DEFAULT 'pending',
	"what" text,
	"why_special" text,
	"logistics" text,
	"notes" text,
	"pro_tips" text,
	"events" text,
	"screenshot_path" text,
	"home_base_address" text,
	"home_base_lat" double precision,
	"home_base_lng" double precision,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add destination events table
CREATE TABLE IF NOT EXISTS "destination_events" (
	"id" text PRIMARY KEY NOT NULL,
	"destination_id" text NOT NULL,
	"recommendation_id" text,
	"name" text NOT NULL,
	"description" text,
	"event_type" text DEFAULT 'performance',
	"start_date" text,
	"end_date" text,
	"start_time" text,
	"ticket_url" text,
	"ticket_price_from" text,
	"ticket_price_to" text,
	"currency" text DEFAULT 'EUR',
	"interested" boolean DEFAULT false,
	"booked" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
ALTER TABLE "trip_recommendations" ADD CONSTRAINT "trip_recommendations_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "trip_recommendations" ADD CONSTRAINT "trip_recommendations_destination_id_trip_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."trip_destinations"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "destination_events" ADD CONSTRAINT "destination_events_destination_id_trip_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."trip_destinations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "destination_events" ADD CONSTRAINT "destination_events_recommendation_id_trip_recommendations_id_fk" FOREIGN KEY ("recommendation_id") REFERENCES "public"."trip_recommendations"("id") ON DELETE set null ON UPDATE no action;
