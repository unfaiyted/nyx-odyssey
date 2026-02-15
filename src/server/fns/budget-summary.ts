import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../../db';
import {
  accommodations, budgetItems, destinationEvents,
  tripDestinations, flightOptions, flightSearches,
} from '../../db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import type { BudgetSummary, BudgetSummaryItem } from '../../types/trips';

export const getBudgetSummary = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ tripId: z.string().min(1) }))
  .handler(async ({ data: { tripId } }): Promise<BudgetSummary> => {
    // Fetch all data in parallel
    const [accomRows, destRows, manualItems, searchRows] = await Promise.all([
      db.select().from(accommodations).where(eq(accommodations.tripId, tripId)),
      db.select().from(tripDestinations).where(eq(tripDestinations.tripId, tripId)),
      db.select().from(budgetItems).where(eq(budgetItems.tripId, tripId)),
      db.select().from(flightSearches).where(eq(flightSearches.tripId, tripId)),
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

    // Build accommodation items (booked/shortlisted/interested only)
    const accomItems: BudgetSummaryItem[] = accomRows
      .filter(a => ['booked', 'shortlisted'].includes(a.status || ''))
      .map(a => ({
        id: a.id,
        name: a.name,
        source: 'accommodation' as const,
        status: a.status || 'researched',
        estimatedCost: Number(a.totalCost || 0),
        actualCost: a.status === 'booked' ? Number(a.totalCost || 0) : 0,
        category: 'accommodations',
        currency: a.currency || 'USD',
        sourceId: a.id,
      }));

    // Build event items (booked/interested)
    const eventItems: BudgetSummaryItem[] = eventRows
      .filter(e => ['booked', 'interested'].includes(e.status || ''))
      .map(e => ({
        id: e.id,
        name: e.name,
        source: 'event' as const,
        status: e.status || 'researched',
        estimatedCost: Number(e.totalCost || 0),
        actualCost: e.status === 'booked' ? Number(e.totalCost || 0) : 0,
        category: e.eventType === 'sports' ? 'activities' : 'activities',
        currency: e.currency || 'USD',
        sourceId: e.id,
      }));

    // Build flight items
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
    }));

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

    // Grand totals
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
