import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';

let _db: PostgresJsDatabase<typeof schema> | null = null;

export function getDb() {
  if (!_db) {
    const client = postgres(connectionString);
    _db = drizzle(client, { schema });
  }
  return _db;
}

export * from './schema';
