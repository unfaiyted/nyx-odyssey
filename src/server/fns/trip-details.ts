import { createServerFn } from '@tanstack/react-start';
import { db } from '../../db';
import {
  itineraryItems, tripDestinations, accommodations, budgetItems,
  budgetCategories, packingItems, flights, rentalCars, tripRoutes, tripCronJobs,
  tripTravelers, travelerLoyaltyPrograms, travelerEmergencyContacts,
  destinationEvents,
} from '../../db/schema';
import { eq, and } from 'drizzle-orm';

// ── Itinerary ──────────────────────────────────────────

export const getItinerary = createServerFn({ method: 'GET' })
  .handler(async ({ data }) => {
    return await db.select().from(itineraryItems)
      .where(eq(itineraryItems.tripId, data.tripId))
      .orderBy(itineraryItems.orderIndex);
  });

export const addItineraryItem = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { tripId, ...rest } = data;
    const [item] = await db.insert(itineraryItems).values({ tripId, ...rest }).returning();
    return item;
  });

export const updateItineraryItem = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { tripId, id, ...rest } = data;
    const [updated] = await db.update(itineraryItems).set(rest)
      .where(and(eq(itineraryItems.id, id), eq(itineraryItems.tripId, tripId)))
      .returning();
    return updated;
  });

export const deleteItineraryItem = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    await db.delete(itineraryItems)
      .where(and(eq(itineraryItems.id, data.id), eq(itineraryItems.tripId, data.tripId)));
    return { ok: true };
  });

export const reorderItinerary = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    await Promise.all(
      data.items.map(({ id, orderIndex }) =>
        db.update(itineraryItems).set({ orderIndex })
          .where(and(eq(itineraryItems.id, id), eq(itineraryItems.tripId, data.tripId)))
      )
    );
    return { ok: true };
  });

// ── Trip Destinations ──────────────────────────────────

export const getTripDestinations = createServerFn({ method: 'GET' })
  .handler(async ({ data }) => {
    return await db.select().from(tripDestinations)
      .where(eq(tripDestinations.tripId, data.tripId))
      .orderBy(tripDestinations.orderIndex);
  });

export const addTripDestination = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { tripId, ...rest } = data;
    const [item] = await db.insert(tripDestinations).values({ tripId, ...rest }).returning();
    return item;
  });

export const updateTripDestination = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { tripId, id, ...rest } = data;
    const [updated] = await db.update(tripDestinations).set(rest)
      .where(and(eq(tripDestinations.id, id), eq(tripDestinations.tripId, tripId)))
      .returning();
    return updated;
  });

export const deleteTripDestination = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    await db.delete(tripDestinations)
      .where(and(eq(tripDestinations.id, data.id), eq(tripDestinations.tripId, data.tripId)));
    return { ok: true };
  });

// ── Accommodations ─────────────────────────────────────

export const getAccommodations = createServerFn({ method: 'GET' })
  .handler(async ({ data }) => {
    return await db.select().from(accommodations)
      .where(eq(accommodations.tripId, data.tripId));
  });

export const addAccommodation = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { tripId, ...rest } = data;
    const [item] = await db.insert(accommodations).values({ tripId, ...rest }).returning();
    return item;
  });

export const updateAccommodation = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { tripId, id, ...rest } = data;
    const [updated] = await db.update(accommodations).set(rest)
      .where(and(eq(accommodations.id, id), eq(accommodations.tripId, tripId)))
      .returning();
    return updated;
  });

export const deleteAccommodation = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    await db.delete(accommodations)
      .where(and(eq(accommodations.id, data.id), eq(accommodations.tripId, data.tripId)));
    return { ok: true };
  });

// ── Budget ─────────────────────────────────────────────

export const getBudgetItems = createServerFn({ method: 'GET' })
  .handler(async ({ data }) => {
    return await db.select().from(budgetItems)
      .where(eq(budgetItems.tripId, data.tripId));
  });

export const addBudgetItem = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { tripId, ...rest } = data;
    const [item] = await db.insert(budgetItems).values({ tripId, ...rest }).returning();
    return item;
  });

export const updateBudgetItem = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { tripId, id, ...rest } = data;
    const [updated] = await db.update(budgetItems).set(rest)
      .where(and(eq(budgetItems.id, id), eq(budgetItems.tripId, tripId)))
      .returning();
    return updated;
  });

export const deleteBudgetItem = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    await db.delete(budgetItems)
      .where(and(eq(budgetItems.id, data.id), eq(budgetItems.tripId, data.tripId)));
    return { ok: true };
  });

// ── Budget Categories ──────────────────────────────────

export const getBudgetCategories = createServerFn({ method: 'GET' })
  .handler(async ({ data }) => {
    return await db.select().from(budgetCategories)
      .where(eq(budgetCategories.tripId, data.tripId));
  });

export const addBudgetCategory = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { tripId, ...rest } = data;
    const [item] = await db.insert(budgetCategories).values({ tripId, ...rest }).returning();
    return item;
  });

export const updateBudgetCategory = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { tripId, id, ...rest } = data;
    const [updated] = await db.update(budgetCategories).set(rest)
      .where(and(eq(budgetCategories.id, id), eq(budgetCategories.tripId, tripId)))
      .returning();
    return updated;
  });

export const deleteBudgetCategory = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    await db.delete(budgetCategories)
      .where(and(eq(budgetCategories.id, data.id), eq(budgetCategories.tripId, data.tripId)));
    return { ok: true };
  });

// ── Packing ────────────────────────────────────────────

export const getPackingItems = createServerFn({ method: 'GET' })
  .handler(async ({ data }) => {
    return await db.select().from(packingItems)
      .where(eq(packingItems.tripId, data.tripId));
  });

export const addPackingItem = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { tripId, ...rest } = data;
    const [item] = await db.insert(packingItems).values({ tripId, ...rest }).returning();
    return item;
  });

export const updatePackingItem = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { tripId, id, ...rest } = data;
    const [updated] = await db.update(packingItems).set(rest)
      .where(and(eq(packingItems.id, id), eq(packingItems.tripId, tripId)))
      .returning();
    return updated;
  });

export const deletePackingItem = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    await db.delete(packingItems)
      .where(and(eq(packingItems.id, data.id), eq(packingItems.tripId, data.tripId)));
    return { ok: true };
  });

// ── Flights ────────────────────────────────────────────

export const getFlights = createServerFn({ method: 'GET' })
  .handler(async ({ data }) => {
    return await db.select().from(flights)
      .where(eq(flights.tripId, data.tripId))
      .orderBy(flights.orderIndex);
  });

export const addFlight = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { tripId, ...rest } = data;
    const [item] = await db.insert(flights).values({ tripId, ...rest }).returning();
    return item;
  });

export const updateFlight = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { tripId, id, ...rest } = data;
    const [updated] = await db.update(flights).set(rest)
      .where(and(eq(flights.id, id), eq(flights.tripId, tripId)))
      .returning();
    return updated;
  });

export const deleteFlight = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    await db.delete(flights)
      .where(and(eq(flights.id, data.id), eq(flights.tripId, data.tripId)));
    return { ok: true };
  });

// ── Rental Cars ────────────────────────────────────────

export const getRentalCars = createServerFn({ method: 'GET' })
  .handler(async ({ data }) => {
    return await db.select().from(rentalCars)
      .where(eq(rentalCars.tripId, data.tripId))
      .orderBy(rentalCars.createdAt);
  });

export const addRentalCar = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { tripId, ...rest } = data;
    const [item] = await db.insert(rentalCars).values({ tripId, ...rest }).returning();
    return item;
  });

export const updateRentalCar = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { tripId, id, ...rest } = data;
    const [updated] = await db.update(rentalCars).set(rest)
      .where(and(eq(rentalCars.id, id), eq(rentalCars.tripId, tripId)))
      .returning();
    return updated;
  });

export const deleteRentalCar = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    await db.delete(rentalCars)
      .where(and(eq(rentalCars.id, data.id), eq(rentalCars.tripId, data.tripId)));
    return { ok: true };
  });

// ── Trip Routes ────────────────────────────────────────

export const getTripRoutes = createServerFn({ method: 'GET' })
  .handler(async ({ data }) => {
    const { tripId } = data;
    const routeRows = await db.select().from(tripRoutes).where(eq(tripRoutes.tripId, tripId));
    const dests = await db.select().from(tripDestinations).where(eq(tripDestinations.tripId, tripId));
    const destMap = new Map(dests.map(d => [d.id, d]));

    const enriched = routeRows.map(r => ({
      ...r,
      fromDestination: destMap.get(r.fromDestinationId) || null,
      toDestination: destMap.get(r.toDestinationId) || null,
    }));

    return { routes: enriched };
  });

export const addTripRoute = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { tripId, ...rest } = data;
    const [route] = await db.insert(tripRoutes).values({ tripId, ...rest }).returning();
    return route;
  });

// ── Cron Jobs ──────────────────────────────────────────

export const toggleCronJob = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { tripId, id, enabled } = data;
    const [updated] = await db.update(tripCronJobs)
      .set({ enabled })
      .where(and(eq(tripCronJobs.id, id), eq(tripCronJobs.tripId, tripId)))
      .returning();
    return updated;
  });

export const updateCronJob = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { tripId, id, ...rest } = data;
    const [updated] = await db.update(tripCronJobs)
      .set(rest)
      .where(and(eq(tripCronJobs.id, id), eq(tripCronJobs.tripId, tripId)))
      .returning();
    return updated;
  });

export const deleteCronJob = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    await db.delete(tripCronJobs)
      .where(and(eq(tripCronJobs.id, data.id), eq(tripCronJobs.tripId, data.tripId)));
    return { ok: true };
  });

export const addCronJob = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { tripId, ...rest } = data;
    const [job] = await db.insert(tripCronJobs).values({ tripId, ...rest }).returning();
    return job;
  });

// ── Travelers ──────────────────────────────────────────

export const getTravelers = createServerFn({ method: 'GET' })
  .handler(async ({ data }) => {
    const travelers = await db.select().from(tripTravelers)
      .where(eq(tripTravelers.tripId, data.tripId))
      .orderBy(tripTravelers.orderIndex);
    
    // Fetch loyalty programs and emergency contacts for each traveler
    const travelerIds = travelers.map(t => t.id);
    if (travelerIds.length === 0) return [];

    const [loyalty, emergency] = await Promise.all([
      db.select().from(travelerLoyaltyPrograms),
      db.select().from(travelerEmergencyContacts),
    ]);

    return travelers.map(t => ({
      ...t,
      loyaltyPrograms: loyalty.filter(l => l.travelerId === t.id),
      emergencyContacts: emergency.filter(e => e.travelerId === t.id),
    }));
  });

export const addTraveler = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { tripId, ...rest } = data;
    const [traveler] = await db.insert(tripTravelers).values({ tripId, ...rest }).returning();
    return traveler;
  });

export const updateTraveler = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { tripId, id, ...rest } = data;
    const [updated] = await db.update(tripTravelers).set({ ...rest, updatedAt: new Date() })
      .where(and(eq(tripTravelers.id, id), eq(tripTravelers.tripId, tripId)))
      .returning();
    return updated;
  });

export const deleteTraveler = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    await db.delete(tripTravelers)
      .where(and(eq(tripTravelers.id, data.id), eq(tripTravelers.tripId, data.tripId)));
    return { ok: true };
  });

// ── Loyalty Programs ───────────────────────────────────

export const addLoyaltyProgram = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { travelerId, ...rest } = data;
    const [item] = await db.insert(travelerLoyaltyPrograms).values({ travelerId, ...rest }).returning();
    return item;
  });

export const deleteLoyaltyProgram = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    await db.delete(travelerLoyaltyPrograms)
      .where(eq(travelerLoyaltyPrograms.id, data.id));
    return { ok: true };
  });

// ── Emergency Contacts ─────────────────────────────────

export const addEmergencyContact = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { travelerId, ...rest } = data;
    const [item] = await db.insert(travelerEmergencyContacts).values({ travelerId, ...rest }).returning();
    return item;
  });

export const deleteEmergencyContact = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    await db.delete(travelerEmergencyContacts)
      .where(eq(travelerEmergencyContacts.id, data.id));
    return { ok: true };
  });

// ── Events ─────────────────────────────────────────────

export const addEvent = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { destinationId, ...rest } = data;
    const [item] = await db.insert(destinationEvents).values({ destinationId, ...rest }).returning();
    return item;
  });

export const updateEvent = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const { id, ...rest } = data;
    const [updated] = await db.update(destinationEvents).set(rest)
      .where(eq(destinationEvents.id, id))
      .returning();
    return updated;
  });

export const deleteEvent = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    await db.delete(destinationEvents)
      .where(eq(destinationEvents.id, data.id));
    return { ok: true };
  });
