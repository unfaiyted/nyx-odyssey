/**
 * Seed Treviso — Complete Destination Profile
 * Prosecco country gateway, day trip from Vicenza
 * Usage: bun run scripts/seed-treviso-complete.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import * as schema from '../src/db/schema';

const CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const sql = postgres(CONNECTION_STRING);
const db = drizzle(sql, { schema });

const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh';
const DEST_ID = 'HQ3eof0v0Lcsvp_UKNmfz';

async function seed() {
  console.log('🥂 Seeding Treviso — Complete Destination Profile...\n');

  // ── 1. Update trip_destinations (description, photoUrl, status) ──
  await db.update(schema.tripDestinations)
    .set({
      description:
        'The "Little Venice" nobody told you about — a canal-laced gem of frescoed palaces, atmospheric fish markets, ' +
        'and the best cicchetti bars in the Veneto without the crowds. Treviso is the gateway to the UNESCO Prosecco Hills ' +
        'of Conegliano-Valdobbiadene, and proudly claims to be the birthplace of tiramisù. Visit in late autumn and the prized ' +
        'Radicchio di Treviso Tardivo — a flame-shaped, sweet-bitter chicory — becomes an obsession. Benetton was born here, ' +
        'the medieval water wheels still turn on the Cagnan canal, and the Prosecco flows like water. Compact enough for a ' +
        'morning stroll, but pair it with an afternoon in the Prosecco hills for the perfect full day from Vicenza.',
      photoUrl: 'https://images.unsplash.com/photo-1600267185393-e158a98703de?w=800&q=80',
      status: 'researched',
      researchStatus: 'fully_researched',
    })
    .where(eq(schema.tripDestinations.id, DEST_ID));
  console.log('  ✓ Updated description, photo, status');

  // ── 2. Destination Research ──
  // Delete existing research entry
  await db.delete(schema.destinationResearch)
    .where(eq(schema.destinationResearch.destinationId, DEST_ID));

  await db.insert(schema.destinationResearch).values({
    id: nanoid(),
    destinationId: DEST_ID,
    country: 'Italy',
    region: 'Veneto',
    timezone: 'Europe/Rome (CET/CEST)',
    language: 'Italian',
    currency: 'EUR',
    population: '~85,000 (metro ~265,000)',
    bestTimeToVisit: 'April–June for vineyards at their greenest. Nov–Feb for Radicchio Tardivo season and fewer crowds. Summer is hot and humid.',
    avgTempHighC: 19,
    avgTempLowC: 8,
    rainyDaysPerMonth: 8,
    weatherNotes:
      'Continental climate similar to Venice/Padua. Cold damp winters (Jan avg 3°C) with occasional fog, hot muggy summers (Jul avg 24°C). ' +
      'Spring and autumn are ideal. The Prosecco hills are slightly cooler and breezier than the plain.',
    dailyBudgetLow: '25',
    dailyBudgetMid: '60',
    dailyBudgetHigh: '120',
    transportNotes:
      'FROM VICENZA BY TRAIN: Vicenza → Venezia Mestre → Treviso Centrale, ~1hr 10min total (Regionale, €7-10 each way). ' +
      'Some direct trains exist (~1hr). Treviso Centrale is a 10-min walk from the old town. ' +
      'BY CAR: ~95km via A4/A27, ~1hr 15min. Free parking outside the walls at Parcheggio Ca\' dei Ricchi or Parcheggio Fiera. ' +
      'Car recommended if combining with Prosecco Hills — Valdobbiadene is 45min north with no practical train service. ' +
      'RECOMMENDATION: Car rental for combined Treviso + Prosecco Hills day trip. Morning in old town, afternoon driving ' +
      'through UNESCO Prosecco hills to Valdobbiadene. ' +
      'DAY TRIP VS OVERNIGHT: The old town is compact (3-4 hours covers highlights). Full day with car is the sweet spot ' +
      '(morning Treviso + afternoon Prosecco). Overnight not necessary unless you want a very relaxed pace or evening cicchetti crawl. ' +
      'LOCAL TRANSPORT: Entirely walkable old town. Bike-friendly.',
    nearestAirport: 'Treviso Airport (TSF) — Ryanair hub, marketed as "Venice-Treviso". Venice Marco Polo (VCE) — 30min.',
    safetyRating: 5,
    safetyNotes: 'Very safe, even at night. Minimal tourist infrastructure means minimal tourist scams.',
    culturalNotes:
      'Less English spoken than Venice — a few Italian phrases go a long way. Many shops close 12:30–15:30 for siesta. ' +
      'Fish market is Tue–Sat mornings (best before 11 AM). Benetton was founded here in 1965. ' +
      'Strong aperitivo and cicchetti culture — much cheaper than Venice.',
    summary:
      'Prosecco country gateway and tiramisù birthplace. "Little Venice" with canals, frescoed palaces, and the most atmospheric fish market ' +
      'in the Veneto — all without the crowds or prices. Pair with a Prosecco Hills afternoon for the perfect day trip from Vicenza.',
    travelTips: JSON.stringify([
      'Fish market (Isola della Pescheria) is best Tue-Sat before 11 AM.',
      'Cicchetti: €1-3 per piece, ombra (small wine) €1-2. Much cheaper than Venice.',
      'Full restaurant meal: €20-35pp.',
      'If visiting Nov-Feb, seek out Radicchio di Treviso Tardivo — the real deal is a protected IGP product.',
      'The Prosecco "vending machine" at Osteria Senz\'Oste near Valdobbiadene is an honesty-system farm shop — bring cash.',
      'Book winery visits ahead (Bisol, Perlage, Col Vetoraz). Tastings €10-20pp.',
      'San Nicolò church has the earliest known painting of eyeglasses — free entry, often overlooked.',
      'Fontana delle Tette (Fountain of the Breasts) once dispensed wine during festivals — quirky photo op.',
    ]),
  });
  console.log('  ✓ Destination research (transport, budget, tips)');

  // ── 3. Highlights — Attractions, Restaurants, Activities ──
  // Clear existing highlights
  await db.delete(schema.destinationHighlights)
    .where(eq(schema.destinationHighlights.destinationId, DEST_ID));

  const highlights = [
    // ATTRACTIONS
    {
      title: 'The Canals — "Little Venice"',
      description:
        'Buranelli Canal: the iconic postcard shot with ivy-draped balconies and pastel houses reflected in the water. ' +
        'Cagnan Grande: flows through the heart of the old town, powering medieval water wheels still turning today. ' +
        'Riviera Garibaldi: scenic walk with weeping willows. Much smaller and more intimate than Venice — "Venice\'s quieter, prettier cousin."',
      category: 'attraction',
      rating: 4.7,
      priceLevel: 1,
      address: 'Centro Storico, Treviso',
      duration: '30-45 min stroll',
      orderIndex: 0,
    },
    {
      title: 'Piazza dei Signori',
      description:
        'The main square and living room of Treviso. Framed by the 13th-century Palazzo dei Trecento (still in use as a council hall). ' +
        'Outdoor cafés under arcades — perfect morning espresso spot.',
      category: 'attraction',
      rating: 4.5,
      priceLevel: 1,
      address: 'Piazza dei Signori, 31100 Treviso',
      duration: '20-30 min',
      orderIndex: 1,
    },
    {
      title: 'Isola della Pescheria (Fish Market Island)',
      description:
        'A tiny island in the Cagnan canal hosting Treviso\'s fish market since the 1800s. Open Tue-Sat mornings (best before 11 AM). ' +
        'Surrounded by fruit and vegetable stalls on the adjacent canal banks. One of the most atmospheric market settings in the Veneto.',
      category: 'attraction',
      rating: 4.6,
      priceLevel: 1,
      address: 'Isola della Pescheria, 31100 Treviso',
      duration: '30 min',
      orderIndex: 2,
    },
    {
      title: 'San Nicolò Church',
      description:
        'Gothic gem with remarkable frescoes by Tommaso da Modena (1352). Famous for the earliest known painting of eyeglasses — ' +
        'a monk reading with spectacles, centuries before they were common. Adjacent Chapter House has 40 Dominican scholars at their desks, ' +
        'each with a distinct personality. Free entry, often overlooked by tourists.',
      category: 'attraction',
      rating: 4.5,
      priceLevel: 1,
      address: 'Via San Nicolò, 31100 Treviso',
      duration: '30-45 min',
      orderIndex: 3,
    },
    {
      title: 'The Duomo (Cathedral)',
      description:
        'Neoclassical façade hides interior treasures including Titian\'s Annunciation in the Malchiostro Chapel and works by Tullio Lombardo. Free entry.',
      category: 'attraction',
      rating: 4.2,
      priceLevel: 1,
      address: 'Piazza del Duomo, 31100 Treviso',
      duration: '20 min',
      orderIndex: 4,
    },
    {
      title: 'Fontana delle Tette ("Fountain of the Breasts")',
      description:
        'Hidden in a courtyard off Calle del Podestà. Under the Venetian Republic, it dispensed red and white wine during festivals. ' +
        'Current version is a replica (original damaged in WWII). Quirky photo op.',
      category: 'attraction',
      rating: 4.0,
      priceLevel: 1,
      address: 'Calmaggiore, 31100 Treviso',
      duration: '10 min',
      orderIndex: 5,
    },
    {
      title: 'Venetian City Walls & Gates',
      description:
        '500-year-old Venetian-era defensive walls still encircling the old town. Porta San Tomaso has the grand Lion of St. Mark. ' +
        'Bastione San Paolo offers the best viewpoint. Nice for a short perimeter stroll.',
      category: 'attraction',
      rating: 4.1,
      priceLevel: 1,
      address: 'Porta San Tomaso, 31100 Treviso',
      duration: '20-30 min',
      orderIndex: 6,
    },
    // PROSECCO ACTIVITIES
    {
      title: 'UNESCO Prosecco Hills Day Trip',
      description:
        'Treviso is the gateway to the Conegliano-Valdobbiadene Prosecco Superiore DOCG zone (UNESCO since 2019). ' +
        'Valdobbiadene is ~45min north by car. Cartizze is the grand cru — a tiny 107-hectare hilltop producing the finest Prosecco. ' +
        'Top wineries: Perlage (organic, 5-glass tasting), Bisol (historic Cartizze producer), Col Vetoraz (panoramic hilltop), ' +
        'Nino Franco (family-run since 1919). Book tastings ahead, €10-20pp.',
      category: 'activity',
      rating: 4.8,
      priceLevel: 2,
      address: 'Valdobbiadene, 45 min north of Treviso',
      duration: '4-5 hours (afternoon)',
      orderIndex: 7,
    },
    {
      title: 'Osteria Senz\'Oste — The Prosecco Vending Machine',
      description:
        'A farm shop on the honesty system near Valdobbiadene. Park among the grapevines, buy Prosecco from a vending machine. ' +
        'Also has cheese, salami, and bread — serve yourself, leave money in the box. Uniquely Italian and unmissable.',
      category: 'activity',
      rating: 4.7,
      priceLevel: 1,
      address: 'Near Valdobbiadene (Prosecco Hills)',
      duration: '30-45 min',
      orderIndex: 8,
    },
    // FOOD
    {
      title: 'Tiramisù — Born Here',
      description:
        'Treviso claims to be the birthplace of tiramisù. Two restaurants dispute the title: Le Beccherie (most widely credited, ' +
        'claims 1960s invention) and Toni del Spin. Try both and decide for yourself. This is a pilgrimage-worthy food experience.',
      category: 'food',
      rating: 4.8,
      priceLevel: 2,
      orderIndex: 9,
    },
    {
      title: 'Radicchio di Treviso Tardivo',
      description:
        'Season: November–February. The Tardivo variety is the star — sweet-bitter, crunchy, shaped like a purple flame. ' +
        'Grilled with olive oil, in risotto, or raw in salads. A protected IGP product and obsession of local cuisine. ' +
        'Radicchio festivals happen in January in surrounding towns. If visiting in season, this is an absolute must.',
      category: 'food',
      rating: 4.7,
      priceLevel: 2,
      orderIndex: 10,
    },
    // RESTAURANTS
    {
      title: 'Le Beccherie',
      description:
        'Historic restaurant claiming to be the birthplace of tiramisù (1960s). Classic Trevigiana cuisine in an atmospheric ' +
        'setting. The tiramisù here is the original recipe — worth the visit for that alone. €€-€€€.',
      category: 'food',
      rating: 4.6,
      priceLevel: 3,
      address: 'Piazza Ancilotto, 9, 31100 Treviso',
      websiteUrl: 'https://www.lebeccherie.it',
      duration: '1-1.5 hours',
      orderIndex: 11,
    },
    {
      title: 'Toni del Spin',
      description:
        'Traditional trattoria also claiming tiramisù origins. Beloved for hearty local Veneto dishes at fair prices. ' +
        'Lively atmosphere, no-frills but excellent. €€.',
      category: 'food',
      rating: 4.5,
      priceLevel: 2,
      address: 'Via Inferiore, 7, 31100 Treviso',
      duration: '1 hour',
      orderIndex: 12,
    },
    {
      title: 'Osteria Muscoli\'s',
      description:
        'Seafood osteria near the Pescheria fish market. Fresh catch prepared simply and beautifully. €€.',
      category: 'food',
      rating: 4.4,
      priceLevel: 2,
      address: 'Near Isola della Pescheria, Treviso',
      duration: '1 hour',
      orderIndex: 13,
    },
    {
      title: 'Trattoria all\'Antico Portico',
      description:
        'Traditional trattoria known for handmade pasta and radicchio specialties. Great for seasonal Treviso cuisine. €€.',
      category: 'food',
      rating: 4.4,
      priceLevel: 2,
      address: 'Centro Storico, Treviso',
      duration: '1 hour',
      orderIndex: 14,
    },
    // CICCHETTI BARS
    {
      title: 'Cicchetti Crawl — Treviso Bacari',
      description:
        'Treviso\'s cicchetti scene rivals Venice at a fraction of the price. Top bacari: Hostaria Dai Naneti (excellent small plates), ' +
        'Cantinetta Venegazzù (central), Enoteca Il Bacaro (wine selection), Bar Ai Porteghi (under Piazza arcades). ' +
        'Cicchetti €1-3 each, ombra (small wine) €1-2. Budget ~€10-15pp for a satisfying lunch.',
      category: 'food',
      rating: 4.6,
      priceLevel: 1,
      orderIndex: 15,
    },
  ];

  for (const h of highlights) {
    await db.insert(schema.destinationHighlights).values({
      id: nanoid(),
      destinationId: DEST_ID,
      ...h,
    });
    console.log(`  🌟 Highlight: ${h.title}`);
  }

  // ── 4. Weather — Monthly data ──
  const weatherData = [
    { month: 1,  avgHighC: 6.5,  avgLowC: -0.5, rainyDays: 6,  sunshineHours: 3.0 },
    { month: 2,  avgHighC: 9.0,  avgLowC: 0.5,  rainyDays: 5,  sunshineHours: 4.0 },
    { month: 3,  avgHighC: 14.0, avgLowC: 4.0,  rainyDays: 7,  sunshineHours: 5.0 },
    { month: 4,  avgHighC: 18.5, avgLowC: 8.0,  rainyDays: 9,  sunshineHours: 6.0 },
    { month: 5,  avgHighC: 23.5, avgLowC: 12.5, rainyDays: 9,  sunshineHours: 7.5 },
    { month: 6,  avgHighC: 27.5, avgLowC: 16.5, rainyDays: 9,  sunshineHours: 8.5 },
    { month: 7,  avgHighC: 30.0, avgLowC: 18.5, rainyDays: 6,  sunshineHours: 9.5 },
    { month: 8,  avgHighC: 29.5, avgLowC: 18.0, rainyDays: 7,  sunshineHours: 8.5 },
    { month: 9,  avgHighC: 25.0, avgLowC: 14.5, rainyDays: 6,  sunshineHours: 7.0 },
    { month: 10, avgHighC: 19.0, avgLowC: 10.0, rainyDays: 8,  sunshineHours: 4.5 },
    { month: 11, avgHighC: 12.0, avgLowC: 4.0,  rainyDays: 8,  sunshineHours: 3.0 },
    { month: 12, avgHighC: 7.5,  avgLowC: 0.5,  rainyDays: 6,  sunshineHours: 2.5 },
  ];

  for (const w of weatherData) {
    await db.insert(schema.destinationWeatherMonthly).values({
      id: nanoid(),
      destinationId: DEST_ID,
      ...w,
    });
  }
  console.log('  🌤️ Weather: 12 months inserted');

  // ── 5. Accommodations ──
  const accommodationsList = [
    {
      name: 'Hotel Carlton',
      type: 'hotel',
      status: 'researched',
      address: 'Largo di Porta Altinia, 15, 31100 Treviso',
      costPerNight: '85',
      totalCost: '85',
      currency: 'EUR',
      bookingUrl: 'https://www.booking.com/hotel/it/carlton-treviso.html',
    },
    {
      name: 'Hotel Maggior Consiglio',
      type: 'hotel',
      status: 'researched',
      address: 'Via Terraglio, 140, 31100 Treviso',
      costPerNight: '95',
      totalCost: '95',
      currency: 'EUR',
      bookingUrl: 'https://www.hotelmaggiorconsiglio.com',
    },
    {
      name: 'Maison Matilde',
      type: 'hotel',
      status: 'researched',
      address: 'Via Jacopo Riccati, 62, 31100 Treviso',
      costPerNight: '120',
      totalCost: '120',
      currency: 'EUR',
      bookingUrl: 'https://www.maisonmatilde.com',
    },
    {
      name: 'B&B Al Vecchio Portico',
      type: 'airbnb',
      status: 'researched',
      address: 'Centro Storico, Treviso',
      costPerNight: '55',
      totalCost: '55',
      currency: 'EUR',
    },
    {
      name: 'Relais Monaco (Prosecco Hills)',
      type: 'hotel',
      status: 'researched',
      address: 'Via Postumia, 63, 31050 Ponzano Veneto',
      costPerNight: '150',
      totalCost: '150',
      currency: 'EUR',
      bookingUrl: 'https://www.relaismonaco.it',
    },
  ];

  for (const a of accommodationsList) {
    await db.insert(schema.accommodations).values({
      id: nanoid(),
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      ...a,
    });
    console.log(`  🏨 Accommodation: ${a.name} (€${a.costPerNight}/night)`);
  }

  console.log('\n✅ Treviso fully seeded!');
  console.log('\n📋 Summary:');
  console.log('   ✓ Description updated');
  console.log('   ✓ 16 highlights (attractions, restaurants, activities, food)');
  console.log('   ✓ 12 months weather data');
  console.log('   ✓ 5 accommodation options (€55-150/night)');
  console.log('   ✓ Transport notes (1hr 10min train, or car for Prosecco Hills)');
  console.log('   ✓ Photo URL set');
  console.log('   ✓ Research status: fully_researched');

  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
