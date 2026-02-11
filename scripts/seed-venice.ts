/**
 * Seed Venice — Full Destination Research Profile
 * Populates: description, highlights, weather (already exists), accommodations, transport, photo
 * Usage: bun run scripts/seed-venice.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { nanoid } from 'nanoid';
import * as schema from '../src/db/schema';
import { eq } from 'drizzle-orm';

const CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const sql = postgres(CONNECTION_STRING);
const db = drizzle(sql, { schema });

const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh';
const DEST_ID = 'WrIRgFGe_VlerbL9rbTDj';

async function seed() {
  console.log('🏛️🚤 Seeding Venice — Full Research Profile...\n');

  // ── 1. Update trip_destinations: description + photoUrl ──
  await db.update(schema.tripDestinations)
    .set({
      description:
        'A floating masterpiece of marble palaces, hidden piazzas, and winding canals built on 118 islands ' +
        'in a shallow lagoon. Venice is unlike anywhere else on Earth — no cars, no bicycles, just footsteps ' +
        'and boats gliding through 1,500 years of history. From the Byzantine splendor of St. Mark\'s Basilica ' +
        'to the colorful fishermen\'s houses of Burano, from legendary cicchetti bars to world-class art at the ' +
        'Peggy Guggenheim Collection, Venice rewards those who wander beyond the tourist crush. Just 45-60 min ' +
        'from Vicenza by train, it\'s an essential day trip or overnight — ideally explored early morning or ' +
        'evening when the crowds thin and the city reveals its haunting, magical character.',
      photoUrl: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800',
      status: 'researched',
      researchStatus: 'fully_researched',
    })
    .where(eq(schema.tripDestinations.id, DEST_ID));
  console.log('  ✓ Updated description + photo URL + research status');

  // ── 2. Update destination_research ──
  await db.update(schema.destinationResearch)
    .set({
      elevation: '1m (sea level, regularly floods in acqua alta season)',
      weatherNotes:
        'Hot and humid summers. June avg 25°C, July 28°C. Afternoon thunderstorms possible but brief. ' +
        'Acqua alta (high water) mainly Nov-Feb, not a summer concern. Humidity can be intense in July-Aug. ' +
        'Best to explore early morning (before 9am) and evening — midday heat + crowds peak together.',
      costNotes:
        'Venice is expensive by Italian standards. Espresso at the bar €1.50-2. Sit-down coffee at Piazza San Marco €6-15 ' +
        '(with live orchestra surcharge!). Cicchetti €1.50-3 each. Budget lunch €15-20 standing at a bacaro. ' +
        'Restaurant dinner €35-60/person. Vaporetto 24hr pass €25. Gondola ride €80 (daytime, 30min). ' +
        'Museum Pass (Musei Civici) €35 covers Doge\'s Palace + 10 museums. Chorus Pass €12 for 16 churches.',
      safetyNotes:
        'Very safe — virtually no violent crime. Main concerns: pickpockets on crowded vaporetti and around ' +
        'San Marco/Rialto. Watch bags on water buses. Scam alert: unofficial gondoliers, overpriced restaurants ' +
        'near San Marco with no prices on menus. Flooding (acqua alta) rare in summer. Navigation can be ' +
        'confusing — download offline maps, follow yellow signs to major landmarks.',
      culturalNotes:
        'Venice was a maritime republic for over 1,000 years (697-1797), once the richest city in Europe and ' +
        'a bridge between East and West. This shows in the Byzantine-Gothic-Renaissance architectural fusion. ' +
        'The city is divided into 6 sestieri (districts): San Marco (tourist center), Dorsoduro (art/university), ' +
        'Cannaregio (residential, Jewish Ghetto), Castello (east, Arsenale), San Polo (Rialto, markets), ' +
        'Santa Croce (transport hub). Each has distinct character. The Venice Biennale (art/architecture, ' +
        'odd/even years) is the world\'s most prestigious art exhibition. Venetian dialect (Veneto) differs ' +
        'significantly from standard Italian. Glass-making on Murano dates to 1291. Carnival (Feb) is legendary.',
      summary:
        'Venice is the crown jewel of Veneto and a must-visit from Vicenza (45-60min by train). ' +
        'VERDICT: At minimum a full day trip, ideally an overnight to experience the magic of Venice ' +
        'after the day-trippers leave. The city transforms after 6pm — quiet canals, golden light, ' +
        'locals reclaiming their piazzas. Key strategy: arrive early or stay late, skip the San Marco ' +
        'tourist trap restaurants, eat cicchetti at local bacari, and get lost in Dorsoduro and Cannaregio. ' +
        'Budget €80-170/day depending on dining choices. The vaporetto 24hr pass is essential.',
      travelTips: JSON.stringify([
        'Arrive by train to Santa Lucia station — it\'s right on the Grand Canal. Walk out and the view is instant magic.',
        'Get a 24hr or 48hr vaporetto pass (€25/€35) — individual rides are €9.50 each, so the pass pays for itself in 3 rides.',
        'Eat cicchetti (Venetian tapas) at bacari — stand at the bar for the best prices. Cantina Do Spade, All\'Arco, and Cantina Do Mori are legendary.',
        'Avoid ANY restaurant within 50m of San Marco or Rialto Bridge that doesn\'t show prices. Tourist trap guaranteed.',
        'Visit Murano (glass) and Burano (lace, colorful houses) via vaporetto — but go to Burano first (further away, less crowded in morning).',
        'The Dorsoduro sestiere is the best area: Peggy Guggenheim, Accademia Gallery, Zattere waterfront, and fewer tourists.',
        'Venice at dawn (6-8am) is transcendent — empty streets, misty canals, the city as locals know it.',
        'Download offline Google Maps — Venice\'s alleys make phone GPS essential. Follow yellow directional signs between major landmarks.',
        'For gondolas: €80/boat for 30min (up to 6 people). Negotiate before boarding. The traghetto (gondola ferry) crosses the Grand Canal for €2 — same boat, fraction of the cost.',
        'Free water fountains throughout the city — look for green drinking fountains to refill bottles.',
      ]),
      transportNotes:
        'From Vicenza: Train is best — Regionale 45-60min (€5-9), Frecce 30min (€10-20). Trains run every 20-30min. ' +
        'Arrive at Venezia Santa Lucia (island) NOT Mestre (mainland). By car: 75km, ~1hr, but parking is ' +
        'extremely expensive — Piazzale Roma garage €26-32/day, Tronchetto €22/day. Park in Mestre (€5-8/day) ' +
        'and take the train/tram to Venice. WITHIN Venice: Vaporetto (water bus) Lines 1 (slow, all stops along ' +
        'Grand Canal — scenic) and 2 (express). Line 12 to Murano/Burano/Torcello. Water taxis €70-120 (luxury only). ' +
        'Walking is primary — Venice is only 2km wide. Vaporetto from airport: Alilaguna €15.',
    })
    .where(eq(schema.destinationResearch.destinationId, DEST_ID));
  console.log('  ✓ Updated research data (weather, costs, safety, culture, transport, tips)');

  // ── 3. Add more highlights ──
  const newHighlights: Array<{
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
    // Attractions
    {
      title: 'Doge\'s Palace (Palazzo Ducale)',
      description:
        'The seat of Venetian power for 700 years — a Gothic masterpiece on Piazza San Marco. ' +
        'Extraordinary halls with Tintoretto\'s Paradise (world\'s largest oil painting), the Bridge of Sighs, ' +
        'and the atmospheric prison cells. The "Secret Itineraries" tour (€28) reveals hidden rooms and ' +
        'Casanova\'s escape route. Standard entry €30 (includes Correr Museum).',
      category: 'attraction',
      rating: 4.8,
      priceLevel: 3,
      address: 'Piazza San Marco 1, 30124 Venice',
      websiteUrl: 'https://palazzoducale.visitmuve.it',
      duration: '2-3 hours',
      orderIndex: 3,
    },
    {
      title: 'Peggy Guggenheim Collection',
      description:
        'World-class modern art museum in Peggy Guggenheim\'s former palazzo on the Grand Canal. ' +
        'Picasso, Pollock, Dalí, Ernst, Magritte, Kandinsky — an intimate, curated collection far less ' +
        'overwhelming than major museums. The sculpture garden and canal terrace are highlights. €16 entry.',
      category: 'attraction',
      rating: 4.7,
      priceLevel: 2,
      address: 'Dorsoduro 701, 30123 Venice',
      websiteUrl: 'https://www.guggenheim-venice.it',
      duration: '1.5-2 hours',
      orderIndex: 4,
    },
    {
      title: 'Murano Island',
      description:
        'The island of glass-making since 1291, when Venice relocated its furnaces here to prevent fires. ' +
        'Watch master glassblowers create intricate works in free demonstrations. Visit the Glass Museum (€10). ' +
        'Buy directly from workshops (not tourist stalls). Vaporetto Line 4.1/4.2 from Fondamente Nove, 10min.',
      category: 'attraction',
      rating: 4.4,
      priceLevel: 2,
      address: 'Murano, Venice',
      duration: '2-3 hours',
      orderIndex: 5,
    },
    {
      title: 'Gallerie dell\'Accademia',
      description:
        'Venice\'s premier art museum — Venetian painting from the 14th-18th century. ' +
        'Bellini, Titian, Tintoretto, Veronese, Canaletto. Highlights include Veronese\'s ' +
        'massive Feast in the House of Levi and Giorgione\'s enigmatic Tempest. €12 entry.',
      category: 'attraction',
      rating: 4.6,
      priceLevel: 2,
      address: 'Campo della Carità, Dorsoduro 1050, 30123 Venice',
      duration: '2 hours',
      orderIndex: 6,
    },
    {
      title: 'Grand Canal by Vaporetto Line 1',
      description:
        'The most beautiful "bus ride" in the world. Vaporetto Line 1 travels the entire 3.8km S-shaped ' +
        'Grand Canal, passing over 170 palaces, the Rialto Bridge, Ca\' d\'Oro, and Santa Maria della Salute. ' +
        'Sit outside at the front or back. Best at sunset. Included in your vaporetto pass.',
      category: 'activity',
      rating: 4.9,
      priceLevel: 1,
      address: 'Grand Canal, Venice',
      duration: '45 min',
      orderIndex: 7,
    },
    {
      title: 'Basilica di Santa Maria della Salute',
      description:
        'Baroque masterpiece at the entrance to the Grand Canal, built as thanks after the 1630 plague. ' +
        'Iconic octagonal dome visible from everywhere in Venice. Free entry to the main church; ' +
        'sacristy with Titian paintings €4.',
      category: 'attraction',
      rating: 4.5,
      address: 'Dorsoduro 1, 30123 Venice',
      duration: '30 min',
      orderIndex: 8,
    },
    // Cicchetti Bars / Restaurants
    {
      title: 'Cantina Do Mori',
      description:
        'Venice\'s oldest bacaro (wine bar), operating since 1462. Tiny, atmospheric, packed with locals. ' +
        'Copper pots hanging from the ceiling. Stand at the bar and point at cicchetti — try baccalà mantecato ' +
        '(creamed cod), sarde in saor (sweet-sour sardines), and polpette (meatballs). ' +
        'Pair with an ombra (small glass of wine, €2-3). Cicchetti €1.50-3 each.',
      category: 'food',
      rating: 4.7,
      priceLevel: 1,
      address: 'Calle dei Do Mori, San Polo 429, 30125 Venice',
      duration: '30-45 min',
      orderIndex: 9,
    },
    {
      title: 'All\'Arco',
      description:
        'Legendary cicchetti bar near Rialto Market — tiny, standing room only, always packed at lunch. ' +
        'The father-son team creates daily cicchetti using fresh ingredients from the market next door. ' +
        'Try the crostini with seasonal toppings. Open morning till early afternoon only. €10-15 for a full meal of cicchetti + wine.',
      category: 'food',
      rating: 4.8,
      priceLevel: 1,
      address: 'Calle de l\'Ochialer, San Polo 436, 30125 Venice',
      duration: '20-30 min',
      orderIndex: 10,
    },
    {
      title: 'Cantina Do Spade',
      description:
        'Another historic bacaro (since 1488!) near Rialto. Bigger than Do Mori with a few tables. ' +
        'Excellent cicchetti and Venetian small plates. The fritto misto and baccalà are standouts. ' +
        'Casanova reportedly frequented this place. Good wine selection.',
      category: 'food',
      rating: 4.6,
      priceLevel: 1,
      address: 'Calle delle Do Spade, San Polo 860, 30125 Venice',
      duration: '30-45 min',
      orderIndex: 11,
    },
    {
      title: 'Trattoria alla Madonna',
      description:
        'Classic Venetian seafood restaurant near Rialto, operating since 1954. Old-school service, ' +
        'white tablecloths, no-frills decor. Famous for fritto misto, spaghetti alle vongole, and grilled ' +
        'fish. A reliable, mid-range option that hasn\'t sold out to tourism. €30-45/person. Reservations recommended.',
      category: 'food',
      rating: 4.5,
      priceLevel: 2,
      address: 'Calle de la Madonna, San Polo 594, 30125 Venice',
      duration: '1-1.5 hours',
      orderIndex: 12,
    },
    {
      title: 'Osteria Bancogiro',
      description:
        'Stylish bacaro/restaurant overlooking the Grand Canal at Rialto. The outdoor terrace has one of ' +
        'Venice\'s best views for aperitivo. Creative cicchetti and full Venetian menu. Great Spritz + sunset combo. ' +
        'Cicchetti at the bar €2-4, restaurant mains €18-28.',
      category: 'food',
      rating: 4.5,
      priceLevel: 2,
      address: 'Campo San Giacometto, San Polo 122, 30125 Venice',
      websiteUrl: 'https://www.osteriabancogiro.it',
      duration: '45-90 min',
      orderIndex: 13,
    },
    {
      title: 'Anice Stellato',
      description:
        'Excellent trattoria in Cannaregio, away from tourist crowds. Creative Venetian seafood — ' +
        'try the spider crab, moleche (soft-shell crab when in season), or bigoli in salsa (pasta with onion-anchovy). ' +
        'Popular with locals. €30-40/person. Reserve ahead.',
      category: 'food',
      rating: 4.6,
      priceLevel: 2,
      address: 'Fondamenta de la Sensa, Cannaregio 3272, 30121 Venice',
      duration: '1.5 hours',
      orderIndex: 14,
    },
    // Activities / Hidden Gems
    {
      title: 'Cicchetti Crawl (DIY Bacaro Tour)',
      description:
        'The quintessential Venice food experience: hop between 4-5 bacari in San Polo/Rialto area, ' +
        'having 2-3 cicchetti and an ombra (wine) at each. Route: All\'Arco → Cantina Do Mori → Do Spade → ' +
        'Bancogiro. Total cost: €20-30 for a full evening of eating/drinking. Best 6-8pm.',
      category: 'activity',
      rating: 4.9,
      priceLevel: 1,
      duration: '2-3 hours',
      orderIndex: 15,
    },
    {
      title: 'Libreria Acqua Alta',
      description:
        'The "most beautiful bookshop in the world" — books are stored in gondolas, bathtubs, and canoes ' +
        'to protect from flooding. A staircase of books leads to a canal view. Cats roam freely. ' +
        'Quirky, photogenic, and genuinely charming. Free entry.',
      category: 'attraction',
      rating: 4.5,
      address: 'Calle Lunga Santa Maria Formosa, Castello 5176b, 30122 Venice',
      duration: '20-30 min',
      orderIndex: 16,
    },
    {
      title: 'San Giorgio Maggiore Bell Tower',
      description:
        'Take vaporetto Line 2 to San Giorgio island for the BEST panoramic view of Venice — ' +
        'looking back at the full San Marco skyline across the water. The Palladian church is free; ' +
        'bell tower elevator €8. Far fewer crowds than the San Marco Campanile. Phenomenal at sunset.',
      category: 'attraction',
      rating: 4.7,
      priceLevel: 1,
      address: 'Isola di San Giorgio Maggiore, 30124 Venice',
      duration: '45-60 min',
      orderIndex: 17,
    },
    {
      title: 'Jewish Ghetto (Cannaregio)',
      description:
        'The world\'s first ghetto (the word itself comes from Venice, 1516). A powerful historical site ' +
        'with 5 synagogues, a museum, and a solemn memorial. The tallest buildings in Venice are here — ' +
        'confined to a small area, residents built upward. Guided tours of the synagogues available. Museum €10.',
      category: 'cultural',
      rating: 4.4,
      priceLevel: 1,
      address: 'Campo del Ghetto Nuovo, Cannaregio, 30121 Venice',
      duration: '1-1.5 hours',
      orderIndex: 18,
    },
    {
      title: 'Zattere Waterfront Walk',
      description:
        'The long south-facing promenade in Dorsoduro with views across the Giudecca canal. ' +
        'Locals\' favorite passeggiata. Stop at Nico\'s for a gianduiotto (chocolate-hazelnut ice cream ' +
        'pressed into whipped cream) — a Venetian institution since 1935. Best in late afternoon sun.',
      category: 'activity',
      rating: 4.6,
      address: 'Fondamenta Zattere, Dorsoduro, 30123 Venice',
      duration: '30-60 min',
      orderIndex: 19,
    },
  ];

  for (const h of newHighlights) {
    await db.insert(schema.destinationHighlights).values({
      id: nanoid(),
      destinationId: DEST_ID,
      ...h,
    });
  }
  console.log(`  ✓ ${newHighlights.length} new highlights added (attractions, cicchetti bars, restaurants, activities)`);

  // ── 4. Add accommodations ──
  const accommodations = [
    {
      name: 'Generator Venice (Hostel/Budget Hotel)',
      type: 'hostel',
      address: 'Fondamenta Zitelle 86, Giudecca, 30133 Venice',
      costPerNight: '45.00',
      currency: 'EUR',
      rating: 4.2,
      notes:
        'Located on Giudecca island — quieter than the main island with stunning San Marco views from the terrace. ' +
        'Private rooms available (€80-120). Vaporetto Line 2 to San Marco in 5min. ' +
        'Best budget option that doesn\'t sacrifice location quality.',
      bookingUrl: 'https://www.generatorhostels.com/venice',
      status: 'researched',
    },
    {
      name: 'Hotel Al Ponte Antico',
      type: 'hotel',
      address: 'Calle dell\'Aseo, Cannaregio 5768, 30131 Venice',
      costPerNight: '220.00',
      currency: 'EUR',
      rating: 4.8,
      notes:
        'Boutique hotel in a 16th-century palazzo right on the Grand Canal near Rialto Bridge. ' +
        'Terrace overlooking the Grand Canal. Venetian-style rooms with period furniture. ' +
        'Excellent location in Cannaregio — close to everything but on a quiet street.',
      bookingUrl: 'https://www.alponteantico.com',
      status: 'researched',
    },
    {
      name: 'Ca\' Pisani Hotel',
      type: 'hotel',
      address: 'Dorsoduro 979A, 30123 Venice',
      costPerNight: '180.00',
      currency: 'EUR',
      rating: 4.6,
      notes:
        'Art Deco boutique hotel in Dorsoduro, near Accademia and Guggenheim. Design-forward with ' +
        'original 1930s-40s furniture. Rooftop terrace. One of the few hotels in Venice with genuine character ' +
        'rather than generic "Venetian" decor. Dorsoduro is the best sestiere to stay in.',
      bookingUrl: 'https://www.capisanihotel.it',
      status: 'researched',
    },
    {
      name: 'Airbnb — Cannaregio apartment',
      type: 'airbnb',
      address: 'Cannaregio district, Venice',
      costPerNight: '120.00',
      currency: 'EUR',
      rating: 4.5,
      notes:
        'Cannaregio is the best area for Airbnb: residential, authentic, good restaurants, walkable to Rialto/San Marco. ' +
        'Avoid anything near the train station (noisy) or San Marco (overpriced). ' +
        'Look for apartments with washer and kitchen — saves money on laundry and breakfast. ' +
        'Average 1BR apartment €100-150/night in summer.',
      status: 'researched',
    },
    {
      name: 'Hotel Nani Mocenigo Palace',
      type: 'hotel',
      address: 'Dorsoduro 960, 30123 Venice',
      costPerNight: '150.00',
      currency: 'EUR',
      rating: 4.4,
      notes:
        'Good mid-range option in Dorsoduro. Clean, well-located, helpful staff. ' +
        'Walking distance to Accademia, Guggenheim, and Zattere waterfront. ' +
        'No canal view but quiet street. Breakfast included.',
      status: 'researched',
    },
  ];

  for (const a of accommodations) {
    await db.insert(schema.accommodations).values({
      id: nanoid(),
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: a.name,
      type: a.type,
      address: a.address,
      costPerNight: a.costPerNight,
      currency: a.currency,
      rating: a.rating,
      notes: a.notes,
      bookingUrl: a.bookingUrl || null,
      status: a.status,
      booked: false,
    });
  }
  console.log(`  ✓ ${accommodations.length} accommodations added`);

  console.log('\n✅ Venice fully researched!\n');
  console.log('📋 Summary:');
  console.log('   Train from Vicenza: 45-60min Regionale (€5-9), 30min Frecce (€10-20)');
  console.log('   Budget: €80-170/day depending on choices');
  console.log('   Must-do: Cicchetti crawl, Vaporetto Line 1, St. Mark\'s, Burano');
  console.log('   Stay in: Dorsoduro or Cannaregio (avoid San Marco area hotels)');
  console.log('   Pro tip: Arrive early or stay late — Venice transforms after 6pm');

  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
