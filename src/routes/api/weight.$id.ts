import { json, createAPIFileRoute } from '@tanstack/react-start/api';
import { db } from '../../db';
import { weightEntries } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const APIRoute = createAPIFileRoute('/api/weight/$id')({
  GET: async ({ params }) => {
    const [entry] = await db.select().from(weightEntries).where(eq(weightEntries.id, params.id));
    if (!entry) return json({ error: 'Not found' }, { status: 404 });
    return json(entry);
  },
  PUT: async ({ request, params }) => {
    const body = await request.json();
    const [updated] = await db.update(weightEntries).set(body)
      .where(eq(weightEntries.id, params.id)).returning();
    if (!updated) return json({ error: 'Not found' }, { status: 404 });
    return json(updated);
  },
  DELETE: async ({ params }) => {
    await db.delete(weightEntries).where(eq(weightEntries.id, params.id));
    return json({ ok: true });
  },
});
