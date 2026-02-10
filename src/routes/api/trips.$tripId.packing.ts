import { json, createAPIFileRoute } from '@tanstack/react-start/api';
import { db } from '../../db';
import { packingItems } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export const APIRoute = createAPIFileRoute('/api/trips/$tripId/packing')({
  GET: async ({ params }) => {
    const items = await db.select().from(packingItems)
      .where(eq(packingItems.tripId, params.tripId));
    return json(items);
  },
  POST: async ({ request, params }) => {
    const body = await request.json();
    const [item] = await db.insert(packingItems).values({
      tripId: params.tripId, ...body,
    }).returning();
    return json(item, { status: 201 });
  },
  PUT: async ({ request, params }) => {
    const body = await request.json();
    const { id, ...data } = body;
    const [updated] = await db.update(packingItems).set(data)
      .where(and(eq(packingItems.id, id), eq(packingItems.tripId, params.tripId)))
      .returning();
    return json(updated);
  },
  DELETE: async ({ request, params }) => {
    const { id } = await request.json();
    await db.delete(packingItems)
      .where(and(eq(packingItems.id, id), eq(packingItems.tripId, params.tripId)));
    return json({ ok: true });
  },
});
