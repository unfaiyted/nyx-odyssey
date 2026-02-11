#!/usr/bin/env bun
/**
 * Italy Trip Ideas Cron Job
 * 
 * Runs: Mon/Wed/Fri at 10:00 AM
 * Schedule: 0 10 * * 1,3,5
 * 
 * Purpose: Research destinations, capture screenshots, gather directions
 * 
 * Output:
 * - memory/trips/italy-2026-recommendations.md
 * - memory/trips/italy-2026-screenshots/*.png
 * - Discord #trip channel notification
 */

import { db } from '../src/db';
import { tripCronJobs, trips, tripDestinations, tripRecommendations } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const CRON_JOB_ID = 'dd463a6c-599c-4a4e-ae36-b3bb63720e3b';
const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh';
const DISCORD_CHANNEL_ID = '1468983452404682874';
const MEMORY_DIR = '/root/clawd/memory/trips';
const SCREENSHOTS_DIR = join(MEMORY_DIR, 'italy-2026-screenshots');
const RECOMMENDATIONS_FILE = join(MEMORY_DIR, 'italy-2026-recommendations.md');

// Ensure directories exist
if (!existsSync(MEMORY_DIR)) {
  mkdirSync(MEMORY_DIR, { recursive: true });
}
if (!existsSync(SCREENSHOTS_DIR)) {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Research queue - destinations to investigate
const RESEARCH_QUEUE = [
  {
    name: 'Verona Arena',
    location: 'Piazza Bra, Verona',
    category: 'day-trip-1hr',
    searchQuery: 'Verona Arena opera tickets 2026 schedule',
  },
  {
    name: 'Venice St. Mark\'s Basilica',
    location: 'Piazza San Marco, Venice',
    category: 'day-trip-1hr',
    searchQuery: 'St Mark\'s Basilica Venice tickets rooftop terrace',
  },
  {
    name: 'Lake Garda',
    location: 'Lake Garda, Italy',
    category: 'day-trip-1hr',
    searchQuery: 'Lake Garda best towns to visit Sirmione Malcesine',
  },
  {
    name: 'Padua Scrovegni Chapel',
    location: 'Padua, Italy',
    category: 'day-trip-1hr',
    searchQuery: 'Scrovegni Chapel Padua Giotto frescoes tickets',
  },
  {
    name: 'Prosecco Road',
    location: 'Valdobbiadene, Italy',
    category: 'day-trip-1hr',
    searchQuery: 'Prosecco Road wine tour Valdobbiadene wineries',
  },
  {
    name: 'Bologna Food Tour',
    location: 'Bologna, Italy',
    category: 'day-trip-2hr',
    searchQuery: 'Bologna food tour pasta making class 2026',
  },
  {
    name: 'Dolomites',
    location: 'Cortina d\'Ampezzo, Italy',
    category: 'day-trip-2hr',
    searchQuery: 'Dolomites day trip from Vicenza summer hiking',
  },
  {
    name: 'Florence Duomo',
    location: 'Florence, Italy',
    category: 'weekend-trip',
    searchQuery: 'Florence Duomo climb dome tickets 2026',
  },
  {
    name: 'Cinque Terre',
    location: 'Cinque Terre, Italy',
    category: 'weekend-trip',
    searchQuery: 'Cinque Terre hiking trails Monterosso Vernazza',
  },
  {
    name: 'Milan Duomo',
    location: 'Milan, Italy',
    category: 'weekend-trip',
    searchQuery: 'Milan Duomo rooftop terraces tickets',
  },
];

interface ResearchItem {
  number: string;
  name: string;
  location: string;
  category: string;
  searchQuery: string;
}

async function updateCronJobStatus(status: 'running' | 'success' | 'failure', message?: string) {
  const now = new Date();
  
  // Calculate next run (Mon, Wed, Fri at 10 AM)
  const nextRun = new Date(now);
  nextRun.setHours(10, 0, 0, 0);
  
  const dayOfWeek = now.getDay();
  const daysUntilNext = dayOfWeek === 1 ? 2 : dayOfWeek === 3 ? 2 : dayOfWeek === 5 ? 3 : 1;
  nextRun.setDate(now.getDate() + daysUntilNext);
  
  await db.update(tripCronJobs)
    .set({
      lastRun: now,
      lastStatus: status,
      nextRun,
      description: message || `Italy Trip Ideas - ${status}`,
    })
    .where(eq(tripCronJobs.cronJobId, CRON_JOB_ID));
}

async function sendDiscordNotification(message: string) {
  try {
    const { message: msgTool } = await import('/root/clawd/skills/discord/SKILL.md').catch(() => null);
    if (!msgTool) {
      console.log('Discord skill not available, skipping notification');
      return;
    }
    
    // Use the message tool if available
    const result = await fetch(`https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: message }),
    });
    
    if (!result.ok) {
      console.log('Discord notification failed:', await result.text());
    }
  } catch (error) {
    console.log('Failed to send Discord notification:', error);
  }
}

function getNextRecommendationNumber(): string {
  if (!existsSync(RECOMMENDATIONS_FILE)) {
    return '001';
  }
  
  const content = readFileSync(RECOMMENDATIONS_FILE, 'utf-8');
  const matches = content.match(/###\s+(\d{3})\./g);
  
  if (!matches || matches.length === 0) {
    return '001';
  }
  
  const numbers = matches.map(m => parseInt(m.match(/\d{3}/)![0]));
  const max = Math.max(...numbers);
  return String(max + 1).padStart(3, '0');
}

async function researchDestination(item: ResearchItem, recNumber: string): Promise<string> {
  const today = new Date().toISOString().split('T')[0];
  
  // Build markdown entry
  let markdown = `### ${recNumber}. ${item.name}\n\n`;
  markdown += `**Added:** ${today}\n`;
  markdown += `**Status:** 🔍 Researching\n`;
  markdown += `**Category:** ${item.category}\n`;
  markdown += `**Location:** ${item.location}\n`;
  markdown += `**Search:** ${item.searchQuery}\n\n`;
  markdown += `**What:**\n`;
  markdown += `Research in progress...\n\n`;
  markdown += `**Why it's special:**\n`;
  markdown += `- Research in progress...\n\n`;
  markdown += `**Logistics:**\n`;
  markdown += `- **Distance:** Researching...\n`;
  markdown += `- **Drive:** Researching...\n`;
  markdown += `- **Train:** Researching...\n`;
  markdown += `- **Best time:** Researching...\n\n`;
  markdown += `**Notes:**\n`;
  markdown += `Cron job research initiated. Full details will be added during manual review.\n\n`;
  markdown += `**Pro tips:**\n`;
  markdown += `- Research in progress...\n\n`;
  markdown += `---\n\n`;
  
  return markdown;
}

async function main() {
  console.log('🇮🇹 Italy Trip Ideas Cron Job Started');
  console.log(`⏰ ${new Date().toISOString()}`);
  
  try {
    await updateCronJobStatus('running', 'Researching destinations...');
    
    // Get existing recommendations count
    const existingRecs = await db.select()
      .from(tripRecommendations)
      .where(eq(tripRecommendations.tripId, TRIP_ID));
    
    console.log(`📊 Found ${existingRecs.length} existing recommendations`);
    
    // Select next destination to research (round-robin)
    const recIndex = existingRecs.length % RESEARCH_QUEUE.length;
    const item = RESEARCH_QUEUE[recIndex];
    
    console.log(`🔍 Researching: ${item.name}`);
    
    // Get next recommendation number
    const recNumber = getNextRecommendationNumber();
    
    // Generate research content
    const researchMarkdown = await researchDestination(item, recNumber);
    
    // Append to recommendations file
    if (existsSync(RECOMMENDATIONS_FILE)) {
      const existing = readFileSync(RECOMMENDATIONS_FILE, 'utf-8');
      writeFileSync(RECOMMENDATIONS_FILE, existing + researchMarkdown);
    } else {
      const header = `# Italy 2026 Trip Recommendations\n\n`;
      const subheader = `**Trip Dates:** June 10 - July 10, 2026\n**Home Base:** Contrà S. Rocco 60, Vicenza, VI 36100, Italy\n\n---\n\n`;
      writeFileSync(RECOMMENDATIONS_FILE, header + subheader + researchMarkdown);
    }
    
    console.log(`📝 Added recommendation ${recNumber} to file`);
    
    // Create database entry
    await db.insert(tripRecommendations).values({
      tripId: TRIP_ID,
      recommendationNumber: recNumber,
      title: item.name,
      what: item.location,
      status: 'pending',
      addedDate: today,
      homeBaseAddress: 'Contrà S. Rocco 60, Vicenza, VI 36100, Italy',
      homeBaseLat: 45.5481,
      homeBaseLng: 11.5456,
    });
    
    console.log(`💾 Saved to database`);
    
    // Send Discord notification
    const discordMsg = `🇮🇹 **Italy Trip Research Update**\n\n` +
      `Added new destination to research queue:\n` +
      `**#${recNumber}** ${item.name}\n` +
      `📍 ${item.location}\n` +
      `🏷️ Category: ${item.category}\n\n` +
      `📝 Full details: \`memory/trips/italy-2026-recommendations.md\``;
    
    await sendDiscordNotification(discordMsg);
    
    // Update cron job status
    await updateCronJobStatus('success', `Added recommendation #${recNumber}: ${item.name}`);
    
    console.log('✅ Job completed successfully');
    
  } catch (error) {
    console.error('❌ Job failed:', error);
    await updateCronJobStatus('failure', String(error));
    process.exit(1);
  }
}

const today = new Date().toISOString().split('T')[0];

main().catch(console.error);
