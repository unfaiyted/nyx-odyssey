import { createServerFn } from '@tanstack/react-start';
import { db } from '../../db';
import {
  tripDestinations, destinationResearch, destinationHighlights,
  destinationWeatherMonthly, tripRoutes,
} from '../../db/schema';
import { eq, and, inArray, asc } from 'drizzle-orm';

export interface ComparisonDestination {
  destination: typeof tripDestinations.$inferSelect;
  research: typeof destinationResearch.$inferSelect | null;
  highlights: (typeof destinationHighlights.$inferSelect)[];
  weather: (typeof destinationWeatherMonthly.$inferSelect)[];
  routeFromBase: {
    distanceKm: number | null;
    durationMinutes: number | null;
  } | null;
}

export const getDestinationsForComparison = createServerFn({ method: 'GET' })
  .handler(async ({ data }: { data: { tripId: string; destinationIds: string[] } }) => {
    const { tripId, destinationIds } = data;
    if (!destinationIds.length) return [];

    const dests = await db.select().from(tripDestinations)
      .where(and(
        eq(tripDestinations.tripId, tripId),
        inArray(tripDestinations.id, destinationIds),
      ));

    const results: ComparisonDestination[] = [];

    const allDests = await db.select().from(tripDestinations)
      .where(eq(tripDestinations.tripId, tripId))
      .orderBy(asc(tripDestinations.orderIndex));
    const baseDestId = allDests[0]?.id;

    for (const dest of dests) {
      const [research] = await db.select().from(destinationResearch)
        .where(eq(destinationResearch.destinationId, dest.id));

      const highlights = await db.select().from(destinationHighlights)
        .where(eq(destinationHighlights.destinationId, dest.id))
        .orderBy(asc(destinationHighlights.orderIndex));

      const weather = await db.select().from(destinationWeatherMonthly)
        .where(eq(destinationWeatherMonthly.destinationId, dest.id))
        .orderBy(asc(destinationWeatherMonthly.month));

      let routeFromBase = null;
      if (baseDestId && baseDestId !== dest.id) {
        const [route] = await db.select().from(tripRoutes)
          .where(and(
            eq(tripRoutes.tripId, tripId),
            eq(tripRoutes.fromDestinationId, baseDestId),
            eq(tripRoutes.toDestinationId, dest.id),
          ));
        if (route) {
          routeFromBase = {
            distanceKm: route.distanceKm,
            durationMinutes: route.durationMinutes,
          };
        }
      }

      results.push({
        destination: dest,
        research: research || null,
        highlights,
        weather,
        routeFromBase,
      });
    }

    return results;
  });
