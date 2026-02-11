import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { tripDestinations, destinationHighlights, destinationResearch } from '../db/schema';
import { eq } from 'drizzle-orm';
import { getDestinationPhoto, getHighlightMedia } from './image-search';

/**
 * Fetch a real photo for a destination and store it
 */
export const fetchDestinationPhoto = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ destinationId: z.string().min(1) }))
  .handler(async ({ data: { destinationId } }) => {
    const [dest] = await db.select().from(tripDestinations).where(eq(tripDestinations.id, destinationId));
    if (!dest) throw new Error('Destination not found');

    // Get country from research if available
    const [research] = await db.select().from(destinationResearch).where(eq(destinationResearch.destinationId, destinationId));
    const country = research?.country || undefined;

    const photoUrl = await getDestinationPhoto(dest.name, country);
    if (!photoUrl) return { photoUrl: null, updated: false };

    await db.update(tripDestinations)
      .set({ photoUrl })
      .where(eq(tripDestinations.id, destinationId));

    return { photoUrl, updated: true };
  });

/**
 * Fetch images and websites for all highlights of a destination
 */
export const fetchHighlightImages = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ destinationId: z.string().min(1) }))
  .handler(async ({ data: { destinationId } }) => {
    const [dest] = await db.select().from(tripDestinations).where(eq(tripDestinations.id, destinationId));
    if (!dest) throw new Error('Destination not found');

    const highlights = await db.select().from(destinationHighlights)
      .where(eq(destinationHighlights.destinationId, destinationId));

    const results: { id: string; title: string; imageUrl: string | null; websiteUrl: string | null }[] = [];

    // Process highlights sequentially with small delay to not overwhelm SearXNG
    for (const h of highlights) {
      // Skip if already has both image and website
      if (h.imageUrl && h.websiteUrl) {
        results.push({ id: h.id, title: h.title, imageUrl: h.imageUrl, websiteUrl: h.websiteUrl });
        continue;
      }

      const media = await getHighlightMedia(h.title, dest.name);

      const updates: Record<string, string> = {};
      if (!h.imageUrl && media.imageUrl) updates.imageUrl = media.imageUrl;
      if (!h.websiteUrl && media.websiteUrl) updates.websiteUrl = media.websiteUrl;

      if (Object.keys(updates).length > 0) {
        await db.update(destinationHighlights)
          .set(updates)
          .where(eq(destinationHighlights.id, h.id));
      }

      results.push({
        id: h.id,
        title: h.title,
        imageUrl: media.imageUrl || h.imageUrl,
        websiteUrl: media.websiteUrl || h.websiteUrl,
      });

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    return { destination: dest.name, highlights: results, total: results.length };
  });

/**
 * Fetch everything: destination photo + all highlight images/websites
 */
export const researchDestinationImages = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ destinationId: z.string().min(1) }))
  .handler(async ({ data: { destinationId } }) => {
    const [dest] = await db.select().from(tripDestinations).where(eq(tripDestinations.id, destinationId));
    if (!dest) throw new Error('Destination not found');

    // Fetch destination photo if missing
    let photoUrl = dest.photoUrl;
    if (!photoUrl) {
      const [research] = await db.select().from(destinationResearch).where(eq(destinationResearch.destinationId, destinationId));
      const newPhoto = await getDestinationPhoto(dest.name, research?.country || undefined);
      if (newPhoto) {
        await db.update(tripDestinations).set({ photoUrl: newPhoto }).where(eq(tripDestinations.id, destinationId));
        photoUrl = newPhoto;
      }
    }

    // Fetch highlight images
    const highlights = await db.select().from(destinationHighlights)
      .where(eq(destinationHighlights.destinationId, destinationId));

    let updatedCount = 0;
    for (const h of highlights) {
      if (h.imageUrl && h.websiteUrl) continue;

      const media = await getHighlightMedia(h.title, dest.name);
      const updates: Record<string, string> = {};
      if (!h.imageUrl && media.imageUrl) updates.imageUrl = media.imageUrl;
      if (!h.websiteUrl && media.websiteUrl) updates.websiteUrl = media.websiteUrl;

      if (Object.keys(updates).length > 0) {
        await db.update(destinationHighlights).set(updates).where(eq(destinationHighlights.id, h.id));
        updatedCount++;
      }

      await new Promise(resolve => setTimeout(resolve, 300));
    }

    return {
      destination: dest.name,
      photoUrl,
      highlightsUpdated: updatedCount,
      totalHighlights: highlights.length,
    };
  });
