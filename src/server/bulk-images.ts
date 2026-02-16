import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { tripDestinations, destinationHighlights, destinationEvents } from '../db/schema';
import { eq, inArray } from 'drizzle-orm';

export interface BulkImageItem {
  type: 'destination' | 'highlight' | 'event';
  id: string;
  name: string;
  destinationId: string;
  destinationName: string;
  currentImage: string | null;
  websiteUrl?: string | null;
  searchContext?: string; // extra context for search (venue, country, etc.)
}

/** Fetch all destinations, highlights, and events for a trip */
export const getTripItemsForBulkImages = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ tripId: z.string().min(1) }))
  .handler(async ({ data: { tripId } }) => {
    const destinations = await db.select().from(tripDestinations)
      .where(eq(tripDestinations.tripId, tripId));

    if (destinations.length === 0) return { items: [] as BulkImageItem[] };

    const destIds = destinations.map(d => d.id);

    const [highlights, events] = await Promise.all([
      db.select().from(destinationHighlights).where(inArray(destinationHighlights.destinationId, destIds)),
      db.select().from(destinationEvents).where(inArray(destinationEvents.destinationId, destIds)),
    ]);

    const destMap = new Map(destinations.map(d => [d.id, d.name]));
    const items: BulkImageItem[] = [];

    for (const d of destinations) {
      items.push({
        type: 'destination',
        id: d.id,
        name: d.name,
        destinationId: d.id,
        destinationName: d.name,
        currentImage: d.photoUrl,
      });
    }

    for (const h of highlights) {
      items.push({
        type: 'highlight',
        id: h.id,
        name: h.title,
        destinationId: h.destinationId,
        destinationName: destMap.get(h.destinationId) || 'Unknown',
        currentImage: h.imageUrl,
        websiteUrl: h.websiteUrl,
      });
    }

    for (const e of events) {
      items.push({
        type: 'event',
        id: e.id,
        name: e.name,
        destinationId: e.destinationId,
        destinationName: destMap.get(e.destinationId) || 'Unknown',
        currentImage: e.imageUrl,
        websiteUrl: e.ticketUrl || e.bookingUrl,
        searchContext: e.venue || undefined,
      });
    }

    return { items };
  });

/** Batch update images for multiple items */
export const bulkUpdateImages = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    updates: z.array(z.object({
      type: z.enum(['destination', 'highlight', 'event']),
      id: z.string().min(1),
      imageUrl: z.string().url(),
    })),
  }))
  .handler(async ({ data: { updates } }) => {
    const results: { id: string; success: boolean; error?: string }[] = [];

    for (const update of updates) {
      try {
        switch (update.type) {
          case 'destination':
            await db.update(tripDestinations)
              .set({ photoUrl: update.imageUrl })
              .where(eq(tripDestinations.id, update.id));
            break;
          case 'highlight':
            await db.update(destinationHighlights)
              .set({ imageUrl: update.imageUrl })
              .where(eq(destinationHighlights.id, update.id));
            break;
          case 'event':
            await db.update(destinationEvents)
              .set({ imageUrl: update.imageUrl })
              .where(eq(destinationEvents.id, update.id));
            break;
        }
        results.push({ id: update.id, success: true });
      } catch (err) {
        results.push({ id: update.id, success: false, error: (err as Error).message });
      }
    }

    return { results };
  });
