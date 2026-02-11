/**
 * Seed Lake Como day trip itinerary items
 * Day trip from Vicenza — logistics and schedule
 * Usage: bun run scripts/seed-lake-como.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { nanoid } from 'nanoid';
import * as schema from '../src/db/schema';

const CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const sql = postgres(CONNECTION_STRING);
const db = drizzle(sql, { schema });

const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh'; // Italy 2026
const DATE = 'TBD';

// ── Destination entry ──────────────────────────────────
const destination = {
  tripId: TRIP_ID,
  name: 'Lake Como',
  description:
    'Stunning alpine lake surrounded by elegant villas, lush gardens, and charming villages. ' +
    'A long but rewarding day trip from Vicenza (~3h drive each way). ' +
    'Best towns to visit: Bellagio (the "Pearl of Lake Como"), Varenna (quieter, picturesque), ' +
    'and Como (largest town, lakefront promenade). Ferry connects the main villages. ' +
    'Drive via A4 to Milan then A9 north to Como, or scenic route via Bergamo/Lecco.',
  lat: 45.9871,
  lng: 9.2575,
  arrivalDate: null as string | null,
  departureDate: null as string | null,
  photoUrl: null as string | null,
  status: 'researched' as const,
  researchStatus: 'researched' as const,
  orderIndex: 20,
};

// ── Itinerary items ────────────────────────────────────
const items: Array<{
  title: string;
  description: string;
  startTime?: string;
  endTime?: string;
  location: string;
  category: string;
  orderIndex: number;
}> = [
  {
    title: 'Drive Vicenza → Como',
    description:
      'Approx 3h drive (270 km). Route: A4 west toward Milan, exit onto A9 north to Como. ' +
      'Tolls ~€15-20 each way. Alternative: train Vicenza → Milano Centrale (1h45 Frecciarossa, ~€25-35) ' +
      'then Milano → Como/Varenna (Trenord regional, ~1h, €5-13). ' +
      'Driving is more flexible for lake exploration. Leave early to maximize the day.',
    startTime: '06:00',
    endTime: '09:00',
    location: 'Vicenza → Como',
    category: 'transport',
    orderIndex: 0,
  },
  {
    title: 'Morning in Como Town',
    description:
      'Park at Autosilo Valmulini (covered garage near center, ~€2/hr) or lakefront lots. ' +
      'Walk the Lungo Lario promenade. Visit the Duomo di Como (Gothic-Renaissance cathedral, free entry). ' +
      'Stroll through Piazza Cavour and the old walled town.',
    startTime: '09:00',
    endTime: '10:30',
    location: 'Como',
    category: 'sightseeing',
    orderIndex: 1,
  },
  {
    title: 'Funicular to Brunate',
    description:
      'Take the historic funicular from Como up to Brunate (7 min ride, ~€6 roundtrip). ' +
      'Panoramic views of the entire lake, Alps, and on clear days the Milan skyline. ' +
      'Short walk to the Faro Voltiano lighthouse for even better views. ' +
      'Runs every 15-30 minutes.',
    startTime: '10:30',
    endTime: '11:30',
    location: 'Brunate, Como',
    category: 'activity',
    orderIndex: 2,
  },
  {
    title: 'Ferry: Como → Bellagio',
    description:
      'Take the Navigazione Laghi fast hydrofoil (servizio rapido) from Como to Bellagio. ' +
      'About 45 min, ~€12-16 one way. Slower battello (car ferry) takes ~2h but is cheaper (~€8). ' +
      'Buy tickets at the dock or navigazionelaghi.it. Boats run roughly hourly. ' +
      'The ride itself is spectacular — villas, gardens, and mountains gliding by.',
    startTime: '11:45',
    endTime: '12:30',
    location: 'Como → Bellagio ferry',
    category: 'transport',
    orderIndex: 3,
  },
  {
    title: 'Lunch in Bellagio',
    description:
      'The "Pearl of Lake Como." Wander the stepped alleyways of the old town. ' +
      'Lunch options: Ristorante Bilacus (local classics, lake fish, €15-25 mains), ' +
      'Aperitivo et Al (lakeside terrace, lighter fare), or grab focaccia/pizza al taglio ' +
      'from a takeaway shop and eat by the waterfront. Must-try: missoltini (dried lake fish), ' +
      'risotto with perch, polenta.',
    startTime: '12:30',
    endTime: '14:00',
    location: 'Bellagio',
    category: 'meal',
    orderIndex: 4,
  },
  {
    title: 'Gardens of Villa Melzi',
    description:
      'Neoclassical villa with stunning lakefront gardens (open Mar-Oct, ~€8 entry). ' +
      'Japanese garden section, ancient trees, sculpture, and incredible lake views. ' +
      'Allow 45-60 min. Alternative: Villa Serbelloni gardens (Rockefeller Foundation, ' +
      'guided tours only, ~€12, book ahead).',
    startTime: '14:00',
    endTime: '15:00',
    location: 'Villa Melzi, Bellagio',
    category: 'sightseeing',
    orderIndex: 5,
  },
  {
    title: 'Ferry: Bellagio → Varenna',
    description:
      'Quick 15-min ferry hop across the lake to Varenna (~€5). ' +
      'Ferries run frequently between the three central-lake towns (Bellagio, Varenna, Menaggio).',
    startTime: '15:15',
    endTime: '15:30',
    location: 'Bellagio → Varenna ferry',
    category: 'transport',
    orderIndex: 6,
  },
  {
    title: 'Explore Varenna',
    description:
      'Quieter and arguably more charming than Bellagio. Walk the Passeggiata degli Innamorati ' +
      '(Lovers\' Walk) — a narrow lakeside path clinging to the cliff. ' +
      'Visit Villa Monastero gardens (€10, stunning terraced lakefront gardens). ' +
      'Wander the colorful lanes. Grab a gelato at the waterfront.',
    startTime: '15:30',
    endTime: '17:00',
    location: 'Varenna',
    category: 'sightseeing',
    orderIndex: 7,
  },
  {
    title: 'Aperitivo by the Lake',
    description:
      'Sunset drinks at Bar Il Molo (right on the water in Varenna) or ' +
      'Hotel Royal Victoria terrace. Negroni sbagliato with a view. ' +
      'Soak in the golden hour light on the mountains.',
    startTime: '17:00',
    endTime: '17:45',
    location: 'Varenna waterfront',
    category: 'meal',
    orderIndex: 8,
  },
  {
    title: 'Ferry back to Como (or drive from Varenna)',
    description:
      'Option A: Ferry Varenna → Como (~1h hydrofoil, last boats around 19:00-20:00 in summer). ' +
      'Option B: If you drove and left car in Como, take the ferry back. ' +
      'Option C: If flexible, drive the eastern shore road SS36 from Varenna to Lecco (30 min) ' +
      'then A4 back to Vicenza (2.5h) — saves doubling back to Como.',
    startTime: '18:00',
    endTime: '19:00',
    location: 'Varenna → Como / Lecco',
    category: 'transport',
    orderIndex: 9,
  },
  {
    title: 'Drive back to Vicenza',
    description:
      'From Como: ~3h via A9/A4. From Lecco/Varenna: ~2.5h via SS36 to A4. ' +
      'Consider stopping for dinner en route in Bergamo or Brescia if hungry. ' +
      'Bergamo Alta (upper town) has excellent restaurants and is a worthy 1-hour detour.',
    startTime: '19:00',
    endTime: '22:00',
    location: 'Como/Lecco → Vicenza',
    category: 'transport',
    orderIndex: 10,
  },
];

async function seed() {
  console.log('🏔️💧 Seeding Lake Como day trip...\n');

  // Insert destination
  const destId = nanoid();
  await db.insert(schema.tripDestinations).values({
    id: destId,
    ...destination,
  });
  console.log(`  ✓ Destination: ${destination.name}`);

  // Insert itinerary items
  for (const item of items) {
    await db.insert(schema.itineraryItems).values({
      id: nanoid(),
      tripId: TRIP_ID,
      title: item.title,
      description: item.description,
      date: DATE,
      startTime: item.startTime,
      endTime: item.endTime,
      location: item.location,
      category: item.category,
      orderIndex: item.orderIndex,
    });
    console.log(`  ✓ ${item.title}`);
  }

  console.log(`\n✅ Done! Added Lake Como destination + ${items.length} itinerary items.`);
  console.log('\n📋 Summary:');
  console.log('   Drive: ~3h each way (270km via A4/A9), tolls ~€30-40 roundtrip');
  console.log('   Train alt: Vicenza→Milano→Como/Varenna, ~3-3.5h, €40-60 roundtrip');
  console.log('   Ferry day pass: ~€30-40 (or buy individual tickets ~€5-16 per leg)');
  console.log('   Key stops: Como → Brunate → Bellagio → Varenna');
  console.log('   Budget estimate: €80-120/person (transport + food + entries)');
  console.log('   ⚠️  Long day (6:00-22:00). Consider overnight stay to make it relaxed.');

  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
