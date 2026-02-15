import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { accommodations, tripDestinations, trips, itineraryItems } from '../db/schema';
import { eq, and, ne } from 'drizzle-orm';

export const getAccommodationDetail = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ accommodationId: z.string().min(1) }))
  .handler(async ({ data: { accommodationId } }) => {
    const [accommodation] = await db.select().from(accommodations)
      .where(eq(accommodations.id, accommodationId));
    if (!accommodation) throw new Error('Accommodation not found');

    let destination = null;
    if (accommodation.destinationId) {
      const [d] = await db.select().from(tripDestinations)
        .where(eq(tripDestinations.id, accommodation.destinationId));
      destination = d || null;
    }

    const [trip] = await db.select().from(trips)
      .where(eq(trips.id, accommodation.tripId));

    // Related accommodations at same destination
    const relatedAccommodations = accommodation.destinationId
      ? await db.select().from(accommodations)
          .where(and(
            eq(accommodations.destinationId, accommodation.destinationId),
            ne(accommodations.id, accommodationId),
          ))
          .limit(6)
      : [];

    // Check if already in itinerary (look for items with matching title pattern and category='rest')
    const itineraryEntries = await db.select().from(itineraryItems)
      .where(and(
        eq(itineraryItems.tripId, accommodation.tripId),
        eq(itineraryItems.category, 'rest'),
      ));
    // Filter by name match
    const isInItinerary = itineraryEntries.some(item =>
      item.title.includes(accommodation.name)
    );

    return {
      accommodation,
      destination,
      trip,
      relatedAccommodations,
      isInItinerary,
    };
  });

export const addAccommodationToItinerary = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    tripId: z.string().min(1),
    accommodationId: z.string().min(1),
    destinationId: z.string().optional(),
    title: z.string().min(1),
    checkIn: z.string().min(1),
    checkOut: z.string().min(1),
    notes: z.string().optional(),
    selectedNights: z.array(z.string()).optional(), // specific nights to add, if not all
  }))
  .handler(async ({ data }) => {
    // Calculate all nights between check-in and check-out
    const allNights: string[] = [];
    const d = new Date(data.checkIn + 'T00:00:00');
    const end = new Date(data.checkOut + 'T00:00:00');
    while (d < end) {
      allNights.push(d.toISOString().split('T')[0]);
      d.setDate(d.getDate() + 1);
    }

    const nightsToAdd = data.selectedNights && data.selectedNights.length > 0
      ? allNights.filter(n => data.selectedNights!.includes(n))
      : allNights;

    const totalNights = allNights.length;

    const items = await db.insert(itineraryItems).values(
      nightsToAdd.map((date, i) => {
        const nightNum = allNights.indexOf(date) + 1;
        return {
          tripId: data.tripId,
          destinationId: data.destinationId || null,
          title: totalNights > 1
            ? `🏨 ${data.title} (Night ${nightNum} of ${totalNights})`
            : `🏨 ${data.title}`,
          date,
          category: 'rest',
          notes: data.notes,
          orderIndex: 100 + nightNum, // high order so rest shows at end of day
        };
      }),
    ).returning();

    return items;
  });
