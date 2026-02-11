/**
 * Seed script: Add Il Palio di Siena research data — tickets, accommodation, itinerary, budget.
 *
 * Enriches the existing Italy 2026 trip with detailed Palio planning for July 1-3, 2026.
 *
 * Usage:  bun scripts/seed-palio-siena.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../src/db/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seed() {
  console.log('🏇 Seeding Il Palio di Siena research data...\n');

  // ── Find existing Italy 2026 trip ────────────────────
  const [trip] = await db
    .select()
    .from(schema.trips)
    .where(eq(schema.trips.name, 'Italy 2026'))
    .limit(1);

  if (!trip) {
    console.error('❌ Italy 2026 trip not found. Run seed-italy-trip.ts first.');
    process.exit(1);
  }

  const tripId = trip.id;
  console.log(`  Found trip: ${trip.name} (${tripId})`);

  // ── Find or update Siena destination ─────────────────
  const [existingSiena] = await db
    .select()
    .from(schema.tripDestinations)
    .where(eq(schema.tripDestinations.tripId, tripId))
    .then((rows) => rows.filter((r) => r.name === 'Siena'));

  if (existingSiena) {
    await db
      .update(schema.tripDestinations)
      .set({
        description:
          'Il Palio di Siena — July 2, 2026. Medieval bareback horse race in Piazza del Campo. ' +
          '10 of 17 contrade (districts) compete in a 90-second race around the shell-shaped piazza. ' +
          'Dates back to 1644. The winning contrada celebrates for days. ' +
          'Free standing in the piazza center (arrive by 2pm, gates close ~3pm). ' +
          'Balcony seats €450-690. Full packages €1,495-4,045/person.',
        arrivalDate: '2026-07-01',
        departureDate: '2026-07-03',
        status: 'researched',
        researchStatus: 'researched',
      })
      .where(eq(schema.tripDestinations.id, existingSiena.id));
    console.log('  ✅ Updated Siena destination with Palio details');
  }

  // ── Accommodation options ────────────────────────────
  const accommodations = [
    {
      name: 'Hotel Santa Caterina ★★★',
      type: 'hotel' as const,
      status: 'researched' as const,
      address: 'Via Enea Silvio Piccolomini 7, 53100 Siena',
      checkIn: '2026-07-01',
      checkOut: '2026-07-03',
      costPerNight: '180.00',
      totalCost: '360.00',
      currency: 'EUR',
      bookingUrl: 'https://paliotours.com/palio-tickets-siena-2026',
      rating: 4.2,
      notes:
        'Part of Palio Tours package (from €1,495/person) includes: 3 nights, breakfast, ' +
        'grandstand seats, city tour w/ contrada museum, contrada dinner tickets, ' +
        'horse blessing + historical parade. Garden view rooms. ' +
        'Upgrades: +€50 balcony seats, +€175 grandstand start line, +€275 balcony start line.',
    },
    {
      name: 'Relais degli Angeli ★★★',
      type: 'hotel' as const,
      status: 'researched' as const,
      address: 'Via della Sapienza 40, 53100 Siena',
      checkIn: '2026-07-01',
      checkOut: '2026-07-03',
      costPerNight: '250.00',
      totalCost: '500.00',
      currency: 'EUR',
      bookingUrl: 'https://paliotours.com/palio-tickets-siena-2026',
      rating: 4.5,
      notes:
        'Package from €2,640/person: 4 nights, deluxe room, grandstand seats, ' +
        'city tour w/ contrada museum, contrada dinner + trial race tickets, ' +
        'horse blessing + historical parade. Boutique hotel in historic center.',
    },
    {
      name: 'Hotel Athena ★★★★',
      type: 'hotel' as const,
      status: 'researched' as const,
      address: 'Via Paolo Mascagni 55, 53100 Siena',
      checkIn: '2026-07-01',
      checkOut: '2026-07-03',
      costPerNight: '300.00',
      totalCost: '600.00',
      currency: 'EUR',
      bookingUrl: 'https://paliotours.com/palio-tickets-siena-2026',
      rating: 4.4,
      notes:
        'Package from €1,840/person: 3 nights, superior room, grandstand seats, ' +
        'city tour w/ contrada museum, contrada dinner, horse blessing + historical parade. ' +
        'Views of the Tuscan countryside. Walking distance to Piazza del Campo.',
    },
    {
      name: 'Airbnb / Agriturismo near Siena',
      type: 'airbnb' as const,
      status: 'researched' as const,
      address: 'Various — Siena outskirts / Chianti region',
      checkIn: '2026-07-01',
      checkOut: '2026-07-03',
      costPerNight: '120.00',
      totalCost: '240.00',
      currency: 'EUR',
      bookingUrl: 'https://www.airbnb.com/s/Siena--Italy',
      rating: null,
      notes:
        'Budget option: rent outside the city walls or in the Chianti countryside (15-30 min drive). ' +
        'Book tickets separately via paliodisiena.tickets or intuscany.net. ' +
        'Parking easier outside the ZTL (restricted traffic zone). ' +
        'NOTE: Book ASAP — Palio dates sell out months in advance.',
    },
  ];

  // Check if we already have Palio accommodations
  const existingAccomms = await db
    .select()
    .from(schema.accommodations)
    .where(eq(schema.accommodations.tripId, tripId))
    .then((rows) => rows.filter((r) => r.checkIn === '2026-07-01'));

  if (existingAccomms.length === 0) {
    await db.insert(schema.accommodations).values(
      accommodations.map((a) => ({ tripId, ...a })),
    );
    console.log(`  ✅ ${accommodations.length} Siena accommodation options added`);
  } else {
    console.log(`  ⏭️  Siena accommodations already exist (${existingAccomms.length})`);
  }

  // ── Ticket options as budget items ───────────────────
  const budgetItems = [
    {
      category: 'activities',
      description: 'Il Palio — Piazza center (FREE, standing). Arrive by 2pm, bring water/hat. Gates close ~3pm.',
      estimatedCost: '0.00',
      date: '2026-07-02',
    },
    {
      category: 'activities',
      description: 'Il Palio — MOSSA (start line) balcony seat (€690/person via paliodisiena.tickets)',
      estimatedCost: '690.00',
      date: '2026-07-02',
    },
    {
      category: 'activities',
      description: 'Il Palio — CASATO balcony seat (€575/person via paliodisiena.tickets)',
      estimatedCost: '575.00',
      date: '2026-07-02',
    },
    {
      category: 'activities',
      description: 'Il Palio — FONTE GAIA balcony seat (€575/person via paliodisiena.tickets)',
      estimatedCost: '575.00',
      date: '2026-07-02',
    },
    {
      category: 'activities',
      description: 'Il Palio — MOSSA standing (€460/person via paliodisiena.tickets)',
      estimatedCost: '460.00',
      date: '2026-07-02',
    },
    {
      category: 'activities',
      description: 'Contrada Dinner (night before race) — €100-250/person. Communal meal in the winning contrada streets.',
      estimatedCost: '250.00',
      date: '2026-07-01',
    },
    {
      category: 'activities',
      description: 'Trial Race + Contrada Dinner + Museum package (€285/person via intuscany.net)',
      estimatedCost: '285.00',
      date: '2026-07-01',
    },
    {
      category: 'transport',
      description: 'Vicenza → Siena driving (~4.5 hrs, 350km via A1/E35). Tolls + fuel ~€60-80.',
      estimatedCost: '70.00',
      date: '2026-07-01',
    },
    {
      category: 'accommodation',
      description: 'Siena accommodation July 1-3 (2 nights) — range €240-600 depending on option',
      estimatedCost: '400.00',
      date: '2026-07-01',
    },
  ];

  await db.insert(schema.budgetItems).values(
    budgetItems.map((b) => ({ tripId, ...b })),
  );
  console.log(`  ✅ ${budgetItems.length} Palio budget/ticket options added`);

  // ── Detailed itinerary items ─────────────────────────
  const itineraryItems = [
    // July 1 — Travel day + evening activities
    {
      title: 'Drive Vicenza → Siena',
      description:
        'Depart early morning. ~4.5 hours via A4/A1 autostrada. ' +
        'Park outside the ZTL (Fortezza Medicea or Stadio parking). ' +
        'Consider stopping in Florence or San Gimignano en route.',
      date: '2026-07-01',
      startTime: '07:00',
      endTime: '12:00',
      location: 'Vicenza → Siena',
      category: 'transport',
      orderIndex: 100,
    },
    {
      title: 'Check into Siena accommodation',
      description: 'Settle in, explore the historic center. Walk to Piazza del Campo to scope out the track.',
      date: '2026-07-01',
      startTime: '12:30',
      endTime: '14:00',
      location: 'Siena',
      category: 'rest',
      orderIndex: 101,
    },
    {
      title: 'Explore Siena — Duomo, Torre del Mangia',
      description:
        'Visit Siena Cathedral (stunning black-and-white marble façade), climb Torre del Mangia ' +
        'for panoramic views. Walk through the medieval streets and discover the contrada flags/fountains.',
      date: '2026-07-01',
      startTime: '14:30',
      endTime: '17:30',
      location: 'Siena Centro Storico',
      category: 'sightseeing',
      orderIndex: 102,
    },
    {
      title: 'Prova Generale (Final Trial Race)',
      description:
        'The last trial race before the real Palio. Free to watch from the piazza center. ' +
        'Good preview of the race atmosphere without the massive July 2 crowds.',
      date: '2026-07-01',
      startTime: '19:00',
      endTime: '20:00',
      location: 'Piazza del Campo',
      category: 'activity',
      orderIndex: 103,
    },
    {
      title: 'Contrada Dinner',
      description:
        'Communal open-air dinner in the streets of a contrada. Long tables, local food, wine, singing. ' +
        'One of the most authentic Italian experiences. Book via package or ask locals. €100-250/person.',
      date: '2026-07-01',
      startTime: '20:30',
      endTime: '23:00',
      location: 'Contrada streets, Siena',
      category: 'meal',
      orderIndex: 104,
    },

    // July 2 — RACE DAY
    {
      title: 'Morning — Jockey\'s Mass & Horse Blessing',
      description:
        'Each contrada brings its horse to its church for a blessing. The priest says "Go, and return a winner!" ' +
        'Incredibly moving ceremony. Check which contrade are racing and visit one.',
      date: '2026-07-02',
      startTime: '09:00',
      endTime: '11:00',
      location: 'Contrada churches, Siena',
      category: 'activity',
      orderIndex: 105,
    },
    {
      title: 'Early lunch + hydrate',
      description:
        'Eat well before heading to the piazza — you\'ll be standing for hours. ' +
        'Bring water, a hat, and sunscreen. No umbrellas, bags, or bottles allowed inside the piazza. ' +
        'Leave valuables at hotel.',
      date: '2026-07-02',
      startTime: '11:30',
      endTime: '13:00',
      location: 'Siena',
      category: 'meal',
      orderIndex: 106,
    },
    {
      title: 'Enter Piazza del Campo (if standing in center)',
      description:
        'If doing the FREE piazza standing option: arrive by 2pm at the latest (earlier is better — ' +
        'some people go at noon). Once you enter, you cannot leave until after the race. ' +
        'The center fills to 30,000-40,000 people. Electric atmosphere.',
      date: '2026-07-02',
      startTime: '14:00',
      endTime: '15:00',
      location: 'Piazza del Campo',
      category: 'activity',
      orderIndex: 107,
    },
    {
      title: 'Corteo Storico (Historical Parade)',
      description:
        'Spectacular 2-hour medieval pageant with flag-throwing (sbandieratori), ' +
        'drummers, and representatives of all 17 contrade in full 15th-century regalia. ' +
        'Includes the Carroccio (war cart) and the Palio banner itself.',
      date: '2026-07-02',
      startTime: '17:00',
      endTime: '19:00',
      location: 'Piazza del Campo',
      category: 'activity',
      orderIndex: 108,
    },
    {
      title: '🏇 IL PALIO — THE RACE',
      description:
        'The race itself: 3 laps around the piazza (~90 seconds total). Bareback, no rules except ' +
        '"don\'t grab other jockeys\' reins." Crashes at San Martino curve are common. ' +
        'The horse wins even without a rider. 10 contrade race; the 7 that sat out automatically qualify for August. ' +
        'After the race, the winning contrada erupts — celebrations last for days. ' +
        'Race starts at 19:30 sharp.',
      date: '2026-07-02',
      startTime: '19:30',
      endTime: '19:32',
      location: 'Piazza del Campo',
      category: 'activity',
      orderIndex: 109,
    },
    {
      title: 'Post-race celebrations + dinner',
      description:
        'Follow the winning contrada through the streets — pure chaos and joy. ' +
        'Find a trattoria for Tuscan dinner: pici cacio e pepe, ribollita, bistecca alla fiorentina, ' +
        'Chianti Classico. Or join the street celebrations.',
      date: '2026-07-02',
      startTime: '20:00',
      endTime: '23:00',
      location: 'Siena',
      category: 'meal',
      orderIndex: 110,
    },

    // July 3 — Departure / Optional sightseeing
    {
      title: 'Morning in Siena or day trip to San Gimignano',
      description:
        'Option A: Lazy morning in Siena, coffee at a piazza café, last-minute shopping. ' +
        'Option B: Drive to San Gimignano (45 min) — the "Medieval Manhattan" with its famous towers, ' +
        'gelato champion Gelateria Dondoli, and stunning Tuscan views.',
      date: '2026-07-03',
      startTime: '09:00',
      endTime: '12:00',
      location: 'Siena / San Gimignano',
      category: 'sightseeing',
      orderIndex: 111,
    },
    {
      title: 'Drive Siena → Vicenza',
      description:
        'Return drive ~4.5 hours. Consider stopping in Bologna for lunch (2 hrs from Siena). ' +
        'Alternatively stop at a Chianti winery on the way out of Tuscany.',
      date: '2026-07-03',
      startTime: '12:30',
      endTime: '17:00',
      location: 'Siena → Vicenza',
      category: 'transport',
      orderIndex: 112,
    },
  ];

  await db.insert(schema.itineraryItems).values(
    itineraryItems.map((item) => ({ tripId, ...item })),
  );
  console.log(`  ✅ ${itineraryItems.length} Palio itinerary items added`);

  // ── Packing items specific to Palio ──────────────────
  const packingItems = [
    { name: 'Comfortable shoes for standing 5+ hours on cobblestones', category: 'clothing' },
    { name: 'Hat for sun protection in piazza', category: 'clothing' },
    { name: 'Small water bottle (no large bags in piazza)', category: 'general' },
    { name: 'Contrada scarf/fazzoletto (buy in Siena)', category: 'clothing' },
    { name: 'Light clothes — July in Tuscany is 30-35°C', category: 'clothing' },
    { name: 'Camera with good zoom for the race', category: 'electronics' },
  ];

  await db.insert(schema.packingItems).values(
    packingItems.map((p) => ({ tripId, name: p.name, category: p.category, packed: false })),
  );
  console.log(`  ✅ ${packingItems.length} Palio-specific packing items added`);

  console.log('\n🏇 Il Palio di Siena research data seeded!');
  console.log('\n📋 Summary of ticket options:');
  console.log('  • FREE — Stand in piazza center (arrive early, bring patience)');
  console.log('  • €450-460 — Standing on balcony (MOSSA start line or Fonte Gaia)');
  console.log('  • €575 — Seated balcony (Casato or Fonte Gaia)');
  console.log('  • €690 — Seated balcony at MOSSA (start line, best view)');
  console.log('  • €1,495-4,045 — Full hotel+ticket packages (Palio Tours)');
  console.log('\n🔗 Booking links:');
  console.log('  • Tickets only: https://paliodisiena.tickets/2026-edition/');
  console.log('  • Tickets (InTuscany): https://www.intuscany.net/services/palio-tickets');
  console.log('  • Hotel packages: https://paliotours.com/palio-tickets-siena-2026');
  console.log('  • Expert guide: https://www.jacopodellatorre.com/');
  console.log('\n⚠️  NOTE: July Palio Tours packages are FULLY BOOKED.');
  console.log('  → Best bet: Buy tickets via paliodisiena.tickets + book accommodation separately.');
  console.log('  → Pre-register at paliodisiena.tickets/2026-edition/ for availability alerts.');

  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
