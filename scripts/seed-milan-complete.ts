/**
 * Seed Milan — Complete Destination Profile
 * Fashion & design capital, Duomo, Last Supper, Navigli
 * Usage: bun run scripts/seed-milan-complete.ts
 */
import postgres from 'postgres';
import { nanoid } from 'nanoid';

const CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const sql = postgres(CONNECTION_STRING);

const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh';
const DEST_ID = 'wu1wfo9QDRQlg7dyIDTWS';

async function seed() {
  console.log('🏛️ Seeding Milan — Complete Destination Profile...\n');

  // ── 1. Update trip_destinations (description, photoUrl, status) ──
  await sql`
    UPDATE trip_destinations SET
      description = ${
        'Italy\'s undisputed capital of fashion, design, and contemporary cool — Milan is a city that moves fast and looks good doing it. ' +
        'The Gothic marvel of the Duomo, with its rooftop forest of spires, anchors a city that seamlessly blends centuries of art and architecture ' +
        'with cutting-edge style. Leonardo da Vinci\'s Last Supper hides in a convent refectory, the Galleria Vittorio Emanuele II is the world\'s ' +
        'oldest (and most elegant) shopping mall, and the Navigli canal district comes alive at aperitivo hour. ' +
        'Beyond the fashion week headlines, Milan rewards with world-class museums (Pinacoteca di Brera, Fondazione Prada), ' +
        'a food scene that rivals any Italian city (risotto alla milanese, cotoletta, panettone), and an energy that\'s distinctly cosmopolitan. ' +
        'Less romantically "Italian" than Rome or Florence — and that\'s precisely the point.'
      },
      photo_url = ${'https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?w=800&q=80'},
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
    ${nanoid()}, ${DEST_ID}, 'Italy', 'Lombardy',
    'Europe/Rome (CET/CEST)', 'Italian',
    'EUR', '~1,400,000 (metro: ~3,200,000)',
    'April–June and September–October. Summers hot and humid. August locals flee the city (many restaurants close). Fashion Weeks in Feb/Mar and Sep.',
    ${25}, ${14}, ${8},
    ${
      'Continental climate — hotter and more humid than coastal Italian cities. Summers (Jul-Aug) reach 32-35°C with high humidity. ' +
      'Winters cold and foggy (Dec-Feb avg highs 5-7°C). Spring and autumn ideal. Rain spread fairly evenly, peaking in Oct-Nov. ' +
      'June/July for the trip: expect 27-30°C highs, occasional thunderstorms, generally pleasant.'
    },
    ${50}, ${120}, ${250}, 'EUR',
    ${
      'FROM VICENZA BY TRAIN: Frecce (high-speed) trains run Vicenza → Milano Centrale, ~1hr 30-45min, €20-40 depending on class and advance purchase. ' +
      'Regionale/Regionale Veloce: ~2hr 15min, €12-18. Frequent departures (roughly hourly for Frecce, more for regional). ' +
      'Milano Centrale is well-connected to Metro lines M2 (green) and M3 (yellow). ' +
      'BY CAR: ~245km via A4 autostrada, ~2hr 30min. Tolls ~€15 each way. Parking in Milan is expensive and Area C congestion charge (€7.50) applies to the city center. ' +
      'Train strongly recommended over driving. ' +
      'DAY TRIP FEASIBILITY: Very doable! Early Freccia (~7:30 AM from Vicenza), arrive Milano Centrale ~9:15 AM. ' +
      'Full day of sightseeing, catch a ~7-8 PM return, back in Vicenza by 9:30 PM. ' +
      'An overnight opens up evening Navigli aperitivo and nightlife, which is the best part of Milan. ' +
      'LOCAL TRANSPORT: Metro (4 lines + under construction M4), trams (iconic orange vintage trams), buses. ' +
      'Single ticket €2.20 (90 min). 24hr pass €7.60. The center is walkable but distances between major sights are significant — Metro helps. ' +
      'Duomo is the central hub (M1 red + M3 yellow).'
    },
    'Milan Malpensa (MXP) — 50km NW, main international. Milan Linate (LIN) — 7km E, domestic/European. Bergamo Orio al Serio (BGY) — Ryanair hub.',
    ${4},
    'Generally safe. Watch for pickpockets around Duomo, Centrale station, and on crowded Metro. Avoid Stazione Centrale area late at night. Normal big-city precautions.',
    ${
      'Milan is Italy\'s business and finance capital — the pace is faster, the dress code sharper, and the attitude more cosmopolitan than anywhere else in the country. ' +
      'Milanese take aperitivo culture seriously: the 6-9 PM ritual of drinks with elaborate free buffets (especially in Navigli and Brera) is sacred. ' +
      'Fashion is everywhere — you\'ll feel underdressed. The Quadrilatero della Moda (Via Montenapoleone, Via della Spiga) is luxury shopping ground zero. ' +
      'The Last Supper (Cenacolo Vinciano) requires advance booking — tickets sell out 2-3 months ahead. For June/July 2026, book as soon as tickets open (typically 3 months before). ' +
      'AC Milan and Inter share the legendary San Siro stadium — catching a match is electric if the timing works.'
    },
    ${
      'Fashion and design capital with the magnificent Gothic Duomo, Leonardo\'s Last Supper, world-class shopping, and Italy\'s best aperitivo culture. ' +
      'Easy day trip from Vicenza by high-speed train (~1.5hr), but an overnight unlocks the Navigli canal nightlife.'
    },
    ${JSON.stringify([
      'LAST SUPPER BOOKING: Tickets open ~3 months in advance at cenacolovinciano.org. For June/July 2026, check starting March/April 2026. They WILL sell out. Book the moment they open. Only 25 people per 15-minute slot.',
      'Duomo rooftop: Buy "Terraces" tickets (€14 stairs, €16 elevator). Go at golden hour for incredible views. The cathedral interior is free but has security queues.',
      'Aperitivo hour (6-9 PM) in Navigli or Brera: order one drink (€8-12) and get access to generous food buffets. This IS dinner for savvy visitors.',
      'Galleria Vittorio Emanuele II: Spin your heel on the bull mosaic for good luck (everyone does it). The Galleria has Prada\'s original store.',
      'Metro is the fastest way around. Buy tickets at machines (card accepted). Google Maps has excellent Milan transit integration.',
      'August is "dead Milan" — many local restaurants and shops close for ferragosto. June/July is fine though.',
      'If shopping: outlet malls Serravalle (90min) and Fidenza Village (1hr by train) have designer discounts of 30-70%.',
      'Try local specialties: risotto alla milanese (saffron), cotoletta alla milanese (breaded veal cutlet), ossobuco, panettone.',
    ])}
  )`;
  console.log('  ✓ Destination research (transport, budget, tips)');

  // ── 3. Highlights — Attractions, Restaurants, Activities ──
  await sql`DELETE FROM destination_highlights WHERE destination_id = ${DEST_ID}`;

  const highlights = [
    // ATTRACTIONS
    {
      title: 'Duomo di Milano & Rooftop Terraces',
      description:
        'The third-largest church in the world and Milan\'s crown jewel — a Gothic masterpiece that took nearly 600 years to complete (1386-1965). ' +
        'The exterior bristles with 3,400+ statues and 135 spires. The rooftop terraces are the real highlight: a surreal forest of marble spires ' +
        'with panoramic views across the city to the Alps on clear days. €14 by stairs, €16 by elevator. Go at sunset.',
      category: 'attraction', rating: 4.9, price_level: 2,
      address: 'Piazza del Duomo, 20122 Milano',
      website_url: 'https://www.duomomilano.it',
      duration: '2-3 hours (interior + rooftop)', order_index: 0,
    },
    {
      title: "Leonardo's Last Supper (Cenacolo Vinciano)",
      description:
        "Leonardo da Vinci's masterpiece, painted 1495-1498 on the refectory wall of Santa Maria delle Grazie. One of the most famous paintings in the world. " +
        "Strict visitor limits: only 25 people per 15-minute slot. MUST book months in advance — tickets for June/July 2026 should open around March/April 2026 " +
        "at cenacolovinciano.org. €15 + €2 booking fee. Absolutely unmissable if you can get tickets.",
      category: 'attraction', rating: 5.0, price_level: 2,
      address: 'Piazza di Santa Maria delle Grazie, 2, 20123 Milano',
      website_url: 'https://cenacolovinciano.org',
      duration: '15 min viewing (arrive 30 min early)', order_index: 1,
    },
    {
      title: 'Galleria Vittorio Emanuele II',
      description:
        "The world's oldest active shopping gallery (1877) — a breathtaking iron-and-glass cruciform arcade connecting Piazza del Duomo to La Scala. " +
        "Home to Prada's original store, Louis Vuitton, Gucci, and historic cafés. The mosaic floors feature the coats of arms of Italian cities — " +
        "spin your heel three times on the Turin bull's testicles for good luck (the tile is worn down from millions of tourists doing exactly this).",
      category: 'attraction', rating: 4.8, price_level: 1,
      address: 'Piazza del Duomo, 20123 Milano',
      duration: '30-60 min', order_index: 2,
    },
    {
      title: 'Navigli District (Canal Quarter)',
      description:
        "Milan's most atmospheric neighborhood, built along two remaining navigable canals (Naviglio Grande and Naviglio Pavese). " +
        "Leonardo da Vinci engineered the lock system. Today it's the epicenter of Milanese nightlife and aperitivo culture — lined with bars, " +
        "restaurants, vintage shops, and art galleries. Best experienced from 6 PM onward. The last Sunday of each month hosts a massive antique market.",
      category: 'attraction', rating: 4.7, price_level: 1,
      address: 'Navigli, 20143 Milano',
      duration: '2-4 hours (evening)', order_index: 3,
    },
    {
      title: 'Brera District & Pinacoteca di Brera',
      description:
        "Milan's most charming neighborhood — cobblestoned streets lined with galleries, boutiques, and cafés. The Pinacoteca di Brera " +
        "is one of Italy's finest art museums: Raphael's Marriage of the Virgin, Mantegna's Dead Christ, Caravaggio, Bellini. " +
        "The Orto Botanico (botanical garden) behind the Pinacoteca is a hidden gem. Great for afternoon wandering and aperitivo.",
      category: 'attraction', rating: 4.7, price_level: 2,
      address: 'Via Brera, 28, 20121 Milano',
      website_url: 'https://pinacotecabrera.org',
      duration: '2-3 hours', order_index: 4,
    },
    {
      title: 'Teatro alla Scala',
      description:
        "The world's most famous opera house (1778). Even if you can't catch a performance, the Museo Teatrale alla Scala is worth visiting — " +
        "you can peek into the auditorium from the museum boxes. Check the schedule for ballet, opera, or concerts. " +
        "Last-minute tickets sometimes available at the box office on performance day.",
      category: 'attraction', rating: 4.6, price_level: 2,
      address: 'Via Filodrammatici, 2, 20121 Milano',
      website_url: 'https://www.teatroallascala.org',
      duration: '1-2 hours (museum), 3+ hours (performance)', order_index: 5,
    },
    {
      title: 'Fondazione Prada',
      description:
        "Rem Koolhaas-designed contemporary art complex in a converted distillery. Stunning architecture — the gold-leafed 'Haunted House' tower " +
        "is iconic. Rotating exhibitions are world-class. Bar Luce (designed by Wes Anderson) is inside. €15. A must for anyone interested in " +
        "contemporary art or architecture.",
      category: 'attraction', rating: 4.6, price_level: 2,
      address: 'Largo Isarco, 2, 20139 Milano',
      website_url: 'https://www.fondazioneprada.org',
      duration: '2-3 hours', order_index: 6,
    },
    {
      title: 'Castello Sforzesco',
      description:
        "Massive 15th-century fortress built by the Sforza dynasty, now housing several museums including Michelangelo's final sculpture " +
        "(the Rondanini Pietà). The courtyard is free to enter. Behind it, Parco Sempione is Milan's largest park — perfect for a break. " +
        "The Arco della Pace (Arch of Peace) at the park's far end is photogenic.",
      category: 'attraction', rating: 4.5, price_level: 1,
      address: 'Piazza Castello, 20121 Milano',
      duration: '1-2 hours', order_index: 7,
    },
    {
      title: 'Quadrilatero della Moda (Fashion District)',
      description:
        "The global epicenter of luxury fashion — bounded by Via Montenapoleone, Via della Spiga, Via Manzoni, and Corso Venezia. " +
        "Every major fashion house has a flagship here. Even if you're not buying, the window displays and people-watching are world-class. " +
        "Via della Spiga is pedestrianized and particularly pleasant.",
      category: 'attraction', rating: 4.4, price_level: 1,
      address: 'Via Montenapoleone, 20121 Milano',
      duration: '1-2 hours', order_index: 8,
    },
    // RESTAURANTS
    {
      title: 'Trattoria Milanese',
      description:
        "Classic Milanese trattoria since 1933, steps from the Duomo. The risotto alla milanese (saffron risotto) and cotoletta alla milanese " +
        "(breaded veal cutlet, NOT chicken) are textbook perfect. Old-school ambiance, white tablecloths, no-nonsense service. Book ahead. €€-€€€.",
      category: 'food', rating: 4.7, price_level: 3,
      address: 'Via Santa Marta, 11, 20123 Milano',
      duration: '1-1.5 hours', order_index: 9,
    },
    {
      title: 'Ratanà',
      description:
        "Modern Milanese cuisine in a beautifully converted railway building near Porta Nuova. Chef Cesare Battisti serves creative takes on Lombard classics " +
        "with seasonal ingredients. The mondeghili (Milanese meatballs) and yellow risotto are superb. Excellent wine list. €€€. Book ahead.",
      category: 'food', rating: 4.7, price_level: 3,
      address: 'Via Gaetano de Castillia, 28, 20124 Milano',
      website_url: 'https://www.ratana.it',
      duration: '1.5 hours', order_index: 10,
    },
    {
      title: 'Pescaria',
      description:
        'Outstanding seafood street food — raw fish tartare, tuna burgers, seafood sandwiches at accessible prices. ' +
        'Started in Polignano a Mare (Puglia) and became a Milan sensation. Multiple locations. Perfect quick lunch. €.',
      category: 'food', rating: 4.5, price_level: 1,
      address: 'Via Tortona, 5, 20144 Milano',
      duration: '30 min', order_index: 11,
    },
    {
      title: "Luini Panzerotti",
      description:
        "Milanese institution since 1888. Fried or baked panzerotti (stuffed half-moons of dough) — the tomato and mozzarella is iconic. " +
        "Always a queue but it moves fast. €3-4 each. The perfect Duomo-area snack. Cash only.",
      category: 'food', rating: 4.6, price_level: 1,
      address: 'Via Santa Radegonda, 16, 20121 Milano',
      duration: '15-20 min', order_index: 12,
    },
    {
      title: 'Taglio',
      description:
        "Part deli, part restaurant, all quality. Excellent charcuterie and cheese boards, craft cocktails, and a daily-changing menu. " +
        "Great for aperitivo with a curated food experience. In the Tortona design district. €€.",
      category: 'food', rating: 4.5, price_level: 2,
      address: 'Via Vigevano, 10, 20144 Milano',
      duration: '1-1.5 hours', order_index: 13,
    },
    {
      title: 'El Brellin (Navigli)',
      description:
        "Romantic canal-side restaurant on the Naviglio Grande, housed in a former laundry. Milanese and Lombard cuisine " +
        "with outdoor seating overlooking the canal. Perfect for a Navigli dinner. Try the ossobuco. €€-€€€. Book for outdoor tables.",
      category: 'food', rating: 4.5, price_level: 3,
      address: 'Alzaia Naviglio Grande, 14, 20144 Milano',
      duration: '1.5 hours', order_index: 14,
    },
    // ACTIVITIES
    {
      title: 'Aperitivo Crawl: Navigli → Brera',
      description:
        "The quintessential Milan experience. Start in Navigli around 6 PM — bars like Rita, Mag Café, and Backdoor 43 serve creative cocktails " +
        "with generous buffets included. Then taxi/metro to Brera for a more refined second round at places like Jamaica Bar or Radetzky. " +
        "Budget €8-15 per drink, food included. This IS how Milanese socialize.",
      category: 'activity', rating: 4.8, price_level: 2,
      duration: '3-4 hours', order_index: 15,
    },
    {
      title: 'Shopping: Outlets & High Street',
      description:
        "Beyond the Quadrilatero luxury district, Corso Buenos Aires is Europe's longest shopping street (1.6km of stores). " +
        "For designer outlets: Serravalle Designer Outlet (90min drive, 180+ brands, 30-70% off) or Fidenza Village (1hr by train). " +
        "10 Corso Como is a concept store/gallery/café that defines Milanese cool.",
      category: 'activity', rating: 4.3, price_level: 2,
      duration: '3-5 hours', order_index: 16,
    },
    {
      title: 'Navigli Antique Market (Last Sunday)',
      description:
        "On the last Sunday of each month, the Naviglio Grande hosts one of Italy's largest antique and vintage markets — " +
        "over 400 stalls stretching along the canal. Furniture, art, jewelry, vintage clothing, books. " +
        "If your visit aligns, don't miss it. Free to browse. Best in the morning before crowds.",
      category: 'activity', rating: 4.4, price_level: 1,
      address: 'Alzaia Naviglio Grande, 20144 Milano',
      duration: '2-3 hours', order_index: 17,
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
    { month: 1,  avg_high_c: 5.5,   avg_low_c: -1.0,  rainy_days: 6,  sunshine_hours: 2.5 },
    { month: 2,  avg_high_c: 8.5,   avg_low_c: 1.0,   rainy_days: 5,  sunshine_hours: 4.0 },
    { month: 3,  avg_high_c: 14.0,  avg_low_c: 5.0,   rainy_days: 7,  sunshine_hours: 5.0 },
    { month: 4,  avg_high_c: 18.5,  avg_low_c: 9.0,   rainy_days: 8,  sunshine_hours: 6.0 },
    { month: 5,  avg_high_c: 23.5,  avg_low_c: 13.5,  rainy_days: 9,  sunshine_hours: 7.5 },
    { month: 6,  avg_high_c: 27.5,  avg_low_c: 17.5,  rainy_days: 8,  sunshine_hours: 9.0 },
    { month: 7,  avg_high_c: 30.0,  avg_low_c: 20.0,  rainy_days: 5,  sunshine_hours: 9.5 },
    { month: 8,  avg_high_c: 29.5,  avg_low_c: 19.5,  rainy_days: 7,  sunshine_hours: 8.5 },
    { month: 9,  avg_high_c: 25.0,  avg_low_c: 15.5,  rainy_days: 6,  sunshine_hours: 6.5 },
    { month: 10, avg_high_c: 18.5,  avg_low_c: 10.5,  rainy_days: 8,  sunshine_hours: 4.5 },
    { month: 11, avg_high_c: 11.5,  avg_low_c: 5.0,   rainy_days: 7,  sunshine_hours: 3.0 },
    { month: 12, avg_high_c: 6.5,   avg_low_c: 0.5,   rainy_days: 6,  sunshine_hours: 2.0 },
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
      name: 'Room Mate Giulia',
      type: 'hotel', status: 'researched',
      address: 'Via Silvio Pellico, 4, 20121 Milano',
      cost_per_night: 180, total_cost: 180, currency: 'EUR',
      booking_url: 'https://room-matehotels.com/giulia/',
      rating: 4.6,
      notes: 'Design hotel steps from the Duomo. Patricia Urquiola-designed interiors. Central location is unbeatable. Great value for the area.',
    },
    {
      name: 'NYX Hotel Milan',
      type: 'hotel', status: 'researched',
      address: 'Via Filippo Turati, 9, 20121 Milano',
      cost_per_night: 140, total_cost: 140, currency: 'EUR',
      booking_url: 'https://www.leonardo-hotels.com/nyx-hotel-milan',
      rating: 4.3,
      notes: 'Urban art-themed hotel near Porta Venezia. Good Metro access. Rooftop bar. Solid mid-range option.',
    },
    {
      name: 'Ostello Bello Grande (Hostel)',
      type: 'hostel', status: 'researched',
      address: 'Via Roberto Lepetit, 33, 20124 Milano',
      cost_per_night: 45, total_cost: 45, currency: 'EUR',
      booking_url: 'https://www.ostellobello.com',
      rating: 4.5,
      notes: 'Italy\'s best hostel — private rooms available (~€90). Free aperitivo buffet every evening. Near Centrale station. Incredible social vibe.',
    },
    {
      name: 'Navigli Apartment (Airbnb)',
      type: 'airbnb', status: 'researched',
      address: 'Navigli District, 20143 Milano',
      cost_per_night: 110, total_cost: 110, currency: 'EUR',
      rating: 4.4,
      notes: 'Airbnb apartments in Navigli area run €80-140/night for a 1BR. Best location for nightlife and canal atmosphere. Book early for summer.',
    },
    {
      name: 'Hotel Spadari al Duomo',
      type: 'hotel', status: 'researched',
      address: 'Via Spadari, 11, 20123 Milano',
      cost_per_night: 220, total_cost: 220, currency: 'EUR',
      booking_url: 'https://www.spadarihotel.com',
      rating: 4.7,
      notes: 'Boutique art hotel with contemporary art collection. Literally 2 min walk from Duomo. Family-run, exceptional service. Worth the splurge.',
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

  console.log('\n✅ Milan fully seeded!');
  console.log('\n📋 Summary:');
  console.log('   ✓ Description updated');
  console.log('   ✓ 18 highlights (attractions, restaurants, activities)');
  console.log('   ✓ 12 months weather data');
  console.log('   ✓ 5 accommodation options (€45-220/night)');
  console.log('   ✓ Transport notes (1.5hr Freccia from Vicenza, day trip feasible)');
  console.log('   ✓ Photo URL set');
  console.log('   ✓ Research status: fully_researched');

  await sql.end();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
