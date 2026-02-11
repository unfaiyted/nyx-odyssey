/**
 * Seed Bologna — Food Capital of Italy
 * Day trip / overnight from Vicenza (~1.5h by train)
 * Usage: bun run scripts/seed-bologna.ts
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
  name: 'Bologna',
  description:
    'La Grassa ("The Fat One") — Italy\'s undisputed food capital and the heart of Emilia-Romagna. ' +
    'Just 1.5 hours from Vicenza by train, Bologna is a city of medieval towers, 40km of arcaded porticoes (UNESCO), ' +
    'the oldest university in the Western world (est. 1088), and some of the best eating in all of Italy. ' +
    'This is where tortellini, ragù alla bolognese, mortadella, and lasagne verde were born. ' +
    'The historic center is compact, walkable, and endlessly charming — terracotta rooftops, ' +
    'bustling markets, and a student-fueled nightlife scene that keeps the city young.',
  lat: 44.4949,
  lng: 11.3426,
  arrivalDate: null as string | null,
  departureDate: null as string | null,
  photoUrl: null as string | null,
  status: 'researched' as const,
  researchStatus: 'researched' as const,
  orderIndex: 25,
};

// ── Research data ──────────────────────────────────────
const research = {
  // ─── GETTING THERE ───────────────────────────────────
  logistics: {
    fromVicenza: {
      train: 'Vicenza → Bologna Centrale: ~1h20-1h40 by Frecciarossa/Frecciargento (€15-30), or ~2h by Regionale (€10-14). Trains run frequently, roughly every 30-60 min.',
      car: '~1h30 drive (150km) via A4 then A13. Tolls ~€10-12 each way. Parking in Bologna is a nightmare — ZTL (restricted traffic zone) covers the entire historic center. Use park-and-ride at Tandem Bologna (free shuttle to center) or Parcheggio Staveco.',
      recommendation: 'Take the train. Seriously. Bologna\'s center is entirely walkable and the ZTL makes driving miserable. The Frecciarossa is fast, comfortable, and drops you right in the action.',
    },
    dayTripVsOvernight: {
      dayTrip: 'Absolutely doable — leave Vicenza ~8:00, arrive ~9:30, explore until 20:00-21:00, back by 22:30. You can hit the major sights and eat 2-3 incredible meals.',
      overnight: 'Strongly recommended if you want to: (1) do a cooking class (usually 3-4 hours), (2) experience the university quarter nightlife, (3) eat at a leisurely pace without rushing, or (4) visit FICO Eataly World. Bologna deserves at least 36 hours.',
      hotels: 'Stay near Piazza Maggiore or Via dell\'Indipendenza for walkability. Budget: Art Hotel Orologio (€90-130, right on Piazza Maggiore). Mid: Hotel Metropolitan (€120-160). Splurge: Grand Hotel Majestic (€250+, historic palazzo).',
    },
  },

  // ─── THE FOOD (The Main Event) ───────────────────────
  food: {
    iconicDishes: [
      {
        name: 'Tortellini in Brodo',
        description: 'Tiny hand-folded pasta parcels filled with a mix of pork loin, prosciutto, mortadella, and Parmigiano, served in a rich capon broth. This is THE dish of Bologna. Not with cream, not with ragù — in broth. That\'s the law here. The broth is the star; it should be clear, golden, and intensely savory.',
      },
      {
        name: 'Tagliatelle al Ragù',
        description: 'What the rest of the world calls "spaghetti bolognese" doesn\'t exist here. The real deal is tagliatelle — wide, egg-rich ribbons of fresh pasta — with a slow-cooked meat ragù (beef, pork, soffritto, tomato paste, wine, milk). The ratio is more meat than sauce, and the pasta is never spaghetti. Ever. The official recipe is deposited at the Bologna Chamber of Commerce.',
      },
      {
        name: 'Lasagne Verde alla Bolognese',
        description: 'Layers of spinach-tinted fresh pasta sheets, ragù, béchamel, and Parmigiano. Richer and more refined than the ricotta-heavy versions elsewhere. Traditional Sunday lunch dish.',
      },
      {
        name: 'Mortadella',
        description: 'The original "bologna" — a massive, silky-smooth pork cold cut studded with fat cubes and sometimes pistachios. Nothing like American baloney. Try it sliced paper-thin at Mercato delle Erbe or in a warm piadina. Best source: Tamburini or Salumeria Simoni in the Quadrilatero.',
      },
      {
        name: 'Tigelle / Crescentine',
        description: 'Small, round flatbreads cooked in special molds, served warm and split open, filled with cured meats (especially mortadella and lardo), squacquerone cheese, and pesto modenese (lard-based condiment). Perfect aperitivo food or casual lunch.',
      },
      {
        name: 'Cotoletta alla Bolognese',
        description: 'A breaded veal cutlet topped with prosciutto crudo and melted Parmigiano, sometimes finished with a truffle shaving. Like a Milanese, but better (don\'t tell Milan).',
      },
      {
        name: 'Tortelloni',
        description: 'Larger cousins of tortellini, filled with ricotta and spinach (or seasonal pumpkin), dressed simply in butter and sage. Not to be confused with tortellini — locals take this distinction very seriously.',
      },
    ],
    eatingRules: [
      'Never order "spaghetti bolognese" — it doesn\'t exist. Order tagliatelle al ragù.',
      'Tortellini are served in brodo (broth), not with cream sauce. Cream is a tourist invention.',
      'Parmigiano Reggiano is from here (Emilia-Romagna). Use it generously, and try chunks drizzled with aged balsamic.',
      'Eat lunch as your main meal (pranzo, 12:30-14:30). Many trattorias close between lunch and dinner.',
      'Aperitivo hour (18:00-20:00) is sacred. Spritz, Lambrusco, or a Negroni with free snacks at many bars.',
      'Don\'t eat at restaurants directly on Piazza Maggiore — tourist traps. Walk 2 blocks in any direction for the real stuff.',
      'Lambrusco is the local wine — fizzy, red, and criminally underrated. Try it chilled.',
      'Piadina is the local street food — flatbread with various fillings. Quick, cheap, incredible.',
    ],
  },

  // ─── WHERE TO EAT ────────────────────────────────────
  restaurants: {
    trattorias: [
      {
        name: 'Trattoria Anna Maria',
        description: 'Legendary. The walls are covered in photos of celebrities who\'ve eaten here. Famous for tortellini in brodo and tagliatelle al ragù. Run by Anna Maria herself for decades. Book ahead — always packed. Via Belle Arti 17/a. Mains €12-18.',
        mustOrder: 'Tortellini in brodo, tagliatelle al ragù',
        reservations: 'Essential, call ahead',
      },
      {
        name: 'Trattoria dal Biassanot',
        description: 'Family-run since 1963. Intimate, traditional, with a menu that changes seasonally. Excellent ragù and cotoletta alla bolognese. Via Piella 16/a. Known for generous portions. Mains €10-16.',
        mustOrder: 'Cotoletta alla bolognese, tortellini in brodo',
        reservations: 'Recommended',
      },
      {
        name: 'Trattoria Via Serra',
        description: 'Slow Food–driven ingredients, artisanal approach, huge warmth and hospitality. Very popular and hard to get into. Known for their handmade pasta and seasonal dishes. Via Luigi Serra 9/B.',
        mustOrder: 'Whatever\'s seasonal — trust the daily specials',
        reservations: 'Essential — book well in advance',
      },
      {
        name: 'Nonna Rosa',
        description: 'Packed even for weekday lunch. Classic Bolognese dishes in a cozy setting with movie posters on the walls. Excellent tortellini in brodo and chicken Milanese. Phone reservations only. Via del Pratello 66.',
        mustOrder: 'Tortellini in brodo, chicken Milanese',
        reservations: 'Phone only, book ahead',
      },
    ],
    osterias: [
      {
        name: 'Osteria della Fondazza',
        description: 'Pub-like atmosphere, cheap prices, incredible food. Their lasagne is legendary — melts in your mouth with Parmigiano and béchamel. Fast service. Via Fondazza 36. Arrive when they open to avoid waits.',
        mustOrder: 'Lasagne (life-changing)',
        reservations: 'Arrive early, no reservations usually',
      },
      {
        name: 'Osteria dell\'Orsa',
        description: 'In the university quarter — cheap, cheerful, and perpetually packed with students and tourists alike. Known for huge portions of tagliatelle al ragù and great value. Via Mentana 1. Cash only. Mains €7-12.',
        mustOrder: 'Tagliatelle al ragù, tigelle',
        reservations: 'No reservations — expect a queue at peak times',
      },
      {
        name: 'Osteria del Sole',
        description: 'The oldest bar in Bologna (est. 1465). They serve only wine — you bring your own food from the Quadrilatero market stalls. Buy mortadella, cheese, and bread from the nearby shops and enjoy it with a €3 glass of local wine. Pure Bologna.',
        mustOrder: 'BYO food + their wine selection (from €3/glass)',
        reservations: 'None — just show up',
      },
      {
        name: 'Osteria Santa Caterina',
        description: 'Hidden gem, always packed with locals. Excellent tortellini in creamy Parmigiano sauce and eggplant parm. Book ahead for weekends. Via Santa Caterina 52.',
        mustOrder: 'Tortellini in Parmigiano sauce, eggplant parm',
        reservations: 'Call ahead for weekends',
      },
    ],
    gourmetMarket: [
      {
        name: 'Tamburini',
        description: 'The most famous deli/gastronomia in Bologna since 1932. Self-service buffet at the back (pasta, meats, vegetables — pay by weight, ~€10-15 for a full plate). Incredible selection of cured meats, cheeses, and prepared foods. Via Caprarie 1 (in the Quadrilatero).',
      },
      {
        name: 'Salumeria Simoni',
        description: 'Another Quadrilatero institution. Sit at the bar and order a tagliere (board) of mortadella, prosciutto di Parma, Parmigiano, and a glass of Lambrusco. Via Drapperie 5/2a.',
      },
      {
        name: 'Mercato delle Erbe',
        description: 'Indoor market hall with produce stalls, butchers, and several casual eateries inside. More local than the Quadrilatero (fewer tourists). Great for lunch. Via Ugo Bassi 25.',
      },
      {
        name: 'Mercato di Mezzo',
        description: 'Renovated market in the heart of the Quadrilatero. More upscale food hall vibe — pasta counters, fried foods, wine bars. Open late. Good for evening grazing. Via Clavature 12.',
      },
    ],
  },

  // ─── SIGHTS & ACTIVITIES ─────────────────────────────
  sights: {
    piazzaMaggiore: {
      description: 'The beating heart of Bologna. Massive medieval square surrounded by: Basilica di San Petronio (5th largest church in the world, free entry, unfinished marble facade), Palazzo d\'Accursio (city hall, with Morandi museum inside), Palazzo del Podestà, and the Fountain of Neptune (Giambologna, 1567). Stunning at any hour but especially atmospheric at night.',
      tips: 'Free to visit. The basilica has a fascinating sundial line on the floor (longest in the world). Don\'t eat at the restaurants ringing the piazza — walk 2 minutes in any direction.',
    },
    dueTorri: {
      description: 'Bologna\'s iconic Two Towers: Torre degli Asinelli (97.2m, the taller and climbable one) and Torre della Garisenda (48m, leaning dramatically, closed to visitors). Yes, you CAN climb the Asinelli Tower — 498 steps up a narrow wooden staircase to a spectacular 360° panorama of the city and surrounding hills.',
      practicalInfo: 'Booking REQUIRED at duetorribologna.com. Admission every 15 min, max 25 people. Tickets: €5 full / €3 reduced (students, over 65). Free with Bologna Welcome Card. Summer hours extend to 8:15pm last entry (Thu-Sun). Not suitable for claustrophobia, vertigo, or heart conditions. No lift. No bulky bags. Leave 5 min before your slot — no refunds for late arrivals.',
      verdict: 'Absolutely worth it. One of the best viewpoints in any Italian city. Book in advance — slots fill up, especially in summer.',
    },
    porticoes: {
      description: 'Bologna has ~62km of porticoes (covered walkways), the most extensive network in the world. 12 sections were inscribed as a UNESCO World Heritage Site in 2021. They\'re not just pretty — they\'re functional, keeping you dry in rain and shaded in summer. The most spectacular stretch: Portico di San Luca, running 3.8km uphill from Porta Saragozza to the Sanctuary of the Madonna di San Luca, with 666 arches.',
      walkRecommendation: 'Walk the San Luca portico — it\'s a ~45-60 min uphill walk (or take the San Luca Express tourist train, ~€10 roundtrip). The sanctuary at the top has sweeping views over the Po Valley. Best at sunset.',
    },
    universityQuarter: {
      description: 'The area around Via Zamboni is the student heart of Bologna — the University of Bologna (Alma Mater Studiorum) is the oldest in the Western world (founded 1088). The neighborhood buzzes with cheap eats, bookshops, street art, and nightlife.',
      nightlife: 'Via del Pratello is bar-crawl central — dozens of bars and pubs shoulder-to-shoulder. Piazza Verdi and Via Zamboni are the student hangouts. Bars to try: Camera a Sud (cocktails), Le Stanze (gorgeous frescoed bar in a former chapel), Ruggine (craft beer). Most bars serve generous aperitivo spreads with drink purchase. Things don\'t get going until 22:00+.',
    },
    quadrilatero: {
      description: 'Bologna\'s ancient market district, a tangle of narrow medieval streets between Piazza Maggiore and the Two Towers. Named for its roughly rectangular layout. This is where Bolognesi have shopped for food since the Middle Ages. Stalls and shops overflow with fresh pasta, cured meats, cheeses, produce, and fish. The streets (Via Drapperie, Via Pescherie Vecchie, Via degli Orefici, Via Clavature) are an absolute feast for the senses.',
      tips: 'Best visited in the morning (8:00-12:00) when it\'s most alive. Buy supplies here and take them to Osteria del Sole to eat with wine. Key shops: Tamburini, Salumeria Simoni, Atti (fresh pasta since 1880). Some stalls close on Sundays.',
    },
  },

  // ─── COOKING CLASSES ─────────────────────────────────
  cookingClasses: [
    {
      name: 'Le Cesarine',
      description: 'Cook in the home of a local Bolognese nonna. Learn to make tortellini, tagliatelle, and ragù from someone who\'s been making them for decades. Small groups (2-6 people). Includes the meal you cooked + wine. ~€75-95/person. Multiple time slots. Book via cesarine.com.',
      duration: '3-4 hours',
      highlight: 'The most authentic option — you\'re literally in someone\'s kitchen.',
    },
    {
      name: 'La Vecchia Scuola Bolognese',
      description: 'Well-regarded cooking school in the center. Classes focus on fresh pasta (tortellini, tagliatelle) and traditional sauces. English-speaking instructors. ~€70-90/person. Book via website or Airbnb Experiences.',
      duration: '3 hours',
      highlight: 'Professional setup, great for beginners.',
    },
    {
      name: 'Italy Segreta',
      description: 'Small-group market tour + cooking class combo. Start at the Quadrilatero, buy ingredients, then cook together. Higher-end experience. ~€120-150/person.',
      duration: '4-5 hours (including market tour)',
      highlight: 'Best combo of food culture + hands-on cooking.',
    },
  ],

  // ─── FICO EATALY WORLD ──────────────────────────────
  ficoEatalyWorld: {
    description: 'Massive food theme park (~100,000 sqm) on the outskirts of Bologna, rebranded as "FICO World Eataly." It showcases Italian food production — from farm animals to factory demonstrations, restaurants, and shops. Originally opened 2017 with huge fanfare.',
    verdict: 'Mixed to negative. Many reviews say it\'s overpriced (€18 entry in recent years), feels incomplete, and lacks the soul of actual Bologna food culture. TripAdvisor reviews are mediocre. It was reported as "permanently closed" on TripAdvisor as of recent checks, suggesting it may have shuttered or significantly restructured. Check current status before planning a visit.',
    recommendation: 'Skip it. Spend that time (and money) in the Quadrilatero, at a cooking class, or eating at a real trattoria. You\'ll get a far more authentic and satisfying food experience in the city center. If it has reopened in some form, it might be worth a quick look if you have a full extra day, but it\'s never worth choosing over the real Bologna.',
    gettingThere: 'If open: ~6km northeast of center. Bus or taxi (~€15). Free shuttle may run from train station.',
  },

  // ─── BUDGET ESTIMATE ─────────────────────────────────
  budget: {
    dayTrip: {
      train: '€30-60 roundtrip (Frecciarossa) or €20-28 (Regionale)',
      lunch: '€15-25 (trattoria)',
      aperitivo: '€5-10',
      asinelliTower: '€5',
      coffeeGelato: '€5-8',
      total: '€60-110/person',
    },
    overnight: {
      hotel: '€90-160/night',
      cookingClass: '€75-150',
      meals: '€40-70 (lunch + dinner)',
      drinks: '€10-20',
      total: '€250-450/person (1 night)',
    },
  },
};

// ── Itinerary items (suggested day trip schedule) ──────
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
    title: 'Train: Vicenza → Bologna Centrale',
    description:
      'Frecciarossa/Frecciargento: ~1h20, €15-30. Regionale: ~2h, €10-14. ' +
      'Trains run every 30-60 min. Book Freccia tickets on Trenitalia app for best prices. ' +
      'Bologna Centrale station is a 10-min walk from the historic center.',
    startTime: '08:00',
    endTime: '09:30',
    location: 'Vicenza → Bologna Centrale',
    category: 'transport',
    orderIndex: 0,
  },
  {
    title: 'Piazza Maggiore & Basilica di San Petronio',
    description:
      'Start at the heart of the city. Marvel at the massive Piazza Maggiore, admire the ' +
      'unfinished facade of San Petronio (free entry — look for the sundial line on the floor, ' +
      'the longest in the world). See the Fountain of Neptune. Grab an espresso at a nearby café ' +
      '(not on the piazza — walk 1 block for better prices).',
    startTime: '09:45',
    endTime: '10:30',
    location: 'Piazza Maggiore, Bologna',
    category: 'sightseeing',
    orderIndex: 1,
  },
  {
    title: 'Quadrilatero Market District',
    description:
      'Wander the medieval market streets: Via Drapperie, Via Pescherie Vecchie, Via Clavature. ' +
      'This is food heaven — cured meats hanging from doorways, mountains of Parmigiano, fresh pasta in every window. ' +
      'Stop at Tamburini for a taste of mortadella, Salumeria Simoni for a tagliere, ' +
      'or Atti for fresh pasta to admire. Buy supplies for Osteria del Sole if you\'re feeling local.',
    startTime: '10:30',
    endTime: '11:30',
    location: 'Quadrilatero, Bologna',
    category: 'sightseeing',
    orderIndex: 2,
  },
  {
    title: 'Climb Torre degli Asinelli (Two Towers)',
    description:
      '498 steps up the tallest medieval tower in Italy (97.2m). Book in advance at duetorribologna.com! ' +
      'Tickets €5 (€3 reduced). Admission every 15 min, max 25 people. Arrive 5 min early — no refund for latecomers. ' +
      'The panoramic view from the top is extraordinary — red rooftops stretching to the Apennines. ' +
      'Not for those with vertigo or claustrophobia (narrow wooden stairs, no lift).',
    startTime: '11:30',
    endTime: '12:15',
    location: 'Le Due Torri, Piazza di Porta Ravegnana',
    category: 'activity',
    orderIndex: 3,
  },
  {
    title: 'Lunch at a Traditional Trattoria',
    description:
      'THE main event. Top picks: Trattoria Anna Maria (tortellini in brodo — reserve ahead), ' +
      'Osteria della Fondazza (life-changing lasagne), Nonna Rosa (reserve by phone), or ' +
      'Trattoria dal Biassanot (cotoletta alla bolognese). ' +
      'Order tagliatelle al ragù and/or tortellini in brodo. Pair with chilled Lambrusco. ' +
      'Budget: €15-25 for a proper pranzo. Take your time — this is not a rushed meal.',
    startTime: '12:30',
    endTime: '14:00',
    location: 'Historic center, Bologna',
    category: 'meal',
    orderIndex: 4,
  },
  {
    title: 'University Quarter & Via Zamboni',
    description:
      'Walk through the student quarter. See the Archiginnasio (original university building, ' +
      'stunning anatomical theater — €3 entry). Browse bookshops and admire street art. ' +
      'The oldest university in the Western world (1088) gives this neighborhood an electric, ' +
      'youthful energy even during the day.',
    startTime: '14:30',
    endTime: '15:30',
    location: 'Via Zamboni, Bologna',
    category: 'sightseeing',
    orderIndex: 5,
  },
  {
    title: 'Walk the Portico di San Luca',
    description:
      'The crown jewel of Bologna\'s UNESCO porticoes: 3.8km uphill from Porta Saragozza to ' +
      'the Sanctuary of Madonna di San Luca, passing under 666 arches. ~45-60 min walk up. ' +
      'The sanctuary has sweeping views over the Po Valley — gorgeous at any time but magical near sunset. ' +
      'Alternative: San Luca Express tourist train (~€10 roundtrip) if legs are tired.',
    startTime: '15:30',
    endTime: '17:30',
    location: 'Portico di San Luca, Bologna',
    category: 'activity',
    orderIndex: 6,
  },
  {
    title: 'Aperitivo Hour',
    description:
      'Return to the center for aperitivo. Options: Osteria del Sole (BYO food + €3 wine, est. 1465), ' +
      'Le Stanze (cocktails in a frescoed former chapel — stunning), ' +
      'or any bar on Via del Pratello for a Spritz or Negroni with free snacks. ' +
      'Try a chilled Lambrusco — the local fizzy red wine that pairs perfectly with cured meats.',
    startTime: '18:00',
    endTime: '19:30',
    location: 'Historic center, Bologna',
    category: 'meal',
    orderIndex: 7,
  },
  {
    title: 'Train: Bologna → Vicenza',
    description:
      'Last Frecciarossa trains run until ~21:00-22:00. Regionale trains run later. ' +
      'Check Trenitalia app for exact times. If staying overnight, use this evening for ' +
      'Via del Pratello bar crawl or dinner at Trattoria Via Serra.',
    startTime: '20:00',
    endTime: '21:30',
    location: 'Bologna Centrale → Vicenza',
    category: 'transport',
    orderIndex: 8,
  },
];

async function seed() {
  console.log('🍝🏛️ Seeding Bologna — Food Capital of Italy...\n');

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
      category: 'food',
      title: 'Iconic Bolognese Dishes',
      content: JSON.stringify(research.food.iconicDishes),
    },
    {
      category: 'food',
      title: 'How to Eat Like a Local',
      content: JSON.stringify(research.food.eatingRules),
    },
    {
      category: 'restaurants',
      title: 'Best Trattorias',
      content: JSON.stringify(research.restaurants.trattorias),
    },
    {
      category: 'restaurants',
      title: 'Best Osterias',
      content: JSON.stringify(research.restaurants.osterias),
    },
    {
      category: 'restaurants',
      title: 'Markets & Gourmet Shops',
      content: JSON.stringify(research.restaurants.gourmetMarket),
    },
    {
      category: 'sights',
      title: 'Piazza Maggiore',
      content: JSON.stringify(research.sights.piazzaMaggiore),
    },
    {
      category: 'sights',
      title: 'Two Towers (Asinelli & Garisenda)',
      content: JSON.stringify(research.sights.dueTorri),
    },
    {
      category: 'sights',
      title: 'UNESCO Porticoes',
      content: JSON.stringify(research.sights.porticoes),
    },
    {
      category: 'sights',
      title: 'University Quarter & Nightlife',
      content: JSON.stringify(research.sights.universityQuarter),
    },
    {
      category: 'sights',
      title: 'Quadrilatero Market District',
      content: JSON.stringify(research.sights.quadrilatero),
    },
    {
      category: 'activities',
      title: 'Cooking Classes',
      content: JSON.stringify(research.cookingClasses),
    },
    {
      category: 'activities',
      title: 'FICO Eataly World — Worth It?',
      content: JSON.stringify(research.ficoEatalyWorld),
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

  console.log(`\n✅ Done! Added Bologna destination + ${items.length} itinerary items + ${researchEntries.length} research entries.`);
  console.log('\n📋 Summary:');
  console.log('   Train: ~1h20 Frecciarossa (€15-30) or ~2h Regionale (€10-14)');
  console.log('   Day trip budget: €60-110/person');
  console.log('   Overnight budget: €250-450/person (with cooking class)');
  console.log('   Must-eat: Tortellini in brodo, Tagliatelle al ragù, Lasagne verde');
  console.log('   Must-see: Two Towers (book climb!), Quadrilatero, Portico di San Luca');
  console.log('   Must-do: Eat at Osteria del Sole (BYO food + wine since 1465)');
  console.log('   FICO Eataly World: Skip it — eat in the real Bologna instead');
  console.log('   🎯 Verdict: Overnight recommended for the full experience');

  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
