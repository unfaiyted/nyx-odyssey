/**
 * Vegas F1 Fan Zone & Off-Track Events — Seed destination_highlights and destination_events
 * Usage: bun run scripts/seed-vegas-fan-zone-events.ts
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
  console.log('🎰 Seeding Vegas F1 fan zone & off-track events...\n');

  // Get current highest orderIndex for highlights
  const existingHighlights = await db.select().from(schema.destinationHighlights)
    .where(eq(schema.destinationHighlights.destinationId, VEGAS_DEST_ID))
    .orderBy(schema.destinationHighlights.orderIndex);

  let nextOrder = existingHighlights.length > 0
    ? Math.max(...existingHighlights.map(h => h.orderIndex ?? 0)) + 1
    : 0;

  // ── Destination Highlights (Fan Zone & Off-Track Activities) ──
  const highlights = [
    {
      destinationId: VEGAS_DEST_ID,
      title: 'F1 Fan Zone — Official Circuit Experience',
      description: 'Massive fan area inside the circuit grounds, included with any race ticket. Features team activations, F1 simulators, DJ stages, merchandise superstore, food village, autograph sessions, and photo ops with show cars and trophies. Opens 3-4 hours before first session daily.',
      category: 'activity',
      rating: 4.5,
      priceLevel: 1,
      address: 'Las Vegas Strip Circuit, Las Vegas, NV',
      lat: 36.1162,
      lng: -115.1745,
      websiteUrl: 'https://www.f1lasvegasgp.com',
      duration: '3-5 hours',
      orderIndex: nextOrder++,
    },
    {
      destinationId: VEGAS_DEST_ID,
      title: 'Pit Lane Walk — Thursday Race Week',
      description: 'Walk down the actual F1 pit lane, see team garages up close, and get within feet of the cars. Usually available Thursday afternoon before track goes live. Often included with 3-day ticket packages. Limited capacity — arrive early. Separate tickets ~$50-100 if sold individually.',
      category: 'activity',
      rating: 4.8,
      priceLevel: 1,
      address: 'Pit Lane, Las Vegas Strip Circuit',
      lat: 36.1170,
      lng: -115.1730,
      websiteUrl: 'https://www.f1lasvegasgp.com',
      duration: '1-2 hours',
      orderIndex: nextOrder++,
    },
    {
      destinationId: VEGAS_DEST_ID,
      title: 'Free Fan Festival / Grand Prix Plaza',
      description: 'Free public fan festival on or near the Strip (Wed-Thu of race week). No race ticket needed. Live entertainment, DJs, F1 show car demos, team merchandise pop-ups, interactive exhibits, food/drink vendors. Great way to soak up the F1 atmosphere without spending on tickets.',
      category: 'activity',
      rating: 4.2,
      priceLevel: 1,
      address: 'Las Vegas Strip (LINQ Promenade / Bellagio area)',
      lat: 36.1175,
      lng: -115.1710,
      websiteUrl: 'https://www.f1lasvegasgp.com',
      duration: '2-4 hours',
      orderIndex: nextOrder++,
    },
    {
      destinationId: VEGAS_DEST_ID,
      title: 'Sphere F1 Visuals — Free Viewing',
      description: 'The Las Vegas Sphere typically features spectacular F1-themed visuals on its exterior during race week. Visible from outside — completely free. Makes for incredible photos, especially at night. A uniquely Vegas F1 experience you won\'t get at any other Grand Prix.',
      category: 'attraction',
      rating: 4.5,
      priceLevel: 1,
      address: 'Sphere, 255 Sands Ave, Las Vegas, NV 89169',
      lat: 36.1207,
      lng: -115.1620,
      websiteUrl: 'https://www.thespherevegas.com',
      duration: '30 min - 1 hour',
      orderIndex: nextOrder++,
    },
    {
      destinationId: VEGAS_DEST_ID,
      title: 'Post-Race Nightclub After-Parties',
      description: 'The Strip\'s top nightclubs host official and unofficial F1 after-parties on race night. XS (Wynn), Hakkasan (MGM Grand), and Omnia (Caesars Palace) are typical hotspots. Energy is electric post-race. Covers $50-200+ during race week. Book tables early or arrive by midnight.',
      category: 'nightlife',
      rating: 4.3,
      priceLevel: 3,
      address: 'Various — Las Vegas Strip',
      lat: 36.1260,
      lng: -115.1650,
      duration: '3-5 hours',
      orderIndex: nextOrder++,
    },
    {
      destinationId: VEGAS_DEST_ID,
      title: 'Hotel F1 Viewing Parties',
      description: 'Several Strip hotels and restaurants offer race viewing parties with big screens, food & drink packages. Ranges from free (with F&B minimum) to $200+ for premium packages at Wynn, Bellagio, Cosmopolitan, or Fontainebleau. Great alternative if you want a different race night experience. Book early — they sell out.',
      category: 'activity',
      rating: 3.8,
      priceLevel: 2,
      address: 'Various Strip Hotels, Las Vegas, NV',
      lat: 36.1215,
      lng: -115.1690,
      duration: '3-4 hours',
      orderIndex: nextOrder++,
    },
  ];

  for (const h of highlights) {
    await db.insert(schema.destinationHighlights).values(h);
  }
  console.log(`✅ Added ${highlights.length} fan zone & off-track highlights`);

  // ── Destination Events ──
  const events = [
    {
      destinationId: VEGAS_DEST_ID,
      name: 'F1 Fan Festival / Grand Prix Plaza',
      description: 'Free public fan festival on the Strip with live entertainment, show car demos, merchandise, and interactive exhibits. No race ticket required.',
      eventType: 'festival',
      startDate: '2026-11-18',
      endDate: '2026-11-19',
      startTime: '14:00',
      endTime: '22:00',
      venue: 'Las Vegas Strip (LINQ / Bellagio area)',
      venueAddress: 'Las Vegas Blvd, Las Vegas, NV',
      status: 'researched',
      ticketUrl: 'https://www.f1lasvegasgp.com',
      ticketPriceFrom: 'Free',
      ticketPriceTo: 'Free',
      groupSize: 2,
      currency: 'USD',
      notes: 'FREE event. Exact location/dates announced ~3 months before race. Based on 2023-2025 pattern.',
    },
    {
      destinationId: VEGAS_DEST_ID,
      name: 'Pit Lane Walk',
      description: 'Walk down the actual F1 pit lane, see team garages, and get close to the cars. Often included with 3-day ticket packages.',
      eventType: 'tour',
      startDate: '2026-11-19',
      endDate: '2026-11-19',
      startTime: '14:00',
      endTime: '18:00',
      venue: 'Pit Lane — Las Vegas Strip Circuit',
      venueAddress: 'Las Vegas Strip Circuit',
      status: 'researched',
      ticketPriceFrom: 'Included',
      ticketPriceTo: '$100',
      groupSize: 2,
      currency: 'USD',
      notes: 'Usually included with 3-day passes. Separate tickets ~$50-100 if available. Limited capacity — arrive early.',
    },
    {
      destinationId: VEGAS_DEST_ID,
      name: 'Driver Autograph Sessions',
      description: 'Scheduled driver signing sessions in the Fan Zone. 4-6 drivers per day, 15-30 min windows. Free but capacity-limited — arrive 1-2 hours early for popular drivers.',
      eventType: 'other',
      startDate: '2026-11-19',
      endDate: '2026-11-20',
      startTime: '15:00',
      endTime: '19:00',
      venue: 'F1 Fan Zone',
      venueAddress: 'Las Vegas Strip Circuit',
      status: 'researched',
      ticketPriceFrom: 'Free',
      ticketPriceTo: 'Free',
      groupSize: 2,
      currency: 'USD',
      notes: 'Included with race ticket. Schedule announced via F1 app ~1 week before race. Get there early for Norris/Verstappen/Leclerc.',
    },
    {
      destinationId: VEGAS_DEST_ID,
      name: 'FIA Drivers\' Parade',
      description: 'Pre-race driver parade around the circuit. Drivers wave from trucks/classic cars. Best views from grandstands.',
      eventType: 'sports',
      startDate: '2026-11-21',
      endDate: '2026-11-21',
      startTime: '20:30',
      endTime: '21:00',
      venue: 'Las Vegas Strip Circuit',
      venueAddress: 'Las Vegas Strip Circuit',
      status: 'researched',
      ticketPriceFrom: 'Included',
      ticketPriceTo: 'Included',
      groupSize: 2,
      currency: 'USD',
      notes: 'Included with race ticket. Happens ~1.5 hours before race start.',
    },
    {
      destinationId: VEGAS_DEST_ID,
      name: 'F1 Fan Zone Live Entertainment',
      description: 'DJ sets, live music, and performances at stages throughout the Fan Zone. Past years featured major artists. Entertainment runs throughout each session day.',
      eventType: 'concert',
      startDate: '2026-11-19',
      endDate: '2026-11-21',
      startTime: '16:00',
      endTime: '23:00',
      venue: 'F1 Fan Zone Stages',
      venueAddress: 'Las Vegas Strip Circuit',
      status: 'researched',
      ticketPriceFrom: 'Included',
      ticketPriceTo: 'Included',
      groupSize: 2,
      currency: 'USD',
      notes: 'Included with race ticket. Artist lineup typically announced 1-2 months before race.',
    },
    {
      destinationId: VEGAS_DEST_ID,
      name: 'Post-Race After-Party (Nightclubs)',
      description: 'Official and unofficial F1 after-parties at Strip nightclubs — XS (Wynn), Hakkasan (MGM Grand), Omnia (Caesars). Electric atmosphere post-race.',
      eventType: 'performance',
      startDate: '2026-11-21',
      endDate: '2026-11-22',
      startTime: '23:30',
      endTime: '04:00',
      venue: 'XS Nightclub / Hakkasan / Omnia',
      venueAddress: 'Various Las Vegas Strip',
      status: 'researched',
      ticketPriceFrom: '$50',
      ticketPriceTo: '$200',
      groupSize: 2,
      currency: 'USD',
      notes: 'Separately ticketed. Book early — sells out. Table service recommended for couples. Budget ~$100-200/person.',
    },
  ];

  for (const e of events) {
    await db.insert(schema.destinationEvents).values(e);
  }
  console.log(`✅ Added ${events.length} fan zone & off-track events`);

  // ── Budget Items ──
  const budgetItems = [
    {
      tripId: TRIP_ID,
      category: 'activities',
      description: 'Post-race nightclub after-party (2 people)',
      estimatedCost: '200.00',
      date: '2026-11-21',
    },
    {
      tripId: TRIP_ID,
      category: 'activities',
      description: 'F1 Fan Zone food & drinks (3 days)',
      estimatedCost: '150.00',
      date: '2026-11-19',
    },
    {
      tripId: TRIP_ID,
      category: 'shopping',
      description: 'F1 Merchandise (Fan Zone & team shops)',
      estimatedCost: '200.00',
      date: '2026-11-19',
    },
  ];

  for (const b of budgetItems) {
    await db.insert(schema.budgetItems).values(b);
  }
  console.log(`✅ Added ${budgetItems.length} budget items for fan zone activities`);

  console.log('\n🏎️ Vegas F1 fan zone & off-track events seeded!');
  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
