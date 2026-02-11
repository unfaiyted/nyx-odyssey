/**
 * Complete Dolomites destination profile
 * Adds: weather, accommodations, more highlights, photo URL, updated description
 * Usage: bun run scripts/seed-dolomites-complete.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../src/db/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh';
const DEST_ID = '_IWLFJZEx-asP-xZ3pQiD'; // Dolomites
const RESEARCH_ID = 'vbbLZti8OwNeYiKu0GpIt';

async function seed() {
  console.log('🏔️  Completing Dolomites full research profile...\n');

  // 1. Update trip_destinations: photo URL and description
  await db.update(schema.tripDestinations)
    .set({
      photoUrl: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=800&q=80',
      description:
        'The Dolomites are a UNESCO World Heritage mountain range in northeastern Italy, famous for their ' +
        'jagged pale limestone peaks, lush alpine meadows, and crystal-clear lakes. Spanning South Tyrol, ' +
        'Trentino, and Belluno, the region offers world-class hiking from gentle meadow walks to challenging ' +
        'via ferratas. Key highlights include the iconic Tre Cime di Lavaredo circuit, the dramatic Seceda ' +
        'ridgeline above Val Gardena, Europe\'s largest alpine meadow at Alpe di Siusi, the emerald Lago di ' +
        'Braies, and the WW1-era Cinque Torri. Mountain rifugios serve hearty South Tyrolean cuisine — ' +
        'canederli, speck, strudel, and local wines. The region blends Italian, Austrian, and Ladin cultures, ' +
        'creating a unique Alpine experience. Best visited June–September for hiking; June/July offers long ' +
        'days, wildflowers, and fewer crowds than August.',
      researchStatus: 'fully_researched',
      lastResearchedAt: new Date(),
    })
    .where(eq(schema.tripDestinations.id, DEST_ID));
  console.log('  ✅ Updated photo URL, description, and research status');

  // 2. Update destination_research with more details
  await db.update(schema.destinationResearch)
    .set({
      population: '~30,000 (scattered across valleys)',
      elevation: '1,000–3,343m (Marmolada summit)',
      nearestAirport: 'Verona (VRN) ~2h, Innsbruck (INN) ~1.5h, Venice (VCE) ~2.5h',
      safetyRating: 5,
      safetyNotes: 'Very safe region. Main risks are mountain weather (sudden thunderstorms, fog) and trail difficulty. Always check weather before hiking. Stick to marked trails. Cell service can be spotty in remote areas.',
      culturalNotes: 'Trilingual region: Italian, German, and Ladin. South Tyrol has a distinct Austrian-influenced culture — architecture, food, and customs differ from mainland Italy. Greetings in German (Grüß Gott) are common. The Ladin people have their own ancient language and traditions. Rifugios are a core cultural institution — communal dining, mountain hospitality.',
      dailyBudgetLow: '80.00',
      dailyBudgetMid: '150.00',
      dailyBudgetHigh: '300.00',
      budgetCurrency: 'EUR',
      costNotes: 'Cable cars/lifts €15-35 per ride. Rifugio meals €10-25. Parking €5-30/day depending on location (Tre Cime toll road €30). Accommodation varies widely: rifugios €40-80/person half-board, hotels €80-200+/night. Fuel for mountain driving adds up.',
      rainyDaysPerMonth: 10,
      transportNotes:
        'FROM VICENZA: ~2-2.5h drive north via A22 (Brenner motorway) to Bolzano, then local roads to specific areas. ' +
        'Bolzano is the main gateway city.\n\n' +
        'DRIVING ROUTES:\n' +
        '• To Alpe di Siusi: A22 to Bolzano Nord → SS12 to Ponte Gardena → Siusi. Cable car from Siusi to Compatsch (plateau is car-free in summer 9am-5pm).\n' +
        '• To Val di Funes/Seceda: A22 to Chiusa exit → Val di Funes road to Santa Maddalena/Ortisei. Cable car from Ortisei to Seceda.\n' +
        '• To Tre Cime: A22 to Bressanone → SS49 to Dobbiaco → toll road to Rifugio Auronzo (€30). OR via Cortina: A27 from Venice area → SS51 to Cortina → Misurina → toll road.\n' +
        '• To Lago di Braies: A22 to Bressanone → Val Pusteria (SS49) to Monguelfo → Braies. Summer shuttle bus available (parking fills by 9am).\n' +
        '• To Cortina/Cinque Torri: A27 from Venice → SS51 to Cortina → Passo Falzarego area.\n\n' +
        'PARKING:\n' +
        '• Tre Cime toll road: €30/car, fills early. Arrive before 8am in peak season.\n' +
        '• Lago di Braies: Limited, €8/day. Shuttle from Monguelfo recommended in July-Aug.\n' +
        '• Alpe di Siusi: Park at valley cable car station (~€12/day). No cars on plateau in summer.\n' +
        '• Seceda: Park in Ortisei (€5-15/day), take cable car up.\n' +
        '• Cinque Torri: Park at Bai de Dones or Passo Falzarego (free-€5).\n\n' +
        'LOCAL TRANSPORT:\n' +
        '• Südtirol/Alto Adige bus network connects major valleys (efficient but infrequent).\n' +
        '• Cable cars and chairlifts are essential infrastructure, not just tourist rides.\n' +
        '• Car is strongly recommended for flexibility between areas.\n' +
        '• Dolomiti Bus serves Cortina area.',
      travelTips: JSON.stringify([
        'Start hikes early (7-8am) — parking fills fast and afternoon thunderstorms are common June-August',
        'Cable cars save 2-3 hours of climbing and are worth €15-35 per ride',
        'Bring layers: temperature drops ~6°C per 1,000m elevation gain',
        'Rain gear is non-negotiable — weather changes in 30 minutes at altitude',
        'Rifugios serve excellent food and local beer — plan lunch stops around them',
        'Book rifugio overnight stays weeks in advance for July-August',
        'Alpe di Siusi plateau is car-free in summer (9am-5pm) — use the cable car from Siusi',
        'Tre Cime toll road is €30 but saves a 2-hour uphill walk',
        'Lago di Braies parking fills by 9am in summer — arrive early or use shuttle from Monguelfo',
        'Download offline maps (maps.me or Komoot) — cell coverage is spotty in valleys',
        'The Dolomites are trilingual: Italian, German, Ladin — signage is in all three',
        'Consider the Mobilcard (€15-33) for unlimited buses and some cable cars in South Tyrol',
        'Multi-day Alta Via routes (1-6) traverse the range for experienced trekkers',
        'Gear essentials: hiking boots (broken in!), trekking poles, sun protection, 2L water, headlamp',
      ]),
      updatedAt: new Date(),
    })
    .where(eq(schema.destinationResearch.id, RESEARCH_ID));
  console.log('  ✅ Updated destination research details');

  // 3. Add more highlights (rifugios, activities, restaurants)
  const newHighlights = [
    // Rifugios
    {
      destinationId: DEST_ID,
      title: 'Rifugio Locatelli (Tre Cime)',
      description: 'Iconic mountain hut at the north face of Tre Cime di Lavaredo. The most photographed rifugio in the Dolomites. Hearty soups, polenta, and strudel with the ultimate mountain backdrop. Overnight stays available (€45-70/person half-board).',
      category: 'food' as const,
      rating: 4.7,
      priceLevel: 2,
      address: 'Tre Cime di Lavaredo, 39030 Sesto',
      duration: '1-2 hours (lunch stop)',
      orderIndex: 10,
    },
    {
      destinationId: DEST_ID,
      title: 'Rifugio Firenze (Regensburger Hütte)',
      description: 'Beautiful mountain hut below the Odle peaks near Seceda. Famous for its Kaiserschmarrn (shredded pancake) and panoramic terrace. Starting point for the Adolf Munkel Trail.',
      category: 'food' as const,
      rating: 4.6,
      priceLevel: 2,
      address: 'Val di Funes, 39040 Funes',
      duration: '1-2 hours',
      orderIndex: 11,
    },
    {
      destinationId: DEST_ID,
      title: 'Rifugio Auronzo',
      description: 'Starting point for the Tre Cime loop, accessible by toll road. Full restaurant with South Tyrolean specialties. Good coffee and pastries for pre-hike fuel.',
      category: 'food' as const,
      rating: 4.0,
      priceLevel: 2,
      address: 'Tre Cime toll road, 32041 Auronzo di Cadore',
      duration: '30 min - 1 hour',
      orderIndex: 12,
    },
    {
      destinationId: DEST_ID,
      title: 'Rifugio Averau',
      description: 'Perched at 2,413m near Cinque Torri with 360° views of Marmolada, Tofane, and Civetta. Outstanding polenta with deer ragù. Worth the extra climb from Cinque Torri.',
      category: 'food' as const,
      rating: 4.5,
      priceLevel: 2,
      address: 'Cinque Torri, 32043 Cortina d\'Ampezzo',
      duration: '1-2 hours',
      orderIndex: 13,
    },
    {
      destinationId: DEST_ID,
      title: 'Malga Glatsch (Alpe di Siusi)',
      description: 'Rustic alpine dairy farm on the Alpe di Siusi plateau. Fresh cheese, speck platters, and homemade butter. Incredible Sassolungo sunset views from the terrace.',
      category: 'food' as const,
      rating: 4.4,
      priceLevel: 1,
      address: 'Alpe di Siusi, 39040 Castelrotto',
      duration: '1 hour',
      orderIndex: 14,
    },
    // Activities
    {
      destinationId: DEST_ID,
      title: 'Tre Cime Loop (Classic Circuit)',
      description: '9.5km circuit around the three iconic peaks. Moderate difficulty, 3-4 hours. Passes Rifugio Lavaredo and Rifugio Locatelli. The quintessential Dolomites hike. Start from Rifugio Auronzo (toll road €30).',
      category: 'activity' as const,
      rating: 4.9,
      priceLevel: 1,
      duration: '3-4 hours',
      orderIndex: 20,
    },
    {
      destinationId: DEST_ID,
      title: 'Adolf Munkel Trail',
      description: 'Gorgeous trail at the base of the Odle/Geisler group. 9km, 3-3.5h, easy-moderate. Forest paths to alpine meadows with constant dramatic peak views. Starts from Rifugio delle Odle (Geisler Hütte) area.',
      category: 'activity' as const,
      rating: 4.8,
      priceLevel: 1,
      duration: '3-3.5 hours',
      orderIndex: 21,
    },
    {
      destinationId: DEST_ID,
      title: 'Lago di Sorapis Hike',
      description: 'Challenging but rewarding hike to a stunning turquoise mountain lake. 12km round trip, 500m elevation gain, ~5-6 hours. Start from Passo Tre Croci near Cortina. Start EARLY — very popular.',
      category: 'activity' as const,
      rating: 4.8,
      priceLevel: 1,
      duration: '5-6 hours',
      orderIndex: 22,
    },
    {
      destinationId: DEST_ID,
      title: 'Val di Funes Photography',
      description: 'The church of Santa Maddalena (St. Magdalena) with the Odle peaks behind it is one of the most iconic images of the Dolomites. Best at sunrise or golden hour. Easy roadside access.',
      category: 'activity' as const,
      rating: 4.7,
      priceLevel: 1,
      duration: '1-2 hours',
      orderIndex: 23,
    },
    {
      destinationId: DEST_ID,
      title: 'Rowing on Lago di Braies',
      description: 'Rent a wooden rowing boat (€15-20/30min) on the emerald-green Pragser Wildsee. Incredibly photogenic with mountain reflections. Arrive before 9am to avoid queues.',
      category: 'activity' as const,
      rating: 4.6,
      priceLevel: 2,
      duration: '30-60 minutes',
      orderIndex: 24,
    },
    {
      destinationId: DEST_ID,
      title: 'Cinque Torri WW1 Open-Air Museum',
      description: 'Free open-air museum among the five rock towers showing reconstructed WW1 trenches, tunnels, and fortifications from the Italian-Austrian front. Fascinating history combined with stunning scenery.',
      category: 'cultural' as const,
      rating: 4.5,
      priceLevel: 1,
      duration: '1-2 hours',
      orderIndex: 25,
    },
    {
      destinationId: DEST_ID,
      title: 'Alta Via 1 (Multi-Day Trek)',
      description: 'The most popular long-distance trail in the Dolomites: ~120km from Lago di Braies to Belluno over 8-13 days. Connects rifugio to rifugio. Spectacular but requires good fitness and booking ahead. Can do sections as day hikes.',
      category: 'activity' as const,
      rating: 4.9,
      priceLevel: 2,
      duration: '8-13 days (full route)',
      orderIndex: 26,
    },
    // Attractions
    {
      destinationId: DEST_ID,
      title: 'Bolzano Old Town & Ötzi Museum',
      description: 'The gateway city to the Dolomites. Visit the South Tyrol Museum of Archaeology housing Ötzi the Iceman (5,300-year-old mummy). Beautiful arcaded streets, fruit markets, and excellent restaurants.',
      category: 'attraction' as const,
      rating: 4.5,
      priceLevel: 2,
      address: 'Via Museo 43, 39100 Bolzano',
      websiteUrl: 'https://www.iceman.it/en/',
      duration: '2-4 hours',
      orderIndex: 30,
    },
    {
      destinationId: DEST_ID,
      title: 'Ortisei Village (Val Gardena)',
      description: 'Charming Ladin village in Val Gardena, famous for wood carving tradition. Great base for Seceda and Alpe di Siusi. Excellent restaurants, gelaterias, and shops. Cable car access to multiple hiking areas.',
      category: 'attraction' as const,
      rating: 4.4,
      priceLevel: 2,
      address: 'Ortisei, 39046 Val Gardena',
      duration: '2-3 hours',
      orderIndex: 31,
    },
    {
      destinationId: DEST_ID,
      title: 'Cortina d\'Ampezzo',
      description: 'The "Queen of the Dolomites" — glamorous mountain town and 2026 Winter Olympics co-host. Upscale shopping, dining, and spectacular mountain setting. Base for Cinque Torri and Lago di Sorapis.',
      category: 'attraction' as const,
      rating: 4.3,
      priceLevel: 3,
      address: 'Cortina d\'Ampezzo, 32043 Belluno',
      duration: '2-4 hours',
      orderIndex: 32,
    },
  ];

  const insertedHighlights = await db.insert(schema.destinationHighlights).values(newHighlights).returning();
  console.log(`  ✅ Added ${insertedHighlights.length} new highlights`);

  // 4. Weather data (monthly for all 12 months, focused detail for June/July)
  const weatherData = [
    { destinationId: DEST_ID, month: 1, avgHighC: 1, avgLowC: -7, rainyDays: 4, sunshineHours: 3.5 },
    { destinationId: DEST_ID, month: 2, avgHighC: 3, avgLowC: -6, rainyDays: 4, sunshineHours: 4.5 },
    { destinationId: DEST_ID, month: 3, avgHighC: 8, avgLowC: -3, rainyDays: 5, sunshineHours: 5.5 },
    { destinationId: DEST_ID, month: 4, avgHighC: 12, avgLowC: 1, rainyDays: 8, sunshineHours: 5.5 },
    { destinationId: DEST_ID, month: 5, avgHighC: 17, avgLowC: 5, rainyDays: 11, sunshineHours: 6.0 },
    { destinationId: DEST_ID, month: 6, avgHighC: 21, avgLowC: 9, rainyDays: 11, sunshineHours: 7.0 },
    { destinationId: DEST_ID, month: 7, avgHighC: 24, avgLowC: 11, rainyDays: 10, sunshineHours: 8.0 },
    { destinationId: DEST_ID, month: 8, avgHighC: 23, avgLowC: 11, rainyDays: 10, sunshineHours: 7.5 },
    { destinationId: DEST_ID, month: 9, avgHighC: 19, avgLowC: 7, rainyDays: 7, sunshineHours: 6.5 },
    { destinationId: DEST_ID, month: 10, avgHighC: 13, avgLowC: 3, rainyDays: 7, sunshineHours: 5.0 },
    { destinationId: DEST_ID, month: 11, avgHighC: 6, avgLowC: -2, rainyDays: 6, sunshineHours: 3.5 },
    { destinationId: DEST_ID, month: 12, avgHighC: 2, avgLowC: -6, rainyDays: 4, sunshineHours: 3.0 },
  ];

  const insertedWeather = await db.insert(schema.destinationWeatherMonthly).values(weatherData).returning();
  console.log(`  ✅ Added ${insertedWeather.length} months of weather data`);

  // 5. Accommodations
  const accommodations = [
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'Hotel Adler Dolomiti Spa & Sport Resort',
      type: 'resort' as const,
      status: 'researched' as const,
      address: 'Via Rezia 7, 39046 Ortisei, Val Gardena',
      costPerNight: '220.00',
      currency: 'EUR',
      bookingUrl: 'https://www.hotel-adler.com/en/',
      rating: 4.6,
      notes: 'Luxury option in Ortisei. 5-star with spa, pools, and excellent restaurant. Perfect base for Seceda and Alpe di Siusi. Half-board available. €180-300/night depending on room and season.',
    },
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'Hotel Cavallino d\'Oro (Castelrotto)',
      type: 'hotel' as const,
      status: 'researched' as const,
      address: 'Piazza Krausen 1, 39040 Castelrotto',
      costPerNight: '130.00',
      currency: 'EUR',
      bookingUrl: 'https://www.cavallino.it/en/',
      rating: 4.4,
      notes: 'Charming 4-star in Castelrotto village, gateway to Alpe di Siusi. Excellent restaurant with local cuisine. Traditional Tyrolean style. Cable car to Alpe di Siusi nearby. €100-170/night.',
    },
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'Hotel Pragser Wildsee (Lago di Braies)',
      type: 'hotel' as const,
      status: 'researched' as const,
      address: 'Lago di Braies, 39030 Braies',
      costPerNight: '180.00',
      currency: 'EUR',
      bookingUrl: 'https://www.lagodibraies.com/en/',
      rating: 4.3,
      notes: 'The only hotel directly on Lago di Braies. Historic building, stunning location. Book months in advance. Solves the parking problem entirely. Half-board recommended. €150-250/night.',
    },
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'Hotel Natürns (Cortina d\'Ampezzo)',
      type: 'hotel' as const,
      status: 'researched' as const,
      address: 'Corso Italia 94, 32043 Cortina d\'Ampezzo',
      costPerNight: '160.00',
      currency: 'EUR',
      bookingUrl: 'https://www.booking.com/searchresults.html?ss=Cortina+d%27Ampezzo',
      rating: 4.2,
      notes: 'Mid-range option in Cortina center. Good base for Cinque Torri and Lago di Sorapis. Cortina has the best restaurant scene in the Dolomites but prices are higher. €120-200/night.',
    },
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'Rifugio Locatelli (Overnight)',
      type: 'hostel' as const,
      status: 'researched' as const,
      address: 'Tre Cime di Lavaredo, 39030 Sesto',
      costPerNight: '60.00',
      currency: 'EUR',
      bookingUrl: 'https://www.dreizinnenhuette.com/',
      rating: 4.5,
      notes: 'Stay overnight at the iconic Tre Cime rifugio. Shared dorms, half-board (dinner + breakfast). €50-70/person. Book weeks in advance for July. The sunset and sunrise at Tre Cime with no crowds is priceless.',
    },
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'Airbnb: Alpine Apartment Ortisei',
      type: 'airbnb' as const,
      status: 'researched' as const,
      address: 'Ortisei, Val Gardena',
      costPerNight: '100.00',
      currency: 'EUR',
      bookingUrl: 'https://www.airbnb.com/s/Ortisei/homes',
      rating: 4.3,
      notes: 'Typical Airbnb apartments in Val Gardena. 1-2 bedrooms with kitchenette and mountain views. €80-150/night. Good for longer stays — cook breakfast, do laundry. Many have balconies with Dolomite views.',
    },
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'Camping Sass Dlacia (Badia)',
      type: 'camping' as const,
      status: 'researched' as const,
      address: 'Str. Plaön 9, 39036 La Villa, Badia',
      costPerNight: '30.00',
      currency: 'EUR',
      bookingUrl: 'https://www.sassdlacia.it/',
      rating: 4.1,
      notes: 'Budget option in Alta Badia valley. Well-equipped campsite with mountain views. Tent pitch €20-35, mobile homes €50-80. Hot showers, restaurant. Central location for multiple Dolomite areas.',
    },
  ];

  for (const acc of accommodations) {
    await db.insert(schema.accommodations).values(acc);
  }
  console.log(`  ✅ Added ${accommodations.length} accommodations`);

  // 6. Update weather notes on the research record
  await db.update(schema.destinationResearch)
    .set({
      weatherNotes:
        'JUNE: Ideal hiking month. Highs 18-23°C in valleys, 8-15°C at altitude. Long days (sunrise ~5:30, sunset ~9:15). ' +
        'Some trails above 2,500m may still have snow patches early June. Wildflowers peak mid-June. ' +
        'Afternoon thunderstorms common (usually 2-5pm) — plan hikes for morning. 11 rainy days average but most are brief afternoon showers.\n\n' +
        'JULY: Warmest month. Highs 21-26°C in valleys, 10-17°C at altitude. All trails and rifugios open. ' +
        'Peak tourist season starts mid-July. Thunderstorms still frequent afternoons. Slightly drier than June. ' +
        'UV is intense at altitude — SPF 50+ essential.\n\n' +
        'GEAR NEEDED: Waterproof hiking boots (broken in!), trekking poles, rain jacket + pants, warm fleece/down layer, ' +
        'sun hat + sunglasses, SPF 50+, 2L water capacity, headlamp, basic first aid. For rifugio overnights: sleeping bag liner, earplugs.',
    })
    .where(eq(schema.destinationResearch.id, RESEARCH_ID));
  console.log('  ✅ Updated detailed weather notes for June/July');

  console.log('\n🏔️  Dolomites research profile COMPLETE!');
  console.log('  📸 Photo: Unsplash Dolomites peaks');
  console.log('  📝 Description: Full overview paragraph');
  console.log('  🎯 Highlights: 6 existing + 15 new (rifugios, hikes, attractions)');
  console.log('  🌤️  Weather: 12 months of data + detailed June/July notes');
  console.log('  🏨 Accommodations: 7 options (resort, hotels, rifugio, airbnb, camping)');
  console.log('  🚗 Transport: Detailed driving routes, parking, local transport from Vicenza');
  console.log('  Status: fully_researched ✅');

  process.exit(0);
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
