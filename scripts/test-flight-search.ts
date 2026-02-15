import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../src/db/schema';

const sql = postgres('postgresql://postgres:postgres@localhost:5432/odyssey');
const db = drizzle(sql, { schema });

async function test() {
  try {
    const results = await db.query.flightSearches.findMany({
      where: eq(schema.flightSearches.tripId, '2el8do_u2fmjxf5DU9bf1'),
      with: { options: { with: { priceHistory: true } } },
    });
    console.log('Searches:', results.length);
    console.log('First search options:', results[0]?.options?.length);
    console.log('✅ Query works');
  } catch (e: any) {
    console.error('❌', e.message);
  }
  await sql.end();
}
test();
