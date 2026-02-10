CREATE TABLE IF NOT EXISTS "rental_cars" (
	"id" text PRIMARY KEY NOT NULL,
	"trip_id" text NOT NULL,
	"company" text NOT NULL,
	"vehicle_type" text DEFAULT 'compact',
	"vehicle_name" text,
	"status" text DEFAULT 'researched',
	"pickup_location" text,
	"dropoff_location" text,
	"pickup_date" text,
	"pickup_time" text,
	"dropoff_date" text,
	"dropoff_time" text,
	"daily_rate" numeric(10, 2),
	"total_cost" numeric(10, 2),
	"currency" text DEFAULT 'EUR',
	"confirmation_code" text,
	"booking_url" text,
	"insurance_included" boolean DEFAULT false,
	"mileage_policy" text,
	"fuel_policy" text,
	"transmission" text DEFAULT 'manual',
	"notes" text,
	"rating" double precision,
	"created_at" timestamp DEFAULT now() NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "rental_cars" ADD CONSTRAINT "rental_cars_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
