/**
 * Vegas F1 2026 — F1 Ticket Research
 * Populates: destination_events (ticket tiers as events), budget_items, destination_highlights
 * Usage: bun run scripts/seed-vegas-f1-tickets.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';
import * as schema from '../src/db/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

const TRIP_ID = '2el8do_u2fmjxf5DU9bf1';
const VEGAS_DEST_ID = 'Uz6JyIvdeg0h8bPYe8y7R';

async function seedF1Tickets() {
  console.log('🏎️ Seeding Vegas F1 2026 ticket research...\n');

  // --- Destination Events (F1 ticket tiers) ---
  const ticketTiers = [
    {
      name: 'F1 Las Vegas GP — General Admission (3-Day)',
      description: 'Standing room in designated zones along the circuit. No assigned seat. Cheapest option but need to arrive early for good spots. Cold November nights — dress warm.',
      eventType: 'sports' as const,
      startDate: '2026-11-19',
      endDate: '2026-11-21',
      startTime: '14:00',
      venue: 'Las Vegas Strip Circuit',
      venueAddress: 'Las Vegas Blvd, Las Vegas, NV 89109',
      status: 'researched' as const,
      ticketUrl: 'https://www.f1lasvegasgp.com/tickets',
      ticketPriceFrom: '200',
      ticketPriceTo: '400',
      groupSize: 2,
      totalCost: '600',
      currency: 'USD',
      notes: 'Budget option. Prices dropped significantly since 2023 launch. Standing only — no seats. Best value if comfortable standing for hours in ~45°F weather.',
    },
    {
      name: 'F1 Las Vegas GP — Turn 1 Grandstand (3-Day)',
      description: 'Assigned grandstand seating at Turn 1 heavy braking zone. Best on-track action with frequent overtaking opportunities. RECOMMENDED best value option.',
      eventType: 'sports' as const,
      startDate: '2026-11-19',
      endDate: '2026-11-21',
      startTime: '14:00',
      venue: 'Las Vegas Strip Circuit — Turn 1',
      venueAddress: 'Las Vegas Blvd, Las Vegas, NV 89109',
      status: 'researched' as const,
      ticketUrl: 'https://www.f1lasvegasgp.com/tickets',
      ticketPriceFrom: '400',
      ticketPriceTo: '700',
      groupSize: 2,
      totalCost: '1100',
      currency: 'USD',
      notes: '⭐ BEST VALUE — Great overtaking action, assigned seats, reasonable price. Recommended for first-time F1 attendees.',
    },
    {
      name: 'F1 Las Vegas GP — Sphere Grandstand (3-Day)',
      description: 'Grandstand seating with the MSG Sphere as backdrop. Most iconic and Instagrammable view unique to Vegas GP. Sphere puts on light shows during the race.',
      eventType: 'sports' as const,
      startDate: '2026-11-19',
      endDate: '2026-11-21',
      startTime: '14:00',
      venue: 'Las Vegas Strip Circuit — Sphere Zone (T5-T7)',
      venueAddress: 'Las Vegas Blvd, Las Vegas, NV 89109',
      status: 'researched' as const,
      ticketUrl: 'https://www.f1lasvegasgp.com/tickets',
      ticketPriceFrom: '500',
      ticketPriceTo: '900',
      groupSize: 2,
      totalCost: '1400',
      currency: 'USD',
      notes: '⭐ BEST EXPERIENCE — Iconic Sphere backdrop, unique to Vegas. Great for photos and the "wow factor". Premium over Turn 1 but worth it for the spectacle.',
    },
    {
      name: 'F1 Las Vegas GP — Las Vegas Blvd Grandstand (3-Day)',
      description: 'Grandstand seating along the famous Las Vegas Strip. Cars blast past iconic casinos and hotels at high speed on the DRS straight.',
      eventType: 'sports' as const,
      startDate: '2026-11-19',
      endDate: '2026-11-21',
      startTime: '14:00',
      venue: 'Las Vegas Strip Circuit — Las Vegas Blvd Straight',
      venueAddress: 'Las Vegas Blvd, Las Vegas, NV 89109',
      status: 'researched' as const,
      ticketUrl: 'https://www.f1lasvegasgp.com/tickets',
      ticketPriceFrom: '500',
      ticketPriceTo: '1000',
      groupSize: 2,
      totalCost: '1500',
      currency: 'USD',
      notes: 'Peak Vegas atmosphere with neon backdrop. Cars pass very quickly though (high-speed DRS zone). Great for the experience, less for watching racing lines.',
    },
    {
      name: 'F1 Las Vegas GP — Champions Club Hospitality (3-Day)',
      description: 'Premium hospitality package with covered lounge, open bar, gourmet dining, and premium grandstand seats. All-inclusive F1 experience.',
      eventType: 'sports' as const,
      startDate: '2026-11-19',
      endDate: '2026-11-21',
      startTime: '14:00',
      venue: 'Las Vegas Strip Circuit — Champions Club',
      venueAddress: 'Las Vegas Blvd, Las Vegas, NV 89109',
      status: 'researched' as const,
      ticketUrl: 'https://f1experiences.com',
      ticketPriceFrom: '2500',
      ticketPriceTo: '5000',
      groupSize: 2,
      totalCost: '7500',
      currency: 'USD',
      notes: 'Splurge option. All-inclusive food/drink saves on F1 weekend food costs. Comfortable and premium but significant investment.',
    },
    {
      name: 'F1 Las Vegas GP — Paddock Club (3-Day)',
      description: 'Ultimate F1 hospitality: pit lane walks, premium open bar, gourmet dining, celebrity appearances, best viewing positions. The full VIP experience.',
      eventType: 'sports' as const,
      startDate: '2026-11-19',
      endDate: '2026-11-21',
      startTime: '14:00',
      venue: 'Las Vegas Strip Circuit — Paddock Club',
      venueAddress: 'Las Vegas Blvd, Las Vegas, NV 89109',
      status: 'researched' as const,
      ticketUrl: 'https://f1experiences.com',
      ticketPriceFrom: '5000',
      ticketPriceTo: '8000',
      groupSize: 2,
      totalCost: '13000',
      currency: 'USD',
      notes: 'Ultimate experience but very expensive. Pit lane access, meet drivers possibility. Only if budget allows.',
    },
  ];

  for (const tier of ticketTiers) {
    await db.insert(schema.destinationEvents).values({
      destinationId: VEGAS_DEST_ID,
      ...tier,
    });
    console.log(`  ✅ Added: ${tier.name} ($${tier.ticketPriceFrom}-${tier.ticketPriceTo}/person)`);
  }

  // --- Budget Items for recommended ticket option ---
  const budgetItems = [
    {
      tripId: TRIP_ID,
      category: 'activities',
      description: 'F1 Las Vegas GP Tickets — Sphere or Turn 1 Grandstand (2 people, 3-day)',
      estimatedCost: '1400',
      date: '2026-11-19',
    },
  ];

  for (const item of budgetItems) {
    await db.insert(schema.budgetItems).values(item);
    console.log(`  💰 Budget: ${item.description} — $${item.estimatedCost}`);
  }

  // --- Destination Highlight for F1 GP ---
  await db.insert(schema.destinationHighlights).values({
    destinationId: VEGAS_DEST_ID,
    title: 'Formula 1 Las Vegas Grand Prix',
    description: 'Saturday night F1 race on the Las Vegas Strip Circuit — a 6.2km, 17-turn street circuit past iconic locations like Caesars Palace, Bellagio, and the Venetian. Night race under the lights with the Sphere as a stunning backdrop. Average speeds similar to Monza. 2026 race is Saturday Nov 21 at ~10 PM.',
    category: 'activity',
    rating: 5.0,
    priceLevel: 3,
    address: 'Las Vegas Strip Circuit, Las Vegas Blvd, NV 89109',
    lat: 36.1215,
    lng: -115.1739,
    websiteUrl: 'https://www.f1lasvegasgp.com',
    duration: '3 days (Nov 19-21)',
    orderIndex: 0,
  });
  console.log('  🏁 Added F1 GP as destination highlight');

  console.log('\n✅ Vegas F1 ticket research seeded successfully!');
  await client.end();
}

seedF1Tickets().catch(console.error);
