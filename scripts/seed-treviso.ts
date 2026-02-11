/**
 * Seed Treviso — Prosecco & Charm
 * Day trip from Vicenza (~1hr by train)
 * Usage: bun run scripts/seed-treviso.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { nanoid } from 'nanoid';
import * as schema from '../src/db/schema';

const CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const sql = postgres(CONNECTION_STRING);
const db = drizzle(sql, { schema });

const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh'; // Italy 2026

// ── Destination entry ──────────────────────────────────
const destination = {
  tripId: TRIP_ID,
  name: 'Treviso',
  description:
    '"Little Venice" without the crowds — a canal-laced gem of frescoed palaces, atmospheric fish markets, ' +
    'and some of the best cicchetti bars in the Veneto. Gateway to the UNESCO Prosecco Hills of Valdobbiadene. ' +
    'Claims the birthplace of tiramisu, and if you visit in winter, the prized Radicchio di Treviso Tardivo ' +
    'is an experience unto itself. Benetton was born here. The Prosecco flows like water.',
  lat: 45.6669,
  lng: 12.2430,
  arrivalDate: null as string | null,
  departureDate: null as string | null,
  photoUrl: null as string | null,
  status: 'researched' as const,
  researchStatus: 'researched' as const,
  orderIndex: 30,
};

// ── Research data ──────────────────────────────────────
const research = {
  // ─── GETTING THERE ───────────────────────────────────
  logistics: {
    fromVicenza: {
      train: 'Vicenza → Venezia Mestre → Treviso Centrale: ~1hr 10min total (45min to Mestre + 25min to Treviso). €7-10 each way, Regionale. Some direct trains exist (~1hr). Treviso Centrale is a 10-minute walk from the old town.',
      car: '~95km via A4/A27, ~1hr 15min. Free parking outside the walls at Parcheggio Ca\' dei Ricchi or Parcheggio Fiera. Recommended if combining with Prosecco Hills (Valdobbiadene is 45min north, no practical train service).',
      recommendation: 'Car rental for a combined Treviso + Prosecco Hills day. Morning in Treviso old town, afternoon driving through the UNESCO Prosecco hills to Valdobbiadene.',
    },
    dayTripVsOvernight: {
      halfDay: 'Treviso old town is compact — 3-4 hours covers the highlights (canals, fish market, Piazza dei Signori, cicchetti lunch). Good if combining with another destination.',
      fullDay: 'Morning in Treviso + afternoon in Prosecco Hills (Valdobbiadene wineries, Cartizze, the famous Prosecco vending machine). This is the optimal play — requires a car.',
      overnight: 'Not necessary unless you want a very relaxed pace or evening in the cicchetti bars.',
      verdict: 'Full day with car is the sweet spot. Half day by train works if paired with something else.',
    },
  },

  // ─── SIGHTS ──────────────────────────────────────────
  sights: {
    piazzaDeiSignori: {
      name: 'Piazza dei Signori',
      description: 'The main square and living room of Treviso. Framed by the 13th-century Palazzo dei Trecento (council hall, still in use). Outdoor cafés under arcades — perfect for a morning espresso. Featured in the Italian film Signore e Signori.',
    },
    canals: {
      name: 'The Canals — "Little Venice"',
      description: 'Buranelli Canal: the iconic postcard shot — ivy-draped balconies, pastel houses reflected in the water. Named after Burano merchants. Cagnan Canal (Cagnan Grande): flows through the heart of the old town, powers medieval water wheels still turning today. Riviera Garibaldi: scenic canal-side walk with weeping willows. Much smaller and more intimate than Venice — "Venice\'s quieter, prettier cousin."',
    },
    fishMarket: {
      name: 'Isola della Pescheria (Fish Market Island)',
      description: 'A tiny island in the Cagnan canal hosting Treviso\'s fish market. Open Tuesday–Saturday mornings (best before 11 AM). Surrounded by fruit/vegetable stalls on the adjacent canal banks. One of the most atmospheric market settings in the Veneto. Don\'t miss the views from the bridges on either side.',
    },
    sanNicolo: {
      name: 'San Nicolò Church',
      description: 'Gothic gem with remarkable frescoes by Tommaso da Modena (1352). Famous for the earliest known painting of eyeglasses — a monk reading with spectacles, centuries before they were common. Adjacent Chapter House has 40 Dominican scholars at their desks, each with distinct personality. Free entry, often overlooked by tourists.',
    },
    duomo: {
      name: 'The Duomo (Cathedral)',
      description: 'Neoclassical façade hides interior treasures: Titian\'s Annunciation in the Malchiostro Chapel, chapels by Tullio Lombardo. Free entry.',
    },
    fontanaDelleTette: {
      name: 'Fontana delle Tette ("Fountain of the Breasts")',
      description: 'Hidden in a courtyard off Calle del Podestà. Under the Venetian Republic, it dispensed red and white wine during festivals. Current version is a replica (original damaged in WWII). Quirky photo op.',
    },
    cityWalls: {
      name: 'The City Walls',
      description: '500-year-old Venetian-era defensive walls still encircle the old town. Porta San Tomaso — grand entrance gate with the Lion of St. Mark. Bastione San Paolo — best viewpoint. Nice for a short stroll along the perimeter.',
    },
  },

  // ─── PROSECCO ────────────────────────────────────────
  prosecco: {
    overview: {
      description: 'Treviso is the gateway to the Conegliano-Valdobbiadene Prosecco Superiore DOCG zone. Valdobbiadene is ~45min north by car. The hills were designated a UNESCO World Heritage Site in 2019. Cartizze is the grand cru — a tiny 107-hectare hilltop producing the finest Prosecco.',
    },
    wineries: [
      { name: 'Perlage', location: 'Farra di Soligo', highlight: 'Organic/biodynamic, 5-glass DOCG tasting', booking: 'perlagewines.com' },
      { name: 'Bisol', location: 'Valdobbiadene', highlight: 'Historic estate, Cartizze producer', booking: 'Reservation required' },
      { name: 'Col Vetoraz', location: 'Santo Stefano', highlight: 'Panoramic hilltop location, top Cartizze', booking: 'Book ahead' },
      { name: 'Nino Franco', location: 'Valdobbiadene', highlight: 'Family-run since 1919, excellent Rive', booking: 'Walk-ins sometimes ok' },
      { name: 'Bortolomiol', location: 'Valdobbiadene', highlight: 'Modern tasting room, good intro experience', booking: 'Book via website' },
    ],
    osteriaSenzOste: {
      name: 'Osteria Senz\'Oste (The Prosecco Vending Machine)',
      description: 'A farm shop on the honesty system near Valdobbiadene. Park among the grapevines, buy Prosecco from a vending machine. Also has cheese, salami, and bread — serve yourself, leave money in the box. Quirky and uniquely Italian.',
    },
    guidedTours: {
      getYourGuide: 'Full-day Prosecco Hills tour from Treviso/Venice (~€80-150pp), visits 2 wineries, includes lunch',
      cellarTours: 'Luxury private tour with Mercedes transfer, gourmet lunch (~€300+pp)',
      duration: 'Typically 7-8 hours, depart from Venice or Treviso',
    },
  },

  // ─── FOOD ────────────────────────────────────────────
  food: {
    tiramisu: {
      name: 'Tiramisu — Born Here',
      description: 'Treviso claims to be the birthplace of tiramisu. Two restaurants dispute the title: Le Beccherie (most widely credited, claims 1960s invention) and Toni del Spin. Try both and decide for yourself.',
    },
    radicchio: {
      name: 'Radicchio di Treviso',
      description: 'Season: November–February. Two varieties: Precoce (early, wider leaves) and Tardivo (late, prized elongated form — the real deal). Tardivo is the star — sweet-bitter, crunchy, looks like a purple flame. Grilled with olive oil, in risotto, or raw in salads. If visiting Nov-Feb, this is a MUST — it\'s a protected IGP product. Radicchio festivals happen in January in surrounding towns.',
    },
  },

  // ─── RESTAURANTS ─────────────────────────────────────
  restaurants: {
    sitDown: [
      { name: 'Toni del Spin', style: 'Traditional trattoria', knownFor: 'Tiramisu, local Veneto dishes', price: '€€' },
      { name: 'Le Beccherie', style: 'Historic restaurant', knownFor: '"Original" tiramisu, classic Trevigiana cuisine', price: '€€-€€€' },
      { name: 'Osteria Muscoli\'s', style: 'Seafood osteria', knownFor: 'Fresh fish near the Pescheria', price: '€€' },
      { name: 'Trattoria all\'Antico Portico', style: 'Traditional', knownFor: 'Handmade pasta, radicchio dishes', price: '€€' },
    ],
    cicchettiBars: [
      { name: 'Hostaria Dai Naneti', description: 'Beloved local bacaro, excellent small plates with wine' },
      { name: 'Cantinetta Venegazzù', description: 'Central location, typical cicchetti with local wines' },
      { name: 'Enoteca Il Bacaro', description: 'Good wine selection, aperitivo culture' },
      { name: 'Bar Ai Porteghi', description: 'Under the arcades of Piazza dei Signori' },
    ],
    tips: 'Cicchetti typically €1-3 per piece, paired with an ombra (small glass of wine) for €1-2. Significantly cheaper than Venice. Full restaurant meal: €20-35pp.',
  },

  // ─── BENETTON ────────────────────────────────────────
  benetton: {
    overview: 'United Colors of Benetton founded in Treviso in 1965. HQ still in Ponzano Veneto (~5km outside). Revolutionized fast fashion with bold colors and controversial Oliviero Toscani ad campaigns. Family also owns Autogrill and Atlantia.',
    whatToSee: 'Fábrica — Benetton\'s research center in a restored 17th-century villa, occasionally hosts exhibitions. Imago Mundi art collection sometimes exhibited. No formal museum. Benetton Rugby Treviso plays locally — check match schedules.',
  },

  // ─── BUDGET ──────────────────────────────────────────
  budget: {
    halfDay: '€25-40pp (train €14-20 return + cicchetti lunch €10-15 + coffee/gelato)',
    fullDay: '€60-120pp (car fuel/rental share + cicchetti + 1-2 winery tastings €10-20 each + lunch)',
    comparison: 'Significantly cheaper than Venice. This is a budget-friendly day trip.',
  },

  // ─── PRACTICAL ───────────────────────────────────────
  practical: {
    bestSeason: 'Late autumn (Nov-Dec) for Radicchio Tardivo season. Spring/early summer for vineyards at their greenest. Summer can be hot and humid.',
    marketDays: 'Tuesday–Saturday mornings for the fish market; general market spreads along the canals.',
    siesta: 'Many shops close 12:30–15:30. Plan accordingly.',
    language: 'Less English spoken than Venice — a few Italian phrases go a long way.',
    safety: 'Very safe, even at night. Minimal tourist scams.',
    airport: 'Treviso Airport is a Ryanair hub (marketed as "Venice-Treviso" for flights).',
  },
};

// ── Suggested Itinerary Items (Full Day — Option B) ────
const items = [
  {
    title: 'Drive: Vicenza → Treviso',
    description: '~1hr 15min via A4/A27. Free parking outside the old town walls at Parcheggio Ca\' dei Ricchi or Parcheggio Fiera.',
    startTime: '08:30',
    endTime: '09:45',
    location: 'Vicenza → Treviso',
    category: 'transport',
    orderIndex: 0,
  },
  {
    title: 'Explore Treviso Old Town',
    description:
      'Wander the canals — Buranelli (the iconic shot), Cagnan Grande (medieval water wheels). ' +
      'Visit Piazza dei Signori for morning espresso under the arcades. ' +
      'Stop by the Isola della Pescheria fish market (best before 11 AM, Tue-Sat). ' +
      'See San Nicolò church (earliest painting of eyeglasses!), the Duomo (Titian\'s Annunciation), ' +
      'and the quirky Fontana delle Tette.',
    startTime: '09:45',
    endTime: '11:30',
    location: 'Treviso Centro Storico',
    category: 'activity',
    orderIndex: 1,
  },
  {
    title: 'Cicchetti & Ombra at a Bacaro',
    description:
      'Light cicchetti lunch at one of Treviso\'s beloved bacari. ' +
      'Top picks: Hostaria Dai Naneti (excellent small plates), Cantinetta Venegazzù (central), ' +
      'or Bar Ai Porteghi (under the Piazza arcades). ' +
      'Cicchetti €1-3 each, ombra (small wine) €1-2. Budget ~€10-15pp for a satisfying meal.',
    startTime: '11:30',
    endTime: '12:15',
    location: 'Treviso old town bacari',
    category: 'meal',
    orderIndex: 2,
  },
  {
    title: 'Drive: Treviso → Valdobbiadene (Prosecco Hills)',
    description:
      'Head north into the UNESCO Prosecco Hills along the Strada del Prosecco. ' +
      'Rolling hills covered in vineyards, stunning photo ops. ~45 min drive.',
    startTime: '12:15',
    endTime: '13:00',
    location: 'Treviso → Valdobbiadene',
    category: 'transport',
    orderIndex: 3,
  },
  {
    title: 'Lunch at a Winery or Agriturismo',
    description:
      'Enjoy a leisurely lunch in the Prosecco hills. Many wineries offer food pairings, ' +
      'or stop at a local agriturismo for traditional Veneto cooking surrounded by vineyards.',
    startTime: '13:00',
    endTime: '14:30',
    location: 'Prosecco Hills, Valdobbiadene area',
    category: 'meal',
    orderIndex: 4,
  },
  {
    title: 'Winery Visit — Tasting',
    description:
      'First winery: Perlage (organic/biodynamic, 5-glass DOCG tasting) or Bisol (historic Cartizze producer). ' +
      'Book ahead for the best experience. Tastings typically €10-20pp.',
    startTime: '14:30',
    endTime: '16:00',
    location: 'Valdobbiadene area',
    category: 'activity',
    orderIndex: 5,
  },
  {
    title: 'Osteria Senz\'Oste — The Prosecco Vending Machine',
    description:
      'A farm shop on the honesty system near Valdobbiadene. Park among grapevines, ' +
      'buy Prosecco from a vending machine, with cheese, salami, and bread — serve yourself, ' +
      'leave money in the box. Uniquely Italian and a perfect afternoon pit stop.',
    startTime: '16:00',
    endTime: '16:45',
    location: 'Near Valdobbiadene',
    category: 'activity',
    orderIndex: 6,
  },
  {
    title: 'Second Winery or Scenic Cartizze Drive',
    description:
      'Either visit a second winery (Nino Franco, Col Vetoraz for the panoramic hilltop) ' +
      'or take the scenic drive through the Cartizze grand cru zone — ' +
      'the most prestigious 107 hectares in all of Prosecco.',
    startTime: '16:45',
    endTime: '17:30',
    location: 'Cartizze / Valdobbiadene',
    category: 'activity',
    orderIndex: 7,
  },
  {
    title: 'Drive: Valdobbiadene → Vicenza',
    description: 'Return via A27/A4. ~1hr 15min. A satisfying day of Venetian canals and Prosecco hills.',
    startTime: '17:30',
    endTime: '18:45',
    location: 'Valdobbiadene → Vicenza',
    category: 'transport',
    orderIndex: 8,
  },
];

async function seed() {
  console.log('🥂🏛️ Seeding Treviso — Prosecco & Charm...\n');

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
      date: 'TBD',
      startTime: item.startTime,
      endTime: item.endTime,
      location: item.location,
      category: item.category,
      orderIndex: item.orderIndex,
    });
    console.log(`  ✓ ${item.title}`);
  }

  // Store research as destination research entries
  const researchEntries = [
    {
      category: 'sights',
      title: 'Piazza dei Signori',
      content: JSON.stringify(research.sights.piazzaDeiSignori),
    },
    {
      category: 'sights',
      title: 'The Canals — "Little Venice"',
      content: JSON.stringify(research.sights.canals),
    },
    {
      category: 'sights',
      title: 'Isola della Pescheria (Fish Market Island)',
      content: JSON.stringify(research.sights.fishMarket),
    },
    {
      category: 'sights',
      title: 'San Nicolò Church',
      content: JSON.stringify(research.sights.sanNicolo),
    },
    {
      category: 'sights',
      title: 'The Duomo',
      content: JSON.stringify(research.sights.duomo),
    },
    {
      category: 'sights',
      title: 'Fontana delle Tette',
      content: JSON.stringify(research.sights.fontanaDelleTette),
    },
    {
      category: 'sights',
      title: 'City Walls',
      content: JSON.stringify(research.sights.cityWalls),
    },
    {
      category: 'activities',
      title: 'Prosecco Wine Region — Overview',
      content: JSON.stringify(research.prosecco.overview),
    },
    {
      category: 'activities',
      title: 'Prosecco Wineries',
      content: JSON.stringify(research.prosecco.wineries),
    },
    {
      category: 'activities',
      title: 'Osteria Senz\'Oste (Prosecco Vending Machine)',
      content: JSON.stringify(research.prosecco.osteriaSenzOste),
    },
    {
      category: 'activities',
      title: 'Guided Prosecco Tours',
      content: JSON.stringify(research.prosecco.guidedTours),
    },
    {
      category: 'food',
      title: 'Tiramisu — Born Here',
      content: JSON.stringify(research.food.tiramisu),
    },
    {
      category: 'food',
      title: 'Radicchio di Treviso',
      content: JSON.stringify(research.food.radicchio),
    },
    {
      category: 'restaurants',
      title: 'Best Restaurants',
      content: JSON.stringify(research.restaurants.sitDown),
    },
    {
      category: 'restaurants',
      title: 'Cicchetti Bars (Bacari)',
      content: JSON.stringify(research.restaurants.cicchettiBars),
    },
    {
      category: 'culture',
      title: 'Benetton — Fashion History',
      content: JSON.stringify(research.benetton),
    },
    {
      category: 'logistics',
      title: 'Getting There from Vicenza',
      content: JSON.stringify(research.logistics.fromVicenza),
    },
    {
      category: 'logistics',
      title: 'Day Trip vs Overnight',
      content: JSON.stringify(research.logistics.dayTripVsOvernight),
    },
    {
      category: 'budget',
      title: 'Budget Estimates',
      content: JSON.stringify(research.budget),
    },
    {
      category: 'logistics',
      title: 'Practical Tips',
      content: JSON.stringify(research.practical),
    },
  ];

  for (const entry of researchEntries) {
    await db.insert(schema.destinationResearch).values({
      id: nanoid(),
      destinationId: destId,
      category: entry.category,
      title: entry.title,
      content: entry.content,
      source: 'research',
    });
    console.log(`  📚 Research: ${entry.title}`);
  }

  console.log(`\n✅ Done! Added Treviso destination + ${items.length} itinerary items + ${researchEntries.length} research entries.`);
  console.log('\n📋 Summary:');
  console.log('   Train: ~1hr 10min via Mestre (€7-10) or direct (~1hr)');
  console.log('   Half day budget: €25-40pp');
  console.log('   Full day budget: €60-120pp (with Prosecco Hills)');
  console.log('   Must-eat: Tiramisu (Le Beccherie vs Toni del Spin), Radicchio Tardivo (Nov-Feb)');
  console.log('   Must-see: Buranelli Canal, Fish Market Island, San Nicolò eyeglasses fresco');
  console.log('   Must-do: Prosecco Hills winery tour + Osteria Senz\'Oste vending machine');
  console.log('   🎯 Verdict: Full day with car (Treviso morning + Prosecco afternoon) is the play');

  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
