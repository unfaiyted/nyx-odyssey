import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { tripDestinations } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { getDestinationPhoto } from './image-search';

const createSchema = z.object({
  tripId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  arrivalDate: z.string().optional(),
  departureDate: z.string().optional(),
  photoUrl: z.string().optional(),
  status: z.enum(['researched', 'booked', 'visited']).default('researched'),
  researchStatus: z.enum(['pending', 'researched', 'approved', 'booked']).default('pending'),
  orderIndex: z.number().default(0),
});

const updateSchema = createSchema.partial().extend({
  id: z.string().min(1),
  tripId: z.string().min(1),
});

export const getTripDestinations = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ tripId: z.string().min(1) }))
  .handler(async ({ data: { tripId } }) => {
    return db.select().from(tripDestinations)
      .where(eq(tripDestinations.tripId, tripId))
      .orderBy(tripDestinations.orderIndex);
  });

export const createTripDestination = createServerFn({ method: 'POST' })
  .inputValidator(createSchema)
  .handler(async ({ data }) => {
    // Auto-fetch a real photo if none provided
    if (!data.photoUrl && data.name) {
      try {
        const photo = await getDestinationPhoto(data.name);
        if (photo) data.photoUrl = photo;
      } catch (e) {
        console.error('Failed to auto-fetch destination photo:', e);
      }
    }
    const [item] = await db.insert(tripDestinations).values(data).returning();
    return item;
  });

export const updateTripDestination = createServerFn({ method: 'POST' })
  .inputValidator(updateSchema)
  .handler(async ({ data: { id, tripId, ...values } }) => {
    const [updated] = await db.update(tripDestinations).set(values)
      .where(and(eq(tripDestinations.id, id), eq(tripDestinations.tripId, tripId)))
      .returning();
    if (!updated) throw new Error('Trip destination not found');
    return updated;
  });

export const deleteTripDestination = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1), tripId: z.string().min(1) }))
  .handler(async ({ data: { id, tripId } }) => {
    await db.delete(tripDestinations)
      .where(and(eq(tripDestinations.id, id), eq(tripDestinations.tripId, tripId)));
    return { ok: true };
  });
