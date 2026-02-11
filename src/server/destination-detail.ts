import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { tripDestinations, destinationResearch, destinationHighlights, destinationWeatherMonthly, accommodations, destinationNotes } from '../db/schema';
import { eq, and, asc, desc } from 'drizzle-orm';

export const getDestinationDetail = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ destinationId: z.string().min(1) }))
  .handler(async ({ data: { destinationId } }) => {
    const [dest] = await db.select().from(tripDestinations).where(eq(tripDestinations.id, destinationId));
    if (!dest) throw new Error('Destination not found');

    const [research] = await db.select().from(destinationResearch).where(eq(destinationResearch.destinationId, destinationId));
    const highlights = await db.select().from(destinationHighlights)
      .where(eq(destinationHighlights.destinationId, destinationId))
      .orderBy(asc(destinationHighlights.orderIndex));
    const weather = await db.select().from(destinationWeatherMonthly)
      .where(eq(destinationWeatherMonthly.destinationId, destinationId))
      .orderBy(asc(destinationWeatherMonthly.month));
    const destAccommodations = await db.select().from(accommodations)
      .where(eq(accommodations.destinationId, destinationId));
    const notes = await db.select().from(destinationNotes)
      .where(eq(destinationNotes.destinationId, destinationId))
      .orderBy(desc(destinationNotes.createdAt));

    return {
      destination: dest,
      research: research || null,
      highlights,
      weather,
      accommodations: destAccommodations,
      notes,
    };
  });

export const upsertDestinationResearch = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    destinationId: z.string().min(1),
    country: z.string().optional(),
    region: z.string().optional(),
    timezone: z.string().optional(),
    language: z.string().optional(),
    currency: z.string().optional(),
    population: z.string().optional(),
    elevation: z.string().optional(),
    bestTimeToVisit: z.string().optional(),
    avgTempHighC: z.number().optional(),
    avgTempLowC: z.number().optional(),
    rainyDaysPerMonth: z.number().optional(),
    weatherNotes: z.string().optional(),
    dailyBudgetLow: z.string().optional(),
    dailyBudgetMid: z.string().optional(),
    dailyBudgetHigh: z.string().optional(),
    budgetCurrency: z.string().optional(),
    costNotes: z.string().optional(),
    transportNotes: z.string().optional(),
    nearestAirport: z.string().optional(),
    safetyRating: z.number().optional(),
    safetyNotes: z.string().optional(),
    culturalNotes: z.string().optional(),
    summary: z.string().optional(),
    travelTips: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const { destinationId, ...values } = data;
    const existing = await db.select().from(destinationResearch)
      .where(eq(destinationResearch.destinationId, destinationId));

    if (existing.length > 0) {
      const [updated] = await db.update(destinationResearch)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(destinationResearch.destinationId, destinationId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(destinationResearch)
        .values({ destinationId, ...values })
        .returning();
      return created;
    }
  });

export const addDestinationHighlight = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    destinationId: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    category: z.string().default('attraction'),
    rating: z.number().optional(),
    priceLevel: z.number().optional(),
    imageUrl: z.string().optional(),
    address: z.string().optional(),
    websiteUrl: z.string().optional(),
    duration: z.string().optional(),
    orderIndex: z.number().default(0),
  }))
  .handler(async ({ data }) => {
    const [item] = await db.insert(destinationHighlights).values(data).returning();
    return item;
  });

export const deleteDestinationHighlight = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data: { id } }) => {
    await db.delete(destinationHighlights).where(eq(destinationHighlights.id, id));
    return { ok: true };
  });

// ── Destination Notes ──────────────────────────────────

export const addDestinationNote = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    destinationId: z.string().min(1),
    content: z.string().min(1),
    author: z.string().default('user'),
  }))
  .handler(async ({ data }) => {
    const [note] = await db.insert(destinationNotes).values(data).returning();
    await db.update(tripDestinations)
      .set({ lastResearchedAt: new Date() })
      .where(eq(tripDestinations.id, data.destinationId));
    return note;
  });

export const updateDestinationNote = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    id: z.string().min(1),
    content: z.string().min(1),
  }))
  .handler(async ({ data: { id, content } }) => {
    const [updated] = await db.update(destinationNotes)
      .set({ content, updatedAt: new Date() })
      .where(eq(destinationNotes.id, id))
      .returning();
    return updated;
  });

export const deleteDestinationNote = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data: { id } }) => {
    await db.delete(destinationNotes).where(eq(destinationNotes.id, id));
    return { ok: true };
  });
