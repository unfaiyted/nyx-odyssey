import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import {
  trips,
  itineraryItems,
  tripDestinations,
  accommodations,
  budgetItems,
  budgetCategories,
  packingItems,
  flights,
  rentalCars,
  tripRoutes,
  tripCronJobs,
} from '../db/schema';
import { desc, eq } from 'drizzle-orm';

// ── Schemas ────────────────────────────────────────────

const createTripSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['planning', 'active', 'completed', 'cancelled']).default('planning'),
  totalBudget: z.string().optional(),
  currency: z.string().default('USD'),
});

const updateTripSchema = createTripSchema.partial().extend({
  id: z.string().min(1),
});

// ── Server Functions ───────────────────────────────────

export const getTrips = createServerFn({ method: 'GET' }).handler(async () => {
  return db.select().from(trips).orderBy(desc(trips.createdAt));
});

export const getTrip = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ tripId: z.string().min(1) }))
  .handler(async ({ data: { tripId } }) => {
    const [trip] = await db.select().from(trips).where(eq(trips.id, tripId));
    if (!trip) throw new Error('Trip not found');

    const [itin, dests, accom, budget, budgetCats, packing, flightRows, rentalCarRows, routeRows, cronJobRows] =
      await Promise.all([
        db.select().from(itineraryItems).where(eq(itineraryItems.tripId, tripId)),
        db.select().from(tripDestinations).where(eq(tripDestinations.tripId, tripId)),
        db.select().from(accommodations).where(eq(accommodations.tripId, tripId)),
        db.select().from(budgetItems).where(eq(budgetItems.tripId, tripId)),
        db.select().from(budgetCategories).where(eq(budgetCategories.tripId, tripId)),
        db.select().from(packingItems).where(eq(packingItems.tripId, tripId)),
        db.select().from(flights).where(eq(flights.tripId, tripId)),
        db.select().from(rentalCars).where(eq(rentalCars.tripId, tripId)),
        db.select().from(tripRoutes).where(eq(tripRoutes.tripId, tripId)),
        db.select().from(tripCronJobs).where(eq(tripCronJobs.tripId, tripId)),
      ]);

    return {
      ...trip,
      itineraryItems: itin,
      destinations: dests,
      accommodations: accom,
      budgetItems: budget,
      budgetCategories: budgetCats,
      packingItems: packing,
      flights: flightRows,
      rentalCars: rentalCarRows,
      routes: routeRows,
      cronJobs: cronJobRows,
    };
  });

export const createTrip = createServerFn({ method: 'POST' })
  .inputValidator(createTripSchema)
  .handler(async ({ data }) => {
    const [trip] = await db.insert(trips).values(data).returning();
    return trip;
  });

export const updateTrip = createServerFn({ method: 'POST' })
  .inputValidator(updateTripSchema)
  .handler(async ({ data: { id, ...values } }) => {
    const [updated] = await db
      .update(trips)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(trips.id, id))
      .returning();
    if (!updated) throw new Error('Trip not found');
    return updated;
  });

export const deleteTrip = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data: { id } }) => {
    await db.delete(trips).where(eq(trips.id, id));
    return { ok: true };
  });
