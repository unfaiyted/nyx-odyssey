/**
 * Seed travel essentials packing items for Italy 2026 trip
 * Includes European adapters, walking shoes, and other purchase items
 * Usage: bun run scripts/seed-travel-essentials.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { nanoid } from 'nanoid';
import * as schema from '../src/db/schema';

const CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const sql = postgres(CONNECTION_STRING);
const db = drizzle(sql, { schema });

const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh'; // Italy 2026

interface PackingEssential {
  name: string;
  category: string;
  quantity: number;
  priority: string;
  purchased: boolean;
  purchaseUrl: string | null;
  estimatedPrice: string | null;
  notes: string | null;
}

const essentials: PackingEssential[] = [
  // ── Electronics & Adapters ───────────────────────────
  {
    name: 'European Travel Adapter (Type C/F)',
    category: 'electronics',
    quantity: 2,
    priority: 'essential',
    purchased: false,
    purchaseUrl: 'https://www.amazon.com/dp/B01DJ140LQ',
    estimatedPrice: '12.99',
    notes: 'Italy uses Type C/F outlets (Europlug). Get at least 2 — one for phone, one for laptop',
  },
  {
    name: 'Universal Travel Adapter with USB-C',
    category: 'electronics',
    quantity: 1,
    priority: 'high',
    purchased: false,
    purchaseUrl: 'https://www.amazon.com/dp/B0CG58LR83',
    estimatedPrice: '24.99',
    notes: 'All-in-one adapter with USB-C PD charging for multiple devices',
  },
  {
    name: 'Portable Power Bank (20000mAh)',
    category: 'electronics',
    quantity: 1,
    priority: 'high',
    purchased: false,
    purchaseUrl: 'https://www.amazon.com/dp/B0BXN61CMD',
    estimatedPrice: '29.99',
    notes: 'Long walking days need backup power for phone/camera',
  },
  {
    name: 'USB-C Charging Cable (6ft)',
    category: 'electronics',
    quantity: 2,
    priority: 'normal',
    purchased: false,
    purchaseUrl: null,
    estimatedPrice: '9.99',
    notes: null,
  },
  {
    name: 'Phone Camera Lens Kit',
    category: 'electronics',
    quantity: 1,
    priority: 'low',
    purchased: false,
    purchaseUrl: 'https://www.amazon.com/dp/B0BPC6MK2N',
    estimatedPrice: '19.99',
    notes: 'Wide-angle for architecture shots in Florence & Rome',
  },

  // ── Footwear ─────────────────────────────────────────
  {
    name: 'Comfortable Walking Shoes',
    category: 'clothing',
    quantity: 1,
    priority: 'essential',
    purchased: false,
    purchaseUrl: 'https://www.amazon.com/dp/B07QK1DJ58',
    estimatedPrice: '89.99',
    notes: 'Break in before trip! Need cobblestone-friendly soles. Merrell or Allbirds recommended',
  },
  {
    name: 'Hiking Shoes/Boots',
    category: 'clothing',
    quantity: 1,
    priority: 'essential',
    purchased: false,
    purchaseUrl: 'https://www.amazon.com/dp/B078SZ81HT',
    estimatedPrice: '119.99',
    notes: 'For Dolomites & Cinque Terre hikes. Waterproof, ankle support',
  },
  {
    name: 'Lightweight Sandals',
    category: 'clothing',
    quantity: 1,
    priority: 'normal',
    purchased: false,
    purchaseUrl: null,
    estimatedPrice: '39.99',
    notes: 'For evenings and casual walking',
  },

  // ── Clothing ─────────────────────────────────────────
  {
    name: 'Moisture-Wicking T-Shirts',
    category: 'clothing',
    quantity: 5,
    priority: 'high',
    purchased: false,
    purchaseUrl: null,
    estimatedPrice: '45.00',
    notes: 'Quick-dry material for hot July days',
  },
  {
    name: 'Lightweight Rain Jacket',
    category: 'clothing',
    quantity: 1,
    priority: 'high',
    purchased: false,
    purchaseUrl: 'https://www.amazon.com/dp/B07JN4KSD3',
    estimatedPrice: '49.99',
    notes: 'Packable — afternoon showers possible in mountains',
  },
  {
    name: 'Convertible Hiking Pants',
    category: 'clothing',
    quantity: 2,
    priority: 'normal',
    purchased: false,
    purchaseUrl: null,
    estimatedPrice: '55.00',
    notes: 'Zip-off legs for versatility',
  },
  {
    name: 'Merino Wool Socks',
    category: 'clothing',
    quantity: 5,
    priority: 'high',
    purchased: false,
    purchaseUrl: 'https://www.amazon.com/dp/B07B9K4VPQ',
    estimatedPrice: '34.99',
    notes: 'Anti-blister, moisture-wicking for long walking days',
  },
  {
    name: 'Swim Trunks',
    category: 'clothing',
    quantity: 2,
    priority: 'normal',
    purchased: false,
    purchaseUrl: null,
    estimatedPrice: '25.00',
    notes: 'Cinque Terre beaches, hotel pools',
  },
  {
    name: 'Nice Dinner Outfit',
    category: 'clothing',
    quantity: 1,
    priority: 'normal',
    purchased: false,
    purchaseUrl: null,
    estimatedPrice: null,
    notes: 'For Verona opera night and upscale restaurants',
  },

  // ── Toiletries ───────────────────────────────────────
  {
    name: 'Reef-Safe Sunscreen SPF 50+',
    category: 'toiletries',
    quantity: 2,
    priority: 'essential',
    purchased: false,
    purchaseUrl: null,
    estimatedPrice: '15.99',
    notes: 'July sun in Italy is brutal',
  },
  {
    name: 'Travel-Size Toiletry Kit',
    category: 'toiletries',
    quantity: 1,
    priority: 'normal',
    purchased: false,
    purchaseUrl: null,
    estimatedPrice: '12.00',
    notes: 'TSA-compliant bottles',
  },
  {
    name: 'Anti-Chafing Balm',
    category: 'toiletries',
    quantity: 1,
    priority: 'high',
    purchased: false,
    purchaseUrl: null,
    estimatedPrice: '8.99',
    notes: 'Essential for long walking days in summer heat',
  },
  {
    name: 'Insect Repellent',
    category: 'toiletries',
    quantity: 1,
    priority: 'normal',
    purchased: false,
    purchaseUrl: null,
    estimatedPrice: '7.99',
    notes: 'Mosquitoes near lakes and in the evening',
  },

  // ── Documents ────────────────────────────────────────
  {
    name: 'Passport (check expiry!)',
    category: 'documents',
    quantity: 1,
    priority: 'essential',
    purchased: false,
    purchaseUrl: null,
    estimatedPrice: null,
    notes: 'Must be valid 6+ months past travel date',
  },
  {
    name: 'Travel Insurance Documents',
    category: 'documents',
    quantity: 1,
    priority: 'essential',
    purchased: false,
    purchaseUrl: null,
    estimatedPrice: null,
    notes: 'Print physical copies as backup',
  },
  {
    name: 'Flight Confirmations (printed)',
    category: 'documents',
    quantity: 1,
    priority: 'high',
    purchased: false,
    purchaseUrl: null,
    estimatedPrice: null,
    notes: 'Hard copies in case of phone death',
  },
  {
    name: 'Accommodation Confirmations',
    category: 'documents',
    quantity: 1,
    priority: 'high',
    purchased: false,
    purchaseUrl: null,
    estimatedPrice: null,
    notes: 'All hotel/Airbnb bookings printed',
  },

  // ── Medications ──────────────────────────────────────
  {
    name: 'First Aid Kit (travel size)',
    category: 'medications',
    quantity: 1,
    priority: 'high',
    purchased: false,
    purchaseUrl: null,
    estimatedPrice: '14.99',
    notes: 'Band-aids, antiseptic, pain relievers, blister pads',
  },
  {
    name: 'Motion Sickness Medicine',
    category: 'medications',
    quantity: 1,
    priority: 'normal',
    purchased: false,
    purchaseUrl: null,
    estimatedPrice: '6.99',
    notes: 'For winding Amalfi/Cinque Terre roads',
  },
  {
    name: 'Prescription Medications',
    category: 'medications',
    quantity: 1,
    priority: 'essential',
    purchased: false,
    purchaseUrl: null,
    estimatedPrice: null,
    notes: 'Pack extra in case of travel delays. Keep in carry-on',
  },

  // ── Accessories ──────────────────────────────────────
  {
    name: 'Anti-Theft Crossbody Bag',
    category: 'accessories',
    quantity: 1,
    priority: 'high',
    purchased: false,
    purchaseUrl: 'https://www.amazon.com/dp/B07GSKGXTB',
    estimatedPrice: '32.99',
    notes: 'Pickpocket protection for Rome & Florence crowds',
  },
  {
    name: 'Packing Cubes Set',
    category: 'accessories',
    quantity: 1,
    priority: 'high',
    purchased: false,
    purchaseUrl: 'https://www.amazon.com/dp/B014VBIEZK',
    estimatedPrice: '22.99',
    notes: 'Organization for multi-city trip',
  },
  {
    name: 'Neck Pillow & Eye Mask',
    category: 'accessories',
    quantity: 1,
    priority: 'normal',
    purchased: false,
    purchaseUrl: null,
    estimatedPrice: '18.99',
    notes: 'Long flight comfort',
  },
  {
    name: 'Collapsible Water Bottle',
    category: 'accessories',
    quantity: 1,
    priority: 'normal',
    purchased: false,
    purchaseUrl: null,
    estimatedPrice: '14.99',
    notes: 'Fill at public fountains (Italy has many free water sources!)',
  },
  {
    name: 'Sunglasses (polarized)',
    category: 'accessories',
    quantity: 1,
    priority: 'normal',
    purchased: false,
    purchaseUrl: null,
    estimatedPrice: '24.99',
    notes: null,
  },
  {
    name: 'Daypack/Lightweight Backpack',
    category: 'accessories',
    quantity: 1,
    priority: 'high',
    purchased: false,
    purchaseUrl: null,
    estimatedPrice: '29.99',
    notes: 'Packable day bag for excursions',
  },
  {
    name: 'Luggage Lock (TSA-approved)',
    category: 'accessories',
    quantity: 2,
    priority: 'normal',
    purchased: false,
    purchaseUrl: null,
    estimatedPrice: '9.99',
    notes: null,
  },
];

async function seed() {
  console.log('🧳 Seeding travel essentials packing items...');

  // Run migration for new fields first
  try {
    await sql`ALTER TABLE packing_items ADD COLUMN IF NOT EXISTS priority text DEFAULT 'normal'`;
    await sql`ALTER TABLE packing_items ADD COLUMN IF NOT EXISTS purchased boolean DEFAULT false`;
    await sql`ALTER TABLE packing_items ADD COLUMN IF NOT EXISTS purchase_url text`;
    await sql`ALTER TABLE packing_items ADD COLUMN IF NOT EXISTS estimated_price numeric(8, 2)`;
    await sql`ALTER TABLE packing_items ADD COLUMN IF NOT EXISTS notes text`;
    console.log('✅ Schema migration applied');
  } catch (err) {
    console.log('ℹ️  Schema columns may already exist, continuing...');
  }

  const values = essentials.map(item => ({
    id: nanoid(),
    tripId: TRIP_ID,
    ...item,
  }));

  await db.insert(schema.packingItems).values(values);

  const totalEstimate = essentials
    .filter(i => i.estimatedPrice)
    .reduce((sum, i) => sum + parseFloat(i.estimatedPrice!), 0);

  const purchaseCount = essentials.filter(i => i.purchaseUrl).length;

  console.log(`✅ Seeded ${values.length} packing items`);
  console.log(`🛒 ${purchaseCount} items have purchase links`);
  console.log(`💰 Estimated total: $${totalEstimate.toFixed(2)}`);
  console.log(`⚡ Essential items: ${essentials.filter(i => i.priority === 'essential').length}`);

  await sql.end();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
