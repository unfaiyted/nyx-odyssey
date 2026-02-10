CREATE TYPE "public"."itinerary_item_type" AS ENUM('flight', 'hotel', 'activity', 'restaurant', 'transport', 'other');--> statement-breakpoint
CREATE TYPE "public"."meal_type" AS ENUM('breakfast', 'lunch', 'dinner', 'snack');--> statement-breakpoint
CREATE TYPE "public"."muscle_group" AS ENUM('chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core', 'full_body', 'cardio', 'other');--> statement-breakpoint
CREATE TYPE "public"."trip_status" AS ENUM('planning', 'booked', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."workout_category" AS ENUM('strength', 'cardio', 'flexibility', 'sports', 'other');--> statement-breakpoint
CREATE TABLE "exercise_sets" (
	"id" text PRIMARY KEY NOT NULL,
	"exercise_id" text NOT NULL,
	"set_number" integer NOT NULL,
	"reps" integer,
	"weight" numeric(6, 2),
	"duration_seconds" integer,
	"distance" numeric(8, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" text PRIMARY KEY NOT NULL,
	"workout_id" text NOT NULL,
	"name" text NOT NULL,
	"muscle_group" "muscle_group",
	"sort_order" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fitness_goals" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"target_value" numeric(8, 2) NOT NULL,
	"current_value" numeric(8, 2),
	"unit" text NOT NULL,
	"target_date" date,
	"achieved" boolean DEFAULT false NOT NULL,
	"achieved_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "itinerary_items" (
	"id" text PRIMARY KEY NOT NULL,
	"trip_id" text NOT NULL,
	"type" "itinerary_item_type" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"location" text,
	"date" date NOT NULL,
	"start_time" text,
	"end_time" text,
	"confirmation_number" text,
	"cost" numeric(10, 2),
	"currency" text DEFAULT 'USD',
	"notes" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nutrition_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"meal_type" "meal_type" NOT NULL,
	"description" text NOT NULL,
	"calories" integer,
	"protein" numeric(6, 1),
	"carbs" numeric(6, 1),
	"fat" numeric(6, 1),
	"fiber" numeric(6, 1),
	"sodium" numeric(7, 1),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"destination" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" "trip_status" DEFAULT 'planning' NOT NULL,
	"cover_image" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weight_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"weight" numeric(5, 2) NOT NULL,
	"body_fat" numeric(4, 1),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "weight_entries_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" text PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"name" text NOT NULL,
	"category" "workout_category" NOT NULL,
	"duration_minutes" integer,
	"calories_burned" integer,
	"notes" text,
	"completed" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exercise_sets" ADD CONSTRAINT "exercise_sets_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itinerary_items" ADD CONSTRAINT "itinerary_items_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;