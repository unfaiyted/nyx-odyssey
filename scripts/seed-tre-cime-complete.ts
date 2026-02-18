/**
 * Complete Tre Cime di Lavaredo destination profile
 * Populates: enhanced research, highlights, weather, tips
 * Usage: bun run scripts/seed-tre-cime-complete.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../src/db/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

const TRE_CIME_ID = 'IiZvIldcMKyrd9KrZ5Ji8';

async function seedTreCimeComplete() {
  console.log('🏔️ Updating Tre Cime di Lavaredo with complete research data...\n');

  // ── Update destination_research ──
  const transportNotes = `**Getting There from Vicenza:**

🚗 **Drive (ONLY OPTION)**
- Time: ~2.5–3 hours / 220 km
- Route: A4 → A22 (Brennero) → Exit Bressanone/San Candido → SS49 → Misurina → Toll Road to Rifugio Auronzo
- Toll road (last 7 km): ~€30/car (summer season, June–Sept)
- Total tolls (highway + toll road): ~€40–45 round trip
- Parking: Rifugio Auronzo lot (2,320m) — free once toll paid, ~200 spaces
- ⚠️ Toll road opens mid-June to late September only (weather-dependent)

🚌 **Bus (Alternative)**
- Cortina d'Ampezzo → Rifugio Auronzo shuttle: runs July–August
- From Vicenza: train to Calalzo di Cadore (~2h), bus to Cortina (~1h), shuttle to Auronzo (~30min)
- Total: 4–5 hours, impractical — drive is strongly recommended

**Parking Tips:**
- Arrive before 8:30 AM in July/August — lot fills by 9–10 AM
- Weekdays are significantly less crowded than weekends
- If lot is full, park at Lago di Misurina and take shuttle (runs peak season)`;

  const travelTips = JSON.stringify([
    "Start the hike before 9 AM to beat crowds and afternoon thunderstorms",
    "Toll road to Rifugio Auronzo costs ~€30/car — cash or card accepted",
    "Toll road is ONLY open mid-June to late September (weather dependent)",
    "The loop trail is 10 km, 3–4 hours, moderate — no technical climbing needed",
    "Bring layers even in summer: temperature at 2,300m+ can drop to 5°C with wind",
    "Pack rain gear — afternoon thunderstorms are common June–August",
    "Sunscreen and sunglasses essential at altitude (UV is intense)",
    "Hiking poles recommended but not required for the standard loop",
    "Rifugio Locatelli has the iconic postcard view — arrive by 10 AM for best light",
    "Walk counter-clockwise (right from Auronzo) for the classic reveal of the north face",
    "No water refills on trail except at rifugios — bring at least 1.5L",
    "Dogs allowed on leash on the trail",
    "Check webcam before going: www.drei-zinnen.info/en/webcams",
    "Can combine with Lago di Misurina visit (on the way, stunning lake at 1,754m)",
    "Wheelchair-accessible viewpoint at Rifugio Auronzo with restaurant/café"
  ]);

  const summary = `Tre Cime di Lavaredo (Drei Zinnen) — the single most iconic sight in the Dolomites. Three colossal vertical towers of pale dolomite rising to 2,999m, a UNESCO World Heritage landmark and the symbol of the entire range.

**The Classic Loop:** A 10 km, 3–4 hour moderate hike circling the three peaks. Starting from Rifugio Auronzo (2,320m), the trail offers constantly shifting perspectives — from the massive south face at the start, to the dramatic north face reveal at Rifugio Locatelli, with alpine lakes, WWI fortifications, and wildflower meadows along the way.

**Why It's Special:** Unlike many Dolomite hikes, this one requires no via ferrata gear or technical skill. The trail is well-marked, mostly gravel paths, with a total elevation gain of ~400m. Yet the scenery rivals anything in the Alps. On clear days, you can see all the way to Austria.

**Best For:** Day trip from Vicenza (2.5–3h drive). Combine with Lago di Misurina on the way. Doable for anyone with basic fitness — families, casual hikers, photography enthusiasts. The toll road does the hard work of getting you to 2,320m.`;

  await db.update(schema.destinationResearch)
    .set({
      transportNotes,
      travelTips,
      summary,
      driveTimeMinutes: 165,
      driveDistanceKm: 220,
      driveCost: '40',
      driveRouteNotes: 'A4→A22→SS49 via Bressanone/San Candido, toll road to Rifugio Auronzo (€30)',
      dailyBudgetLow: '25',
      dailyBudgetMid: '50',
      dailyBudgetHigh: '80',
      budgetCurrency: 'EUR',
      costNotes: 'Main costs: toll road (€30/car), rifugio meals (€10–20), highway tolls (~€12 each way). No entrance fee for hiking.',
      safetyRating: 9,
      safetyNotes: 'Very safe. Well-marked trails, mountain rescue available. Main risks: afternoon thunderstorms (check weather), altitude effects (2,300m+), slippery rocks when wet.',
      elevation: '2320',
      weatherNotes: 'Alpine mountain weather — can change rapidly. Mornings typically clear, afternoon thunderstorms common June–August. Snow possible into June and from late September. Wind chill significant at altitude.',
      culturalNotes: 'Site of fierce WWI fighting between Italy and Austria-Hungary. Remnants of trenches, tunnels, and fortifications visible along the trail. The peaks sit on the border between Italian-speaking Veneto and German-speaking South Tyrol — both languages used locally.',
      updatedAt: new Date(),
    })
    .where(eq(schema.destinationResearch.destinationId, TRE_CIME_ID));
  console.log('✅ Updated destination_research');

  // ── Add more highlights ──
  const existingHighlights = await db.select().from(schema.destinationHighlights)
    .where(eq(schema.destinationHighlights.destinationId, TRE_CIME_ID));
  
  let nextOrder = existingHighlights.length > 0
    ? Math.max(...existingHighlights.map(h => h.orderIndex ?? 0)) + 1
    : 0;

  const newHighlights = [
    {
      destinationId: TRE_CIME_ID,
      title: "North Face Viewpoint (Rifugio Locatelli)",
      description: "THE postcard view — the dramatic north face of all three towers reflected in Laghi dei Piani. Best light in the morning (before noon). The rifugio serves excellent strudel and bombardino. Allow 1.5–2 hours from Rifugio Auronzo to reach this point.",
      category: 'nature',
      priceLevel: 1,
      lat: 46.6192,
      lng: 12.3047,
      websiteUrl: 'https://www.rifugiolocatelli.com',
      orderIndex: nextOrder++,
    },
    {
      destinationId: TRE_CIME_ID,
      title: "Cappella degli Alpini",
      description: "Small chapel near Rifugio Locatelli dedicated to fallen Alpine soldiers of WWI. Poignant reminder that these beautiful mountains were once a brutal battlefield. Free to visit, powerful atmosphere.",
      category: 'cultural',
      priceLevel: 0,
      lat: 46.6185,
      lng: 12.3055,
      orderIndex: nextOrder++,
    },
    {
      destinationId: TRE_CIME_ID,
      title: "Lago di Misurina",
      description: "Stunning alpine lake at 1,754m, on the approach road to Tre Cime. Perfect for a pre/post-hike stop. Free lakeside walk (30 min circuit). Cafés and restaurants around the shore. Known as 'the Pearl of the Dolomites.'",
      category: 'nature',
      priceLevel: 0,
      lat: 46.5825,
      lng: 12.2536,
      orderIndex: nextOrder++,
    },
    {
      destinationId: TRE_CIME_ID,
      title: "Rifugio Auronzo — Start Point & Café",
      description: "Starting point of the classic loop at 2,320m. Restaurant, café, gift shop, and toilets. Great views of the south face right from the parking lot. Wheelchair-accessible terrace. Coffee €2–3, lunch €10–18.",
      category: 'food',
      priceLevel: 2,
      lat: 46.6093,
      lng: 12.2947,
      orderIndex: nextOrder++,
    },
    {
      destinationId: TRE_CIME_ID,
      title: "WWI Trenches & Tunnels",
      description: "Along the loop trail, especially near Forcella Lavaredo, you'll pass preserved WWI fortifications — trenches, observation posts, and tunnels carved into the rock. Free to explore (carefully). Interpretive signs in Italian and German.",
      category: 'cultural',
      priceLevel: 0,
      lat: 46.6130,
      lng: 12.3100,
      orderIndex: nextOrder++,
    },
    {
      destinationId: TRE_CIME_ID,
      title: "Rifugio Lavaredo",
      description: "Mountain hut at the Forcella Lavaredo pass (2,344m), about halfway on the loop. Serves hearty South Tyrolean food — try the knödel (bread dumplings) or gulaschsuppe. Panoramic terrace facing Cadini di Misurina peaks.",
      category: 'food',
      priceLevel: 2,
      lat: 46.6120,
      lng: 12.3085,
      websiteUrl: 'https://www.rifugiolavaredo.com',
      orderIndex: nextOrder++,
    },
    {
      destinationId: TRE_CIME_ID,
      title: "Sunrise Hike (Advanced)",
      description: "For photographers and early risers: drive up before dawn (toll road opens ~7 AM in peak season, but you can camp at Misurina and hike up the old military trail). Sunrise hits the north face in golden alpenglow — unforgettable. Headlamp required.",
      category: 'activity',
      priceLevel: 0,
      orderIndex: nextOrder++,
    },
    {
      destinationId: TRE_CIME_ID,
      title: "Cadini di Misurina Viewpoint",
      description: "Visible from the south side of the loop trail — a dramatic crown of jagged peaks. Often photographed from Rifugio Lavaredo terrace. No detour needed, visible right from the main trail.",
      category: 'nature',
      priceLevel: 0,
      lat: 46.5950,
      lng: 12.2800,
      orderIndex: nextOrder++,
    },
  ];

  for (const highlight of newHighlights) {
    await db.insert(schema.destinationHighlights).values(highlight);
  }
  console.log(`✅ Added ${newHighlights.length} new highlights`);

  // ── Weather data ──
  const weatherData = [
    { destinationId: TRE_CIME_ID, month: 6, avgHighC: 14, avgLowC: 4, rainyDays: 12, sunshineHours: 6 },
    { destinationId: TRE_CIME_ID, month: 7, avgHighC: 18, avgLowC: 7, rainyDays: 13, sunshineHours: 7 },
  ];

  for (const w of weatherData) {
    await db.insert(schema.destinationWeatherMonthly).values(w);
  }
  console.log('✅ Added weather data for June and July');

  // ── Update trip destination status ──
  await db.update(schema.tripDestinations)
    .set({
      researchStatus: 'fully_researched',
      lastResearchedAt: new Date(),
    })
    .where(eq(schema.tripDestinations.id, TRE_CIME_ID));
  console.log('✅ Updated trip destination status to fully_researched');

  console.log('\n🏔️ Tre Cime di Lavaredo research complete!');
  
  await client.end();
  process.exit(0);
}

seedTreCimeComplete().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
