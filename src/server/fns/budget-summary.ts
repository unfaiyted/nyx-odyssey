import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../../db';
import {
  accommodations, budgetItems, destinationEvents, itineraryItems,
  tripDestinations, flightOptions, flightSearches,
} from '../../db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import type { BudgetSummary, BudgetSummaryItem } from '../../types/trips';

export const getBudgetSummary = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ tripId: z.string().min(1) }))
  .handler(async ({ data: { tripId } }): Promise<BudgetSummary> => {
    // Fetch all data in parallel
    const [accomRows, destRows, manualItems, searchRows, itinRows] = await Promise.all([
      db.select().from(accommodations).where(eq(accommodations.tripId, tripId)),
      db.select().from(tripDestinations).where(eq(tripDestinations.tripId, tripId)),
      db.select().from(budgetItems).where(eq(budgetItems.tripId, tripId)),
      db.select().from(flightSearches).where(eq(flightSearches.tripId, tripId)),
      db.select().from(itineraryItems).where(eq(itineraryItems.tripId, tripId)),
    ]);

    const destIds = destRows.map(d => d.id);
    const searchIds = searchRows.map(s => s.id);

    const [eventRows, flightOptionRows] = await Promise.all([
      destIds.length > 0
        ? db.select().from(destinationEvents).where(inArray(destinationEvents.destinationId, destIds))
        : Promise.resolve([]),
      searchIds.length > 0
        ? db.select().from(flightOptions).where(
            and(eq(flightOptions.tripId, tripId), inArray(flightOptions.status, ['shortlisted', 'booked']))
          )
        : Promise.resolve([]),
    ]);

    // ── Determine what's on the itinerary ──
    // Unique accommodation IDs on itinerary
    const itinAccomIds = new Set(itinRows.filter(i => i.accommodationId).map(i => i.accommodationId!));
    // Unique event IDs on itinerary (dedup multi-day events)
    const itinEventIds = new Set(itinRows.filter(i => i.eventId).map(i => i.eventId!));
    // Count nights per accommodation on itinerary
    const accomNightCounts: Record<string, number> = {};
    for (const item of itinRows) {
      if (item.accommodationId) {
        accomNightCounts[item.accommodationId] = (accomNightCounts[item.accommodationId] || 0) + 1;
      }
    }

    // ── Accommodations ──
    // Priority: on itinerary > booked > shortlisted
    // Dedup: if on itinerary, use itinerary night count × cost_per_night (more accurate than total_cost)
    const seenAccomIds = new Set<string>();
    const accomItems: BudgetSummaryItem[] = [];

    // First: accommodations on the itinerary
    for (const a of accomRows) {
      if (itinAccomIds.has(a.id)) {
        seenAccomIds.add(a.id);
        const nights = accomNightCounts[a.id] || 0;
        const perNight = Number(a.costPerNight || 0);
        const estimated = perNight > 0 && nights > 0 ? perNight * nights : Number(a.totalCost || 0);
        accomItems.push({
          id: a.id,
          name: a.name,
          source: 'accommodation',
          status: a.status || 'researched',
          estimatedCost: estimated,
          actualCost: a.status === 'booked' ? estimated : 0,
          category: 'accommodations',
          currency: a.currency || 'USD',
          sourceId: a.id,
          detail: nights > 0 ? `${nights} nights × ${perNight > 0 ? `$${perNight}/night` : 'TBD'}` : undefined,
          onItinerary: true,
        });
      }
    }

    // Then: booked/shortlisted NOT already on itinerary
    for (const a of accomRows) {
      if (!seenAccomIds.has(a.id) && ['booked', 'shortlisted'].includes(a.status || '')) {
        accomItems.push({
          id: a.id,
          name: a.name,
          source: 'accommodation',
          status: a.status || 'researched',
          estimatedCost: Number(a.totalCost || 0),
          actualCost: a.status === 'booked' ? Number(a.totalCost || 0) : 0,
          category: 'accommodations',
          currency: a.currency || 'USD',
          sourceId: a.id,
          onItinerary: false,
        });
      }
    }

    // ── Events ──
    // Priority: on itinerary > booked > interested
    // Multi-day events: count once (total_cost covers all days)
    const seenEventIds = new Set<string>();
    const eventItems: BudgetSummaryItem[] = [];

    // First: events on the itinerary (deduped)
    for (const e of eventRows) {
      if (itinEventIds.has(e.id)) {
        seenEventIds.add(e.id);
        const itinDays = itinRows.filter(i => i.eventId === e.id).length;
        eventItems.push({
          id: e.id,
          name: e.name,
          source: 'event',
          status: e.status || 'researched',
          estimatedCost: Number(e.totalCost || 0),
          actualCost: e.status === 'booked' ? Number(e.totalCost || 0) : 0,
          category: 'activities',
          currency: e.currency || 'USD',
          sourceId: e.id,
          detail: itinDays > 1 ? `${itinDays}-day event (total, not per day)` : undefined,
          onItinerary: true,
        });
      }
    }

    // Then: booked/interested NOT already on itinerary
    for (const e of eventRows) {
      if (!seenEventIds.has(e.id) && ['booked', 'interested'].includes(e.status || '') && Number(e.totalCost || 0) > 0) {
        eventItems.push({
          id: e.id,
          name: e.name,
          source: 'event',
          status: e.status || 'researched',
          estimatedCost: Number(e.totalCost || 0),
          actualCost: e.status === 'booked' ? Number(e.totalCost || 0) : 0,
          category: 'activities',
          currency: e.currency || 'USD',
          sourceId: e.id,
          onItinerary: false,
        });
      }
    }

    // ── Flights ──
    const flightItems: BudgetSummaryItem[] = flightOptionRows.map(f => ({
      id: f.id,
      name: `${f.airline} ${f.departureAirport}→${f.arrivalAirport}`,
      source: 'flight' as const,
      status: f.status || 'found',
      estimatedCost: Number(f.totalPrice || 0),
      actualCost: f.status === 'booked' ? Number(f.totalPrice || 0) : 0,
      category: 'flights',
      currency: f.currency || 'USD',
      sourceId: f.id,
      onItinerary: false,
    }));

    // ── Totals ──
    const accomTotal = accomItems.reduce((s, i) => s + i.estimatedCost, 0);
    const eventTotal = eventItems.reduce((s, i) => s + i.estimatedCost, 0);
    const flightTotal = flightItems.reduce((s, i) => s + i.estimatedCost, 0);
    const manualTotal = manualItems.reduce((s, i) => s + Number(i.estimatedCost || i.actualCost || 0), 0);

    // Category breakdown from ALL sources
    const byCategory: Record<string, number> = {};
    const addToCategory = (cat: string, amount: number) => {
      byCategory[cat] = (byCategory[cat] || 0) + amount;
    };

    accomItems.forEach(i => addToCategory('accommodations', i.estimatedCost));
    eventItems.forEach(i => addToCategory('activities', i.estimatedCost));
    flightItems.forEach(i => addToCategory('flights', i.estimatedCost));
    manualItems.forEach(i => addToCategory(i.category, Number(i.estimatedCost || i.actualCost || 0)));

    const allComputedEstimated = accomTotal + eventTotal + flightTotal;
    const allComputedActual = [...accomItems, ...eventItems, ...flightItems].reduce((s, i) => s + i.actualCost, 0);
    const manualActual = manualItems.reduce((s, i) => s + Number(i.actualCost || 0), 0);
    const manualEstimated = manualItems.reduce((s, i) => s + Number(i.estimatedCost || 0), 0);

    return {
      computed: {
        accommodations: { items: accomItems, total: accomTotal },
        events: { items: eventItems, total: eventTotal },
        flights: { items: flightItems, total: flightTotal },
      },
      manual: { items: manualItems, total: manualTotal },
      byCategory,
      grandTotal: {
        estimated: allComputedEstimated + manualEstimated,
        actual: allComputedActual + manualActual,
      },
    };
  });
