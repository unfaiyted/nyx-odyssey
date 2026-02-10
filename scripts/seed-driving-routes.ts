/**
 * Seed pre-calculated driving routes from Vicenza base to all Italy 2026 destinations.
 * Distances and times based on typical driving via major highways (Autostrada).
 *
 * Usage: bun scripts/seed-driving-routes.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';
import * as schema from '../src/db/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

// Pre-calculated driving data from Vicenza to each destination
// Source: Google Maps approximate driving times via fastest route
const routesFromVicenza: Record<string, {
  distanceKm: number;
  distanceMiles: number;
  durationMinutes: number;
  routeDescription: string;
  tolls: boolean;
  highway: boolean;
  notes?: string;
}> = {
  'Venice': {
    distanceKm: 75,
    distanceMiles: 47,
    durationMinutes: 55,
    routeDescription: 'A4/E70 east → Venice',
    tolls: true,
    highway: true,
    notes: 'Park at Tronchetto or Piazzale Roma. Water taxi/vaporetto into the city.',
  },
  'Verona': {
    distanceKm: 52,
    distanceMiles: 32,
    durationMinutes: 45,
    routeDescription: 'A4/E70 west → Verona',
    tolls: true,
    highway: true,
    notes: 'ZTL (restricted traffic zone) in old center. Park outside and walk in.',
  },
  'Padua (Padova)': {
    distanceKm: 32,
    distanceMiles: 20,
    durationMinutes: 30,
    routeDescription: 'A4/E70 east → Padova exit',
    tolls: true,
    highway: true,
    notes: 'Quick day trip. Scrovegni Chapel needs advance booking.',
  },
  'Lake Garda — Sirmione': {
    distanceKm: 90,
    distanceMiles: 56,
    durationMinutes: 70,
    routeDescription: 'A4/E70 west → Sirmione exit → SP11',
    tolls: true,
    highway: true,
    notes: 'Parking fills up fast in summer. Arrive early or take shuttle from Colombare.',
  },
  'Treviso': {
    distanceKm: 68,
    distanceMiles: 42,
    durationMinutes: 50,
    routeDescription: 'A31 north → A27 → Treviso',
    tolls: true,
    highway: true,
    notes: 'Also reachable via local roads (SR53) in about the same time.',
  },
  'Dolomites': {
    distanceKm: 185,
    distanceMiles: 115,
    durationMinutes: 165,
    routeDescription: 'A31 north → SS47 → A22 → Bolzano → Dolomite roads',
    tolls: true,
    highway: true,
    notes: 'Drive time varies by destination. Tre Cime ~3h, Lago di Braies ~2.5h. Mountain roads can be slow. Start early.',
  },
  'Bologna': {
    distanceKm: 150,
    distanceMiles: 93,
    durationMinutes: 100,
    routeDescription: 'A4 west → A13 south → Bologna',
    tolls: true,
    highway: true,
    notes: 'Food capital of Italy. ZTL in center. Many paid parking garages available.',
  },
  'Trieste': {
    distanceKm: 190,
    distanceMiles: 118,
    durationMinutes: 120,
    routeDescription: 'A4/E70 east → past Venice → continue to Trieste',
    tolls: true,
    highway: true,
    notes: 'Near Slovenian border. Great coffee culture. Can combine with a quick Slovenia visit.',
  },
  'Florence': {
    distanceKm: 260,
    distanceMiles: 162,
    durationMinutes: 170,
    routeDescription: 'A4 west → A13 south → A1 south → Firenze',
    tolls: true,
    highway: true,
    notes: 'ZTL is strictly enforced. Use park-and-ride or train from Bologna (37 min fast train). Book Uffizi in advance.',
  },
  'Milan': {
    distanceKm: 210,
    distanceMiles: 130,
    durationMinutes: 150,
    routeDescription: 'A4/E70 west → Milano',
    tolls: true,
    highway: true,
    notes: 'Area C congestion charge in center. Metro is excellent — park outside and ride in.',
  },
  'Cinque Terre': {
    distanceKm: 320,
    distanceMiles: 199,
    durationMinutes: 210,
    routeDescription: 'A4 west → A1 south → A15 → A12 → La Spezia',
    tolls: true,
    highway: true,
    notes: 'Cars not allowed in villages. Park in La Spezia or Levanto and take the train between towns (€16 Cinque Terre Card).',
  },
  'Rome': {
    distanceKm: 480,
    distanceMiles: 298,
    durationMinutes: 310,
    routeDescription: 'A4 west → A13 south → A1 south → Roma',
    tolls: true,
    highway: true,
    notes: 'Consider the train instead (3.5h fast train from Padova). If driving, ZTL is a maze — park at hotel or use metro.',
  },
  'Naples / Amalfi Coast': {
    distanceKm: 650,
    distanceMiles: 404,
    durationMinutes: 390,
    routeDescription: 'A4 → A13 → A1 south → Napoli → SS163 to Amalfi',
    tolls: true,
    highway: true,
    notes: 'Best to fly or take high-speed train (4.5h to Naples). Amalfi Coast road is narrow and stressful in summer. Consider SITA bus or ferry.',
  },
  'Siena': {
    distanceKm: 310,
    distanceMiles: 193,
    durationMinutes: 210,
    routeDescription: 'A4 west → A13 south → A1 south → Firenze → Siena-Firenze highway',
    tolls: true,
    highway: true,
    notes: 'For Il Palio (July 2), arrive a day early. Hotels book up months ahead. The Siena-Firenze road is toll-free.',
  },
};

// Useful inter-destination routes (for trip planning)
const interDestinationRoutes: Array<{
  from: string;
  to: string;
  distanceKm: number;
  distanceMiles: number;
  durationMinutes: number;
  routeDescription: string;
  tolls: boolean;
  highway: boolean;
  notes?: string;
}> = [
  {
    from: 'Venice', to: 'Padua (Padova)',
    distanceKm: 42, distanceMiles: 26, durationMinutes: 35,
    routeDescription: 'A4/E70 west',
    tolls: true, highway: true,
  },
  {
    from: 'Verona', to: 'Lake Garda — Sirmione',
    distanceKm: 38, distanceMiles: 24, durationMinutes: 35,
    routeDescription: 'A4 west → SP11 to Sirmione',
    tolls: true, highway: true,
  },
  {
    from: 'Florence', to: 'Siena',
    distanceKm: 75, distanceMiles: 47, durationMinutes: 75,
    routeDescription: 'Firenze-Siena highway (toll-free)',
    tolls: false, highway: true,
    notes: 'Can easily combine Florence + Siena in a multi-day trip.',
  },
  {
    from: 'Florence', to: 'Cinque Terre',
    distanceKm: 185, distanceMiles: 115, durationMinutes: 140,
    routeDescription: 'A11 west → A12 south → La Spezia',
    tolls: true, highway: true,
  },
  {
    from: 'Bologna', to: 'Florence',
    distanceKm: 110, distanceMiles: 68, durationMinutes: 70,
    routeDescription: 'A1 south through Apennine tunnels',
    tolls: true, highway: true,
    notes: 'Quick hop. Can do Bologna + Florence on a long weekend from Vicenza.',
  },
  {
    from: 'Rome', to: 'Naples / Amalfi Coast',
    distanceKm: 230, distanceMiles: 143, durationMinutes: 150,
    routeDescription: 'A1 south → Napoli → SS163',
    tolls: true, highway: true,
    notes: 'If you go to Rome, Naples is a natural add-on.',
  },
  {
    from: 'Venice', to: 'Treviso',
    distanceKm: 30, distanceMiles: 19, durationMinutes: 30,
    routeDescription: 'SS13 or A27 north',
    tolls: false, highway: false,
    notes: 'Combine with a Venice day — Treviso is where Ryanair flights land.',
  },
  {
    from: 'Verona', to: 'Milan',
    distanceKm: 160, distanceMiles: 99, durationMinutes: 110,
    routeDescription: 'A4/E70 west',
    tolls: true, highway: true,
  },
];

async function seed() {
  console.log('🚗 Seeding driving routes from Vicenza...');

  // Find the Italy 2026 trip
  const [trip] = await db.select().from(schema.trips).where(eq(schema.trips.name, 'Italy 2026'));
  if (!trip) {
    console.error('❌ Italy 2026 trip not found. Run seed-italy-trip.ts first.');
    process.exit(1);
  }

  // Get all destinations for this trip
  const dests = await db.select().from(schema.tripDestinations).where(eq(schema.tripDestinations.tripId, trip.id));
  const destByName = new Map(dests.map(d => [d.name, d]));

  console.log(`  Found ${dests.length} destinations for trip "${trip.name}"`);

  // Clear existing trip routes
  await db.delete(schema.tripRoutes).where(eq(schema.tripRoutes.tripId, trip.id));

  // Find Vicenza base
  const vicenza = destByName.get('Vicenza');
  if (!vicenza) {
    console.error('❌ Vicenza destination not found.');
    process.exit(1);
  }

  let inserted = 0;

  // Insert routes from Vicenza to each destination
  for (const [destName, routeData] of Object.entries(routesFromVicenza)) {
    const dest = destByName.get(destName);
    if (!dest) {
      console.warn(`  ⚠️ Destination "${destName}" not found in DB, skipping.`);
      continue;
    }

    await db.insert(schema.tripRoutes).values({
      tripId: trip.id,
      fromDestinationId: vicenza.id,
      toDestinationId: dest.id,
      distanceKm: routeData.distanceKm,
      distanceMiles: routeData.distanceMiles,
      durationMinutes: routeData.durationMinutes,
      routeDescription: routeData.routeDescription,
      tolls: routeData.tolls,
      highway: routeData.highway,
      notes: routeData.notes || null,
    });
    inserted++;
    console.log(`  ✅ ${vicenza.name} → ${destName}: ${routeData.distanceKm}km, ${routeData.durationMinutes}min`);
  }

  // Insert inter-destination routes
  for (const route of interDestinationRoutes) {
    const fromDest = destByName.get(route.from);
    const toDest = destByName.get(route.to);
    if (!fromDest || !toDest) {
      console.warn(`  ⚠️ Route ${route.from} → ${route.to}: destination not found, skipping.`);
      continue;
    }

    await db.insert(schema.tripRoutes).values({
      tripId: trip.id,
      fromDestinationId: fromDest.id,
      toDestinationId: toDest.id,
      distanceKm: route.distanceKm,
      distanceMiles: route.distanceMiles,
      durationMinutes: route.durationMinutes,
      routeDescription: route.routeDescription,
      tolls: route.tolls,
      highway: route.highway,
      notes: route.notes || null,
    });
    inserted++;
    console.log(`  ✅ ${route.from} → ${route.to}: ${route.distanceKm}km, ${route.durationMinutes}min`);
  }

  console.log(`\n🎉 Inserted ${inserted} driving routes!`);
  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
