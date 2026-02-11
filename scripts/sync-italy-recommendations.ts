#!/usr/bin/env bun
/**
 * Italy Trip Recommendations Sync Script
 * 
 * This script parses the recommendations markdown file and syncs them
d with the Odyssey database.
 * 
 * Usage: bun scripts/sync-italy-recommendations.ts --tripId <trip-id>
 */

import { db } from '../src/db';
import { tripRecommendations, tripDestinations, destinationEvents, destinationHighlights } from '../src/db/schema';
import { eq, and, like } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

const RECOMMENDATIONS_FILE = '/root/clawd/memory/trips/italy-2026-recommendations.md';
const SCREENSHOTS_DIR = '/root/clawd/memory/trips/italy-2026-screenshots';

interface ParsedRecommendation {
  number: string;
  title: string;
  description?: string;
  addedDate?: string;
  status: 'pending' | 'maybe' | 'approved' | 'booked' | 'no-go';
  screenshotPath?: string;
  what?: string;
  whySpecial: string[];
  logistics: {
    distance?: string;
    driveTime?: string;
    trainTime?: string;
    tickets?: string;
    bookingUrl?: string;
    entranceFees?: string;
    bestTime?: string;
  };
  notes?: string;
  proTips: string[];
  events: Array<{
    name: string;
    dates?: string;
    description?: string;
  }>;
}

function parseMarkdown(content: string): ParsedRecommendation[] {
  const recommendations: ParsedRecommendation[] = [];
  
  // Split by recommendation headers (### 001., ### 002., etc.)
  const sections = content.split(/(?=###\s+\d+\.\s)/);
  
  for (const section of sections) {
    const headerMatch = section.match(/###\s+(\d+)\.\s+(.+?)(?:\n|$)/);
    if (!headerMatch) continue;
    
    const number = headerMatch[1];
    const title = headerMatch[2].trim();
    
    const rec: ParsedRecommendation = {
      number,
      title,
      status: 'pending',
      whySpecial: [],
      logistics: {},
      proTips: [],
      events: [],
    };
    
    // Parse Added date
    const addedMatch = section.match(/\*\*Added:\*\*\s*(.+?)(?:\n|$)/);
    if (addedMatch) rec.addedDate = addedMatch[1].trim();
    
    // Parse Status
    const statusMatch = section.match(/\*\*Status:\*\*\s*(.+?)(?:\n|$)/);
    if (statusMatch) {
      const statusText = statusMatch[1].toLowerCase();
      if (statusText.includes('pending')) rec.status = 'pending';
      else if (statusText.includes('maybe')) rec.status = 'maybe';
      else if (statusText.includes('approved')) rec.status = 'approved';
      else if (statusText.includes('booked')) rec.status = 'booked';
      else if (statusText.includes('no-go')) rec.status = 'no-go';
    }
    
    // Parse Screenshot
    const screenshotMatch = section.match(/\*\*Screenshot:\*\*\s*(.+?)(?:\n|$)/);
    if (screenshotMatch) {
      rec.screenshotPath = screenshotMatch[1].trim();
    }
    
    // Parse What
    const whatMatch = section.match(/\*\*What:\*\*\s*([^*]+?)(?=\n\*\*|$)/s);
    if (whatMatch) rec.what = whatMatch[1].trim();
    
    // Parse Why it's special
    const whyMatch = section.match(/\*\*Why it's special:\*\*\s*\n([\s\S]*?)(?=\n\*\*Logistics:|\n###|\n---|$)/);
    if (whyMatch) {
      const whyText = whyMatch[1];
      // Extract bullet points
      const bullets = whyText.match(/^-\s+(.+?)$/gm);
      if (bullets) {
        rec.whySpecial = bullets.map(b => b.replace(/^-\s+/, '').trim());
      }
    }
    
    // Parse Logistics
    const logisticsMatch = section.match(/\*\*Logistics:\*\*\s*\n([\s\S]*?)(?=\n\*\*[A-Z]|\n###|\n---|$)/);
    if (logisticsMatch) {
      const logText = logisticsMatch[1];
      
      const distanceMatch = logText.match(/\*\*Distance:\*\*\s*(.+?)(?:\n|$)/);
      if (distanceMatch) rec.logistics.distance = distanceMatch[1].trim();
      
      const driveMatch = logText.match(/\*\*Drive:\*\*\s*(.+?)(?:\n|$)/);
      if (driveMatch) rec.logistics.driveTime = driveMatch[1].trim();
      
      const trainMatch = logText.match(/\*\*Train:\*\*\s*(.+?)(?:\n|$)/);
      if (trainMatch) rec.logistics.trainTime = trainMatch[1].trim();
      
      const ticketsMatch = logText.match(/\*\*Tickets:\*\*\s*(.+?)(?:\n|$)/);
      if (ticketsMatch) rec.logistics.tickets = ticketsMatch[1].trim();
      
      const bookingMatch = logText.match(/\*\*Book at:\*\*\s*(.+?)(?:\n|$)/);
      if (bookingMatch) rec.logistics.bookingUrl = bookingMatch[1].trim();
      
      const entranceMatch = logText.match(/\*\*Entrance fees:\*\*\s*(.+?)(?:\n|$)/);
      if (entranceMatch) rec.logistics.entranceFees = entranceMatch[1].trim();
      
      const bestTimeMatch = logText.match(/\*\*Best time:\*\*\s*(.+?)(?:\n|$)/);
      if (bestTimeMatch) rec.logistics.bestTime = bestTimeMatch[1].trim();
    }
    
    // Parse Notes
    const notesMatch = section.match(/\*\*Notes:\*\*\s*([^*]+?)(?=\n\*\*|$)/s);
    if (notesMatch) rec.notes = notesMatch[1].trim();
    
    // Parse Pro tips
    const tipsMatch = section.match(/\*\*Pro tips?:\*\*\s*\n([\s\S]*?)(?=\n\*\*[A-Z]|\n###|\n---|$)/);
    if (tipsMatch) {
      const tipsText = tipsMatch[1];
      const bullets = tipsText.match(/^-\s+(.+?)$/gm);
      if (bullets) {
        rec.proTips = bullets.map(b => b.replace(/^-\s+/, '').trim());
      }
    }
    
    // Parse Events (shows, performances, etc.)
    const eventsMatch = section.match(/\*\*(?:Shows|Summer performances|Events).*?:\*\*\s*\n([\s\S]*?)(?=\n\*\*[A-Z]|\n###|\n---|$)/);
    if (eventsMatch) {
      const eventsText = eventsMatch[1];
      const eventLines = eventsText.match(/^-\s+(.+?)$/gm);
      if (eventLines) {
        rec.events = eventLines.map(line => {
          const cleanLine = line.replace(/^-\s+/, '').trim();
          // Try to extract name and dates (e.g., "Aida — June 19, 25; July 2, 10")
          const parts = cleanLine.split('—');
          if (parts.length >= 2) {
            return {
              name: parts[0].trim(),
              dates: parts[1].trim(),
            };
          }
          return { name: cleanLine };
        });
      }
    }
    
    recommendations.push(rec);
  }
  
  return recommendations;
}

async function findDestinationByFuzzyMatch(tripId: string, title: string): Promise<typeof tripDestinations.$inferSelect | null> {
  const destinations = await db.select()
    .from(tripDestinations)
    .where(eq(tripDestinations.tripId, tripId));
  
  // Extract location name from title (e.g., "Arena di Verona Opera Festival" -> "Verona")
  const locationKeywords = title.toLowerCase()
    .replace(/opera festival|the world's|oldest|indoor|theater|hills|wine country/i, '')
    .trim()
    .split(/\s+/);
  
  for (const dest of destinations) {
    const destName = dest.name.toLowerCase();
    // Check if any significant word from the title matches the destination name
    for (const keyword of locationKeywords) {
      if (keyword.length > 3 && destName.includes(keyword)) {
        return dest;
      }
    }
  }
  
  return null;
}

async function syncRecommendations(tripId: string) {
  console.log('🔄 Syncing Italy trip recommendations...');
  
  // Read and parse markdown
  const content = fs.readFileSync(RECOMMENDATIONS_FILE, 'utf-8');
  const parsedRecs = parseMarkdown(content);
  
  console.log(`📄 Found ${parsedRecs.length} recommendations in markdown`);
  
  // Get existing recommendations from DB
  const existingRecs = await db.select()
    .from(tripRecommendations)
    .where(eq(tripRecommendations.tripId, tripId));
  
  const existingMap = new Map(existingRecs.map(r => [r.recommendationNumber, r]));
  
  for (const parsed of parsedRecs) {
    const existing = existingMap.get(parsed.number);
    
    // Find or create destination link
    let destinationId: string | null = existing?.destinationId || null;
    
    if (!destinationId) {
      const matchedDest = await findDestinationByFuzzyMatch(tripId, parsed.title);
      if (matchedDest) {
        destinationId = matchedDest.id;
        console.log(`🔗 Matched "${parsed.title}" to destination "${matchedDest.name}"`);
      }
    }
    
    // Build logistics JSON
    const logisticsJson = JSON.stringify(parsed.logistics);
    const whySpecialJson = JSON.stringify(parsed.whySpecial);
    const proTipsJson = JSON.stringify(parsed.proTips);
    const eventsJson = JSON.stringify(parsed.events);
    
    if (existing) {
      // Update existing recommendation
      // Only update fields that haven't been modified in the UI (status should sync both ways)
      await db.update(tripRecommendations)
        .set({
          title: parsed.title,
          description: parsed.what,
          what: parsed.what,
          whySpecial: whySpecialJson,
          logistics: logisticsJson,
          notes: parsed.notes,
          proTips: proTipsJson,
          events: eventsJson,
          screenshotPath: parsed.screenshotPath,
          destinationId,
          updatedAt: new Date(),
        })
        .where(eq(tripRecommendations.id, existing.id));
      
      console.log(`✅ Updated recommendation ${parsed.number}: ${parsed.title}`);
    } else {
      // Create new recommendation
      const [newRec] = await db.insert(tripRecommendations).values({
        tripId,
        recommendationNumber: parsed.number,
        title: parsed.title,
        description: parsed.what,
        addedDate: parsed.addedDate,
        status: parsed.status,
        what: parsed.what,
        whySpecial: whySpecialJson,
        logistics: logisticsJson,
        notes: parsed.notes,
        proTips: proTipsJson,
        events: eventsJson,
        screenshotPath: parsed.screenshotPath,
        destinationId,
        homeBaseAddress: 'Contrà S. Rocco 60, Vicenza, VI 36100',
        homeBaseLat: 45.5481,
        homeBaseLng: 11.5456,
      }).returning();
      
      console.log(`✅ Created recommendation ${parsed.number}: ${parsed.title}`);
      
      // Create events if destination exists
      if (destinationId && parsed.events.length > 0) {
        for (const event of parsed.events) {
          await db.insert(destinationEvents).values({
            destinationId,
            recommendationId: newRec.id,
            name: event.name,
            description: event.dates,
            eventType: 'performance',
          });
        }
        console.log(`🎭 Created ${parsed.events.length} events for ${parsed.title}`);
      }
    }
    
    // If destination exists, update its highlights and research status
    if (destinationId) {
      const dest = await db.select()
        .from(tripDestinations)
        .where(eq(tripDestinations.id, destinationId))
        .limit(1);
      
      if (dest[0]) {
        // Update destination with parsed info
        await db.update(tripDestinations)
          .set({
            description: dest[0].description || parsed.what,
            researchStatus: parsed.status === 'booked' ? 'booked' : parsed.status === 'approved' ? 'approved' : 'researched',
          })
          .where(eq(tripDestinations.id, destinationId));
        
        // Add/update highlights from whySpecial
        if (parsed.whySpecial.length > 0) {
          const existingHighlights = await db.select()
            .from(destinationHighlights)
            .where(eq(destinationHighlights.destinationId, destinationId));
          
          // Only add new highlights that don't exist
          const existingTitles = new Set(existingHighlights.map(h => h.title));
          
          for (let i = 0; i < parsed.whySpecial.length; i++) {
            const reason = parsed.whySpecial[i];
            const title = reason.slice(0, 100);
            
            if (!existingTitles.has(title)) {
              await db.insert(destinationHighlights).values({
                destinationId,
                title,
                description: reason,
                category: 'attraction',
                orderIndex: existingHighlights.length + i,
              });
            }
          }
        }
      }
    }
  }
  
  console.log('✨ Sync complete!');
}

// CLI
const args = process.argv.slice(2);
const tripIdArg = args.find(a => a.startsWith('--tripId='));
const tripId = tripIdArg ? tripIdArg.split('=')[1] : args[args.indexOf('--tripId') + 1];

if (!tripId) {
  console.error('Usage: bun scripts/sync-italy-recommendations.ts --tripId <trip-id>');
  process.exit(1);
}

syncRecommendations(tripId)
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Sync failed:', err);
    process.exit(1);
  });
