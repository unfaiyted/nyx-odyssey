import { getDb } from '../src/db';
const db = getDb();
import { trips, tripDestinations, itineraryItems, budgetItems } from '../src/db/schema';

async function seed() {
  console.log('🌱 Seeding trips...');

  // Clear existing
  await db.delete(budgetItems);
  await db.delete(itineraryItems);
  await db.delete(tripDestinations);
  await db.delete(trips);

  const [japan] = await db.insert(trips).values({
    name: 'Japan Adventure',
    description: 'Two weeks exploring Tokyo, Kyoto, and Osaka. Cherry blossom season!',
    startDate: '2026-03-15',
    endDate: '2026-03-29',
    status: 'planning',
    totalBudget: '5000',
    currency: 'USD',
  }).returning();

  const [iceland] = await db.insert(trips).values({
    name: 'Iceland Ring Road',
    description: 'Epic road trip around the entire island. Northern lights, glaciers, and hot springs.',
    startDate: '2026-02-08',
    endDate: '2026-02-18',
    status: 'active',
    totalBudget: '3500',
    currency: 'USD',
  }).returning();

  const [portugal] = await db.insert(trips).values({
    name: 'Portugal Coast',
    description: 'Lisbon to Porto along the Atlantic coast. Wine, history, and surf.',
    startDate: '2025-09-01',
    endDate: '2025-09-14',
    status: 'completed',
    totalBudget: '2800',
    currency: 'USD',
  }).returning();

  // Add some destinations
  await db.insert(tripDestinations).values([
    { tripId: japan.id, name: 'Tokyo', lat: 35.6762, lng: 139.6503, arrivalDate: '2026-03-15', departureDate: '2026-03-20', orderIndex: 0 },
    { tripId: japan.id, name: 'Kyoto', lat: 35.0116, lng: 135.7681, arrivalDate: '2026-03-20', departureDate: '2026-03-25', orderIndex: 1 },
    { tripId: japan.id, name: 'Osaka', lat: 34.6937, lng: 135.5023, arrivalDate: '2026-03-25', departureDate: '2026-03-29', orderIndex: 2 },
    { tripId: iceland.id, name: 'Reykjavik', lat: 64.1466, lng: -21.9426, arrivalDate: '2026-02-08', departureDate: '2026-02-10', orderIndex: 0 },
    { tripId: iceland.id, name: 'Vik', lat: 63.4186, lng: -19.0060, arrivalDate: '2026-02-10', departureDate: '2026-02-12', orderIndex: 1 },
    { tripId: iceland.id, name: 'Akureyri', lat: 65.6835, lng: -18.0878, arrivalDate: '2026-02-13', departureDate: '2026-02-16', orderIndex: 2 },
  ]);

  console.log('✅ Seeded 3 trips with destinations');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
