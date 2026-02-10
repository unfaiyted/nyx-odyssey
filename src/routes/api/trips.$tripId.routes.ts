import { json, createAPIFileRoute } from '@tanstack/react-start/api';
import { db } from '../../db';
import { tripRoutes, tripDestinations } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export const APIRoute = createAPIFileRoute('/api/trips/$tripId/routes')({
  GET: async ({ params }) => {
    const { tripId } = params;
    const routes = await db.select().from(tripRoutes).where(eq(tripRoutes.tripId, tripId));
    const dests = await db.select().from(tripDestinations).where(eq(tripDestinations.tripId, tripId));
    const destMap = new Map(dests.map(d => [d.id, d]));

    const enriched = routes.map(r => ({
      ...r,
      fromDestination: destMap.get(r.fromDestinationId) || null,
      toDestination: destMap.get(r.toDestinationId) || null,
    }));

    return json({ routes: enriched });
  },
  POST: async ({ request, params }) => {
    const { tripId } = params;
    const body = await request.json();
    const { fromDestinationId, toDestinationId, distanceKm, distanceMiles, durationMinutes, routeDescription, tolls, highway, notes } = body;

    if (!fromDestinationId || !toDestinationId) {
      return json({ error: 'fromDestinationId and toDestinationId required' }, { status: 400 });
    }

    const [route] = await db.insert(tripRoutes).values({
      tripId,
      fromDestinationId,
      toDestinationId,
      distanceKm,
      distanceMiles,
      durationMinutes,
      routeDescription,
      tolls,
      highway,
      notes,
    }).returning();

    return json(route, { status: 201 });
  },
});
