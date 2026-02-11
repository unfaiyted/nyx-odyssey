import { createServerFn } from '@tanstack/react-start';
import { db } from '../../db';
import {
  trips, itineraryItems, tripDestinations, accommodations,
  budgetItems, packingItems, flights, rentalCars,
} from '../../db/schema';
import { sql, asc, inArray } from 'drizzle-orm';

export const getTripOverview = createServerFn({ method: 'GET' }).handler(async () => {
  const allTrips = await db.select().from(trips)
    .where(sql`${trips.status} != 'cancelled'`)
    .orderBy(asc(trips.startDate));

  if (allTrips.length === 0) return { trips: [] };

  const tripIds = allTrips.map(t => t.id);

  const [allDestinations, allAccommodations, allBudgetItems, allPackingItems, allFlights, allItinerary, allRentalCars] = await Promise.all([
    db.select().from(tripDestinations).where(inArray(tripDestinations.tripId, tripIds)),
    db.select().from(accommodations).where(inArray(accommodations.tripId, tripIds)),
    db.select().from(budgetItems).where(inArray(budgetItems.tripId, tripIds)),
    db.select().from(packingItems).where(inArray(packingItems.tripId, tripIds)),
    db.select().from(flights).where(inArray(flights.tripId, tripIds)),
    db.select().from(itineraryItems).where(inArray(itineraryItems.tripId, tripIds)),
    db.select().from(rentalCars).where(inArray(rentalCars.tripId, tripIds)),
  ]);

  const byTrip = <T extends { tripId: string }>(items: T[]) => {
    const map: Record<string, T[]> = {};
    for (const item of items) { (map[item.tripId] ??= []).push(item); }
    return map;
  };

  const destByTrip = byTrip(allDestinations);
  const accomByTrip = byTrip(allAccommodations);
  const budgetByTrip = byTrip(allBudgetItems);
  const packByTrip = byTrip(allPackingItems);
  const flightByTrip = byTrip(allFlights);
  const itinByTrip = byTrip(allItinerary);
  const rentalByTrip = byTrip(allRentalCars);

  const today = new Date().toISOString().split('T')[0];

  const tripOverviews = allTrips.map(trip => {
    const dests = destByTrip[trip.id] || [];
    const accoms = accomByTrip[trip.id] || [];
    const budget = budgetByTrip[trip.id] || [];
    const packing = packByTrip[trip.id] || [];
    const flts = flightByTrip[trip.id] || [];
    const itin = itinByTrip[trip.id] || [];
    const rentals = rentalByTrip[trip.id] || [];

    const totalEstimated = budget.reduce((s, b) => s + parseFloat(b.estimatedCost || '0'), 0);
    const totalActual = budget.reduce((s, b) => s + parseFloat(b.actualCost || '0'), 0);
    const totalBudget = parseFloat(trip.totalBudget || '0') || totalEstimated;

    const nextDest = dests
      .filter(d => d.arrivalDate && d.arrivalDate >= today)
      .sort((a, b) => (a.arrivalDate || '').localeCompare(b.arrivalDate || ''))[0] || null;

    const nextFlight = flts
      .filter(f => f.departureDate >= today && f.status === 'confirmed')
      .sort((a, b) => a.departureDate.localeCompare(b.departureDate))[0] || null;

    return {
      ...trip,
      progress: {
        destinations: { total: dests.length, booked: dests.filter(d => d.status === 'booked' || d.status === 'visited').length },
        accommodations: { total: accoms.length, booked: accoms.filter(a => a.booked).length },
        budget: { total: totalBudget, estimated: totalEstimated, spent: totalActual },
        packing: { total: packing.length, packed: packing.filter(p => p.packed).length },
        itinerary: { total: itin.length, completed: itin.filter(i => i.completed).length },
        flights: { total: flts.length, confirmed: flts.filter(f => f.status === 'confirmed').length },
        rentalCars: rentals.length,
      },
      nextDestination: nextDest ? { name: nextDest.name, date: nextDest.arrivalDate } : null,
      nextFlight: nextFlight ? {
        airline: nextFlight.airline, flightNumber: nextFlight.flightNumber,
        departure: nextFlight.departureCity || nextFlight.departureAirport,
        arrival: nextFlight.arrivalCity || nextFlight.arrivalAirport,
        date: nextFlight.departureDate, time: nextFlight.departureTime,
      } : null,
    };
  });

  return { trips: tripOverviews };
});
