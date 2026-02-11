/**
 * Seed script: Verona — Full Destination Research Profile
 *
 * Populates all 6 sections for Verona:
 * 1. Description & photo (trip_destinations)
 * 2. Research overview (destination_research)
 * 3. Highlights — restaurants, attractions, activities (destination_highlights)
 * 4. Weather — monthly data (destination_weather_monthly)
 * 5. Accommodations (accommodations)
 * 6. Transport notes (destination_research.transport_notes)
 *
 * Opera 2026 schedule (from arena.it):
 *   Festival runs June 12 – September 12, 2026
 *   June: Aida (Poda) Jun 19, 25 | La Traviata Jun 13, 20, 26 | Nabucco Jun 12, 18, 27
 *   July: Aida (Poda) Jul 2, 10, 19, 24 | La Traviata Jul 3, 9, 17, 23 | La Bohème Jul 4, 11
 *         Aida (Zeffirelli) Jul 30 | Nabucco Jul 5, 18, 25
 *
 * Usage: bun scripts/seed-verona-research.ts
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

const DEST_ID = 'G7ipqq9lgcVnfg0xP3NF4';
const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh';

async function seed() {
  console.log('🏛️ Seeding Verona — Full Destination Research Profile...');

  // ── 1. Update trip_destinations: description + photo ──────────
  await db
    .update(tripDestinations)
    .set({
      description:
        "Shakespeare's city of star-crossed lovers, but Verona is so much more — a UNESCO World Heritage city where a 1st-century Roman amphitheater hosts world-class opera under the stars, medieval piazzas buzz with aperitivo culture, and the nearby Valpolicella hills produce some of Italy's finest wines. Just 45 minutes from Vicenza, it's a perfect day trip or evening excursion for opera night.",
      photoUrl:
        'https://images.unsplash.com/photo-1580391564590-aeca65c5e2d3?w=800&h=500&fit=crop',
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
      region: 'Veneto',
      timezone: 'CET (UTC+1)',
      language: 'Italian',
      currency: 'EUR (€)',
      population: '258,000',
      elevation: '59m (194 ft)',
      bestTimeToVisit: 'Apr-Jun, Sep (opera season Jun-Sep)',
      avgTempHighC: 22,
      avgTempLowC: 10,
      rainyDaysPerMonth: 7,
      weatherNotes:
        'Continental climate with hot summers (30°C+ in July) and cold winters. June-July is ideal for outdoor opera — warm evenings (20-24°C at 9pm), minimal rain. Occasional summer thunderstorms in late afternoon but evenings usually clear.',
      dailyBudgetLow: '55',
      dailyBudgetMid: '120',
      dailyBudgetHigh: '270',
      budgetCurrency: 'USD',
      costNotes:
        'Verona is moderately priced by northern Italian standards. Day trip from Vicenza: €30-60/person (train + food + sights). Opera night adds €65-220/person for tickets. Restaurants near Piazza Brà are pricier — walk 2 blocks for better value. Valpolicella wine tastings €15-30/person.',
      transportNotes:
        'FROM VICENZA: Train is the best option. Regionale: 25-35 min, €4.60-6.50, very frequent (2-3 per hour). No reservation needed — buy at station or Trenitalia app. Frecciarossa also stops but overkill for this distance. By car: 45 min via A4/E70 motorway, toll ~€4. Parking in Verona: Saba Arena (Via Bentegodi 8, €2/hr, book ahead for opera nights), Arsenale (Piazza Arsenale 8), or Cittadella (free-ish, 10 min walk). ZTL (restricted traffic zone) covers the centro storico — do NOT drive in.\n\nLOCAL TRANSPORT: Verona\'s centro storico is entirely walkable (20 min end to end). ATV buses cover the greater area (single ticket €1.30, 90 min validity). Taxis at Piazza Brà and the train station. From Verona Porta Nuova station to Piazza Brà: 15 min walk or bus 11/12/13.\n\nTO VALPOLICELLA: 20-30 min drive northwest. Limited bus service (ATV line 25 to Sant\'Ambrogio). Best by car or organized tour. Wine tasting tours available from Verona centro.',
      nearestAirport: 'VRN (Valerio Catullo Villafranca)',
      safetyRating: 5,
      safetyNotes:
        'Very safe city. Minimal crime risk for tourists. Standard pickpocket awareness around Arena and Juliet\'s balcony during peak season.',
      culturalNotes:
        'Verona is in the Veneto region — cuisine leans northern Italian with polenta, risotto, and hearty meat dishes. Local specialties: pastissada de caval (horse meat stew with polenta — the city\'s signature dish), risotto all\'Amarone, bollito misto, pandoro (Christmas cake, invented here). Wine: Valpolicella, Amarone della Valpolicella (rich, powerful red), Soave (white). Aperitivo culture is strong — spritz with local wines. The city has a Romeo & Juliet obsession but the locals are more proud of the Arena and their food.',
      summary:
        "Verona is a UNESCO World Heritage city where ancient Roman grandeur meets medieval charm and world-class opera. The Arena di Verona — a 1st-century amphitheater seating 15,000 — hosts Italy's most spectacular open-air opera festival every summer. Beyond the Arena, explore Piazza delle Erbe's vibrant market, Castelvecchio's art collection, and the Adige River's elegant bridges. The nearby Valpolicella wine region produces Amarone, one of Italy's greatest reds. Just 30 minutes by train from Vicenza, Verona works perfectly as a day trip or an unforgettable opera evening.",
      travelTips: JSON.stringify([
        'Train from Vicenza is 30 min and €5 — faster and cheaper than driving.',
        'For opera: arrive by 4-5pm to explore the city before the 9:15pm curtain.',
        'Book Arena tickets at arena.it — Gradinata Numerata (~€65) is best value. Bring/rent a cushion for stone seats.',
        'Skip Juliet\'s balcony (overpriced, overcrowded) — the courtyard view is free and that\'s enough.',
        'Castelvecchio museum is Verona\'s hidden gem — world-class art, rarely crowded.',
        'Best aperitivo: Piazza delle Erbe or Liston (the wide sidewalk along Piazza Brà).',
        'For Valpolicella wine tasting, book ahead — many cantinas require appointments.',
        'Pastissada de caval (horse meat stew) is the local dish — try it at Trattoria al Pompiere or Osteria al Duca.',
        'Verona Card (€20/24h or €25/48h) covers Arena entry, churches, Castelvecchio, and bus rides.',
        'Post-opera: walk along the Adige river and through illuminated streets — magical at midnight.',
      ]),
    })
    .where(eq(destinationResearch.destinationId, DEST_ID));
  console.log('  ✅ destination_research updated');

  // ── 3. Delete existing minimal highlights and re-seed ─────────
  await db
    .delete(destinationHighlights)
    .where(eq(destinationHighlights.destinationId, DEST_ID));

  const highlights = [
    {
      title: 'Arena di Verona',
      description:
        'Magnificent 1st-century Roman amphitheater, third largest in Italy. Seats 15,000 for the annual Opera Festival (Jun-Sep). Even without opera, the Arena is awe-inspiring — €10 entry, climb the stone tiers for city views. During opera season, performances start at 21:15 under the stars.',
      category: 'cultural',
      rating: 4.9,
      priceLevel: 2,
      duration: '1-3 hours',
      address: 'Piazza Brà 1, 37121 Verona',
      websiteUrl: 'https://www.arena.it',
      imageUrl:
        'https://images.unsplash.com/photo-1580391564590-aeca65c5e2d3?w=600&h=400&fit=crop',
    },
    {
      title: 'Piazza delle Erbe',
      description:
        "Verona's oldest square, built on the ancient Roman forum. Surrounded by frescoed medieval palazzi, the Torre dei Lamberti (84m, climbable — €8), and a daily market selling produce, souvenirs, and local products. Best for morning market browsing or evening aperitivo.",
      category: 'attraction',
      rating: 4.6,
      priceLevel: 1,
      duration: '1-2 hours',
      imageUrl:
        'https://images.unsplash.com/photo-1598977123118-4e30ba3c4f5b?w=600&h=400&fit=crop',
    },
    {
      title: 'Castelvecchio & Ponte Scaligero',
      description:
        "14th-century fortified castle on the Adige River, now housing Verona's premier art museum. Masterfully restored by architect Carlo Scarpa. Collection includes Pisanello, Bellini, Mantegna, Tintoretto, and Veronese. The adjacent Ponte Scaligero (fortified bridge) is stunning. Verona's best museum — rarely crowded.",
      category: 'cultural',
      rating: 4.7,
      priceLevel: 2,
      duration: '1.5-2 hours',
      address: 'Corso Castelvecchio 2, 37121 Verona',
    },
    {
      title: "Juliet's Balcony (Casa di Giulietta)",
      description:
        "Tourist magnet at Via Cappello 23. The 14th-century house has a bronze Juliet statue and the famous balcony. Courtyard is free (and packed); museum entry €6. Honestly, it's a 2-minute photo op — see it, smile, move on. More atmospheric at night during a post-opera stroll when the crowds are gone.",
      category: 'attraction',
      rating: 3.8,
      priceLevel: 1,
      duration: '15-30 min',
      address: 'Via Cappello 23, 37121 Verona',
    },
    {
      title: 'Basilica di San Zeno Maggiore',
      description:
        "Romanesque masterpiece and Verona's most beautiful church. 12th-century bronze door panels, Mantegna's altarpiece, stunning cloister. Where Romeo and Juliet were supposedly married. Less touristy than central sites. €3 entry or free with Verona Card.",
      category: 'cultural',
      rating: 4.6,
      priceLevel: 1,
      duration: '45 min',
    },
    {
      title: 'Piazzale Castel San Pietro (Viewpoint)',
      description:
        "Cross the Ponte Pietra (Roman bridge) and climb the stairs to this hilltop terrace for the best panoramic view of Verona — terracotta rooftops, the Adige river bend, the Arena, and the Alps beyond. Free. Best at golden hour. There's a bar at the top for sunset drinks.",
      category: 'nature',
      rating: 4.7,
      priceLevel: 1,
      duration: '30-60 min',
    },
    {
      title: 'Trattoria al Pompiere',
      description:
        "Verona's most beloved trattoria since 1907. Green checkered tablecloths, stunning salumi/cheese counter carved to order, and deeply traditional Veronese cuisine. Try: pastissada de caval (horse stew with polenta), white ragù with game meats, tiramisù. Mains €14-22. Reserve ahead.",
      category: 'food',
      rating: 4.8,
      priceLevel: 2,
      duration: 'Lunch/Dinner',
      address: "Vicolo Regina d'Ungheria 5, 37121 Verona",
      websiteUrl: 'https://www.trattorialpompiere.it',
    },
    {
      title: 'Osteria al Duca',
      description:
        "No-frills Veronese osteria in a 13th-century building linked to Romeo's family. Set menus ~€26 (primo + secondo). Specialties: pastissada de caval, braised donkey, penne with radicchio and Gorgonzola. Pair with Valpolicella Ripasso. Authentic, honest, incredible value.",
      category: 'food',
      rating: 4.6,
      priceLevel: 1,
      duration: 'Lunch/Dinner',
      address: 'Via Arche Scaligere 2, 37121 Verona',
    },
    {
      title: 'Osteria del Bugiardo',
      description:
        'Wine bar and osteria near Piazza delle Erbe. Excellent local wines by the glass (Valpolicella, Amarone, Soave) with cicchetti (Venetian small plates). Perfect for aperitivo or a light dinner before opera. Try the Amarone risotto croquettes. Casual, buzzy atmosphere.',
      category: 'food',
      rating: 4.5,
      priceLevel: 2,
      duration: 'Aperitivo/Dinner',
      address: 'Corso Porta Borsari 17/a, 37121 Verona',
    },
    {
      title: 'Casa Perbellini 12 Apostoli',
      description:
        "Verona's fine dining star — chef Giancarlo Perbellini's restaurant in the historic 12 Apostoli building. Frescoed ceilings, creative reinterpretations of Veronese classics. Tasting menus from €120. For a special occasion. 2 Michelin stars.",
      category: 'food',
      rating: 4.9,
      priceLevel: 4,
      duration: 'Dinner',
      address: 'Corticella San Marco 3, 37121 Verona',
      websiteUrl: 'https://www.casaperbellini.com',
    },
    {
      title: 'Ristorante Liston',
      description:
        "Right on Piazza Brà with Arena views — ideal pre-opera dinner spot. Yes, it's touristy, but the location is unbeatable and the food is solid. Stick to simple pastas and grilled meats. Slightly pricier than off-piazza options but you're paying for the view.",
      category: 'food',
      rating: 4.2,
      priceLevel: 3,
      duration: 'Dinner',
      address: 'Via Dietro Liston 19, 37121 Verona',
    },
    {
      title: 'Valpolicella Wine Tasting',
      description:
        "20-30 min drive northwest of Verona into rolling hills producing Valpolicella, Ripasso, and the legendary Amarone (rich, dried-grape red, €40-100+/bottle). Top cantinas: Allegrini, Bertani, Tommasi, Zenato. Book ahead — most require appointments. Half-day trip pairs well with lunch in Sant'Ambrogio or Fumane. Some offer tours + tasting from €15-30/person.",
      category: 'activity',
      rating: 4.8,
      priceLevel: 2,
      duration: 'Half day',
    },
    {
      title: 'Arena di Verona Opera Festival 2026',
      description:
        'Festival runs June 12 – September 12, 2026. June/July highlights: Aida (Poda) Jun 19, 25, Jul 2, 10, 19, 24 | La Traviata Jun 13, 20, 26, Jul 3, 9, 17, 23 | Nabucco Jun 12, 18, 27, Jul 5, 18, 25 | La Bohème Jul 4, 11. July 10 = Aida, our trip finale! Tickets: Gradinata ~€30, Numerata ~€65, Poltronissima ~€150-220, Gold ~€280. Book at arena.it.',
      category: 'activity',
      rating: 5.0,
      priceLevel: 3,
      duration: '4-5 hours (including pre-show)',
      websiteUrl: 'https://www.arena.it/en/arena-verona-opera-festival/',
    },
    {
      title: 'Aperitivo on the Liston',
      description:
        "The Liston is the wide marble-paved sidewalk along Piazza Brà — Verona's prime passeggiata and aperitivo spot. Order a spritz (Aperol or Campari) and people-watch with the Arena as backdrop. This is the Italian evening ritual at its finest. Most bars along here charge €6-10 for drinks.",
      category: 'nightlife',
      rating: 4.5,
      priceLevel: 2,
      duration: '1-2 hours',
    },
    {
      title: 'Walk Along the Adige River',
      description:
        'The Adige river curves through Verona creating beautiful vistas. Walk from Ponte Pietra (Roman, 1st century BC) to Ponte Scaligero (medieval). Especially magical at night when bridges and buildings are illuminated. Free, no crowds, pure Verona atmosphere.',
      category: 'activity',
      rating: 4.4,
      priceLevel: 1,
      duration: '30-60 min',
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

  // ── 4. Weather (delete existing, re-insert) ──────────────────
  await db
    .delete(destinationWeatherMonthly)
    .where(eq(destinationWeatherMonthly.destinationId, DEST_ID));

  const weather = [
    { month: 1, avgHighC: 6, avgLowC: -1, rainyDays: 6, sunshineHours: 3 },
    { month: 2, avgHighC: 9, avgLowC: 0, rainyDays: 5, sunshineHours: 4 },
    { month: 3, avgHighC: 14, avgLowC: 4, rainyDays: 6, sunshineHours: 5 },
    { month: 4, avgHighC: 18, avgLowC: 8, rainyDays: 8, sunshineHours: 6 },
    { month: 5, avgHighC: 23, avgLowC: 13, rainyDays: 9, sunshineHours: 8 },
    { month: 6, avgHighC: 27, avgLowC: 17, rainyDays: 7, sunshineHours: 9 },
    { month: 7, avgHighC: 30, avgLowC: 19, rainyDays: 5, sunshineHours: 10 },
    { month: 8, avgHighC: 29, avgLowC: 19, rainyDays: 6, sunshineHours: 9 },
    { month: 9, avgHighC: 25, avgLowC: 15, rainyDays: 5, sunshineHours: 7 },
    { month: 10, avgHighC: 18, avgLowC: 10, rainyDays: 7, sunshineHours: 5 },
    { month: 11, avgHighC: 12, avgLowC: 4, rainyDays: 7, sunshineHours: 3 },
    { month: 12, avgHighC: 7, avgLowC: 0, rainyDays: 6, sunshineHours: 3 },
  ];

  for (const w of weather) {
    await db.insert(destinationWeatherMonthly).values({
      destinationId: DEST_ID,
      ...w,
    });
  }
  console.log(`  ✅ ${weather.length} months of weather data added`);

  // ── 5. Accommodations ─────────────────────────────────────────
  const accomms = [
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'Hotel Milano & Spa',
      type: 'hotel' as const,
      status: 'researched' as const,
      address: 'Vicolo Tre Marchetti 11, 37121 Verona',
      costPerNight: '130.00',
      currency: 'EUR',
      rating: 4.5,
      bookingUrl: 'https://www.booking.com/hotel/it/milano-amp-spa.html',
      notes:
        '4-star, 5 min walk to Arena. Spa, rooftop terrace. Good mid-range option if staying overnight for opera. Breakfast included.',
    },
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'Hotel Giulietta e Romeo',
      type: 'hotel' as const,
      status: 'researched' as const,
      address: 'Vicolo Tre Marchetti 3, 37121 Verona',
      costPerNight: '160.00',
      currency: 'EUR',
      rating: 4.4,
      bookingUrl: 'https://www.booking.com/hotel/it/giuliettaeromeo.html',
      notes:
        "4-star boutique hotel steps from Arena. Modern rooms, great location. Book early for opera season — prices jump 30-50%.",
    },
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'Hotel Accademia',
      type: 'hotel' as const,
      status: 'researched' as const,
      address: 'Via Scala 12, 37121 Verona',
      costPerNight: '110.00',
      currency: 'EUR',
      rating: 4.3,
      bookingUrl: 'https://www.booking.com/hotel/it/accademiavr.html',
      notes:
        'Solid 4-star in historic center near Piazza dei Signori. Good value for location. If staying overnight after opera instead of driving back to Vicenza.',
    },
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'B&B Le Stanze di Giulietta',
      type: 'airbnb' as const,
      status: 'researched' as const,
      address: 'Centro Storico, Verona',
      costPerNight: '85.00',
      currency: 'EUR',
      rating: 4.6,
      notes:
        'Charming B&B in the old town. Budget-friendly option with character. Private rooms with shared and private bath options.',
    },
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'Corte delle Pigne (Airbnb)',
      type: 'airbnb' as const,
      status: 'researched' as const,
      address: 'Via Pigna, Verona Centro',
      costPerNight: '95.00',
      currency: 'EUR',
      rating: 4.7,
      notes:
        "Self-catering apartment in a historic courtyard. Kitchen, AC. 8 min walk to Arena. NOTE: Verona overnight is optional — only 30 min back to Vicenza by train, but after late opera (ends ~midnight), staying over avoids the last-train scramble.",
    },
  ];

  for (const a of accomms) {
    await db.insert(accommodations).values(a);
  }
  console.log(`  ✅ ${accomms.length} accommodations added`);

  console.log('\n🏛️ Verona research profile complete!');
  console.log('  ✅ All 6 sections populated → fully_researched');

  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
