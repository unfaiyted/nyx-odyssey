import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { trips, tripDestinations, destinationResearch, destinationHighlights, destinationWeatherMonthly, accommodations } from '../db/schema';
import { eq, and, asc } from 'drizzle-orm';

// Default fallback home base (Vicenza) — used only if trip has no home base configured
const DEFAULT_HOME_BASE = { lat: 45.5485, lng: 11.5479, name: 'Vicenza (Home)', currency: 'EUR' };

async function getHomeBaseForDestination(destinationId: string) {
  // Look up the trip this destination belongs to
  const [dest] = await db.select().from(tripDestinations).where(eq(tripDestinations.id, destinationId));
  if (!dest?.tripId) return DEFAULT_HOME_BASE;
  
  const [trip] = await db.select().from(trips).where(eq(trips.id, dest.tripId));
  if (!trip?.homeBaseLat || !trip?.homeBaseLng) return DEFAULT_HOME_BASE;
  
  return {
    lat: trip.homeBaseLat,
    lng: trip.homeBaseLng,
    name: trip.homeBaseName || 'Home Base',
    currency: trip.homeBaseCurrency || trip.currency || 'USD',
  };
}

interface OSRMRoute {
  durationMinutes: number;
  distanceKm: number;
  polyline?: string;
}

async function getOSRMRoute(
  fromLat: number, fromLng: number,
  toLat: number, toLng: number,
  profile: 'car' | 'foot' = 'car'
): Promise<OSRMRoute | null> {
  try {
    const profileMap = { car: 'driving', foot: 'foot' };
    const url = `https://router.project-osrm.org/route/v1/${profileMap[profile]}/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=polyline`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.length) return null;
    return {
      durationMinutes: Math.round(data.routes[0].duration / 60),
      distanceKm: Math.round(data.routes[0].distance / 1000 * 10) / 10,
      polyline: data.routes[0].geometry,
    };
  } catch (e) {
    console.error('OSRM route error:', e);
    return null;
  }
}

// Estimate fuel cost based on distance (€0.15/km)
function estimateFuelCost(distanceKm: number): number {
  return Math.round(distanceKm * 0.15 * 100) / 100;
}

// Estimate tolls based on distance in Italy (rough estimate: €0.08/km on highways)
function estimateTolls(distanceKm: number): number {
  return Math.round(distanceKm * 0.08 * 100) / 100;
}

// Calculate drive cost (fuel + tolls)
function estimateDriveCost(distanceKm: number): number {
  return estimateFuelCost(distanceKm) + estimateTolls(distanceKm);
}

export const getDestinationDetail = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ destinationId: z.string().min(1) }))
  .handler(async ({ data: { destinationId } }) => {
    const [dest] = await db.select().from(tripDestinations).where(eq(tripDestinations.id, destinationId));
    if (!dest) throw new Error('Destination not found');

    const [research] = await db.select().from(destinationResearch).where(eq(destinationResearch.destinationId, destinationId));
    const highlights = await db.select().from(destinationHighlights)
      .where(eq(destinationHighlights.destinationId, destinationId))
      .orderBy(asc(destinationHighlights.orderIndex));
    const weather = await db.select().from(destinationWeatherMonthly)
      .where(eq(destinationWeatherMonthly.destinationId, destinationId))
      .orderBy(asc(destinationWeatherMonthly.month));
    const destAccommodations = await db.select().from(accommodations)
      .where(eq(accommodations.destinationId, destinationId));

    // Fetch trip home base for transport display
    let homeBase: { name: string; lat: number; lng: number; address?: string; currency?: string } | null = null;
    if (dest.tripId) {
      const [trip] = await db.select().from(trips).where(eq(trips.id, dest.tripId));
      if (trip?.homeBaseLat && trip?.homeBaseLng) {
        homeBase = {
          name: trip.homeBaseName || 'Home Base',
          lat: trip.homeBaseLat,
          lng: trip.homeBaseLng,
          address: trip.homeBaseAddress || undefined,
          currency: trip.homeBaseCurrency || trip.currency || undefined,
        };
      }
    }

    return {
      destination: dest,
      research: research || null,
      highlights,
      weather,
      accommodations: destAccommodations,
      homeBase,
    };
  });

export const upsertDestinationResearch = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    destinationId: z.string().min(1),
    country: z.string().optional(),
    region: z.string().optional(),
    timezone: z.string().optional(),
    language: z.string().optional(),
    currency: z.string().optional(),
    population: z.string().optional(),
    elevation: z.string().optional(),
    bestTimeToVisit: z.string().optional(),
    avgTempHighC: z.number().optional(),
    avgTempLowC: z.number().optional(),
    rainyDaysPerMonth: z.number().optional(),
    weatherNotes: z.string().optional(),
    dailyBudgetLow: z.string().optional(),
    dailyBudgetMid: z.string().optional(),
    dailyBudgetHigh: z.string().optional(),
    budgetCurrency: z.string().optional(),
    costNotes: z.string().optional(),
    transportNotes: z.string().optional(),
    nearestAirport: z.string().optional(),
    safetyRating: z.number().optional(),
    safetyNotes: z.string().optional(),
    culturalNotes: z.string().optional(),
    summary: z.string().optional(),
    travelTips: z.string().optional(),
    // Transport fields
    driveTimeMinutes: z.number().optional(),
    driveDistanceKm: z.number().optional(),
    driveCost: z.string().optional(),
    driveRouteNotes: z.string().optional(),
    trainTimeMinutes: z.number().optional(),
    trainCost: z.string().optional(),
    trainRouteNotes: z.string().optional(),
    busTimeMinutes: z.number().optional(),
    busCost: z.string().optional(),
    busRouteNotes: z.string().optional(),
    taxiTimeMinutes: z.number().optional(),
    taxiCost: z.string().optional(),
    taxiRouteNotes: z.string().optional(),
    transportCurrency: z.string().optional(),
    routePolyline: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const { destinationId, ...values } = data;
    const existing = await db.select().from(destinationResearch)
      .where(eq(destinationResearch.destinationId, destinationId));

    if (existing.length > 0) {
      const [updated] = await db.update(destinationResearch)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(destinationResearch.destinationId, destinationId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(destinationResearch)
        .values({ destinationId, ...values })
        .returning();
      return created;
    }
  });

export const addDestinationHighlight = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    destinationId: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    category: z.string().default('attraction'),
    rating: z.number().optional(),
    priceLevel: z.number().optional(),
    imageUrl: z.string().optional(),
    address: z.string().optional(),
    websiteUrl: z.string().optional(),
    duration: z.string().optional(),
    orderIndex: z.number().default(0),
  }))
  .handler(async ({ data }) => {
    const [item] = await db.insert(destinationHighlights).values(data).returning();
    return item;
  });

export const deleteDestinationHighlight = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data: { id } }) => {
    await db.delete(destinationHighlights).where(eq(destinationHighlights.id, id));
    return { ok: true };
  });

export const calculateTransportFromHome = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ 
    destinationId: z.string().min(1),
    destinationLat: z.number(),
    destinationLng: z.number(),
  }))
  .handler(async ({ data }) => {
    const { destinationId, destinationLat, destinationLng } = data;

    // Look up the trip's home base dynamically
    const homeBase = await getHomeBaseForDestination(destinationId);
    const currency = homeBase.currency;
    const currencySymbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

    // Get driving route from OSRM
    const carRoute = await getOSRMRoute(
      homeBase.lat, homeBase.lng,
      destinationLat, destinationLng,
      'car'
    );

    if (!carRoute) {
      throw new Error(`Could not calculate route from ${homeBase.name} to destination`);
    }

    const distanceKm = carRoute.distanceKm;
    const driveTimeMinutes = carRoute.durationMinutes;
    const driveCost = estimateDriveCost(distanceKm);
    
    // Estimate train time (typically 0.7x car time + 15 min for station access)
    const trainTimeMinutes = Math.round(driveTimeMinutes * 0.7 + 15);
    // Estimate train cost (roughly 0.10/km for regional trains)
    const trainCost = Math.round(distanceKm * 0.10 * 100) / 100;

    // Estimate bus time (typically 1.3x car time + 10 min for stops)
    const busTimeMinutes = Math.round(driveTimeMinutes * 1.3 + 10);
    // Estimate bus cost (roughly 0.06/km for regional buses)
    const busCost = Math.round(distanceKm * 0.06 * 100) / 100;

    // Estimate taxi time (similar to car)
    const taxiTimeMinutes = driveTimeMinutes;
    // Estimate taxi cost (roughly 2.50 base + 1.50/km)
    const taxiCost = Math.round((2.50 + distanceKm * 1.50) * 100) / 100;

    // Generate route notes (generic, not Vicenza-specific)
    const driveRouteNotes = `From ${homeBase.name}. Approx ${currencySymbol}${estimateTolls(distanceKm).toFixed(2)} in tolls, ${currencySymbol}${estimateFuelCost(distanceKm).toFixed(2)} fuel cost. Distance: ${distanceKm.toFixed(1)} km.`;
    const trainRouteNotes = `Check local rail services from ${homeBase.name}. Typical journey time ~${Math.round(trainTimeMinutes / 60)}h ${trainTimeMinutes % 60}m. Book in advance for best prices.`;
    const busRouteNotes = `Check regional bus services. May require transfer depending on destination.`;
    const taxiRouteNotes = `Direct door-to-door service. Consider rideshare apps or local taxi services. Best for groups or late-night travel.`;

    // Update the database
    const existing = await db.select().from(destinationResearch)
      .where(eq(destinationResearch.destinationId, destinationId));

    const values = {
      driveTimeMinutes,
      driveDistanceKm: distanceKm,
      driveCost: driveCost.toString(),
      driveRouteNotes,
      trainTimeMinutes,
      trainCost: trainCost.toString(),
      trainRouteNotes,
      busTimeMinutes,
      busCost: busCost.toString(),
      busRouteNotes,
      taxiTimeMinutes,
      taxiCost: taxiCost.toString(),
      transportCurrency: currency,
      taxiRouteNotes,
      routePolyline: carRoute.polyline,
      updatedAt: new Date(),
    };

    if (existing.length > 0) {
      await db.update(destinationResearch)
        .set(values)
        .where(eq(destinationResearch.destinationId, destinationId));
    } else {
      await db.insert(destinationResearch).values({
        destinationId,
        ...values,
      });
    }

    return {
      drive: {
        timeMinutes: driveTimeMinutes,
        distanceKm,
        cost: driveCost,
        notes: driveRouteNotes,
      },
      train: {
        timeMinutes: trainTimeMinutes,
        cost: trainCost,
        notes: trainRouteNotes,
      },
      bus: {
        timeMinutes: busTimeMinutes,
        cost: busCost,
        notes: busRouteNotes,
      },
      taxi: {
        timeMinutes: taxiTimeMinutes,
        cost: taxiCost,
        notes: taxiRouteNotes,
      },
      currency,
      polyline: carRoute.polyline,
    };
  });
