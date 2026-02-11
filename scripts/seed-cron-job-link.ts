/**
 * Seeds the trip_cron_jobs table with Italy research cron jobs.
 * 
 * Usage: bun run scripts/seed-cron-job-link.ts
 */
import { db } from '../src/db';
import { tripCronJobs } from '../src/db/schema';
import { eq, inArray } from 'drizzle-orm';

const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh';

const CRON_JOBS = [
  {
    id: 'tcj_italy_ideas_001',
    cronJobId: 'dd463a6c-599c-4a4e-ae36-b3bb63720e3b',
    name: 'Italy Trip Ideas',
    schedule: '0 10 * * 1,3,5',
    description: 'Research amazing places and activities for the Italy trip (June 10 - July 10, 2026). Home base: Contrà S. Rocco 60, Vicenza, VI 36100, Italy.',
    scriptPath: 'scripts/cron-italy-trip-ideas.ts',
  },
  {
    id: 'tcj_italy_daily_001',
    cronJobId: 'ee574b7d-6aad-4b5f-bf47-c4cc64831f94',
    name: 'Italy Trip Daily',
    schedule: '0 14 * * *',
    description: 'Daily research focusing on rotating areas: Vicenza, day trips, food, events, hidden gems.',
    scriptPath: 'scripts/cron-italy-trip-daily.ts',
  },
];

async function seed() {
  console.log('🌱 Seeding trip cron jobs...\n');
  
  for (const job of CRON_JOBS) {
    // Check if already exists
    const existing = await db.select()
      .from(tripCronJobs)
      .where(eq(tripCronJobs.cronJobId, job.cronJobId));
    
    if (existing.length > 0) {
      console.log(`⏭️  ${job.name} already exists, skipping.`);
      continue;
    }
    
    // Calculate next run
    const now = new Date();
    let nextRun = new Date(now);
    
    if (job.schedule === '0 10 * * 1,3,5') {
      // Mon/Wed/Fri at 10 AM
      nextRun.setHours(10, 0, 0, 0);
      const dayOfWeek = now.getDay();
      const daysUntilNext = dayOfWeek === 1 ? 2 : dayOfWeek === 3 ? 2 : dayOfWeek === 5 ? 3 : 1;
      nextRun.setDate(now.getDate() + daysUntilNext);
    } else {
      // Daily at 2 PM
      nextRun.setHours(14, 0, 0, 0);
      nextRun.setDate(now.getDate() + 1);
    }
    
    await db.insert(tripCronJobs).values({
      id: job.id,
      tripId: TRIP_ID,
      cronJobId: job.cronJobId,
      name: job.name,
      schedule: job.schedule,
      description: job.description,
      enabled: true,
      lastRun: now,
      lastStatus: 'success',
      nextRun,
    });
    
    console.log(`✅ Created: ${job.name}`);
    console.log(`   Schedule: ${job.schedule}`);
    console.log(`   Script: ${job.scriptPath}`);
    console.log(`   Next run: ${nextRun.toISOString()}\n`);
  }
  
  console.log('🎉 Cron job seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
