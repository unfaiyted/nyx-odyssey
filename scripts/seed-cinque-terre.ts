/**
 * Seed script: Cinque Terre — Full Destination Research Profile
 *
 * Populates all 6 sections:
 * 1. Description & photo (trip_destinations)
 * 2. Research overview (destination_research)
 * 3. Highlights — restaurants, attractions, activities (destination_highlights)
 * 4. Weather — monthly data (destination_weather_monthly)
 * 5. Accommodations (accommodations)
 * 6. Transport notes (destination_research.transport_notes)
 *
 * Usage: bun scripts/seed-cinque-terre.ts
 */
import { db } from '../src/db';
import {
  tripDestinations,
  destinationResearch,
  destinationHighlights,
  destinationWeatherMonthly,
  accommodations,
} from '../src/db/schema';
import { eq } from 'drizzle-orm';

const DEST_ID = 'HZ_h8qdrE2XSAVmtsgRBw';
const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh';

async function seed() {
  console.log('🏖️ Seeding Cinque Terre — Full Destination Research Profile...');

  // ── 1. Update trip_destinations: description + photo ──────────
  await db
    .update(tripDestinations)
    .set({
      description:
        'Five impossibly colorful fishing villages clinging to the rugged Ligurian coastline — a UNESCO World Heritage Site and one of Italy\'s most iconic destinations. Connected by the Sentiero Azzurro coastal trail and a frequent local train, each village has its own character: Monterosso (beaches & restaurants), Vernazza (postcard-perfect harbor), Corniglia (hilltop vineyard village), Manarola (dramatic cliffs & wine), and Riomaggiore (gateway village with the famous Via dell\'Amore). About 3 hours from Vicenza, best experienced as an overnight stay to beat the day-tripper crowds.',
      photoUrl:
        'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=800&h=500&fit=crop',
      researchStatus: 'fully_researched',
      lastResearchedAt: new Date(),
    })
    .where(eq(tripDestinations.id, DEST_ID));
  console.log('  ✅ trip_destinations updated (description, photo, status)');

  // ── 2. Update destination_research ────────────────────────────
  await db
    .update(destinationResearch)
    .set({
      country: 'Italy',
      region: 'Liguria',
      timezone: 'CET (UTC+1)',
      language: 'Italian',
      currency: 'EUR (€)',
      population: '~4,000 (across all 5 villages)',
      elevation: '0-350m',
      bestTimeToVisit: 'Apr-May, Sep-Oct (fewer crowds). Jun-Jul hot & crowded but great weather.',
      avgTempHighC: 25,
      avgTempLowC: 17,
      rainyDaysPerMonth: 5,
      weatherNotes:
        'Mediterranean climate — hot dry summers, mild winters. June-July: 25-30°C, sunny, perfect for swimming and hiking but peak crowds. Morning hikes recommended to beat heat. Afternoon thunderstorms rare but possible. Sea temperature 22-24°C in summer. September is the sweet spot: warm, fewer crowds, sea still warm.',
      dailyBudgetLow: '70',
      dailyBudgetMid: '150',
      dailyBudgetHigh: '300',
      budgetCurrency: 'USD',
      costNotes:
        'Cinque Terre is expensive by Italian village standards due to tourism. Restaurants: €12-20 for a primo, €15-25 for a secondo. Budget tip: buy focaccia and farinata from shops (€3-5). Cinque Terre Treno MS Card: €19.50-32.50/day (includes unlimited trains + trail access). Boat day pass: ~€35. Accommodations book up fast for summer — reserve 2-3 months ahead.',
      transportNotes:
        'FROM VICENZA: Train is the only sensible option — driving is impractical (no parking, narrow roads, ZTL). Route: Vicenza → La Spezia Centrale (2.5-3h, change in Bologna or Parma, ~€20-35 one way). From La Spezia, take Cinque Terre Express regional train (5-15 min to Riomaggiore). Frecciarossa to La Spezia is fastest (~2h via Bologna).\n\nCINQUE TERRE TRENO MS CARD: Essential purchase. €19.50/day (low season) to €32.50/day (peak). Includes unlimited regional trains between Levanto-La Spezia + trail access + local buses + station toilets. Buy at any station or online at card.parconazionale5terre.it. Trains run every 10-20 min in summer.\n\nBOAT SERVICE: Consorzio Marittimo Turistico runs ferries between villages (except Corniglia — no harbor). Day pass ~€35, single trips €5-12. Runs Mar-Nov, weather dependent. Beautiful way to see the coastline. Boats can be crowded midday.\n\nLOCAL: All villages are car-free in the center. Walk, train, or boat. Corniglia requires climbing 382 steps (Lardarina stairway) from the station, or take the shuttle bus (included with Cinque Terre Card). Wear good shoes — everything involves stairs and steep paths.\n\nPARKING (if driving): Leave car in La Spezia (covered garages near station, ~€15-20/day) or Levanto. Do NOT attempt to drive into the villages.',
      nearestAirport: 'PSA (Pisa Galileo Galilei) — 80 km; GOA (Genoa) — 90 km',
      safetyRating: 5,
      safetyNotes:
        'Very safe. Main risks are hiking-related: steep trails, sun exposure, dehydration. Wear proper shoes (not flip-flops). Watch for pickpockets on crowded trains. Swimming: stick to designated areas, currents can be strong.',
      culturalNotes:
        'Ligurian cuisine is lighter than northern Italian — dominated by seafood, pesto, and olive oil. Local specialties: trofie al pesto (hand-rolled pasta with basil pesto, the real deal), acciughe di Monterosso (salt-cured anchovies, famous), focaccia (plain or with onions), farinata (chickpea flatbread), fritto misto di mare (mixed fried seafood), muscoli ripieni (stuffed mussels). Local wines: Sciacchetrà (rare sweet dessert wine from dried grapes, €30-50/bottle — a must-try), Cinque Terre DOC white (crisp, mineral). Limoncino (local limoncello) is everywhere. Aperitivo culture: less formal than Venice/Verona, more casual seaside spritz vibes.',
      summary:
        'Five jewel-toned fishing villages strung along the Ligurian coast, connected by hiking trails and a little train. Each village has its own personality — Vernazza and Manarola are the most photogenic, Monterosso has the best beach, Corniglia is the quietest, and Riomaggiore is the gateway to the reopened Via dell\'Amore. The Sentiero Azzurro (Blue Trail) connects all five villages in a 12km coastal hike. Best strategy: arrive early or stay overnight to experience the villages without the midday cruise ship crowds. About 3 hours from Vicenza by train.',
      travelTips: JSON.stringify([
        'Stay overnight if possible — the villages transform after 5pm when day-trippers leave. Magical at sunset and dawn.',
        'Buy the Cinque Terre Treno MS Card (€19.50-32.50/day) — it pays for itself after 2-3 train rides plus you need it for trail access.',
        'Via dell\'Amore (Riomaggiore→Manarola) reopened Feb 14, 2025 after 12+ years of closure. Paved, flat, wheelchair-accessible. ~20 min walk. Requires Cinque Terre Card + timed entry reservation.',
        'Best hiking segment: Vernazza→Monterosso (2h, moderate) — the most scenic section of the Sentiero Azzurro with incredible coastal views.',
        'Village priority for a 1-day visit: Vernazza (#1), Manarola (#2), Riomaggiore (#3). Skip Corniglia if short on time.',
        'For 2 days: Day 1 hike Monterosso→Vernazza→Corniglia. Day 2 train to Manarola & Riomaggiore, walk Via dell\'Amore, afternoon beach in Monterosso.',
        'Swim at: Monterosso (best sandy beach), Riomaggiore (rocky cove, clear water), Manarola (swimming rocks near harbor). Bring water shoes.',
        'Arrive before 10am or after 4pm to avoid the worst crowds. June-July weekends are brutal.',
        'Best photo spots: Manarola from the Nessun Dorma terrace (sunset), Vernazza harbor from the trail above, Riomaggiore from Via dell\'Amore.',
        'Sunrise tip: watch from Riomaggiore (east-facing) or the trail between Riomaggiore and Manarola. Sunset: Manarola or Vernazza.',
        'Boat tour: take the ferry one direction and hike the other for variety. The coastline from the water is stunning.',
        'Book restaurants ahead in summer — villages are tiny with limited tables. Lunch reservations essential for popular spots.',
      ]),
    })
    .where(eq(destinationResearch.destinationId, DEST_ID));
  console.log('  ✅ destination_research updated');

  // ── 3. Highlights ─────────────────────────────────────────────
  await db
    .delete(destinationHighlights)
    .where(eq(destinationHighlights.destinationId, DEST_ID));

  const highlights = [
    // === VILLAGES ===
    {
      title: 'Vernazza',
      description:
        'The crown jewel of Cinque Terre — a tiny, impossibly picturesque harbor village with colorful tower houses, a ruined Doria castle perched above, and a small pebble beach. The piazza opens directly onto the harbor where fishing boats bob. Climb to Castello Doria (€2) for panoramic views. The most photogenic of the five villages and the one to prioritize if time is limited.',
      category: 'attraction',
      rating: 4.9,
      priceLevel: 1,
      duration: '2-3 hours',
      imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600&h=400&fit=crop',
    },
    {
      title: 'Manarola',
      description:
        'Dramatic village tumbling down steep cliffs into the sea. Famous for its colorful houses stacked along the cliff face — the classic Cinque Terre postcard shot. Best viewed from the terrace at Nessun Dorma bar at sunset. Great swimming from the flat rocks below the village. Starting point of Via dell\'Amore toward Riomaggiore. Surrounded by terraced vineyards producing Sciacchetrà wine.',
      category: 'attraction',
      rating: 4.8,
      priceLevel: 1,
      duration: '2-3 hours',
      imageUrl: 'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=600&h=400&fit=crop',
    },
    {
      title: 'Riomaggiore',
      description:
        'The southernmost and most accessible village — first stop from La Spezia. Steep, narrow main street (Via Colombo) lined with restaurants and shops. Small harbor with dramatic cliff walls. Gateway to the reopened Via dell\'Amore. Good swimming at the rocky cove below the harbor. Feels slightly more "urban" than the others but has excellent restaurants and a lively evening scene.',
      category: 'attraction',
      rating: 4.5,
      priceLevel: 1,
      duration: '1.5-2 hours',
    },
    {
      title: 'Monterosso al Mare',
      description:
        'The largest village and the only one with a proper sandy beach (Fegina beach in the new town). Split into old town and new town by a tunnel. Best for: beach day, family-friendly, most restaurants/hotels. The old town has a charming waterfront promenade. Famous for Monterosso anchovies. Feel is more "resort town" than rustic village, but the beach is unbeatable.',
      category: 'attraction',
      rating: 4.4,
      priceLevel: 2,
      duration: '2-4 hours',
    },
    {
      title: 'Corniglia',
      description:
        'The quietest, most authentic village — perched on a hilltop 100m above the sea (no harbor). Reached by climbing 382 steps (Lardarina stairway) from the station or by shuttle bus. Surrounded by vineyards and terraces. Has a laid-back, local feel with fewer tourists. Main street (Via Fieschi) has small shops and wine bars. No beach access but the views from the terrace are exceptional.',
      category: 'attraction',
      rating: 4.3,
      priceLevel: 1,
      duration: '1-2 hours',
    },

    // === TRAILS & ACTIVITIES ===
    {
      title: 'Via dell\'Amore (Path of Love)',
      description:
        'The world\'s most romantic seaside walk — a paved, flat, 1km path carved into the cliff between Riomaggiore and Manarola. Reopened February 14, 2025 after 12+ years of closure following a 2012 landslide. Now requires Cinque Terre Card + timed reservation. ~20 minute walk with jaw-dropping Mediterranean views. Wheelchair and stroller accessible. Best at sunrise or sunset.',
      category: 'nature',
      rating: 4.9,
      priceLevel: 1,
      duration: '20-30 min',
      websiteUrl: 'https://www.parconazionale5terre.it',
    },
    {
      title: 'Sentiero Azzurro (Blue Trail) — Vernazza to Monterosso',
      description:
        'The most scenic segment of the famous coastal trail connecting all five villages (12km total). This 3.5km section takes ~2 hours with moderate difficulty — steep stairs, exposed clifftop paths, and constant stunning views of the coastline. Requires Cinque Terre Card for access. Start early (before 9am) to beat heat and crowds. Bring water, sunscreen, and proper shoes.',
      category: 'nature',
      rating: 4.8,
      priceLevel: 1,
      duration: '2 hours',
    },
    {
      title: 'Sentiero Azzurro — Corniglia to Vernazza',
      description:
        'Another excellent section of the Blue Trail. 3km, ~1.5 hours, moderate difficulty with some steep sections. Passes through terraced vineyards and olive groves with panoramic sea views. Less crowded than the Vernazza-Monterosso stretch. Combined with that section, makes for a spectacular half-day hike (Corniglia→Vernazza→Monterosso, ~3.5h).',
      category: 'nature',
      rating: 4.7,
      priceLevel: 1,
      duration: '1.5 hours',
    },
    {
      title: 'Boat Tour along the Coast',
      description:
        'See the Cinque Terre from the sea — the villages look even more dramatic from water level. Consorzio Marittimo Turistico runs ferries between all villages except Corniglia (no harbor). Day pass ~€35, or single trips €5-12. Also private boat tours available (~€50-80/person for 2-3h). Best in morning when sea is calm. Combine with hiking: boat one direction, trail the other.',
      category: 'activity',
      rating: 4.6,
      priceLevel: 2,
      duration: '2-4 hours',
    },
    {
      title: 'Swimming at Manarola Rocks',
      description:
        'No sandy beach here — instead, flat volcanic rocks at the base of the village where locals and visitors swim in crystal-clear water. Dramatic setting beneath the colorful cliffside houses. Bring water shoes and a towel. Can get crowded in peak summer but the water is gorgeous. Jump off the rocks into deep blue water (at your own risk). Rinse off at the public shower.',
      category: 'activity',
      rating: 4.5,
      priceLevel: 1,
      duration: '1-2 hours',
    },
    {
      title: 'Sciacchetrà Wine Tasting',
      description:
        'Rare, amber-colored sweet dessert wine made from dried Bosco, Albarola, and Vermentino grapes on the steep Cinque Terre terraces. Production is tiny (a few thousand bottles/year) — you can only really try it here. Cantina Cooperativa Cinque Terre in Riomaggiore offers tastings. Also available at Nessun Dorma in Manarola and Enoteca da Eliseo in Vernazza. €5-8 per glass, €30-50/bottle.',
      category: 'activity',
      rating: 4.7,
      priceLevel: 2,
      duration: '30-60 min',
    },

    // === RESTAURANTS ===
    {
      title: 'Trattoria dal Billy (Manarola)',
      description:
        'Perched high above Manarola with stunning panoramic sea views from the terrace. Known for exceptional seafood — the mixed fried seafood, seafood risotto, and grilled catch of the day are standouts. Family-run for generations. Mains €16-25. RESERVE AHEAD — always full in summer. Worth the climb up Via Rollandi. One of the best meals in Cinque Terre.',
      category: 'food',
      rating: 4.8,
      priceLevel: 3,
      duration: 'Lunch/Dinner',
      address: 'Via Rollandi 122, Manarola',
    },
    {
      title: 'Nessun Dorma (Manarola)',
      description:
        'Famous for the most spectacular terrace view in all of Cinque Terre — looking across Manarola\'s colorful cliff face at sunset. More of a wine bar/bistro than a full restaurant. Serves bruschetta, charcuterie platters, pesto dishes, and excellent local wines by the glass. Perfect for aperitivo. Gets extremely crowded — arrive 30 min before sunset to grab a seat. Pesto tasting board is a must.',
      category: 'food',
      rating: 4.6,
      priceLevel: 2,
      duration: 'Aperitivo/Light meal',
      address: 'Localitá Punta Bonfiglio, Manarola',
      websiteUrl: 'https://www.nessundorma5terre.com',
    },
    {
      title: 'Gambero Rosso (Vernazza)',
      description:
        'Upscale seafood restaurant right on Vernazza\'s harbor piazza — feet almost in the water. Fresh seafood pastas, grilled local catch, and excellent Ligurian wines. Try the trofie al pesto and the seafood antipasto platter. Pricier than village average (mains €18-30) but the setting is unmatched. Lunch is slightly less hectic than dinner. Reserve for dinner.',
      category: 'food',
      rating: 4.7,
      priceLevel: 3,
      duration: 'Lunch/Dinner',
      address: 'Piazza Marconi 7, Vernazza',
    },
    {
      title: 'Enoteca da Eliseo (Vernazza)',
      description:
        'Tiny, charming wine bar on Vernazza\'s main street. Run by the same family for decades. Excellent selection of local Cinque Terre wines including Sciacchetrà. Simple but perfect food: bruschetta, focaccia, anchovies, cheese plates. The kind of place where you sit at the counter, chat with the owner, and lose track of time. Cash preferred.',
      category: 'food',
      rating: 4.7,
      priceLevel: 1,
      duration: 'Wine/Snacks',
      address: 'Via Roma 62, Vernazza',
    },
    {
      title: 'Cantina de Mananan (Corniglia)',
      description:
        'Atmospheric old-style cantina in quiet Corniglia — communal tables, local wine, and traditional Ligurian cooking. Try the trofie al pesto (made with a mortar, not a blender), anchovy dishes, and local meats. Feels like eating in someone\'s cellar in the best way. Unpretentious and affordable. A welcome relief from the tourist-focused restaurants in the busier villages.',
      category: 'food',
      rating: 4.5,
      priceLevel: 1,
      duration: 'Lunch/Dinner',
      address: 'Via Fieschi 117, Corniglia',
    },
    {
      title: 'Cappun Magro (Manarola)',
      description:
        'Beloved bistro near Manarola\'s church. Small, intimate spot with a few outdoor tables. Menu changes daily based on market availability. Known for creative seafood dishes and the namesake cappun magro (elaborate Ligurian seafood salad — order ahead). Also does superb sandwiches with marine fillings. Great for a quality casual lunch.',
      category: 'food',
      rating: 4.7,
      priceLevel: 2,
      duration: 'Lunch',
      address: 'Via Riccobaldi 1, Manarola',
    },
    {
      title: 'Ristorante Ripa del Sole (Riomaggiore)',
      description:
        'One of the better restaurants in Riomaggiore. Terrace with sea views, well-prepared seafood, and generous portions. Try the spaghetti alle vongole and the fritto misto. More polished than many village spots without feeling stuffy. Good wine list featuring local Cinque Terre DOC whites. Mains €14-22.',
      category: 'food',
      rating: 4.4,
      priceLevel: 2,
      duration: 'Lunch/Dinner',
      address: 'Via de Gasperi 282, Riomaggiore',
    },
    {
      title: 'Il Porticciolo (Monterosso)',
      description:
        'Excellent seafood restaurant in Monterosso\'s old town. Specializes in the local Monterosso anchovies prepared multiple ways — fried, marinated, stuffed, salt-cured. Also great pastas and grilled fish. Casual, friendly atmosphere. Solid value for the quality. One of the better dinner options in the biggest village.',
      category: 'food',
      rating: 4.5,
      priceLevel: 2,
      duration: 'Lunch/Dinner',
      address: 'Via Zuecca 8, Monterosso al Mare',
    },

    // === PHOTO SPOTS ===
    {
      title: 'Manarola Sunset from Nessun Dorma',
      description:
        'THE iconic Cinque Terre photo — Manarola\'s cascading colorful houses lit by golden sunset light, viewed from the Nessun Dorma terrace or the nearby Punta Bonfiglio viewpoint. Arrive 30-45 min before sunset to secure a spot. The view is free from the path/viewpoint even without buying drinks. Best with a 24-70mm lens. Also magical at blue hour just after sunset.',
      category: 'nature',
      rating: 5.0,
      priceLevel: 1,
      duration: '1 hour',
    },
    {
      title: 'Vernazza from the Sentiero Azzurro Trail',
      description:
        'Classic overhead view of Vernazza\'s harbor and tower from the hiking trail approaching from Monterosso. About 10-15 min before reaching the village, you round a corner and the entire village appears below — harbor, church, castle, and the turquoise sea. One of the most photographed views in Italy. Best in morning light (east-facing).',
      category: 'nature',
      rating: 4.9,
      priceLevel: 1,
      duration: '30 min (photo stop)',
    },
  ];

  for (const [i, h] of highlights.entries()) {
    await db.insert(destinationHighlights).values({
      destinationId: DEST_ID,
      orderIndex: i,
      ...h,
    });
  }
  console.log(`  ✅ ${highlights.length} highlights added`);

  // ── 4. Weather ────────────────────────────────────────────────
  await db
    .delete(destinationWeatherMonthly)
    .where(eq(destinationWeatherMonthly.destinationId, DEST_ID));

  const weather = [
    { month: 1, avgHighC: 11, avgLowC: 5, rainyDays: 7, sunshineHours: 4 },
    { month: 2, avgHighC: 12, avgLowC: 5, rainyDays: 6, sunshineHours: 5 },
    { month: 3, avgHighC: 14, avgLowC: 7, rainyDays: 7, sunshineHours: 6 },
    { month: 4, avgHighC: 17, avgLowC: 10, rainyDays: 8, sunshineHours: 7 },
    { month: 5, avgHighC: 21, avgLowC: 14, rainyDays: 7, sunshineHours: 8 },
    { month: 6, avgHighC: 25, avgLowC: 17, rainyDays: 4, sunshineHours: 10 },
    { month: 7, avgHighC: 28, avgLowC: 20, rainyDays: 2, sunshineHours: 11 },
    { month: 8, avgHighC: 28, avgLowC: 20, rainyDays: 3, sunshineHours: 10 },
    { month: 9, avgHighC: 25, avgLowC: 17, rainyDays: 5, sunshineHours: 8 },
    { month: 10, avgHighC: 20, avgLowC: 13, rainyDays: 8, sunshineHours: 6 },
    { month: 11, avgHighC: 15, avgLowC: 9, rainyDays: 9, sunshineHours: 4 },
    { month: 12, avgHighC: 12, avgLowC: 6, rainyDays: 7, sunshineHours: 4 },
  ];

  for (const w of weather) {
    await db.insert(destinationWeatherMonthly).values({
      destinationId: DEST_ID,
      ...w,
    });
  }
  console.log(`  ✅ ${weather.length} months of weather data added`);

  // ── 5. Accommodations ─────────────────────────────────────────
  // Delete existing if any
  await db.delete(accommodations).where(eq(accommodations.destinationId, DEST_ID));

  const accomms = [
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'La Torretta Lodge (Manarola)',
      type: 'hotel' as const,
      status: 'researched' as const,
      address: 'Vico Volto 20, Manarola',
      costPerNight: '180.00',
      currency: 'EUR',
      rating: 4.8,
      notes:
        'Boutique lodge in the heart of Manarola with sea-view terrace. Beautifully restored. Steps from Nessun Dorma viewpoint. Breakfast included. Book 3+ months ahead for summer.',
    },
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'Hotel Porto Roca (Monterosso)',
      type: 'hotel' as const,
      status: 'researched' as const,
      address: 'Via Corone 1, Monterosso al Mare',
      costPerNight: '220.00',
      currency: 'EUR',
      rating: 4.6,
      bookingUrl: 'https://www.portoroca.it',
      notes:
        'Clifftop hotel with panoramic terrace overlooking the sea between old and new Monterosso. Pool, restaurant. The most "resort-like" option in Cinque Terre. Sea-view rooms worth the upgrade. Breakfast terrace is spectacular.',
    },
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'Gianni Franzi Rooms (Vernazza)',
      type: 'hotel' as const,
      status: 'researched' as const,
      address: 'Piazza Marconi, Vernazza',
      costPerNight: '130.00',
      currency: 'EUR',
      rating: 4.4,
      notes:
        'Simple but charming rooms right on Vernazza\'s harbor square, run by the restaurant of the same name. Some rooms have harbor views. No frills but perfect location — fall asleep to the sound of waves. Shared terrace. Book early, limited rooms.',
    },
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'Airbnb: Sea View Apartment (Riomaggiore)',
      type: 'airbnb' as const,
      status: 'researched' as const,
      address: 'Via Colombo, Riomaggiore',
      costPerNight: '110.00',
      currency: 'EUR',
      rating: 4.5,
      notes:
        'Self-catering apartment on the main street with partial sea view. Kitchen for breakfast/snacks (useful since restaurant options are limited). AC, wifi. Many options on Airbnb in Riomaggiore — it\'s the most accessible village from La Spezia. Budget option that still feels authentic.',
    },
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'Ostello 5 Terre (Manarola)',
      type: 'hostel' as const,
      status: 'researched' as const,
      address: 'Via Riccobaldi 21, Manarola',
      costPerNight: '40.00',
      currency: 'EUR',
      rating: 4.0,
      notes:
        'Budget option — simple hostel in Manarola with dorms and private rooms. Terrace with views. Private double room ~€80-100. Good if traveling on a budget and want to stay overnight to see sunset/sunrise. Book well ahead for summer.',
    },
  ];

  for (const a of accomms) {
    await db.insert(accommodations).values(a);
  }
  console.log(`  ✅ ${accomms.length} accommodations added`);

  console.log('\n🏖️ Cinque Terre research profile complete!');
  console.log('  ✅ All 6 sections populated → fully_researched');
  console.log('\n📋 Key facts:');
  console.log('   Distance: ~3h from Vicenza by train (via La Spezia)');
  console.log('   Cinque Terre Treno MS Card: €19.50-32.50/day');
  console.log('   Via dell\'Amore: REOPENED Feb 14, 2025 (timed reservation required)');
  console.log('   Village priority: Vernazza > Manarola > Riomaggiore > Monterosso > Corniglia');
  console.log('   Recommendation: Overnight stay to beat crowds (arrive late afternoon, leave next morning)');
  console.log('   June/July: HOT + CROWDED. Go early morning or late afternoon.');

  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
