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
  researchStatus: text('research_status').default('pending'), // pending, researched, approved, booked
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
  category: text('category').default('general'), // clothing, toiletries, electronics, documents, general
  quantity: integer('quantity').default(1),
  packed: boolean('packed').default(false),
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

// ── Relations ──────────────────────────────────────────
export const tripsRelations = relations(trips, ({ many }) => ({
  itineraryItems: many(itineraryItems),
  destinations: many(tripDestinations),
  accommodations: many(accommodations),
  budgetItems: many(budgetItems),
  budgetCategories: many(budgetCategories),
  packingItems: many(packingItems),
  flights: many(flights),
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

export const tripCronJobsRelations = relations(tripCronJobs, ({ one }) => ({
  trip: one(trips, { fields: [tripCronJobs.tripId], references: [trips.id] }),
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
