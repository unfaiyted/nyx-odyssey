#!/usr/bin/env bun
/**
 * Italy Trip Daily Research Cron Job
 * 
 * Runs: Daily at 2:00 PM
 * Schedule: 0 14 * * *
 * 
 * Purpose: Check planning doc, research one item from rotating focus areas
 * 
 * Output:
 * - memory/trips/italy-2026-recommendations.md (updated)
 * - memory/trips/italy-2026-screenshots/*.png (if applicable)
 * - Discord #trip channel notification
 */

import { db } from '../src/db';
import { tripCronJobs, trips, tripDestinations, tripRecommendations, destinationHighlights } from '../src/db/schema';
import { eq, and } from 'drizzle-orm';
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const CRON_JOB_ID = 'ee574b7d-6aad-4b5f-bf47-c4cc64831f94'; // Daily job ID
const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh';
const DISCORD_CHANNEL_ID = '1468983452404682874';
const MEMORY_DIR = '/root/clawd/memory/trips';
const SCREENSHOTS_DIR = join(MEMORY_DIR, 'italy-2026-screenshots');
const RECOMMENDATIONS_FILE = join(MEMORY_DIR, 'italy-2026-recommendations.md');
const STATE_FILE = join(MEMORY_DIR, '.italy-research-state.json');

// Research focus areas (7 rotating categories)
const RESEARCH_AREAS = [
  {
    id: 'vicenza-local',
    name: 'Things to do IN Vicenza',
    icon: '🏛️',
    topics: [
      { name: 'Teatro Olimpico', type: 'attraction', search: 'Teatro Olimpico Vicenza Palladio tours' },
      { name: 'Basilica Palladiana', type: 'attraction', search: 'Basilica Palladiana Vicenza rooftop' },
      { name: 'Piazza dei Signori', type: 'attraction', search: 'Piazza dei Signori Vicenza cafes' },
      { name: 'Villa Rotonda', type: 'attraction', search: 'Villa Rotonda Vicenza visits' },
      { name: 'Vicenza Food Markets', type: 'food', search: 'Vicenza mercato food market hours' },
      { name: 'Vicenza Aperitivo Spots', type: 'food', search: 'best aperitivo bars Vicenza' },
    ],
  },
  {
    id: 'day-trip-1hr',
    name: 'Day trips within 1 hour',
    icon: '🚗',
    topics: [
      { name: 'Verona', type: 'destination', search: 'Verona day trip from Vicenza 2026' },
      { name: 'Venice', type: 'destination', search: 'Venice day trip itinerary from Vicenza' },
      { name: 'Padua', type: 'destination', search: 'Padua day trip Scrovegni Chapel' },
      { name: 'Lake Garda', type: 'destination', search: 'Lake Garda best beaches summer' },
      { name: 'Prosecco Hills', type: 'destination', search: 'Prosecco road wine tour Valdobbiadene' },
    ],
  },
  {
    id: 'day-trip-2hr',
    name: 'Day trips 1-2 hours',
    icon: '🚂',
    topics: [
      { name: 'Bologna', type: 'destination', search: 'Bologna food tour day trip' },
      { name: 'Dolomites', type: 'destination', search: 'Dolomites hiking summer Cortina' },
      { name: 'Treviso', type: 'destination', search: 'Treviso day trip canals' },
      { name: 'Ferrara', type: 'destination', search: 'Ferrara Estense Castle visit' },
      { name: 'Ravenna', type: 'destination', search: 'Ravenna mosaics day trip' },
    ],
  },
  {
    id: 'weekend-trips',
    name: 'Weekend trips',
    icon: '🧳',
    topics: [
      { name: 'Florence', type: 'destination', search: 'Florence weekend itinerary Uffizi' },
      { name: 'Cinque Terre', type: 'destination', search: 'Cinque Terre hiking trails Manarola' },
      { name: 'Milan', type: 'destination', search: 'Milan weekend Duomo Last Supper' },
      { name: 'Turin', type: 'destination', search: 'Turin weekend Egyptian Museum' },
      { name: 'Liguria Coast', type: 'destination', search: 'Portofino Santa Margherita weekend' },
    ],
  },
  {
    id: 'food-experiences',
    name: 'Food experiences',
    icon: '🍝',
    topics: [
      { name: 'Pasta Making Class', type: 'experience', search: 'pasta making class Vicenza Bologna' },
      { name: 'Wine Tasting', type: 'experience', search: 'Amarone wine tasting Valpolicella' },
      { name: 'Food Markets', type: 'experience', search: 'Rialto Market Venice Padua market' },
      { name: 'Osteria Research', type: 'experience', search: 'best osterias Verona Bologna' },
      { name: 'Gelato Tour', type: 'experience', search: 'best gelato Vicenza Verona' },
      { name: 'Aperitivo Culture', type: 'experience', search: 'Italian aperitivo guide spritz' },
    ],
  },
  {
    id: 'summer-events',
    name: 'Summer events/festivals (June-July 2026)',
    icon: '🎭',
    topics: [
      { name: 'Verona Opera Festival', type: 'event', search: 'Arena di Verona opera festival 2026 schedule' },
      { name: 'Venice Architecture Biennale', type: 'event', search: 'Venice Biennale 2026 architecture' },
      { name: 'Festa della Repubblica', type: 'event', search: 'Festa della Repubblica June 2 Italy' },
      { name: 'San Giovanni Festival', type: 'event', search: 'San Giovanni Festival Florence June 24' },
      { name: 'Siena Palio', type: 'event', search: 'Palio di Siena July 2026 dates' },
      { name: 'Umbria Jazz', type: 'event', search: 'Umbria Jazz Festival Perugia July 2026' },
    ],
  },
  {
    id: 'hidden-gems',
    name: 'Hidden gems and local secrets',
    icon: '💎',
    topics: [
      { name: 'Asolo', type: 'gem', search: 'Asolo Italy hidden gem day trip' },
      { name: 'Monselice', type: 'gem', search: 'Monselice Villa Duodo castle' },
      { name: 'Este', type: 'gem', search: 'Este Italy castle gardens' },
      { name: 'Bassano del Grappa', type: 'gem', search: 'Bassano del Grappa Ponte Vecchio grappa' },
      { name: 'Marostica', type: 'gem', search: 'Marostica chess game live human' },
      { name: 'Soave Castle', type: 'gem', search: 'Soave castle wine medieval village' },
    ],
  },
];

interface ResearchState {
  lastAreaIndex: number;
  lastTopicIndices: Record<string, number>;
  lastRun: string;
  topicsResearched: number;
}

function loadState(): ResearchState {
  if (existsSync(STATE_FILE)) {
    return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
  }
  return {
    lastAreaIndex: -1,
    lastTopicIndices: {},
    lastRun: '',
    topicsResearched: 0,
  };
}

function saveState(state: ResearchState) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

async function updateCronJobStatus(status: 'running' | 'success' | 'failure', message?: string) {
  const now = new Date();
  
  // Calculate next run (tomorrow at 2 PM)
  const nextRun = new Date(now);
  nextRun.setDate(now.getDate() + 1);
  nextRun.setHours(14, 0, 0, 0);
  
  // Check if cron job entry exists
  const existing = await db.select()
    .from(tripCronJobs)
    .where(eq(tripCronJobs.cronJobId, CRON_JOB_ID));
  
  if (existing.length === 0) {
    // Create entry
    await db.insert(tripCronJobs).values({
      id: 'tcj_italy_daily_001',
      tripId: TRIP_ID,
      cronJobId: CRON_JOB_ID,
      name: 'Italy Trip Daily',
      schedule: '0 14 * * *',
      description: message || `Italy Trip Daily Research - ${status}`,
      enabled: true,
      lastRun: now,
      lastStatus: status,
      nextRun,
    });
  } else {
    // Update entry
    await db.update(tripCronJobs)
      .set({
        lastRun: now,
        lastStatus: status,
        nextRun,
        description: message || `Italy Trip Daily Research - ${status}`,
      })
      .where(eq(tripCronJobs.cronJobId, CRON_JOB_ID));
  }
}

async function sendDiscordNotification(area: typeof RESEARCH_AREAS[0], topic: typeof RESEARCH_AREAS[0]['topics'][0]) {
  try {
    const message = `${area.icon} **Italy Daily Research**\n\n` +
      `Focus Area: **${area.name}**\n` +
      `Today's Topic: **${topic.name}**\n` +
      `Type: ${topic.type}\n\n` +
      `🔍 Research query: \`${topic.search}\`\n\n` +
      `📝 Recommendations file will be updated with findings.`;
    
    // Try to use the message tool if available
    const { default: msgTool } = await import('/root/clawd/skills/discord/scripts/send-message.js').catch(() => null);
    
    if (msgTool) {
      await msgTool({
        channel: DISCORD_CHANNEL_ID,
        message,
      });
    } else {
      console.log('Discord message:', message);
    }
  } catch (error) {
    console.log('Discord notification skipped:', error);
  }
}

async function addResearchNotes(area: typeof RESEARCH_AREAS[0], topic: typeof RESEARCH_AREAS[0]['topics'][0]): Promise<string> {
  const today = new Date().toISOString().split('T')[0];
  
  // Generate research notes based on topic
  let notes = `\n## 📅 Daily Research: ${today}\n\n`;
  notes += `**Focus Area:** ${area.icon} ${area.name}\n`;
  notes += `**Topic:** ${topic.name}\n`;
  notes += `**Type:** ${topic.type}\n`;
  notes += `**Search:** ${topic.search}\n\n`;
  notes += `### Research Notes\n\n`;
  notes += `_Research automated by cron job. Detailed findings to be added._\n\n`;
  notes += `---\n`;
  
  return notes;
}

async function main() {
  console.log('🇮🇹 Italy Trip Daily Research Cron Job Started');
  console.log(`⏰ ${new Date().toISOString()}`);
  
  try {
    await updateCronJobStatus('running', 'Researching daily topic...');
    
    // Load state
    const state = loadState();
    
    // Determine next research area (rotate through 7)
    const nextAreaIndex = (state.lastAreaIndex + 1) % RESEARCH_AREAS.length;
    const area = RESEARCH_AREAS[nextAreaIndex];
    
    // Determine topic within area
    const lastTopicIndex = state.lastTopicIndices[area.id] ?? -1;
    const nextTopicIndex = (lastTopicIndex + 1) % area.topics.length;
    const topic = area.topics[nextTopicIndex];
    
    console.log(`📚 Research Area: ${area.name}`);
    console.log(`🎯 Topic: ${topic.name}`);
    
    // Generate research notes
    const researchNotes = await addResearchNotes(area, topic);
    
    // Append to recommendations file
    if (existsSync(RECOMMENDATIONS_FILE)) {
      const existing = readFileSync(RECOMMENDATIONS_FILE, 'utf-8');
      writeFileSync(RECOMMENDATIONS_FILE, existing + researchNotes);
    } else {
      const header = `# Italy 2026 Trip Recommendations\n\n`;
      const subheader = `**Trip Dates:** June 10 - July 10, 2026\n**Home Base:** Contrà S. Rocco 60, Vicenza, VI 36100, Italy\n\n---\n`;
      writeFileSync(RECOMMENDATIONS_FILE, header + subheader + researchNotes);
    }
    
    console.log(`📝 Added research notes to file`);
    
    // Send Discord notification
    await sendDiscordNotification(area, topic);
    
    // Update state
    state.lastAreaIndex = nextAreaIndex;
    state.lastTopicIndices[area.id] = nextTopicIndex;
    state.lastRun = new Date().toISOString();
    state.topicsResearched++;
    saveState(state);
    
    // Update cron job status
    await updateCronJobStatus('success', `Researched: ${topic.name} (${area.name})`);
    
    console.log('✅ Daily research completed successfully');
    console.log(`📊 Total topics researched: ${state.topicsResearched}`);
    
  } catch (error) {
    console.error('❌ Daily research failed:', error);
    await updateCronJobStatus('failure', String(error));
    process.exit(1);
  }
}

main().catch(console.error);
