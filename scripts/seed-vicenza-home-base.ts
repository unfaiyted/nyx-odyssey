/**
 * Seed Vicenza — Home Base Deep Dive
 * Exhaustive research: restaurants (baccalà!), coffee, aperitivo, groceries,
 * laundromats, pharmacies, gyms, coworking, attractions, transit, daily life
 * Usage: bun run scripts/seed-vicenza-home-base.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import * as schema from '../src/db/schema';

const CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const sql = postgres(CONNECTION_STRING);
const db = drizzle(sql, { schema });

const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh'; // Italy 2026
const DEST_ID = 'rrtTb8XZ0fMIgEIAxQ_sL'; // Existing Vicenza destination

// ── Updated Research ───────────────────────────────────
const research = {
  country: 'Italy',
  region: 'Veneto',
  timezone: 'Europe/Rome (CET/CEST)',
  language: 'Italian (Vicentine dialect locally)',
  currency: 'EUR',
  population: '~112,000 (city), ~260,000 (metro)',
  elevation: '39m above sea level (flat, except Monte Berico to the south)',
  bestTimeToVisit: 'April–October. June ideal — warm, long evenings, pre-peak-tourist season.',
  avgTempHighC: 29,
  avgTempLowC: 17,
  rainyDaysPerMonth: 8,
  weatherNotes:
    'June: avg high 27–30°C (80–86°F), avg low 16–19°C (61–66°F). ~15 hours daylight (sunrise 5:30, sunset 21:00). ' +
    'Moderate rain — afternoon thunderstorms possible. Humidity can be notable in the Po Valley. ' +
    'Pack a light rain jacket and sunscreen. Long gorgeous evenings for aperitivo.',
  dailyBudgetLow: '25',
  dailyBudgetMid: '45',
  dailyBudgetHigh: '80',
  budgetCurrency: 'EUR',
  costNotes:
    'Very affordable by Italian standards. Espresso €1–1.30 at bar. Lunch menù del giorno €12–18. ' +
    'Aperitivo Spritz €3.50–6 (often with free cicchetti). Restaurant dinner €25–40/person. ' +
    'Monthly groceries ~€250–350. Gym €20–40/month. SIM card €8–20/month. ' +
    'Museum Card €15 for 4 sites. Total monthly budget (excl. accommodation): €700–1,200.',
  transportNotes:
    'Centro storico is compact (~1.5km end to end) and extremely walkable — mostly car-free ZTL zone. ' +
    'You will NOT need a car for daily life. Flat terrain except Monte Berico hill to the south. ' +
    'City bus (SVT): €1.30 single ticket, Line 18 to Monte Berico. ' +
    'Train station is 12 min walk from Contrà S. Rocco. Major rail hub on Milan–Venice line: ' +
    'Venice 45min–1h15 (€5–9), Verona 30–50min (€5–7), Padua 15–25min (€3–5), ' +
    'Bologna 1h15–1h45 (€10–15), Milan 1h45–2h15 (€15–25). ' +
    'Trenitalia Regionale: no reservation needed, validate paper tickets! ' +
    'No Uber. Taxi: Radio Taxi Vicenza +39 0444 920600. Ranks at station, Piazza Matteotti, Piazza dei Signori. ' +
    'Bike sharing: Vicenza in Bici. City is flat and very bike-friendly.',
  nearestAirport: 'Venice Marco Polo (VCE) — ~75km east, 1hr by car or bus+train. Verona Catullo (VRN) — ~60km west.',
  safetyRating: 5,
  safetyNotes: 'Very safe, prosperous city. Low crime. Walkable at all hours. Standard Italian precautions (pickpockets in tourist areas).',
  culturalNotes:
    'Vicenza is the "City of Palladio" — UNESCO World Heritage Site for 23 Palladian buildings. ' +
    'Andrea Palladio (1508–1580) designed here prolifically; his architectural style influenced the entire Western world ' +
    '(US Capitol, Monticello, British country houses all owe their look to Palladio). ' +
    'The city has a distinct culinary identity: baccalà alla vicentina is the signature obsession — dried cod slow-cooked ' +
    '4–5 hours in milk, oil, onions, anchovies, served with Marano corn polenta. Other essentials: bigoli (thick pasta) ' +
    'with duck ragù, risi e bisi, soppressa vicentina (DOP salami), gargati with Fiolaro broccoli. ' +
    'Aperitivo culture is sacred — the Spritz was born in the Veneto. Select Spritz is the local variant. ' +
    'Siesta is real (shops close 12:30–15:30). Dinner starts at 19:30–20:00 minimum. ' +
    'Coffee rules: cappuccino only before 11 AM; espresso anytime. No "to go" culture. ' +
    'Tipping not expected (round up or €1–2 for great service). Coperto (cover charge €1–3) is standard.',
  summary:
    'THIS IS HOME for the entire month of June 2026. Vicenza is the perfect base: affordable, walkable, ' +
    'centrally located in Veneto with fast train access to Venice (45min), Verona (30min), Padua (15min), ' +
    'Bologna (1h15), and the Dolomites (1h15 to Trento). A UNESCO World Heritage city with Palladio\'s masterworks ' +
    'around every corner. Excellent food scene anchored by baccalà alla vicentina. ' +
    'Staying at Derek\'s place on Contrà S. Rocco — dead center of the historic core, 5 min walk to Piazza dei Signori, ' +
    '3 min to Corso Palladio, 8 min to Teatro Olimpico, 12 min to the train station. ' +
    'Everything you need for daily life (grocery, pharmacy, gym, laundry) is within walking distance.',
  travelTips: JSON.stringify([
    'Siesta is real: most small shops close 12:30–15:30. Supermarkets stay open. Use this time for rest or work.',
    'Dinner is late: before 19:30 you\'ll eat alone. Peak restaurant hours are 20:00–21:00.',
    'Coffee rules: cappuccino only before 11 AM. Espresso anytime. Standing at bar is cheapest (€1–1.30).',
    'The Spritz was born in the Veneto. Try the local Select Spritz (bitter orange), not just Aperol.',
    'Always validate paper train tickets at the yellow machines on the platform — €50 fine if caught!',
    'Tipping not expected. Coperto (€1–3 cover charge) is standard at restaurants — it\'s not a scam.',
    'Market days: Tuesday & Thursday mornings at Piazza delle Erbe (produce, cheese, flowers). Saturday for larger market.',
    'Tap water is excellent (Alpine-fed). Carry a refillable bottle. Free fontanelle throughout centro.',
    'Trash: strict recycling (raccolta differenziata). Color-coded bins with a pickup schedule — ask your host.',
    'Museum Card (€15) covers Teatro Olimpico + Palazzo Chiericati + Palladio Museum + Santa Corona. Valid 3 days.',
    'Monte Berico walk: the porticoed path with 150 arcades is both great cardio and stunning scenery. Best at sunset.',
    'For extended coworking, Padua (25 min train) has better infrastructure (Talent Garden etc.).',
    'Pharmacies close midday! Farmacie di turno system ensures one is always open 24/7 on rotation.',
    'Get an Iliad SIM card: €7.99/month for 150GB data + calls. Best value. Bring passport for registration.',
    'Budget hack: Righetti (self-service trattoria) serves full meals under €10 — a local institution.',
  ]),
};

// ── Highlights (exhaustive) ────────────────────────────
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
  // ═══ MAJOR ATTRACTIONS ═══
  {
    title: 'Teatro Olimpico',
    description:
      'World\'s oldest surviving indoor theater (1580). Palladio\'s final masterpiece, completed by Scamozzi. ' +
      'The trompe l\'oeil stage set creates an illusion of infinite streets receding into the distance — ' +
      'the oldest surviving Renaissance stage set in the world. Best viewed from center seats. ' +
      'Occasional evening concerts (check schedule). Photography allowed (no flash). ' +
      'Hours: Tue–Sun 9:00–17:00. €11 (includes Palazzo Chiericati) or Museum Card €15.',
    category: 'attraction',
    rating: 4.9,
    priceLevel: 2,
    address: 'Piazza Matteotti, 36100 Vicenza',
    websiteUrl: 'https://www.museicivicivicenza.it',
    duration: '45–60 min',
    orderIndex: 0,
  },
  {
    title: 'Basilica Palladiana',
    description:
      'Palladio\'s first major public commission (1549) — the building that launched his career. ' +
      'Medieval town hall wrapped in Renaissance marble loggias. Iconic green copper roof. ' +
      'Upper floor hosts world-class art exhibitions (€8–12). Rooftop terrace with panoramic views — ' +
      'evening aperitivo up here is magical. The building is stunning at night when illuminated. ' +
      'Piazza dei Signori below hosts markets and events.',
    category: 'attraction',
    rating: 4.8,
    priceLevel: 2,
    address: 'Piazza dei Signori, 36100 Vicenza',
    websiteUrl: 'https://www.museicivicivicenza.it',
    duration: '1–2 hours',
    orderIndex: 1,
  },
  {
    title: 'Palazzo Chiericati (Civic Art Museum)',
    description:
      'Palladio-designed palace (1550), now the civic art museum. Renaissance and Baroque paintings — ' +
      'Veronese, Tintoretto, Tiepolo, Van Dyck. The building itself is the star: gorgeous façade with ' +
      'double loggia, frescoed ceilings inside. Hours: Tue–Sun 9:00–17:00. €11 (combined with Teatro Olimpico).',
    category: 'attraction',
    rating: 4.6,
    priceLevel: 2,
    address: 'Piazza Matteotti, 36100 Vicenza',
    duration: '1–1.5 hours',
    orderIndex: 2,
  },
  {
    title: 'Sanctuary of Monte Berico',
    description:
      'Hilltop basilica (15th century) with panoramic views over Vicenza and the Veneto plain. ' +
      'Walk up the Scalette — porticoed path with 150 arcades (~20 min uphill, excellent cardio). ' +
      'Or Bus #18 (~5 min). Must-see: Veronese\'s "Supper of St. Gregory the Great" in the refectory. ' +
      'The panoramic terrace at sunset is unforgettable. Go at golden hour. Free entry. ' +
      'Church hours: daily 6:00–12:30, 14:30–19:00 (summer until 19:30).',
    category: 'attraction',
    rating: 4.7,
    address: 'Viale X Giugno 87, 36100 Vicenza',
    duration: '1–2 hours (including walk up)',
    orderIndex: 3,
  },
  {
    title: 'Villa La Rotonda',
    description:
      'Palladio\'s most famous villa (1567). The template for countless buildings worldwide including ' +
      'the US Capitol and Monticello. Perfectly symmetrical, crowning a gentle hill with views in every direction. ' +
      '~20 min walk south from center. Interior open Wed & Sat only. Grounds Tue–Sun. €10 interior / €5 grounds.',
    category: 'attraction',
    rating: 4.8,
    priceLevel: 2,
    address: 'Via della Rotonda 45, 36100 Vicenza',
    websiteUrl: 'https://www.villalarotonda.it',
    duration: '1–1.5 hours',
    orderIndex: 4,
  },
  {
    title: 'Villa Valmarana ai Nani',
    description:
      'Stunning villa frescoed by Giambattista and Giandomenico Tiepolo (father & son). ' +
      'Named for the dwarf (nani) statues on the garden wall. Located between La Rotonda and Monte Berico — ' +
      'combine all three in one circuit. €10.',
    category: 'attraction',
    rating: 4.6,
    priceLevel: 2,
    address: 'Stradella dei Nani 8, 36100 Vicenza',
    websiteUrl: 'https://www.villavalmarana.com',
    duration: '45–60 min',
    orderIndex: 5,
  },
  {
    title: 'Palladio Museum',
    description:
      'Inside Palazzo Barbaran da Porto. Models, drawings, multimedia about Palladio\'s life and work. ' +
      'Perfect for architecture enthusiasts. Included in Museum Card (€15).',
    category: 'attraction',
    rating: 4.4,
    priceLevel: 2,
    address: 'Contrà Porti 11, 36100 Vicenza',
    websiteUrl: 'https://www.palladiomuseum.org',
    duration: '1 hour',
    orderIndex: 6,
  },
  {
    title: 'Church of Santa Corona',
    description:
      'Free entry. Contains Bellini\'s "Baptism of Christ" and Veronese\'s "Adoration of the Magi." ' +
      'Gothic interior worth visiting. Included in Museum Card.',
    category: 'cultural',
    rating: 4.5,
    address: 'Contrà Santa Corona, 36100 Vicenza',
    duration: '30 min',
    orderIndex: 7,
  },
  {
    title: 'Parco Querini',
    description:
      'Vicenza\'s main park. Neoclassical temple on an island, ducks, shaded flat paths. ' +
      'Perfect for morning runs, afternoon reading, or just decompressing. Free. 10 min walk from Contrà S. Rocco.',
    category: 'nature',
    rating: 4.4,
    address: 'Viale Dalmazia, 36100 Vicenza',
    duration: '30–60 min',
    orderIndex: 8,
  },
  {
    title: 'Piazza dei Signori & Corso Andrea Palladio',
    description:
      'The main square and the main street — the heart of Vicenza. Piazza dei Signori is flanked by the ' +
      'Basilica Palladiana and the Loggia del Capitaniato. Corso Palladio is the primary strolling/shopping/dining ' +
      'street, lined with Palladian palazzi. Evening passeggiata is a daily ritual here.',
    category: 'attraction',
    rating: 4.7,
    address: 'Piazza dei Signori, 36100 Vicenza',
    duration: 'Ongoing — you\'ll be here daily',
    orderIndex: 9,
  },
  {
    title: 'Ponte San Michele',
    description:
      'Picturesque bridge over the Retrone river. Good for photos, especially at golden hour.',
    category: 'attraction',
    rating: 4.2,
    address: 'Ponte San Michele, 36100 Vicenza',
    duration: '10 min',
    orderIndex: 10,
  },

  // ═══ RESTAURANTS — BACCALÀ SPECIALISTS ═══
  {
    title: 'Angolo Palladio',
    description:
      'Steps from the Basilica, outdoor terrace on Piazzetta Palladio. Baccalà with Marano polenta, ' +
      'bigoli with duck ragù. Also good pizza. Gambero Rosso pick. €€.',
    category: 'food',
    rating: 4.5,
    priceLevel: 2,
    address: 'Piazzetta A. Palladio 12, 36100 Vicenza',
    duration: '1–1.5 hours',
    orderIndex: 11,
  },
  {
    title: 'Il Ceppo',
    description:
      'Bistrot + gastronomy shop. Whipped baccalà 3 ways (classic, chives, squid ink). ' +
      'Baccalà tasting menu available. 500-label wine cellar. Great for aperitivo too. ' +
      'The ground-floor shop is excellent for cured meats, cheeses, and wine. Gambero Rosso pick. €€.',
    category: 'food',
    rating: 4.7,
    priceLevel: 2,
    address: 'Corso A. Palladio 196, 36100 Vicenza',
    duration: '1–2 hours',
    orderIndex: 12,
  },
  {
    title: 'Osteria Il Cursore',
    description:
      'Multi-generational family trattoria. Rustic, cozy, wood-heavy décor with a classic counter. ' +
      'Bigoli, polenta, baccalà done right. House wine. Authentic and unpretentious. Gambero Rosso pick. €–€€.',
    category: 'food',
    rating: 4.6,
    priceLevel: 1,
    address: 'Strada Pozzetto 10, 36100 Vicenza',
    duration: '1–1.5 hours',
    orderIndex: 13,
  },
  {
    title: 'Garibaldi Bistrot',
    description:
      'Prime location on Piazza dei Signori. Chef Matteo Grandi. Potato gnocchi with baccalà. ' +
      'Excellent breakfast too. Great wine-by-glass list. Gambero Rosso pick. €€.',
    category: 'food',
    rating: 4.5,
    priceLevel: 2,
    address: 'Piazza dei Signori 1, 36100 Vicenza',
    duration: '1–1.5 hours',
    orderIndex: 14,
  },
  {
    title: 'Al Pestello',
    description:
      'Historic trattoria since 1910. Young passionate couple running it now. Homemade sourdough, ' +
      'pasta, preserves. Marano polenta cloud with whipped baccalà. Gambero Rosso pick. €€.',
    category: 'food',
    rating: 4.6,
    priceLevel: 2,
    address: 'Contrà Santo Stefano 3, 36100 Vicenza',
    duration: '1–1.5 hours',
    orderIndex: 15,
  },
  {
    title: 'Ponte delle Bele',
    description:
      'Near Porta Castello. Bigoli with baccalà, gargati with Fiolaro broccoli and Vezzena cheese. ' +
      'Rich grappa selection. Homemade tiramisu. Gambero Rosso pick. €€.',
    category: 'food',
    rating: 4.5,
    priceLevel: 2,
    address: 'Contrà Ponte delle Bele 5, 36100 Vicenza',
    duration: '1–1.5 hours',
    orderIndex: 16,
  },
  {
    title: 'Da Biasio Monte Berico',
    description:
      'Just outside center on Monte Berico, panoramic terrace with city views. Creative cod variations ' +
      '(zucchini flowers, tortelli). Great for special dinners. Gambero Rosso pick. €€–€€€.',
    category: 'food',
    rating: 4.6,
    priceLevel: 3,
    address: 'Viale 10 Giugno 152, 36100 Vicenza',
    duration: '1.5–2 hours',
    orderIndex: 17,
  },

  // ═══ OTHER RESTAURANTS ═══
  {
    title: 'Righetti (Self-Service Trattoria)',
    description:
      'LOCAL INSTITUTION. Self-service, cheap, generous, authentic home cooking. Packed at lunch with workers ' +
      'and students. Full meal under €10. The unbeatable budget option. Go at noon before the line builds.',
    category: 'food',
    rating: 4.4,
    priceLevel: 1,
    address: 'Piazza Duomo 3, 36100 Vicenza',
    duration: '30–45 min',
    orderIndex: 18,
  },
  {
    title: 'Antica Casa della Malvasia',
    description:
      'Historic osteria/wine bar. Vicentine classics, atmospheric interior, excellent wine selection ' +
      'and cicchetti (Venetian bar snacks). Great for both full meals and just drinks. €€.',
    category: 'food',
    rating: 4.5,
    priceLevel: 2,
    address: 'Contrà delle Morette 5, 36100 Vicenza',
    duration: '1–2 hours',
    orderIndex: 19,
  },
  {
    title: 'Antico Guelfo',
    description:
      'Traditional rustic Venetian cuisine with an excellent wine list. Good for a proper sit-down meal. €€.',
    category: 'food',
    rating: 4.4,
    priceLevel: 2,
    address: 'Contrà Pedemuro San Biagio 92, 36100 Vicenza',
    duration: '1–1.5 hours',
    orderIndex: 20,
  },

  // ═══ COFFEE & CAFÉS ═══
  {
    title: 'Antica Pasticceria Sorarù',
    description:
      'Historic pastry shop since 1904. A Vicenza institution. Exquisite pastries and classic coffee. ' +
      'The kind of place where every local has their morning ritual. Beautiful interior.',
    category: 'food',
    rating: 4.7,
    priceLevel: 2,
    address: 'Piazzetta A. Palladio 17, 36100 Vicenza',
    duration: '20–30 min',
    orderIndex: 21,
  },
  {
    title: 'Pasticceria Declaire',
    description:
      'Modern pastry shop with creative dolci and excellent espresso. ' +
      'A good alternative to the historic spots when you want something contemporary.',
    category: 'food',
    rating: 4.5,
    priceLevel: 2,
    address: 'Contrà Cavour, 36100 Vicenza',
    duration: '20–30 min',
    orderIndex: 22,
  },
  {
    title: 'Geco Lounge Café',
    description:
      'Trendy spot near Piazza delle Erbe. The most wifi/laptop-friendly café in centro. ' +
      'Good for a working session with coffee. Best option when you need to work outside the apartment.',
    category: 'food',
    rating: 4.3,
    priceLevel: 2,
    address: 'Contrà Pescherie Vecchie, 36100 Vicenza',
    duration: '1+ hours',
    orderIndex: 23,
  },
  {
    title: 'Caffè Garibaldi',
    description:
      'On Piazza dei Signori — tourist-facing but unbeatable location. Perfect people-watching. ' +
      'Sunset aperitivo with views of the illuminated Basilica Palladiana.',
    category: 'food',
    rating: 4.3,
    priceLevel: 2,
    address: 'Piazza dei Signori, 36100 Vicenza',
    duration: '30–60 min',
    orderIndex: 24,
  },

  // ═══ APERITIVO & BARS ═══
  {
    title: 'Bar Borsa',
    description:
      'Right on Piazza dei Signori. Classic aperitivo spot. This is where you go for your first Spritz ' +
      'in Vicenza. Outdoor seating with views of the Basilica.',
    category: 'nightlife',
    rating: 4.4,
    priceLevel: 2,
    address: 'Piazza dei Signori, 36100 Vicenza',
    duration: '1 hour',
    orderIndex: 25,
  },
  {
    title: 'Bar ai Osei',
    description:
      'Another Piazza dei Signori option, very local. Less touristy than some neighbors. ' +
      'Good cicchetti with your Spritz.',
    category: 'nightlife',
    rating: 4.3,
    priceLevel: 1,
    address: 'Piazza dei Signori, 36100 Vicenza',
    duration: '1 hour',
    orderIndex: 26,
  },
  {
    title: 'Piazza delle Erbe Area',
    description:
      'The secondary square behind the Basilica — younger, livelier crowd. Market square by morning (Tue/Thu), ' +
      'bar scene by evening. Multiple venues. Also check Contrà Pescherie Vecchie (old fish market area) ' +
      'for slightly off-the-tourist-path bars.',
    category: 'nightlife',
    rating: 4.5,
    priceLevel: 1,
    address: 'Piazza delle Erbe, 36100 Vicenza',
    duration: '1–2 hours',
    orderIndex: 27,
  },
  {
    title: 'Basilica Palladiana Rooftop Terrace',
    description:
      'When open for events/exhibitions — prosecco on the rooftop with sunset views over the city. ' +
      'Check availability at museicivicivicenza.it. Magical experience if you can catch it.',
    category: 'nightlife',
    rating: 4.9,
    priceLevel: 2,
    address: 'Piazza dei Signori, 36100 Vicenza',
    duration: '1–2 hours',
    orderIndex: 28,
  },

  // ═══ GROCERY & DAILY ESSENTIALS ═══
  {
    title: 'PAM Local',
    description:
      'Small supermarket on/near Corso Palladio. Convenient for quick shopping, decent selection, ' +
      'slightly premium pricing. Open through siesta hours.',
    category: 'shopping',
    rating: 4.0,
    priceLevel: 2,
    address: 'Corso Palladio / Contrà Garibaldi area, 36100 Vicenza',
    orderIndex: 29,
  },
  {
    title: 'Conad City',
    description:
      'Urban supermarket. Good produce, Italian staples, reasonable prices. Solid daily grocery option.',
    category: 'shopping',
    rating: 4.1,
    priceLevel: 2,
    address: 'Contrà Mure Corpus Domini, 36100 Vicenza',
    orderIndex: 30,
  },
  {
    title: 'Eurospar (near station)',
    description:
      'Medium supermarket with larger selection than centro shops. ~12 min walk from Contrà S. Rocco. ' +
      'Good for weekly stock-up trips.',
    category: 'shopping',
    rating: 4.2,
    priceLevel: 2,
    address: 'Viale Milano, 36100 Vicenza',
    orderIndex: 31,
  },
  {
    title: 'Mercato di Piazza delle Erbe',
    description:
      'Open-air market: Tuesday & Thursday mornings. Fresh produce, cheese, salumi, flowers. ' +
      'This is where locals shop. Saturday for the larger market with clothing + food.',
    category: 'shopping',
    rating: 4.6,
    priceLevel: 1,
    address: 'Piazza delle Erbe, 36100 Vicenza',
    duration: '30–60 min',
    orderIndex: 32,
  },
  {
    title: 'Lidl',
    description:
      'Discount supermarket — best prices for staples. ~15 min walk south or take a bus. ' +
      'Worth the trek for a big grocery haul.',
    category: 'shopping',
    rating: 4.0,
    priceLevel: 1,
    address: 'Viale della Pace, 36100 Vicenza',
    orderIndex: 33,
  },
  {
    title: 'Il Ceppo Gastronomy Shop',
    description:
      'Ground floor of Il Ceppo on Corso Palladio. Excellent cured meats, cheeses, baccalà, ' +
      'wines, and specialty products. For when you want the good stuff.',
    category: 'shopping',
    rating: 4.7,
    priceLevel: 3,
    address: 'Corso A. Palladio 196, 36100 Vicenza',
    orderIndex: 34,
  },

  // ═══ PRACTICAL / DAILY LIFE ═══
  {
    title: 'Farmacia Internazionale',
    description:
      'Central pharmacy on Corso Palladio. Well-stocked, staff may speak English. ' +
      'Normal hours: Mon–Sat 8:30–12:30, 15:30–19:30 (closed midday!). ' +
      'For nights/weekends: check "farmacie di turno" rotation on any pharmacy door or call 800-420-707.',
    category: 'activity',
    rating: 4.2,
    address: 'Corso Palladio, 36100 Vicenza',
    orderIndex: 35,
  },
  {
    title: 'Speed Queen Lavanderia (Laundromat)',
    description:
      'Self-service washers + dryers. ~15 min walk from center. Coin-operated. ' +
      'Likely won\'t need this if apartment has a washer (most do — line dry on stendino). ' +
      'Search "lavanderia self service Vicenza" on Google Maps for current locations.',
    category: 'activity',
    rating: 3.5,
    priceLevel: 1,
    address: 'Viale della Pace area, 36100 Vicenza',
    orderIndex: 36,
  },
  {
    title: 'McFIT Vicenza',
    description:
      'Budget chain gym: ~€20–30/month, standard equipment. May require medical certificate ' +
      '(certificato medico, ~€30–50 from any doctor). Ask about monthly pass (abbonamento mensile).',
    category: 'activity',
    rating: 4.0,
    priceLevel: 1,
    address: 'Viale della Pace / commercial area, 36100 Vicenza',
    orderIndex: 37,
  },
  {
    title: 'Monte Berico Run / Workout',
    description:
      'FREE outdoor cardio. Steep walk/run up the porticoed path (700m ascent, 150 arcades). ' +
      'Incredible views at the top. Combine with Parco Querini loop for a full workout. ' +
      'Arguably better than any gym.',
    category: 'activity',
    rating: 4.8,
    address: 'Viale X Giugno, 36100 Vicenza',
    duration: '30–60 min',
    orderIndex: 38,
  },
  {
    title: 'Impact Hub Vicenza (Coworking)',
    description:
      'Part of the global Impact Hub network. Day passes available. Community events. ' +
      'Best coworking option in the city. For more options, Padua (25 min train) has Talent Garden.',
    category: 'activity',
    rating: 4.2,
    priceLevel: 2,
    address: 'Centro Vicenza',
    websiteUrl: 'https://vicenza.impacthub.net',
    orderIndex: 39,
  },
  {
    title: 'Biblioteca Bertoliana',
    description:
      'Historic public library with free wifi and quiet study spaces. A free alternative to coworking. ' +
      'Limited hours — check schedule.',
    category: 'cultural',
    rating: 4.3,
    address: 'Contrà do Rode, 36100 Vicenza',
    orderIndex: 40,
  },
  {
    title: 'Poste Italiane (Post Office)',
    description:
      'Central post office. Mon–Fri 8:20–13:35, Sat 8:20–12:35. For sending postcards or packages.',
    category: 'activity',
    address: 'Contrà Garibaldi, 36100 Vicenza',
    orderIndex: 41,
  },
  {
    title: 'Ospedale San Bortolo (Hospital)',
    description:
      'Main hospital. ~15 min from centro. Emergency: call 112 (general) or 118 (ambulance). ' +
      'For non-emergencies, pharmacies can give basic medical advice.',
    category: 'activity',
    address: 'Viale F. Rodolfi 37, 36100 Vicenza',
    orderIndex: 42,
  },
];

// ── Weather data (monthly) ─────────────────────────────
const weatherMonthly = [
  { month: 1, avgHighC: 5, avgLowC: -1, rainyDays: 6, sunshineHours: 3 },
  { month: 2, avgHighC: 8, avgLowC: 1, rainyDays: 5, sunshineHours: 4 },
  { month: 3, avgHighC: 13, avgLowC: 5, rainyDays: 7, sunshineHours: 5 },
  { month: 4, avgHighC: 18, avgLowC: 9, rainyDays: 9, sunshineHours: 6 },
  { month: 5, avgHighC: 23, avgLowC: 13, rainyDays: 9, sunshineHours: 7.5 },
  { month: 6, avgHighC: 27, avgLowC: 17, rainyDays: 8, sunshineHours: 9 },
  { month: 7, avgHighC: 30, avgLowC: 19, rainyDays: 6, sunshineHours: 10 },
  { month: 8, avgHighC: 29, avgLowC: 19, rainyDays: 7, sunshineHours: 9 },
  { month: 9, avgHighC: 24, avgLowC: 15, rainyDays: 6, sunshineHours: 7 },
  { month: 10, avgHighC: 18, avgLowC: 10, rainyDays: 7, sunshineHours: 5 },
  { month: 11, avgHighC: 11, avgLowC: 5, rainyDays: 7, sunshineHours: 3.5 },
  { month: 12, avgHighC: 6, avgLowC: 0, rainyDays: 6, sunshineHours: 3 },
];

async function seed() {
  console.log('🏠🍝 Seeding Vicenza — Home Base Deep Dive...\n');

  // Clean existing data for this destination
  await db.delete(schema.destinationResearch).where(eq(schema.destinationResearch.destinationId, DEST_ID));
  await db.delete(schema.destinationHighlights).where(eq(schema.destinationHighlights.destinationId, DEST_ID));
  await db.delete(schema.destinationWeatherMonthly).where(eq(schema.destinationWeatherMonthly.destinationId, DEST_ID));
  console.log('  ✓ Cleaned existing Vicenza data');

  // Update destination metadata
  await db.update(schema.tripDestinations).set({
    description:
      'HOME BASE for June 2026. City of Palladio — UNESCO World Heritage Site. ' +
      'Staying at Derek\'s place on Contrà S. Rocco, dead center of the historic core. ' +
      'Compact, walkable, affordable. Fast trains to Venice (45min), Verona (30min), Padua (15min). ' +
      'Famous for baccalà alla vicentina, bigoli, aperitivo culture. ' +
      'Everything within 5–12 min walk: restaurants, cafés, grocery, pharmacy, train station, all attractions.',
    status: 'booked',
    researchStatus: 'fully_researched',
    lastResearchedAt: new Date(),
  }).where(eq(schema.tripDestinations.id, DEST_ID));
  console.log('  ✓ Updated destination metadata');

  // Insert research
  await db.insert(schema.destinationResearch).values({
    destinationId: DEST_ID,
    ...research,
  });
  console.log('  ✓ Research data (overview, costs, transport, culture, 15 travel tips)');

  // Insert highlights
  for (const h of highlights) {
    await db.insert(schema.destinationHighlights).values({
      id: nanoid(),
      destinationId: DEST_ID,
      ...h,
    });
  }
  console.log(`  ✓ ${highlights.length} highlights:`);
  console.log('     11 attractions (Teatro Olimpico, Basilica, Monte Berico, La Rotonda, etc.)');
  console.log('     7 baccalà restaurants (Gambero Rosso picks)');
  console.log('     3 other restaurants (Righetti budget legend, Malvasia, Antico Guelfo)');
  console.log('     4 coffee shops (Sorarù 1904, Declaire, Geco, Garibaldi)');
  console.log('     4 aperitivo bars (Bar Borsa, ai Osei, Piazza delle Erbe, Basilica terrace)');
  console.log('     6 grocery/shopping (PAM, Conad, Eurospar, market, Lidl, Il Ceppo shop)');
  console.log('     8 practical (pharmacy, laundromat, gym, Monte Berico workout, coworking, library, post, hospital)');

  // Insert weather
  for (const w of weatherMonthly) {
    await db.insert(schema.destinationWeatherMonthly).values({
      id: nanoid(),
      destinationId: DEST_ID,
      ...w,
    });
  }
  console.log('  ✓ Monthly weather data (12 months)');

  console.log('\n✅ Vicenza Home Base fully seeded!\n');
  console.log('📋 Summary:');
  console.log('   📍 Location: Contrà S. Rocco — dead center of historic core');
  console.log('   🍝 Cuisine: Baccalà alla vicentina, bigoli, risi e bisi, soppressa');
  console.log('   🏛️ Top sights: Teatro Olimpico, Basilica Palladiana, La Rotonda, Monte Berico');
  console.log('   🚶 Walkability: 100% — car-free centro, everything 5-12 min on foot');
  console.log('   🚂 Transit: Milan–Venice rail line. Venice 45min, Padua 15min, Verona 30min');
  console.log('   💰 Budget: €700–1,200/month (excl. accommodation)');
  console.log('   🍹 Aperitivo: Piazza dei Signori, Piazza delle Erbe — Spritz was born here');
  console.log('   💪 Fitness: McFIT gym + Monte Berico stairs + Parco Querini running');

  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
