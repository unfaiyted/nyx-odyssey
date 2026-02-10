import { json, createAPIFileRoute } from '@tanstack/react-start/api';
import { db } from '../../db';
import { trips } from '../../db/schema';
import { desc } from 'drizzle-orm';

export const APIRoute = createAPIFileRoute('/api/trips')({
  GET: async () => {
    const allTrips = await db.select().from(trips).orderBy(desc(trips.createdAt));
    return json(allTrips);
  },
  POST: async ({ request }) => {
    const body = await request.json();
    const [trip] = await db.insert(trips).values({
      name: body.name,
      description: body.description,
      coverImage: body.coverImage,
      startDate: body.startDate,
      endDate: body.endDate,
      status: body.status || 'planning',
      totalBudget: body.totalBudget,
      currency: body.currency || 'USD',
    }).returning();
    return json(trip, { status: 201 });
  },
});
