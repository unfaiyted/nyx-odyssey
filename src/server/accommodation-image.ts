import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { accommodations } from '../db/schema';
import { eq } from 'drizzle-orm';
import { iris } from '../lib/iris-client';
import type { CandidateImage } from './destination-image';

export const updateAccommodationImage = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    accommodationId: z.string().min(1),
    imageUrl: z.string().url(),
  }))
  .handler(async ({ data: { accommodationId, imageUrl } }) => {
    const [updated] = await db.update(accommodations)
      .set({ imageUrl })
      .where(eq(accommodations.id, accommodationId))
      .returning();
    if (!updated) throw new Error('Accommodation not found');
    return updated;
  });

export const findAccommodationImages = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    name: z.string().min(1),
    address: z.string().optional(),
    destinationName: z.string().optional(),
    bookingUrl: z.string().optional(),
    type: z.string().optional(),
  }))
  .handler(async ({ data: { name, address, destinationName, bookingUrl, type } }) => {
    const images: CandidateImage[] = [];
    const promises: Promise<void>[] = [];

    // Extract from booking URL if available
    if (bookingUrl) {
      promises.push(
        iris.extract(bookingUrl, 'accommodation')
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
    const typeLabel = type && type !== 'other' ? type : 'hotel';
    const query = [name, typeLabel, destinationName || address].filter(Boolean).join(' ');
    promises.push(
      iris.search(query, 12)
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

    const seen = new Set<string>();
    const unique = images.filter(img => {
      if (seen.has(img.url)) return false;
      seen.add(img.url);
      return true;
    });
    unique.sort((a, b) => b.score - a.score);

    return unique;
  });
