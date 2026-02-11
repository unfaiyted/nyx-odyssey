import { pgTable, text, timestamp, integer, doublePrecision, boolean, numeric } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';
import { relations } from 'drizzle-orm';

export const examples = pgTable('examples', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const destinations = pgTable('destinations', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  description: text('description'),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  address: text('address'),
  category: text('category').default('stop'), // 'start', 'stop', 'end', 'poi'
  orderIndex: integer('order_index').notNull().default(0),
  visited: boolean('visited').default(false),
  plannedDate: text('planned_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ── Trips ──────────────────────────────────────────────
export const trips = pgTable('trips', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  description: text('description'),
  coverImage: text('cover_image'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  status: text('status').default('planning'), // planning, active, completed, cancelled
  totalBudget: numeric('total_budget', { precision: 10, scale: 2 }),
  currency: text('currency').default('USD'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const itineraryItems = pgTable('itinerary_items', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  date: text('date').notNull(),
  startTime: text('start_time'),
  endTime: text('end_time'),
  location: text('location'),
  category: text('category').default('activity'), // activity, transport, meal, sightseeing, rest
  orderIndex: integer('order_index').notNull().default(0),
  completed: boolean('completed').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tripDestinations = pgTable('trip_destinations', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  arrivalDate: text('arrival_date'),
  departureDate: text('departure_date'),
  photoUrl: text('photo_url'),
  status: text('status').default('researched'), // researched, booked, visited
  researchStatus: text('research_status').default('not_started'), // not_started, basic, fully_researched, booked
  lastResearchedAt: timestamp('last_researched_at'),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const accommodations = pgTable('accommodations', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  destinationId: text('destination_id').references(() => tripDestinations.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  type: text('type').default('hotel'), // hotel, hostel, airbnb, camping, villa, resort, other
  status: text('status').default('researched'), // researched, shortlisted, booked, cancelled
  address: text('address'),
  checkIn: text('check_in'),
  checkOut: text('check_out'),
  confirmationCode: text('confirmation_code'),
  costPerNight: numeric('cost_per_night', { precision: 10, scale: 2 }),
  totalCost: numeric('total_cost', { precision: 10, scale: 2 }),
  currency: text('currency').default('USD'),
  bookingUrl: text('booking_url'),
  contactPhone: text('contact_phone'),
  contactEmail: text('contact_email'),
  rating: doublePrecision('rating'),
  notes: text('notes'),
  booked: boolean('booked').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const budgetItems = pgTable('budget_items', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  category: text('category').notNull(), // transport, accommodation, food, activities, shopping, other
  description: text('description').notNull(),
  estimatedCost: numeric('estimated_cost', { precision: 10, scale: 2 }),
  actualCost: numeric('actual_cost', { precision: 10, scale: 2 }),
  paid: boolean('paid').default(false),
  date: text('date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const budgetCategories = pgTable('budget_categories', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  category: text('category').notNull(), // flights, accommodations, food, activities, transport, shopping, other
  allocatedBudget: numeric('allocated_budget', { precision: 10, scale: 2 }).notNull().default('0'),
  color: text('color'),
  icon: text('icon'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const budgetCategoriesRelations = relations(budgetCategories, ({ one }) => ({
  trip: one(trips, { fields: [budgetCategories.tripId], references: [trips.id] }),
}));

export const packingItems = pgTable('packing_items', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category').default('general'), // clothing, toiletries, electronics, documents, medications, accessories, snacks, general
  quantity: integer('quantity').default(1),
  packed: boolean('packed').default(false),
  priority: text('priority').default('normal'), // essential, high, normal, low
  purchased: boolean('purchased').default(false),
  purchaseUrl: text('purchase_url'),
  estimatedPrice: numeric('estimated_price', { precision: 8, scale: 2 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const flights = pgTable('flights', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  airline: text('airline').notNull(),
  flightNumber: text('flight_number').notNull(),
  confirmationCode: text('confirmation_code'),
  departureAirport: text('departure_airport').notNull(),
  departureCity: text('departure_city'),
  arrivalAirport: text('arrival_airport').notNull(),
  arrivalCity: text('arrival_city'),
  departureDate: text('departure_date').notNull(),
  departureTime: text('departure_time'),
  arrivalDate: text('arrival_date').notNull(),
  arrivalTime: text('arrival_time'),
  duration: text('duration'),
  seatNumber: text('seat_number'),
  class: text('class').default('economy'),
  status: text('status').default('confirmed'), // confirmed, cancelled, delayed
  notes: text('notes'),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Rental Cars ────────────────────────────────────────
export const rentalCars = pgTable('rental_cars', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  company: text('company').notNull(),
  vehicleType: text('vehicle_type').default('compact'), // compact, sedan, suv, minivan, luxury, convertible, other
  vehicleName: text('vehicle_name'),
  status: text('status').default('researched'), // researched, shortlisted, booked, cancelled
  pickupLocation: text('pickup_location'),
  dropoffLocation: text('dropoff_location'),
  pickupDate: text('pickup_date'),
  pickupTime: text('pickup_time'),
  dropoffDate: text('dropoff_date'),
  dropoffTime: text('dropoff_time'),
  dailyRate: numeric('daily_rate', { precision: 10, scale: 2 }),
  totalCost: numeric('total_cost', { precision: 10, scale: 2 }),
  currency: text('currency').default('EUR'),
  confirmationCode: text('confirmation_code'),
  bookingUrl: text('booking_url'),
  insuranceIncluded: boolean('insurance_included').default(false),
  mileagePolicy: text('mileage_policy'), // unlimited, limited
  fuelPolicy: text('fuel_policy'), // full-to-full, prepaid
  transmission: text('transmission').default('manual'), // manual, automatic
  notes: text('notes'),
  rating: doublePrecision('rating'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Trip Cron Jobs ─────────────────────────────────────
export const tripCronJobs = pgTable('trip_cron_jobs', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  cronJobId: text('cron_job_id').notNull(), // External ID from nyx-console
  name: text('name').notNull(),
  schedule: text('schedule').notNull(), // Cron expression
  description: text('description'),
  enabled: boolean('enabled').default(true),
  lastRun: timestamp('last_run'),
  lastStatus: text('last_status'), // success, failure, running
  nextRun: timestamp('next_run'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Destination Notes (mini-journal) ───────────────────
export const destinationNotes = pgTable('destination_notes', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  destinationId: text('destination_id').notNull().references(() => tripDestinations.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  author: text('author').default('user'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const destinationNotesRelations = relations(destinationNotes, ({ one }) => ({
  destination: one(tripDestinations, { fields: [destinationNotes.destinationId], references: [tripDestinations.id] }),
}));

// ── Destination Research ───────────────────────────────
export const destinationResearch = pgTable('destination_research', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  destinationId: text('destination_id').notNull().references(() => tripDestinations.id, { onDelete: 'cascade' }),
  // Overview
  country: text('country'),
  region: text('region'),
  timezone: text('timezone'),
  language: text('language'),
  currency: text('local_currency'),
  population: text('population'),
  elevation: text('elevation'),
  bestTimeToVisit: text('best_time_to_visit'),
  // Weather
  avgTempHighC: doublePrecision('avg_temp_high_c'),
  avgTempLowC: doublePrecision('avg_temp_low_c'),
  rainyDaysPerMonth: integer('rainy_days_per_month'),
  weatherNotes: text('weather_notes'),
  // Cost
  dailyBudgetLow: numeric('daily_budget_low', { precision: 10, scale: 2 }),
  dailyBudgetMid: numeric('daily_budget_mid', { precision: 10, scale: 2 }),
  dailyBudgetHigh: numeric('daily_budget_high', { precision: 10, scale: 2 }),
  budgetCurrency: text('budget_currency').default('USD'),
  costNotes: text('cost_notes'),
  // Transport
  transportNotes: text('transport_notes'),
  nearestAirport: text('nearest_airport'),
  // Safety & Culture
  safetyRating: integer('safety_rating'), // 1-5
  safetyNotes: text('safety_notes'),
  culturalNotes: text('cultural_notes'),
  // Summary
  summary: text('summary'),
  travelTips: text('travel_tips'), // JSON array of tips
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const destinationHighlights = pgTable('destination_highlights', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  destinationId: text('destination_id').notNull().references(() => tripDestinations.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').default('attraction'), // attraction, food, activity, nightlife, shopping, nature, cultural
  rating: doublePrecision('rating'),
  priceLevel: integer('price_level'), // 1-4 ($-$$$$)
  imageUrl: text('image_url'),
  address: text('address'),
  websiteUrl: text('website_url'),
  duration: text('duration'), // e.g. "2-3 hours"
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const destinationWeatherMonthly = pgTable('destination_weather_monthly', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  destinationId: text('destination_id').notNull().references(() => tripDestinations.id, { onDelete: 'cascade' }),
  month: integer('month').notNull(), // 1-12
  avgHighC: doublePrecision('avg_high_c'),
  avgLowC: doublePrecision('avg_low_c'),
  rainyDays: integer('rainy_days'),
  sunshineHours: doublePrecision('sunshine_hours'),
});

// Research relations
export const destinationResearchRelations = relations(destinationResearch, ({ one }) => ({
  destination: one(tripDestinations, { fields: [destinationResearch.destinationId], references: [tripDestinations.id] }),
}));

export const destinationHighlightsRelations = relations(destinationHighlights, ({ one }) => ({
  destination: one(tripDestinations, { fields: [destinationHighlights.destinationId], references: [tripDestinations.id] }),
}));

export const destinationWeatherMonthlyRelations = relations(destinationWeatherMonthly, ({ one }) => ({
  destination: one(tripDestinations, { fields: [destinationWeatherMonthly.destinationId], references: [tripDestinations.id] }),
}));

// ── Relations ──────────────────────────────────────────
export const tripsRelations = relations(trips, ({ many }) => ({
  itineraryItems: many(itineraryItems),
  destinations: many(tripDestinations),
  accommodations: many(accommodations),
  budgetItems: many(budgetItems),
  budgetCategories: many(budgetCategories),
  packingItems: many(packingItems),
  flights: many(flights),
  rentalCars: many(rentalCars),
  cronJobs: many(tripCronJobs),
}));

export const itineraryItemsRelations = relations(itineraryItems, ({ one }) => ({
  trip: one(trips, { fields: [itineraryItems.tripId], references: [trips.id] }),
}));

export const tripDestinationsRelations = relations(tripDestinations, ({ one }) => ({
  trip: one(trips, { fields: [tripDestinations.tripId], references: [trips.id] }),
}));

export const accommodationsRelations = relations(accommodations, ({ one }) => ({
  trip: one(trips, { fields: [accommodations.tripId], references: [trips.id] }),
}));

export const budgetItemsRelations = relations(budgetItems, ({ one }) => ({
  trip: one(trips, { fields: [budgetItems.tripId], references: [trips.id] }),
}));

export const packingItemsRelations = relations(packingItems, ({ one }) => ({
  trip: one(trips, { fields: [packingItems.tripId], references: [trips.id] }),
}));

export const flightsRelations = relations(flights, ({ one }) => ({
  trip: one(trips, { fields: [flights.tripId], references: [trips.id] }),
}));

export const rentalCarsRelations = relations(rentalCars, ({ one }) => ({
  trip: one(trips, { fields: [rentalCars.tripId], references: [trips.id] }),
}));

export const tripCronJobsRelations = relations(tripCronJobs, ({ one }) => ({
  trip: one(trips, { fields: [tripCronJobs.tripId], references: [trips.id] }),
}));

// ── Weight Tracking ────────────────────────────────────
export const weightEntries = pgTable('weight_entries', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  date: text('date').notNull(),
  weight: doublePrecision('weight').notNull(), // in lbs
  unit: text('unit').default('lbs'),
  bodyFatPct: doublePrecision('body_fat_pct'),
  muscleMassPct: doublePrecision('muscle_mass_pct'),
  waterPct: doublePrecision('water_pct'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Nutrition Tracking ─────────────────────────────────
export const nutritionEntries = pgTable('nutrition_entries', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  date: text('date').notNull(),
  mealType: text('meal_type').default('meal'), // breakfast, lunch, dinner, snack, meal
  name: text('name').notNull(),
  calories: doublePrecision('calories'),
  protein: doublePrecision('protein'), // grams
  carbs: doublePrecision('carbs'), // grams
  fat: doublePrecision('fat'), // grams
  fiber: doublePrecision('fiber'), // grams
  sugar: doublePrecision('sugar'), // grams
  sodium: doublePrecision('sodium'), // mg
  servingSize: text('serving_size'),
  servings: doublePrecision('servings').default(1),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Workout Tracking ───────────────────────────────────
export const workouts = pgTable('workouts', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  date: text('date').notNull(),
  name: text('name').notNull(),
  type: text('type').default('strength'), // strength, cardio, flexibility, hiit, sport, other
  durationMinutes: integer('duration_minutes'),
  caloriesBurned: doublePrecision('calories_burned'),
  notes: text('notes'),
  rating: integer('rating'), // 1-5 how it felt
  completed: boolean('completed').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const workoutExercises = pgTable('workout_exercises', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  workoutId: text('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  orderIndex: integer('order_index').notNull().default(0),
  sets: integer('sets'),
  reps: integer('reps'),
  weight: doublePrecision('weight'), // lbs
  durationSeconds: integer('duration_seconds'),
  distanceMiles: doublePrecision('distance_miles'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const workoutsRelations = relations(workouts, ({ many }) => ({
  exercises: many(workoutExercises),
}));

export const workoutExercisesRelations = relations(workoutExercises, ({ one }) => ({
  workout: one(workouts, { fields: [workoutExercises.workoutId], references: [workouts.id] }),
}));

export const routes = pgTable('routes', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  fromDestinationId: text('from_destination_id').notNull().references(() => destinations.id),
  toDestinationId: text('to_destination_id').notNull().references(() => destinations.id),
  distanceMiles: doublePrecision('distance_miles'),
  durationMinutes: integer('duration_minutes'),
  polyline: text('polyline'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tripRoutes = pgTable('trip_routes', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  fromDestinationId: text('from_destination_id').notNull().references(() => tripDestinations.id, { onDelete: 'cascade' }),
  toDestinationId: text('to_destination_id').notNull().references(() => tripDestinations.id, { onDelete: 'cascade' }),
  distanceKm: doublePrecision('distance_km'),
  distanceMiles: doublePrecision('distance_miles'),
  durationMinutes: integer('duration_minutes'),
  routeDescription: text('route_description'),
  tolls: boolean('tolls').default(false),
  highway: boolean('highway').default(true),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tripRoutesRelations = relations(tripRoutes, ({ one }) => ({
  trip: one(trips, { fields: [tripRoutes.tripId], references: [trips.id] }),
  fromDestination: one(tripDestinations, { fields: [tripRoutes.fromDestinationId], references: [tripDestinations.id] }),
  toDestination: one(tripDestinations, { fields: [tripRoutes.toDestinationId], references: [tripDestinations.id] }),
}));
