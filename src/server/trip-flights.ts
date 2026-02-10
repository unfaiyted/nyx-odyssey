import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { flights } from '../db/schema';
import { eq, and } from 'drizzle-orm';

const createSchema = z.object({
  tripId: z.string().min(1),
  airline: z.string().min(1),
  flightNumber: z.string().min(1),
  confirmationCode: z.string().optional(),
  departureAirport: z.string().min(1),
  departureCity: z.string().optional(),
  arrivalAirport: z.string().min(1),
  arrivalCity: z.string().optional(),
  departureDate: z.string().min(1),
  departureTime: z.string().optional(),
  arrivalDate: z.string().min(1),
  arrivalTime: z.string().optional(),
  duration: z.string().optional(),
  seatNumber: z.string().optional(),
  class: z.string().default('economy'),
  status: z.enum(['confirmed', 'cancelled', 'delayed']).default('confirmed'),
  notes: z.string().optional(),
  orderIndex: z.number().default(0),
});

const updateSchema = createSchema.partial().extend({
  id: z.string().min(1),
  tripId: z.string().min(1),
});

export const getTripFlights = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ tripId: z.string().min(1) }))
  .handler(async ({ data: { tripId } }) => {
    return db.select().from(flights)
      .where(eq(flights.tripId, tripId))
      .orderBy(flights.orderIndex);
  });

export const createFlight = createServerFn({ method: 'POST' })
  .inputValidator(createSchema)
  .handler(async ({ data }) => {
    const [item] = await db.insert(flights).values(data).returning();
    return item;
  });

export const updateFlight = createServerFn({ method: 'POST' })
  .inputValidator(updateSchema)
  .handler(async ({ data: { id, tripId, ...values } }) => {
    const [updated] = await db.update(flights).set(values)
      .where(and(eq(flights.id, id), eq(flights.tripId, tripId)))
      .returning();
    if (!updated) throw new Error('Flight not found');
    return updated;
  });

export const deleteFlight = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1), tripId: z.string().min(1) }))
  .handler(async ({ data: { id, tripId } }) => {
    await db.delete(flights).where(and(eq(flights.id, id), eq(flights.tripId, tripId)));
    return { ok: true };
  });
