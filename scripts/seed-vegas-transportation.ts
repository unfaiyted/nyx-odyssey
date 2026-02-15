/**
 * Vegas F1 2026 — Transportation research
 * Populates: destination_research (transport notes, tips), budget_items
 * Usage: bun run scripts/seed-vegas-transportation.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../src/db/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

const VEGAS_DEST_ID = 'Uz6JyIvdeg0h8bPYe8y7R';
const TRIP_ID = '2el8do_u2fmjxf5DU9bf1';

async function seed() {
  console.log('🚗 Seeding Vegas transportation research...\n');

  const transportNotes = `**Airport Transfers (LAS ↔ Strip — ~2 miles):**

🚗 **Rideshare (Uber/Lyft) — RECOMMENDED**
- $15-25 normal, $40-80+ during F1 surge
- 10-20 min normally, 30-60 min during closures
- Pickup: Level 2 at Terminals 1 & 3

🚕 **Taxi**
- Flat rate ~$23-27 to Strip hotels + tip
- No surge pricing — reliable during F1

🚐 **Shared Shuttle**
- $8-15/person, 20-45 min with stops

**Getting Around the Strip:**

🚶 **Walking — BEST OPTION**
- Strip is ~4.2 miles end-to-end
- November weather ideal (45-65°F)
- Pedestrian bridges connect major hotels
- During F1: designated pedestrian routes

🚝 **Monorail**
- MGM Grand → Sahara (east side of Strip)
- $5 single, $13 day pass
- Runs independent of road closures — F1-proof!

🚌 **Deuce Bus** — $8/24hr pass, runs full Strip + Fremont
- NOT recommended during F1 (road closures)

🆓 **Free Casino Trams**
- Aria ↔ Bellagio ↔ Park MGM
- Mandalay Bay ↔ Excalibur ↔ Luxor

🚗 **Rental Car — NOT RECOMMENDED**
- $40-80/day + $20-50/day parking = $400-800 total
- Strip closures make driving impractical during F1

**F1 Road Closures (Nov 17-22):**
- Strip closed Sands Ave to Harmon Ave during sessions
- Closures begin 6-8 hours before, last 2-3 hours after
- Race day (Sat Nov 21): ~2 PM to 1 AM closures
- I-15 stays open but Strip exits restricted
- Koval Lane, Frank Sinatra Dr also affected`;

  const travelTips = JSON.stringify([
    "Don't rent a car — F1 road closures make Strip driving impossible, and parking costs $20-50/day",
    "Walk the Strip — November weather is perfect (45-65°F) and most F1 venues are walkable",
    "Use the Monorail when the Strip is closed to cars — it runs independently of road closures",
    "Pre-schedule Uber/Lyft before and after F1 sessions to avoid peak surge pricing",
    "Airport taxi flat rate ($23-27) beats rideshare surge pricing during F1 weekend",
    "Free casino trams connect Aria↔Bellagio↔Park MGM and Mandalay Bay↔Excalibur↔Luxor",
    "Budget $200 total for all transportation (airport transfers + rideshare + monorail)",
    "After the race Saturday night, expect 1-2 hour rideshare waits — walk to hotel or wait at a bar",
    "Leave 2x normal travel time for any car-based transport during race week",
    "Download the F1 Las Vegas app for real-time road closure info and pedestrian routing",
    "Book a hotel walkable to the circuit to minimize transport hassle and cost",
    "Pedestrian bridges are your best friend for crossing the Strip during F1 closures",
  ]);

  // Upsert destination_research transport data
  const existing = await db.select().from(schema.destinationResearch)
    .where(eq(schema.destinationResearch.destinationId, VEGAS_DEST_ID));

  if (existing.length > 0) {
    await db.update(schema.destinationResearch)
      .set({
        transportNotes,
        travelTips,
        nearestAirport: 'LAS (Harry Reid International Airport)',
        updatedAt: new Date(),
      })
      .where(eq(schema.destinationResearch.destinationId, VEGAS_DEST_ID));
    console.log('✅ Updated destination_research with transport notes');
  } else {
    await db.insert(schema.destinationResearch).values({
      destinationId: VEGAS_DEST_ID,
      country: 'United States',
      region: 'Nevada',
      timezone: 'America/Los_Angeles',
      language: 'English',
      currency: 'USD',
      nearestAirport: 'LAS (Harry Reid International Airport)',
      transportNotes,
      travelTips,
      safetyRating: 3,
      safetyNotes: 'Generally safe on the Strip and in tourist areas. Stay aware in less-trafficked side streets at night. Keep valuables secure in crowds during F1 events.',
    });
    console.log('✅ Created destination_research with transport notes');
  }

  // Add transport budget items
  const transportBudgetItems = [
    {
      tripId: TRIP_ID,
      category: 'transport',
      description: 'Airport transfers — Uber/Lyft round trip (2 people)',
      estimatedCost: '60.00',
      date: '2026-11-17',
    },
    {
      tripId: TRIP_ID,
      category: 'transport',
      description: 'Rideshare during trip — Strip & off-Strip rides (5 days)',
      estimatedCost: '100.00',
    },
    {
      tripId: TRIP_ID,
      category: 'transport',
      description: 'Monorail day passes (2 days)',
      estimatedCost: '26.00',
    },
  ];

  for (const item of transportBudgetItems) {
    await db.insert(schema.budgetItems).values(item);
  }
  console.log(`✅ Added ${transportBudgetItems.length} transport budget items (total: $186)`);

  console.log('\n🚗 Vegas transportation research seeded!');
  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
