import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { destinationEvents, tripDestinations, trips, itineraryItems, accommodations } from '../db/schema';
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
    dates: z.array(z.string().min(1)).min(1),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    durationMinutes: z.number().optional(),
    location: z.string().optional(),
    category: z.string().default('activity'),
    travelMode: z.string().optional(),
    travelTimeMinutes: z.number().optional(),
    travelFromLocation: z.string().optional(),
    addTravelSegment: z.boolean().default(false),
    addReturnSegment: z.boolean().default(false),
    notes: z.string().optional(),
    dayLabels: z.record(z.string(), z.string()).optional(), // date -> label like "Day 1 - Practice"
  }))
  .handler(async ({ data }) => {
    // Get destination coords and home base for travel segments
    let destLat: number | null = null;
    let destLng: number | null = null;
    let homeBase: { lat: number; lng: number; name: string } | null = null;
    let travelTimeMin: number | null = null;

    if (data.addTravelSegment || data.addReturnSegment) {
      const [dest] = await db.select().from(tripDestinations).where(eq(tripDestinations.id, data.destinationId));
      if (dest) {
        destLat = dest.lat;
        destLng = dest.lng;
      }

      const [trip] = await db.select().from(trips).where(eq(trips.id, data.tripId));
      if (trip?.homeBaseLat && trip?.homeBaseLng) {
        homeBase = { lat: trip.homeBaseLat, lng: trip.homeBaseLng, name: trip.homeBaseName || 'Home Base' };
      } else {
        // Check for home base accommodation
        const [hbAccom] = await db.select().from(accommodations)
          .where(and(eq(accommodations.tripId, data.tripId), eq(accommodations.isHomeBase, true)));
        if (hbAccom?.lat && hbAccom?.lng) {
          homeBase = { lat: hbAccom.lat, lng: hbAccom.lng, name: hbAccom.name };
        }
      }

      // Calculate travel time via OSRM
      if (destLat && destLng && homeBase) {
        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${homeBase.lng},${homeBase.lat};${destLng},${destLat}?overview=false`;
          const res = await fetch(url);
          if (res.ok) {
            const json = await res.json();
            if (json.code === 'Ok' && json.routes?.length) {
              travelTimeMin = Math.round(json.routes[0].duration / 60);
              if (data.travelMode === 'train') travelTimeMin = Math.round(travelTimeMin * 0.7 + 15);
              if (data.travelMode === 'bus') travelTimeMin = Math.round(travelTimeMin * 1.3 + 10);
            }
          }
        } catch {}
      }
    }

    const modeEmoji: Record<string, string> = { car: '🚗', train: '🚆', bus: '🚌', walk: '🚶' };
    const mode = data.travelMode || 'car';
    const allItems: any[] = [];

    for (let i = 0; i < data.dates.length; i++) {
      const date = data.dates[i];
      const dayLabel = data.dayLabels?.[date];
      const title = data.dates.length > 1 && dayLabel
        ? `${data.title} — ${dayLabel}`
        : data.dates.length > 1
        ? `${data.title} (Day ${i + 1})`
        : data.title;

      const isFirstDay = i === 0;
      const isLastDay = i === data.dates.length - 1;

      let orderIdx = 0;
      const existingItems = await db.select().from(itineraryItems)
        .where(and(eq(itineraryItems.tripId, data.tripId), eq(itineraryItems.date, date)));
      orderIdx = existingItems.reduce((max, item) => Math.max(max, item.orderIndex), -1) + 1;

      // Outbound travel segment (first day only for multi-day, or always for single day)
      if (data.addTravelSegment && travelTimeMin && homeBase && (isFirstDay || data.dates.length === 1) && data.startTime) {
        const [h, m] = data.startTime.split(':').map(Number);
        const depMin = (h || 0) * 60 + (m || 0) - travelTimeMin;
        const depTime = `${String(Math.floor(Math.max(0, depMin) / 60)).padStart(2, '0')}:${String(Math.max(0, depMin) % 60).padStart(2, '0')}`;

        await db.insert(itineraryItems).values({
          tripId: data.tripId,
          title: `${modeEmoji[mode] || '🚗'} Travel to ${data.location || data.title}`,
          description: `From ${homeBase.name} · ${travelTimeMin} min by ${mode}`,
          date,
          startTime: depTime,
          endTime: data.startTime,
          location: homeBase.name,
          category: 'transport',
          travelTimeMinutes: travelTimeMin,
          travelMode: mode,
          travelFromLocation: homeBase.name,
          orderIndex: orderIdx++,
        });
      }

      // Event item
      const [item] = await db.insert(itineraryItems).values({
        tripId: data.tripId,
        eventId: data.eventId,
        destinationId: data.destinationId,
        title,
        description: data.description,
        date,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        category: data.category,
        travelMode: data.travelMode,
        travelTimeMinutes: data.travelTimeMinutes,
        travelFromLocation: data.travelFromLocation,
        notes: data.notes,
        orderIndex: orderIdx++,
      }).returning();
      allItems.push(item);

      // Return travel segment (last day only for multi-day, or always for single day)
      if (data.addReturnSegment && travelTimeMin && homeBase && (isLastDay || data.dates.length === 1) && data.endTime) {
        const [eh, em] = data.endTime.split(':').map(Number);
        const retEndMin = (eh || 0) * 60 + (em || 0) + travelTimeMin;
        const retEndTime = `${String(Math.floor(retEndMin / 60) % 24).padStart(2, '0')}:${String(retEndMin % 60).padStart(2, '0')}`;

        await db.insert(itineraryItems).values({
          tripId: data.tripId,
          title: `${modeEmoji[mode] || '🚗'} Return to ${homeBase.name}`,
          description: `From ${data.location || data.title} · ${travelTimeMin} min by ${mode}`,
          date,
          startTime: data.endTime,
          endTime: retEndTime,
          location: data.location,
          category: 'transport',
          travelTimeMinutes: travelTimeMin,
          travelMode: mode,
          travelFromLocation: data.location || data.title,
          orderIndex: orderIdx++,
        });
      }
    }

    return allItems;
  });
