import { json, createAPIFileRoute } from '@tanstack/react-start/api';
import { db } from '../../db';
import {
  trips, itineraryItems, tripDestinations, accommodations,
  budgetItems, packingItems, flights, rentalCars,
} from '../../db/schema';
import { sql, asc, inArray } from 'drizzle-orm';

export const APIRoute = createAPIFileRoute('/api/trip-overview')({
  GET: async () => {
    // Get all non-cancelled trips
    const allTrips = await db.select().from(trips)
      .where(sql`${trips.status} != 'cancelled'`)
      .orderBy(asc(trips.startDate));

    if (allTrips.length === 0) {
      return json({ trips: [] });
    }

    const tripIds = allTrips.map(t => t.id);

    // Batch fetch all related data
    const [allDestinations, allAccommodations, allBudgetItems, allPackingItems, allFlights, allItinerary, allRentalCars] = await Promise.all([
      db.select().from(tripDestinations).where(inArray(tripDestinations.tripId, tripIds)),
      db.select().from(accommodations).where(inArray(accommodations.tripId, tripIds)),
      db.select().from(budgetItems).where(inArray(budgetItems.tripId, tripIds)),
      db.select().from(packingItems).where(inArray(packingItems.tripId, tripIds)),
      db.select().from(flights).where(inArray(flights.tripId, tripIds)),
      db.select().from(itineraryItems).where(inArray(itineraryItems.tripId, tripIds)),
      db.select().from(rentalCars).where(inArray(rentalCars.tripId, tripIds)),
    ]);

    // Group by trip
    const byTrip = <T extends { tripId: string }>(items: T[]) => {
      const map: Record<string, T[]> = {};
      for (const item of items) {
        (map[item.tripId] ??= []).push(item);
      }
      return map;
    };

    const destByTrip = byTrip(allDestinations);
    const accomByTrip = byTrip(allAccommodations);
    const budgetByTrip = byTrip(allBudgetItems);
    const packByTrip = byTrip(allPackingItems);
    const flightByTrip = byTrip(allFlights);
    const itinByTrip = byTrip(allItinerary);
    const rentalByTrip = byTrip(allRentalCars);

    const tripOverviews = allTrips.map(trip => {
      const dests = destByTrip[trip.id] || [];
      const accoms = accomByTrip[trip.id] || [];
      const budget = budgetByTrip[trip.id] || [];
      const packing = packByTrip[trip.id] || [];
      const flts = flightByTrip[trip.id] || [];
      const itin = itinByTrip[trip.id] || [];
      const rentals = rentalByTrip[trip.id] || [];

      // Budget progress
      const totalEstimated = budget.reduce((s, b) => s + parseFloat(b.estimatedCost || '0'), 0);
      const totalActual = budget.reduce((s, b) => s + parseFloat(b.actualCost || '0'), 0);
      const totalBudget = parseFloat(trip.totalBudget || '0') || totalEstimated;

      // Packing progress
      const totalPacking = packing.length;
      const packedCount = packing.filter(p => p.packed).length;

      // Itinerary progress
      const totalItinerary = itin.length;
      const completedItinerary = itin.filter(i => i.completed).length;

      // Destinations
      const totalDestinations = dests.length;
      const bookedDestinations = dests.filter(d => d.status === 'booked' || d.status === 'visited').length;

      // Accommodations
      const totalAccommodations = accoms.length;
      const bookedAccommodations = accoms.filter(a => a.booked).length;

      // Flights
      const totalFlights = flts.length;
      const confirmedFlights = flts.filter(f => f.status === 'confirmed').length;

      // Next upcoming destination
      const today = new Date().toISOString().split('T')[0];
      const nextDest = dests
        .filter(d => d.arrivalDate && d.arrivalDate >= today)
        .sort((a, b) => (a.arrivalDate || '').localeCompare(b.arrivalDate || ''))[0] || null;

      // Next flight
      const nextFlight = flts
        .filter(f => f.departureDate >= today && f.status === 'confirmed')
        .sort((a, b) => a.departureDate.localeCompare(b.departureDate))[0] || null;

      return {
        ...trip,
        progress: {
          destinations: { total: totalDestinations, booked: bookedDestinations },
          accommodations: { total: totalAccommodations, booked: bookedAccommodations },
          budget: { total: totalBudget, estimated: totalEstimated, spent: totalActual },
          packing: { total: totalPacking, packed: packedCount },
          itinerary: { total: totalItinerary, completed: completedItinerary },
          flights: { total: totalFlights, confirmed: confirmedFlights },
          rentalCars: rentals.length,
        },
        nextDestination: nextDest ? { name: nextDest.name, date: nextDest.arrivalDate } : null,
        nextFlight: nextFlight ? {
          airline: nextFlight.airline,
          flightNumber: nextFlight.flightNumber,
          departure: nextFlight.departureCity || nextFlight.departureAirport,
          arrival: nextFlight.arrivalCity || nextFlight.arrivalAirport,
          date: nextFlight.departureDate,
          time: nextFlight.departureTime,
        } : null,
      };
    });

    return json({ trips: tripOverviews });
  },
});
