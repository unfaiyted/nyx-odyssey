import { json, createAPIFileRoute } from '@tanstack/react-start/api';
import { db } from '../../db';
import { itineraryItems } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export const APIRoute = createAPIFileRoute('/api/trips/$tripId/itinerary/reorder')({
  PUT: async ({ request, params }) => {
    const { items } = await request.json() as { items: { id: string; orderIndex: number }[] };

    // Update each item's orderIndex
    await Promise.all(
      items.map(({ id, orderIndex }) =>
        db.update(itineraryItems)
          .set({ orderIndex })
          .where(and(eq(itineraryItems.id, id), eq(itineraryItems.tripId, params.tripId)))
      )
    );

    return json({ ok: true });
  },
});
