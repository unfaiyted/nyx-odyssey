import { createServerFn } from '@tanstack/react-start';
import { db } from '../db';
import { tripDestinations, destinationResearch, destinationHighlights, destinationWeatherMonthly, accommodations, destinationNotes } from '../db/schema';
import { eq, asc, desc } from 'drizzle-orm';

export const getDestinationDetail = createServerFn({ method: 'GET' })
  .handler(async ({ data }: { data: { destinationId: string } }) => {
    const { destinationId } = data;
    const [dest] = await db.select().from(tripDestinations).where(eq(tripDestinations.id, destinationId));
    if (!dest) return null;

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
  .handler(async ({ data }: { data: any }) => {
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
  .handler(async ({ data }: { data: any }) => {
    const [item] = await db.insert(destinationHighlights).values(data).returning();
    return item;
  });

export const deleteDestinationHighlight = createServerFn({ method: 'POST' })
  .handler(async ({ data }: { data: { id: string } }) => {
    await db.delete(destinationHighlights).where(eq(destinationHighlights.id, data.id));
    return { ok: true };
  });

export const addDestinationNote = createServerFn({ method: 'POST' })
  .handler(async ({ data }: { data: any }) => {
    const [note] = await db.insert(destinationNotes).values(data).returning();
    await db.update(tripDestinations)
      .set({ lastResearchedAt: new Date() })
      .where(eq(tripDestinations.id, data.destinationId));
    return note;
  });

export const updateDestinationNote = createServerFn({ method: 'POST' })
  .handler(async ({ data }: { data: { id: string; content: string } }) => {
    const [updated] = await db.update(destinationNotes)
      .set({ content: data.content, updatedAt: new Date() })
      .where(eq(destinationNotes.id, data.id))
      .returning();
    return updated;
  });

export const deleteDestinationNote = createServerFn({ method: 'POST' })
  .handler(async ({ data }: { data: { id: string } }) => {
    await db.delete(destinationNotes).where(eq(destinationNotes.id, data.id));
    return { ok: true };
  });
