import { json, createAPIFileRoute } from '@tanstack/react-start/api';
import { db } from '../../db';
import { nutritionEntries } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const APIRoute = createAPIFileRoute('/api/nutrition/$id')({
  GET: async ({ params }) => {
    const [entry] = await db.select().from(nutritionEntries).where(eq(nutritionEntries.id, params.id));
    if (!entry) return json({ error: 'Not found' }, { status: 404 });
    return json(entry);
  },
  PUT: async ({ request, params }) => {
    const body = await request.json();
    const [updated] = await db.update(nutritionEntries).set(body)
      .where(eq(nutritionEntries.id, params.id)).returning();
    if (!updated) return json({ error: 'Not found' }, { status: 404 });
    return json(updated);
  },
  DELETE: async ({ params }) => {
    await db.delete(nutritionEntries).where(eq(nutritionEntries.id, params.id));
    return json({ ok: true });
  },
});
