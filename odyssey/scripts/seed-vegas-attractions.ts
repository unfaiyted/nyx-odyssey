/**
 * Vegas attractions & experiences — destination highlights for F1 2026 trip
 * Usage: bun run scripts/seed-vegas-attractions.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../src/db/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

const VEGAS_DEST_ID = 'Uz6JyIvdeg0h8bPYe8y7R';
const TRIP_ID = '2el8do_u2fmjxf5DU9bf1';

async function seedVegasAttractions() {
  console.log('🎰 Seeding Vegas attractions & experiences...\n');

  // Get current highest orderIndex
  const existingHighlights = await db.select().from(schema.destinationHighlights)
    .where(eq(schema.destinationHighlights.destinationId, VEGAS_DEST_ID))
    .orderBy(schema.destinationHighlights.orderIndex);

  let nextOrder = existingHighlights.length > 0
    ? Math.max(...existingHighlights.map(h => h.orderIndex ?? 0)) + 1
    : 0;

  const highlights = [
    {
      destinationId: VEGAS_DEST_ID,
      title: "The Sphere — Immersive Experience",
      description: "The must-see Vegas attraction. 366-foot LED sphere with 16K wraparound interior screen — the highest resolution in the world. Immersive films ~1 hour. Tickets $50-100/person. The exterior Exosphere light show is free to watch from the Strip. Book ahead — F1 week will sell out. WORTH THE PREMIUM.",
      category: 'attraction',
      priceLevel: 3,
      address: '255 Sands Ave, Las Vegas, NV 89169',
      lat: 36.1209,
      lng: -115.1653,
      websiteUrl: 'https://www.thespherevegas.com',
      duration: '1-2 hours',
      rating: 4.8,
      orderIndex: nextOrder++,
    },
    {
      destinationId: VEGAS_DEST_ID,
      title: "High Roller Observation Wheel",
      description: "World's tallest observation wheel at 550 feet. 30-minute rotation with panoramic Strip views. Daytime $25-35, nighttime $35-45 (recommended). Happy Half Hour pod ~$55-65/person with open bar — great date activity. Worth it especially at night.",
      category: 'attraction',
      priceLevel: 2,
      address: '3545 S Las Vegas Blvd, Las Vegas, NV 89109',
      lat: 36.1172,
      lng: -115.1685,
      websiteUrl: 'https://www.caesars.com/linq/high-roller',
      duration: '30 minutes',
      rating: 4.5,
      orderIndex: nextOrder++,
    },
    {
      destinationId: VEGAS_DEST_ID,
      title: "Grand Canyon Helicopter Tour",
      description: "3-4 hour helicopter tour from Vegas to Grand Canyon West Rim. Includes canyon floor landing and champagne at some packages. $300-500/person. Unforgettable aerial views — worth the splurge if you've never seen the Grand Canyon. Operators: Maverick, Papillon, Sundance. Book early for F1 week.",
      category: 'activity',
      priceLevel: 4,
      lat: 36.0127,
      lng: -114.0371,
      duration: '3-4 hours',
      rating: 4.7,
      orderIndex: nextOrder++,
    },
    {
      destinationId: VEGAS_DEST_ID,
      title: "Valley of Fire State Park",
      description: "Stunning red sandstone formations, petroglyphs, and easy hikes just 1 hour from the Strip. $10/vehicle entry. November weather is perfect. Top trails: Fire Wave (1.5mi, easy), White Domes Loop (1mi), Elephant Rock. Best at sunrise/sunset. HIGHLY RECOMMENDED — affordable and spectacular.",
      category: 'nature',
      priceLevel: 1,
      address: '29450 Valley of Fire Hwy, Overton, NV 89040',
      lat: 36.4410,
      lng: -114.5131,
      websiteUrl: 'https://parks.nv.gov/parks/valley-of-fire',
      duration: '3-5 hours',
      rating: 4.9,
      orderIndex: nextOrder++,
    },
    {
      destinationId: VEGAS_DEST_ID,
      title: "Hoover Dam",
      description: "Engineering marvel 45 min from the Strip. Guided interior dam tour ~$30/person. Great views from the bypass bridge. Easy half-day trip, can combine with lunch in Boulder City. Worth it for the history and scale.",
      category: 'attraction',
      priceLevel: 1,
      address: 'Hoover Dam, Boulder City, NV',
      lat: 36.0160,
      lng: -114.7377,
      websiteUrl: 'https://www.usbr.gov/lc/hooverdam/',
      duration: '3-4 hours',
      rating: 4.5,
      orderIndex: nextOrder++,
    },
    {
      destinationId: VEGAS_DEST_ID,
      title: "Meow Wolf's Omega Mart at Area15",
      description: "Immersive art experience — a surreal grocery store that opens into otherworldly environments. ~$50/person. Weird, wonderful, very Instagram-worthy. Allow 2-3 hours to explore. Great for couples who enjoy art and the unexpected.",
      category: 'attraction',
      priceLevel: 2,
      address: '3215 S Rancho Dr, Las Vegas, NV 89102',
      lat: 36.1267,
      lng: -115.1761,
      websiteUrl: 'https://meowwolf.com/visit/las-vegas',
      duration: '2-3 hours',
      rating: 4.6,
      orderIndex: nextOrder++,
    },
    {
      destinationId: VEGAS_DEST_ID,
      title: "Cirque du Soleil Shows",
      description: "Multiple world-class shows on the Strip: O (water-based at Bellagio), Mystère (Treasure Island), KÀ (MGM Grand), Love/Beatles (Mirage). $80-200/person. Book well ahead for F1 week. Classic Vegas entertainment — at least one show is worth seeing.",
      category: 'nightlife',
      priceLevel: 3,
      lat: 36.1126,
      lng: -115.1767,
      duration: '1.5-2 hours',
      rating: 4.7,
      orderIndex: nextOrder++,
    },
    {
      destinationId: VEGAS_DEST_ID,
      title: "Fremont Street Experience",
      description: "Free light show on a massive LED canopy covering 5 blocks of downtown's Fremont Street. Old Vegas vibe with live music, street performers, and affordable food. The SlotZilla zipline ($25-55) runs above the crowd. Fun evening activity.",
      category: 'attraction',
      priceLevel: 1,
      address: 'Fremont St, Las Vegas, NV 89101',
      lat: 36.1707,
      lng: -115.1423,
      websiteUrl: 'https://vegasexperience.com',
      duration: '2-3 hours',
      rating: 4.3,
      orderIndex: nextOrder++,
    },
    {
      destinationId: VEGAS_DEST_ID,
      title: "Las Vegas Strip Night Helicopter Flight",
      description: "12-15 minute helicopter flight over the illuminated Strip at night. ~$100-150/person. Beautiful views but very short — more of a special-occasion splurge than a must-do. Skip unless you really want the aerial perspective.",
      category: 'activity',
      priceLevel: 3,
      lat: 36.0840,
      lng: -115.1537,
      duration: '12-15 minutes',
      rating: 4.2,
      orderIndex: nextOrder++,
    },
    {
      destinationId: VEGAS_DEST_ID,
      title: "Grand Canyon Skywalk (West Rim)",
      description: "Glass-bottomed horseshoe walkway extending 70 feet over the Grand Canyon. ~$30/person + $50 park entry. Part of a day trip (2.5 hours by car or helicopter from Vegas). Thrilling views straight down 4,000 feet. Worth combining with a Grand Canyon day trip.",
      category: 'attraction',
      priceLevel: 3,
      lat: 36.0124,
      lng: -113.8109,
      websiteUrl: 'https://grandcanyonwest.com/explore/skywalk/',
      duration: 'full day trip',
      rating: 4.4,
      orderIndex: nextOrder++,
    },
  ];

  // Insert highlights
  for (const highlight of highlights) {
    await db.insert(schema.destinationHighlights).values(highlight);
  }
  console.log(`✅ Added ${highlights.length} attraction highlights`);

  // Add budget items for key attractions
  const budgetItems = [
    { tripId: TRIP_ID, category: 'activities', description: 'The Sphere Experience (2 tickets)', estimatedCost: '150.00', date: '2026-11-18' },
    { tripId: TRIP_ID, category: 'activities', description: 'High Roller Happy Half Hour (2 tickets)', estimatedCost: '120.00', date: '2026-11-19' },
    { tripId: TRIP_ID, category: 'activities', description: 'Valley of Fire day trip (vehicle entry + gas)', estimatedCost: '40.00', date: '2026-11-20' },
    { tripId: TRIP_ID, category: 'activities', description: 'Cirque du Soleil show (2 tickets)', estimatedCost: '300.00', date: '2026-11-19' },
  ];

  for (const item of budgetItems) {
    await db.insert(schema.budgetItems).values(item);
  }
  console.log(`✅ Added ${budgetItems.length} budget items`);

  console.log('\n🎰 Vegas attractions research complete!');
  await client.end();
  process.exit(0);
}

seedVegasAttractions().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
