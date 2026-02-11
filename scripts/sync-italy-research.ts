/**
 * Italy Research Sync — Parse recommendations markdown and sync to Odyssey DB
 *
 * Usage: bun scripts/sync-italy-research.ts [--dry-run]
 *
 * Parses /root/clawd/memory/trips/italy-2026-recommendations.md
 * Extracts recommendation blocks and syncs to trip_destinations,
 * destinationHighlights, and destinationResearch tables.
 */
import { db } from '../src/db';
import {
  tripDestinations,
  destinationHighlights,
  destinationResearch,
  trips,
  tripCronJobs,
} from '../src/db/schema';
import { eq, like, sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

// ── Configuration ─────────────────────────────────────
const MARKDOWN_PATH = '/root/clawd/memory/trips/italy-2026-recommendations.md';
const SCREENSHOTS_DIR = '/root/clawd/memory/trips/italy-2026-screenshots';
const PUBLIC_SCREENSHOTS_DIR = '/root/clawd/odyssey/public/italy-screenshots';
const TRIP_NAME = 'Italy 2026';
const CRON_JOB_ID = 'dd463a6c-599c-4a4e-ae36-b3bb63720e3b';

// Status mapping from emoji to DB status
const STATUS_MAP: Record<string, string> = {
  '✅': 'approved',
  '✔️': 'approved',
  '❌': 'rejected',
  '✗': 'rejected',
  '⏳': 'pending',
  '🤔': 'maybe',
  '📅': 'booked',
};

// ── Types ──────────────────────────────────────────────
interface ParsedRecommendation {
  number: string;
  name: string;
  added: string;
  status: string;
  statusEmoji: string;
  screenshotPath: string | null;
  what: string;
  whySpecial: string;
  logistics: string;
  notes: string;
}

// ── Parser ─────────────────────────────────────────────
function parseRecommendations(content: string): ParsedRecommendation[] {
  const recommendations: ParsedRecommendation[] = [];

  // Split by recommendation blocks (### 001., ### 002., etc.)
  const blockRegex = /###\s+(\d+)\.?\s+(.+?)\n/g;
  let match;

  while ((match = blockRegex.exec(content)) !== null) {
    const number = match[1];
    const name = match[2].trim();
    const startIdx = match.index;

    // Find the next block or end of content
    const nextMatch = blockRegex.exec(content);
    const endIdx = nextMatch ? nextMatch.index : content.length;
    blockRegex.lastIndex = startIdx + 1; // Reset for next iteration

    const blockContent = content.substring(startIdx, endIdx);

    // Parse fields
    const added = extractField(blockContent, 'Added:', '**Added:**') || '';
    const statusLine = extractField(blockContent, 'Status:', '**Status:**') || '';
    const statusEmoji = extractStatusEmoji(statusLine);
    const status = STATUS_MAP[statusEmoji] || 'pending';
    const screenshotPath = extractScreenshotPath(blockContent);

    const what = extractSection(blockContent, 'What:', '**What:**', ['Why', 'Logistics', 'Notes']);
    const whySpecial = extractSection(blockContent, "Why it's special:", "**Why it's special:**", ['Logistics', 'Notes']);
    const logistics = extractSection(blockContent, 'Logistics:', '**Logistics:**', ['Notes', 'Shows', 'Summer', 'Pro tips']);
    const notes = extractSection(blockContent, 'Notes:', '**Notes:**', ['---', '##']);

    recommendations.push({
      number,
      name,
      added,
      status,
      statusEmoji,
      screenshotPath,
      what,
      whySpecial,
      logistics,
      notes,
    });
  }

  return recommendations;
}

function extractField(content: string, ...patterns: string[]): string | null {
  for (const pattern of patterns) {
    const regex = new RegExp(`${pattern}\\s*(.+?)(?:\\n|$)`, 'i');
    const match = content.match(regex);
    if (match) return match[1].trim();
  }
  return null;
}

function extractStatusEmoji(statusLine: string): string {
  const emojiMatch = statusLine.match(/^([✅✔️❌✗⏳🤔📅])\s*/);
  return emojiMatch ? emojiMatch[1] : '⏳';
}

function extractScreenshotPath(content: string): string | null {
  const match = content.match(/\*\*Screenshot:\*\*\s*`([^`]+)`/);
  if (!match) return null;

  const relativePath = match[1];
  // Convert to just the filename for DB storage
  return path.basename(relativePath);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractSection(
  content: string,
  headerPattern: string,
  altHeaderPattern: string,
  stopPatterns: string[]
): string {
  const escapedHeader = escapeRegex(headerPattern);
  const escapedAlt = escapeRegex(altHeaderPattern);
  const escapedStops = stopPatterns.map(escapeRegex).join('|');
  const headerRegex = new RegExp(`(?:^|\\n)(?:${escapedHeader}|${escapedAlt})\\s*(.+?)(?:\\n(?:${escapedStops})|$)`, 'is');
  const match = content.match(headerRegex);

  if (!match) return '';

  let section = match[1].trim();

  // Clean up markdown formatting
  section = section
    .replace(/\*\*/g, '') // Remove bold markers
    .replace(/^-\s*/gm, '') // Remove list markers at start of lines
    .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
    .trim();

  return section;
}

// ── Fuzzy Matching ─────────────────────────────────────
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeName(str1);
  const s2 = normalizeName(str2);

  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.9;

  // Simple word overlap
  const words1 = new Set(s1.split(' '));
  const words2 = new Set(s2.split(' '));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

async function findExistingDestination(tripId: string, name: string) {
  const existing = await db
    .select()
    .from(tripDestinations)
    .where(eq(tripDestinations.tripId, tripId));

  let bestMatch = null;
  let bestScore = 0;
  const threshold = 0.6;

  for (const dest of existing) {
    const score = calculateSimilarity(dest.name, name);
    if (score > bestScore && score >= threshold) {
      bestScore = score;
      bestMatch = dest;
    }
  }

  return bestMatch;
}

// ── Screenshot Handling ────────────────────────────────
async function copyScreenshot(filename: string): Promise<string | null> {
  if (!filename) return null;

  const sourcePath = path.join(SCREENSHOTS_DIR, filename);

  if (!fs.existsSync(sourcePath)) {
    console.warn(`  ⚠️ Screenshot not found: ${sourcePath}`);
    return null;
  }

  // Ensure public directory exists
  if (!fs.existsSync(PUBLIC_SCREENSHOTS_DIR)) {
    fs.mkdirSync(PUBLIC_SCREENSHOTS_DIR, { recursive: true });
  }

  const destPath = path.join(PUBLIC_SCREENSHOTS_DIR, filename);

  try {
    fs.copyFileSync(sourcePath, destPath);
    return `/italy-screenshots/${filename}`;
  } catch (err) {
    console.warn(`  ⚠️ Failed to copy screenshot: ${err}`);
    return null;
  }
}

// ── Sync Logic ─────────────────────────────────────────
async function syncRecommendation(
  tripId: string,
  rec: ParsedRecommendation,
  dryRun: boolean
) {
  console.log(`\n📍 ${rec.number}. ${rec.name}`);
  console.log(`   Status: ${rec.statusEmoji} ${rec.status}`);

  // Skip rejected destinations
  if (rec.status === 'rejected') {
    console.log('   ⏭️ Skipped (rejected status)');
    return { action: 'skipped', reason: 'rejected' };
  }

  // Find or create destination
  const existing = await findExistingDestination(tripId, rec.name);

  let destinationId: string;
  let action: string;

  // Build description from what + why special
  const description = [rec.what, rec.whySpecial]
    .filter(Boolean)
    .join('\n\n');

  if (existing) {
    destinationId = existing.id;
    action = 'updated';
    console.log(`   🔄 Found existing: "${existing.name}"`);

    if (!dryRun) {
      // Update existing destination
      await db
        .update(tripDestinations)
        .set({
          description: description || existing.description,
          researchStatus: rec.status === 'approved' ? 'approved' : rec.status === 'booked' ? 'booked' : 'researched',
          updatedAt: new Date(),
        })
        .where(eq(tripDestinations.id, destinationId));
    }
  } else {
    action = 'created';
    console.log(`   ➕ Creating new destination`);

    if (!dryRun) {
      // Create new destination
      const [newDest] = await db
        .insert(tripDestinations)
        .values({
          tripId,
          name: rec.name,
          description,
          researchStatus: rec.status === 'approved' ? 'approved' : rec.status === 'booked' ? 'booked' : 'researched',
          orderIndex: parseInt(rec.number, 10),
        })
        .returning();

      destinationId = newDest.id;
    } else {
      destinationId = `dry-run-${rec.number}`;
    }
  }

  // Copy screenshot if available
  let photoUrl: string | null = null;
  if (rec.screenshotPath) {
    if (!dryRun) {
      photoUrl = await copyScreenshot(rec.screenshotPath);
      if (photoUrl) {
        await db
          .update(tripDestinations)
          .set({ photoUrl })
          .where(eq(tripDestinations.id, destinationId));
        console.log(`   📸 Screenshot linked: ${photoUrl}`);
      }
    } else {
      console.log(`   📸 Would copy screenshot: ${rec.screenshotPath}`);
    }
  }

  // Update or create research data
  if (!dryRun) {
    const existingResearch = await db
      .select()
      .from(destinationResearch)
      .where(eq(destinationResearch.destinationId, destinationId));

    const researchData = {
      country: 'Italy',
      summary: rec.what,
      travelTips: JSON.stringify([
        rec.whySpecial,
        rec.logistics,
        rec.notes,
      ].filter(Boolean)),
      transportNotes: rec.logistics,
      updatedAt: new Date(),
    };

    if (existingResearch.length > 0) {
      await db
        .update(destinationResearch)
        .set(researchData)
        .where(eq(destinationResearch.destinationId, destinationId));
    } else {
      await db.insert(destinationResearch).values({
        destinationId,
        ...researchData,
      });
    }
  }

  // Extract and create highlights
  const highlights = extractHighlights(rec);

  if (!dryRun && highlights.length > 0) {
    // Get existing highlights to avoid duplicates
    const existingHighlights = await db
      .select()
      .from(destinationHighlights)
      .where(eq(destinationHighlights.destinationId, destinationId));

    for (const highlight of highlights) {
      // Check for duplicate
      const isDuplicate = existingHighlights.some(
        eh => normalizeName(eh.title) === normalizeName(highlight.title)
      );

      if (!isDuplicate) {
        await db.insert(destinationHighlights).values({
          destinationId,
          ...highlight,
          orderIndex: existingHighlights.length + 1,
        });
        console.log(`   ✨ Highlight added: ${highlight.title}`);
      }
    }
  } else if (dryRun && highlights.length > 0) {
    console.log(`   ✨ Would add ${highlights.length} highlights`);
    for (const h of highlights) {
      console.log(`      - ${h.title} (${h.category})`);
    }
  }

  console.log(`   ✅ ${action}`);
  return { action, destinationId };
}

function extractHighlights(rec: ParsedRecommendation) {
  const highlights: { title: string; description: string; category: string }[] = [];

  // Extract from "Why it's special" section - bullet points often indicate highlights
  const whyLines = rec.whySpecial.split('\n');
  for (const line of whyLines) {
    const cleanLine = line.replace(/^[-•]\s*/, '').trim();
    if (cleanLine && cleanLine.length > 10 && !cleanLine.startsWith('•')) {
      // Look for specific patterns indicating attractions/activities
      if (/(castle|museum|theater|beach|cathedral|palace|garden|park|temple|ruins|tower|bridge)/i.test(cleanLine)) {
        highlights.push({
          title: cleanLine.split(/[.–:]/)[0].trim(),
          description: cleanLine,
          category: 'attraction',
        });
      }
    }
  }

  // Extract activities mentioned in logistics or notes
  const activityPatterns = [
    { pattern: /\b(wine tasting|tasting)\b/i, category: 'activity' },
    { pattern: /\b(hiking|walk|trek)\b/i, category: 'nature' },
    { pattern: /\b(opera|concert|performance|show)\b/i, category: 'cultural' },
    { pattern: /\b(spa|thermal|wellness)\b/i, category: 'activity' },
    { pattern: /\b(swimming|swim|beach)\b/i, category: 'nature' },
  ];

  const allText = `${rec.what} ${rec.whySpecial} ${rec.logistics} ${rec.notes}`;

  for (const { pattern, category } of activityPatterns) {
    if (pattern.test(allText)) {
      const match = allText.match(pattern);
      if (match) {
        highlights.push({
          title: match[0].charAt(0).toUpperCase() + match[0].slice(1),
          description: `Mentioned in research notes`,
          category,
        });
      }
    }
  }

  return highlights;
}

// ── Main ───────────────────────────────────────────────
async function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log('🇮🇹 Italy Research Sync');
  console.log('='.repeat(50));
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE'}`);
  console.log(`Markdown: ${MARKDOWN_PATH}`);
  console.log('');

  // Check markdown file exists
  if (!fs.existsSync(MARKDOWN_PATH)) {
    console.error(`❌ Markdown file not found: ${MARKDOWN_PATH}`);
    process.exit(1);
  }

  // Read and parse
  const content = fs.readFileSync(MARKDOWN_PATH, 'utf-8');
  const recommendations = parseRecommendations(content);

  console.log(`📋 Parsed ${recommendations.length} recommendations`);

  // Find Italy trip
  const [trip] = await db
    .select()
    .from(trips)
    .where(like(trips.name, '%Italy%'));

  if (!trip) {
    console.error('❌ Italy trip not found in database');
    process.exit(1);
  }

  console.log(`🎯 Trip: ${trip.name} (${trip.id})`);
  console.log('');

  // Sync each recommendation
  const results: { action: string; destinationId?: string; reason?: string }[] = [];

  for (const rec of recommendations) {
    const result = await syncRecommendation(trip.id, rec, dryRun);
    results.push(result);
  }

  // Update cron job last run
  if (!dryRun) {
    await db
      .update(tripCronJobs)
      .set({
        lastRun: new Date(),
        lastStatus: 'success',
      })
      .where(eq(tripCronJobs.cronJobId, CRON_JOB_ID));
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary');
  console.log('='.repeat(50));

  const created = results.filter(r => r.action === 'created').length;
  const updated = results.filter(r => r.action === 'updated').length;
  const skipped = results.filter(r => r.action === 'skipped').length;

  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total:   ${recommendations.length}`);

  console.log('\n✅ Sync complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});
