import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { researchSessions, tripDestinations, destinationResearch, destinationHighlights } from '../db/schema';
import { eq } from 'drizzle-orm';
import { execSync } from 'child_process';

// ── Types ──────────────────────────────────────────────

interface SearchResult {
  title: string;
  url: string;
  content: string;
  engine?: string;
}

export interface HighlightPreview {
  title: string;
  description: string;
  category: string;
  sourceUrl?: string;
  rating?: number;
  priceLevel?: number;
  address?: string;
}

interface PhotoPreview {
  url: string;
  title: string;
  sourceUrl: string;
}

export interface ResearchPreview {
  sessionId: string;
  destination: string;
  restaurants: HighlightPreview[];
  attractions: HighlightPreview[];
  events: HighlightPreview[];
  travelTips: string[];
  photos: PhotoPreview[];
  sourceUrls: string[];
  searchQueries: string[];
}

// ── SearXNG Search ─────────────────────────────────────

function searxngSearch(query: string, categories = 'general', limit = 10): SearchResult[] {
  try {
    const result = execSync(
      `node /root/clawd/skills/searxng/scripts/search.js "${query.replace(/"/g, '\\"')}" --categories ${categories} --limit ${limit} --format json`,
      { timeout: 30000, encoding: 'utf-8' }
    );
    const parsed = JSON.parse(result);
    return (parsed.results || parsed || []).slice(0, limit);
  } catch (e: any) {
    try {
      const lines = (e.stdout || '').trim();
      if (lines.startsWith('[') || lines.startsWith('{')) {
        const parsed = JSON.parse(lines);
        return (parsed.results || parsed || []).slice(0, limit);
      }
    } catch {}
    console.error(`Search failed for "${query}":`, e.message);
    return [];
  }
}

// ── Parse helpers ──────────────────────────────────────

function extractRestaurants(results: SearchResult[]): HighlightPreview[] {
  const items: HighlightPreview[] = [];
  for (const r of results) {
    if (!r.title || r.title.length < 3) continue;
    items.push({
      title: cleanTitle(r.title),
      description: (r.content || '').slice(0, 200),
      category: 'food',
      sourceUrl: r.url,
    });
  }
  return deduplicateHighlights(items).slice(0, 8);
}

function extractAttractions(results: SearchResult[]): HighlightPreview[] {
  const items: HighlightPreview[] = [];
  for (const r of results) {
    if (!r.title || r.title.length < 3) continue;
    items.push({
      title: cleanTitle(r.title),
      description: (r.content || '').slice(0, 200),
      category: 'attraction',
      sourceUrl: r.url,
    });
  }
  return deduplicateHighlights(items).slice(0, 10);
}

function extractEvents(results: SearchResult[]): HighlightPreview[] {
  const items: HighlightPreview[] = [];
  for (const r of results) {
    if (!r.title || r.title.length < 3) continue;
    items.push({
      title: cleanTitle(r.title),
      description: (r.content || '').slice(0, 200),
      category: 'activity',
      sourceUrl: r.url,
    });
  }
  return deduplicateHighlights(items).slice(0, 6);
}

function extractTravelTips(results: SearchResult[]): string[] {
  const tips: string[] = [];
  for (const r of results) {
    const content = r.content || '';
    const sentences = content.split(/[.!]\s+/).filter(s =>
      s.length > 20 && s.length < 200 &&
      /\b(should|recommend|tip|avoid|bring|remember|don't|try|best|make sure|important)\b/i.test(s)
    );
    for (const s of sentences) {
      if (tips.length < 10) {
        tips.push(s.trim().replace(/^\W+/, '') + '.');
      }
    }
  }
  return [...new Set(tips)].slice(0, 8);
}

function extractPhotos(results: SearchResult[]): PhotoPreview[] {
  return results
    .filter(r => r.url && /\.(jpg|jpeg|png|webp)/i.test(r.url || r.content || ''))
    .map(r => ({
      url: r.url,
      title: r.title || 'Photo',
      sourceUrl: r.url,
    }))
    .slice(0, 6);
}

function cleanTitle(title: string): string {
  return title.replace(/\s*[-|–]\s*(TripAdvisor|Lonely Planet|Viator|GetYourGuide|Wikipedia|Yelp|Google|Tripadvisor).*$/i, '').trim();
}

function deduplicateHighlights(items: HighlightPreview[]): HighlightPreview[] {
  const seen = new Set<string>();
  return items.filter(item => {
    const key = item.title.toLowerCase().slice(0, 30);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── Server Functions ───────────────────────────────────

export const runDestinationResearch = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    destinationId: z.string().min(1),
    homeBase: z.string().default('Virginia, USA'),
  }))
  .handler(async ({ data: { destinationId, homeBase } }): Promise<ResearchPreview> => {
    const [dest] = await db.select().from(tripDestinations).where(eq(tripDestinations.id, destinationId));
    if (!dest) throw new Error('Destination not found');

    const name = dest.name;
    const searchQueries = [
      `${name} best restaurants`,
      `${name} top attractions things to do`,
      `${name} travel tips from ${homeBase}`,
      `${name} photos`,
      `${name} events June July 2026`,
    ];

    const [restaurantResults, attractionResults, tipsResults, photoResults, eventResults] = searchQueries.map(q =>
      searxngSearch(q, q.includes('photos') ? 'images' : 'general', 10)
    );

    const restaurants = extractRestaurants(restaurantResults);
    const attractions = extractAttractions(attractionResults);
    const events = extractEvents(eventResults);
    const travelTips = extractTravelTips(tipsResults);
    const photos = extractPhotos(photoResults);

    const allSourceUrls = [...restaurantResults, ...attractionResults, ...tipsResults, ...eventResults]
      .map(r => r.url)
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 30);

    const [session] = await db.insert(researchSessions).values({
      destinationId,
      status: 'completed',
      searchQueries: JSON.stringify(searchQueries),
      resultsJson: JSON.stringify({ restaurants, attractions, events, travelTips, photos }),
      sourceUrls: JSON.stringify(allSourceUrls),
      qualityScore: Math.min(100, (restaurants.length + attractions.length + travelTips.length + events.length) * 5),
    }).returning();

    return {
      sessionId: session.id,
      destination: name,
      restaurants,
      attractions,
      events,
      travelTips,
      photos,
      sourceUrls: allSourceUrls,
      searchQueries,
    };
  });

export const saveResearchResults = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    sessionId: z.string().min(1),
    destinationId: z.string().min(1),
    highlights: z.array(z.object({
      title: z.string(),
      description: z.string().optional(),
      category: z.string(),
      sourceUrl: z.string().optional(),
      rating: z.number().optional(),
      priceLevel: z.number().optional(),
      address: z.string().optional(),
    })),
    travelTips: z.array(z.string()),
    summary: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const { sessionId, destinationId, highlights, travelTips, summary } = data;

    let orderIndex = 0;
    for (const h of highlights) {
      await db.insert(destinationHighlights).values({
        destinationId,
        title: h.title,
        description: h.description,
        category: h.category,
        websiteUrl: h.sourceUrl,
        rating: h.rating,
        priceLevel: h.priceLevel,
        address: h.address,
        orderIndex: orderIndex++,
      });
    }

    if (travelTips.length > 0 || summary) {
      const existing = await db.select().from(destinationResearch)
        .where(eq(destinationResearch.destinationId, destinationId));

      const researchData: Record<string, any> = {};
      if (travelTips.length > 0) researchData.travelTips = JSON.stringify(travelTips);
      if (summary) researchData.summary = summary;

      if (existing.length > 0) {
        await db.update(destinationResearch)
          .set({ ...researchData, updatedAt: new Date() })
          .where(eq(destinationResearch.destinationId, destinationId));
      } else {
        await db.insert(destinationResearch).values({
          destinationId,
          ...researchData,
        });
      }
    }

    await db.update(researchSessions)
      .set({ highlightsAdded: highlights.length, researchAdded: true })
      .where(eq(researchSessions.id, sessionId));

    await db.update(tripDestinations)
      .set({ researchStatus: 'researched' })
      .where(eq(tripDestinations.id, destinationId));

    return { ok: true, highlightsAdded: highlights.length, tipsAdded: travelTips.length };
  });

export const getResearchSessions = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ destinationId: z.string().min(1) }))
  .handler(async ({ data: { destinationId } }) => {
    return db.select().from(researchSessions)
      .where(eq(researchSessions.destinationId, destinationId))
      .orderBy(researchSessions.createdAt);
  });
