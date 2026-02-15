import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { destinationHighlights, highlightPhotos, tripDestinations, trips, destinationResearch } from '../db/schema';
import { eq, and, asc, ne, sql } from 'drizzle-orm';

export const getHighlightDetail = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ highlightId: z.string().min(1) }))
  .handler(async ({ data: { highlightId } }) => {
    const [highlight] = await db.select().from(destinationHighlights)
      .where(eq(destinationHighlights.id, highlightId));
    if (!highlight) throw new Error('Highlight not found');

    const [destination] = await db.select().from(tripDestinations)
      .where(eq(tripDestinations.id, highlight.destinationId));

    const photos = await db.select().from(highlightPhotos)
      .where(eq(highlightPhotos.highlightId, highlightId))
      .orderBy(asc(highlightPhotos.orderIndex));

    // Get related highlights (same destination, different highlight)
    const relatedHighlights = await db.select().from(destinationHighlights)
      .where(and(
        eq(destinationHighlights.destinationId, highlight.destinationId),
        ne(destinationHighlights.id, highlightId),
      ))
      .orderBy(asc(destinationHighlights.orderIndex))
      .limit(6);

    // Get trip info for home base travel time
    let trip = null;
    let research = null;
    if (destination) {
      const [t] = await db.select().from(trips).where(eq(trips.id, destination.tripId));
      trip = t || null;
      const [r] = await db.select().from(destinationResearch)
        .where(eq(destinationResearch.destinationId, destination.id));
      research = r || null;
    }

    return { highlight, destination, photos, relatedHighlights, trip, research };
  });

export const updateHighlightNotes = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ highlightId: z.string().min(1), notes: z.string() }))
  .handler(async ({ data: { highlightId, notes } }) => {
    await db.update(destinationHighlights)
      .set({ notes })
      .where(eq(destinationHighlights.id, highlightId));
    return { success: true };
  });
