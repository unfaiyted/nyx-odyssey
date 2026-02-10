import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { accommodations } from '../db/schema';
import { eq, and } from 'drizzle-orm';

const createSchema = z.object({
  tripId: z.string().min(1),
  destinationId: z.string().optional(),
  name: z.string().min(1),
  type: z.enum(['hotel', 'hostel', 'airbnb', 'camping', 'villa', 'resort', 'other']).default('hotel'),
  status: z.enum(['researched', 'shortlisted', 'booked', 'cancelled']).default('researched'),
  address: z.string().optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  confirmationCode: z.string().optional(),
  costPerNight: z.string().optional(),
  totalCost: z.string().optional(),
  currency: z.string().default('USD'),
  bookingUrl: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().optional(),
  rating: z.number().optional(),
  notes: z.string().optional(),
  booked: z.boolean().default(false),
});

const updateSchema = createSchema.partial().extend({
  id: z.string().min(1),
  tripId: z.string().min(1),
});

export const getTripAccommodations = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ tripId: z.string().min(1) }))
  .handler(async ({ data: { tripId } }) => {
    return db.select().from(accommodations).where(eq(accommodations.tripId, tripId));
  });

export const createAccommodation = createServerFn({ method: 'POST' })
  .inputValidator(createSchema)
  .handler(async ({ data }) => {
    const [item] = await db.insert(accommodations).values(data).returning();
    return item;
  });

export const updateAccommodation = createServerFn({ method: 'POST' })
  .inputValidator(updateSchema)
  .handler(async ({ data: { id, tripId, ...values } }) => {
    const [updated] = await db.update(accommodations).set(values)
      .where(and(eq(accommodations.id, id), eq(accommodations.tripId, tripId)))
      .returning();
    if (!updated) throw new Error('Accommodation not found');
    return updated;
  });

export const deleteAccommodation = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1), tripId: z.string().min(1) }))
  .handler(async ({ data: { id, tripId } }) => {
    await db.delete(accommodations)
      .where(and(eq(accommodations.id, id), eq(accommodations.tripId, tripId)));
    return { ok: true };
  });
