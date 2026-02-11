/**
 * Seed Trieste — Complete Destination Profile
 * Border city with Austrian/Slovenian influence, coffee culture capital
 * Usage: bun run scripts/seed-trieste-complete.ts
 */
import postgres from 'postgres';
import { nanoid } from 'nanoid';

const CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const sql = postgres(CONNECTION_STRING);

const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh';
const DEST_ID = 'zZsX-xoLPgJ7DmJCPARKa';
// Duplicate entry to clean up
const DUPE_ID = 'kX06G2G4YzngYRZobDLqD';

async function seed() {
  console.log('☕ Seeding Trieste — Complete Destination Profile...\n');

  // ── 0. Clean up duplicate Trieste entry ──
  // Delete dependent data for duplicate first
  await sql`DELETE FROM destination_highlights WHERE destination_id = ${DUPE_ID}`;
  await sql`DELETE FROM destination_weather_monthly WHERE destination_id = ${DUPE_ID}`;
  await sql`DELETE FROM destination_research WHERE destination_id = ${DUPE_ID}`;
  await sql`DELETE FROM accommodations WHERE destination_id = ${DUPE_ID}`;
  await sql`DELETE FROM trip_destinations WHERE id = ${DUPE_ID}`;
  console.log('  🗑️  Removed duplicate Trieste entry');

  // ── 1. Update trip_destinations (description, photoUrl, status) ──
  await sql`
    UPDATE trip_destinations SET
      description = ${
        'Where Italy, Austria, and Slovenia collide on the Adriatic — Trieste is a magnificent misfit of a city. ' +
        'Once the principal port of the Habsburg Empire, its grand Viennese architecture frames the largest sea-facing piazza in Europe (Piazza Unità d\'Italia). ' +
        'The coffee culture here rivals Vienna: Trieste imports more coffee than any other Mediterranean port and its historic cafés (Caffè San Marco, Caffè Tommaseo) ' +
        'were once the salons of James Joyce, Italo Svevo, and Umberto Saba. Perched between limestone karst hills and the sparkling Adriatic, ' +
        'the fairy-tale Miramare Castle juts into the sea while the Carso plateau above hides some of Europe\'s largest caves and produces extraordinary wines. ' +
        'The cuisine is a glorious collision: Viennese schnitzel meets Slovenian štruklji meets Italian seafood risotto. ' +
        'Trieste feels like nowhere else in Italy — less touristy, more intellectual, with an end-of-the-world melancholy that gets under your skin.'
      },
      photo_url = ${'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80'},
      status = 'researched',
      research_status = 'fully_researched'
    WHERE id = ${DEST_ID}
  `;
  console.log('  ✓ Updated description, photo, status');

  // ── 2. Destination Research ──
  await sql`DELETE FROM destination_research WHERE destination_id = ${DEST_ID}`;

  await sql`INSERT INTO destination_research (
    id, destination_id, country, region, timezone, language, local_currency,
    population, best_time_to_visit, avg_temp_high_c, avg_temp_low_c,
    rainy_days_per_month, weather_notes, daily_budget_low, daily_budget_mid,
    daily_budget_high, budget_currency, transport_notes, nearest_airport,
    safety_rating, safety_notes, cultural_notes, summary, travel_tips
  ) VALUES (
    ${nanoid()}, ${DEST_ID}, 'Italy', 'Friuli Venezia Giulia',
    'Europe/Rome (CET/CEST)', 'Italian (Slovenian widely spoken near border)',
    'EUR', '~205,000',
    'April–June and September–October for ideal weather. Summer is warm but pleasant with sea breezes. Winter can be cold with the fierce Bora wind.',
    ${20}, ${10}, ${8},
    ${
      'Mediterranean climate moderated by karst winds. The Bora (bora) is Trieste\'s famous northeast wind — can reach 150+ km/h in winter, ' +
      'literally blowing people off their feet (ropes are installed along some streets). Summers warm (Jul avg high 28°C) but sea breezes help. ' +
      'Winters mild for latitude but the Bora makes it feel colder. Rain peaks Oct-Nov.'
    },
    ${30}, ${70}, ${140}, 'EUR',
    ${
      'FROM VICENZA BY TRAIN: Direct Regionale trains run Vicenza → Trieste Centrale, ~2hr 10-40min depending on service, €10-15 each way. ' +
      'Frecciarossa/Frecciargento high-speed: ~1hr 30min, €20-35. Multiple departures daily. Trieste Centrale is a 15-min walk from Piazza Unità. ' +
      'BY CAR: ~200km via A4 autostrada, ~2hr. Tolls ~€12 each way. Parking: Parcheggio Foro Ulpiano (central, €1.50/hr) or free at Campo Marzio area. ' +
      'DAY TRIP FEASIBILITY: Possible but tight. With an early train (~7:30 AM), arrive by 10 AM, have 7-8 hours before catching a ~6 PM return. ' +
      'Better as an overnight to enjoy evening passeggiata and the illuminated piazza. If combining with Škocjan Caves (40min drive south into Slovenia), ' +
      'definitely need a car and consider an overnight. ' +
      'LOCAL TRANSPORT: Compact historic center is very walkable. Bus #36 to Miramare Castle (20 min, €1.35). ' +
      'Trieste Airport (TRS) is 33km north — mostly Ryanair.'
    },
    'Trieste Airport (TRS) — Ryanair hub, 33km north. Venice Marco Polo (VCE) — 1hr 45min by car.',
    ${5},
    'Very safe city. Low crime. The Bora wind is the main "danger" — seriously, it can knock you over in winter.',
    ${
      'Trieste has a unique identity — locals consider themselves Triestini first, Italian second. Strong Central European influence from centuries under Habsburg rule. ' +
      'Coffee culture is serious: order "un nero" (not "un caffè") for an espresso. Each coffee type has a specific Triestine name different from the rest of Italy. ' +
      'Slovenian minority is significant — bilingual signs in many areas. The city was heavily contested after WWII (Free Territory of Trieste 1947-1954). ' +
      'James Joyce lived here 1904-1920 and wrote most of Ulysses. Literary heritage is a point of pride.'
    },
    ${
      'Habsburg jewel on the Adriatic where Italian, Austrian, and Slovenian cultures blend seamlessly. Europe\'s largest sea-facing piazza, ' +
      'world-class coffee culture, fairy-tale Miramare Castle, and the wild Carso wine region — all without the tourist crowds.'
    },
    ${JSON.stringify([
      'Coffee vocabulary: "nero" = espresso, "capo" = macchiato, "capo in B" = macchiato in glass. Learn the local terms!',
      'The Bora wind can be extreme in winter — check forecasts and hold onto railings on exposed seafront.',
      'Miramare Castle: book tickets online to skip queues. Go early morning for best light and fewer crowds.',
      'Osmize (osmice): seasonal farm-taverns in the Carso serving house wine and cold cuts. Open only when a branch (frasca) hangs outside. Cash only, incredible value.',
      'Cross into Slovenia easily — Škocjan Caves (UNESCO) are just 30min across the border. No border controls (Schengen).',
      'Try jota (bean and sauerkraut soup), goulash, and strudel — the Austrian influence is real and delicious.',
      'Barcola beach is where locals swim — free, rocky, packed in summer. Get there by bus or a 20-min walk along the seafront.',
      'Sunday morning: passeggiata along the Molo Audace pier is a Triestine tradition.',
    ])}
  )`;
  console.log('  ✓ Destination research (transport, budget, tips)');

  // ── 3. Highlights — Attractions, Restaurants, Activities ──
  await sql`DELETE FROM destination_highlights WHERE destination_id = ${DEST_ID}`;

  const highlights = [
    // ATTRACTIONS
    {
      title: "Piazza Unità d'Italia",
      description:
        "Europe's largest sea-facing square — a magnificent rectangle of Habsburg palaces open to the Adriatic on one side. " +
        "The Palazzo del Municipio, Palazzo del Governo, and Palazzo del Lloyd Triestino frame the space with ornate facades. " +
        "Spectacular at sunset and when illuminated at night. The heart of Trieste's social life — aperitivo here is non-negotiable.",
      category: 'attraction', rating: 4.9, price_level: 1,
      address: "Piazza Unità d'Italia, 34121 Trieste",
      duration: '30-60 min', order_index: 0,
    },
    {
      title: 'Miramare Castle (Castello di Miramare)',
      description:
        'Fairy-tale white castle perched on a rocky promontory 7km north of town, built 1856-1860 for Archduke Maximilian of Habsburg ' +
        '(later ill-fated Emperor of Mexico). Lavish interiors preserved as they were, surrounded by 22 hectares of parkland with exotic species. ' +
        'The park is free; castle museum €10. One of Italy\'s most visited castles. Bus #36 from city center (20 min). Go early morning.',
      category: 'attraction', rating: 4.8, price_level: 2,
      address: 'Viale Miramare, 34151 Trieste',
      website_url: 'https://www.castello-miramare.it',
      duration: '2-3 hours (castle + park)', order_index: 1,
    },
    {
      title: 'Caffè San Marco',
      description:
        'Trieste\'s most famous literary café, opened 1914. A cathedral of coffee culture with ornate Art Nouveau interiors, ' +
        'wooden bookshelves, and the ghost of every writer who ever brooded here. James Joyce, Italo Svevo, and Umberto Saba were regulars. ' +
        'Still functions as a café and bookshop. Order a "capo in B" (macchiato in glass) and sink into history.',
      category: 'attraction', rating: 4.7, price_level: 2,
      address: 'Via Cesare Battisti, 18, 34125 Trieste',
      duration: '30-60 min', order_index: 2,
    },
    {
      title: 'Caffè Tommaseo',
      description:
        'The oldest café in Trieste (1830) and one of the oldest in Italy. Elegant Habsburg-era interior. ' +
        'Where the literary and political elite plotted Italian unification over coffee. Still serves excellent pastries with Viennese flair.',
      category: 'attraction', rating: 4.5, price_level: 2,
      address: 'Riva 3 Novembre, 5, 34132 Trieste',
      duration: '30 min', order_index: 3,
    },
    {
      title: 'Cattedrale di San Giusto',
      description:
        'Romanesque cathedral on the hilltop citadel with stunning Byzantine-style mosaics and panoramic views over the city and gulf. ' +
        'The adjacent Castello di San Giusto (fortress) has a weapons museum and the best viewpoint in Trieste. Free cathedral; castle €6.',
      category: 'attraction', rating: 4.5, price_level: 1,
      address: 'Piazza della Cattedrale, 2, 34121 Trieste',
      duration: '1 hour', order_index: 4,
    },
    {
      title: 'Molo Audace',
      description:
        '246m pier stretching into the Gulf of Trieste from Piazza Unità. Named after the first Italian ship to dock here in 1918. ' +
        'The Sunday morning passeggiata (stroll) along the Molo is a Triestine tradition. Stunning sunset views.',
      category: 'attraction', rating: 4.6, price_level: 1,
      address: 'Molo Audace, 34121 Trieste',
      duration: '20-30 min', order_index: 5,
    },
    {
      title: 'Canal Grande & Serbian Orthodox Church',
      description:
        'A navigable canal cutting into the city center, lined with neoclassical buildings. The blue-domed Serbian Orthodox Church of the Holy Trinity ' +
        'and its ornate interior are a highlight. Ponte Rosso at the canal head has a James Joyce statue (he lived nearby).',
      category: 'attraction', rating: 4.3, price_level: 1,
      address: 'Canal Grande, 34121 Trieste',
      duration: '30 min', order_index: 6,
    },
    {
      title: 'Risiera di San Sabba',
      description:
        'The only Nazi concentration camp with a crematorium on Italian soil. Now a powerful memorial and museum. ' +
        'Sobering but important — Trieste\'s complex WWII history (Italian, German, Yugoslav claims) is essential context. Free entry.',
      category: 'attraction', rating: 4.4, price_level: 1,
      address: 'Via Giovanni Palatucci, 5, 34148 Trieste',
      duration: '1 hour', order_index: 7,
    },
    // ACTIVITIES
    {
      title: 'Škocjan Caves Day Trip (Slovenia)',
      description:
        'UNESCO World Heritage caves just 30min across the Slovenian border (no passport control — Schengen). ' +
        'Enormous underground canyon with the Reka river, stalactites, and a vertigo-inducing walkway 45m above the river. ' +
        'More dramatic than the better-known Postojna Caves. Guided tours only, ~1.5hr, €28. Book ahead in summer. Requires a car.',
      category: 'activity', rating: 4.9, price_level: 2,
      address: 'Škocjan 2, 6215 Divača, Slovenia',
      website_url: 'https://www.park-skocjanske-jame.si',
      duration: '3-4 hours (incl. drive)', order_index: 8,
    },
    {
      title: 'Carso Wine Region & Osmize',
      description:
        'The Carso (Karst) plateau above Trieste produces unique wines: Terrano (robust red from iron-rich red soil) and Vitovska (mineral white). ' +
        'Osmize are seasonal farm-taverns that open when a branch (frasca) hangs outside — serving house wine, prosciutto, cheese, and pickled vegetables. ' +
        'Cash only, extraordinary value (€10-15 for wine and food). A deeply local experience. Check osmize.com for current openings.',
      category: 'activity', rating: 4.7, price_level: 1,
      address: 'Carso Plateau, above Trieste',
      duration: '2-3 hours', order_index: 9,
    },
    {
      title: 'Barcola Beach & Seafront Walk',
      description:
        'Trieste\'s main beach strip — rocky but beloved by locals. Free access, packed in summer. The 3km seafront walk from Barcola ' +
        'to Miramare Castle is gorgeous. Combine beach time with a castle visit.',
      category: 'activity', rating: 4.2, price_level: 1,
      address: 'Viale Miramare, Barcola, Trieste',
      duration: '2-3 hours', order_index: 10,
    },
    // RESTAURANTS
    {
      title: 'Buffet da Pepi',
      description:
        'Trieste institution since 1897. A "buffet" in Triestine dialect is a pork-centric tavern — boiled meats, sausages, sauerkraut, ' +
        'mustard, horseradish. Pure Habsburg comfort food. Stand at the counter or grab a table. €€. Don\'t leave Trieste without eating here.',
      category: 'food', rating: 4.7, price_level: 2,
      address: 'Via della Cassa di Risparmio, 3, 34121 Trieste',
      duration: '45 min - 1 hour', order_index: 11,
    },
    {
      title: 'Hostaria Malcanton',
      description:
        'Cozy trattoria in the old town serving refined Triestine cuisine. Excellent jota (bean/sauerkraut soup), seafood risotto, ' +
        'and creative takes on local classics. Great wine list featuring Carso producers. €€-€€€.',
      category: 'food', rating: 4.6, price_level: 3,
      address: 'Via Malcanton, 7, 34121 Trieste',
      duration: '1-1.5 hours', order_index: 12,
    },
    {
      title: 'Chimera di Bacco',
      description:
        'Wine bar and restaurant with an exceptional selection of Friuli and Carso wines. Small plates, cured meats, and seasonal dishes. ' +
        'Intimate atmosphere, knowledgeable staff. Perfect for a Carso wine education. €€.',
      category: 'food', rating: 4.5, price_level: 2,
      address: 'Via del Teatro, 1, 34121 Trieste',
      duration: '1 hour', order_index: 13,
    },
    {
      title: 'Ristorante Baracca E Burattini',
      description:
        'Hidden gem in a local neighborhood between the station and canal. Menu changes daily (printed on a shared sheet of paper), ' +
        'based on what\'s fresh. Italian dishes with Slovenian influences. Lunch only on weekdays — book ahead, always full. €€.',
      category: 'food', rating: 4.7, price_level: 2,
      address: 'Via Cadorna, 12, 34124 Trieste',
      duration: '1-1.5 hours', order_index: 14,
    },
    {
      title: 'Trattoria da Giovanni',
      description:
        'Classic Triestine trattoria with generous portions of seafood. Try the spaghetti with scampi or the mixed fried fish. ' +
        'No-frills, honest cooking at fair prices. €€.',
      category: 'food', rating: 4.4, price_level: 2,
      address: 'Via San Lazzaro, 14, 34122 Trieste',
      duration: '1 hour', order_index: 15,
    },
    {
      title: 'Gostilna Ruj (Slovenian cuisine)',
      description:
        'A Michelin-listed restaurant celebrating Slovenian-Triestine cuisine on the Carso plateau. ' +
        'Štruklji (rolled dumplings), game, foraged herbs, and extraordinary Carso wines. Worth the drive up the hill. €€€.',
      category: 'food', rating: 4.6, price_level: 3,
      address: 'Localita Rupingrande, 76, 34011 Duino-Aurisina',
      website_url: 'https://www.gostilnaruj.it',
      duration: '1.5-2 hours', order_index: 16,
    },
    // FOOD SPECIALTIES
    {
      title: 'Triestine Coffee Culture',
      description:
        'Trieste is Italy\'s coffee capital — the port handles 40% of Italy\'s coffee imports. Illy was founded here. ' +
        'The vocabulary is unique: "nero" (espresso), "capo" (macchiato), "capo in B" (macchiato in glass), "gocciato" (with a drop of milk). ' +
        'Must-visit cafés: Caffè San Marco, Caffè Tommaseo, Caffè degli Specchi (on Piazza Unità). A genuine cultural experience.',
      category: 'food', rating: 4.8, price_level: 1,
      order_index: 17,
    },
    {
      title: 'Triestine "Buffet" Tradition',
      description:
        'Not a buffet as you know it — in Trieste, a "buffet" is a type of pork tavern inherited from Austrian rule. ' +
        'Boiled pork, frankfurters, sauerkraut, goulash, mustard, and horseradish. Washed down with a glass of Terrano. ' +
        'Key spots: Buffet da Pepi (est. 1897), Buffet da Rudy, Buffet Marascutti.',
      category: 'food', rating: 4.6, price_level: 1,
      order_index: 18,
    },
  ];

  for (const h of highlights) {
    await sql`INSERT INTO destination_highlights (
      id, destination_id, title, description, category, rating, price_level,
      address, website_url, duration, order_index
    ) VALUES (
      ${nanoid()}, ${DEST_ID}, ${h.title}, ${h.description}, ${h.category},
      ${h.rating}, ${h.price_level}, ${h.address || null}, ${h.website_url || null},
      ${h.duration || null}, ${h.order_index}
    )`;
    console.log(`  🌟 Highlight: ${h.title}`);
  }

  // ── 4. Weather — Monthly data ──
  await sql`DELETE FROM destination_weather_monthly WHERE destination_id = ${DEST_ID}`;

  const weatherData = [
    { month: 1,  avg_high_c: 7.0,  avg_low_c: 2.0,  rainy_days: 6,  sunshine_hours: 3.5 },
    { month: 2,  avg_high_c: 9.0,  avg_low_c: 3.0,  rainy_days: 6,  sunshine_hours: 4.5 },
    { month: 3,  avg_high_c: 13.0, avg_low_c: 6.0,  rainy_days: 7,  sunshine_hours: 5.5 },
    { month: 4,  avg_high_c: 17.0, avg_low_c: 9.5,  rainy_days: 9,  sunshine_hours: 6.5 },
    { month: 5,  avg_high_c: 22.0, avg_low_c: 14.0, rainy_days: 9,  sunshine_hours: 8.0 },
    { month: 6,  avg_high_c: 26.0, avg_low_c: 17.5, rainy_days: 9,  sunshine_hours: 9.0 },
    { month: 7,  avg_high_c: 28.5, avg_low_c: 20.0, rainy_days: 6,  sunshine_hours: 9.5 },
    { month: 8,  avg_high_c: 28.0, avg_low_c: 19.5, rainy_days: 7,  sunshine_hours: 8.5 },
    { month: 9,  avg_high_c: 24.0, avg_low_c: 16.0, rainy_days: 7,  sunshine_hours: 7.0 },
    { month: 10, avg_high_c: 18.5, avg_low_c: 12.0, rainy_days: 9,  sunshine_hours: 5.0 },
    { month: 11, avg_high_c: 12.5, avg_low_c: 7.0,  rainy_days: 9,  sunshine_hours: 3.5 },
    { month: 12, avg_high_c: 8.0,  avg_low_c: 3.5,  rainy_days: 7,  sunshine_hours: 3.0 },
  ];

  for (const w of weatherData) {
    await sql`INSERT INTO destination_weather_monthly (
      id, destination_id, month, avg_high_c, avg_low_c, rainy_days, sunshine_hours
    ) VALUES (
      ${nanoid()}, ${DEST_ID}, ${w.month}, ${w.avg_high_c}, ${w.avg_low_c},
      ${w.rainy_days}, ${w.sunshine_hours}
    )`;
  }
  console.log('  🌤️ Weather: 12 months inserted');

  // ── 5. Accommodations ──
  await sql`DELETE FROM accommodations WHERE destination_id = ${DEST_ID}`;

  const accommodations = [
    {
      name: 'Savoia Excelsior Palace (by Starhotels)',
      type: 'hotel', status: 'researched',
      address: 'Riva del Mandracchio, 4, 34124 Trieste',
      cost_per_night: 160, total_cost: 160, currency: 'EUR',
      booking_url: 'https://www.starhotels.com/en/our-hotels/savoia-excelsior-palace-trieste/',
      rating: 4.5,
      notes: 'Grand seafront hotel directly on Piazza Unità. Historic 1911 building, recently renovated. The location alone is worth it.',
    },
    {
      name: 'Hotel Città di Trieste',
      type: 'hotel', status: 'researched',
      address: 'Corso Cavour, 7, 34132 Trieste',
      cost_per_night: 95, total_cost: 95, currency: 'EUR',
      booking_url: 'https://www.hotelcittaditrieste.it',
      rating: 4.2,
      notes: 'Solid mid-range option near the Canal Grande. Clean, modern rooms.',
    },
    {
      name: 'Urbanauts Studios Cavana',
      type: 'airbnb', status: 'researched',
      address: 'Cavana neighborhood, 34121 Trieste',
      cost_per_night: 80, total_cost: 80, currency: 'EUR',
      booking_url: 'https://www.booking.com/hotel/it/urbanauts-studios-cavana.html',
      rating: 4.4,
      notes: 'Trendy studio apartments in Cavana — the bar/restaurant district. Great for self-catering. Highly recommended by expats.',
    },
    {
      name: 'B&B Molo 119',
      type: 'airbnb', status: 'researched',
      address: 'Riva Grumula, 34123 Trieste',
      cost_per_night: 65, total_cost: 65, currency: 'EUR',
      rating: 4.3,
      notes: 'Budget-friendly B&B near the seafront. Simple, clean, with breakfast included.',
    },
    {
      name: 'NH Trieste',
      type: 'hotel', status: 'researched',
      address: 'Corso Cavour, 7, 34132 Trieste',
      cost_per_night: 110, total_cost: 110, currency: 'EUR',
      booking_url: 'https://www.nh-hotels.com/hotel/nh-trieste',
      rating: 4.1,
      notes: 'Reliable chain hotel, central location. Good for a quick overnight.',
    },
  ];

  for (const a of accommodations) {
    await sql`INSERT INTO accommodations (
      id, trip_id, destination_id, name, type, status, address,
      cost_per_night, total_cost, currency, booking_url, rating, notes
    ) VALUES (
      ${nanoid()}, ${TRIP_ID}, ${DEST_ID}, ${a.name}, ${a.type}, ${a.status},
      ${a.address}, ${a.cost_per_night}, ${a.total_cost}, ${a.currency},
      ${a.booking_url || null}, ${a.rating || null}, ${a.notes || null}
    )`;
    console.log(`  🏨 Accommodation: ${a.name} (€${a.cost_per_night}/night)`);
  }

  console.log('\n✅ Trieste fully seeded!');
  console.log('\n📋 Summary:');
  console.log('   ✓ Description updated');
  console.log('   ✓ 19 highlights (attractions, restaurants, activities, food)');
  console.log('   ✓ 12 months weather data');
  console.log('   ✓ 5 accommodation options (€65-160/night)');
  console.log('   ✓ Transport notes (2hr train from Vicenza, day trip feasibility)');
  console.log('   ✓ Photo URL set');
  console.log('   ✓ Research status: fully_researched');
  console.log('   ✓ Duplicate Trieste entry cleaned up');

  await sql.end();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
