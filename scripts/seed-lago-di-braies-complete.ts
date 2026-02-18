/**
 * Complete Lago di Braies destination profile
 * Populates: research, highlights, weather, tips
 * Usage: bun run scripts/seed-lago-di-braies-complete.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../src/db/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

const BRAIES_ID = 'bDlFdw-KkfaOpzkEvktEj';

async function seedBraiesCompleteResearch() {
  console.log('🏔️ Updating Lago di Braies with complete research data...\n');

  const transportNotes = `**Getting There from Vicenza:**

🚗 **Drive (RECOMMENDED)**
- Time: ~2.5–3 hours / 258 km
- Route: A4 → A22 Brennero → SS49 Val Pusteria → Braies valley road
- Tolls: ~€20–21 (A4 + A22 Brennero motorway)
- Fuel: ~€35–40 round trip
- Total one-way cost: ~€55–60

🅿️ **Parking (CRITICAL)**
- P1: 50m from lake — €3/hr up to €10/day (cars), €20/day (RVs)
- P2: 2 min walk from lake
- P3: 1 km from lake (5 min walk)
- **HIGH SEASON (Jul 10 – Sep 10):** Road CLOSED during daylight hours!
  - Private cars allowed only before 10:00 AM and after 3:00 PM
  - Must pre-book parking at pragsparking.com (~€38/reservation)
  - Alternatively: use shuttle buses from Monguelfo or Villabassa

🚂 **Train + Shuttle**
- Vicenza → Fortezza (Franzensfeste): ~2h by regional train (~€15)
- Fortezza → Monguelfo/Villabassa: ~30 min (Val Pusteria line)
- Shuttle 439 (from Monguelfo) or 442 (from Villabassa) to lake
- Shuttle: €10 adults round-trip, €6 children (6-13)
- **High season:** shuttle tickets must be pre-booked online at prags.bz

🚴 **Bike Option**
- Excellent bike paths in Val Pusteria
- Monguelfo to lake: 10.7 km; Villabassa: 12.6 km
- E-bike rentals available in all nearby villages

**Pro Tip:** Arrive before 9 AM or after 5 PM to avoid the worst crowds and parking stress. The lake is magical at dawn.`;

  const travelTips = JSON.stringify([
    "HIGH SEASON (Jul 10 – Sep 10): Road closed during peak hours — arrive before 10 AM or after 3 PM, or use shuttle buses",
    "Pre-book parking at pragsparking.com — you CANNOT drive up without a reservation in summer",
    "Arrive at sunrise (5:30-6 AM in June/July) for empty lake + perfect mirror reflections",
    "Rowboat rental is THE iconic experience — €15-20 for 30 minutes, first-come first-served",
    "The lake loop trail is 3.8 km and takes ~1.5 hours — go counter-clockwise for the easier flat path first",
    "East shore path is steep with stairways — not suitable for strollers or wheelchairs",
    "Water temperature maxes at 14°C — swimming is for the brave only",
    "Combine with Tre Cime di Lavaredo in one (long) day trip — it's only 45 min further",
    "Hotel Pragser Wildsee at lakeside has a restaurant — good for lunch but book ahead in summer",
    "The Braies Chapel (1904) is a 5-min walk from P1 — free to visit, open in summer",
    "Bring layers: mountain weather changes fast, even in July mornings start cool at 1,500m",
    "No swimming in certain areas — follow signage for designated spots",
    "The lake is within Fanes-Sennes-Prags Nature Park — dogs must be leashed",
    "For photographers: golden hour reflections of Seekofel (Croda del Becco) are best from the south shore",
    "Free public toilets at the chapel (€0.50 donation)"
  ]);

  const summary = `Lago di Braies (Pragser Wildsee) — The Pearl of the Dolomites. A stunningly turquoise alpine lake at 1,496m elevation, cradled beneath the imposing Seekofel (Croda del Becco, 2,810m) in South Tyrol's Fanes-Sennes-Prags Nature Park. Famous worldwide for its iconic wooden rowboats, mirror-like emerald waters, and dramatic Dolomite backdrop.

**Must-Do:** Rent a rowboat on the emerald waters, walk the 3.8 km loop trail, photograph the Seekofel reflections at dawn, visit the 1904 Braies Chapel.

**Reality Check:** This is one of Italy's most Instagrammed locations — over 1.2 million visitors per summer. The road is CLOSED during peak hours (Jul 10 – Sep 10) and parking must be pre-booked. The secret is timing: arrive at sunrise or late afternoon for a magical, crowd-free experience.

**From Vicenza:** 2.5–3 hour drive via the Brennero motorway. Makes an excellent day trip, or combine with Tre Cime di Lavaredo for the ultimate Dolomites day. The drive through Val Pusteria is gorgeous in itself.

**UNESCO context:** The surrounding Dolomites are a UNESCO World Heritage Site. The lake is the starting point of Alta Via No. 1, the classic multi-day Dolomites trek to Belluno.`;

  const costNotes = `Parking: €3/hr up to €10/day (€38 reservation in high season). Rowboat: €15-20/30 min. Shuttle bus: €10 round-trip. Hotel restaurant lunch: €15-25. The lake itself and trails are FREE. Budget a total of €60-80/person for a day trip from Vicenza including fuel, tolls, parking, rowboat, and food.`;

  // Update destination_research
  const existing = await db.select().from(schema.destinationResearch)
    .where(eq(schema.destinationResearch.destinationId, BRAIES_ID));

  const researchData = {
    destinationId: BRAIES_ID,
    country: 'Italy',
    region: 'South Tyrol (Alto Adige), Trentino-Alto Adige',
    timezone: 'Europe/Rome',
    language: 'Italian, German (Südtirolerisch), Ladin',
    currency: 'EUR',
    elevation: '1,496m (4,908 ft)',
    bestTimeToVisit: 'June to September (lake accessible); June & late September for fewer crowds',
    avgTempHighC: 20,
    avgTempLowC: 8,
    rainyDaysPerMonth: 12,
    weatherNotes: 'Alpine climate at 1,500m. Summer days pleasant (18-22°C) but mornings cool (6-10°C). Afternoon thunderstorms common in July-August. Water temperature max 14°C. Snow possible into May and from October.',
    dailyBudgetLow: '60',
    dailyBudgetMid: '80',
    dailyBudgetHigh: '120',
    budgetCurrency: 'EUR',
    costNotes,
    transportNotes,
    nearestAirport: 'Innsbruck (IBK) ~2h, Bolzano (no commercial flights), Venice Marco Polo (VCE) ~3.5h',
    safetyRating: 5,
    safetyNotes: 'Very safe natural area. Main risks: mountain weather changes, slippery paths on east shore, cold water temperatures. Follow Nature Park rules.',
    culturalNotes: 'South Tyrol has strong Austrian/German cultural influence — bilingual signs, Tyrolean cuisine (Knödel, Strudel, Speck), distinct from mainstream Italian culture. The area was part of Austria until 1919.',
    summary,
    travelTips,
    driveTimeMinutes: 175,
    driveDistanceKm: 258.1,
    driveCost: '59',
    driveRouteNotes: 'A4 east → A22 Brennero north → exit Bressanone/Brixen → SS49 Val Pusteria east → turn south at Monguelfo/Welsberg into Braies valley. Last 15 km is a narrow mountain road. Tolls ~€21.',
    trainTimeMinutes: 210,
    trainCost: '25',
    trainRouteNotes: 'Vicenza → Fortezza/Franzensfeste (Trenitalia regional, ~2h, €12-18). Change to Val Pusteria line → Monguelfo or Villabassa (~30 min). Then shuttle bus 439/442 to lake (~20 min). Total ~3.5h.',
    busTimeMinutes: 300,
    busCost: '20',
    busRouteNotes: 'No direct bus. Take train to Monguelfo/Villabassa, then shuttle 439 (from Monguelfo) or 442 (from Villabassa). Shuttles run every 30 min in summer.',
  };

  if (existing.length > 0) {
    await db.update(schema.destinationResearch)
      .set(researchData)
      .where(eq(schema.destinationResearch.destinationId, BRAIES_ID));
    console.log('✅ Updated destination_research');
  } else {
    await db.insert(schema.destinationResearch).values(researchData);
    console.log('✅ Created destination_research');
  }

  // Weather data for June and July
  const weatherMonths = [
    { destinationId: BRAIES_ID, month: 6, avgHighC: 19, avgLowC: 7, rainyDays: 12, sunshineHours: 6.5 },
    { destinationId: BRAIES_ID, month: 7, avgHighC: 22, avgLowC: 9, rainyDays: 13, sunshineHours: 7.0 },
  ];

  for (const weather of weatherMonths) {
    await db.insert(schema.destinationWeatherMonthly).values(weather);
  }
  console.log('✅ Added weather data for June & July');

  // Add more highlights (already has Lake Loop Trail and Rowboat Experience)
  const existingHighlights = await db.select().from(schema.destinationHighlights)
    .where(eq(schema.destinationHighlights.destinationId, BRAIES_ID))
    .orderBy(schema.destinationHighlights.orderIndex);

  let nextOrder = existingHighlights.length > 0
    ? Math.max(...existingHighlights.map(h => h.orderIndex ?? 0)) + 1
    : 0;

  const newHighlights = [
    {
      destinationId: BRAIES_ID,
      title: 'Seekofel (Croda del Becco) — Iconic Backdrop',
      description: 'The dramatic 2,810m peak that towers over the lake, creating the iconic Braies postcard view. The reflection of Seekofel in the emerald waters at dawn is one of the most photographed scenes in the Dolomites. For hikers: the summit trail (via Alta Via 1) takes 4-5 hours and rewards with panoramic views over the entire Fanes-Sennes-Prags Nature Park.',
      category: 'nature',
      priceLevel: 0,
      lat: 46.6458,
      lng: 12.0800,
      duration: '4-5 hours (summit hike) or just admire from lake',
      orderIndex: nextOrder++,
    },
    {
      destinationId: BRAIES_ID,
      title: 'Braies Chapel (Cappella del Lago)',
      description: 'A tiny, charming chapel built in 1904 on the northwest shore, just 5 minutes walk from the main parking. Used during WWII for exchanging war prisoners between Italy and Germany. Open to visitors in summer. Features a small public toilet (€0.50). A beautiful, quiet spot for reflection.',
      category: 'cultural',
      priceLevel: 0,
      lat: 46.6950,
      lng: 12.0850,
      duration: '15-20 minutes',
      orderIndex: nextOrder++,
    },
    {
      destinationId: BRAIES_ID,
      title: 'Hotel Pragser Wildsee — Lakeside Dining',
      description: 'The historic hotel right at the lake\'s edge, dating back to 1899. Even if you\'re not staying, the restaurant serves excellent South Tyrolean cuisine: Knödel (bread dumplings), Kaiserschmarrn (shredded pancake), local Speck platters. Terrace dining with direct lake views. Lunch €15-25. Book ahead in summer — it\'s the only restaurant at the lake.',
      category: 'food',
      priceLevel: 2,
      lat: 46.6947,
      lng: 12.0856,
      websiteUrl: 'https://www.lagodibraies.com',
      duration: '1-1.5 hours',
      orderIndex: nextOrder++,
    },
    {
      destinationId: BRAIES_ID,
      title: 'Alta Via No. 1 Trailhead — "The Classic"',
      description: 'Lago di Braies is the legendary starting point of Alta Via No. 1, the most famous multi-day trek in the Dolomites. The full route covers 120 km to Belluno through stunning alpine scenery. Even if you\'re not doing the full trek, the first section from the lake toward Rifugio Biella (2,327m) is a spectacular day hike with views over the lake and surrounding peaks. ~3-4 hours round trip.',
      category: 'activity',
      priceLevel: 0,
      lat: 46.6940,
      lng: 12.0860,
      duration: '3-4 hours (to Rifugio Biella and back)',
      orderIndex: nextOrder++,
    },
    {
      destinationId: BRAIES_ID,
      title: 'Fanes-Sennes-Prags Nature Park',
      description: 'One of South Tyrol\'s largest nature parks (25,680 hectares) surrounding the lake. Pristine alpine meadows, ancient forests, and dramatic Dolomite formations. Rich wildlife: chamois, marmots, golden eagles, deer. Multiple hiking trails of varying difficulty. The park is part of the UNESCO Dolomites World Heritage Site. Free entry — just respect the Nature Park rules (dogs on leash, stay on trails).',
      category: 'nature',
      priceLevel: 0,
      lat: 46.6600,
      lng: 12.0400,
      websiteUrl: 'https://www.naturparks.provinz.bz.it',
      duration: 'Half day to multi-day',
      orderIndex: nextOrder++,
    },
    {
      destinationId: BRAIES_ID,
      title: 'Sunrise Photography Session',
      description: 'The ultimate Braies experience. Arrive before 6 AM (sunrise ~5:30 in June/July) when the lake is perfectly still and empty of tourists. The Seekofel reflection in the mirror-like turquoise water is breathtaking. Best spots: the old wooden boathouse dock (south shore) and the western shore trail. Bring a tripod. This is the photo you see on every Italy travel blog — but experiencing it in person, in silence, is something else entirely.',
      category: 'activity',
      priceLevel: 0,
      lat: 46.6940,
      lng: 12.0845,
      duration: '1-2 hours (arrive pre-dawn)',
      orderIndex: nextOrder++,
    },
    {
      destinationId: BRAIES_ID,
      title: 'South Tyrolean Speck & Local Produce',
      description: 'South Tyrol is famous for Speck (smoked, cured ham aged 22+ weeks). Pick some up at small shops in the Braies valley or nearby Monguelfo/Villabassa. Also try: fresh mountain cheese, Schüttelbrot (crispy flatbread), apple strudel, and local honey. Perfect picnic supplies for the lakeside. Budget: €5-10 for a generous picnic spread.',
      category: 'food',
      priceLevel: 1,
      lat: 46.7500,
      lng: 12.1000,
      duration: '30 minutes shopping',
      orderIndex: nextOrder++,
    },
    {
      destinationId: BRAIES_ID,
      title: 'WWII History — Transport of Concentration Camp Inmates',
      description: 'In April 1945, 139 prominent prisoners (including Léon Blum, Pastor Niemöller, and members of the Stauffenberg family) were transported to Lago di Braies by the SS as bargaining chips. They were liberated here by the US Army on May 4, 1945. A plaque near the hotel commemorates this remarkable episode. The story was documented in "Hostages of the SS" (Rai Storia, 2016).',
      category: 'cultural',
      priceLevel: 0,
      lat: 46.6945,
      lng: 12.0855,
      duration: '15-30 minutes',
      orderIndex: nextOrder++,
    },
  ];

  for (const highlight of newHighlights) {
    await db.insert(schema.destinationHighlights).values(highlight);
  }
  console.log(`✅ Added ${newHighlights.length} new highlights`);

  // Update trip destination status
  await db.update(schema.tripDestinations)
    .set({
      researchStatus: 'fully_researched',
    })
    .where(eq(schema.tripDestinations.id, BRAIES_ID));
  console.log('✅ Updated trip destination status to fully_researched');

  console.log('\n🏔️ Lago di Braies research complete!');
  await client.end();
  process.exit(0);
}

seedBraiesCompleteResearch().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
