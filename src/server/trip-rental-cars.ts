import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { rentalCars } from '../db/schema';
import { eq, and } from 'drizzle-orm';

const createSchema = z.object({
  tripId: z.string().min(1),
  company: z.string().min(1),
  vehicleType: z.string().default('compact'),
  vehicleName: z.string().optional(),
  status: z.enum(['researched', 'shortlisted', 'booked', 'cancelled']).default('researched'),
  pickupLocation: z.string().optional(),
  dropoffLocation: z.string().optional(),
  pickupDate: z.string().optional(),
  pickupTime: z.string().optional(),
  dropoffDate: z.string().optional(),
  dropoffTime: z.string().optional(),
  dailyRate: z.string().optional(),
  totalCost: z.string().optional(),
  currency: z.string().default('EUR'),
  confirmationCode: z.string().optional(),
  bookingUrl: z.string().optional(),
  insuranceIncluded: z.boolean().default(false),
  mileagePolicy: z.string().optional(),
  fuelPolicy: z.string().optional(),
  transmission: z.string().default('manual'),
  notes: z.string().optional(),
  rating: z.number().optional(),
});

const updateSchema = createSchema.partial().extend({
  id: z.string().min(1),
  tripId: z.string().min(1),
});

export const getTripRentalCars = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ tripId: z.string().min(1) }))
  .handler(async ({ data: { tripId } }) => {
    return db.select().from(rentalCars)
      .where(eq(rentalCars.tripId, tripId))
      .orderBy(rentalCars.createdAt);
  });

export const createRentalCar = createServerFn({ method: 'POST' })
  .inputValidator(createSchema)
  .handler(async ({ data }) => {
    const [item] = await db.insert(rentalCars).values(data).returning();
    return item;
  });

export const updateRentalCar = createServerFn({ method: 'POST' })
  .inputValidator(updateSchema)
  .handler(async ({ data: { id, tripId, ...values } }) => {
    const [updated] = await db.update(rentalCars).set(values)
      .where(and(eq(rentalCars.id, id), eq(rentalCars.tripId, tripId)))
      .returning();
    if (!updated) throw new Error('Rental car not found');
    return updated;
  });

export const deleteRentalCar = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1), tripId: z.string().min(1) }))
  .handler(async ({ data: { id, tripId } }) => {
    await db.delete(rentalCars).where(and(eq(rentalCars.id, id), eq(rentalCars.tripId, tripId)));
    return { ok: true };
  });
