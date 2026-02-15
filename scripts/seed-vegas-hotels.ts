/**
 * Vegas F1 2026 — Hotel Research
 * Populates: accommodations, budget_items
 * Usage: bun run scripts/seed-vegas-hotels.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../src/db/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

const TRIP_ID = '2el8do_u2fmjxf5DU9bf1';
const VEGAS_DEST_ID = 'Uz6JyIvdeg0h8bPYe8y7R';

async function seedVegasHotels() {
  console.log('🏨 Seeding Vegas F1 2026 hotel research...\n');

  // Clear existing hotel accommodations for this trip
  await db.delete(schema.accommodations).where(eq(schema.accommodations.tripId, TRIP_ID));
  console.log('🗑️  Cleared existing accommodations');

  const hotels = [
    // Luxury Tier
    {
      tripId: TRIP_ID,
      destinationId: VEGAS_DEST_ID,
      name: 'Wynn Las Vegas / Encore',
      type: 'hotel' as const,
      status: 'researched' as const,
      address: '3131 Las Vegas Blvd S, Las Vegas, NV 89109',
      checkIn: '2026-11-17',
      checkOut: '2026-11-22',
      costPerNight: '1150.00',
      totalCost: '5750.00',
      currency: 'USD',
      bookingUrl: 'https://www.wynn.com',
      rating: 4.7,
      notes: 'LUXURY — Directly on circuit near Turn 1. Potential track views from tower rooms. Top-tier restaurants (Mizumi, SW Steakhouse). Gorgeous pool. F1 packages may be mandatory. Most expensive option.',
    },
    {
      tripId: TRIP_ID,
      destinationId: VEGAS_DEST_ID,
      name: 'Bellagio',
      type: 'hotel' as const,
      status: 'researched' as const,
      address: '3600 Las Vegas Blvd S, Las Vegas, NV 89109',
      checkIn: '2026-11-17',
      checkOut: '2026-11-22',
      costPerNight: '950.00',
      totalCost: '4750.00',
      currency: 'USD',
      bookingUrl: 'https://bellagio.mgmresorts.com',
      rating: 4.6,
      notes: 'LUXURY — On the famous fountain straight. Fountain-view rooms = track views during F1. World-class dining (Lago, Prime, Jasmine). Central Strip. Fountain-view rooms command huge premiums.',
    },
    {
      tripId: TRIP_ID,
      destinationId: VEGAS_DEST_ID,
      name: 'The Cosmopolitan',
      type: 'hotel' as const,
      status: 'shortlisted' as const,
      address: '3708 Las Vegas Blvd S, Las Vegas, NV 89109',
      checkIn: '2026-11-17',
      checkOut: '2026-11-22',
      costPerNight: '850.00',
      totalCost: '4250.00',
      currency: 'USD',
      bookingUrl: 'https://www.cosmopolitanlasvegas.com',
      rating: 4.7,
      notes: '⭐ TOP PICK — LUXURY. Adjacent to Bellagio fountain straight. Modern/trendy, excellent restaurants (Momofuku, Beauty & Essex, Scarpetta). Terrace rooms with Strip/track views. Great cocktail bars. Best balance of luxury, dining, and F1 proximity for a couple.',
    },
    {
      tripId: TRIP_ID,
      destinationId: VEGAS_DEST_ID,
      name: 'The Venetian / Palazzo',
      type: 'hotel' as const,
      status: 'researched' as const,
      address: '3355 Las Vegas Blvd S, Las Vegas, NV 89109',
      checkIn: '2026-11-17',
      checkOut: '2026-11-22',
      costPerNight: '800.00',
      totalCost: '4000.00',
      currency: 'USD',
      bookingUrl: 'https://www.venetianlasvegas.com',
      rating: 4.6,
      notes: 'LUXURY — All-suite rooms (~650 sqft). On circuit along LV Blvd straight. No resort fee if booked direct. Can feel convention-heavy.',
    },
    // Mid-Range Tier
    {
      tripId: TRIP_ID,
      destinationId: VEGAS_DEST_ID,
      name: 'The LINQ Hotel + Experience',
      type: 'hotel' as const,
      status: 'shortlisted' as const,
      address: '3535 Las Vegas Blvd S, Las Vegas, NV 89109',
      checkIn: '2026-11-17',
      checkOut: '2026-11-22',
      costPerNight: '350.00',
      totalCost: '1750.00',
      currency: 'USD',
      bookingUrl: 'https://www.caesars.com/linq',
      rating: 4.1,
      notes: '⭐ BEST VALUE — Mid-range. Right on circuit, walkable to grandstands. LINQ Promenade dining/entertainment. High Roller wheel. Rooms are basic but location is unbeatable for the price.',
    },
    {
      tripId: TRIP_ID,
      destinationId: VEGAS_DEST_ID,
      name: 'Flamingo Las Vegas',
      type: 'hotel' as const,
      status: 'researched' as const,
      address: '3555 Las Vegas Blvd S, Las Vegas, NV 89109',
      checkIn: '2026-11-17',
      checkOut: '2026-11-22',
      costPerNight: '300.00',
      totalCost: '1500.00',
      currency: 'USD',
      bookingUrl: 'https://www.caesars.com/flamingo-las-vegas',
      rating: 3.9,
      notes: 'MID-RANGE — Cheapest trackside option. Iconic Vegas property. Center-strip. Dated rooms, smoky casino, basic amenities.',
    },
    {
      tripId: TRIP_ID,
      destinationId: VEGAS_DEST_ID,
      name: 'Park MGM',
      type: 'hotel' as const,
      status: 'researched' as const,
      address: '3770 Las Vegas Blvd S, Las Vegas, NV 89109',
      checkIn: '2026-11-17',
      checkOut: '2026-11-22',
      costPerNight: '400.00',
      totalCost: '2000.00',
      currency: 'USD',
      bookingUrl: 'https://parkmgm.mgmresorts.com',
      rating: 4.3,
      notes: 'MID-RANGE — Recently renovated, boutique feel. Eataly inside. NoMad upgrade option. South end of circuit, slightly farther from main F1 action.',
    },
    {
      tripId: TRIP_ID,
      destinationId: VEGAS_DEST_ID,
      name: 'Planet Hollywood',
      type: 'hotel' as const,
      status: 'researched' as const,
      address: '3667 Las Vegas Blvd S, Las Vegas, NV 89109',
      checkIn: '2026-11-17',
      checkOut: '2026-11-22',
      costPerNight: '350.00',
      totalCost: '1750.00',
      currency: 'USD',
      bookingUrl: 'https://www.caesars.com/planet-hollywood',
      rating: 4.0,
      notes: 'MID-RANGE — Center-strip, on circuit near south turns. Connected to Miracle Mile Shops. Strip-view rooms may see track. Room quality varies.',
    },
    // Budget Tier
    {
      tripId: TRIP_ID,
      destinationId: VEGAS_DEST_ID,
      name: 'Virgin Hotels Las Vegas',
      type: 'hotel' as const,
      status: 'researched' as const,
      address: '4455 Paradise Rd, Las Vegas, NV 89169',
      checkIn: '2026-11-17',
      checkOut: '2026-11-22',
      costPerNight: '225.00',
      totalCost: '1125.00',
      currency: 'USD',
      bookingUrl: 'https://www.virginhotelslv.com',
      rating: 4.4,
      notes: 'BUDGET — Off-strip (~10 min rideshare). Modern rooms, great pool, good restaurants. Much cheaper than Strip. Not walkable to F1.',
    },
    {
      tripId: TRIP_ID,
      destinationId: VEGAS_DEST_ID,
      name: 'Residence Inn Convention Center',
      type: 'hotel' as const,
      status: 'researched' as const,
      address: '3225 Paradise Rd, Las Vegas, NV 89109',
      checkIn: '2026-11-17',
      checkOut: '2026-11-22',
      costPerNight: '275.00',
      totalCost: '1375.00',
      currency: 'USD',
      bookingUrl: 'https://www.marriott.com',
      rating: 4.2,
      notes: 'BUDGET — Off-strip. Suite-style with kitchenette. Free breakfast. Marriott points. Quieter, no casino (pro for this trip). ~15 min walk or 5 min rideshare to circuit.',
    },
  ];

  for (const hotel of hotels) {
    await db.insert(schema.accommodations).values(hotel);
  }
  console.log(`✅ Added ${hotels.length} hotel options`);

  // Add accommodation budget item
  await db.insert(schema.budgetItems).values({
    tripId: TRIP_ID,
    category: 'accommodation',
    description: 'Hotel — 5 nights on/near Strip (F1 surge pricing). Range: $1,125–5,750 depending on tier. Top picks: Cosmopolitan (~$4,250) or LINQ (~$1,750)',
    estimatedCost: '3000.00',
    date: '2026-11-17',
  });
  console.log('✅ Added accommodation budget item');

  console.log('\n🏨 Vegas hotel research seeded!');
  
  await client.end();
  process.exit(0);
}

seedVegasHotels().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
