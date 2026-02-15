import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { flightSearches, flightOptions, flightPriceHistory } from '../db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';

// ── Flight Searches ──────────────────────────────────

export const getFlightSearches = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ tripId: z.string().min(1) }))
  .handler(async ({ data: { tripId } }) => {
    return db.query.flightSearches.findMany({
      where: eq(flightSearches.tripId, tripId),
      with: { options: { with: { priceHistory: true } } },
      orderBy: [desc(flightSearches.createdAt)],
    });
  });

export const createFlightSearch = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    tripId: z.string().min(1),
    origin: z.string().min(1),
    destination: z.string().min(1),
    originCity: z.string().optional(),
    destinationCity: z.string().optional(),
    departureDate: z.string().min(1),
    returnDate: z.string().optional(),
    passengers: z.number().default(1),
    cabinClass: z.string().default('economy'),
    tripType: z.string().default('round_trip'),
    notes: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const [item] = await db.insert(flightSearches).values(data).returning();
    return item;
  });

export const deleteFlightSearch = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1), tripId: z.string().min(1) }))
  .handler(async ({ data: { id, tripId } }) => {
    await db.delete(flightSearches).where(and(eq(flightSearches.id, id), eq(flightSearches.tripId, tripId)));
    return { ok: true };
  });

// ── Flight Options ───────────────────────────────────

export const createFlightOption = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    searchId: z.string().min(1),
    tripId: z.string().min(1),
    airline: z.string().min(1),
    flightNumbers: z.string().optional(),
    routeType: z.string().default('direct'),
    stops: z.number().default(0),
    layoverAirports: z.string().optional(),
    layoverDurations: z.string().optional(),
    departureAirport: z.string().min(1),
    arrivalAirport: z.string().min(1),
    departureDate: z.string().min(1),
    departureTime: z.string().optional(),
    arrivalDate: z.string().min(1),
    arrivalTime: z.string().optional(),
    duration: z.string().optional(),
    returnDepartureDate: z.string().optional(),
    returnDepartureTime: z.string().optional(),
    returnArrivalDate: z.string().optional(),
    returnArrivalTime: z.string().optional(),
    returnDuration: z.string().optional(),
    returnStops: z.number().optional(),
    returnLayoverAirports: z.string().optional(),
    returnLayoverDurations: z.string().optional(),
    pricePerPerson: z.string().optional(),
    totalPrice: z.string().optional(),
    currency: z.string().default('USD'),
    cabinClass: z.string().default('economy'),
    baggageIncluded: z.string().optional(),
    refundable: z.boolean().default(false),
    bookingUrl: z.string().optional(),
    bookingSource: z.string().optional(),
    status: z.string().default('found'),
    comparisonNotes: z.string().optional(),
    rating: z.number().optional(),
  }))
  .handler(async ({ data }) => {
    const [item] = await db.insert(flightOptions).values(data).returning();
    return item;
  });

export const updateFlightOption = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    id: z.string().min(1),
    tripId: z.string().min(1),
    status: z.string().optional(),
    rating: z.number().optional(),
    comparisonNotes: z.string().optional(),
    bookingUrl: z.string().optional(),
  }))
  .handler(async ({ data: { id, tripId, ...values } }) => {
    const [updated] = await db.update(flightOptions)
      .set({ ...values, updatedAt: new Date() })
      .where(and(eq(flightOptions.id, id), eq(flightOptions.tripId, tripId)))
      .returning();
    if (!updated) throw new Error('Flight option not found');
    return updated;
  });

export const deleteFlightOption = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1), tripId: z.string().min(1) }))
  .handler(async ({ data: { id, tripId } }) => {
    await db.delete(flightOptions).where(and(eq(flightOptions.id, id), eq(flightOptions.tripId, tripId)));
    return { ok: true };
  });

// ── Price History ────────────────────────────────────

export const getFlightPriceHistory = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ flightOptionId: z.string().min(1) }))
  .handler(async ({ data: { flightOptionId } }) => {
    return db.select().from(flightPriceHistory)
      .where(eq(flightPriceHistory.flightOptionId, flightOptionId))
      .orderBy(asc(flightPriceHistory.checkedAt));
  });

export const addPriceSnapshot = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    flightOptionId: z.string().min(1),
    price: z.string().min(1),
    currency: z.string().default('USD'),
    source: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const [item] = await db.insert(flightPriceHistory).values(data).returning();
    return item;
  });
