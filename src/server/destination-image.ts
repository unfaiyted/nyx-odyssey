import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { tripDestinations } from '../db/schema';
import { eq } from 'drizzle-orm';
import { iris } from '../lib/iris-client';
export const updateDestinationImage = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    destinationId: z.string().min(1),
    imageUrl: z.string().url(),
  }))
  .handler(async ({ data: { destinationId, imageUrl } }) => {
    const [updated] = await db.update(tripDestinations)
      .set({ photoUrl: imageUrl })
      .where(eq(tripDestinations.id, destinationId))
      .returning();
    if (!updated) throw new Error('Destination not found');
    return updated;
  });

export interface CandidateImage {
  url: string;
  thumbnailUrl?: string;
  source: string;
  width: number;
  height: number;
  score: number;
  alt: string;
}

export const findDestinationImages = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    destinationName: z.string().min(1),
    country: z.string().optional(),
    websiteUrl: z.string().optional(),
  }))
  .handler(async ({ data: { destinationName, country, websiteUrl } }) => {
    const images: CandidateImage[] = [];

    const promises: Promise<void>[] = [];

    // Extract from website if available
    if (websiteUrl) {
      promises.push(
        iris.extract(websiteUrl, 'destination')
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

    // Search fallback
    const query = [destinationName, country].filter(Boolean).join(' ');
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

    // Deduplicate by URL and sort by score
    const seen = new Set<string>();
    const unique = images.filter(img => {
      if (seen.has(img.url)) return false;
      seen.add(img.url);
      return true;
    });

    unique.sort((a, b) => b.score - a.score);

    return unique;
  });
