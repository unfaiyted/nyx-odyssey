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
  homeBaseName: text('home_base_name'),
  homeBaseLat: doublePrecision('home_base_lat'),
  homeBaseLng: doublePrecision('home_base_lng'),
  homeBaseAddress: text('home_base_address'),
  homeBaseCurrency: text('home_base_currency'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const itineraryItems = pgTable('itinerary_items', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  destinationHighlightId: text('destination_highlight_id'),
  destinationId: text('destination_id').references(() => tripDestinations.id, { onDelete: 'set null' }),
  eventId: text('event_id').references(() => destinationEvents.id, { onDelete: 'set null' }),
  accommodationId: text('accommodation_id').references(() => accommodations.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  date: text('date').notNull(),
  startTime: text('start_time'),
  endTime: text('end_time'),
  location: text('location'),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  category: text('category').default('activity'), // activity, transport, meal, sightseeing, rest, travel
  travelTimeMinutes: integer('travel_time_minutes'),
  travelMode: text('travel_mode'), // car, train, bus, walk
  travelFromLocation: text('travel_from_location'), // description of origin
  notes: text('notes'),
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
  isHomeBase: boolean('is_home_base').default(false),
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
  // Transport from Home Base (Vicenza)
  driveTimeMinutes: integer('drive_time_minutes'),
  driveDistanceKm: doublePrecision('drive_distance_km'),
  driveCost: numeric('drive_cost', { precision: 10, scale: 2 }),
  driveRouteNotes: text('drive_route_notes'), // highways, tolls, scenic routes, parking
  trainTimeMinutes: integer('train_time_minutes'),
  trainCost: numeric('train_cost', { precision: 10, scale: 2 }),
  trainRouteNotes: text('train_route_notes'), // stations, transfers, lines
  busTimeMinutes: integer('bus_time_minutes'),
  busCost: numeric('bus_cost', { precision: 10, scale: 2 }),
  busRouteNotes: text('bus_route_notes'), // bus companies, stops
  taxiTimeMinutes: integer('taxi_time_minutes'),
  taxiCost: numeric('taxi_cost', { precision: 10, scale: 2 }),
  taxiRouteNotes: text('taxi_route_notes'), // rideshare options, availability
  transportCurrency: text('transport_currency').default('EUR'),
  routePolyline: text('route_polyline'), // encoded polyline for map route
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
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  websiteUrl: text('website_url'),
  duration: text('duration'), // e.g. "2-3 hours"
  openingHours: text('opening_hours'),
  bookingUrl: text('booking_url'),
  phone: text('phone'),
  tips: text('tips'), // JSON array of tips
  whyVisit: text('why_visit'),
  estimatedVisitMinutes: integer('estimated_visit_minutes'),
  notes: text('notes'),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const highlightPhotos = pgTable('highlight_photos', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  highlightId: text('highlight_id').notNull().references(() => destinationHighlights.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  caption: text('caption'),
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

export const destinationHighlightsRelations = relations(destinationHighlights, ({ one, many }) => ({
  destination: one(tripDestinations, { fields: [destinationHighlights.destinationId], references: [tripDestinations.id] }),
  photos: many(highlightPhotos),
}));

export const highlightPhotosRelations = relations(highlightPhotos, ({ one }) => ({
  highlight: one(destinationHighlights, { fields: [highlightPhotos.highlightId], references: [destinationHighlights.id] }),
}));

export const destinationWeatherMonthlyRelations = relations(destinationWeatherMonthly, ({ one }) => ({
  destination: one(tripDestinations, { fields: [destinationWeatherMonthly.destinationId], references: [tripDestinations.id] }),
}));

// ── Flight Research ────────────────────────────────────
export const flightSearches = pgTable('flight_searches', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  origin: text('origin').notNull(), // airport code e.g. "VCE"
  destination: text('destination').notNull(), // airport code e.g. "JFK"
  originCity: text('origin_city'),
  destinationCity: text('destination_city'),
  departureDate: text('departure_date').notNull(),
  returnDate: text('return_date'),
  passengers: integer('passengers').notNull().default(1),
  cabinClass: text('cabin_class').default('economy'), // economy, premium_economy, business, first
  flexible: boolean('flexible').default(false), // flexible dates?
  flexibilityDays: integer('flexibility_days'), // +/- days
  tripType: text('trip_type').default('round_trip'), // one_way, round_trip, multi_city
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const flightOptions = pgTable('flight_options', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  searchId: text('search_id').notNull().references(() => flightSearches.id, { onDelete: 'cascade' }),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  airline: text('airline').notNull(),
  flightNumbers: text('flight_numbers'), // comma-separated for connecting flights
  routeType: text('route_type').default('direct'), // direct, connecting
  stops: integer('stops').default(0),
  layoverAirports: text('layover_airports'), // comma-separated airport codes
  layoverDurations: text('layover_durations'), // comma-separated durations e.g. "2h30m"
  departureAirport: text('departure_airport').notNull(),
  arrivalAirport: text('arrival_airport').notNull(),
  departureDate: text('departure_date').notNull(),
  departureTime: text('departure_time'),
  arrivalDate: text('arrival_date').notNull(),
  arrivalTime: text('arrival_time'),
  duration: text('duration'), // total duration e.g. "12h30m"
  // Return leg (for round trips)
  returnDepartureDate: text('return_departure_date'),
  returnDepartureTime: text('return_departure_time'),
  returnArrivalDate: text('return_arrival_date'),
  returnArrivalTime: text('return_arrival_time'),
  returnDuration: text('return_duration'),
  returnStops: integer('return_stops'),
  returnLayoverAirports: text('return_layover_airports'),
  returnLayoverDurations: text('return_layover_durations'),
  // Pricing
  pricePerPerson: numeric('price_per_person', { precision: 10, scale: 2 }),
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }),
  currency: text('currency').default('USD'),
  // Details
  cabinClass: text('cabin_class').default('economy'),
  baggageIncluded: text('baggage_included'), // e.g. "1 carry-on, 1 checked"
  refundable: boolean('refundable').default(false),
  bookingUrl: text('booking_url'),
  bookingSource: text('booking_source'), // google_flights, kayak, airline_direct, etc.
  // Status & comparison
  status: text('status').default('found'), // found, shortlisted, rejected, booked
  comparisonNotes: text('comparison_notes'),
  rating: integer('rating'), // 1-5 personal rating
  // Link to booked flight
  bookedFlightId: text('booked_flight_id').references(() => flights.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const flightPriceHistory = pgTable('flight_price_history', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  flightOptionId: text('flight_option_id').notNull().references(() => flightOptions.id, { onDelete: 'cascade' }),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD'),
  source: text('source'), // where the price was checked
  checkedAt: timestamp('checked_at').defaultNow().notNull(),
});

export const priceAlerts = pgTable('price_alerts', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  searchId: text('search_id').references(() => flightSearches.id, { onDelete: 'set null' }),
  origin: text('origin').notNull(),
  destination: text('destination').notNull(),
  departureDate: text('departure_date').notNull(),
  returnDate: text('return_date'),
  targetPrice: numeric('target_price', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD'),
  currentLowestPrice: numeric('current_lowest_price', { precision: 10, scale: 2 }),
  lastChecked: timestamp('last_checked'),
  triggered: boolean('triggered').default(false),
  triggeredAt: timestamp('triggered_at'),
  active: boolean('active').default(true),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Flight research relations
export const flightSearchesRelations = relations(flightSearches, ({ one, many }) => ({
  trip: one(trips, { fields: [flightSearches.tripId], references: [trips.id] }),
  options: many(flightOptions),
  priceAlerts: many(priceAlerts),
}));

export const flightOptionsRelations = relations(flightOptions, ({ one, many }) => ({
  search: one(flightSearches, { fields: [flightOptions.searchId], references: [flightSearches.id] }),
  trip: one(trips, { fields: [flightOptions.tripId], references: [trips.id] }),
  bookedFlight: one(flights, { fields: [flightOptions.bookedFlightId], references: [flights.id] }),
  priceHistory: many(flightPriceHistory),
}));

export const flightPriceHistoryRelations = relations(flightPriceHistory, ({ one }) => ({
  flightOption: one(flightOptions, { fields: [flightPriceHistory.flightOptionId], references: [flightOptions.id] }),
}));

export const priceAlertsRelations = relations(priceAlerts, ({ one }) => ({
  trip: one(trips, { fields: [priceAlerts.tripId], references: [trips.id] }),
  search: one(flightSearches, { fields: [priceAlerts.searchId], references: [flightSearches.id] }),
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
  flightSearches: many(flightSearches),
  flightOptions: many(flightOptions),
  priceAlerts: many(priceAlerts),
}));

export const itineraryItemsRelations = relations(itineraryItems, ({ one }) => ({
  trip: one(trips, { fields: [itineraryItems.tripId], references: [trips.id] }),
  destination: one(tripDestinations, { fields: [itineraryItems.destinationId], references: [tripDestinations.id] }),
  event: one(destinationEvents, { fields: [itineraryItems.eventId], references: [destinationEvents.id] }),
  highlight: one(destinationHighlights, { fields: [itineraryItems.destinationHighlightId], references: [destinationHighlights.id] }),
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

// ── Trip Recommendations ───────────────────────────────
export const tripRecommendations = pgTable('trip_recommendations', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  destinationId: text('destination_id').references(() => tripDestinations.id, { onDelete: 'set null' }),
  recommendationNumber: text('recommendation_number').notNull(), // e.g. "001", "002"
  title: text('title').notNull(),
  description: text('description'),
  what: text('what'),
  whySpecial: text('why_special'), // JSON array
  logistics: text('logistics'), // JSON object
  notes: text('notes'),
  proTips: text('pro_tips'), // JSON array
  events: text('events'), // JSON array
  status: text('status').default('pending'), // pending, maybe, approved, booked, no-go
  addedDate: text('added_date'),
  screenshotPath: text('screenshot_path'),
  homeBaseAddress: text('home_base_address'),
  homeBaseLat: doublePrecision('home_base_lat'),
  homeBaseLng: doublePrecision('home_base_lng'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tripRecommendationsRelations = relations(tripRecommendations, ({ one }) => ({
  trip: one(trips, { fields: [tripRecommendations.tripId], references: [trips.id] }),
  destination: one(tripDestinations, { fields: [tripRecommendations.destinationId], references: [tripDestinations.id] }),
}));

// ── Destination Events ─────────────────────────────────
export const destinationEvents = pgTable('destination_events', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  destinationId: text('destination_id').notNull().references(() => tripDestinations.id, { onDelete: 'cascade' }),
  recommendationId: text('recommendation_id').references(() => tripRecommendations.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  description: text('description'),
  eventType: text('event_type').default('performance'), // performance, concert, sports, tour, festival, exhibition, market, other
  startDate: text('start_date'),
  endDate: text('end_date'),
  startTime: text('start_time'),
  endTime: text('end_time'),
  venue: text('venue'),
  venueAddress: text('venue_address'),
  status: text('status').default('researched'), // researched, interested, booked, attended
  ticketUrl: text('ticket_url'),
  bookingUrl: text('booking_url'),
  confirmationCode: text('confirmation_code'),
  ticketPriceFrom: text('ticket_price_from'),
  ticketPriceTo: text('ticket_price_to'),
  groupSize: integer('group_size').default(1),
  totalCost: numeric('total_cost', { precision: 10, scale: 2 }),
  currency: text('currency').default('EUR'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const destinationEventsRelations = relations(destinationEvents, ({ one }) => ({
  destination: one(tripDestinations, { fields: [destinationEvents.destinationId], references: [tripDestinations.id] }),
  recommendation: one(tripRecommendations, { fields: [destinationEvents.recommendationId], references: [tripRecommendations.id] }),
}));

// ── Trip Travelers ─────────────────────────────────────
export const tripTravelers = pgTable('trip_travelers', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  dateOfBirth: text('date_of_birth'),
  gender: text('gender'),
  passportNumber: text('passport_number'),
  passportCountry: text('passport_country'),
  passportExpiry: text('passport_expiry'),
  tsaPrecheckNumber: text('tsa_precheck_number'),
  globalEntryNumber: text('global_entry_number'),
  knownTravelerNumber: text('known_traveler_number'),
  dietaryNeeds: text('dietary_needs'), // JSON array
  mealPreference: text('meal_preference'),
  seatPreference: text('seat_preference'),
  specialAssistance: text('special_assistance'),
  notes: text('notes'),
  isPrimary: boolean('is_primary').default(false),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tripTravelersRelations = relations(tripTravelers, ({ one, many }) => ({
  trip: one(trips, { fields: [tripTravelers.tripId], references: [trips.id] }),
  loyaltyPrograms: many(travelerLoyaltyPrograms),
  emergencyContacts: many(travelerEmergencyContacts),
}));

export const travelerLoyaltyPrograms = pgTable('traveler_loyalty_programs', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  travelerId: text('traveler_id').notNull().references(() => tripTravelers.id, { onDelete: 'cascade' }),
  programType: text('program_type').notNull(),
  programName: text('program_name').notNull(),
  memberNumber: text('member_number').notNull(),
  tierStatus: text('tier_status'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const travelerLoyaltyProgramsRelations = relations(travelerLoyaltyPrograms, ({ one }) => ({
  traveler: one(tripTravelers, { fields: [travelerLoyaltyPrograms.travelerId], references: [tripTravelers.id] }),
}));

export const travelerEmergencyContacts = pgTable('traveler_emergency_contacts', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  travelerId: text('traveler_id').notNull().references(() => tripTravelers.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  relationship: text('relationship'),
  phone: text('phone').notNull(),
  email: text('email'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const travelerEmergencyContactsRelations = relations(travelerEmergencyContacts, ({ one }) => ({
  traveler: one(tripTravelers, { fields: [travelerEmergencyContacts.travelerId], references: [tripTravelers.id] }),
}));
