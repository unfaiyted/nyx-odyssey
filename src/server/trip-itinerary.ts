import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { itineraryItems } from '../db/schema';
import { eq, and } from 'drizzle-orm';

const createSchema = z.object({
  tripId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string().min(1),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  category: z.enum(['activity', 'transport', 'meal', 'sightseeing', 'rest']).default('activity'),
  orderIndex: z.number().default(0),
  completed: z.boolean().default(false),
});

const updateSchema = createSchema.partial().extend({
  id: z.string().min(1),
  tripId: z.string().min(1),
});

export const getTripItinerary = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ tripId: z.string().min(1) }))
  .handler(async ({ data: { tripId } }) => {
    return db.select().from(itineraryItems)
      .where(eq(itineraryItems.tripId, tripId))
      .orderBy(itineraryItems.orderIndex);
  });

export const createItineraryItem = createServerFn({ method: 'POST' })
  .inputValidator(createSchema)
  .handler(async ({ data }) => {
    const [item] = await db.insert(itineraryItems).values(data).returning();
    return item;
  });

export const updateItineraryItem = createServerFn({ method: 'POST' })
  .inputValidator(updateSchema)
  .handler(async ({ data: { id, tripId, ...values } }) => {
    const [updated] = await db.update(itineraryItems).set(values)
      .where(and(eq(itineraryItems.id, id), eq(itineraryItems.tripId, tripId)))
      .returning();
    if (!updated) throw new Error('Itinerary item not found');
    return updated;
  });

export const deleteItineraryItem = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1), tripId: z.string().min(1) }))
  .handler(async ({ data: { id, tripId } }) => {
    await db.delete(itineraryItems)
      .where(and(eq(itineraryItems.id, id), eq(itineraryItems.tripId, tripId)));
    return { ok: true };
  });
