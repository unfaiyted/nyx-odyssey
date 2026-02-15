import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { nanoid } from 'nanoid';
import * as schema from '../src/db/schema';

const sql = postgres('postgresql://postgres:postgres@localhost:5432/odyssey');
const db = drizzle(sql, { schema });

async function seed() {
  // Create the trip
  const tripId = nanoid();
  console.log('Trip ID:', tripId);
  
  await db.insert(schema.trips).values({
    id: tripId,
    name: 'Las Vegas F1 Grand Prix 2026',
    description: 'F1 Las Vegas Grand Prix weekend with Gretchen. Race is Saturday night November 21st.',
    startDate: '2026-11-17',
    endDate: '2026-11-22',
    status: 'planning',
    totalBudget: '5000.00',
    currency: 'USD',
  });

  // Create Las Vegas as the main destination
  const vegasId = nanoid();
  await db.insert(schema.tripDestinations).values({
    id: vegasId,
    tripId,
    name: 'Las Vegas',
    description: 'The Entertainment Capital of the World. Home of the F1 Las Vegas Grand Prix on the iconic Strip circuit.',
    lat: 36.1699,
    lng: -115.1398,
    arrivalDate: '2026-11-17',
    departureDate: '2026-11-22',
    status: 'researched',
    researchStatus: 'pending',
    orderIndex: 0,
  });

  // Budget categories
  const categories = [
    { category: 'flights', allocatedBudget: '800', color: '#3b82f6', icon: '✈️' },
    { category: 'accommodations', allocatedBudget: '1500', color: '#8b5cf6', icon: '🏨' },
    { category: 'activities', allocatedBudget: '1500', color: '#ef4444', icon: '🏎️' },
    { category: 'food', allocatedBudget: '800', color: '#f59e0b', icon: '🍽️' },
    { category: 'transport', allocatedBudget: '200', color: '#10b981', icon: '🚕' },
    { category: 'shopping', allocatedBudget: '200', color: '#ec4899', icon: '🛍️' },
  ];
  
  for (const cat of categories) {
    await db.insert(schema.budgetCategories).values({
      tripId,
      ...cat,
    });
  }

  console.log('Vegas destination ID:', vegasId);
  console.log('✅ Las Vegas F1 trip seeded!');
  await sql.end();
}

seed().catch(console.error);
