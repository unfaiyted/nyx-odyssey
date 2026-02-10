/**
 * Seed script: Import Italy 2026 trip data from memory files into the database.
 *
 * Usage:  bun scripts/seed-italy-trip.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../src/db/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seed() {
  console.log('🇮🇹 Seeding Italy 2026 trip data...');

  // ── 1. Trip ──────────────────────────────────────────
  const [trip] = await db.insert(schema.trips).values({
    name: 'Italy 2026',
    description:
      'Month-long trip to Italy visiting friend Derek Roberts, based in Vicenza. Flying into Venice Marco Polo (VCE). Confirmation: NHWAJX (American Airlines).',
    startDate: '2026-06-10',
    endDate: '2026-07-10',
    status: 'planning',
    currency: 'USD',
  }).returning();

  const tripId = trip.id;
  console.log(`  ✅ Trip created: ${tripId}`);

  // ── 2. Accommodation ────────────────────────────────
  await db.insert(schema.accommodations).values({
    tripId,
    name: "Derek's Place — Vicenza",
    type: 'other',
    address: 'Contrà S. Rocco #60, Int 3, Vicenza, VI 36100, Italy',
    checkIn: '2026-06-10',
    checkOut: '2026-07-10',
    booked: true,
    notes:
      'Home base for the trip. Vicenza is central Veneto — ~45 mi west of Venice, ~40 mi east of Verona, ~30 mi west of Padua.',
  });
  console.log('  ✅ Accommodation added');

  // ── 3. Destinations ──────────────────────────────────
  const destinations = [
    // Within 1 hour
    { name: 'Venice', description: 'Canals, St. Mark\'s Square, gondolas. 30-60 min from Vicenza.', lat: 45.4408, lng: 12.3155, arrivalDate: null, orderIndex: 1 },
    { name: 'Verona', description: 'Romeo & Juliet balcony, Roman Arena opera! 45 min from Vicenza.', lat: 45.4384, lng: 10.9916, arrivalDate: null, orderIndex: 2 },
    { name: 'Padua (Padova)', description: 'Scrovegni Chapel, university town. 30 min from Vicenza.', lat: 45.4064, lng: 11.8768, arrivalDate: null, orderIndex: 3 },
    { name: 'Lake Garda — Sirmione', description: 'Medieval lakeside town, Scaliger Castle, Grotte di Catullo, Jamaica Beach, thermal spas. "The Pearl of the Lake." 1 hr from Vicenza.', lat: 45.4963, lng: 10.6079, arrivalDate: null, orderIndex: 4 },
    { name: 'Treviso', description: 'Mini Venice, prosecco country. 30 min from Vicenza.', lat: 45.6669, lng: 12.2430, arrivalDate: null, orderIndex: 5 },
    // 1-2 hours
    { name: 'Dolomites', description: 'Stunning mountains, hiking. 2-3 hrs from Vicenza. Top picks: Tre Cime di Lavaredo, Seceda, Cinque Torri, Lago di Braies, Alpe di Siusi.', lat: 46.4102, lng: 11.8440, arrivalDate: null, orderIndex: 6 },
    { name: 'Bologna', description: 'Food capital of Italy "La Grassa." 1.5 hrs from Vicenza. Tagliatelle al ragù, tortellini in brodo, mortadella, cooking classes, Quadrilatero market, Two Towers.', lat: 44.4949, lng: 11.3426, arrivalDate: null, orderIndex: 7 },
    { name: 'Trieste', description: 'Habsburg architecture, coffee culture. 1.5 hrs from Vicenza.', lat: 45.6495, lng: 13.7768, arrivalDate: null, orderIndex: 8 },
    // 2-3 hours
    { name: 'Florence', description: 'Uffizi, Duomo, Renaissance art. 2-2.5 hrs from Vicenza.', lat: 43.7696, lng: 11.2558, arrivalDate: null, orderIndex: 9 },
    { name: 'Milan', description: 'Duomo, Last Supper, fashion. 2.5 hrs from Vicenza.', lat: 45.4642, lng: 9.1900, arrivalDate: null, orderIndex: 10 },
    { name: 'Cinque Terre', description: 'Coastal hiking, colorful villages. 3 hrs from Vicenza.', lat: 44.1461, lng: 9.6439, arrivalDate: null, orderIndex: 11 },
    // Further
    { name: 'Rome', description: 'The classics — Colosseum, Vatican, Forum. 4-5 hrs or quick flight.', lat: 41.9028, lng: 12.4964, arrivalDate: null, orderIndex: 12 },
    { name: 'Naples / Amalfi Coast', description: 'Pizza, Pompeii, coastline. 5+ hrs from Vicenza.', lat: 40.8518, lng: 14.2681, arrivalDate: null, orderIndex: 13 },
    { name: 'Siena', description: 'Il Palio horse race July 2! Medieval bareback race in Piazza del Campo. 4-5 hrs from Vicenza.', lat: 43.3188, lng: 11.3308, arrivalDate: '2026-07-02', orderIndex: 14 },
    { name: 'Vicenza', description: 'Home base. Teatro Olimpico — world\'s oldest indoor theater (1580), UNESCO World Heritage. 15 min walk.', lat: 45.5455, lng: 11.5354, arrivalDate: '2026-06-10', orderIndex: 0 },
  ];

  await db.insert(schema.tripDestinations).values(
    destinations.map((d) => ({
      tripId,
      name: d.name,
      description: d.description,
      lat: d.lat,
      lng: d.lng,
      arrivalDate: d.arrivalDate,
      orderIndex: d.orderIndex,
    })),
  );
  console.log(`  ✅ ${destinations.length} destinations added`);

  // ── 4. Packing items ─────────────────────────────────
  const packingItems = [
    { name: 'Passport (6+ months validity)', category: 'documents' },
    { name: 'European outlet adapter (Type C/F/L)', category: 'electronics' },
    { name: 'Comfortable walking shoes (broken in)', category: 'clothing' },
    { name: 'Light breathable clothes / linen', category: 'clothing' },
    { name: 'Sunscreen', category: 'toiletries' },
    { name: 'Sunglasses', category: 'general' },
    { name: 'Sun hat', category: 'clothing' },
    { name: 'Swimwear', category: 'clothing' },
    { name: 'Light cardigan / layers for AC & evenings', category: 'clothing' },
    { name: 'Day backpack', category: 'general' },
    { name: 'Reusable water bottle', category: 'general' },
  ];

  await db.insert(schema.packingItems).values(
    packingItems.map((p) => ({ tripId, name: p.name, category: p.category, packed: false })),
  );
  console.log(`  ✅ ${packingItems.length} packing items added`);

  // ── 5. Budget items (flights) ────────────────────────
  await db.insert(schema.budgetItems).values({
    tripId,
    category: 'transport',
    description: 'Round-trip flights SAT → VCE (American Airlines, conf NHWAJX)',
    paid: true,
  });
  console.log('  ✅ Budget item added (flights)');

  // ── 6. Itinerary highlights ──────────────────────────
  const itineraryItems = [
    { title: 'Arrive Venice Marco Polo (VCE)', date: '2026-06-10', category: 'transport', description: 'Flights AA 2496 → AA 734 → AA 6727 (SAT → CLT → VCE). Departs June 9.' },
    { title: 'Arena di Verona — La Traviata (opening)', date: '2026-06-12', category: 'activity', description: 'Tickets €28-€250+. Book at arena.it.' },
    { title: 'Arena di Verona — Aida', date: '2026-06-19', category: 'activity', description: 'Stefano Poda production. Also June 25, July 2, July 10.' },
    { title: 'Il Palio di Siena', date: '2026-07-02', category: 'activity', description: 'Medieval bareback horse race in Piazza del Campo. 90 seconds of chaos. Free (piazza) or €250-690 (seats). Stay overnight July 1-3. Contrada Dinner €100.' },
    { title: 'Arena di Verona — Aida (finale night!)', date: '2026-07-10', category: 'activity', description: 'Last night of trip — spectacular finale possibility.' },
    { title: 'Return flight VCE → SAT', date: '2026-07-10', category: 'transport', description: 'AA 131 → AA 1406.' },
  ];

  await db.insert(schema.itineraryItems).values(
    itineraryItems.map((item, i) => ({ tripId, ...item, orderIndex: i })),
  );
  console.log(`  ✅ ${itineraryItems.length} itinerary items added`);

  console.log('\n🎉 Italy 2026 seed complete!');
  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
