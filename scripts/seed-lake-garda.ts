/**
 * Seed Lake Garda & Sirmione — Lakeside Paradise
 * Deep research on Sirmione peninsula, beaches, thermal baths, towns, logistics
 * Usage: bun run scripts/seed-lake-garda.ts
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
  name: 'Lake Garda — Sirmione',
  description:
    'Italy\'s largest lake — a stunning Mediterranean microclimate at the foot of the Alps. ' +
    'Sirmione is the crown jewel: a narrow peninsula jutting into the southern lake, home to ' +
    'Roman ruins, a medieval castle, thermal springs, and some of the clearest water in Italy. ' +
    'Only ~1.5 hours from Vicenza, perfect for a day trip or relaxing overnight. ' +
    'Other must-visit towns: Malcesine (cable car to Monte Baldo), Riva del Garda (northern tip, dramatic mountains), ' +
    'Limone sul Garda (lemon terraces), and Bardolino (wine town on the eastern shore).',
  lat: 45.4910,
  lng: 10.6080,
  arrivalDate: null as string | null,
  departureDate: null as string | null,
  photoUrl: null as string | null,
  status: 'researched' as const,
  researchStatus: 'fully_researched' as const,
  orderIndex: 22,
};

// ── Research data ──────────────────────────────────────
const research = {
  country: 'Italy',
  region: 'Lombardy / Veneto / Trentino (lake spans 3 regions)',
  timezone: 'CET (UTC+1) / CEST (UTC+2) summer',
  language: 'Italian (German widely understood, English common in tourist areas)',
  currency: 'EUR',
  population: 'Sirmione: ~8,400; Lake Garda area: ~150,000',
  elevation: '65m (lake level)',
  bestTimeToVisit:
    'June–September for swimming and warm weather. July–August peak season (crowded, hot). ' +
    'June and September are ideal — warm enough to swim, fewer crowds. ' +
    'Thermal baths are great year-round. Spring (April–May) lovely for sightseeing without the summer crush.',
  avgTempHighC: 30, // Summer avg
  avgTempLowC: 18,
  rainyDaysPerMonth: 6,
  weatherNotes:
    'Mediterranean microclimate means mild winters and warm summers. Lake Garda is notably warmer than surrounding areas. ' +
    'Summer highs 28–33°C, water temp 22–25°C in Jul/Aug. Afternoon thunderstorms possible in summer. ' +
    'The "Ora" wind from the south picks up most afternoons — great for sailing, can make lake choppy.',
  dailyBudgetLow: '60',
  dailyBudgetMid: '120',
  dailyBudgetHigh: '250',
  budgetCurrency: 'EUR',
  costNotes:
    'Sirmione is a tourist hotspot — restaurants on the peninsula charge a premium. ' +
    'Parking in summer: €2-4/hour, can easily spend €15-20/day. ' +
    'Grotte di Catullo: €8 (€2 reduced). Scaliger Castle: €6. ' +
    'Aquaria thermal spa: €55-70 for day entry (weekday/weekend). ' +
    'Boat tours: €15-35 depending on route. Ferries: €5-15 per crossing. ' +
    'Budget tip: eat away from the Sirmione old town center for 30-40% savings.',
  transportNotes:
    '**From Vicenza (~1.5 hours):**\n' +
    '• Drive: A4 motorway west → exit Sirmione. ~100 km, tolls ~€8-10 each way.\n' +
    '• Route: Vicenza → A4 → Desenzano del Garda/Sirmione exit → follow signs to Sirmione.\n' +
    '• Train: Vicenza → Desenzano del Garda-Sirmione station (regional ~1.5h, €8-12), then bus/taxi 10 min to Sirmione.\n\n' +
    '**Parking in summer (CRITICAL):**\n' +
    '• Sirmione has VERY limited parking. In peak summer, arrive before 9:30 AM or you may circle for hours.\n' +
    '• Main lots: Parcheggio Monte Baldo (largest, ~800 spots, €2/hr) near the entrance to old town.\n' +
    '• Parcheggio Piazzale Porto (closest to castle, tiny, fills immediately).\n' +
    '• Consider parking in Colombare di Sirmione (free/cheaper lots) and taking the shuttle bus.\n' +
    '• Alternative: Park in Desenzano and take the ferry to Sirmione (avoids parking nightmare entirely).\n\n' +
    '**Getting around the lake:**\n' +
    '• Navigazione Lago di Garda ferries connect all major towns. Buy tickets at piers or online.\n' +
    '• Car ferries between Maderno and Torri del Benaco (shortcut east↔west).\n' +
    '• Driving around the entire lake: ~150 km, 3-4 hours without stops (roads can be narrow and winding on west side).',
  nearestAirport: 'Verona Villafranca (VRN) — 25 km; also Brescia Montichiari (VBS) — 30 km; Bergamo (BGY) — 80 km',
  safetyRating: 5,
  safetyNotes: 'Very safe tourist destination. Watch for pickpockets in crowded Sirmione old town in summer. Lake swimming is generally safe but respect boat traffic zones.',
  culturalNotes:
    'Lake Garda has been a beloved retreat since Roman times — Catullus himself wrote love poems about Sirmione. ' +
    'The lake sits at the crossroads of three Italian regions and two cultural zones (Latin and Germanic). ' +
    'Northern towns like Riva del Garda feel almost Austrian. Southern towns are purely Italian. ' +
    'Local specialties: lake fish (coregone, pike, sardines), olive oil (Garda DOP), Bardolino and Lugana wines. ' +
    'The "Ora" afternoon wind is a cherished local phenomenon — windsurfers flock to Torbole for it.',
  summary:
    'Lake Garda is one of Italy\'s most spectacular natural wonders — a massive, crystal-clear lake ' +
    'flanked by olive groves to the south and soaring Dolomite foothills to the north. Sirmione, ' +
    'the iconic peninsula town, offers an incredible concentration of history (Roman ruins, medieval castle), ' +
    'relaxation (thermal springs piped directly from the lake bed), and natural beauty (Jamaica Beach, ' +
    'turquoise waters). At only 1.5 hours from Vicenza, it\'s one of the easiest and most rewarding ' +
    'day trips. However, for a more relaxed experience — especially if you want to visit the thermal baths ' +
    'AND explore other lake towns — an overnight stay is strongly recommended. The lake is large enough ' +
    'that you could spend a week exploring different towns, each with its own character.',
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
    title: 'Grotte di Catullo (Roman Villa Ruins)',
    description:
      'The largest and most important example of a Roman villa in northern Italy, spectacularly perched at the very tip ' +
      'of the Sirmione peninsula. Despite the name ("Grottoes of Catullus"), these aren\'t caves — the "grottoes" ' +
      'refer to the overgrown ruins that locals found centuries later. The villa dates to the 1st century BC/AD and ' +
      'covers over 2 hectares. The site includes a small museum with Roman artifacts, mosaics, and ceramics. ' +
      'The views from the ruins over Lake Garda are absolutely stunning — possibly the best viewpoint in Sirmione. ' +
      'An electric shuttle runs from the old town to the entrance for those who don\'t want to walk (€1). ' +
      'Allow 1-2 hours. Best visited in the morning before the heat.',
    category: 'attraction',
    rating: 4.5,
    priceLevel: 1,
    address: 'Piazzale Orti Manara 4, Sirmione',
    websiteUrl: 'https://www.grottedicatullo.beniculturali.it/',
    duration: '1-2 hours',
    orderIndex: 0,
  },
  {
    title: 'Scaliger Castle (Castello Scaligero)',
    description:
      'A remarkably well-preserved 13th-century castle built by the Scaliger (della Scala) family of Verona, ' +
      'strategically positioned at the entrance to Sirmione\'s old town. The castle is completely surrounded by ' +
      'water — one of the few "water castles" in Italy. You enter through a drawbridge, and can climb the tower ' +
      'for panoramic views of the lake and rooftops. The inner harbor (darsena) is particularly photogenic. ' +
      'Relatively quick visit — the interior is mostly walls and battlements rather than furnished rooms. ' +
      'The castle also served as a dock for the Scaliger fleet. In summer, the entrance queue can be 20-30 min ' +
      'around midday — go early or late afternoon.',
    category: 'attraction',
    rating: 4.3,
    priceLevel: 1,
    address: 'Piazza Castello, Sirmione',
    duration: '30-60 min',
    orderIndex: 1,
  },
  {
    title: 'Aquaria Thermal Spa (Terme di Sirmione)',
    description:
      'A modern wellness center fed by Sirmione\'s unique sulphurous thermal water, which rises from the lake bed ' +
      'at 69°C. The spa features indoor and outdoor thermal pools (34-36°C), an infinity pool overlooking the lake, ' +
      'Finnish saunas with lake views, steam baths, Turkish hammam, a vascular path, and the signature DIVA ' +
      'whirlpool bath. The outdoor thermal pool has whirlpools, effervescent beds, and swan-neck jets. ' +
      'The solarium terrace is perfect for sunset aperitifs. The thermal water is classified as "sulphurous ' +
      'salso-bromo-iodine" and is renowned for respiratory and skin benefits. ' +
      'Book in advance for summer weekends — it sells out. Weekday mornings are quieter and cheaper (~€55 vs €70). ' +
      'Bathrobe and towel rental available (~€5-8). There\'s also a bistrot inside for light meals.',
    category: 'activity',
    rating: 4.6,
    priceLevel: 3,
    address: 'Piazza Don A. Piatti 1, Sirmione',
    websiteUrl: 'https://www.termedisirmione.com/en/spathermalgarden/',
    duration: '3-5 hours (half day recommended)',
    orderIndex: 2,
  },
  // ─── Beaches ───
  {
    title: 'Jamaica Beach (Spiaggia Giamaica)',
    description:
      'Sirmione\'s most famous beach — and arguably Lake Garda\'s most iconic. Located at the tip of the peninsula ' +
      'near the Grotte di Catullo, it\'s named for its flat, white limestone rocks and Caribbean-turquoise water. ' +
      'The water is crystal clear and you can actually feel warm thermal water bubbling up from the lake bed in places! ' +
      'It\'s a rocky beach (bring water shoes), not sandy, but the scenery is extraordinary. Gets VERY crowded in ' +
      'July-August — arrive before 10 AM to get a good spot. No facilities (no sunbed rentals, no bars). ' +
      'Bring your own water, snacks, and shade. Free access. The 15-min walk from the old town is part of the charm.',
    category: 'nature',
    rating: 4.4,
    priceLevel: 1,
    address: 'Tip of Sirmione peninsula (near Grotte di Catullo)',
    duration: '2-4 hours',
    orderIndex: 3,
  },
  {
    title: 'Lido delle Bionde',
    description:
      'A well-equipped beach on the eastern side of the Sirmione peninsula, just a short walk from the old town. ' +
      'Unlike Jamaica Beach, this has proper facilities: sunbed and umbrella rentals (~€15-20/day), a bar/restaurant, ' +
      'changing rooms, and showers. Mix of pebble beach and grass areas. The water is clean and clear with a gradual ' +
      'entry — good for less confident swimmers. Also has a diving board and floating platform. ' +
      'More family-friendly than Jamaica Beach. Gets busy but manageable.',
    category: 'nature',
    rating: 4.0,
    priceLevel: 2,
    address: 'Via Vittorio Emanuele, Sirmione',
    duration: '2-4 hours',
    orderIndex: 4,
  },
  {
    title: 'Spiaggia Punta Grò',
    description:
      'A quieter, free public beach south of the Sirmione old town, along the western shore. ' +
      'Mix of grass, pebbles, and small sandy patches. Less crowded than Jamaica Beach because it\'s further ' +
      'from the main attractions. Has a couple of bar/kiosks nearby. Good for families. ' +
      'Shallow entry, clean water. Parking available nearby (easier than old town).',
    category: 'nature',
    rating: 3.8,
    priceLevel: 1,
    address: 'Via Punta Grò, Colombare di Sirmione',
    duration: '2-3 hours',
    orderIndex: 5,
  },
  // ─── Boat Tours ───
  {
    title: 'Boat Tour Around Sirmione Peninsula',
    description:
      'Several operators offer 25-30 minute motorboat tours around the entire Sirmione peninsula. ' +
      'You\'ll see the Scaliger Castle from the water, cruise past the thermal springs (you can see/smell the sulphur ' +
      'bubbling up), and get close to the Grotte di Catullo ruins from below — a perspective you can\'t get on foot. ' +
      'Boats depart regularly from the harbor near the castle. No reservation needed — just show up. ' +
      '~€8-12 per person. Great photo opportunities. Some operators offer longer lake crossings too.',
    category: 'activity',
    rating: 4.2,
    priceLevel: 1,
    address: 'Harbor near Scaliger Castle, Sirmione',
    duration: '25-30 min',
    orderIndex: 6,
  },
  {
    title: 'Ferry to Desenzano / Peschiera / Gardone',
    description:
      'Navigazione Lago di Garda runs regular ferry services connecting Sirmione with other lake towns. ' +
      'Popular routes: Sirmione → Desenzano (15 min, ~€5), Sirmione → Peschiera (20 min, ~€6), ' +
      'Sirmione → Gardone Riviera (40 min, ~€10). The slow ferries offer great views; the hydrofoils (aliscafo) ' +
      'are faster but pricier. Buy a day pass if planning multiple crossings (~€35). ' +
      'Pro tip: take the ferry TO Sirmione from Desenzano and skip the parking nightmare entirely.',
    category: 'activity',
    rating: 4.3,
    priceLevel: 2,
    websiteUrl: 'https://www.navigazionelaghi.it/',
    duration: '15 min - 2 hours depending on route',
    orderIndex: 7,
  },
  // ─── Other Lake Garda Towns ───
  {
    title: 'Malcesine & Monte Baldo Cable Car',
    description:
      'A gorgeous medieval village on the eastern shore, about 1 hour north of Sirmione by car (or 2h by ferry). ' +
      'The star attraction is the rotating Funivia Malcesine-Monte Baldo cable car that whisks you up to 1,760m ' +
      'for jaw-dropping panoramic views of the entire lake and the Alps. At the top: hiking trails, paragliding, ' +
      'and a botanical garden. The village itself has a charming Scaliger castle (with a natural history museum), ' +
      'narrow cobblestone streets, and the picturesque Porto Vecchio harbor. ' +
      'Cable car: ~€22 roundtrip. Book online in summer — queues can be 1-2 hours!',
    category: 'attraction',
    rating: 4.7,
    priceLevel: 2,
    address: 'Malcesine, Province of Verona',
    websiteUrl: 'https://www.funiviedelbaldo.it/',
    duration: 'Half day',
    orderIndex: 8,
  },
  {
    title: 'Riva del Garda',
    description:
      'The largest town on the northern shore, dramatically set beneath towering limestone cliffs. ' +
      'Completely different vibe from the south — feels almost Austrian (it was part of Austria-Hungary until 1918). ' +
      'Highlights: MAG Museum in the lakeside Rocca fortress, the Bastione fortress hike (panoramic views), ' +
      'the Varone Waterfall (a 100m cascade inside a gorge, ~€6), and the beautiful lakefront piazza. ' +
      'Popular with windsurfers and sailors due to reliable winds. Great base for exploring the northern lake. ' +
      'About 1.5 hours from Sirmione by car, or take the scenic ferry (~3 hours, but beautiful ride).',
    category: 'attraction',
    rating: 4.5,
    priceLevel: 2,
    address: 'Riva del Garda, Province of Trento',
    duration: 'Half day to full day',
    orderIndex: 9,
  },
  {
    title: 'Limone sul Garda',
    description:
      'One of the most photogenic towns on the lake, clinging to the steep western shore. ' +
      'Famous for its historic lemon terraces (limonaie) — Limone was one of the northernmost places in the world ' +
      'where lemons were commercially grown, thanks to the lake\'s microclimate. Visit the Limonaia del Castel ' +
      'to see the restored terraces (€3). The town is tiny and extremely picturesque with colorful houses, ' +
      'narrow alleys, and a small harbor. Also famous: residents here carry the "Limone protein" (Apolipoprotein A-1 ' +
      'Milano), a genetic mutation that makes them virtually immune to heart disease! ' +
      'Gets very crowded in summer. Best reached by ferry from Malcesine (~20 min) or Riva (~30 min).',
    category: 'attraction',
    rating: 4.3,
    priceLevel: 1,
    address: 'Limone sul Garda, Province of Brescia',
    duration: '2-3 hours',
    orderIndex: 10,
  },
  {
    title: 'Bardolino',
    description:
      'A cheerful wine town on the eastern shore, about 30 min north of Sirmione by car. ' +
      'Famous for its light, fruity Bardolino red wine and Chiaretto rosé — there are numerous enotecas and ' +
      'tasting rooms along the main street. The Museo del Vino (Wine Museum) at Zeni winery offers free tastings. ' +
      'The lakefront promenade is lovely for a stroll, with views west across the lake. ' +
      'Thursday is market day (one of the best markets on the lake). ' +
      'Also worth visiting: the 9th-century church of San Zeno, one of the best-preserved Carolingian churches in Italy. ' +
      'Bardolino has a relaxed, less touristy vibe than Sirmione.',
    category: 'attraction',
    rating: 4.1,
    priceLevel: 2,
    address: 'Bardolino, Province of Verona',
    duration: '2-3 hours',
    orderIndex: 11,
  },
  // ─── Restaurants ───
  {
    title: 'Ristorante La Rucola 2.0 (Sirmione)',
    description:
      'Michelin-starred fine dining in the heart of Sirmione old town. Creative Italian cuisine with lake fish ' +
      'specialties. Chef Gionata Bignotti creates stunning tasting menus. Intimate setting in a historic building. ' +
      'Tasting menu from ~€90-120. Reservations essential, especially in summer. Splurge-worthy.',
    category: 'food',
    rating: 4.8,
    priceLevel: 4,
    address: 'Vicolo Strentelle 7, Sirmione',
    websiteUrl: 'https://www.ristorantelarucola.it/',
    duration: '2-3 hours',
    orderIndex: 12,
  },
  {
    title: 'Trattoria Clement (Sirmione)',
    description:
      'A beloved local trattoria just outside the old town walls — much better value than restaurants inside. ' +
      'Excellent lake fish dishes (try the coregone or lavarello), homemade pasta, and a fantastic wine list ' +
      'featuring local Lugana whites. Outdoor terrace. Mains €15-22. Book ahead for dinner.',
    category: 'food',
    rating: 4.4,
    priceLevel: 2,
    address: 'Via Piana 68, Sirmione',
    duration: '1-1.5 hours',
    orderIndex: 13,
  },
  {
    title: 'Ristorante Al Pescatore (Sirmione)',
    description:
      'Right on the waterfront with beautiful lake views. Specializes in fresh lake and sea fish. ' +
      'The mixed grilled fish plate is excellent. Outdoor seating right over the water. ' +
      'Tourist-facing location means slightly higher prices, but the setting is worth it for a special meal. ' +
      'Mains €18-30.',
    category: 'food',
    rating: 4.2,
    priceLevel: 3,
    address: 'Via Piana 20, Sirmione',
    duration: '1-1.5 hours',
    orderIndex: 14,
  },
  {
    title: 'Gelateria Scaligera (Sirmione)',
    description:
      'Artisanal gelato on the main drag of Sirmione old town. Known for creative flavors and use of local ' +
      'ingredients. Try the stracciatella or pistachio. Expect a queue in summer but it moves fast. ' +
      'Cones from €3. A must-stop on the passeggiata.',
    category: 'food',
    rating: 4.5,
    priceLevel: 1,
    address: 'Via Vittorio Emanuele, Sirmione',
    duration: '15-30 min',
    orderIndex: 15,
  },
  {
    title: 'Osteria al Torcol (Bardolino)',
    description:
      'If you visit Bardolino, this charming osteria serves outstanding local cuisine at reasonable prices. ' +
      'Known for handmade pasta, grilled meats, and an excellent Bardolino wine selection. ' +
      'Cozy interior and outdoor courtyard. Mains €12-20. Great value.',
    category: 'food',
    rating: 4.3,
    priceLevel: 2,
    address: 'Via San Vito 27, Bardolino',
    duration: '1-1.5 hours',
    orderIndex: 16,
  },
  // ─── Cultural ───
  {
    title: 'Chiesa di San Pietro in Mavino',
    description:
      'A beautiful Romanesque church on the Sirmione peninsula, dating back to the 8th century. ' +
      'Contains remarkable medieval frescoes from the 12th-13th century. Peaceful and much less visited ' +
      'than the main attractions — a hidden gem. Free entry. On the walk toward the Grotte di Catullo.',
    category: 'cultural',
    rating: 4.0,
    priceLevel: 1,
    address: 'Via San Pietro in Mavino, Sirmione',
    duration: '15-30 min',
    orderIndex: 17,
  },
];

// ── Weather data ───────────────────────────────────────
const weatherData = [
  { month: 1,  avgHighC: 6,  avgLowC: 0,  rainyDays: 5,  humidity: 78 },
  { month: 2,  avgHighC: 9,  avgLowC: 1,  rainyDays: 5,  humidity: 72 },
  { month: 3,  avgHighC: 14, avgLowC: 5,  rainyDays: 6,  humidity: 65 },
  { month: 4,  avgHighC: 18, avgLowC: 9,  rainyDays: 8,  humidity: 65 },
  { month: 5,  avgHighC: 23, avgLowC: 13, rainyDays: 9,  humidity: 66 },
  { month: 6,  avgHighC: 27, avgLowC: 17, rainyDays: 8,  humidity: 65 },
  { month: 7,  avgHighC: 30, avgLowC: 19, rainyDays: 5,  humidity: 62 },
  { month: 8,  avgHighC: 29, avgLowC: 19, rainyDays: 7,  humidity: 65 },
  { month: 9,  avgHighC: 25, avgLowC: 15, rainyDays: 6,  humidity: 68 },
  { month: 10, avgHighC: 19, avgLowC: 10, rainyDays: 7,  humidity: 73 },
  { month: 11, avgHighC: 12, avgLowC: 5,  rainyDays: 7,  humidity: 78 },
  { month: 12, avgHighC: 7,  avgLowC: 1,  rainyDays: 5,  humidity: 79 },
];

// ── Itinerary items (suggested day trip) ───────────────
const itineraryItems: Array<{
  title: string;
  description: string;
  startTime?: string;
  endTime?: string;
  location: string;
  category: string;
  orderIndex: number;
}> = [
  {
    title: 'Drive Vicenza → Sirmione',
    description:
      'Approx 1.5 hours via A4 motorway west. ~100 km, tolls ~€8-10. ' +
      'Exit at Sirmione. In summer, arrive by 9:00 AM to find parking! ' +
      'Best option: park at Parcheggio Monte Baldo or in Colombare and take the shuttle. ' +
      'Alternative: park in Desenzano and take the ferry to Sirmione (15 min, avoids parking chaos).',
    startTime: '07:30',
    endTime: '09:00',
    location: 'Vicenza → Sirmione',
    category: 'transport',
    orderIndex: 0,
  },
  {
    title: 'Scaliger Castle',
    description:
      'Start your day at the iconic water castle at the entrance to old town. Climb the tower for ' +
      'panoramic views. Quick visit — 30-45 min. Gets crowded after 10:30.',
    startTime: '09:15',
    endTime: '10:00',
    location: 'Sirmione Old Town',
    category: 'sightseeing',
    orderIndex: 1,
  },
  {
    title: 'Walk to Grotte di Catullo',
    description:
      'Stroll through the charming old town pedestrian streets (grab a gelato!) toward the tip of the peninsula. ' +
      'Pass the Chiesa di San Pietro in Mavino along the way. The walk is about 15-20 min, all flat. ' +
      'Or take the electric shuttle for €1.',
    startTime: '10:00',
    endTime: '10:30',
    location: 'Sirmione Old Town → Peninsula Tip',
    category: 'sightseeing',
    orderIndex: 2,
  },
  {
    title: 'Grotte di Catullo & Jamaica Beach',
    description:
      'Explore the magnificent Roman ruins (1-1.5h), then descend to Jamaica Beach for a swim ' +
      'in the turquoise thermal-tinged waters. Bring water shoes for the rocks and a towel. ' +
      'You can feel warm sulphur springs in spots. The views are incredible.',
    startTime: '10:30',
    endTime: '13:00',
    location: 'Tip of Sirmione Peninsula',
    category: 'sightseeing',
    orderIndex: 3,
  },
  {
    title: 'Lunch at Trattoria Clement',
    description:
      'Head back toward the old town entrance for lunch outside the walls — much better value. ' +
      'Try the lake fish (coregone/lavarello) with a glass of local Lugana white wine.',
    startTime: '13:00',
    endTime: '14:30',
    location: 'Near Sirmione entrance',
    category: 'meal',
    orderIndex: 4,
  },
  {
    title: 'Boat Tour Around Peninsula',
    description:
      'Take a quick motorboat tour (~25 min, €10) around the peninsula. See the castle, thermal springs, ' +
      'and ruins from the water. Boats depart from the harbor regularly.',
    startTime: '14:30',
    endTime: '15:15',
    location: 'Sirmione Harbor',
    category: 'activity',
    orderIndex: 5,
  },
  {
    title: 'Option A: Aquaria Thermal Spa',
    description:
      'If staying overnight or doing a full relaxation day, spend the afternoon at Aquaria. ' +
      'Outdoor thermal pools, infinity pool overlooking the lake, saunas, steam baths. ' +
      'Book ahead for summer weekends. Budget 3-4 hours minimum. ~€55-70.',
    startTime: '15:30',
    endTime: '19:00',
    location: 'Aquaria Terme di Sirmione',
    category: 'activity',
    orderIndex: 6,
  },
  {
    title: 'Option B: Drive to Bardolino/Malcesine',
    description:
      'If doing a day trip and want to see more, drive along the eastern shore. ' +
      'Bardolino (30 min): wine tasting, lakefront stroll. Malcesine (1 hr): cable car up Monte Baldo ' +
      'for incredible views (last cable car ~5:45 PM in summer). Choose one!',
    startTime: '15:30',
    endTime: '18:30',
    location: 'Eastern Lake Garda shore',
    category: 'sightseeing',
    orderIndex: 7,
  },
  {
    title: 'Sunset Aperitivo & Drive Back',
    description:
      'Enjoy an aperitivo (Aperol spritz with a view) lakeside, then drive back to Vicenza. ' +
      'Return drive is ~1.5h. Will hit some traffic leaving the lake area on summer evenings.',
    startTime: '19:00',
    endTime: '21:00',
    location: 'Lake Garda → Vicenza',
    category: 'meal',
    orderIndex: 8,
  },
];

// ── Notes ──────────────────────────────────────────────
const notes = [
  {
    content:
      '## Day Trip vs Overnight?\n\n' +
      '**Day trip works** if you just want Sirmione highlights: castle + Grotte di Catullo + Jamaica Beach + lunch + boat tour. ' +
      'That fills a solid 8-9 hour day. Arrive early, leave by sunset.\n\n' +
      '**Overnight is better** if you want to:\n' +
      '- Visit the Aquaria thermal spa (needs 3-4 hours on its own)\n' +
      '- Explore other lake towns (Malcesine, Riva, Limone)\n' +
      '- Avoid the parking stress by arriving the day before\n' +
      '- Enjoy the lake at sunset and in the magical morning light\n\n' +
      '**Recommendation:** If you have flexibility, do an overnight. Stay in Sirmione or Desenzano. ' +
      'Day 1: Sirmione sights + thermal spa. Day 2: ferry/drive to a northern town (Malcesine or Riva del Garda).\n\n' +
      '**Accommodation:** Desenzano is a better base than Sirmione for value — it\'s the largest town on the lake ' +
      'with more hotel/Airbnb options, good restaurants, and a train station. Easy ferry connection to Sirmione.',
    author: 'nyx-research',
  },
  {
    content:
      '## Summer Survival Tips\n\n' +
      '- **Parking:** Arrive before 9:30 AM or park in Desenzano and ferry over\n' +
      '- **Crowds:** Sirmione old town gets PACKED mid-day in Jul/Aug. Visit early morning or late afternoon\n' +
      '- **Aquaria:** Book online in advance for weekends. Weekday mornings are 30% less crowded\n' +
      '- **Jamaica Beach:** Bring water shoes (limestone rocks), water, snacks, shade. No facilities\n' +
      '- **Sunscreen:** Lake reflection intensifies UV. Apply generously\n' +
      '- **Water:** Tap water is safe to drink everywhere. Fill bottles at public fountains\n' +
      '- **Ferries:** Check Navigazione Lago di Garda schedules. Last ferries are earlier than you\'d expect\n' +
      '- **Tolls:** Keep coins/cards for A4 motorway tolls (~€8-10 each way from Vicenza)',
    author: 'nyx-research',
  },
];

// ── Seed function ──────────────────────────────────────
async function seed() {
  console.log('🏖️  Seeding Lake Garda & Sirmione research...');

  // 1. Create destination
  const destId = nanoid();
  await db.insert(schema.tripDestinations).values({ id: destId, ...destination });
  console.log(`  ✅ Created destination: ${destination.name} (${destId})`);

  // 2. Create research
  await db.insert(schema.destinationResearch).values({
    destinationId: destId,
    ...research,
  });
  console.log('  ✅ Created research data');

  // 3. Create highlights
  for (const h of highlights) {
    await db.insert(schema.destinationHighlights).values({
      destinationId: destId,
      ...h,
    });
  }
  console.log(`  ✅ Created ${highlights.length} highlights`);

  // 4. Create weather
  for (const w of weatherData) {
    await db.insert(schema.destinationWeatherMonthly).values({
      destinationId: destId,
      ...w,
    });
  }
  console.log('  ✅ Created weather data (12 months)');

  // 5. Create itinerary items
  for (const item of itineraryItems) {
    await db.insert(schema.itineraryItems).values({
      tripId: TRIP_ID,
      date: DATE,
      ...item,
    });
  }
  console.log(`  ✅ Created ${itineraryItems.length} itinerary items`);

  // 6. Create notes
  for (const note of notes) {
    await db.insert(schema.destinationNotes).values({
      destinationId: destId,
      ...note,
    });
  }
  console.log(`  ✅ Created ${notes.length} research notes`);

  // 7. Update destination research status
  await db.update(schema.tripDestinations)
    .set({ researchStatus: 'fully_researched', lastResearchedAt: new Date() })
    .where(require('drizzle-orm').eq(schema.tripDestinations.id, destId));
  console.log('  ✅ Updated research status to fully_researched');

  console.log('\n🌊 Lake Garda & Sirmione seeded successfully!');
  process.exit(0);
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
