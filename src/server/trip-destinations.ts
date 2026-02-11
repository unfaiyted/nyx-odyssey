import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { tripDestinations, destinationResearch, destinationHighlights, destinationWeatherMonthly, accommodations } from '../db/schema';
import { eq, and, sql, isNotNull } from 'drizzle-orm';

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
  researchStatus: z.enum(['not_started', 'basic', 'fully_researched', 'booked']).default('not_started'),
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

export type ResearchSummaryMap = Record<string, { description: boolean; highlights: number; weather: boolean; accommodations: number; transport: boolean; photos: boolean }>;

export const getDestinationResearchSummaries = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ tripId: z.string().min(1) }))
  .handler(async ({ data: { tripId } }): Promise<ResearchSummaryMap> => {
    const dests = await db.select({ id: tripDestinations.id, description: tripDestinations.description, photoUrl: tripDestinations.photoUrl })
      .from(tripDestinations).where(eq(tripDestinations.tripId, tripId));

    if (dests.length === 0) return {};

    const destIds = dests.map(d => d.id);

    // Batch queries
    const [researchRows, highlightRows, weatherRows, accomRows] = await Promise.all([
      db.select({ destinationId: destinationResearch.destinationId, transportNotes: destinationResearch.transportNotes })
        .from(destinationResearch)
        .where(sql`${destinationResearch.destinationId} IN ${destIds}`),
      db.select({ destinationId: destinationHighlights.destinationId, cnt: sql<number>`count(*)::int`, hasImage: sql<boolean>`bool_or(${destinationHighlights.imageUrl} IS NOT NULL)` })
        .from(destinationHighlights)
        .where(sql`${destinationHighlights.destinationId} IN ${destIds}`)
        .groupBy(destinationHighlights.destinationId),
      db.select({ destinationId: destinationWeatherMonthly.destinationId })
        .from(destinationWeatherMonthly)
        .where(sql`${destinationWeatherMonthly.destinationId} IN ${destIds}`)
        .groupBy(destinationWeatherMonthly.destinationId),
      db.select({ destinationId: accommodations.destinationId, cnt: sql<number>`count(*)::int` })
        .from(accommodations)
        .where(sql`${accommodations.destinationId} IN ${destIds}`)
        .groupBy(accommodations.destinationId),
    ]);

    const researchMap = new Map(researchRows.map(r => [r.destinationId, r]));
    const highlightMap = new Map(highlightRows.map(r => [r.destinationId, r]));
    const weatherSet = new Set(weatherRows.map(r => r.destinationId));
    const accomMap = new Map(accomRows.map(r => [r.destinationId, r]));

    const result: ResearchSummaryMap = {};
    for (const dest of dests) {
      const research = researchMap.get(dest.id);
      const highlights = highlightMap.get(dest.id);
      const accom = accomMap.get(dest.id);
      result[dest.id] = {
        description: !!dest.description,
        highlights: highlights?.cnt ?? 0,
        weather: weatherSet.has(dest.id),
        accommodations: accom?.cnt ?? 0,
        transport: !!research?.transportNotes,
        photos: !!dest.photoUrl || !!highlights?.hasImage,
      };
    }
    return result;
  });
