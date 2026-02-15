import { createServerFn } from '@tanstack/react-start';
import { db } from '../../db';
import { trips, itineraryItems, tripDestinations, accommodations, budgetItems, budgetCategories, packingItems, flights, rentalCars, tripRoutes, tripCronJobs, tripTravelers, destinationEvents } from '../../db/schema';
import { desc, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

export const getTrips = createServerFn({ method: 'GET' }).handler(async () => {
  return await db.select().from(trips).orderBy(desc(trips.createdAt));
});

export const createTrip = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const [trip] = await db.insert(trips).values({
      name: data.name,
      description: data.description,
      coverImage: data.coverImage,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status || 'planning',
      totalBudget: data.totalBudget,
      currency: data.currency || 'USD',
    }).returning();
    return trip;
  });

export const getTrip = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ tripId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { tripId } = data;
    const [trip] = await db.select().from(trips).where(eq(trips.id, tripId));
    if (!trip) throw new Error('Trip not found');

    const [itin, dests, accom, budget, budgetCats, packing, flightRows, rentalCarRows, routeRows, cronJobRows, travelerRows] = await Promise.all([
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
      db.select().from(tripTravelers).where(eq(tripTravelers.tripId, tripId)),
    ]);

    // Load events for all destinations of this trip
    const destIds = dests.map(d => d.id);
    const eventRows = destIds.length > 0
      ? await db.select().from(destinationEvents).where(inArray(destinationEvents.destinationId, destIds))
      : [];

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
      travelers: travelerRows,
      events: eventRows,
    };
  });

export const updateTrip = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const [updated] = await db.update(trips).set({
      ...data.data,
      updatedAt: new Date(),
    }).where(eq(trips.id, data.tripId)).returning();
    return updated;
  });

export const deleteTrip = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    await db.delete(trips).where(eq(trips.id, data.tripId));
    return { ok: true };
  });
