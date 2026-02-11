import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { tripDestinations, destinationResearch, destinationHighlights, destinationWeatherMonthly, accommodations } from '../db/schema';
import { eq, and, asc } from 'drizzle-orm';

// Home base: Vicenza, Contrà S. Rocco #60
const HOME_BASE = { lat: 45.5485, lng: 11.5479 };

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

    return {
      destination: dest,
      research: research || null,
      highlights,
      weather,
      accommodations: destAccommodations,
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
    driveCostEuros: z.string().optional(),
    driveRouteNotes: z.string().optional(),
    trainTimeMinutes: z.number().optional(),
    trainCostEuros: z.string().optional(),
    trainRouteNotes: z.string().optional(),
    busTimeMinutes: z.number().optional(),
    busCostEuros: z.string().optional(),
    busRouteNotes: z.string().optional(),
    taxiTimeMinutes: z.number().optional(),
    taxiCostEuros: z.string().optional(),
    taxiRouteNotes: z.string().optional(),
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

    // Get driving route from OSRM
    const carRoute = await getOSRMRoute(
      HOME_BASE.lat, HOME_BASE.lng,
      destinationLat, destinationLng,
      'car'
    );

    if (!carRoute) {
      throw new Error('Could not calculate route from Vicenza to destination');
    }

    const distanceKm = carRoute.distanceKm;
    const driveTimeMinutes = carRoute.durationMinutes;
    const driveCost = estimateDriveCost(distanceKm);
    
    // Estimate train time (typically 0.7x car time + 15 min for station access)
    const trainTimeMinutes = Math.round(driveTimeMinutes * 0.7 + 15);
    // Estimate train cost (roughly €0.10/km for regional trains in Italy)
    const trainCost = Math.round(distanceKm * 0.10 * 100) / 100;

    // Estimate bus time (typically 1.3x car time + 10 min for stops)
    const busTimeMinutes = Math.round(driveTimeMinutes * 1.3 + 10);
    // Estimate bus cost (roughly €0.06/km for FlixBus/regional buses)
    const busCost = Math.round(distanceKm * 0.06 * 100) / 100;

    // Estimate taxi time (similar to car)
    const taxiTimeMinutes = driveTimeMinutes;
    // Estimate taxi cost (roughly €2.50 base + €1.50/km)
    const taxiCost = Math.round((2.50 + distanceKm * 1.50) * 100) / 100;

    // Generate route notes
    const driveRouteNotes = `Via highway from Vicenza. Approx €${estimateTolls(distanceKm).toFixed(2)} in tolls, €${estimateFuelCost(distanceKm).toFixed(2)} fuel cost. Distance: ${distanceKm.toFixed(1)} km.`;
    const trainRouteNotes = `Check Trenitalia or Italo from Vicenza station. Typical journey time ~${Math.round(trainTimeMinutes / 60)}h ${trainTimeMinutes % 60}m. Book in advance for best prices.`;
    const busRouteNotes = `Check FlixBus or regional bus services. May require transfer depending on destination.`;
    const taxiRouteNotes = `Direct door-to-door service. Consider rideshare apps like Uber or local taxi services. Best for groups or late-night travel.`;

    // Update the database
    const existing = await db.select().from(destinationResearch)
      .where(eq(destinationResearch.destinationId, destinationId));

    const values = {
      driveTimeMinutes,
      driveDistanceKm: distanceKm,
      driveCostEuros: driveCost.toString(),
      driveRouteNotes,
      trainTimeMinutes,
      trainCostEuros: trainCost.toString(),
      trainRouteNotes,
      busTimeMinutes,
      busCostEuros: busCost.toString(),
      busRouteNotes,
      taxiTimeMinutes,
      taxiCostEuros: taxiCost.toString(),
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
        costEuros: driveCost,
        notes: driveRouteNotes,
      },
      train: {
        timeMinutes: trainTimeMinutes,
        costEuros: trainCost,
        notes: trainRouteNotes,
      },
      bus: {
        timeMinutes: busTimeMinutes,
        costEuros: busCost,
        notes: busRouteNotes,
      },
      taxi: {
        timeMinutes: taxiTimeMinutes,
        costEuros: taxiCost,
        notes: taxiRouteNotes,
      },
      polyline: carRoute.polyline,
    };
  });
