CREATE TABLE IF NOT EXISTS "weight_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"weight" double precision NOT NULL,
	"unit" text DEFAULT 'lbs',
	"body_fat_pct" double precision,
	"muscle_mass_pct" double precision,
	"water_pct" double precision,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nutrition_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"meal_type" text DEFAULT 'meal',
	"name" text NOT NULL,
	"calories" double precision,
	"protein" double precision,
	"carbs" double precision,
	"fat" double precision,
	"fiber" double precision,
	"sugar" double precision,
	"sodium" double precision,
	"serving_size" text,
	"servings" double precision DEFAULT 1,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workouts" (
	"id" text PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'strength',
	"duration_minutes" integer,
	"calories_burned" double precision,
	"notes" text,
	"rating" integer,
	"completed" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workout_exercises" (
	"id" text PRIMARY KEY NOT NULL,
	"workout_id" text NOT NULL,
	"name" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"sets" integer,
	"reps" integer,
	"weight" double precision,
	"duration_seconds" integer,
	"distance_miles" double precision,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;
