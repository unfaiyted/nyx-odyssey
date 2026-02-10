import { json } from '@tanstack/react-start';
import { createAPIFileRoute } from '@tanstack/react-start/api';
import { db } from '../../db';
import { destinations } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const APIRoute = createAPIFileRoute('/api/destinations/$id')({
  GET: async ({ params }) => {
    const [dest] = await db.select().from(destinations).where(eq(destinations.id, params.id));
    if (!dest) return json({ error: 'Not found' }, { status: 404 });
    return json(dest);
  },
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
