import { json, createAPIFileRoute } from '@tanstack/react-start/api';
import { db } from '../../db';
import { budgetItems } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export const APIRoute = createAPIFileRoute('/api/trips/$tripId/budget')({
  GET: async ({ params }) => {
    const items = await db.select().from(budgetItems)
      .where(eq(budgetItems.tripId, params.tripId));
    return json(items);
  },
  POST: async ({ request, params }) => {
    const body = await request.json();
    const [item] = await db.insert(budgetItems).values({
      tripId: params.tripId, ...body,
    }).returning();
    return json(item, { status: 201 });
  },
  PUT: async ({ request, params }) => {
    const body = await request.json();
    const { id, ...data } = body;
    const [updated] = await db.update(budgetItems).set(data)
      .where(and(eq(budgetItems.id, id), eq(budgetItems.tripId, params.tripId)))
      .returning();
    return json(updated);
  },
  DELETE: async ({ request, params }) => {
    const { id } = await request.json();
    await db.delete(budgetItems)
      .where(and(eq(budgetItems.id, id), eq(budgetItems.tripId, params.tripId)));
    return json({ ok: true });
  },
});
