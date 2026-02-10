import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { packingItems } from '../db/schema';
import { eq, and } from 'drizzle-orm';

const createSchema = z.object({
  tripId: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(['clothing', 'toiletries', 'electronics', 'documents', 'general']).default('general'),
  quantity: z.number().default(1),
  packed: z.boolean().default(false),
});

const updateSchema = createSchema.partial().extend({
  id: z.string().min(1),
  tripId: z.string().min(1),
});

export const getTripPackingItems = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ tripId: z.string().min(1) }))
  .handler(async ({ data: { tripId } }) => {
    return db.select().from(packingItems).where(eq(packingItems.tripId, tripId));
  });

export const createPackingItem = createServerFn({ method: 'POST' })
  .inputValidator(createSchema)
  .handler(async ({ data }) => {
    const [item] = await db.insert(packingItems).values(data).returning();
    return item;
  });

export const updatePackingItem = createServerFn({ method: 'POST' })
  .inputValidator(updateSchema)
  .handler(async ({ data: { id, tripId, ...values } }) => {
    const [updated] = await db.update(packingItems).set(values)
      .where(and(eq(packingItems.id, id), eq(packingItems.tripId, tripId)))
      .returning();
    if (!updated) throw new Error('Packing item not found');
    return updated;
  });

export const deletePackingItem = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1), tripId: z.string().min(1) }))
  .handler(async ({ data: { id, tripId } }) => {
    await db.delete(packingItems)
      .where(and(eq(packingItems.id, id), eq(packingItems.tripId, tripId)));
    return { ok: true };
  });
