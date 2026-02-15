import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { trips, itineraryItems, destinationHighlights, tripDestinations } from '../db/schema';
import { eq, and } from 'drizzle-orm';

// Default fallback home base — used only if trip has no home base configured
const DEFAULT_HOME_BASE = { lat: 45.5455, lng: 11.5354, name: 'Vicenza (Home)' };

async function getHomeBaseForTrip(tripId: string) {
  const [trip] = await db.select().from(trips).where(eq(trips.id, tripId));
  if (!trip?.homeBaseLat || !trip?.homeBaseLng) return DEFAULT_HOME_BASE;
  return {
    lat: trip.homeBaseLat,
    lng: trip.homeBaseLng,
    name: trip.homeBaseName || 'Home Base',
  };
}

const DURATION_SUGGESTIONS: Record<string, number> = {
  attraction: 120,
  food: 90,
  activity: 180,
  nightlife: 180,
  shopping: 120,
  nature: 240,
  cultural: 120,
};

interface TravelEstimate {
  mode: string;
  durationMinutes: number;
  distanceKm: number;
  label: string;
}

async function getOSRMRoute(
  fromLat: number, fromLng: number,
  toLat: number, toLng: number,
  profile: 'car' | 'foot' = 'car'
): Promise<{ durationMinutes: number; distanceKm: number } | null> {
  try {
    const profileMap = { car: 'driving', foot: 'foot' };
    const url = `https://router.project-osrm.org/route/v1/${profileMap[profile]}/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.length) return null;
    return {
      durationMinutes: Math.round(data.routes[0].duration / 60),
      distanceKm: Math.round(data.routes[0].distance / 1000 * 10) / 10,
    };
  } catch {
    return null;
  }
}

export const calculateTravelTime = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    fromLat: z.number(),
    fromLng: z.number(),
    toLat: z.number(),
    toLng: z.number(),
    fromName: z.string().optional(),
  }))
  .handler(async ({ data }): Promise<TravelEstimate[]> => {
    const estimates: TravelEstimate[] = [];

    // Car
    const car = await getOSRMRoute(data.fromLat, data.fromLng, data.toLat, data.toLng, 'car');
    if (car) {
      estimates.push({ mode: 'car', ...car, label: `🚗 Drive · ${car.durationMinutes} min · ${car.distanceKm} km` });
    }

    // Walking (only if < 5km straight line)
    const straightLine = haversineKm(data.fromLat, data.fromLng, data.toLat, data.toLng);
    if (straightLine < 5) {
      const walk = await getOSRMRoute(data.fromLat, data.fromLng, data.toLat, data.toLng, 'foot');
      if (walk) {
        estimates.push({ mode: 'walk', ...walk, label: `🚶 Walk · ${walk.durationMinutes} min · ${walk.distanceKm} km` });
      }
    }

    // Train estimate (rough: car time * 0.7 for Italy intercity, +15 min for station)
    if (car && car.distanceKm > 20) {
      const trainMin = Math.round(car.durationMinutes * 0.7 + 15);
      estimates.push({ mode: 'train', durationMinutes: trainMin, distanceKm: car.distanceKm, label: `🚆 Train · ~${trainMin} min · ${car.distanceKm} km` });
    }

    // Bus estimate (car time * 1.3 + 10 min for stops)
    if (car && car.distanceKm > 5) {
      const busMin = Math.round(car.durationMinutes * 1.3 + 10);
      estimates.push({ mode: 'bus', durationMinutes: busMin, distanceKm: car.distanceKm, label: `🚌 Bus · ~${busMin} min · ${car.distanceKm} km` });
    }

    return estimates;
  });

export const addHighlightToItinerary = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    tripId: z.string().min(1),
    highlightId: z.string().min(1),
    date: z.string().min(1),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    durationMinutes: z.number().optional(),
    travelMode: z.string().optional(),
    notes: z.string().optional(),
    addTravelSegment: z.boolean().default(true),
  }))
  .handler(async ({ data }) => {
    // Get the highlight
    const [highlight] = await db.select().from(destinationHighlights)
      .where(eq(destinationHighlights.id, data.highlightId));
    if (!highlight) throw new Error('Highlight not found');

    // Get the destination for lat/lng fallback
    const [destination] = await db.select().from(tripDestinations)
      .where(eq(tripDestinations.id, highlight.destinationId));

    const highlightLat = highlight.lat || destination?.lat;
    const highlightLng = highlight.lng || destination?.lng;

    // Determine duration from highlight or suggestion
    const suggestedDuration = data.durationMinutes || DURATION_SUGGESTIONS[highlight.category || 'attraction'] || 120;

    // Calculate end time if not provided
    let startTime = data.startTime || '09:00';
    let endTime = data.endTime;
    if (!endTime && startTime) {
      const [h, m] = startTime.split(':').map(Number);
      const endMinutes = h * 60 + m + suggestedDuration;
      const eh = Math.floor(endMinutes / 60);
      const em = endMinutes % 60;
      endTime = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
    }

    // Find previous itinerary item on same day for travel calc
    const dayItems = await db.select().from(itineraryItems)
      .where(and(eq(itineraryItems.tripId, data.tripId), eq(itineraryItems.date, data.date)));
    const sorted = dayItems
      .filter(i => i.startTime && i.category !== 'travel')
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

    // Find the previous activity (before our start time)
    const prevItem = sorted.filter(i => (i.endTime || i.startTime || '') < startTime).pop();

    const homeBase = await getHomeBaseForTrip(data.tripId);
    let travelTimeMinutes: number | null = null;
    let travelFromLocation = homeBase.name;
    let fromLat = homeBase.lat;
    let fromLng = homeBase.lng;

    if (prevItem && prevItem.lat && prevItem.lng) {
      fromLat = prevItem.lat;
      fromLng = prevItem.lng;
      travelFromLocation = prevItem.location || prevItem.title;
    }

    // Calculate travel time
    if (highlightLat && highlightLng && data.addTravelSegment) {
      const route = await getOSRMRoute(fromLat, fromLng, highlightLat, highlightLng, 
        (data.travelMode === 'walk' || data.travelMode === 'foot') ? 'foot' : 'car');
      if (route) {
        travelTimeMinutes = route.durationMinutes;
        // Adjust for non-car modes
        if (data.travelMode === 'train') travelTimeMinutes = Math.round(route.durationMinutes * 0.7 + 15);
        if (data.travelMode === 'bus') travelTimeMinutes = Math.round(route.durationMinutes * 1.3 + 10);
      }
    }

    // Adjust start time to account for travel
    if (travelTimeMinutes && data.addTravelSegment) {
      const [h, m] = startTime.split(':').map(Number);
      const arrivalMinutes = h * 60 + m;
      const departMinutes = arrivalMinutes - travelTimeMinutes;
      const dh = Math.max(0, Math.floor(departMinutes / 60));
      const dm = Math.max(0, departMinutes % 60);

      // Add travel segment item
      const travelStart = `${String(dh).padStart(2, '0')}:${String(dm).padStart(2, '0')}`;
      const modeEmoji: Record<string, string> = { car: '🚗', train: '🚆', bus: '🚌', walk: '🚶' };
      const mode = data.travelMode || 'car';

      const maxOrder = dayItems.reduce((max, i) => Math.max(max, i.orderIndex), -1);

      await db.insert(itineraryItems).values({
        tripId: data.tripId,
        title: `${modeEmoji[mode] || '🚗'} Travel to ${highlight.title}`,
        description: `From ${travelFromLocation} · ${travelTimeMinutes} min by ${mode}`,
        date: data.date,
        startTime: travelStart,
        endTime: startTime,
        location: travelFromLocation,
        lat: fromLat,
        lng: fromLng,
        category: 'transport',
        travelTimeMinutes,
        travelMode: mode,
        travelFromLocation,
        orderIndex: maxOrder + 1,
      });
    }

    // Add the activity item
    const maxOrder2 = (await db.select().from(itineraryItems)
      .where(and(eq(itineraryItems.tripId, data.tripId), eq(itineraryItems.date, data.date))))
      .reduce((max, i) => Math.max(max, i.orderIndex), -1);

    const [item] = await db.insert(itineraryItems).values({
      tripId: data.tripId,
      destinationHighlightId: data.highlightId,
      title: highlight.title,
      description: highlight.description,
      date: data.date,
      startTime,
      endTime,
      location: highlight.address || destination?.name,
      lat: highlightLat,
      lng: highlightLng,
      category: highlight.category === 'food' ? 'meal' : 'sightseeing',
      travelTimeMinutes,
      travelMode: data.travelMode || 'car',
      travelFromLocation,
      notes: data.notes,
      orderIndex: maxOrder2 + 1,
    }).returning();

    return item;
  });

export const getTravelEstimates = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    tripId: z.string().min(1),
    highlightId: z.string().min(1),
    date: z.string().min(1),
    startTime: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const [highlight] = await db.select().from(destinationHighlights)
      .where(eq(destinationHighlights.id, data.highlightId));
    if (!highlight) throw new Error('Highlight not found');

    const [destination] = await db.select().from(tripDestinations)
      .where(eq(tripDestinations.id, highlight.destinationId));

    const toLat = highlight.lat || destination?.lat;
    const toLng = highlight.lng || destination?.lng;
    const homeBase = await getHomeBaseForTrip(data.tripId);
    if (!toLat || !toLng) return { estimates: [], fromName: homeBase.name, suggestedDuration: DURATION_SUGGESTIONS[highlight.category || 'attraction'] || 120 };

    // Find previous item on the day
    const dayItems = await db.select().from(itineraryItems)
      .where(and(eq(itineraryItems.tripId, data.tripId), eq(itineraryItems.date, data.date)));
    const sorted = dayItems
      .filter(i => i.startTime && i.category !== 'transport')
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

    const startTime = data.startTime || '09:00';
    const prevItem = sorted.filter(i => (i.endTime || i.startTime || '') < startTime).pop();

    let fromLat = homeBase.lat;
    let fromLng = homeBase.lng;
    let fromName = homeBase.name;

    if (prevItem && prevItem.lat && prevItem.lng) {
      fromLat = prevItem.lat;
      fromLng = prevItem.lng;
      fromName = prevItem.location || prevItem.title;
    }

    const estimates: TravelEstimate[] = [];

    const car = await getOSRMRoute(fromLat, fromLng, toLat, toLng, 'car');
    if (car) {
      estimates.push({ mode: 'car', ...car, label: `🚗 Drive · ${car.durationMinutes} min · ${car.distanceKm} km` });
      if (car.distanceKm > 20) {
        const trainMin = Math.round(car.durationMinutes * 0.7 + 15);
        estimates.push({ mode: 'train', durationMinutes: trainMin, distanceKm: car.distanceKm, label: `🚆 Train · ~${trainMin} min` });
      }
      if (car.distanceKm > 5) {
        const busMin = Math.round(car.durationMinutes * 1.3 + 10);
        estimates.push({ mode: 'bus', durationMinutes: busMin, distanceKm: car.distanceKm, label: `🚌 Bus · ~${busMin} min` });
      }
    }

    const straightLine = haversineKm(fromLat, fromLng, toLat, toLng);
    if (straightLine < 5) {
      const walk = await getOSRMRoute(fromLat, fromLng, toLat, toLng, 'foot');
      if (walk) {
        estimates.push({ mode: 'walk', ...walk, label: `🚶 Walk · ${walk.durationMinutes} min · ${walk.distanceKm} km` });
      }
    }

    return {
      estimates,
      fromName,
      suggestedDuration: DURATION_SUGGESTIONS[highlight.category || 'attraction'] || 120,
    };
  });

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
