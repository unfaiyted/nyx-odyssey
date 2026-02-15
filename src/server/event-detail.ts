import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { destinationEvents, tripDestinations, trips, itineraryItems } from '../db/schema';
import { eq, and, ne, asc } from 'drizzle-orm';

export const getEventDetail = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ eventId: z.string().min(1) }))
  .handler(async ({ data: { eventId } }) => {
    const [event] = await db.select().from(destinationEvents)
      .where(eq(destinationEvents.id, eventId));
    if (!event) throw new Error('Event not found');

    const [destination] = await db.select().from(tripDestinations)
      .where(eq(tripDestinations.id, event.destinationId));

    let trip = null;
    if (destination) {
      const [t] = await db.select().from(trips).where(eq(trips.id, destination.tripId));
      trip = t || null;
    }

    // Get related events (same destination, different event)
    const relatedEvents = await db.select().from(destinationEvents)
      .where(and(
        eq(destinationEvents.destinationId, event.destinationId),
        ne(destinationEvents.id, eventId),
      ))
      .limit(6);

    // Check if already in itinerary
    const itineraryEntry = await db.select().from(itineraryItems)
      .where(eq(itineraryItems.eventId, eventId));
    const isInItinerary = itineraryEntry.length > 0;

    return {
      event,
      destination,
      trip,
      relatedEvents,
      isInItinerary,
    };
  });

export const addEventToItinerary = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    tripId: z.string().min(1),
    eventId: z.string().min(1),
    destinationId: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    date: z.string().min(1),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    durationMinutes: z.number().optional(),
    location: z.string().optional(),
    category: z.string().default('activity'),
    travelMode: z.string().optional(),
    travelTimeMinutes: z.number().optional(),
    travelFromLocation: z.string().optional(),
    notes: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const [item] = await db.insert(itineraryItems).values({
      tripId: data.tripId,
      eventId: data.eventId,
      destinationId: data.destinationId,
      title: data.title,
      description: data.description,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      location: data.location,
      category: data.category,
      travelMode: data.travelMode,
      travelTimeMinutes: data.travelTimeMinutes,
      travelFromLocation: data.travelFromLocation,
      notes: data.notes,
      orderIndex: 0,
    }).returning();
    return item;
  });
