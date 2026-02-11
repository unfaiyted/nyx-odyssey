import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { tripRecommendations, destinationEvents, tripDestinations, destinationHighlights } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';

// ── Schemas ────────────────────────────────────────────

const createRecommendationSchema = z.object({
  tripId: z.string().min(1),
  recommendationNumber: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  addedDate: z.string().optional(),
  status: z.enum(['pending', 'maybe', 'approved', 'booked', 'no-go']).default('pending'),
  what: z.string().optional(),
  whySpecial: z.string().optional(), // JSON array
  logistics: z.string().optional(), // JSON object
  notes: z.string().optional(),
  proTips: z.string().optional(), // JSON array
  events: z.string().optional(), // JSON array
  screenshotPath: z.string().optional(),
  homeBaseAddress: z.string().optional(),
  homeBaseLat: z.number().optional(),
  homeBaseLng: z.number().optional(),
});

const updateRecommendationSchema = createRecommendationSchema.partial().extend({
  id: z.string().min(1),
});

const updateStatusSchema = z.object({
  id: z.string().min(1),
  tripId: z.string().min(1),
  status: z.enum(['pending', 'maybe', 'approved', 'booked', 'no-go']),
});

const linkDestinationSchema = z.object({
  id: z.string().min(1),
  tripId: z.string().min(1),
  destinationId: z.string().min(1),
});

const addToItinerarySchema = z.object({
  id: z.string().min(1),
  tripId: z.string().min(1),
  arrivalDate: z.string().optional(),
  departureDate: z.string().optional(),
});

// ── Server Functions ───────────────────────────────────

export const getTripRecommendations = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ tripId: z.string().min(1) }))
  .handler(async ({ data: { tripId } }) => {
    const recs = await db.select()
      .from(tripRecommendations)
      .where(eq(tripRecommendations.tripId, tripId))
      .orderBy(tripRecommendations.recommendationNumber);
    
    // Fetch associated destinations
    const destinationIds = recs
      .filter(r => r.destinationId)
      .map(r => r.destinationId!);
    
    let destinations: typeof tripDestinations.$inferSelect[] = [];
    if (destinationIds.length > 0) {
      destinations = await db.select()
        .from(tripDestinations)
        .where(eq(tripDestinations.tripId, tripId));
    }
    
    // Map destinations to recommendations
    const destMap = new Map(destinations.map(d => [d.id, d]));
    return recs.map(r => ({
      ...r,
      destination: r.destinationId ? destMap.get(r.destinationId) : null,
    }));
  });

export const createTripRecommendation = createServerFn({ method: 'POST' })
  .inputValidator(createRecommendationSchema)
  .handler(async ({ data }) => {
    const [rec] = await db.insert(tripRecommendations).values({
      ...data,
      updatedAt: new Date(),
    }).returning();
    return rec;
  });

export const updateTripRecommendation = createServerFn({ method: 'POST' })
  .inputValidator(updateRecommendationSchema)
  .handler(async ({ data: { id, tripId, ...values } }) => {
    const [updated] = await db.update(tripRecommendations)
      .set({ ...values, updatedAt: new Date() })
      .where(and(
        eq(tripRecommendations.id, id),
        eq(tripRecommendations.tripId, tripId)
      ))
      .returning();
    if (!updated) throw new Error('Recommendation not found');
    return updated;
  });

export const updateRecommendationStatus = createServerFn({ method: 'POST' })
  .inputValidator(updateStatusSchema)
  .handler(async ({ data: { id, tripId, status } }) => {
    const [updated] = await db.update(tripRecommendations)
      .set({ status, updatedAt: new Date() })
      .where(and(
        eq(tripRecommendations.id, id),
        eq(tripRecommendations.tripId, tripId)
      ))
      .returning();
    if (!updated) throw new Error('Recommendation not found');
    return updated;
  });

export const linkRecommendationToDestination = createServerFn({ method: 'POST' })
  .inputValidator(linkDestinationSchema)
  .handler(async ({ data: { id, tripId, destinationId } }) => {
    const [updated] = await db.update(tripRecommendations)
      .set({ destinationId, updatedAt: new Date() })
      .where(and(
        eq(tripRecommendations.id, id),
        eq(tripRecommendations.tripId, tripId)
      ))
      .returning();
    if (!updated) throw new Error('Recommendation not found');
    return updated;
  });

export const deleteTripRecommendation = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1), tripId: z.string().min(1) }))
  .handler(async ({ data: { id, tripId } }) => {
    await db.delete(tripRecommendations)
      .where(and(
        eq(tripRecommendations.id, id),
        eq(tripRecommendations.tripId, tripId)
      ));
    return { ok: true };
  });

export const addRecommendationToItinerary = createServerFn({ method: 'POST' })
  .inputValidator(addToItinerarySchema)
  .handler(async ({ data: { id, tripId, arrivalDate, departureDate } }) => {
    // Get the recommendation
    const [rec] = await db.select()
      .from(tripRecommendations)
      .where(and(
        eq(tripRecommendations.id, id),
        eq(tripRecommendations.tripId, tripId)
      ));
    
    if (!rec) throw new Error('Recommendation not found');
    
    // Create destination from recommendation
    const [destination] = await db.insert(tripDestinations).values({
      tripId,
      name: rec.title,
      description: rec.description,
      lat: rec.homeBaseLat,
      lng: rec.homeBaseLng,
      arrivalDate,
      departureDate,
      photoUrl: rec.screenshotPath ? `/recommendations/${rec.screenshotPath.split('/').pop()}` : null,
      status: 'researched',
      researchStatus: 'approved',
      orderIndex: 0,
    }).returning();
    
    // Link recommendation to destination
    await db.update(tripRecommendations)
      .set({ 
        destinationId: destination.id, 
        status: 'approved',
        updatedAt: new Date() 
      })
      .where(eq(tripRecommendations.id, id));
    
    // Parse and add highlights from whySpecial
    if (rec.whySpecial) {
      try {
        const whySpecial = JSON.parse(rec.whySpecial);
        if (Array.isArray(whySpecial)) {
          for (let i = 0; i < whySpecial.length; i++) {
            await db.insert(destinationHighlights).values({
              destinationId: destination.id,
              title: whySpecial[i].slice(0, 100),
              description: whySpecial[i],
              category: 'attraction',
              orderIndex: i,
            });
          }
        }
      } catch (e) {
        console.error('Failed to parse whySpecial:', e);
      }
    }
    
    return { destination, recommendation: rec };
  });

// ── Destination Events ─────────────────────────────────

const createEventSchema = z.object({
  destinationId: z.string().min(1),
  recommendationId: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  eventType: z.enum(['performance', 'festival', 'race', 'exhibition', 'other']).default('performance'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  startTime: z.string().optional(),
  ticketUrl: z.string().optional(),
  ticketPriceFrom: z.string().optional(),
  ticketPriceTo: z.string().optional(),
  currency: z.string().default('EUR'),
  interested: z.boolean().default(false),
  booked: z.boolean().default(false),
  notes: z.string().optional(),
});

export const getDestinationEvents = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ destinationId: z.string().min(1) }))
  .handler(async ({ data: { destinationId } }) => {
    return db.select()
      .from(destinationEvents)
      .where(eq(destinationEvents.destinationId, destinationId))
      .orderBy(destinationEvents.startDate);
  });

export const createDestinationEvent = createServerFn({ method: 'POST' })
  .inputValidator(createEventSchema)
  .handler(async ({ data }) => {
    const [event] = await db.insert(destinationEvents).values(data).returning();
    return event;
  });

export const updateDestinationEvent = createServerFn({ method: 'POST' })
  .inputValidator(createEventSchema.partial().extend({ id: z.string().min(1) }))
  .handler(async ({ data: { id, ...values } }) => {
    const [updated] = await db.update(destinationEvents)
      .set(values)
      .where(eq(destinationEvents.id, id))
      .returning();
    if (!updated) throw new Error('Event not found');
    return updated;
  });

export const deleteDestinationEvent = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data: { id } }) => {
    await db.delete(destinationEvents).where(eq(destinationEvents.id, id));
    return { ok: true };
  });
