import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { priceAlerts, flightSearches, flightOptions, flightPriceHistory } from '../db/schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';

// ── Price Alerts CRUD ────────────────────────────────

export const getPriceAlerts = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ tripId: z.string().min(1) }))
  .handler(async ({ data: { tripId } }) => {
    return db.query.priceAlerts.findMany({
      where: eq(priceAlerts.tripId, tripId),
      with: { search: true },
      orderBy: [desc(priceAlerts.createdAt)],
    });
  });

export const createPriceAlert = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    tripId: z.string().min(1),
    searchId: z.string().optional(),
    origin: z.string().min(1),
    destination: z.string().min(1),
    departureDate: z.string().min(1),
    returnDate: z.string().optional(),
    targetPrice: z.string().min(1),
    currency: z.string().default('USD'),
    notes: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const [item] = await db.insert(priceAlerts).values(data).returning();
    return item;
  });

export const updatePriceAlert = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    id: z.string().min(1),
    tripId: z.string().min(1),
    targetPrice: z.string().optional(),
    active: z.boolean().optional(),
    currentLowestPrice: z.string().optional(),
    notes: z.string().optional(),
  }))
  .handler(async ({ data: { id, tripId, ...values } }) => {
    const [updated] = await db.update(priceAlerts)
      .set(values)
      .where(and(eq(priceAlerts.id, id), eq(priceAlerts.tripId, tripId)))
      .returning();
    if (!updated) throw new Error('Price alert not found');
    return updated;
  });

export const deletePriceAlert = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1), tripId: z.string().min(1) }))
  .handler(async ({ data: { id, tripId } }) => {
    await db.delete(priceAlerts).where(and(eq(priceAlerts.id, id), eq(priceAlerts.tripId, tripId)));
    return { ok: true };
  });

// ── Price Tracking Dashboard Data ────────────────────

export const getFlightPriceTracking = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ tripId: z.string().min(1) }))
  .handler(async ({ data: { tripId } }) => {
    // Get all searches with options and price history
    const searches = await db.query.flightSearches.findMany({
      where: eq(flightSearches.tripId, tripId),
      with: {
        options: {
          with: { priceHistory: { orderBy: [asc(flightPriceHistory.checkedAt)] } },
        },
      },
      orderBy: [desc(flightSearches.createdAt)],
    });

    // Get all active alerts
    const alerts = await db.query.priceAlerts.findMany({
      where: and(eq(priceAlerts.tripId, tripId), eq(priceAlerts.active, true)),
    });

    // Build route summaries
    const routes = searches.map(search => {
      const options = search.options;
      const prices = options.filter(o => o.totalPrice).map(o => parseFloat(o.totalPrice!));
      const currentBest = prices.length > 0 ? Math.min(...prices) : null;

      // Get all price history across options for this route
      const allHistory = options.flatMap(o =>
        o.priceHistory.map(ph => ({
          price: parseFloat(ph.price),
          date: ph.checkedAt,
          source: ph.source,
          airline: o.airline,
          optionId: o.id,
        }))
      );

      // Sort by date
      allHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Price change: compare current best to previous best (from history or first option price)
      let previousPrice: number | null = null;
      if (allHistory.length > 1) {
        // Get the second-to-last unique date's best price
        const dates = [...new Set(allHistory.map(h => new Date(h.date).toDateString()))];
        if (dates.length >= 2) {
          const prevDate = dates[dates.length - 2];
          const prevPrices = allHistory.filter(h => new Date(h.date).toDateString() === prevDate);
          previousPrice = Math.min(...prevPrices.map(h => h.price));
        }
      }

      const matchingAlerts = alerts.filter(a =>
        a.origin === search.origin && a.destination === search.destination
      );

      return {
        searchId: search.id,
        origin: search.origin,
        destination: search.destination,
        originCity: search.originCity,
        destinationCity: search.destinationCity,
        departureDate: search.departureDate,
        returnDate: search.returnDate,
        passengers: search.passengers,
        cabinClass: search.cabinClass,
        currentBestPrice: currentBest,
        previousBestPrice: previousPrice,
        priceChange: currentBest && previousPrice ? currentBest - previousPrice : null,
        priceChangePercent: currentBest && previousPrice ? ((currentBest - previousPrice) / previousPrice) * 100 : null,
        optionCount: options.length,
        priceHistory: allHistory,
        alerts: matchingAlerts,
        lowestEver: allHistory.length > 0 ? Math.min(...allHistory.map(h => h.price)) : currentBest,
        highestEver: allHistory.length > 0 ? Math.max(...allHistory.map(h => h.price)) : currentBest,
      };
    });

    return { routes, alerts };
  });
