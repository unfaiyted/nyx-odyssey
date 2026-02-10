import { json, createAPIFileRoute } from '@tanstack/react-start/api';
import { db } from '../../db';
import { flights } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export const APIRoute = createAPIFileRoute('/api/trips/$tripId/flights')({
  POST: async ({ request, params }) => {
    const body = await request.json();
    const [item] = await db.insert(flights).values({
      tripId: params.tripId, ...body,
    }).returning();
    return json(item, { status: 201 });
  },
  PUT: async ({ request, params }) => {
    const body = await request.json();
    const { id, ...data } = body;
    const [updated] = await db.update(flights).set(data)
      .where(and(eq(flights.id, id), eq(flights.tripId, params.tripId)))
      .returning();
    return json(updated);
  },
  DELETE: async ({ request, params }) => {
    const { id } = await request.json();
    await db.delete(flights)
      .where(and(eq(flights.id, id), eq(flights.tripId, params.tripId)));
    return json({ ok: true });
  },
});
