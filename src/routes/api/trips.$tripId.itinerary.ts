import { json, createAPIFileRoute } from '@tanstack/react-start/api';
import { db } from '../../db';
import { itineraryItems } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export const APIRoute = createAPIFileRoute('/api/trips/$tripId/itinerary')({
  POST: async ({ request, params }) => {
    const body = await request.json();
    const [item] = await db.insert(itineraryItems).values({
      tripId: params.tripId,
      ...body,
    }).returning();
    return json(item, { status: 201 });
  },
  PUT: async ({ request, params }) => {
    const body = await request.json();
    const { id, ...data } = body;
    const [updated] = await db.update(itineraryItems).set(data)
      .where(and(eq(itineraryItems.id, id), eq(itineraryItems.tripId, params.tripId)))
      .returning();
    return json(updated);
  },
  DELETE: async ({ request, params }) => {
    const { id } = await request.json();
    await db.delete(itineraryItems)
      .where(and(eq(itineraryItems.id, id), eq(itineraryItems.tripId, params.tripId)));
    return json({ ok: true });
  },
});
