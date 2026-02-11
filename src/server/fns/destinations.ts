import { createServerFn } from '@tanstack/react-start';
import { db } from '../../db';
import { destinations, routes } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';

export const getDestinations = createServerFn({ method: 'GET' }).handler(async () => {
  const allDestinations = await db.select().from(destinations).orderBy(asc(destinations.orderIndex));
  const allRoutes = await db.select().from(routes);
  return { destinations: allDestinations, routes: allRoutes };
});

export const getDestination = createServerFn({ method: 'GET' })
  .handler(async ({ data }) => {
    const [dest] = await db.select().from(destinations).where(eq(destinations.id, data.id));
    if (!dest) throw new Error('Not found');
    return dest;
  });

export const createDestination = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const [dest] = await db.insert(destinations).values({
      name: data.name,
      description: data.description,
      lat: data.lat,
      lng: data.lng,
      address: data.address,
      category: data.category,
      orderIndex: data.orderIndex ?? 0,
      plannedDate: data.plannedDate,
      notes: data.notes,
    }).returning();
    return dest;
  });

export const updateDestination = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { id, ...rest } = data;
    const [updated] = await db.update(destinations).set({ ...rest, updatedAt: new Date() })
      .where(eq(destinations.id, id)).returning();
    return updated;
  });

export const deleteDestination = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    await db.delete(destinations).where(eq(destinations.id, data.id));
    return { ok: true };
  });

export const createRoute = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const [route] = await db.insert(routes).values(data).returning();
    return route;
  });
