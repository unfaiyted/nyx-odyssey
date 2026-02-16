import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { destinationHighlights, highlightPhotos, tripDestinations, trips, destinationResearch } from '../db/schema';
import { eq, and, asc, ne, sql } from 'drizzle-orm';
import { iris } from '../lib/iris-client';
import type { CandidateImage } from './destination-image';

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

export const updateHighlightImage = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ highlightId: z.string().min(1), imageUrl: z.string().url() }))
  .handler(async ({ data: { highlightId, imageUrl } }) => {
    await db.update(destinationHighlights)
      .set({ imageUrl })
      .where(eq(destinationHighlights.id, highlightId));
    return { success: true };
  });

export const addHighlightPhoto = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ highlightId: z.string().min(1), url: z.string().url(), caption: z.string().optional() }))
  .handler(async ({ data: { highlightId, url, caption } }) => {
    const existing = await db.select({ maxOrder: sql<number>`coalesce(max(${highlightPhotos.orderIndex}), -1)` })
      .from(highlightPhotos)
      .where(eq(highlightPhotos.highlightId, highlightId));
    const nextOrder = (existing[0]?.maxOrder ?? -1) + 1;
    await db.insert(highlightPhotos).values({ highlightId, url, caption, orderIndex: nextOrder });
    return { success: true };
  });

export const findHighlightImages = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    highlightTitle: z.string().min(1),
    destinationName: z.string().optional(),
    websiteUrl: z.string().optional(),
  }))
  .handler(async ({ data: { highlightTitle, destinationName, websiteUrl } }) => {
    const images: CandidateImage[] = [];
    const promises: Promise<void>[] = [];

    if (websiteUrl) {
      promises.push(
        iris.extract(websiteUrl, 'general')
          .then(result => {
            for (const img of result.images) {
              images.push({ url: img.url, source: img.source || 'extract', width: img.width, height: img.height, score: img.score, alt: img.alt });
            }
          })
          .catch(err => console.error('Iris extract failed:', err.message))
      );
    }

    const query = [highlightTitle, destinationName].filter(Boolean).join(' ');
    promises.push(
      iris.search(query, 10)
        .then(result => {
          for (const img of result.images) {
            images.push({ url: img.url, thumbnailUrl: img.thumbnailUrl, source: 'search', width: img.width, height: img.height, score: 0.5, alt: img.alt });
          }
        })
        .catch(err => console.error('Iris search failed:', err.message))
    );

    await Promise.allSettled(promises);

    const seen = new Set<string>();
    const unique = images.filter(img => { if (seen.has(img.url)) return false; seen.add(img.url); return true; });
    unique.sort((a, b) => b.score - a.score);
    return unique;
  });

export const updateHighlightNotes = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ highlightId: z.string().min(1), notes: z.string() }))
  .handler(async ({ data: { highlightId, notes } }) => {
    await db.update(destinationHighlights)
      .set({ notes })
      .where(eq(destinationHighlights.id, highlightId));
    return { success: true };
  });
