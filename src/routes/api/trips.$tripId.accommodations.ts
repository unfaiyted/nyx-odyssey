import { json, createAPIFileRoute } from '@tanstack/react-start/api';
import { db } from '../../db';
import { accommodations } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export const APIRoute = createAPIFileRoute('/api/trips/$tripId/accommodations')({
  POST: async ({ request, params }) => {
    const body = await request.json();
    const [item] = await db.insert(accommodations).values({
      tripId: params.tripId, ...body,
    }).returning();
    return json(item, { status: 201 });
  },
  PUT: async ({ request, params }) => {
    const body = await request.json();
    const { id, ...data } = body;
    const [updated] = await db.update(accommodations).set(data)
      .where(and(eq(accommodations.id, id), eq(accommodations.tripId, params.tripId)))
      .returning();
    return json(updated);
  },
  DELETE: async ({ request, params }) => {
    const { id } = await request.json();
    await db.delete(accommodations)
      .where(and(eq(accommodations.id, id), eq(accommodations.tripId, params.tripId)));
    return json({ ok: true });
  },
});
