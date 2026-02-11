/**
 * Seed Bologna food tour itinerary items
 * Usage: bun run scripts/seed-bologna-food.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { nanoid } from 'nanoid';
import * as schema from '../src/db/schema';

const CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const sql = postgres(CONNECTION_STRING);
const db = drizzle(sql, { schema });

const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh'; // Italy 2026
const BOLOGNA_DEST_ID = 'BrSNJbsXkTvO2pP7kipvj';

// We don't know the exact date yet, use a placeholder
const DATE = 'TBD';

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
    title: 'Travel to Bologna',
    description: '1.5 hr drive or train from Vicenza. Train ~€15-25 roundtrip.',
    startTime: '08:30',
    endTime: '10:00',
    location: 'Vicenza → Bologna',
    category: 'transport',
    orderIndex: 0,
  },
  {
    title: 'Explore Quadrilatero Market',
    description: 'Bologna\'s historic food market district. Medieval streets with food stalls, delis, fresh pasta shops. Key street: Via Pescherie Vecchie. Adjacent to Piazza Maggiore. Also visit Mercato di Mezzo indoor food hall.',
    startTime: '10:00',
    endTime: '11:30',
    location: 'Quadrilatero, Bologna',
    category: 'sightseeing',
    orderIndex: 1,
  },
  {
    title: 'Pasta-Making Cooking Class',
    description: 'Hands-on cooking class learning to make traditional Bologna pasta (tortellini, tagliatelle). Options: Taste Bologna (tastebologna.net, max 10 guests, €60-150/person), Cookly (home-based with local families), or GetYourGuide classes. Book in advance!',
    startTime: '11:30',
    endTime: '14:00',
    location: 'Bologna (varies by provider)',
    category: 'activity',
    orderIndex: 2,
  },
  {
    title: 'Lunch',
    description: 'Either included with cooking class or grab lunch at Salumeria Simoni (house-made mortadella, salumi) or graze at Mercato di Mezzo. Must-try: tortellini in brodo, tagliatelle al ragù, mortadella, crescentine.',
    startTime: '14:00',
    endTime: '15:00',
    location: 'Quadrilatero / Salumeria Simoni, Bologna',
    category: 'meal',
    orderIndex: 3,
  },
  {
    title: 'Two Towers & Piazza Maggiore',
    description: 'Walk to the iconic Two Towers (Asinelli & Garisenda). Stroll through Piazza Maggiore, see Basilica di San Petronio. Great photo ops.',
    startTime: '15:00',
    endTime: '16:00',
    location: 'Piazza Maggiore / Due Torri, Bologna',
    category: 'sightseeing',
    orderIndex: 4,
  },
  {
    title: 'Aperitivo at Enoteca Storica Facciolo',
    description: 'Natural wine bar in the historic center. Walls lined floor-to-ceiling with bottles. Focus on Emilia-Romagna wines. Local salumi, cheeses, lasagna verdi.',
    startTime: '16:00',
    endTime: '16:45',
    location: 'Enoteca Storica Facciolo, Bologna',
    category: 'meal',
    orderIndex: 5,
  },
  {
    title: 'Passeggiata at Piazza Santo Stefano',
    description: 'Evening stroll through one of Bologna\'s most beautiful piazzas. Visit the Basilica di Santo Stefano complex (Seven Churches).',
    startTime: '16:45',
    endTime: '17:30',
    location: 'Piazza Santo Stefano, Bologna',
    category: 'sightseeing',
    orderIndex: 6,
  },
  {
    title: 'Dinner',
    description: 'Top picks: Drogheria della Rosa (no menu, daily market-fresh, old pharmacy setting) — book ahead. Alt: Ristorante Diana (iconic since 1919, tortellini in brodo), Osteria la Traviata (handmade tortellini daily), or Da Cesari (rustic, full traditional course). Budget: €30-50/person.',
    startTime: '18:00',
    endTime: '19:30',
    location: 'Drogheria della Rosa / Ristorante Diana, Bologna',
    category: 'meal',
    orderIndex: 7,
  },
  {
    title: 'Return to Vicenza',
    description: '1.5 hr drive or train back.',
    startTime: '19:30',
    endTime: '21:00',
    location: 'Bologna → Vicenza',
    category: 'transport',
    orderIndex: 8,
  },
];

async function seed() {
  console.log('Seeding Bologna food tour itinerary items...');

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

  console.log(`\nDone! Added ${items.length} itinerary items for Bologna food tour.`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
