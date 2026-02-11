import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

// Home base: Vicenza, Contrà S. Rocco #60
export const HOME_BASE = { lat: 45.5455, lng: 11.5354, name: 'Vicenza (Home)' };

export interface TravelEstimate {
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

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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

    const car = await getOSRMRoute(data.fromLat, data.fromLng, data.toLat, data.toLng, 'car');
    if (car) {
      estimates.push({ mode: 'car', ...car, label: `🚗 Drive · ${car.durationMinutes} min · ${car.distanceKm} km` });
    }

    const straightLine = haversineKm(data.fromLat, data.fromLng, data.toLat, data.toLng);
    if (straightLine < 5) {
      const walk = await getOSRMRoute(data.fromLat, data.fromLng, data.toLat, data.toLng, 'foot');
      if (walk) {
        estimates.push({ mode: 'walk', ...walk, label: `🚶 Walk · ${walk.durationMinutes} min · ${walk.distanceKm} km` });
      }
    }

    if (car && car.distanceKm > 20) {
      const trainMin = Math.round(car.durationMinutes * 0.7 + 15);
      estimates.push({ mode: 'train', durationMinutes: trainMin, distanceKm: car.distanceKm, label: `🚆 Train · ~${trainMin} min · ${car.distanceKm} km` });
    }

    if (car && car.distanceKm > 5) {
      const busMin = Math.round(car.durationMinutes * 1.3 + 10);
      estimates.push({ mode: 'bus', durationMinutes: busMin, distanceKm: car.distanceKm, label: `🚌 Bus · ~${busMin} min · ${car.distanceKm} km` });
    }

    return estimates;
  });
