import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { destinationPhotos } from '../db/schema';
import { eq, asc, desc } from 'drizzle-orm';

export const getDestinationPhotos = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ destinationId: z.string().min(1) }))
  .handler(async ({ data: { destinationId } }) => {
    return db.select().from(destinationPhotos)
      .where(eq(destinationPhotos.destinationId, destinationId))
      .orderBy(desc(destinationPhotos.isCover), asc(destinationPhotos.orderIndex));
  });

export const addDestinationPhoto = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    destinationId: z.string().min(1),
    imageUrl: z.string().url(),
    caption: z.string().optional(),
    source: z.string().optional(),
    isCover: z.boolean().default(false),
    orderIndex: z.number().default(0),
  }))
  .handler(async ({ data }) => {
    if (data.isCover) {
      await db.update(destinationPhotos)
        .set({ isCover: false })
        .where(eq(destinationPhotos.destinationId, data.destinationId));
    }
    const [photo] = await db.insert(destinationPhotos).values(data).returning();
    return photo;
  });

export const updateDestinationPhoto = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    id: z.string().min(1),
    caption: z.string().optional(),
    source: z.string().optional(),
    isCover: z.boolean().optional(),
    orderIndex: z.number().optional(),
  }))
  .handler(async ({ data }) => {
    const { id, ...values } = data;
    if (values.isCover) {
      const [existing] = await db.select().from(destinationPhotos).where(eq(destinationPhotos.id, id));
      if (existing) {
        await db.update(destinationPhotos)
          .set({ isCover: false })
          .where(eq(destinationPhotos.destinationId, existing.destinationId));
      }
    }
    const [updated] = await db.update(destinationPhotos)
      .set(values)
      .where(eq(destinationPhotos.id, id))
      .returning();
    return updated;
  });

export const deleteDestinationPhoto = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data: { id } }) => {
    await db.delete(destinationPhotos).where(eq(destinationPhotos.id, id));
    return { ok: true };
  });
