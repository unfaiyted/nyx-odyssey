/**
 * Seeds the trip_cron_jobs table with the Italy research cron job association.
 * Links cron job dd463a6c-599c-4a4e-ae36-b3bb63720e3b to the Italy 2026 trip.
 *
 * Usage: bun run scripts/seed-cron-job-link.ts
 */
import { db } from '../src/db';
import { tripCronJobs } from '../src/db/schema';
import { eq } from 'drizzle-orm';

const CRON_JOB_ID = 'dd463a6c-599c-4a4e-ae36-b3bb63720e3b';
const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh';

async function seed() {
  // Check if already exists
  const existing = await db.select().from(tripCronJobs).where(eq(tripCronJobs.cronJobId, CRON_JOB_ID));
  if (existing.length > 0) {
    console.log('Cron job link already exists, skipping.');
    process.exit(0);
  }

  await db.insert(tripCronJobs).values({
    id: 'tcj_italy_research_001',
    tripId: TRIP_ID,
    cronJobId: CRON_JOB_ID,
    name: 'Italy Trip Ideas',
    schedule: '0 10 * * 1,3,5',
    description: 'Research amazing places and activities for the Italy trip (June 10 - July 10, 2026). Home base: Contrà S. Rocco 60, Vicenza, VI 36100, Italy.',
    enabled: true,
    lastRun: new Date('2026-02-06T16:00:00.001Z'),
    lastStatus: 'success',
    nextRun: new Date('2026-02-09T16:00:00Z'),
  });

  console.log('✅ Linked Italy research cron job to Italy 2026 trip.');
  process.exit(0);
}

seed().catch(console.error);
