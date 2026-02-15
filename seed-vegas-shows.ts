/**
 * Vegas F1 2026 — Shows & Entertainment Research
 * Populates destination_events for shows during Nov 17-22, 2026
 * Usage: bun run scripts/seed-vegas-shows.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../src/db/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

const VEGAS_DEST_ID = 'Uz6JyIvdeg0h8bPYe8y7R';
const TRIP_ID = '2el8do_u2fmjxf5DU9bf1';

async function seedVegasShows() {
  console.log('🎭 Seeding Vegas shows & entertainment...\n');

  const events = [
    {
      destinationId: VEGAS_DEST_ID,
      name: '"O" by Cirque du Soleil',
      description: 'Water-themed acrobatic spectacular at Bellagio. Widely considered the best Cirque show — visually stunning, romantic, artistic. The water stage is breathtaking. 90 min, no intermission.',
      eventType: 'performance',
      startDate: '2026-11-18',
      startTime: '19:00',
      endTime: '20:30',
      venue: 'Bellagio - O Theatre',
      venueAddress: '3600 S Las Vegas Blvd, Las Vegas, NV 89109',
      status: 'interested',
      ticketUrl: 'https://www.cirquedusoleil.com/o',
      ticketPriceFrom: '110',
      ticketPriceTo: '260',
      groupSize: 2,
      totalCost: '400.00',
      currency: 'USD',
      notes: 'TOP PICK for Gretchen — romantic and artistic. Book 2-3 months ahead for best seats. Wed Nov 18 evening recommended.',
    },
    {
      destinationId: VEGAS_DEST_ID,
      name: 'Absinthe',
      description: 'Raunchy, hilarious circus/variety show in an intimate spiegeltent at Caesars Palace. Consistently rated #1 Vegas show. Edgy, funny, totally unique.',
      eventType: 'performance',
      startDate: '2026-11-19',
      startTime: '20:00',
      endTime: '21:40',
      venue: 'Caesars Palace - Spiegeltent',
      venueAddress: '3570 S Las Vegas Blvd, Las Vegas, NV 89109',
      status: 'interested',
      ticketUrl: 'https://www.vegas.com/shows/production/absinthe-las-vegas/',
      ticketPriceFrom: '103',
      ticketPriceTo: '200',
      groupSize: 2,
      totalCost: '300.00',
      currency: 'USD',
      notes: 'TOP PICK — edgy comedy + circus. Great date night. Thu Nov 19 suggested.',
    },
    {
      destinationId: VEGAS_DEST_ID,
      name: 'Mystère by Cirque du Soleil',
      description: 'Classic Cirque du Soleil — the original Vegas residency since 1993. High energy, whimsical, great acrobatics. 90 min.',
      eventType: 'performance',
      startDate: '2026-11-18',
      startTime: '19:00',
      endTime: '20:30',
      venue: 'Treasure Island - Mystère Theatre',
      venueAddress: '3300 S Las Vegas Blvd, Las Vegas, NV 89109',
      status: 'researched',
      ticketUrl: 'https://www.cirquedusoleil.com/mystere',
      ticketPriceFrom: '69',
      ticketPriceTo: '155',
      groupSize: 2,
      totalCost: '220.00',
      currency: 'USD',
      notes: 'Budget-friendly Cirque option. Good alternative to "O".',
    },
    {
      destinationId: VEGAS_DEST_ID,
      name: 'KÀ by Cirque du Soleil',
      description: 'Epic martial arts & acrobatics on a massive rotating stage at MGM Grand. Most theatrical Cirque show.',
      eventType: 'performance',
      startDate: '2026-11-18',
      startTime: '19:00',
      endTime: '20:30',
      venue: 'MGM Grand - KÀ Theatre',
      venueAddress: '3799 S Las Vegas Blvd, Las Vegas, NV 89109',
      status: 'researched',
      ticketUrl: 'https://www.cirquedusoleil.com/ka',
      ticketPriceFrom: '69',
      ticketPriceTo: '175',
      groupSize: 2,
      totalCost: '250.00',
      currency: 'USD',
      notes: 'Great for action lovers. Rotating stage is impressive.',
    },
    {
      destinationId: VEGAS_DEST_ID,
      name: 'Michael Jackson ONE',
      description: 'MJ tribute combining Cirque du Soleil acrobatics with Michael Jackson music at Mandalay Bay.',
      eventType: 'performance',
      startDate: '2026-11-19',
      startTime: '19:00',
      endTime: '20:30',
      venue: 'Mandalay Bay - Michael Jackson ONE Theatre',
      venueAddress: '3950 S Las Vegas Blvd, Las Vegas, NV 89119',
      status: 'researched',
      ticketUrl: 'https://www.cirquedusoleil.com/michael-jackson-one',
      ticketPriceFrom: '69',
      ticketPriceTo: '180',
      groupSize: 2,
      totalCost: '260.00',
      currency: 'USD',
      notes: 'Fun if you love MJ music.',
    },
    {
      destinationId: VEGAS_DEST_ID,
      name: 'Penn & Teller',
      description: 'Legendary magic and comedy duo. They do meet & greets after every show.',
      eventType: 'performance',
      startDate: '2026-11-19',
      startTime: '21:00',
      endTime: '22:30',
      venue: 'Rio - Penn & Teller Theater',
      venueAddress: '3700 W Flamingo Rd, Las Vegas, NV 89103',
      status: 'researched',
      ticketUrl: 'https://www.vegas.com/shows/magic/penn-and-teller-las-vegas/',
      ticketPriceFrom: '62',
      ticketPriceTo: '130',
      groupSize: 2,
      totalCost: '180.00',
      currency: 'USD',
      notes: 'Post-show meet & greet is a great perk.',
    },
    {
      destinationId: VEGAS_DEST_ID,
      name: 'David Copperfield',
      description: 'The GOAT of magic, still performing nightly at MGM Grand.',
      eventType: 'performance',
      startDate: '2026-11-18',
      startTime: '19:00',
      endTime: '20:30',
      venue: 'MGM Grand - David Copperfield Theater',
      venueAddress: '3799 S Las Vegas Blvd, Las Vegas, NV 89109',
      status: 'researched',
      ticketUrl: 'https://www.vegas.com/shows/magic/david-copperfield/',
      ticketPriceFrom: '75',
      ticketPriceTo: '160',
      groupSize: 2,
      totalCost: '240.00',
      currency: 'USD',
      notes: 'Iconic Vegas experience.',
    },
    {
      destinationId: VEGAS_DEST_ID,
      name: 'F1 Las Vegas Grand Prix 2026 — Fan Zone Entertainment',
      description: 'Live music, DJ sets, celebrity appearances, and brand activations in the F1 Fan Zone during race weekend. Free with F1 ticket.',
      eventType: 'festival',
      startDate: '2026-11-20',
      endDate: '2026-11-21',
      startTime: '14:00',
      endTime: '23:00',
      venue: 'Las Vegas Strip - F1 Fan Zone',
      venueAddress: 'Las Vegas Blvd, Las Vegas, NV 89109',
      status: 'researched',
      ticketPriceFrom: '0',
      ticketPriceTo: '0',
      groupSize: 2,
      currency: 'USD',
      notes: 'Included with F1 tickets. Past years featured major DJs and opening ceremony concerts. Specific 2026 lineup TBA Summer 2026.',
    },
    {
      destinationId: VEGAS_DEST_ID,
      name: 'Comedy Cellar',
      description: 'Rotating lineup of top comedians at the Rio. Great value for a comedy night.',
      eventType: 'performance',
      startDate: '2026-11-17',
      startTime: '19:30',
      endTime: '21:00',
      venue: 'Rio - Comedy Cellar',
      venueAddress: '3700 W Flamingo Rd, Las Vegas, NV 89103',
      status: 'researched',
      ticketUrl: 'https://www.vegas.com/shows/comedy/comedy-cellar/',
      ticketPriceFrom: '30',
      ticketPriceTo: '50',
      groupSize: 2,
      totalCost: '70.00',
      currency: 'USD',
      notes: 'Good arrival-night option. Low commitment, great laughs.',
    },
    {
      destinationId: VEGAS_DEST_ID,
      name: 'The Sphere Experience (TBA)',
      description: 'Immersive concert/experience at the Sphere. The most technologically advanced entertainment venue in the world. Check for Nov 2026 residency announcements.',
      eventType: 'concert',
      startDate: '2026-11-18',
      endDate: '2026-11-20',
      startTime: '20:00',
      venue: 'The Sphere',
      venueAddress: '255 Sands Ave, Las Vegas, NV 89169',
      status: 'researched',
      ticketUrl: 'https://www.thespherevegas.com',
      ticketPriceFrom: '100',
      ticketPriceTo: '500',
      groupSize: 2,
      currency: 'USD',
      notes: 'MUST CHECK in Summer 2026 for specific acts. If a good artist is playing, this is unmissable — the venue itself is the experience.',
    },
  ];

  // Insert events
  for (const event of events) {
    await db.insert(schema.destinationEvents).values(event).onConflictDoNothing();
    console.log(`  ✅ ${event.name}`);
  }

  // Also add budget items for entertainment
  const budgetItems = [
    {
      tripId: TRIP_ID,
      category: 'entertainment',
      description: 'Show tickets (2 shows × 2 people — e.g. "O" + Absinthe)',
      estimatedCost: '700.00',
      currency: 'USD',
      notes: 'Top picks: "O" at Bellagio ($400/pair) + Absinthe ($300/pair)',
    },
    {
      tripId: TRIP_ID,
      category: 'entertainment',
      description: 'Optional: Comedy show or Sphere experience',
      estimatedCost: '200.00',
      currency: 'USD',
      notes: 'Comedy Cellar ~$70/pair or upgrade to Sphere if good act is playing',
    },
  ];

  for (const item of budgetItems) {
    await db.insert(schema.budgetItems).values(item).onConflictDoNothing();
    console.log(`  💰 Budget: ${item.description}`);
  }

  console.log('\n🎭 Vegas shows & entertainment seeded successfully!');
  await client.end();
}

seedVegasShows().catch(console.error);
