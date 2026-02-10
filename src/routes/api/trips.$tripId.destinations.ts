import { json, createAPIFileRoute } from '@tanstack/react-start/api';
import { db } from '../../db';
import { tripDestinations } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export const APIRoute = createAPIFileRoute('/api/trips/$tripId/destinations')({
  POST: async ({ request, params }) => {
    const body = await request.json();
    const [item] = await db.insert(tripDestinations).values({
      tripId: params.tripId, ...body,
    }).returning();
    return json(item, { status: 201 });
  },
  PUT: async ({ request, params }) => {
    const body = await request.json();
    const { id, ...data } = body;
    const [updated] = await db.update(tripDestinations).set(data)
      .where(and(eq(tripDestinations.id, id), eq(tripDestinations.tripId, params.tripId)))
      .returning();
    return json(updated);
  },
  DELETE: async ({ request, params }) => {
    const { id } = await request.json();
    await db.delete(tripDestinations)
      .where(and(eq(tripDestinations.id, id), eq(tripDestinations.tripId, params.tripId)));
    return json({ ok: true });
  },
});
