import { getDb } from '../src/db';
const db = getDb();
import { destinations, routes } from '../src/db/schema';

const sampleDestinations = [
  { name: 'San Francisco, CA', description: 'Starting point', lat: 37.7749, lng: -122.4194, address: 'San Francisco, CA', category: 'start', orderIndex: 0, plannedDate: '2026-06-01' },
  { name: 'Yosemite National Park', description: 'Nature stop', lat: 37.8651, lng: -119.5383, address: 'Yosemite Valley, CA', category: 'stop', orderIndex: 1, plannedDate: '2026-06-03' },
  { name: 'Las Vegas, NV', description: 'Entertainment stop', lat: 36.1699, lng: -115.1398, address: 'Las Vegas, NV', category: 'stop', orderIndex: 2, plannedDate: '2026-06-05' },
  { name: 'Grand Canyon', description: 'Must-see landmark', lat: 36.1069, lng: -112.1129, address: 'Grand Canyon Village, AZ', category: 'poi', orderIndex: 3, plannedDate: '2026-06-07' },
  { name: 'Denver, CO', description: 'Final destination', lat: 39.7392, lng: -104.9903, address: 'Denver, CO', category: 'end', orderIndex: 4, plannedDate: '2026-06-10' },
];

async function seed() {
  console.log('Seeding destinations...');

  // Clear existing
  await db.delete(routes);
  await db.delete(destinations);

  // Insert destinations
  const inserted = await db.insert(destinations).values(sampleDestinations).returning();
  console.log(`Inserted ${inserted.length} destinations`);

  // Insert routes between consecutive stops
  const routeData = [
    { from: 0, to: 1, distanceMiles: 167, durationMinutes: 180 },
    { from: 1, to: 2, distanceMiles: 389, durationMinutes: 360 },
    { from: 2, to: 3, distanceMiles: 278, durationMinutes: 270 },
    { from: 3, to: 4, distanceMiles: 602, durationMinutes: 540 },
  ];

  for (const r of routeData) {
    await db.insert(routes).values({
      fromDestinationId: inserted[r.from].id,
      toDestinationId: inserted[r.to].id,
      distanceMiles: r.distanceMiles,
      durationMinutes: r.durationMinutes,
    });
  }
  console.log(`Inserted ${routeData.length} routes`);
  console.log('Done!');
  process.exit(0);
}

seed().catch(console.error);
