import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { destinationRouteCache } from '../db/schema';
import { eq } from 'drizzle-orm';

const VICENZA_LAT = 45.5477;
const VICENZA_LNG = 11.5486;

interface OSRMResponse {
  routes: Array<{
    geometry: string;
    distance: number;
    duration: number;
  }>;
}

async function fetchOSRMRoute(fromLat: number, fromLng: number, toLat: number, toLng: number) {
  const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=polyline`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM error: ${res.status}`);
  const data: OSRMResponse = await res.json();
  if (!data.routes?.length) throw new Error('No route found');
  const route = data.routes[0];
  return {
    distanceKm: Math.round(route.distance / 100) / 10,
    durationMinutes: Math.round(route.duration / 60),
    polyline: route.geometry,
  };
}

export const getDestinationRoute = createServerFn({ method: 'GET' })
  .inputValidator(z.object({
    destinationId: z.string().min(1),
    destLat: z.number(),
    destLng: z.number(),
  }))
  .handler(async ({ data: { destinationId, destLat, destLng } }) => {
    const [cached] = await db.select().from(destinationRouteCache)
      .where(eq(destinationRouteCache.destinationId, destinationId));

    if (cached) return cached;

    try {
      const route = await fetchOSRMRoute(VICENZA_LAT, VICENZA_LNG, destLat, destLng);
      const [saved] = await db.insert(destinationRouteCache).values({
        destinationId,
        originLat: VICENZA_LAT,
        originLng: VICENZA_LNG,
        destLat,
        destLng,
        ...route,
      }).returning();
      return saved;
    } catch (err) {
      console.error('Failed to fetch OSRM route:', err);
      return null;
    }
  });
