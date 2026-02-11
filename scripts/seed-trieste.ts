/**
 * Seed Trieste — Border City & Coffee Culture
 * Deep research: Habsburg/Italian/Slavic mix, coffee culture, Miramare Castle,
 * Karst region, seafood, Slovenia side trips
 * Usage: bun run scripts/seed-trieste.ts
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
  name: 'Trieste',
  description:
    'A captivating border city where Italian, Habsburg, and Slavic cultures collide at the edge of the Adriatic. ' +
    'Trieste is Italy\'s coffee capital (per capita consumption double the national average), home to Illy and ' +
    'legendary literary cafés. Features the largest sea-facing square in Europe (Piazza Unità d\'Italia), ' +
    'the fairytale Miramare Castle, the giant Grotta Gigante cave, and outstanding seafood. ' +
    '~2.5hr drive from Vicenza. Minutes from the Slovenian border — easy to combine with Piran or Ljubljana.',
  lat: 45.6495,
  lng: 13.7768,
  arrivalDate: null as string | null,
  departureDate: null as string | null,
  photoUrl: null as string | null,
  status: 'researched' as const,
  researchStatus: 'fully_researched' as const,
  orderIndex: 25,
};

// ── Research data ──────────────────────────────────────
const research = {
  country: 'Italy',
  region: 'Friuli Venezia Giulia',
  timezone: 'Europe/Rome (CET/CEST)',
  language: 'Italian (Slovenian and German also spoken)',
  currency: 'EUR',
  population: '~204,000',
  elevation: '2m (sea level), Karst plateau rises to 300-400m',
  bestTimeToVisit: 'May-September for warm weather & outdoor dining. June-July ideal for trip timing.',
  avgTempHighC: 27,
  avgTempLowC: 18,
  rainyDaysPerMonth: 8,
  weatherNotes:
    'Mediterranean climate moderated by the Bora wind — a fierce cold NE wind that can gust 100+ km/h, ' +
    'mainly in winter. Summers are warm and pleasant (25-30°C). The Bora is rare in summer but adds character. ' +
    'Sea temperature reaches 24-25°C in July-August, swimmable at Barcola beach.',
  dailyBudgetLow: '60',
  dailyBudgetMid: '100',
  dailyBudgetHigh: '180',
  budgetCurrency: 'EUR',
  costNotes:
    'Trieste is notably cheaper than Venice or Florence. Excellent espresso from €1. ' +
    'Lunch at an osmiza (farmhouse) or buffet (local term for a casual trattoria) €10-15. ' +
    'Restaurant dinner €25-40/person. Museum entries €5-10. Miramare Castle €10.',
  transportNotes:
    'From Vicenza: ~2.5hr drive (200km) via A4 east. Tolls ~€12-15 each way. ' +
    'Train alternative: Vicenza → Trieste Centrale (~2h15 on Frecciarossa/Frecciargento, €20-35). ' +
    'Regional trains slower (~3h, €15). City itself very walkable. Bus #36 to Miramare Castle. ' +
    'Parking: garage near Piazza Unità or Riva del Mandracchio area (~€1.50-2/hr). ' +
    'To Slovenia: Piran is 30min by car; Ljubljana 1.5hr. No border checks (Schengen).',
  nearestAirport: 'Trieste–Friuli Venezia Giulia Airport (TRS), 33km NW. Small airport, limited routes.',
  safetyRating: 5,
  safetyNotes: 'Very safe city. Low crime. University town atmosphere. Walkable even at night.',
  culturalNotes:
    'Trieste\'s unique identity comes from 500+ years under Habsburg rule (1382-1918). ' +
    'It was the Austro-Hungarian Empire\'s main port — a cosmopolitan trading hub where ' +
    'Italian, Austrian, Slovenian, Greek, Serbian, and Jewish communities coexisted. ' +
    'This shows in the architecture (Viennese art nouveau next to Roman ruins), the food ' +
    '(goulash alongside pasta, strudel next to tiramisu), and especially the coffee culture. ' +
    'Literary giants James Joyce, Italo Svevo, and Umberto Saba all lived and wrote here. ' +
    'Joyce wrote much of Ulysses in Trieste. The city has a melancholic, intellectual character ' +
    'that feels distinct from anywhere else in Italy. The Serbian Orthodox Church of San Spiridione ' +
    'and the Synagogue (one of Europe\'s largest) reflect the multicultural heritage.',
  summary:
    'Trieste is absolutely worth the 2.5hr drive from Vicenza. It\'s unlike any other Italian city — ' +
    'a Habsburg port city with Viennese coffee houses, Slavic influences, and Italian seafood. ' +
    'VERDICT: Best as an overnight (1-2 nights) to fully enjoy the coffee culture, Miramare Castle, ' +
    'and potentially a half-day in Slovenia. As a day trip it\'s doable but rushed — you\'d spend 5hrs driving. ' +
    'An overnight lets you enjoy sunset aperitivo on Molo Audace, evening seafood, morning coffee ritual, ' +
    'then Miramare/Grotta Gigante or a Piran side trip before heading back. ' +
    'Combining Trieste + Piran (Slovenia) makes for an excellent 2-day mini-trip.',
  travelTips: JSON.stringify([
    'Coffee vocabulary: "nero" = espresso, "capo" (or cappo) = small cappuccino with dense foam, "capo in b" = cappuccino in a glass. Don\'t order "espresso" — say "nero".',
    'Visit an osmiza — a traditional Karst farmhouse that opens periodically to sell homemade wine, cured meats, cheese, and eggs. Look for ivy branches hung outside as a sign they\'re open. Authentic and incredibly cheap.',
    'The Bora wind is famous. If it\'s blowing (mainly winter), ropes are strung along streets for pedestrians to hold onto. In summer it\'s rarely an issue.',
    'Trieste\'s "buffets" are not all-you-can-eat — they\'re traditional pork-focused eateries serving boiled meats, sausages, and sauerkraut. Buffet da Pepi is the most famous.',
    'Free entry to Miramare Castle park/gardens. The castle interior costs €10 and is worth it for the ornate Habsburg rooms and sea views.',
    'For the best Piazza Unità d\'Italia experience, visit at sunset when the buildings glow golden and the square opens to the darkening sea.',
    'The Karst plateau above Trieste has excellent hiking with sea views, wine cellars, and the Grotta Gigante. Rent a car or take bus #42.',
    'Slovenia is minutes away. Bring your passport just in case (though Schengen means no checks). Piran is 30min, Ljubljana 1.5hr.',
  ]),
};

// ── Highlights ─────────────────────────────────────────
const highlights: Array<{
  title: string;
  description: string;
  category: string;
  rating?: number;
  priceLevel?: number;
  address?: string;
  websiteUrl?: string;
  duration?: string;
  orderIndex: number;
}> = [
  // ─── Attractions ───
  {
    title: 'Piazza Unità d\'Italia',
    description:
      'The largest sea-facing square in Europe — a vast, stunning piazza that opens directly onto the Adriatic. ' +
      'Ringed by ornate Habsburg-era palaces (Municipal Palace, Lloyd Triestino, Palazzo del Governo). ' +
      'Magical at sunset when the buildings catch golden light. Free to visit anytime.',
    category: 'attraction',
    rating: 4.9,
    address: 'Piazza Unità d\'Italia, 34121 Trieste',
    duration: '30-60 min',
    orderIndex: 0,
  },
  {
    title: 'Castello di Miramare',
    description:
      'A 19th-century fairytale castle built for Archduke Maximilian of Habsburg on a rocky promontory ' +
      'overlooking the Gulf of Trieste. Ornate interior with original furnishings. The surrounding park ' +
      '(free entry) features botanical gardens with exotic plants. The castle terrace offers breathtaking ' +
      'sea views. €10 entry. 6km northwest of center — bus #36 or 15min drive.',
    category: 'attraction',
    rating: 4.8,
    priceLevel: 2,
    address: 'Viale Miramare, 34151 Trieste',
    websiteUrl: 'https://www.castello-miramare.it',
    duration: '2-3 hours (castle + gardens)',
    orderIndex: 1,
  },
  {
    title: 'Grotta Gigante (Giant Cave)',
    description:
      'One of the world\'s largest tourist-accessible caves — the main chamber is 107m high, 65m wide, ' +
      'and 130m long (big enough to fit St. Peter\'s Basilica inside). Impressive stalactites/stalagmites. ' +
      'Guided tours only (~50 min, run hourly). Located on the Karst plateau, 15min drive from center. ' +
      '€13 adults. Combined ticket with Karst botanical garden available.',
    category: 'nature',
    rating: 4.6,
    priceLevel: 2,
    address: 'Borgo Grotta Gigante 42/A, 34016 Sgonico',
    websiteUrl: 'https://www.grottagigante.it',
    duration: '1.5-2 hours',
    orderIndex: 2,
  },
  {
    title: 'Castello di San Giusto',
    description:
      'Medieval fortress atop San Giusto hill with panoramic views over Trieste, the harbor, and on clear days, ' +
      'Slovenia. Houses a weapons museum. Adjacent is the Romanesque Cathedral of San Giusto with stunning ' +
      'Byzantine mosaics. Free to walk the ramparts; museum €5.',
    category: 'attraction',
    rating: 4.5,
    priceLevel: 1,
    address: 'Piazza della Cattedrale 3, 34121 Trieste',
    duration: '1-1.5 hours',
    orderIndex: 3,
  },
  {
    title: 'Molo Audace',
    description:
      'A 246-meter-long pier extending into the harbor from Piazza Unità. Named after the first Italian ship ' +
      'to dock after WWI. Perfect for a sunset stroll with the city skyline behind you and the open Adriatic ahead. ' +
      'The evening passeggiata here is quintessential Trieste.',
    category: 'attraction',
    rating: 4.7,
    address: 'Molo Audace, 34124 Trieste',
    duration: '20-30 min',
    orderIndex: 4,
  },
  {
    title: 'Canale Grande & Borgo Teresiano',
    description:
      'The elegant 18th-century quarter designed under Empress Maria Theresa. A small canal (not Venice!) ' +
      'lined with colorful neoclassical buildings, cafés, and the striking Serbian Orthodox Church of ' +
      'San Spiridione with its blue domes. The Ponte Rosso area is lovely for morning coffee.',
    category: 'attraction',
    rating: 4.4,
    address: 'Canale Grande, Borgo Teresiano, Trieste',
    duration: '30-45 min',
    orderIndex: 5,
  },
  {
    title: 'Teatro Romano',
    description:
      'A well-preserved 1st-century AD Roman amphitheater right in the city center, once seating 3,500. ' +
      'Discovered in 1938 when buildings were demolished. Free to view from street level; occasionally ' +
      'hosts summer concerts.',
    category: 'cultural',
    rating: 4.2,
    address: 'Via del Teatro Romano, 34121 Trieste',
    duration: '15-20 min',
    orderIndex: 6,
  },
  {
    title: 'Faro della Vittoria (Victory Lighthouse)',
    description:
      'A WWI memorial lighthouse on the Gretta hill with sweeping views of the city and gulf. ' +
      'Built in 1927, it honors sailors who died in both World Wars. Climbable for panoramic views.',
    category: 'attraction',
    rating: 4.3,
    address: 'Strada del Friuli 141, 34136 Trieste',
    duration: '30-45 min',
    orderIndex: 7,
  },

  // ─── Coffee Culture ───
  {
    title: 'Caffè San Marco',
    description:
      'Trieste\'s most famous literary café, opened in 1914. A Habsburg-era gem with art nouveau interiors, ' +
      'now also a bookshop. Writers and intellectuals have gathered here for over a century. ' +
      'Order a "capo in b" and browse the shelves. The atmosphere alone is worth the visit — ' +
      'feels like stepping into early 20th century Vienna.',
    category: 'food',
    rating: 4.7,
    priceLevel: 2,
    address: 'Via Cesare Battisti 18, 34125 Trieste',
    websiteUrl: 'https://www.caffesanmarco.com',
    duration: '45-60 min',
    orderIndex: 8,
  },
  {
    title: 'Antico Caffè Torinese',
    description:
      'Another historic Triestine café with ornate turn-of-century interiors — dark wood, brass, mirrors. ' +
      'Less touristy than San Marco but equally atmospheric. Known for excellent pastries alongside coffee. ' +
      'The Viennese influence is palpable in the strudel and Sachertorte.',
    category: 'food',
    rating: 4.6,
    priceLevel: 2,
    address: 'Corso Italia 2, 34122 Trieste',
    duration: '30-45 min',
    orderIndex: 9,
  },
  {
    title: 'Caffè degli Specchi',
    description:
      'Grand belle époque café right on Piazza Unità d\'Italia. Prime people-watching spot with outdoor ' +
      'seating overlooking the square and sea. Pricier than neighborhood spots but the location is unbeatable. ' +
      'Has been serving coffee since 1839.',
    category: 'food',
    rating: 4.4,
    priceLevel: 3,
    address: 'Piazza Unità d\'Italia 7, 34121 Trieste',
    duration: '30-45 min',
    orderIndex: 10,
  },
  {
    title: 'Illy Università del Caffè',
    description:
      'Illy was founded in Trieste in 1933 and still roasts all its beans here. The Università del Caffè ' +
      'offers tastings, workshops, and a café with limited-edition art cups on the ceiling. ' +
      'Coffee nerds will love learning about the 16 aroma notes of Illy\'s signature blend.',
    category: 'activity',
    rating: 4.5,
    priceLevel: 2,
    address: 'Via Flavia 110, 34147 Trieste',
    websiteUrl: 'https://www.illy.com',
    duration: '1-2 hours',
    orderIndex: 11,
  },
  {
    title: 'Barakin (Clifftop Coffee Kiosk)',
    description:
      'A beloved local coffee kiosk perched on the cliffs south of the Borgo with panoramic views over ' +
      'city and sea. Serves coffee from Antica Tostatura Triestina (wood-fired beans). ' +
      'Simple, atmospheric, and deeply local. Shaded outdoor tables.',
    category: 'food',
    rating: 4.6,
    priceLevel: 1,
    address: 'Passeggio Sant\'Andrea, 34123 Trieste',
    duration: '20-30 min',
    orderIndex: 12,
  },

  // ─── Food & Restaurants ───
  {
    title: 'Buffet da Pepi',
    description:
      'Trieste\'s most iconic "buffet" — a traditional pork-focused eatery serving boiled pork, sausages, ' +
      'sauerkraut, mustard, and horseradish since 1897. A direct link to the city\'s Austrian heritage. ' +
      'Casual, packed with locals at lunch. Must-try: bollito misto (boiled meats plate). €10-15.',
    category: 'food',
    rating: 4.6,
    priceLevel: 1,
    address: 'Via Cassa di Risparmio 3, 34121 Trieste',
    duration: '45-60 min',
    orderIndex: 13,
  },
  {
    title: 'Al Bagatto',
    description:
      'Top-rated seafood restaurant. Creative Adriatic cuisine — raw fish antipasti, spaghetti with clams, ' +
      'fresh catch of the day. Intimate setting, excellent wine list focusing on Friulian whites (Vitovska, ' +
      'Malvasia). Reservations essential. €35-50/person.',
    category: 'food',
    rating: 4.7,
    priceLevel: 3,
    address: 'Via Luigi Cadorna 7, 34124 Trieste',
    duration: '1.5-2 hours',
    orderIndex: 14,
  },
  {
    title: 'Trattoria Nero di Seppia',
    description:
      'Casual and excellent seafood trattoria near the waterfront. Specializes in Adriatic dishes — ' +
      'nero di seppia (cuttlefish ink) pasta, grilled branzino, sardoni in savor (marinated sardines). ' +
      'Good value. €20-35/person.',
    category: 'food',
    rating: 4.5,
    priceLevel: 2,
    address: 'Via dei Cavazzeni 2, 34124 Trieste',
    duration: '1-1.5 hours',
    orderIndex: 15,
  },
  {
    title: 'Osmiza Experience (Karst Farmhouses)',
    description:
      'A uniquely Triestine tradition: Karst farmers open their homes periodically to sell homemade wine, ' +
      'prosciutto, cheese, hard-boiled eggs, and bread. Look for ivy branches (frasche) hung outside. ' +
      'Incredibly cheap (€5-10 for wine + snacks). Rotating schedule — check osmize.com for what\'s open. ' +
      'An unforgettable, authentically local experience.',
    category: 'food',
    rating: 4.8,
    priceLevel: 1,
    websiteUrl: 'https://www.osmize.com',
    duration: '1-2 hours',
    orderIndex: 16,
  },
  {
    title: 'Barcola Beach & Topolini',
    description:
      'Trieste\'s main beach strip — a long concrete promenade where locals sunbathe, swim, and socialize. ' +
      'Not a sandy beach but the water is clean and the vibe is authentic Italian summer. ' +
      'The "Topolini" (little mice) are colorful concrete changing huts. ' +
      'Perfect for a morning swim before sightseeing. Free access.',
    category: 'nature',
    rating: 4.3,
    address: 'Viale Miramare, Barcola, Trieste',
    duration: '1-2 hours',
    orderIndex: 17,
  },

  // ─── Slovenia Side Trips ───
  {
    title: 'Piran, Slovenia (Side Trip)',
    description:
      'A gorgeous Venetian-influenced coastal town just 30min from Trieste. Tiny, photogenic, ' +
      'with a stunning main square (Tartini Square), medieval walls, and fresh seafood. ' +
      'Easy half-day addition. Can combine with Portorož (beach resort) and Strunjan (nature reserve). ' +
      'No border checks (Schengen). Consider for afternoon if overnighting in Trieste.',
    category: 'attraction',
    rating: 4.7,
    priceLevel: 2,
    address: 'Piran, Slovenia',
    duration: 'Half day',
    orderIndex: 18,
  },
  {
    title: 'Ljubljana, Slovenia (Side Trip)',
    description:
      'Slovenia\'s charming capital, 1.5hr from Trieste. Compact old town, Ljubljana Castle, ' +
      'dragon bridge, excellent restaurant scene, and a car-free city center. ' +
      'Best as a separate day if you have time. Can also detour to Lake Bled (2hr from Trieste). ' +
      'Makes sense if doing a 2-night Trieste stay.',
    category: 'attraction',
    rating: 4.6,
    priceLevel: 2,
    address: 'Ljubljana, Slovenia',
    duration: 'Full day',
    orderIndex: 19,
  },
];

// ── Itinerary: Recommended 2-Day Schedule ──────────────
const items: Array<{
  title: string;
  description: string;
  startTime?: string;
  endTime?: string;
  location: string;
  category: string;
  orderIndex: number;
}> = [
  // Day 1: Trieste City
  {
    title: 'Drive Vicenza → Trieste',
    description:
      'Approx 2.5hr drive (200km) via A4 east. Tolls ~€12-15. Straightforward motorway. ' +
      'Alternatively: train from Vicenza to Trieste Centrale (2h15 Frecciarossa, €20-35). ' +
      'Driving recommended for flexibility with Miramare, Karst, and potential Slovenia trips.',
    startTime: '08:00',
    endTime: '10:30',
    location: 'Vicenza → Trieste',
    category: 'transport',
    orderIndex: 0,
  },
  {
    title: 'Morning Coffee at Caffè San Marco',
    description:
      'Start your Trieste experience at the city\'s most legendary café. Order a "capo in b" ' +
      '(Trieste\'s version of a cappuccino, served in a glass). Browse the bookshop section. ' +
      'Soak in the art nouveau atmosphere that once inspired writers like Joyce and Svevo.',
    startTime: '10:30',
    endTime: '11:15',
    location: 'Caffè San Marco, Via Cesare Battisti 18',
    category: 'meal',
    orderIndex: 1,
  },
  {
    title: 'Explore Borgo Teresiano & Canale Grande',
    description:
      'Walk through the elegant 18th-century district. See the Serbian Orthodox Church ' +
      'of San Spiridione (blue domes, Byzantine mosaics). Stroll along the small canal. ' +
      'This area captures Habsburg Trieste perfectly.',
    startTime: '11:15',
    endTime: '12:00',
    location: 'Borgo Teresiano, Trieste',
    category: 'sightseeing',
    orderIndex: 2,
  },
  {
    title: 'Lunch at Buffet da Pepi',
    description:
      'The iconic Triestine "buffet" serving boiled pork, sausages, and sauerkraut since 1897. ' +
      'This is where Austrian and Italian cuisine literally share a plate. Casual, cheap, delicious. ' +
      'Try the bollito misto with mustard and horseradish.',
    startTime: '12:00',
    endTime: '13:00',
    location: 'Buffet da Pepi, Via Cassa di Risparmio 3',
    category: 'meal',
    orderIndex: 3,
  },
  {
    title: 'Piazza Unità d\'Italia & Roman Theater',
    description:
      'Europe\'s largest sea-facing square. Admire the Habsburg palaces, then walk to the nearby ' +
      'Teatro Romano (1st century AD Roman amphitheater). Pass through the Arco di Riccardo, ' +
      'a Roman arch from 33 BC.',
    startTime: '13:00',
    endTime: '14:00',
    location: 'Piazza Unità d\'Italia',
    category: 'sightseeing',
    orderIndex: 4,
  },
  {
    title: 'Castello di San Giusto & Cathedral',
    description:
      'Walk up to the medieval fortress for panoramic views. Visit the Cathedral of San Giusto ' +
      'with its Byzantine mosaics. The climb is worth it for the 360° view over city and sea.',
    startTime: '14:00',
    endTime: '15:30',
    location: 'Castello di San Giusto',
    category: 'sightseeing',
    orderIndex: 5,
  },
  {
    title: 'Afternoon Coffee at Antico Caffè Torinese',
    description:
      'Second coffee stop — try this ornate turn-of-century café. Have a "nero" (espresso) ' +
      'and a slice of strudel or Sachertorte. The Viennese pastry tradition is strong here.',
    startTime: '15:30',
    endTime: '16:00',
    location: 'Antico Caffè Torinese, Corso Italia 2',
    category: 'meal',
    orderIndex: 6,
  },
  {
    title: 'Barcola Beach Walk / Swim',
    description:
      'Head to Trieste\'s local beach for a dip in the Adriatic or just a stroll along the promenade. ' +
      'The colorful "Topolini" changing huts are iconic. Locals swim right off the concrete platforms.',
    startTime: '16:00',
    endTime: '17:30',
    location: 'Barcola, Trieste',
    category: 'activity',
    orderIndex: 7,
  },
  {
    title: 'Sunset Aperitivo on Molo Audace',
    description:
      'Walk the 246m pier for the best sunset in Trieste. Grab a Spritz at Caffè degli Specchi or ' +
      'a nearby bar first, then stroll the pier as the sky turns gold over Piazza Unità.',
    startTime: '18:00',
    endTime: '19:00',
    location: 'Molo Audace & Piazza Unità',
    category: 'activity',
    orderIndex: 8,
  },
  {
    title: 'Seafood Dinner at Al Bagatto',
    description:
      'Top-tier Adriatic seafood. Raw fish antipasti, spaghetti alle vongole, fresh catch. ' +
      'Pair with a local Vitovska or Malvasia white. Reserve ahead. €35-50/person.',
    startTime: '19:30',
    endTime: '21:30',
    location: 'Al Bagatto, Via Luigi Cadorna 7',
    category: 'meal',
    orderIndex: 9,
  },

  // Day 2: Miramare + Karst or Slovenia
  {
    title: 'Morning Coffee at Barakin',
    description:
      'Start Day 2 at this beloved clifftop kiosk with panoramic city views. Coffee made from ' +
      'wood-fired beans by Antica Tostatura Triestina. Simple, local, beautiful.',
    startTime: '08:30',
    endTime: '09:15',
    location: 'Barakin, Passeggio Sant\'Andrea',
    category: 'meal',
    orderIndex: 10,
  },
  {
    title: 'Castello di Miramare',
    description:
      'The fairytale castle on the promontory. Tour the ornate Habsburg interiors (€10), ' +
      'then wander the free botanical gardens. Allow 2+ hours. Arrive early to avoid crowds.',
    startTime: '09:30',
    endTime: '12:00',
    location: 'Castello di Miramare',
    category: 'sightseeing',
    orderIndex: 11,
  },
  {
    title: 'Karst Option: Grotta Gigante',
    description:
      'Drive 15min to the Karst plateau for the Giant Cave tour (~50 min, hourly). ' +
      'Main chamber is 107m high. Stop at an osmiza afterwards for wine and prosciutto. ' +
      'OR: Skip and drive to Piran instead (see next item).',
    startTime: '12:30',
    endTime: '14:30',
    location: 'Grotta Gigante, Sgonico',
    category: 'activity',
    orderIndex: 12,
  },
  {
    title: 'Alternative: Half-Day in Piran, Slovenia',
    description:
      'Instead of Grotta Gigante, drive 30min to Piran. Gorgeous Venetian coastal town. ' +
      'See Tartini Square, climb the city walls for views, have seafood lunch at a harbor restaurant. ' +
      'Return to Trieste by 15:00, then head back to Vicenza.',
    startTime: '12:30',
    endTime: '15:00',
    location: 'Piran, Slovenia',
    category: 'sightseeing',
    orderIndex: 13,
  },
  {
    title: 'Drive Trieste → Vicenza',
    description:
      'Head back via A4 west. ~2.5hr drive. If you visited Piran, return via the coastal road ' +
      'through Muggia (pretty border village) before hitting the motorway.',
    startTime: '15:00',
    endTime: '17:30',
    location: 'Trieste → Vicenza',
    category: 'transport',
    orderIndex: 14,
  },
];

// ── Weather data (monthly) ─────────────────────────────
const weatherMonthly = [
  { month: 1, avgHighC: 7, avgLowC: 2, rainyDays: 6, sunshineHours: 3.5 },
  { month: 2, avgHighC: 9, avgLowC: 3, rainyDays: 6, sunshineHours: 4.5 },
  { month: 3, avgHighC: 13, avgLowC: 6, rainyDays: 7, sunshineHours: 5.5 },
  { month: 4, avgHighC: 17, avgLowC: 10, rainyDays: 9, sunshineHours: 6.5 },
  { month: 5, avgHighC: 22, avgLowC: 14, rainyDays: 9, sunshineHours: 8 },
  { month: 6, avgHighC: 26, avgLowC: 18, rainyDays: 9, sunshineHours: 9 },
  { month: 7, avgHighC: 29, avgLowC: 20, rainyDays: 7, sunshineHours: 10 },
  { month: 8, avgHighC: 28, avgLowC: 20, rainyDays: 7, sunshineHours: 9 },
  { month: 9, avgHighC: 24, avgLowC: 16, rainyDays: 7, sunshineHours: 7 },
  { month: 10, avgHighC: 18, avgLowC: 12, rainyDays: 8, sunshineHours: 5 },
  { month: 11, avgHighC: 12, avgLowC: 7, rainyDays: 8, sunshineHours: 3.5 },
  { month: 12, avgHighC: 8, avgLowC: 3, rainyDays: 7, sunshineHours: 3 },
];

async function seed() {
  console.log('☕🏰 Seeding Trieste — Border City & Coffee Culture...\n');

  // Insert destination
  const destId = nanoid();
  await db.insert(schema.tripDestinations).values({
    id: destId,
    ...destination,
  });
  console.log(`  ✓ Destination: ${destination.name}`);

  // Insert research
  await db.insert(schema.destinationResearch).values({
    destinationId: destId,
    ...research,
  });
  console.log('  ✓ Research data (overview, costs, transport, culture, tips)');

  // Insert highlights
  for (const h of highlights) {
    await db.insert(schema.destinationHighlights).values({
      id: nanoid(),
      destinationId: destId,
      ...h,
    });
  }
  console.log(`  ✓ ${highlights.length} highlights (attractions, cafés, restaurants, side trips)`);

  // Insert weather
  for (const w of weatherMonthly) {
    await db.insert(schema.destinationWeatherMonthly).values({
      id: nanoid(),
      destinationId: destId,
      ...w,
    });
  }
  console.log('  ✓ Monthly weather data (12 months)');

  // Insert itinerary items
  const DATE = 'TBD';
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
  }
  console.log(`  ✓ ${items.length} itinerary items (2-day schedule)`);

  console.log('\n✅ Done! Trieste fully researched.\n');
  console.log('📋 Summary:');
  console.log('   Drive: ~2.5hr each way (200km via A4), tolls ~€25-30 roundtrip');
  console.log('   Train alt: Vicenza→Trieste 2h15 Frecciarossa, €20-35');
  console.log('   VERDICT: Best as overnight (1-2 nights). Day trip doable but rushed.');
  console.log('   Key experiences: Coffee culture, Piazza Unità, Miramare Castle, seafood');
  console.log('   Bonus: Piran (30min) or Ljubljana (1.5hr) side trips to Slovenia');
  console.log('   Budget: €60-100/day (Trieste is cheaper than Venice/Florence)');
  console.log('   ⭐ Absolutely worth the longer drive — unique city unlike anywhere in Italy');

  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
