/**
 * Seed script: Lake Garda — Sirmione — Full Destination Research Profile
 *
 * Populates all 6 sections for Sirmione:
 * 1. Description & photo (trip_destinations)
 * 2. Research overview (destination_research)
 * 3. Highlights — restaurants, attractions, activities (destination_highlights)
 * 4. Weather — monthly data (destination_weather_monthly)
 * 5. Accommodations (accommodations)
 * 6. Transport notes (destination_research.transport_notes)
 *
 * Usage: bun scripts/seed-sirmione-complete.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../src/db/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

const DEST_ID = 'YAghQGsEjK_Evddas57AS';
const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh';

async function seed() {
  console.log('🏰 Seeding Lake Garda — Sirmione — Full Destination Research Profile...\n');

  // ── 1. Update trip_destinations: description + photo ──────────
  await db
    .update(schema.tripDestinations)
    .set({
      description:
        "The 'Pearl of Lake Garda' — a stunning medieval town on a narrow peninsula jutting into Italy's largest lake. Famous for its 13th-century Scaliger Castle rising from the water, ancient Roman ruins (Grottoes of Catullus), thermal spas with natural hot springs, and Jamaica Beach's crystal-clear Caribbean-like waters. A perfect summer day trip combining history, relaxation, and swimming.",
      photoUrl:
        'https://images.unsplash.com/photo-1567514603419-7955a1e0801a?w=800&h=500&fit=crop',
      researchStatus: 'fully_researched',
    })
    .where(eq(schema.tripDestinations.id, DEST_ID));
  console.log('  ✅ trip_destinations updated (description, photo, status)');

  // ── 2. Update destination_research ────────────────────────────
  const existing = await db.select().from(schema.destinationResearch)
    .where(eq(schema.destinationResearch.destinationId, DEST_ID));

  const transportNotes = `**FROM VICENZA:**

🚗 **Drive (RECOMMENDED for flexibility)**
- Distance: 90 km (56 miles)
- Time: ~1 hour 4 minutes
- Route: A4/E70 motorway toward Milan, exit at Desenzano del Garda
- Tolls: ~€6-8 each way
- Parking: Sirmione has limited parking — use the pay lots at the entrance to the peninsula (€2-3/hour). The historic center is car-free.
- ZTL Warning: Do NOT drive into the old town — heavy fines. Park at the peninsula entrance and walk.

🚂 **Train + Bus**
- Vicenza → Desenzano del Garda-Sirmione station: ~1 hour (Regionale train, €6-8)
- From station: Bus LN026 or ferry to Sirmione (15-20 min, €2-3)
- Alternative: Taxi from station (~€20-25)
- Note: The station is in Desenzano, not Sirmione itself — you'll need additional transport

**LOCAL TRANSPORT:**
- Sirmione's historic center is entirely walkable (the peninsula is only 3km long)
- Ferries connect to other Lake Garda towns (Desenzano, Peschiera, Lazise)
- Tourist train (trenino) circles the town for those who prefer not to walk
- Boats for hire to explore the lake

**GETTING AROUND LAKE GARDA:**
- Ferry network connects all major towns — day passes available
- Car recommended for visiting multiple towns in one day
- Bike rentals available for the flat lakeside paths`;

  const travelTips = JSON.stringify([
    "Arrive early (before 10am) or late afternoon to avoid day-tripper crowds",
    "Scaliger Castle opens at 9:30am — be first for photos without crowds",
    "Bring swimwear! Jamaica Beach has Caribbean-clear water perfect for swimming",
    "Grottoes of Catullus (Roman ruins) — go late afternoon for golden hour views",
    "Book thermal spa (Aquaria Terme) in advance, especially weekends",
    "Lunch at a lakeside restaurant — expect €15-25 for pasta, €25-35 for fish",
    "Try Lugana DOC — the local white wine, crisp and refreshing",
    "Walk the full peninsula — it's only 3km end to end but packed with sights",
    "Sunset aperitivo at a waterfront bar is magical",
    "Combine with Verona on the return trip — they're on the same route",
    "Castle entry: €6 | Grottoes: €8 | Combined tickets available",
    "Parking fills up by 11am on weekends — arrive early or park in Desenzano and ferry over",
    "The 'Jamaica Beach' area gets crowded — stake your spot by 11am for prime swimming",
    "Thermal spas are open late (until 10pm some nights) — perfect for evening relaxation",
    "June-July: Water temperature perfect for swimming, long days (sunset ~9pm)"
  ]);

  const summary = `Sirmione — "The Pearl of Lake Garda" — is a fairy-tale town on a narrow peninsula jutting 3 kilometers into Italy's largest lake. It's the perfect summer day trip from Vicenza, combining medieval charm, ancient Roman history, thermal spa relaxation, and crystal-clear swimming.

**The Castle:** The 13th-century Scaliger Castle rises dramatically from the water, one of Italy's most photographed fortresses. Cross the drawbridge, climb the tower, and explore the restored rooms with panoramic lake views.

**Roman Ruins:** The Grottoes of Catullus aren't actually grottoes — they're the remains of a massive Roman villa built by the family of the poet Catullus in the 1st century BC. The olive grove setting with lake views is spectacular.

**Thermal Spas:** Natural hot springs have drawn visitors since Roman times. Aquaria Terme offers modern spa facilities with thermal pools overlooking the lake — pure relaxation with a view.

**Jamaica Beach:** The peninsula's tip features this stunning beach with Caribbean-clear waters, flat rocks perfect for sunbathing, and views of the castle from the water.

**The Vibe:** Sirmione strikes that perfect balance of "touristy but worth it." Yes, it gets crowded (arrive early!), but the setting is genuinely magical — the castle, the cobblestone lanes, the lake views, the gelato by the water. It's a summer classic for good reason.`;

  if (existing.length > 0) {
    await db.update(schema.destinationResearch)
      .set({
        country: 'Italy',
        region: 'Lombardy (Lake Garda)',
        timezone: 'CET (UTC+1)',
        language: 'Italian',
        currency: 'EUR (€)',
        population: '8,230',
        elevation: '68m (223 ft)',
        bestTimeToVisit: 'May-September (swimming season), June-July for long days',
        avgTempHighC: 28,
        avgTempLowC: 16,
        rainyDaysPerMonth: 6,
        weatherNotes: 'Mediterranean climate with hot summers (25-32°C in July). Lake breezes keep it pleasant. June-July is ideal — warm water for swimming, minimal rain, sunsets around 9pm. Occasional afternoon thunderstorms but usually clear by evening.',
        dailyBudgetLow: '45',
        dailyBudgetMid: '90',
        dailyBudgetHigh: '180',
        budgetCurrency: 'USD',
        costNotes: 'Sirmione is pricier than inland towns due to its tourist status. Day trip from Vicenza: €20-40/person (transport + attractions). Lunch €15-30, dinner €25-50. Castle €6, Grottoes €8. Thermal spa €35-55 for day pass. Parking €2-3/hour. Budget tip: bring picnic lunch and swim for free at Jamaica Beach.',
        transportNotes,
        nearestAirport: 'VRN (Verona, 35 min) or BGY (Bergamo, 1 hr)',
        driveTimeMinutes: 64,
        driveDistanceKm: 90,
        driveCostEuros: '20',
        driveRouteNotes: 'A4/E70 motorway toward Milan, exit Desenzano del Garda. Tolls ~€6-8. Scenic alternative: SS11 through Peschiera del Garda (slower but pretty). Parking at peninsula entrance — DO NOT enter ZTL zone.',
        trainTimeMinutes: 90,
        trainCostEuros: '12',
        trainRouteNotes: 'Vicenza → Desenzano station (1hr, €6-8), then bus LN026 or taxi (15-20 min, €2-25). Not as convenient as driving.',
        safetyRating: 5,
        safetyNotes: 'Very safe. Standard tourist awareness for belongings in crowded areas. Swimming at Jamaica Beach is safe — clear water, gradual depth. Evening walks along the lake are peaceful and secure.',
        culturalNotes: 'Sirmione has been a resort since Roman times — the poet Catullus had a villa here (c. 84-54 BC). The thermal springs have attracted visitors for 2,000 years. Maria Callas owned a villa here in the 1950s. Local cuisine features lake fish (coregone, sardines), Lugana DOC white wine, olive oil from Garda hills, and limoncello.',
        summary,
        travelTips,
        updatedAt: new Date(),
      })
      .where(eq(schema.destinationResearch.destinationId, DEST_ID));
    console.log('  ✅ destination_research updated');
  } else {
    await db.insert(schema.destinationResearch).values({
      destinationId: DEST_ID,
      country: 'Italy',
      region: 'Lombardy (Lake Garda)',
      timezone: 'CET (UTC+1)',
      language: 'Italian',
      currency: 'EUR (€)',
      population: '8,230',
      elevation: '68m (223 ft)',
      bestTimeToVisit: 'May-September (swimming season), June-July for long days',
      avgTempHighC: 28,
      avgTempLowC: 16,
      rainyDaysPerMonth: 6,
      weatherNotes: 'Mediterranean climate with hot summers (25-32°C in July). Lake breezes keep it pleasant. June-July is ideal — warm water for swimming, minimal rain, sunsets around 9pm.',
      dailyBudgetLow: '45',
      dailyBudgetMid: '90',
      dailyBudgetHigh: '180',
      budgetCurrency: 'USD',
      costNotes: 'Sirmione is pricier due to tourist status. Day trip: €20-40/person. Lunch €15-30, dinner €25-50. Castle €6, Grottoes €8. Spa €35-55.',
      transportNotes,
      nearestAirport: 'VRN (Verona, 35 min)',
      driveTimeMinutes: 64,
      driveDistanceKm: 90,
      driveCostEuros: '20',
      driveRouteNotes: 'A4/E70 motorway toward Milan, exit Desenzano del Garda. Tolls ~€6-8.',
      trainTimeMinutes: 90,
      trainCostEuros: '12',
      trainRouteNotes: 'Vicenza → Desenzano (1hr), then bus/taxi to Sirmione.',
      safetyRating: 5,
      safetyNotes: 'Very safe tourist destination.',
      culturalNotes: 'Roman resort town since 1st century BC. Catullus had a villa here. Maria Callas owned a villa in the 1950s.',
      summary,
      travelTips,
    });
    console.log('  ✅ destination_research created');
  }

  // ── 3. Delete existing highlights and re-seed ────────────────
  await db
    .delete(schema.destinationHighlights)
    .where(eq(schema.destinationHighlights.destinationId, DEST_ID));

  const highlights = [
    {
      title: 'Castello Scaligero (Scaliger Castle)',
      description:
        'The iconic 13th-century fortress rising from the lake waters. Built by the Scaliger family (Lords of Verona), this rare example of a medieval port fortification features crenellated walls, a drawbridge, and a tower with panoramic views. The castle controlled the entrance to the peninsula and was connected to the Scaliger fleet. Entry €6.',
      category: 'attraction',
      rating: 4.7,
      priceLevel: 1,
      duration: '1-1.5 hours',
      address: 'Piazza Castello, 25019 Sirmione BS',
      imageUrl:
        'https://images.unsplash.com/photo-1567514603419-7955a1e0801a?w=600&h=400&fit=crop',
    },
    {
      title: 'Grotte di Catullo (Grottoes of Catullus)',
      description:
        "The ruins of a massive Roman villa built by the family of poet Gaius Valerius Catullus (1st century BC). Not actually grottoes — it's the largest Roman villa discovered in northern Italy (167x105 meters). Walk among the stone arches, olive groves, and enjoy stunning lake views. The museum displays artifacts found on site. Entry €8.",
      category: 'cultural',
      rating: 4.6,
      priceLevel: 1,
      duration: '1-1.5 hours',
      address: 'Via Grotte di Catullo, 25019 Sirmione BS',
      imageUrl:
        'https://images.unsplash.com/photo-1527336468844-5732be71b394?w=600&h=400&fit=crop',
    },
    {
      title: 'Jamaica Beach (Spiaggia Giamaica)',
      description:
        "The jewel of Sirmione — a stunning beach at the tip of the peninsula with crystal-clear turquoise waters that look Caribbean. Flat limestone rocks perfect for sunbathing, easy swimming access, and views back to the castle. Gets crowded by midday — arrive early! Free access, bring your own towel and water shoes (rocks can be sharp).",
      category: 'nature',
      rating: 4.8,
      priceLevel: 1,
      duration: '2-4 hours',
      address: 'Punta del Castello, Sirmione',
      imageUrl:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
    },
    {
      title: 'Aquaria Terme di Sirmione',
      description:
        "Modern thermal spa complex utilizing the area's natural hot springs (discovered by the Romans 2,000 years ago). Features thermal pools, saunas, steam rooms, and treatments with views of the lake. The sulfurous water is said to have therapeutic properties. Entry €35-55 for day pass. Book ahead in summer.",
      category: 'activity',
      rating: 4.5,
      priceLevel: 3,
      duration: 'Half day',
      address: 'Via Don Gnocchi, 7, 25019 Sirmione BS',
      websiteUrl: 'https://www.aquariaterme.it',
    },
    {
      title: 'Terme di Sirmione (Catullo Spa)',
      description:
        'The other major thermal spa in town, specializing in thermal water treatments, mud therapy, and wellness programs. More clinical/medical focus than Aquaria. Located in a historic building. Day passes available but treatments should be booked in advance.',
      category: 'activity',
      rating: 4.4,
      priceLevel: 3,
      duration: 'Half day',
      address: 'Piazza Virgilio, 1, 25019 Sirmione BS',
      websiteUrl: 'https://www.termesirmione.it',
    },
    {
      title: 'Chiesa di San Pietro in Mavino',
      description:
        'Secluded medieval church on a hill above the town, dating to the 8th century (Lombard period) with 14th-century renovations. Features rare frescoes from the 12th-16th centuries and a Romanesque bell tower from 1070. Peaceful retreat away from the crowds. Free entry.',
      category: 'cultural',
      rating: 4.3,
      priceLevel: 1,
      duration: '30 min',
    },
    {
      title: 'Villa Maria Callas',
      description:
        'The former lakeside villa of opera legend Maria Callas, who lived here in the 1950s. Not open for interior tours but visible from the water and lakeside path. A plaque commemorates her time here. A pilgrimage site for opera fans.',
      category: 'attraction',
      rating: 4.2,
      priceLevel: 1,
      duration: '15 min',
    },
    {
      title: 'Centro Storico (Historic Center)',
      description:
        'The charming maze of cobblestone lanes, colorful houses, gelato shops, and boutiques that make up Sirmione\'s old town. Cars are banned — explore on foot. Main street Via Vittorio Emanuele leads from the castle to the Grottoes. Piazza Carducci is the main square. Perfect for a leisurely stroll with gelato.',
      category: 'attraction',
      rating: 4.5,
      priceLevel: 1,
      duration: '1-2 hours',
    },
    {
      title: 'Ristorante La Rucola',
      description:
        'Elegant lakeside restaurant with terrace seating and views of the castle. Specializes in fresh lake fish (coregone, sardines) and homemade pasta. Romantic atmosphere perfect for dinner. Mains €20-35. Reservations recommended.',
      category: 'food',
      rating: 4.6,
      priceLevel: 3,
      duration: 'Lunch/Dinner',
      address: 'Via Vittorio Emanuele, 23, 25019 Sirmione BS',
    },
    {
      title: 'Trattoria Pizzeria La Fiaschetteria',
      description:
        'Casual trattoria in the historic center serving pizza, pasta, and classic Italian dishes. Good value compared to waterfront places. Friendly service, decent wine list with local Lugana. Pasta €12-18, pizza €10-15.',
      category: 'food',
      rating: 4.3,
      priceLevel: 2,
      duration: 'Lunch/Dinner',
      address: 'Via Vittorio Emanuele, 45, 25019 Sirmione BS',
    },
    {
      title: 'Lugana Wine Tasting',
      description:
        'The local white wine — Lugana DOC — is crisp, citrusy, and perfect for summer. Made from Turbiana grapes grown in the clay soils around the lake\'s southern end. Many restaurants offer tastings. Visit nearby Lugana zone wineries for cellar tours: Ca\' dei Frati, Zenato, or Tenuta Roveglia.',
      category: 'activity',
      rating: 4.5,
      priceLevel: 2,
      duration: '2-3 hours',
    },
    {
      title: 'Lake Garda Ferry Tour',
      description:
        'Hop on a ferry to explore other lakeside towns — Desenzano, Peschiera del Garda, Lazise, or Bardolino. Day passes available. The ferry ride itself offers stunning views of the coastline and mountains. A great way to combine Sirmione with other Garda destinations.',
      category: 'activity',
      rating: 4.4,
      priceLevel: 2,
      duration: 'Half day',
    },
    {
      title: 'Aperitivo at a Lakeside Bar',
      description:
        "The Italian ritual of evening drinks with snacks. Find a bar along the waterfront (near the castle or along Via Vittorio Emanuele), order an Aperol Spritz or local Lugana wine, and watch the sunset over the lake. Perfect end to a day in Sirmione. Expect €8-12 for a drink with snacks.",
      category: 'nightlife',
      rating: 4.6,
      priceLevel: 2,
      duration: '1-2 hours',
    },
    {
      title: 'Gelato at Artico Gelateria',
      description:
        'Artisan gelato shop in the historic center making fresh gelato daily. Try the lemon (local specialty) or crema di Sirmione. Perfect treat while exploring. €3-5.',
      category: 'food',
      rating: 4.7,
      priceLevel: 1,
      duration: '15 min',
      address: 'Via Vittorio Emanuele, 48, 25019 Sirmione BS',
    },
  ];

  for (const [i, h] of highlights.entries()) {
    await db.insert(schema.destinationHighlights).values({
      destinationId: DEST_ID,
      orderIndex: i,
      ...h,
    });
  }
  console.log(`  ✅ ${highlights.length} highlights added`);

  // ── 4. Weather (delete existing, re-insert) ──────────────────
  await db
    .delete(schema.destinationWeatherMonthly)
    .where(eq(schema.destinationWeatherMonthly.destinationId, DEST_ID));

  const weather = [
    { month: 1, avgHighC: 7, avgLowC: 0, rainyDays: 6, sunshineHours: 3 },
    { month: 2, avgHighC: 10, avgLowC: 1, rainyDays: 5, sunshineHours: 4 },
    { month: 3, avgHighC: 15, avgLowC: 5, rainyDays: 6, sunshineHours: 5 },
    { month: 4, avgHighC: 19, avgLowC: 9, rainyDays: 8, sunshineHours: 6 },
    { month: 5, avgHighC: 24, avgLowC: 13, rainyDays: 9, sunshineHours: 8 },
    { month: 6, avgHighC: 28, avgLowC: 17, rainyDays: 7, sunshineHours: 9 },
    { month: 7, avgHighC: 31, avgLowC: 19, rainyDays: 5, sunshineHours: 10 },
    { month: 8, avgHighC: 30, avgLowC: 19, rainyDays: 6, sunshineHours: 9 },
    { month: 9, avgHighC: 26, avgLowC: 15, rainyDays: 6, sunshineHours: 7 },
    { month: 10, avgHighC: 20, avgLowC: 10, rainyDays: 7, sunshineHours: 5 },
    { month: 11, avgHighC: 13, avgLowC: 5, rainyDays: 7, sunshineHours: 3 },
    { month: 12, avgHighC: 8, avgLowC: 1, rainyDays: 6, sunshineHours: 3 },
  ];

  for (const w of weather) {
    await db.insert(schema.destinationWeatherMonthly).values({
      destinationId: DEST_ID,
      ...w,
    });
  }
  console.log(`  ✅ ${weather.length} months of weather data added`);

  // ── 5. Accommodations ─────────────────────────────────────────
  // Check if accommodations already exist
  const existingAcc = await db.select().from(schema.accommodations)
    .where(eq(schema.accommodations.destinationId, DEST_ID));
  
  if (existingAcc.length === 0) {
    const accomms = [
      {
        tripId: TRIP_ID,
        destinationId: DEST_ID,
        name: 'Hotel Sirmione e Promessi Sposi',
        type: 'hotel' as const,
        status: 'researched' as const,
        address: 'Piazza Porto Valentino, 11, 25019 Sirmione BS',
        costPerNight: '180.00',
        currency: 'EUR',
        rating: 4.5,
        bookingUrl: 'https://www.booking.com/hotel/it/sirmione.html',
        notes:
          '4-star lakeside hotel with thermal pool. Historic building with modern amenities. Excellent location near the castle. Breakfast included.',
      },
      {
        tripId: TRIP_ID,
        destinationId: DEST_ID,
        name: 'Hotel Catullo',
        type: 'hotel' as const,
        status: 'researched' as const,
        address: 'Piazza Flaminia, 7, 25019 Sirmione BS',
        costPerNight: '150.00',
        currency: 'EUR',
        rating: 4.3,
        bookingUrl: 'https://www.booking.com/hotel/it/catullo.html',
        notes:
          '3-star hotel in the historic center. Rooftop terrace with lake views. Good mid-range option. Walking distance to all attractions.',
      },
      {
        tripId: TRIP_ID,
        destinationId: DEST_ID,
        name: 'Hotel Marconi',
        type: 'hotel' as const,
        status: 'researched' as const,
        address: 'Via Vittorio Emanuele, 51, 25019 Sirmione BS',
        costPerNight: '140.00',
        currency: 'EUR',
        rating: 4.2,
        bookingUrl: 'https://www.booking.com/hotel/it/marconi-sirmione.html',
        notes:
          'Family-run hotel in the old town. Simple, clean rooms. Great value for the location. Some rooms have lake views.',
      },
      {
        tripId: TRIP_ID,
        destinationId: DEST_ID,
        name: 'Lakeside Airbnb (Desenzano)',
        type: 'airbnb' as const,
        status: 'researched' as const,
        address: 'Desenzano del Garda (nearby)',
        costPerNight: '95.00',
        currency: 'EUR',
        rating: 4.4,
        notes:
          'More affordable option in Desenzano, 10 min drive from Sirmione. Larger spaces, kitchen access. Good for families or longer stays.',
      },
    ];

    for (const a of accomms) {
      await db.insert(schema.accommodations).values(a);
    }
    console.log(`  ✅ ${accomms.length} accommodations added`);
  } else {
    console.log(`  ⏭️ Accommodations already exist, skipping`);
  }

  console.log('\n🏰 Sirmione research profile complete!');
  console.log('  ✅ All 6 sections populated → fully_researched');

  await client.end();
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
