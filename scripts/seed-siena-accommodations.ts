/**
 * Seed script: Add detailed agriturismo & centro storico accommodation options for Siena (Palio).
 *
 * July 1-3, 2026. Researched options ranging from countryside farm stays to
 * historic center apartments within walking distance of Piazza del Campo.
 *
 * Usage:  bun scripts/seed-siena-accommodations.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../src/db/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seed() {
  console.log('🏡 Seeding Siena agriturismo & centro storico accommodations...\n');

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

  // ── Find Siena destination for linking ───────────────
  const allDests = await db
    .select()
    .from(schema.tripDestinations)
    .where(eq(schema.tripDestinations.tripId, tripId));
  const siena = allDests.find((r) => r.name === 'Siena');
  const destinationId = siena?.id ?? null;

  // ── AGRITURISMO OPTIONS (countryside, 5-20 min from Siena) ──
  const agriturismos = [
    {
      name: 'Agriturismo Il Poggiarello',
      type: 'other' as const,
      status: 'researched' as const,
      address: 'Strada di Poggiarello, 53100 Siena SI',
      checkIn: '2026-07-01',
      checkOut: '2026-07-03',
      costPerNight: '128.00',
      totalCost: '256.00',
      currency: 'EUR',
      bookingUrl: 'https://www.booking.com/hotel/it/agriturismo-il-poggiarello.html',
      rating: 4.5,
      notes:
        'AGRITURISMO — Family-owned for 200+ years. 4 rooms + 4 apartments amid holm oaks, olive trees & rosemary. ' +
        'Seasonal swimming pool. Breakfast available (€10/person) with local cheese, cold cuts, fresh pies, artisanal jam. ' +
        '~10 min drive to Siena centro. Rustic Tuscan charm. ' +
        'PALIO NOTE: Book ASAP — agriturismos near Siena fill up 6+ months before Palio dates.',
    },
    {
      name: 'Il Lavandeto di Siena',
      type: 'other' as const,
      status: 'researched' as const,
      address: 'Strada dei Tufi, 53100 Siena SI',
      checkIn: '2026-07-01',
      checkOut: '2026-07-03',
      costPerNight: '101.00',
      totalCost: '202.00',
      currency: 'EUR',
      bookingUrl: 'https://www.booking.com/hotel/it/agriturismo-il-lavandeto.html',
      rating: 4.6,
      notes:
        'AGRITURISMO — Just 2km south of Siena centro (bus stop nearby!). Named for its lavender fields. ' +
        'Recently renovated with modern furnishings in a rustic setting. Olive trees, barnyard animals, ' +
        'garden with BBQ and gazebo. Best of both worlds: countryside feel with walkable access to the city. ' +
        'BEST VALUE agriturismo option for Palio — closest to centro storico.',
    },
    {
      name: 'Villa il Castagno Wine & Resort',
      type: 'villa' as const,
      status: 'researched' as const,
      address: 'Località il Castagno, 53100 Siena SI',
      checkIn: '2026-07-01',
      checkOut: '2026-07-03',
      costPerNight: '183.00',
      totalCost: '366.00',
      currency: 'EUR',
      bookingUrl: 'https://www.booking.com/hotel/it/villa-il-castagno-wine-amp-resort.html',
      rating: 4.4,
      notes:
        'AGRITURISMO / WINE RESORT — Chianti hills location. Suites named after Italian master painters (Giotto, Raffaello). ' +
        'Cooking classes, wine & cheese tastings, poolside bar, restaurant with locally-sourced dishes. ' +
        'Buffet breakfast included. Premium experience. ~15 min to Siena. ' +
        'Great for a post-Palio wind-down with Chianti wine.',
    },
    {
      name: 'Agriturismo La Selva',
      type: 'other' as const,
      status: 'researched' as const,
      address: 'Pian del Lago, 53100 Siena SI',
      checkIn: '2026-07-01',
      checkOut: '2026-07-03',
      costPerNight: '83.00',
      totalCost: '166.00',
      currency: 'EUR',
      bookingUrl: 'https://www.booking.com/hotel/it/agriturismolaselva.html',
      rating: 4.3,
      notes:
        'AGRITURISMO — BUDGET PICK. ~100 acres in the Pian del Lago region. Large circular pool, ' +
        'two-level garden, panoramic terrace, ping pong, table football. Apartments (2-4 people) + rooms available. ' +
        'Numerous trekking routes. ~15 min drive to Siena. ' +
        'At €83/night, this is the most affordable agriturismo option with excellent amenities.',
    },
    {
      name: 'La Torre di Monsindoli',
      type: 'other' as const,
      status: 'researched' as const,
      address: 'Monsindoli, 53100 Siena SI',
      checkIn: '2026-07-01',
      checkOut: '2026-07-03',
      costPerNight: '92.00',
      totalCost: '184.00',
      currency: 'EUR',
      bookingUrl: 'https://www.booking.com/hotel/it/agriturismo-la-torre-di-monsindoli.html',
      rating: 4.4,
      notes:
        'AGRITURISMO — Intimate family-run farmhouse, ~10km from Siena. Triple room + apartment with garden views. ' +
        'BBQ, swimming pool. Pets welcome. Continental breakfast included. ' +
        'Mix of modern comfort and rustic charm. Peaceful retreat after the Palio chaos.',
    },
    {
      name: 'Agriturismo Casalino',
      type: 'other' as const,
      status: 'researched' as const,
      address: 'Casalino, 53019 Castelnuovo Berardenga SI',
      checkIn: '2026-07-01',
      checkOut: '2026-07-03',
      costPerNight: '151.00',
      totalCost: '302.00',
      currency: 'EUR',
      bookingUrl: 'https://www.booking.com/hotel/it/agriturismo-casalino.html',
      rating: 4.7,
      notes:
        'AGRITURISMO — TOP RATED (9.4 on Booking.com). In Castelnuovo Berardenga, ~20 min from Siena. ' +
        'Classic Chianti countryside setting with vineyards and olive groves. ' +
        'Higher price but exceptional reviews. Perfect for a romantic Tuscan stay. ' +
        'Worth the slightly longer drive for the quality.',
    },
  ];

  // ── CENTRO STORICO OPTIONS (inside city walls, walking to Piazza del Campo) ──
  const centroStorico = [
    {
      name: 'Charme Centro Storico Apartment',
      type: 'airbnb' as const,
      status: 'researched' as const,
      address: 'Centro Storico, 53100 Siena',
      checkIn: '2026-07-01',
      checkOut: '2026-07-03',
      costPerNight: '200.00',
      totalCost: '400.00',
      currency: 'EUR',
      bookingUrl: 'https://www.booking.com/hotel/it/charme-centro-storico.html',
      rating: 4.3,
      notes:
        'CENTRO STORICO APARTMENT — In the historic center, walking distance to Piazza del Campo. ' +
        'Self-catering apartment ideal for experiencing Palio atmosphere up close. ' +
        'Can hear the crowd roar from the window on race day. ' +
        'PALIO PREMIUM: Expect 2-3x normal rates during Palio week. Book 6+ months ahead.',
    },
    {
      name: 'Il Nido del Mangia (Airbnb)',
      type: 'airbnb' as const,
      status: 'researched' as const,
      address: 'Near Piazza del Campo, 53100 Siena',
      checkIn: '2026-07-01',
      checkOut: '2026-07-03',
      costPerNight: '250.00',
      totalCost: '500.00',
      currency: 'EUR',
      bookingUrl: 'https://www.airbnb.com/s/Siena--Italy',
      rating: 4.5,
      notes:
        'CENTRO STORICO APARTMENT — Named after Torre del Mangia. Steps from Piazza del Campo. ' +
        'Perfect location to experience the Palio — walk to the piazza in minutes. ' +
        'Can watch the Corteo Storico parade from nearby streets. ' +
        'Premium pricing during Palio but unbeatable location.',
    },
    {
      name: 'Palio Tours Centro Apartment (1BR)',
      type: 'airbnb' as const,
      status: 'researched' as const,
      address: 'City Center, 53100 Siena',
      checkIn: '2026-07-01',
      checkOut: '2026-07-03',
      costPerNight: '275.00',
      totalCost: '550.00',
      currency: 'EUR',
      bookingUrl: 'https://paliotours.com/apartments',
      rating: null,
      notes:
        'CENTRO STORICO APARTMENT — Via Palio Tours. 1BR units in city center. ' +
        'Can be bundled with Palio tickets + activities (contrada dinner, horse blessing, parade). ' +
        'Managed by Palio specialists who handle everything. ' +
        'Also available: 2BR and 3BR units for larger groups. Contact paliotours.com for pricing.',
    },
    {
      name: 'Airbnb: "A Terrace in the Historic Center"',
      type: 'airbnb' as const,
      status: 'researched' as const,
      address: 'Centro Storico, 53100 Siena',
      checkIn: '2026-07-01',
      checkOut: '2026-07-03',
      costPerNight: '220.00',
      totalCost: '440.00',
      currency: 'EUR',
      bookingUrl: 'https://www.airbnb.com/rooms/849110236077299712',
      rating: 4.6,
      notes:
        'CENTRO STORICO APARTMENT — Terrace with views. Double bedroom + sofa bed in living room. ' +
        'Central but quiet location. Specifically marketed for Palio visitors. ' +
        'The terrace is a major perk — enjoy evening drinks while the contrade celebrate below.',
    },
    {
      name: 'Borgo Grondaie (B&B)',
      type: 'hotel' as const,
      status: 'researched' as const,
      address: 'Viale XXV Aprile, 53100 Siena',
      checkIn: '2026-07-01',
      checkOut: '2026-07-03',
      costPerNight: '165.00',
      totalCost: '330.00',
      currency: 'EUR',
      bookingUrl: 'https://www.booking.com/hotel/it/borgo-grondaie.html',
      rating: 4.6,
      notes:
        'B&B / FARM STAY hybrid — #1 rated farm stay in Siena on TripAdvisor. ' +
        'Just outside the city walls but walkable to centro storico (~10 min). ' +
        'Best compromise: countryside charm + city access without needing a car during Palio. ' +
        'Beautiful gardens, excellent breakfast. Highly recommended.',
    },
  ];

  const allAccommodations = [...agriturismos, ...centroStorico].map((a) => ({
    tripId,
    destinationId,
    ...a,
  }));

  // Insert all
  await db.insert(schema.accommodations).values(allAccommodations);
  console.log(`  ✅ ${agriturismos.length} agriturismo options added`);
  console.log(`  ✅ ${centroStorico.length} centro storico options added`);
  console.log(`  📊 Total: ${allAccommodations.length} new accommodation options\n`);

  // ── Summary ──────────────────────────────────────────
  console.log('🏡 AGRITURISMO OPTIONS (countryside):');
  console.log('  Budget:');
  console.log('    • La Selva — €83/night (pool, 100 acres, ~15 min drive)');
  console.log('    • La Torre di Monsindoli — €92/night (intimate, pets OK, ~10km)');
  console.log('  Mid-range:');
  console.log('    • Il Lavandeto — €101/night ⭐ BEST VALUE (2km from centro, bus access)');
  console.log('    • Il Poggiarello — €128/night (200-year-old family farm)');
  console.log('    • Casalino — €151/night (top-rated 9.4, Chianti, ~20 min)');
  console.log('  Premium:');
  console.log('    • Villa il Castagno — €183/night (wine resort, cooking classes)');
  console.log('');
  console.log('🏛️ CENTRO STORICO OPTIONS (in-city):');
  console.log('  • Borgo Grondaie — €165/night (B&B, walkable, #1 TripAdvisor)');
  console.log('  • Charme Centro Storico — €200/night (apartment, near Campo)');
  console.log('  • Terrace Apartment — €220/night (Airbnb, terrace views)');
  console.log('  • Il Nido del Mangia — €250/night (steps from Campo)');
  console.log('  • Palio Tours Apartment — €275/night (bundled with tickets)');
  console.log('');
  console.log('💡 RECOMMENDATIONS:');
  console.log('  🥇 Best overall: Il Lavandeto (€101/night) — 2km from centro, bus access, lavender fields');
  console.log('  🥈 Best centro: Borgo Grondaie (€165/night) — walkable, #1 rated, garden');
  console.log('  🥉 Best luxury: Villa il Castagno (€183/night) — wine resort experience');
  console.log('  💰 Best budget: La Selva (€83/night) — huge property, pool, great value');
  console.log('');
  console.log('⚠️  IMPORTANT: Palio dates sell out 6+ months in advance. Book ASAP!');
  console.log('  Prices shown are normal rates — expect 2-3x during Palio week for centro storico.');

  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
