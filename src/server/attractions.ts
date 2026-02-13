import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { attractions, attractionResearchRequests, tripDestinations, trips } from '../db/schema';
import { eq, and, desc, asc, inArray, sql } from 'drizzle-orm';

// ── Get Attraction Detail ─────────────────────────────
export const getAttractionDetail = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ attractionId: z.string().min(1) }))
  .handler(async ({ data: { attractionId } }) => {
    const [attraction] = await db
      .select()
      .from(attractions)
      .where(eq(attractions.id, attractionId));
    
    if (!attraction) throw new Error('Attraction not found');

    // Get destination info for parent link
    const [destination] = await db
      .select()
      .from(tripDestinations)
      .where(eq(tripDestinations.id, attraction.destinationId));

    // Get trip info
    const [trip] = destination ? await db
      .select()
      .from(trips)
      .where(eq(trips.id, destination.tripId)) : [null];

    return {
      attraction,
      destination: destination || null,
      trip: trip || null,
    };
  });

// ── List Attractions by Destination ───────────────────
export const getAttractionsByDestination = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ destinationId: z.string().min(1) }))
  .handler(async ({ data: { destinationId } }) => {
    const results = await db
      .select()
      .from(attractions)
      .where(eq(attractions.destinationId, destinationId))
      .orderBy(asc(attractions.orderIndex));

    return results;
  });

// ── Create/Update Attraction ──────────────────────────
export const upsertAttraction = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    id: z.string().optional(),
    destinationId: z.string().min(1),
    name: z.string().min(1),
    type: z.string().default('attraction'),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    hoursJson: z.string().optional(),
    ticketInfo: z.string().optional(),
    bookingUrl: z.string().optional(),
    officialUrl: z.string().optional(),
    address: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    heroImageUrl: z.string().optional(),
    photosJson: z.string().optional(),
    history: z.string().optional(),
    visitorTips: z.string().optional(),
    rating: z.number().optional(),
    priceLevel: z.number().optional(),
    duration: z.string().optional(),
    orderIndex: z.number().default(0),
    researchStatus: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const { id, ...values } = data;
    
    if (id) {
      // Update existing
      const [updated] = await db
        .update(attractions)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(attractions.id, id))
        .returning();
      return updated;
    } else {
      // Create new
      const [created] = await db
        .insert(attractions)
        .values(values)
        .returning();
      return created;
    }
  });

// ── Delete Attraction ─────────────────────────────────
export const deleteAttraction = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data: { id } }) => {
    await db.delete(attractions).where(eq(attractions.id, id));
    return { ok: true };
  });

// ── Research Request Functions ────────────────────────

export const createResearchRequest = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    attractionId: z.string().optional(),
    destinationId: z.string().min(1),
    tripId: z.string().min(1),
    missingHours: z.boolean().default(false),
    missingTickets: z.boolean().default(false),
    missingPhotos: z.boolean().default(false),
    missingHistory: z.boolean().default(false),
    missingTips: z.boolean().default(false),
    missingBookingLinks: z.boolean().default(false),
    missingOther: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).default('low'),
    notes: z.string().optional(),
    attractionName: z.string().optional(), // For creating new attraction if needed
  }))
  .handler(async ({ data }) => {
    const { attractionName, ...requestData } = data;
    
    // If no attractionId provided but name given, create a placeholder attraction
    let attractionId = data.attractionId;
    if (!attractionId && attractionName) {
      const [newAttraction] = await db
        .insert(attractions)
        .values({
          destinationId: data.destinationId,
          name: attractionName,
          researchStatus: 'pending',
          researchPriority: data.priority,
          researchRequestedAt: new Date(),
        })
        .returning();
      attractionId = newAttraction.id;
    }

    // Create the research request
    const [request] = await db
      .insert(attractionResearchRequests)
      .values({
        ...requestData,
        attractionId,
        status: 'open',
      })
      .returning();

    // Update attraction research status if exists
    if (attractionId) {
      await db
        .update(attractions)
        .set({
          researchStatus: 'pending',
          researchPriority: data.priority,
          researchRequestedAt: new Date(),
          researchRequestCount: sql`${attractions.researchRequestCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(attractions.id, attractionId));
    }

    // TODO: Create Nyx Console issue via API
    // This would call out to nyx-console to create an issue
    
    return { request, attractionId };
  });

export const getResearchRequests = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ 
    tripId: z.string().optional(),
    status: z.enum(['open', 'in_progress', 'completed', 'closed']).optional(),
    limit: z.number().default(50),
  }))
  .handler(async ({ data: { tripId, status, limit } }) => {
    let query = db
      .select({
        request: attractionResearchRequests,
        attraction: attractions,
        destination: tripDestinations,
      })
      .from(attractionResearchRequests)
      .leftJoin(attractions, eq(attractionResearchRequests.attractionId, attractions.id))
      .leftJoin(tripDestinations, eq(attractionResearchRequests.destinationId, tripDestinations.id))
      .orderBy(desc(attractionResearchRequests.createdAt))
      .limit(limit);

    if (tripId) {
      query = query.where(eq(attractionResearchRequests.tripId, tripId));
    }

    if (status) {
      query = query.where(eq(attractionResearchRequests.status, status));
    }

    const results = await query;
    return results;
  });

export const updateResearchRequestStatus = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    requestId: z.string().min(1),
    status: z.enum(['open', 'in_progress', 'completed', 'closed']),
    nyxConsoleIssueId: z.string().optional(),
  }))
  .handler(async ({ data: { requestId, status, nyxConsoleIssueId } }) => {
    const [updated] = await db
      .update(attractionResearchRequests)
      .set({
        status,
        ...(nyxConsoleIssueId && { nyxConsoleIssueId }),
        updatedAt: new Date(),
      })
      .where(eq(attractionResearchRequests.id, requestId))
      .returning();

    // If completed, update attraction research status
    if (status === 'completed' && updated?.attractionId) {
      await db
        .update(attractions)
        .set({
          researchStatus: 'completed',
          researchCompletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(attractions.id, updated.attractionId));
    }

    return updated;
  });

// ── Attractions Queue Dashboard ───────────────────────

export const getAttractionsResearchQueue = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ 
    tripId: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'needs_review']).optional(),
  }))
  .handler(async ({ data: { tripId, status } }) => {
    let query = db
      .select({
        attraction: attractions,
        destination: tripDestinations,
      })
      .from(attractions)
      .leftJoin(tripDestinations, eq(attractions.destinationId, tripDestinations.id))
      .orderBy(
        sql`CASE ${attractions.researchPriority} 
          WHEN 'high' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 3 
          ELSE 4 
        END`,
        desc(attractions.researchRequestedAt)
      );

    if (tripId) {
      query = query.where(eq(tripDestinations.tripId, tripId));
    }

    if (status) {
      query = query.where(eq(attractions.researchStatus, status));
    } else {
      // Default: show pending and in_progress
      query = query.where(
        inArray(attractions.researchStatus, ['pending', 'in_progress', 'needs_review'])
      );
    }

    const results = await query;
    return results;
  });

export const getRecentlyCompletedAttractions = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ 
    tripId: z.string().optional(),
    limit: z.number().default(10),
  }))
  .handler(async ({ data: { tripId, limit } }) => {
    let query = db
      .select({
        attraction: attractions,
        destination: tripDestinations,
      })
      .from(attractions)
      .leftJoin(tripDestinations, eq(attractions.destinationId, tripDestinations.id))
      .where(eq(attractions.researchStatus, 'completed'))
      .orderBy(desc(attractions.researchCompletedAt))
      .limit(limit);

    if (tripId) {
      query = query.where(eq(tripDestinations.tripId, tripId));
    }

    const results = await query;
    return results;
  });

// ── Formatting Utilities ──────────────────────────────

// Helper to format ticket prices consistently
export function formatTicketPrice(price: string | null | undefined): string {
  if (!price) return '';
  
  // Normalize various formats to €XX
  const normalized = price
    .replace(/\u20ac/g, '€') // Unicode euro
    .replace(/EUR/gi, '€')
    .replace(/euro/gi, '€')
    .replace(/(\d+),-(?![\d])/, '€$1') // "25,-" format
    .trim();
  
  // Add € if missing and there's a number
  if (!normalized.includes('€') && /\d/.test(normalized)) {
    return `€${normalized}`;
  }
  
  return normalized;
}

// Helper to parse hours JSON safely
export function parseHours(hoursJson: string | null | undefined): Record<string, any> | null {
  if (!hoursJson) return null;
  try {
    return JSON.parse(hoursJson);
  } catch {
    return null;
  }
}

// Helper to parse photos JSON safely
export function parsePhotos(photosJson: string | null | undefined): string[] {
  if (!photosJson) return [];
  try {
    const parsed = JSON.parse(photosJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Helper to parse visitor tips
export function parseVisitorTips(tipsJson: string | null | undefined): string[] {
  if (!tipsJson) return [];
  try {
    const parsed = JSON.parse(tipsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
