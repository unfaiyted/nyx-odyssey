/**
 * Seed Vegas F1 2026 flight research data
 * Populates: flights, budget_items
 * Usage: bun run scripts/seed-vegas-flights.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';
import * as schema from '../src/db/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

const TRIP_ID = '2el8do_u2fmjxf5DU9bf1';
const DEST_ID = 'Uz6JyIvdeg0h8bPYe8y7R';

async function seedVegasFlights() {
  console.log('✈️  Seeding Vegas F1 2026 flight research...\n');

  // --- Flight options (researched, not yet booked) ---
  const flightOptions = [
    // Southwest nonstop options
    {
      tripId: TRIP_ID,
      airline: 'Southwest Airlines',
      flightNumber: 'WN TBD',
      departureAirport: 'SAT',
      departureCity: 'San Antonio',
      arrivalAirport: 'LAS',
      arrivalCity: 'Las Vegas',
      departureDate: '2026-11-17',
      departureTime: '08:00',
      arrivalDate: '2026-11-17',
      arrivalTime: '09:45',
      duration: '2h 45m',
      class: 'economy',
      status: 'researched',
      notes: 'RECOMMENDED — Nonstop SAT→LAS. 2 free checked bags per person. Free changes/cancellations. Est. $250-400/person RT during F1 week. Morning departure gets to Vegas by ~10am local.',
      orderIndex: 0,
    },
    {
      tripId: TRIP_ID,
      airline: 'Southwest Airlines',
      flightNumber: 'WN TBD',
      departureAirport: 'LAS',
      departureCity: 'Las Vegas',
      arrivalAirport: 'SAT',
      arrivalCity: 'San Antonio',
      departureDate: '2026-11-22',
      departureTime: '15:00',
      arrivalDate: '2026-11-22',
      arrivalTime: '19:45',
      duration: '2h 45m',
      class: 'economy',
      status: 'researched',
      notes: 'Return flight — afternoon departure allows last morning in Vegas. Arrives SAT ~7:45pm.',
      orderIndex: 1,
    },
    // Spirit nonstop (budget option)
    {
      tripId: TRIP_ID,
      airline: 'Spirit Airlines',
      flightNumber: 'NK TBD',
      departureAirport: 'SAT',
      departureCity: 'San Antonio',
      arrivalAirport: 'LAS',
      arrivalCity: 'Las Vegas',
      departureDate: '2026-11-17',
      departureTime: '10:30',
      arrivalDate: '2026-11-17',
      arrivalTime: '11:20',
      duration: '2h 50m',
      class: 'economy',
      status: 'researched',
      notes: 'Budget option — nonstop. Low base fare ($80-150/pp RT normal, $150-300 F1 week) but bag fees add $100-200+ RT per person. 28" seat pitch.',
      orderIndex: 2,
    },
    {
      tripId: TRIP_ID,
      airline: 'Spirit Airlines',
      flightNumber: 'NK TBD',
      departureAirport: 'LAS',
      departureCity: 'Las Vegas',
      arrivalAirport: 'SAT',
      arrivalCity: 'San Antonio',
      departureDate: '2026-11-22',
      departureTime: '14:00',
      arrivalDate: '2026-11-22',
      arrivalTime: '18:50',
      duration: '2h 50m',
      class: 'economy',
      status: 'researched',
      notes: 'Spirit return — budget option with bag fee caveats.',
      orderIndex: 3,
    },
    // American via DFW
    {
      tripId: TRIP_ID,
      airline: 'American Airlines',
      flightNumber: 'AA TBD',
      departureAirport: 'SAT',
      departureCity: 'San Antonio',
      arrivalAirport: 'LAS',
      arrivalCity: 'Las Vegas',
      departureDate: '2026-11-17',
      departureTime: '07:00',
      arrivalDate: '2026-11-17',
      arrivalTime: '11:30',
      duration: '5h 30m (1 stop DFW)',
      class: 'economy',
      status: 'researched',
      notes: 'Connecting via DFW. $300-500/pp RT during F1 week. AAdvantage miles. 1-2h layover at DFW.',
      orderIndex: 4,
    },
    {
      tripId: TRIP_ID,
      airline: 'American Airlines',
      flightNumber: 'AA TBD',
      departureAirport: 'LAS',
      departureCity: 'Las Vegas',
      arrivalAirport: 'SAT',
      arrivalCity: 'San Antonio',
      departureDate: '2026-11-22',
      departureTime: '13:00',
      arrivalDate: '2026-11-22',
      arrivalTime: '20:30',
      duration: '5h 30m (1 stop DFW)',
      class: 'economy',
      status: 'researched',
      notes: 'American return via DFW.',
      orderIndex: 5,
    },
    // United via IAH
    {
      tripId: TRIP_ID,
      airline: 'United Airlines',
      flightNumber: 'UA TBD',
      departureAirport: 'SAT',
      departureCity: 'San Antonio',
      arrivalAirport: 'LAS',
      arrivalCity: 'Las Vegas',
      departureDate: '2026-11-17',
      departureTime: '06:30',
      arrivalDate: '2026-11-17',
      arrivalTime: '11:00',
      duration: '5h 30m (1 stop IAH)',
      class: 'economy',
      status: 'researched',
      notes: 'Connecting via Houston IAH. $300-500/pp RT during F1 week. MileagePlus miles.',
      orderIndex: 6,
    },
    {
      tripId: TRIP_ID,
      airline: 'United Airlines',
      flightNumber: 'UA TBD',
      departureAirport: 'LAS',
      departureCity: 'Las Vegas',
      arrivalAirport: 'SAT',
      arrivalCity: 'San Antonio',
      departureDate: '2026-11-22',
      departureTime: '12:00',
      arrivalDate: '2026-11-22',
      arrivalTime: '19:30',
      duration: '6h 30m (1 stop IAH/DEN)',
      class: 'economy',
      status: 'researched',
      notes: 'United return via IAH or DEN.',
      orderIndex: 7,
    },
  ];

  // Delete existing researched flights for this trip
  const existingFlights = await db.select().from(schema.flights)
    .where(eq(schema.flights.tripId, TRIP_ID));
  
  if (existingFlights.length > 0) {
    await db.delete(schema.flights).where(eq(schema.flights.tripId, TRIP_ID));
    console.log(`🗑️  Cleared ${existingFlights.length} existing flights`);
  }

  // Insert flight options
  for (const flight of flightOptions) {
    await db.insert(schema.flights).values(flight);
  }
  console.log(`✅ Inserted ${flightOptions.length} flight options`);

  // --- Budget item for flights ---
  // Check if flight budget item already exists
  const existingBudget = await db.select().from(schema.budgetItems)
    .where(and(
      eq(schema.budgetItems.tripId, TRIP_ID),
      eq(schema.budgetItems.category, 'transport'),
      eq(schema.budgetItems.description, 'Round-trip flights SAT↔LAS (2 passengers)')
    ));

  if (existingBudget.length === 0) {
    await db.insert(schema.budgetItems).values({
      tripId: TRIP_ID,
      category: 'transport',
      description: 'Round-trip flights SAT↔LAS (2 passengers)',
      estimatedCost: '700.00', // Mid-range estimate for Southwest RT x2 during F1 week
      date: '2026-11-17',
    });
    console.log('✅ Added flight budget item ($700 est. for 2 pax RT)');
  } else {
    console.log('ℹ️  Flight budget item already exists');
  }

  console.log('\n✈️  Vegas flight research seeding complete!');
  await client.end();
}

seedVegasFlights().catch(console.error);
