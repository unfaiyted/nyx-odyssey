import { json, createAPIFileRoute } from '@tanstack/react-start/api';
import { db } from '../../db';
import { trips, itineraryItems, tripDestinations, accommodations, budgetItems, packingItems, flights, tripRoutes } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const APIRoute = createAPIFileRoute('/api/trips/$tripId')({
  GET: async ({ params }) => {
    const { tripId } = params;
    const [trip] = await db.select().from(trips).where(eq(trips.id, tripId));
    if (!trip) return json({ error: 'Trip not found' }, { status: 404 });

    const [itin, dests, accom, budget, packing, flightRows] = await Promise.all([
      db.select().from(itineraryItems).where(eq(itineraryItems.tripId, tripId)),
      db.select().from(tripDestinations).where(eq(tripDestinations.tripId, tripId)),
      db.select().from(accommodations).where(eq(accommodations.tripId, tripId)),
      db.select().from(budgetItems).where(eq(budgetItems.tripId, tripId)),
      db.select().from(packingItems).where(eq(packingItems.tripId, tripId)),
      db.select().from(flights).where(eq(flights.tripId, tripId)),
      db.select().from(tripRoutes).where(eq(tripRoutes.tripId, tripId)),
    ]);

    return json({
      ...trip,
      itineraryItems: itin,
      destinations: dests,
      accommodations: accom,
      budgetItems: budget,
      packingItems: packing,
      flights: flightRows,
      routes: routeRows,
    });
  },
  PUT: async ({ request, params }) => {
    const body = await request.json();
    const [updated] = await db.update(trips).set({
      ...body,
      updatedAt: new Date(),
    }).where(eq(trips.id, params.tripId)).returning();
    return json(updated);
  },
  DELETE: async ({ params }) => {
    await db.delete(trips).where(eq(trips.id, params.tripId));
    return json({ ok: true });
  },
});
