/**
 * Vegas F1 2026 — Logistics & Packing List
 * Populates: packingItems, budgetItems (logistics costs)
 * Usage: bun run scripts/seed-vegas-logistics-packing.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../src/db/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

const TRIP_ID = '2el8do_u2fmjxf5DU9bf1';

async function seedPackingList() {
  console.log('🧳 Seeding packing list and logistics budget items...\n');

  // ── Packing Items ────────────────────────────────────
  const packingItems: Array<{
    tripId: string; name: string; category: string;
    quantity: number; priority: string; notes?: string;
  }> = [
    // Clothing
    { tripId: TRIP_ID, name: 'T-shirts / casual tops', category: 'clothing', quantity: 4, priority: 'normal' },
    { tripId: TRIP_ID, name: 'Long-sleeve base layer shirts', category: 'clothing', quantity: 2, priority: 'high', notes: 'For race night layering' },
    { tripId: TRIP_ID, name: 'Warm fleece or down jacket', category: 'clothing', quantity: 1, priority: 'essential', notes: 'Race night temps ~45°F' },
    { tripId: TRIP_ID, name: 'Light windbreaker/shell', category: 'clothing', quantity: 1, priority: 'high' },
    { tripId: TRIP_ID, name: 'Smart casual top (button-down/blouse)', category: 'clothing', quantity: 1, priority: 'normal', notes: 'For nice dinners' },
    { tripId: TRIP_ID, name: 'Jeans / casual pants', category: 'clothing', quantity: 2, priority: 'normal' },
    { tripId: TRIP_ID, name: 'Smart casual pants/dress', category: 'clothing', quantity: 1, priority: 'normal', notes: 'Nice dinner attire' },
    { tripId: TRIP_ID, name: 'Comfortable leggings or joggers', category: 'clothing', quantity: 1, priority: 'normal', notes: 'Race day layering' },
    { tripId: TRIP_ID, name: 'Comfortable walking shoes', category: 'clothing', quantity: 1, priority: 'essential', notes: 'Strip walking — miles per day' },
    { tripId: TRIP_ID, name: 'Smart casual shoes', category: 'clothing', quantity: 1, priority: 'normal', notes: 'Dinners and shows' },
    { tripId: TRIP_ID, name: 'Warm beanie/hat', category: 'accessories', quantity: 1, priority: 'high', notes: 'Race night' },
    { tripId: TRIP_ID, name: 'Light scarf or neck gaiter', category: 'accessories', quantity: 1, priority: 'normal' },
    { tripId: TRIP_ID, name: 'Warm socks', category: 'clothing', quantity: 3, priority: 'normal' },
    { tripId: TRIP_ID, name: 'Sunglasses', category: 'accessories', quantity: 1, priority: 'normal' },
    { tripId: TRIP_ID, name: 'Underwear', category: 'clothing', quantity: 6, priority: 'essential' },

    // Toiletries
    { tripId: TRIP_ID, name: 'Sunscreen', category: 'toiletries', quantity: 1, priority: 'high', notes: 'Desert sun even in November' },
    { tripId: TRIP_ID, name: 'Lip balm with SPF', category: 'toiletries', quantity: 1, priority: 'high' },
    { tripId: TRIP_ID, name: 'Moisturizer', category: 'toiletries', quantity: 1, priority: 'high', notes: 'Desert air is very dry' },
    { tripId: TRIP_ID, name: 'Hand lotion', category: 'toiletries', quantity: 1, priority: 'normal' },
    { tripId: TRIP_ID, name: 'Basic toiletries kit', category: 'toiletries', quantity: 1, priority: 'essential' },
    { tripId: TRIP_ID, name: 'Medications', category: 'toiletries', quantity: 1, priority: 'essential' },

    // Electronics
    { tripId: TRIP_ID, name: 'Phone charger', category: 'electronics', quantity: 1, priority: 'essential' },
    { tripId: TRIP_ID, name: 'Portable battery pack', category: 'electronics', quantity: 1, priority: 'essential', notes: 'Race day is 6+ hours out' },
    { tripId: TRIP_ID, name: 'Earbuds/headphones', category: 'electronics', quantity: 1, priority: 'normal' },
    { tripId: TRIP_ID, name: 'Earplugs (noise protection)', category: 'electronics', quantity: 2, priority: 'essential', notes: 'F1 cars are extremely loud' },

    // Documents
    { tripId: TRIP_ID, name: 'Photo ID / drivers license', category: 'documents', quantity: 1, priority: 'essential' },
    { tripId: TRIP_ID, name: 'F1 race tickets (saved offline)', category: 'documents', quantity: 1, priority: 'essential' },
    { tripId: TRIP_ID, name: 'Hotel confirmation', category: 'documents', quantity: 1, priority: 'essential' },
    { tripId: TRIP_ID, name: 'Credit cards + cash for tips', category: 'documents', quantity: 1, priority: 'essential' },

    // General / Misc
    { tripId: TRIP_ID, name: 'Clear bag/tote (F1 policy)', category: 'accessories', quantity: 1, priority: 'essential', notes: 'Required for circuit entry' },
    { tripId: TRIP_ID, name: 'Small daypack/crossbody', category: 'accessories', quantity: 1, priority: 'normal' },
    { tripId: TRIP_ID, name: 'Reusable water bottle', category: 'general', quantity: 1, priority: 'high', notes: 'Stay hydrated — desert air' },
    { tripId: TRIP_ID, name: 'Hand warmers', category: 'general', quantity: 4, priority: 'normal', notes: 'Cheap insurance for race night' },
    { tripId: TRIP_ID, name: 'Snacks/granola bars', category: 'snacks', quantity: 1, priority: 'normal', notes: 'For race day' },
    { tripId: TRIP_ID, name: 'Rain poncho (compact)', category: 'general', quantity: 1, priority: 'low' },
  ];

  console.log(`  Inserting ${packingItems.length} packing items...`);
  await db.insert(schema.packingItems).values(packingItems);

  // ── Logistics Budget Items ───────────────────────────
  const logisticsBudget = [
    { tripId: TRIP_ID, category: 'transport', description: 'Airport rideshare SAT (round trip)', estimatedCost: '50.00' },
    { tripId: TRIP_ID, category: 'transport', description: 'LAS airport to hotel rideshare (round trip)', estimatedCost: '50.00' },
    { tripId: TRIP_ID, category: 'transport', description: 'Rideshare during trip (5 days)', estimatedCost: '150.00', notes: 'Surge pricing during F1 weekend' },
    { tripId: TRIP_ID, category: 'transport', description: 'Las Vegas Monorail day passes', estimatedCost: '40.00' },
    { tripId: TRIP_ID, category: 'other', description: 'Tips (valets, bartenders, etc.)', estimatedCost: '100.00' },
    { tripId: TRIP_ID, category: 'other', description: 'Packing supplies (hand warmers, clear bags, etc.)', estimatedCost: '30.00' },
    { tripId: TRIP_ID, category: 'transport', description: 'Airport parking SAT (6 days)', estimatedCost: '80.00' },
  ];

  console.log(`  Inserting ${logisticsBudget.length} logistics budget items...`);
  await db.insert(schema.budgetItems).values(logisticsBudget);

  console.log('\n✅ Packing list and logistics budget seeded!');
  await client.end();
}

seedPackingList().catch(e => { console.error(e); process.exit(1); });
