import { json } from '@tanstack/react-start';
import { createAPIFileRoute } from '@tanstack/react-start/api';
import { getDb } from '../../db';
const db = getDb();
import { routes } from '../../db/schema';

export const APIRoute = createAPIFileRoute('/api/routes')({
  POST: async ({ request }) => {
    const body = await request.json();
    const { fromDestinationId, toDestinationId, distanceMiles, durationMinutes, polyline } = body;

    if (!fromDestinationId || !toDestinationId) {
      return json({ error: 'fromDestinationId and toDestinationId required' }, { status: 400 });
    }

    const [route] = await db
      .insert(routes)
      .values({ fromDestinationId, toDestinationId, distanceMiles, durationMinutes, polyline })
      .returning();

    return json(route, { status: 201 });
  },
});
