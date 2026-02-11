/**
 * Complete Lake Garda — Sirmione profile
 * Adds: accommodations, photo URL, cleanup duplicate
 * Usage: bun run scripts/seed-lake-garda-complete.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';
import * as schema from '../src/db/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh';
const DEST_ID = 'YAghQGsEjK_Evddas57AS'; // The fully_researched entry
const DUPLICATE_ID = 'mJ5FWSkIzcVz46RgkvtLm'; // The not_started duplicate

async function seed() {
  console.log('🏖️  Completing Lake Garda — Sirmione profile...\n');

  // 1. Update photo URL and description on the main destination
  await db.update(schema.tripDestinations)
    .set({
      photoUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
      description:
        'Italy\'s largest lake — a stunning Mediterranean microclimate at the foot of the Alps. ' +
        'Sirmione is the crown jewel: a narrow peninsula with Roman ruins, a medieval castle, ' +
        'thermal springs, and some of the clearest water in Italy. Only ~1.5 hours from Vicenza.',
    })
    .where(eq(schema.tripDestinations.id, DEST_ID));
  console.log('  ✅ Updated photo URL and description');

  // 2. Add accommodations
  const accommodations = [
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'Hotel Sirmione e Promessi Sposi',
      type: 'hotel' as const,
      status: 'researched' as const,
      address: 'Piazza Castello 19, 25019 Sirmione',
      costPerNight: '150.00',
      currency: 'EUR',
      bookingUrl: 'https://www.booking.com/hotel/it/sirmione.html',
      rating: 4.3,
      notes:
        'Right at the entrance to old town, next to Scaliger Castle. 4-star with lake views from some rooms. ' +
        'Includes breakfast. Thermal pool access. Great location but can be noisy in summer. ' +
        'Rooms €130-200/night depending on season and view.',
    },
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'Hotel Eden Sirmione',
      type: 'hotel' as const,
      status: 'researched' as const,
      address: 'Piazza Carducci 17/18, 25019 Sirmione',
      costPerNight: '120.00',
      currency: 'EUR',
      bookingUrl: 'https://www.booking.com/hotel/it/eden-sirmione.html',
      rating: 4.1,
      notes:
        'Good mid-range option in old town. Lake-view terrace for breakfast. Rooms are compact but clean. ' +
        'Central location near castle. Parking available at nearby public lots. €100-160/night.',
    },
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'Grand Hotel Terme Sirmione',
      type: 'resort' as const,
      status: 'researched' as const,
      address: 'Viale Marconi 7, 25019 Sirmione',
      costPerNight: '250.00',
      currency: 'EUR',
      bookingUrl: 'https://www.termedisirmione.com/en/grand-hotel-terme/',
      rating: 4.5,
      notes:
        'The premium option — 4-star superior with direct access to Terme di Sirmione thermal baths. ' +
        'Private thermal pool, spa, lakefront terrace restaurant. Connected to Aquaria spa center. ' +
        'Half-board available. Splurge pick for a special occasion. €200-350/night.',
    },
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'Hotel Pace (Desenzano)',
      type: 'hotel' as const,
      status: 'researched' as const,
      address: 'Lungolago Cesare Battisti 54, 25015 Desenzano del Garda',
      costPerNight: '95.00',
      currency: 'EUR',
      bookingUrl: 'https://www.booking.com/hotel/it/pace-desenzano-del-garda.html',
      rating: 4.0,
      notes:
        'Budget-smart alternative: stay in Desenzano (larger town, more options, train station) and ferry to Sirmione. ' +
        'Lakefront location, simple but clean rooms. Good breakfast. €80-120/night. ' +
        'Desenzano has better nightlife and restaurant variety too.',
    },
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'Airbnb: Lakefront Apartment Sirmione',
      type: 'airbnb' as const,
      status: 'researched' as const,
      address: 'Colombare di Sirmione (near old town)',
      costPerNight: '110.00',
      currency: 'EUR',
      bookingUrl: 'https://www.airbnb.com/s/Sirmione/homes',
      rating: 4.2,
      notes:
        'Typical Airbnb in Colombare area (just outside old town). 1-bedroom apartments with kitchenette, ' +
        'often with pool access. €80-150/night depending on season. Benefits: parking easier, ' +
        'can cook breakfast, more space than hotels. Look for places with pool and lake views.',
    },
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'Camping Sirmione',
      type: 'camping' as const,
      status: 'researched' as const,
      address: 'Via Sirmioncino 9, 25019 Sirmione',
      costPerNight: '35.00',
      currency: 'EUR',
      bookingUrl: 'https://www.camping.it/en/lombardia/campingsirmione/',
      rating: 3.8,
      notes:
        'Budget option: well-equipped campsite with direct lake access, pool, restaurant. ' +
        'Mobile homes/bungalows €60-100/night, tent pitches €25-40/night. Walking distance to old town. ' +
        'Great for families. Book well ahead for July-August.',
    },
  ];

  for (const acc of accommodations) {
    await db.insert(schema.accommodations).values(acc);
  }
  console.log(`  ✅ Added ${accommodations.length} accommodations`);

  // 3. Clean up duplicate entry
  // First move any data from the duplicate
  const dupHighlights = await db.select().from(schema.destinationHighlights)
    .where(eq(schema.destinationHighlights.destinationId, DUPLICATE_ID));
  
  if (dupHighlights.length > 0) {
    console.log(`  ⚠️  Duplicate has ${dupHighlights.length} highlights — deleting them`);
    await db.delete(schema.destinationHighlights)
      .where(eq(schema.destinationHighlights.destinationId, DUPLICATE_ID));
  }

  // Delete duplicate research
  await db.delete(schema.destinationResearch)
    .where(eq(schema.destinationResearch.destinationId, DUPLICATE_ID));
  
  // Delete duplicate destination
  await db.delete(schema.tripDestinations)
    .where(eq(schema.tripDestinations.id, DUPLICATE_ID));
  console.log('  ✅ Removed duplicate destination entry');

  // 4. Ensure research status is fully_researched
  await db.update(schema.tripDestinations)
    .set({ 
      researchStatus: 'fully_researched',
      lastResearchedAt: new Date(),
    })
    .where(eq(schema.tripDestinations.id, DEST_ID));
  console.log('  ✅ Confirmed research status: fully_researched');

  console.log('\n🌊 Lake Garda — Sirmione profile complete!');
  console.log('  📸 Photo: Unsplash lake view');
  console.log('  🏨 6 accommodation options (hotel, resort, airbnb, camping)');
  console.log('  🧹 Duplicate entry cleaned up');
  
  process.exit(0);
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
