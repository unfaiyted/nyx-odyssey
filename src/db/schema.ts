import {
  pgTable,
  text,
  timestamp,
  date,
  integer,
  numeric,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// ── Helpers ──────────────────────────────────────────────────────────
const id = () => text('id').primaryKey().$defaultFn(() => nanoid());
const timestamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
};

// ── Enums ────────────────────────────────────────────────────────────
export const tripStatusEnum = pgEnum('trip_status', [
  'planning',
  'booked',
  'in_progress',
  'completed',
  'cancelled',
]);

export const itineraryItemTypeEnum = pgEnum('itinerary_item_type', [
  'flight',
  'hotel',
  'activity',
  'restaurant',
  'transport',
  'other',
]);

export const mealTypeEnum = pgEnum('meal_type', [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
]);

export const workoutCategoryEnum = pgEnum('workout_category', [
  'strength',
  'cardio',
  'flexibility',
  'sports',
  'other',
]);

export const muscleGroupEnum = pgEnum('muscle_group', [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'legs',
  'core',
  'full_body',
  'cardio',
  'other',
]);

// ── Trips ────────────────────────────────────────────────────────────
export const trips = pgTable('trips', {
  id: id(),
  name: text('name').notNull(),
  description: text('description'),
  destination: text('destination').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  status: tripStatusEnum('status').default('planning').notNull(),
  coverImage: text('cover_image'),
  notes: text('notes'),
  ...timestamps,
});

export const tripsRelations = relations(trips, ({ many }) => ({
  itineraryItems: many(itineraryItems),
}));

// ── Itinerary Items ──────────────────────────────────────────────────
export const itineraryItems = pgTable('itinerary_items', {
  id: id(),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  type: itineraryItemTypeEnum('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  location: text('location'),
  date: date('date').notNull(),
  startTime: text('start_time'), // HH:MM format
  endTime: text('end_time'),
  confirmationNumber: text('confirmation_number'),
  cost: numeric('cost', { precision: 10, scale: 2 }),
  currency: text('currency').default('USD'),
  notes: text('notes'),
  sortOrder: integer('sort_order').default(0).notNull(),
  ...timestamps,
});

export const itineraryItemsRelations = relations(itineraryItems, ({ one }) => ({
  trip: one(trips, {
    fields: [itineraryItems.tripId],
    references: [trips.id],
  }),
}));

// ── Weight Entries ───────────────────────────────────────────────────
export const weightEntries = pgTable('weight_entries', {
  id: id(),
  date: date('date').notNull().unique(),
  weight: numeric('weight', { precision: 5, scale: 2 }).notNull(), // in lbs
  bodyFat: numeric('body_fat', { precision: 4, scale: 1 }),        // percentage
  notes: text('notes'),
  ...timestamps,
});

// ── Nutrition Logs ───────────────────────────────────────────────────
export const nutritionLogs = pgTable('nutrition_logs', {
  id: id(),
  date: date('date').notNull(),
  mealType: mealTypeEnum('meal_type').notNull(),
  description: text('description').notNull(),
  calories: integer('calories'),
  protein: numeric('protein', { precision: 6, scale: 1 }),    // grams
  carbs: numeric('carbs', { precision: 6, scale: 1 }),        // grams
  fat: numeric('fat', { precision: 6, scale: 1 }),            // grams
  fiber: numeric('fiber', { precision: 6, scale: 1 }),        // grams
  sodium: numeric('sodium', { precision: 7, scale: 1 }),      // mg
  notes: text('notes'),
  ...timestamps,
});

// ── Workouts ─────────────────────────────────────────────────────────
export const workouts = pgTable('workouts', {
  id: id(),
  date: date('date').notNull(),
  name: text('name').notNull(),
  category: workoutCategoryEnum('category').notNull(),
  durationMinutes: integer('duration_minutes'),
  caloriesBurned: integer('calories_burned'),
  notes: text('notes'),
  completed: boolean('completed').default(true).notNull(),
  ...timestamps,
});

export const workoutsRelations = relations(workouts, ({ many }) => ({
  exercises: many(exercises),
}));

// ── Exercises (within a workout) ─────────────────────────────────────
export const exercises = pgTable('exercises', {
  id: id(),
  workoutId: text('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  muscleGroup: muscleGroupEnum('muscle_group'),
  sortOrder: integer('sort_order').default(0).notNull(),
  notes: text('notes'),
  ...timestamps,
});

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  workout: one(workouts, {
    fields: [exercises.workoutId],
    references: [workouts.id],
  }),
  sets: many(exerciseSets),
}));

// ── Exercise Sets ────────────────────────────────────────────────────
export const exerciseSets = pgTable('exercise_sets', {
  id: id(),
  exerciseId: text('exercise_id').notNull().references(() => exercises.id, { onDelete: 'cascade' }),
  setNumber: integer('set_number').notNull(),
  reps: integer('reps'),
  weight: numeric('weight', { precision: 6, scale: 2 }),    // lbs
  durationSeconds: integer('duration_seconds'),               // for timed exercises
  distance: numeric('distance', { precision: 8, scale: 2 }), // miles/km
  notes: text('notes'),
  ...timestamps,
});

export const exerciseSetsRelations = relations(exerciseSets, ({ one }) => ({
  exercise: one(exercises, {
    fields: [exerciseSets.exerciseId],
    references: [exercises.id],
  }),
}));

// ── Fitness Goals ────────────────────────────────────────────────────
export const fitnessGoals = pgTable('fitness_goals', {
  id: id(),
  name: text('name').notNull(),
  targetValue: numeric('target_value', { precision: 8, scale: 2 }).notNull(),
  currentValue: numeric('current_value', { precision: 8, scale: 2 }),
  unit: text('unit').notNull(), // lbs, %, reps, etc.
  targetDate: date('target_date'),
  achieved: boolean('achieved').default(false).notNull(),
  achievedAt: timestamp('achieved_at'),
  notes: text('notes'),
  ...timestamps,
});
