import { json } from '@tanstack/react-start';
import { createAPIFileRoute } from '@tanstack/react-start/api';
import { getDb } from '../../db';
const db = getDb();
import { destinations, routes } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';

export const APIRoute = createAPIFileRoute('/api/destinations')({
  GET: async () => {
    const allDestinations = await db
      .select()
      .from(destinations)
      .orderBy(asc(destinations.orderIndex));

    const allRoutes = await db.select().from(routes);

    return json({ destinations: allDestinations, routes: allRoutes });
  },
  POST: async ({ request }) => {
    const body = await request.json();
    const { name, description, lat, lng, address, category, orderIndex, plannedDate, notes } = body;

    if (!name || lat == null || lng == null) {
      return json({ error: 'name, lat, lng are required' }, { status: 400 });
    }

    const [dest] = await db
      .insert(destinations)
      .values({ name, description, lat, lng, address, category, orderIndex: orderIndex ?? 0, plannedDate, notes })
      .returning();

    return json(dest, { status: 201 });
  },
});
