/**
 * Seed Italy 2026 flight and recommendation data
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../src/db/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seed() {
  // Find the Italy trip
  const [trip] = await db.select().from(schema.trips).where(eq(schema.trips.name, 'Italy 2026'));
  if (!trip) { console.error('Italy 2026 trip not found! Run seed-italy-trip.ts first.'); process.exit(1); }
  const tripId = trip.id;

  // ── Flights ──────────────────────────────────────────
  const existingFlights = await db.select().from(schema.flights).where(eq(schema.flights.tripId, tripId));
  if (existingFlights.length === 0) {
    await db.insert(schema.flights).values([
      // Outbound
      { tripId, airline: 'American Airlines', flightNumber: 'AA 2496', confirmationCode: 'NHWAJX', departureAirport: 'SAT', departureCity: 'San Antonio', arrivalAirport: 'CLT', arrivalCity: 'Charlotte', departureDate: '2026-06-09', arrivalDate: '2026-06-09', status: 'confirmed', orderIndex: 0, notes: 'Outbound leg 1' },
      { tripId, airline: 'American Airlines', flightNumber: 'AA 734', confirmationCode: 'NHWAJX', departureAirport: 'CLT', departureCity: 'Charlotte', arrivalAirport: 'CLT', arrivalCity: 'Charlotte', departureDate: '2026-06-09', arrivalDate: '2026-06-10', status: 'confirmed', orderIndex: 1, notes: 'Outbound leg 2 (transatlantic)' },
      { tripId, airline: 'American Airlines', flightNumber: 'AA 6727', confirmationCode: 'NHWAJX', departureAirport: 'CLT', departureCity: 'Charlotte', arrivalAirport: 'VCE', arrivalCity: 'Venice', departureDate: '2026-06-09', arrivalDate: '2026-06-10', status: 'confirmed', orderIndex: 2, notes: 'Outbound leg 3 — arrives Venice Marco Polo!' },
      // Return
      { tripId, airline: 'American Airlines', flightNumber: 'AA 131', confirmationCode: 'NHWAJX', departureAirport: 'VCE', departureCity: 'Venice', arrivalAirport: 'CLT', arrivalCity: 'Charlotte', departureDate: '2026-07-10', arrivalDate: '2026-07-10', status: 'confirmed', orderIndex: 3, notes: 'Return leg 1' },
      { tripId, airline: 'American Airlines', flightNumber: 'AA 1406', confirmationCode: 'NHWAJX', departureAirport: 'CLT', departureCity: 'Charlotte', arrivalAirport: 'SAT', arrivalCity: 'San Antonio', departureDate: '2026-07-10', arrivalDate: '2026-07-10', status: 'confirmed', orderIndex: 4, notes: 'Return leg 2 — home!' },
    ]);
    console.log('✅ 5 flights added');
  } else {
    console.log('⏭️  Flights already exist, skipping');
  }

  // ── Budget Categories ────────────────────────────────
  const existingCats = await db.select().from(schema.budgetCategories).where(eq(schema.budgetCategories.tripId, tripId));
  if (existingCats.length === 0) {
    await db.insert(schema.budgetCategories).values([
      { tripId, category: 'flights', allocatedBudget: '0', color: '#3b82f6', icon: '✈️' },
      { tripId, category: 'accommodations', allocatedBudget: '0', color: '#8b5cf6', icon: '🏠' },
      { tripId, category: 'food', allocatedBudget: '0', color: '#f59e0b', icon: '🍝' },
      { tripId, category: 'activities', allocatedBudget: '0', color: '#10b981', icon: '🎭' },
      { tripId, category: 'transport', allocatedBudget: '0', color: '#6366f1', icon: '🚗' },
      { tripId, category: 'shopping', allocatedBudget: '0', color: '#ec4899', icon: '🛍️' },
      { tripId, category: 'other', allocatedBudget: '0', color: '#6b7280', icon: '📦' },
    ]);
    console.log('✅ 7 budget categories added');
  } else {
    console.log('⏭️  Budget categories already exist, skipping');
  }

  // ── Recommendation-specific budget items ─────────────
  const recBudgetItems = [
    { tripId, category: 'activities', description: 'Arena di Verona opera tickets (La Traviata/Aida/Nabucco/La Bohème)', estimatedCost: '56', date: '2026-06-12' },
    { tripId, category: 'activities', description: 'Sirmione entrance fees (Castle €6 + Grotte di Catullo €8)', estimatedCost: '14', date: null },
    { tripId, category: 'activities', description: 'Teatro Olimpico Silver Card (4 Palladio sites)', estimatedCost: '16', date: null },
    { tripId, category: 'activities', description: 'Il Palio di Siena — seats/balcony', estimatedCost: '400', date: '2026-07-02' },
    { tripId, category: 'food', description: 'Contrada Dinner — Il Palio di Siena', estimatedCost: '100', date: '2026-07-02' },
  ];
  await db.insert(schema.budgetItems).values(recBudgetItems);
  console.log(`✅ ${recBudgetItems.length} recommendation budget items added`);

  console.log('\n🎉 Flights & recommendations seeded!');
  await client.end();
}

seed().catch((err) => { console.error('Seed failed:', err); process.exit(1); });
