import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { destinationEvents } from '../db/schema';
import { eq } from 'drizzle-orm';
import { iris } from '../lib/iris-client';
import type { CandidateImage } from './destination-image';

export const updateEventImage = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    eventId: z.string().min(1),
    imageUrl: z.string().url(),
  }))
  .handler(async ({ data: { eventId, imageUrl } }) => {
    const [updated] = await db.update(destinationEvents)
      .set({ imageUrl })
      .where(eq(destinationEvents.id, eventId))
      .returning();
    if (!updated) throw new Error('Event not found');
    return updated;
  });

export const findEventImages = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    eventName: z.string().min(1),
    venue: z.string().optional(),
    destinationName: z.string().optional(),
    extractUrl: z.string().optional(),
  }))
  .handler(async ({ data: { eventName, venue, destinationName, extractUrl } }) => {
    const images: CandidateImage[] = [];
    const promises: Promise<void>[] = [];

    // Extract from ticket/booking URL if available
    if (extractUrl) {
      promises.push(
        iris.extract(extractUrl, 'event')
          .then(result => {
            for (const img of result.images) {
              images.push({
                url: img.url,
                source: img.source || 'extract',
                width: img.width,
                height: img.height,
                score: img.score,
                alt: img.alt,
              });
            }
          })
          .catch(err => console.error('Iris extract failed:', err.message))
      );
    }

    // Search
    const query = [eventName, venue, destinationName].filter(Boolean).join(' ');
    promises.push(
      iris.search(query, 10)
        .then(result => {
          for (const img of result.images) {
            images.push({
              url: img.url,
              thumbnailUrl: img.thumbnailUrl,
              source: 'search',
              width: img.width,
              height: img.height,
              score: 0.5,
              alt: img.alt,
            });
          }
        })
        .catch(err => console.error('Iris search failed:', err.message))
    );

    await Promise.allSettled(promises);

    // Deduplicate and sort
    const seen = new Set<string>();
    const unique = images.filter(img => {
      if (seen.has(img.url)) return false;
      seen.add(img.url);
      return true;
    });
    unique.sort((a, b) => b.score - a.score);

    return unique;
  });
