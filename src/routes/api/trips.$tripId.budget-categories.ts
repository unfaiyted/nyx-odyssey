import { json, createAPIFileRoute } from '@tanstack/react-start/api';
import { db } from '../../db';
import { budgetCategories } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export const APIRoute = createAPIFileRoute('/api/trips/$tripId/budget-categories')({
  GET: async ({ params }) => {
    const items = await db.select().from(budgetCategories)
      .where(eq(budgetCategories.tripId, params.tripId));
    return json(items);
  },
  POST: async ({ request, params }) => {
    const body = await request.json();
    const [item] = await db.insert(budgetCategories).values({
      tripId: params.tripId, ...body,
    }).returning();
    return json(item, { status: 201 });
  },
  PUT: async ({ request, params }) => {
    const body = await request.json();
    const { id, ...data } = body;
    const [updated] = await db.update(budgetCategories).set(data)
      .where(and(eq(budgetCategories.id, id), eq(budgetCategories.tripId, params.tripId)))
      .returning();
    return json(updated);
  },
  DELETE: async ({ request, params }) => {
    const { id } = await request.json();
    await db.delete(budgetCategories)
      .where(and(eq(budgetCategories.id, id), eq(budgetCategories.tripId, params.tripId)));
    return json({ ok: true });
  },
});
