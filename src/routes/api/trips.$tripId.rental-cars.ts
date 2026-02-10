import { json, createAPIFileRoute } from '@tanstack/react-start/api';
import { db } from '../../db';
import { rentalCars } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export const APIRoute = createAPIFileRoute('/api/trips/$tripId/rental-cars')({
  GET: async ({ params }) => {
    const items = await db.select().from(rentalCars)
      .where(eq(rentalCars.tripId, params.tripId))
      .orderBy(rentalCars.createdAt);
    return json(items);
  },
  POST: async ({ request, params }) => {
    const body = await request.json();
    const [item] = await db.insert(rentalCars).values({
      tripId: params.tripId, ...body,
    }).returning();
    return json(item, { status: 201 });
  },
  PUT: async ({ request, params }) => {
    const body = await request.json();
    const { id, ...data } = body;
    const [updated] = await db.update(rentalCars).set(data)
      .where(and(eq(rentalCars.id, id), eq(rentalCars.tripId, params.tripId)))
      .returning();
    return json(updated);
  },
  DELETE: async ({ request, params }) => {
    const { id } = await request.json();
    await db.delete(rentalCars)
      .where(and(eq(rentalCars.id, id), eq(rentalCars.tripId, params.tripId)));
    return json({ ok: true });
  },
});
