import { json } from '@tanstack/react-start';
import { createAPIFileRoute } from '@tanstack/react-start/api';
import { getDb } from '../../db';
const db = getDb();
import { destinations } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const APIRoute = createAPIFileRoute('/api/destinations/$id')({
  PUT: async ({ request, params }) => {
    const body = await request.json();
    const [updated] = await db
      .update(destinations)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(destinations.id, params.id))
      .returning();

    if (!updated) return json({ error: 'Not found' }, { status: 404 });
    return json(updated);
  },
  DELETE: async ({ params }) => {
    const [deleted] = await db
      .delete(destinations)
      .where(eq(destinations.id, params.id))
      .returning();

    if (!deleted) return json({ error: 'Not found' }, { status: 404 });
    return json({ ok: true });
  },
});
