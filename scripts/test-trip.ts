import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, inArray } from 'drizzle-orm';
import * as schema from '../src/db/schema';

const sql = postgres('postgresql://postgres:postgres@localhost:5432/odyssey');
const db = drizzle(sql, { schema });

async function test() {
  const tripId = 'LMp0E_5U2QFsNL-MoGDHh';
  
  console.log('Testing trip query...');
  const [trip] = await db.select().from(schema.trips).where(eq(schema.trips.id, tripId));
  console.log('Trip:', trip?.name);
  
  console.log('Testing travelers...');
  const travelers = await db.select().from(schema.tripTravelers).where(eq(schema.tripTravelers.tripId, tripId));
  console.log('Travelers:', travelers.length);
  
  console.log('Testing events...');
  const dests = await db.select().from(schema.tripDestinations).where(eq(schema.tripDestinations.tripId, tripId));
  const destIds = dests.map(d => d.id);
  console.log('Dest IDs:', destIds.length);
  
  if (destIds.length > 0) {
    const events = await db.select().from(schema.destinationEvents).where(inArray(schema.destinationEvents.destinationId, destIds));
    console.log('Events:', events.length);
  }
  
  console.log('✅ All queries work');
  await sql.end();
}

test().catch(e => { console.error('❌', e.message); process.exit(1); });
