import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import * as schema from '../src/db/schema';

const sql = postgres('postgresql://postgres:postgres@localhost:5432/odyssey');
const db = drizzle(sql, { schema });

const TRIP_ID = '2el8do_u2fmjxf5DU9bf1';

async function seed() {
  console.log('🎰 Seeding Vegas F1 2026 — Comprehensive Budget Estimate...');

  // Clear existing budget items for this trip
  await db.delete(schema.budgetItems).where(eq(schema.budgetItems.tripId, TRIP_ID));
  await db.delete(schema.budgetCategories).where(eq(schema.budgetCategories.tripId, TRIP_ID));

  // Budget categories with mid-tier allocations
  const categories = [
    { category: 'flights', allocatedBudget: '700', color: '#3b82f6', icon: '✈️' },
    { category: 'accommodations', allocatedBudget: '3250', color: '#8b5cf6', icon: '🏨' },
    { category: 'activities', allocatedBudget: '1800', color: '#ef4444', icon: '🏎️' },
    { category: 'food', allocatedBudget: '1400', color: '#f59e0b', icon: '🍽️' },
    { category: 'entertainment', allocatedBudget: '700', color: '#06b6d4', icon: '🎭' },
    { category: 'transport', allocatedBudget: '200', color: '#10b981', icon: '🚕' },
    { category: 'shopping', allocatedBudget: '300', color: '#ec4899', icon: '🛍️' },
    { category: 'other', allocatedBudget: '200', color: '#6b7280', icon: '💵' },
  ];

  for (const cat of categories) {
    await db.insert(schema.budgetCategories).values({
      id: nanoid(),
      tripId: TRIP_ID,
      ...cat,
    });
  }
  console.log(`  ✅ ${categories.length} budget categories created`);

  // Comprehensive budget items (mid-tier estimates)
  const budgetItems = [
    // Flights
    { category: 'flights', description: 'Round-trip flights SAT↔LAS — Southwest nonstop (2 pax, F1 week)', estimatedCost: '700.00', date: '2026-11-17' },

    // Accommodations
    { category: 'accommodations', description: 'Hotel — 5 nights Strip (mid-tier, e.g. Cosmopolitan @ ~$600/night)', estimatedCost: '3000.00', date: '2026-11-17' },
    { category: 'accommodations', description: 'Resort fees (~$50/night × 5 nights)', estimatedCost: '250.00', date: '2026-11-17' },

    // F1 & Activities
    { category: 'activities', description: 'F1 Las Vegas GP — Sphere Grandstand tickets (2 pax, 3-day)', estimatedCost: '1400.00', date: '2026-11-19' },
    { category: 'activities', description: 'The Sphere Experience (2 tickets)', estimatedCost: '150.00', date: '2026-11-18' },
    { category: 'activities', description: 'High Roller Happy Half Hour (2 tickets)', estimatedCost: '120.00', date: '2026-11-18' },
    { category: 'activities', description: 'Valley of Fire day trip (park entry + gas)', estimatedCost: '40.00', date: '2026-11-19' },
    { category: 'activities', description: 'F1 Fan Zone food & drinks (3 days)', estimatedCost: '150.00', date: '2026-11-19' },

    // Entertainment/Shows
    { category: 'entertainment', description: 'Cirque du Soleil "O" — Bellagio (2 good seats)', estimatedCost: '400.00', date: '2026-11-18' },
    { category: 'entertainment', description: 'Absinthe — Caesars Palace (2 tickets)', estimatedCost: '300.00', date: '2026-11-19' },

    // Dining
    { category: 'food', description: 'Arrival night — In-N-Out + Secret Pizza (casual)', estimatedCost: '40.00', date: '2026-11-17' },
    { category: 'food', description: 'Gymkhana or Stubborn Seed dinner (trendy)', estimatedCost: '250.00', date: '2026-11-18' },
    { category: 'food', description: 'Delilah romantic dinner at Wynn', estimatedCost: '400.00', date: '2026-11-19' },
    { category: 'food', description: 'Bacchanal Buffet lunch (2 pax)', estimatedCost: '185.00', date: '2026-11-20' },
    { category: 'food', description: 'Casual dinner Fri evening', estimatedCost: '100.00', date: '2026-11-20' },
    { category: 'food', description: 'Race day — Milpa tacos lunch + pre-race apps', estimatedCost: '150.00', date: '2026-11-21' },
    { category: 'food', description: 'Wynn Buffet farewell brunch (2 pax)', estimatedCost: '160.00', date: '2026-11-22' },
    { category: 'food', description: 'Coffee, snacks, drinks throughout trip', estimatedCost: '120.00', date: '2026-11-17' },

    // Transport
    { category: 'transport', description: 'SAT airport parking (6 days)', estimatedCost: '80.00', date: '2026-11-17' },
    { category: 'transport', description: 'LAS airport ↔ hotel rideshare (round trip)', estimatedCost: '60.00', date: '2026-11-17' },
    { category: 'transport', description: 'Rideshare during trip (5 days, incl. F1 surge)', estimatedCost: '100.00', date: '2026-11-17' },
    { category: 'transport', description: 'Monorail day passes (2 days)', estimatedCost: '26.00', date: '2026-11-19' },

    // Shopping/Misc
    { category: 'shopping', description: 'F1 merchandise (team gear, souvenirs)', estimatedCost: '150.00', date: '2026-11-19' },
    { category: 'shopping', description: 'General souvenirs & gifts', estimatedCost: '100.00', date: '2026-11-20' },
    { category: 'shopping', description: 'Packing supplies (hand warmers, clear bags, etc.)', estimatedCost: '30.00', date: '2026-11-15' },

    // Other
    { category: 'other', description: 'Tips — valet, bellhop, housekeeping, bartenders', estimatedCost: '150.00', date: '2026-11-17' },
    { category: 'other', description: 'Misc incidentals', estimatedCost: '50.00', date: '2026-11-17' },
  ];

  for (const item of budgetItems) {
    await db.insert(schema.budgetItems).values({
      id: nanoid(),
      tripId: TRIP_ID,
      ...item,
    });
  }
  console.log(`  ✅ ${budgetItems.length} budget items created`);

  // Update trip total budget to mid-tier estimate
  await db.update(schema.trips)
    .set({ totalBudget: '8300.00', updatedAt: new Date() })
    .where(eq(schema.trips.id, TRIP_ID));
  console.log('  ✅ Trip total budget updated to $8,300 (mid-tier estimate)');

  // Summary
  const totalEst = budgetItems.reduce((sum, item) => sum + parseFloat(item.estimatedCost), 0);
  console.log(`\n📊 Budget Summary (Mid-Tier):`);
  console.log(`  Total estimated: $${totalEst.toFixed(2)}`);
  console.log(`  Per person: $${(totalEst / 2).toFixed(2)}`);
  console.log(`\n  Low estimate:  ~$4,115 total (~$2,058/person)`);
  console.log(`  Mid estimate:  ~$8,300 total (~$4,150/person)`);
  console.log(`  High estimate: ~$15,200 total (~$7,600/person)`);

  await sql.end();
  console.log('\n✅ Vegas budget seed complete!');
}

seed().catch(console.error);
