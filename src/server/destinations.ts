import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { destinations, routes } from '../db/schema';
import { eq, asc } from 'drizzle-orm';

// ── Schemas ────────────────────────────────────────────

const createDestinationSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
  address: z.string().optional(),
  category: z.enum(['start', 'stop', 'end', 'poi']).default('stop'),
  orderIndex: z.number().default(0),
  visited: z.boolean().default(false),
  plannedDate: z.string().optional(),
  notes: z.string().optional(),
});

const updateDestinationSchema = createDestinationSchema.partial().extend({
  id: z.string().min(1),
});

// ── Server Functions ───────────────────────────────────

export const getDestinations = createServerFn({ method: 'GET' }).handler(async () => {
  const allDestinations = await db.select().from(destinations).orderBy(asc(destinations.orderIndex));
  const allRoutes = await db.select().from(routes);
  return { destinations: allDestinations, routes: allRoutes };
});

export const getDestination = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data: { id } }) => {
    const [dest] = await db.select().from(destinations).where(eq(destinations.id, id));
    if (!dest) throw new Error('Destination not found');
    return dest;
  });

export const createDestination = createServerFn({ method: 'POST' })
  .inputValidator(createDestinationSchema)
  .handler(async ({ data }) => {
    const [dest] = await db.insert(destinations).values(data).returning();
    return dest;
  });

export const updateDestination = createServerFn({ method: 'POST' })
  .inputValidator(updateDestinationSchema)
  .handler(async ({ data: { id, ...values } }) => {
    const [updated] = await db
      .update(destinations)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(destinations.id, id))
      .returning();
    if (!updated) throw new Error('Destination not found');
    return updated;
  });

export const deleteDestination = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data: { id } }) => {
    await db.delete(destinations).where(eq(destinations.id, id));
    return { ok: true };
  });
