import { pgTable, text, timestamp, integer, doublePrecision, boolean } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';

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

export const routes = pgTable('routes', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  fromDestinationId: text('from_destination_id').notNull().references(() => destinations.id),
  toDestinationId: text('to_destination_id').notNull().references(() => destinations.id),
  distanceMiles: doublePrecision('distance_miles'),
  durationMinutes: integer('duration_minutes'),
  polyline: text('polyline'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
