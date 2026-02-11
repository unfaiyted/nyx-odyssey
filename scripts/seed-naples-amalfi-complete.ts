/**
 * Seed Naples / Amalfi Coast — Complete Destination Profile
 * Pizza birthplace + stunning coastline, Pompeii, Positano, Capri
 * Usage: bun run scripts/seed-naples-amalfi-complete.ts
 */
import postgres from 'postgres';
import { nanoid } from 'nanoid';

const CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const sql = postgres(CONNECTION_STRING);

const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh';
const DEST_ID = 'kxYAUgkbiqKnwGAEGCPG8';

async function seed() {
  console.log('🍕 Seeding Naples / Amalfi Coast — Complete Destination Profile...\n');

  // ── 1. Update trip_destinations (description, photoUrl, status) ──
  await sql`
    UPDATE trip_destinations SET
      description = ${
        'Naples is raw, chaotic, magnificent — the birthplace of pizza and the soul of southern Italy. ' +
        'Its crumbling palazzos hide world-class museums, its narrow streets pulse with Vespa-dodging energy, ' +
        'and its pizzerias serve the best margherita on Earth. Just south, the Amalfi Coast unfolds in a ' +
        'jaw-dropping ribbon of cliff-hugging villages — pastel-painted Positano tumbling down to the sea, ' +
        'elegant Ravello perched above the clouds, and the medieval maritime republic of Amalfi town itself. ' +
        'Add in the haunting ruins of Pompeii frozen in volcanic ash, the impossibly blue island of Capri, ' +
        'and the archaeological treasures of Herculaneum, and you have one of Italy\'s most rewarding (and intense) destinations. ' +
        'Naples demands street smarts and rewards curiosity; the coast demands early buses and rewards patience with views that redefine beautiful.'
      },
      photo_url = ${'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800&q=80'},
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
    ${nanoid()}, ${DEST_ID}, 'Italy', 'Campania',
    'Europe/Rome (CET/CEST)', 'Italian (Neapolitan dialect common)',
    'EUR', '~950,000 (Naples city); Amalfi Coast ~5,000 per town',
    'April–June and September–October. Summer (Jul-Aug) is scorching, overcrowded on the coast, and Amalfi Coast buses are sardine cans. Spring has wildflowers and manageable crowds; September is warm seas and fewer tourists.',
    ${25}, ${13}, ${7},
    ${
      'Mediterranean climate, warmer than northern Italy. Naples summers are hot and humid (Jul-Aug avg highs 30-32°C). ' +
      'Winters mild (10-14°C highs) with occasional rain. Amalfi Coast is slightly milder with sea breezes. ' +
      'Swimming season: June–October (sea temp 20-26°C). Rain peaks November-February. Spring (Apr-May) ideal for hiking the Path of the Gods. ' +
      'Capri is best May-June and September — August is overwhelmingly crowded.'
    },
    ${35}, ${80}, ${180}, 'EUR',
    ${
      'FROM VICENZA BY TRAIN: Vicenza → Napoli Centrale via Frecciarossa high-speed, ~4-4.5 hrs with change in Rome or direct. ' +
      'Price: €50-90/person depending on class and advance booking. Book at trenitalia.com or italotreno.it 2-4 weeks ahead. ' +
      'Direct Frecciarossa Milan-Naples passes through Bologna/Florence/Rome — Vicenza connects via Verona or Padova. ' +
      'VIA ROME: If doing Rome first, Roma Termini → Napoli Centrale is 1hr 10min on Frecciarossa (€20-45). Very convenient combo trip. ' +
      'BY CAR: ~660km from Vicenza via A1/E45, 6-7 hrs. Not recommended for Naples itself (traffic is legendary chaos, ZTL zones, parking impossible). ' +
      'However, a car IS useful for the Amalfi Coast if you\'re confident with narrow cliff roads and visiting off-peak. ' +
      'BY AIR: Verona (VRN) or Venice (VCE) → Naples (NAP). ~1hr flight, €25-60 on Ryanair/EasyJet. Naples airport is 6km from center (Alibus €5, taxi flat rate €16-23). ' +

      'NAPLES LOCAL: Walkable centro storico. Metro Line 1 (art stations — Toledo is stunning). ANM buses. Taxi: insist on meter or agree price beforehand. ' +
      'NAPLES → AMALFI COAST: SITA bus from Naples (or Salerno) to Amalfi/Positano — cheapest but slow and crowded in summer. ~2hrs. €2-4. ' +
      'Better: train to Salerno (35min, €5) then SITA bus or ferry. Ferries from Naples Molo Beverello or Salerno to Positano/Amalfi (€12-18, 40-80min). ' +
      'NLG/Travelmar/Alilauro run seasonal services Apr-Oct. Ferry is the best way — no traffic, gorgeous views. ' +
      'AMALFI COAST LOCAL: SITA bus is the main transport. Single ride ~€2. Buses are frequent but packed in summer — stand in line early. ' +
      'Driving the SS163 coast road is thrilling but stressful (single lane in parts, buses have right of way, parking scarce). ' +
      'Water taxis between towns: €15-50 depending on distance. E-bikes increasingly available for rent. ' +
      'NAPLES → CAPRI: Ferry from Molo Beverello — fast ferry 50min (~€22) or slow ferry 80min (~€15). Frequent daily departures. ' +
      'NAPLES → POMPEII: Circumvesuviana train from Napoli Garibaldi → Pompei Scavi, 35min, €3.60. Runs every 20-30min. Beware pickpockets on this train.'
    },
    'Naples International (NAP) — 6km north of city center. Alibus shuttle to Centrale/Molo Beverello €5.',
    ${3},
    ${
      'Naples has a rough reputation but is generally safe for alert travelers. Petty crime (pickpocketing, bag snatching) is the main risk, ' +
      'concentrated around Napoli Centrale station, the Circumvesuviana train, and Spaccanapoli tourist areas. ' +
      'Scooter-mounted bag snatchers are a real thing — carry bags on the building side of sidewalks, not the street side. ' +
      'Don\'t flash expensive jewelry or phones. Taxi scams: always insist on the meter or negotiate price before getting in. ' +
      'Flat rates exist: train station to centro storico €9, to airport €16 (posted in taxis). ' +
      'The Quartieri Spagnoli has gentrified significantly but some back alleys still feel sketchy at night. ' +
      'Amalfi Coast is very safe — biggest dangers are sunburn and twisting an ankle on steep paths. ' +
      'Pompeii area: watch belongings on the Circumvesuviana and at the ruins entrance.'
    },
    ${
      'Neapolitans are passionate, loud, generous, and proud — especially about their pizza and coffee. Never insult either. ' +
      'Naples invented pizza — margherita was created here in 1889 for Queen Margherita. A proper Neapolitan pizza is soft, charred, and eaten with a fork and knife (folding "a portafoglio" is for street slices). ' +
      'Coffee culture: espresso is €1-1.50 standing at the bar. "Caffè sospeso" (suspended coffee) is a Neapolitan tradition — you pay for two coffees, leaving one for someone who can\'t afford it. ' +
      'Neapolitan dialect is quite different from standard Italian. Hand gestures are an art form. ' +
      'Naples has a superstitious culture — cornicello (horn-shaped charm) wards off the evil eye. ' +
      'Tipping: not expected, round up or leave €1-2. Service charge (coperto) is on the bill. ' +
      'Amalfi Coast: dress code for churches (covered shoulders/knees). Positano is extremely steep — bring good walking shoes, not just flip-flops.'
    },
    ${
      'The birthplace of pizza and gateway to the Amalfi Coast — Naples delivers raw southern Italian energy, world-class food, ' +
      'and ancient ruins, while the coast stuns with cliffside villages and Mediterranean blues. 4-4.5 hrs from Vicenza by train.'
    },
    ${JSON.stringify([
      'Eat pizza at Da Michele and Sorbillo — go at opening (11:30/12:00) to avoid 1hr+ queues. Cash only at Da Michele.',
      'Book Pompeii tickets online at ticketone.it — allow 3-4 hours minimum. Bring water and sunscreen (no shade!).',
      'Take the ferry to Amalfi Coast, not the bus — better views, no motion sickness from hairpin turns, and faster in summer.',
      'Capri day trip is feasible but tiring. First ferry out (~8:00), last ferry back (~18:30). Skip the Blue Grotto if the line is 2+ hours.',
      'Walk the Path of the Gods (Sentiero degli Dei): Bomerano → Nocelle, ~2hrs, spectacular views. Start early morning. Wear proper shoes.',
      'Naples centro storico is a UNESCO site — get lost in Spaccanapoli and Via dei Tribunali for the real experience.',
      'The Circumvesuviana train to Pompeii is notoriously sketchy — hold your bags close, don\'t put phones in back pockets.',
      'Ravello is the quiet gem of the Amalfi Coast — Villa Rufolo gardens with views that inspired Wagner. Worth the bus ride up.',
      'Try sfogliatella (riccia style, with crispy layers) at Sfogliatella Mary or Attanasio near the train station.',
      'Naples archaeological museum (MANN) has the best Pompeii artifacts — visit BEFORE Pompeii for context. Closed Tuesdays.',
    ])}
  )`;
  console.log('  ✓ Destination research (transport, budget, tips, safety)');

  // ── 3. Highlights — Attractions, Restaurants, Activities ──
  await sql`DELETE FROM destination_highlights WHERE destination_id = ${DEST_ID}`;

  const highlights = [
    // ATTRACTIONS
    {
      title: 'Pompeii Archaeological Site',
      description:
        'The city frozen in time by Vesuvius in 79 AD — one of the most extraordinary archaeological sites on Earth. ' +
        'Walk through Roman streets, houses with intact frescoes, amphitheater, forum, and the Garden of the Fugitives with plaster casts of victims. ' +
        'Allow 3-5 hours. Book tickets at ticketone.it. €18/person. Bring water, sunscreen, and comfortable shoes — it\'s huge and exposed. ' +
        'Audio guide (€8) highly recommended for context. Circumvesuviana train from Naples, 35 min.',
      category: 'attraction', rating: 4.9, price_level: 2,
      address: 'Porta Marina / Piazza Anfiteatro, 80045 Pompei',
      website_url: 'https://www.pompeiisites.org',
      duration: '3-5 hours', order_index: 0,
    },
    {
      title: 'Positano',
      description:
        'The jewel of the Amalfi Coast — a cascade of pastel pink, orange, and white buildings tumbling down steep cliffs to a gray pebble beach. ' +
        'Impossibly photogenic from every angle. Walk the narrow stepped streets, browse boutiques selling handmade sandals and linen, ' +
        'swim at Spiaggia Grande, and eat seafood with a view. Expensive but unforgettable. The iconic vertical village.',
      category: 'attraction', rating: 4.8, price_level: 3,
      address: 'Positano, SA, Amalfi Coast',
      duration: '3-5 hours or overnight', order_index: 1,
    },
    {
      title: 'Naples Centro Storico (Spaccanapoli)',
      description:
        'The historic center of Naples is a UNESCO World Heritage Site — a narrow, chaotic, vibrant slash through the city following the ancient Greek street grid. ' +
        'Via dei Tribunali and Spaccanapoli are the main arteries, packed with churches, street food, laundry-draped balconies, and life at full volume. ' +
        'Don\'t miss the Cappella Sansevero (Veiled Christ sculpture) and the underground Naples Sotterranea tours.',
      category: 'attraction', rating: 4.7, price_level: 1,
      address: 'Via Benedetto Croce / Via dei Tribunali, 80134 Napoli',
      duration: '3-4 hours (wandering)', order_index: 2,
    },
    {
      title: 'Ravello',
      description:
        'Perched 350m above the sea, Ravello is the Amalfi Coast\'s cultural and romantic pinnacle. ' +
        'Villa Rufolo\'s terraced gardens inspired Wagner and offer some of the most spectacular views in all of Italy. ' +
        'Villa Cimbrone\'s Terrace of Infinity is equally jaw-dropping. Summer concerts in the gardens. ' +
        'Quieter and more refined than Positano — perfect for a half-day visit or romantic overnight.',
      category: 'attraction', rating: 4.8, price_level: 2,
      address: 'Ravello, SA, Amalfi Coast',
      website_url: 'https://www.villarufolo.it',
      duration: '2-4 hours', order_index: 3,
    },
    {
      title: 'Capri & Blue Grotto',
      description:
        'The legendary island of Capri — dramatic limestone cliffs, the iconic Faraglioni rocks, luxury boutiques in the Piazzetta, ' +
        'and the ethereal blue glow of the Grotta Azzurra. Day trip feasible from Naples (50min fast ferry, €22). ' +
        'Take the chairlift to Monte Solaro for panoramic views. The Blue Grotto costs €18 entrance + €15 rowboat — worth it if the wait is under 1 hour. ' +
        'Augustus Gardens offer stunning Faraglioni views for €1.',
      category: 'attraction', rating: 4.7, price_level: 3,
      address: 'Isle of Capri, NA',
      duration: 'Full day trip', order_index: 4,
    },
    {
      title: 'Naples National Archaeological Museum (MANN)',
      description:
        'One of the world\'s great museums — houses the Farnese collection, stunning Roman mosaics, and the best artifacts from Pompeii and Herculaneum. ' +
        'The Alexander Mosaic, Farnese Hercules, and the "Secret Cabinet" (Roman erotic art) are highlights. ' +
        'Visit BEFORE Pompeii for essential context. €18. Closed Tuesdays.',
      category: 'attraction', rating: 4.7, price_level: 2,
      address: 'Piazza Museo 19, 80135 Napoli',
      website_url: 'https://www.mann-napoli.it',
      duration: '2-3 hours', order_index: 5,
    },
    {
      title: 'Herculaneum (Ercolano)',
      description:
        'Pompeii\'s lesser-known sister city, buried by the same 79 AD eruption but better preserved — wood, fabric, even food survived under volcanic mud. ' +
        'Smaller and more intimate than Pompeii, less crowded, and the two-story buildings with intact upper floors are remarkable. ' +
        'Circumvesuviana train, 20min from Naples. €13. Allow 2-3 hours.',
      category: 'attraction', rating: 4.7, price_level: 2,
      address: 'Corso Resina 187, 80056 Ercolano',
      duration: '2-3 hours', order_index: 6,
    },
    {
      title: 'Amalfi Town & Cathedral',
      description:
        'The historic maritime republic that gave the coast its name. The Cathedral of St. Andrew (Duomo) with its striking Arab-Norman facade ' +
        'and the Cloister of Paradise are the centerpieces. Compact, walkable town with paper-making heritage (Museo della Carta). ' +
        'Less vertical than Positano, good base for coast exploration. Lovely main piazza for a limoncello.',
      category: 'attraction', rating: 4.5, price_level: 2,
      address: 'Piazza Duomo, 84011 Amalfi SA',
      duration: '2-3 hours', order_index: 7,
    },
    // RESTAURANTS
    {
      title: 'L\'Antica Pizzeria Da Michele',
      description:
        'The most famous pizzeria in the world — open since 1870 and serving only two pizzas: margherita and marinara. ' +
        'Featured in Eat Pray Love. The margherita here, with San Marzano tomatoes, fior di latte, basil, and olive oil on a pillowy charred crust, ' +
        'is a religious experience. Cash only. Queue at opening (11:30 AM) or expect 1hr+ wait. Margherita: €5. ' +
        'No frills — formica tables, paper plates. Pure pizza perfection.',
      category: 'food', rating: 4.9, price_level: 1,
      address: 'Via Cesare Sersale 1, 80139 Napoli',
      website_url: 'https://www.damichele.net',
      duration: '30-60 min (plus queue)', order_index: 8,
    },
    {
      title: 'Pizzeria Gino e Toto Sorbillo',
      description:
        'The other titan of Neapolitan pizza — Gino Sorbillo is a third-generation pizzaiolo and pizza celebrity. ' +
        'More variety than Da Michele with creative toppings alongside classics. The crust is lighter and airier. ' +
        'Via dei Tribunali location always has a queue — try the fried pizza (pizza fritta) from the window next door while waiting. €5-10.',
      category: 'food', rating: 4.8, price_level: 1,
      address: 'Via dei Tribunali 32, 80138 Napoli',
      website_url: 'https://www.sfrfrancescodicostanzo.it',
      duration: '30-60 min (plus queue)', order_index: 9,
    },
    {
      title: 'Sfogliatella Mary / Attanasio',
      description:
        'For Naples\' other iconic food: sfogliatella — a shell-shaped pastry with ricotta and semolina filling. ' +
        'Sfogliatella Mary (multiple locations) and Attanasio (near Centrale station) are the best. ' +
        'Get "riccia" style (crispy flaky layers) not "frolla" (shortcrust). Best eaten warm. €1.50-2.50.',
      category: 'food', rating: 4.7, price_level: 1,
      address: 'Via Toledo 66, 80134 Napoli (Mary) / Vico Ferrovia 1-4 (Attanasio)',
      duration: '10-15 min', order_index: 10,
    },
    {
      title: 'Trattoria da Nennella (Quartieri Spagnoli)',
      description:
        'Legendary local trattoria in the Spanish Quarter — chaotic, loud, hilarious, and delicious. ' +
        'Waiters throw bread rolls, water bottles fly through the air, and the pasta e patate, genovese, and parmigiana are outstanding. ' +
        'No menu — they tell you what\'s cooking. Cash only. €10-15 for a full meal with wine. Peak Neapolitan experience.',
      category: 'food', rating: 4.6, price_level: 1,
      address: 'Vico Lungo Teatro Nuovo 103, 80134 Napoli',
      duration: '1 hour', order_index: 11,
    },
    {
      title: 'Lo Guarracino (Positano)',
      description:
        'Cliffside seafood restaurant in Positano with stunning views over the beach and sea. ' +
        'Fresh catch of the day, excellent spaghetti alle vongole, and the best sunset dinner setting on the coast. ' +
        'Reservations essential in summer. €€€ (Positano prices). Budget: €40-60/person.',
      category: 'food', rating: 4.5, price_level: 3,
      address: 'Via Positanesi d\'America 12, 84017 Positano SA',
      duration: '1.5-2 hours', order_index: 12,
    },
    {
      title: 'Di Matteo (Naples)',
      description:
        'Another Via dei Tribunali institution — famous for fried food as much as pizza. ' +
        'The pizza fritta (fried calzone filled with ricotta, cicoli, and provola) is legendary. ' +
        'Bill Clinton ate here. Cheap, fast, standing-room chaos. Pizza fritta: €3. Perfect street food stop.',
      category: 'food', rating: 4.6, price_level: 1,
      address: 'Via dei Tribunali 94, 80138 Napoli',
      duration: '15-30 min', order_index: 13,
    },
    // ACTIVITIES
    {
      title: 'Path of the Gods (Sentiero degli Dei)',
      description:
        'One of Italy\'s most spectacular hikes — a cliffside trail from Bomerano to Nocelle high above the Amalfi Coast. ' +
        '7.8km, ~2-3 hours, moderate difficulty. Jaw-dropping views of Positano, Capri, and the coast below. ' +
        'Start early morning to avoid heat. Wear proper hiking shoes (not sandals!). From Nocelle, take the 1,500 steps down to Positano or the bus. ' +
        'Bus from Amalfi to Bomerano trailhead.',
      category: 'activity', rating: 4.9, price_level: 1,
      duration: '2-3 hours hiking + transport', order_index: 14,
    },
    {
      title: 'Naples Underground (Napoli Sotterranea)',
      description:
        'Descend 40m below street level into the Greek-Roman aqueducts and tunnels carved from tufa stone 2,400 years ago. ' +
        'Used as WWII air raid shelters. Guided tours only, ~90 min. Narrow passages (some claustrophobic). ' +
        'Fascinating history and a unique perspective on Naples. Multiple entrances; Piazza San Gaetano is the main one. €12.',
      category: 'activity', rating: 4.6, price_level: 1,
      address: 'Piazza San Gaetano 68, 80138 Napoli',
      website_url: 'https://www.napolisotterranea.org',
      duration: '1.5 hours', order_index: 15,
    },
    {
      title: 'Amalfi Coast Ferry Hopping',
      description:
        'Skip the stressful bus and hop between coast towns by sea — Salerno → Amalfi → Positano or reverse. ' +
        'Travelmar and NLG ferries run Apr-Oct. €8-18 per leg. Gorgeous approach to each town from the water. ' +
        'Combine with swimming stops. Buy tickets at the port or online. Budget a full day to hit Amalfi, Positano, and Ravello (bus up).',
      category: 'activity', rating: 4.7, price_level: 2,
      duration: 'Full day', order_index: 16,
    },
    {
      title: 'Limoncello Tasting & Lemon Groves',
      description:
        'The Amalfi Coast is famous for its massive sfusato lemons — the basis for limoncello liqueur. ' +
        'Visit a lemon grove in Amalfi or Ravello for tastings and to see how it\'s made. ' +
        'Many small producers offer tours. Also try delizia al limone (lemon cream pastry) at any pasticceria. ' +
        'Buy limoncello directly from producers, not tourist shops.',
      category: 'activity', rating: 4.4, price_level: 1,
      duration: '1-2 hours', order_index: 17,
    },
    {
      title: 'Naples Pizza-Making Class',
      description:
        'Learn to make authentic Neapolitan pizza from a local pizzaiolo. Several operators offer 2-3 hour classes ' +
        'in the centro storico — you make your own dough, top it, and eat it. Great rainy day activity or foodie experience. ' +
        'Book via Airbnb Experiences or local operators. €40-70/person.',
      category: 'activity', rating: 4.5, price_level: 2,
      duration: '2-3 hours', order_index: 18,
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
    { month: 1,  avg_high_c: 13.0, avg_low_c: 4.0,  rainy_days: 9,  sunshine_hours: 4.0 },
    { month: 2,  avg_high_c: 13.5, avg_low_c: 4.5,  rainy_days: 9,  sunshine_hours: 4.5 },
    { month: 3,  avg_high_c: 16.0, avg_low_c: 6.5,  rainy_days: 8,  sunshine_hours: 5.5 },
    { month: 4,  avg_high_c: 19.0, avg_low_c: 9.0,  rainy_days: 7,  sunshine_hours: 7.0 },
    { month: 5,  avg_high_c: 23.5, avg_low_c: 13.0, rainy_days: 5,  sunshine_hours: 8.5 },
    { month: 6,  avg_high_c: 27.5, avg_low_c: 17.0, rainy_days: 3,  sunshine_hours: 10.0 },
    { month: 7,  avg_high_c: 30.5, avg_low_c: 19.5, rainy_days: 2,  sunshine_hours: 11.0 },
    { month: 8,  avg_high_c: 31.0, avg_low_c: 19.5, rainy_days: 3,  sunshine_hours: 10.0 },
    { month: 9,  avg_high_c: 27.5, avg_low_c: 16.5, rainy_days: 5,  sunshine_hours: 8.0 },
    { month: 10, avg_high_c: 23.0, avg_low_c: 13.0, rainy_days: 8,  sunshine_hours: 6.0 },
    { month: 11, avg_high_c: 17.5, avg_low_c: 8.5,  rainy_days: 10, sunshine_hours: 4.5 },
    { month: 12, avg_high_c: 14.0, avg_low_c: 5.5,  rainy_days: 10, sunshine_hours: 3.5 },
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
      name: 'Hotel Piazza Bellini (Naples Centro)',
      type: 'hotel', status: 'researched',
      address: 'Via Santa Maria di Costantinopoli 101, 80138 Napoli',
      cost_per_night: 110, total_cost: 220, currency: 'EUR',
      booking_url: 'https://www.hotelpiazzabellini.com',
      rating: 4.5,
      notes: 'Stylish boutique hotel in the heart of the centro storico. Walking distance to Spaccanapoli, Via dei Tribunali, and MANN. Rooftop terrace. Modern rooms in a 16th-century palazzo.',
    },
    {
      name: 'Hotel Il Convento (Quartieri Spagnoli)',
      type: 'hotel', status: 'researched',
      address: 'Via Speranzella 137A, 80132 Napoli',
      cost_per_night: 85, total_cost: 170, currency: 'EUR',
      booking_url: 'https://www.hotelilconvento.com',
      rating: 4.3,
      notes: 'Converted 17th-century convent in the Spanish Quarter. Great value for central Naples. Breakfast included. Close to Via Toledo and Toledo metro station.',
    },
    {
      name: 'Hotel Palazzo Murat (Positano)',
      type: 'hotel', status: 'researched',
      address: 'Via dei Mulini 23, 84017 Positano SA',
      cost_per_night: 250, total_cost: 500, currency: 'EUR',
      booking_url: 'https://www.palazzomurat.it',
      rating: 4.7,
      notes: 'Beautiful bougainvillea-draped palazzo in the center of Positano. Gorgeous courtyard garden. Steps from the beach. The quintessential Positano splurge. Book well ahead for summer.',
    },
    {
      name: 'Airbnb in Amalfi Town',
      type: 'airbnb', status: 'researched',
      address: 'Amalfi, SA, Amalfi Coast',
      cost_per_night: 120, total_cost: 240, currency: 'EUR',
      rating: 4.4,
      notes: 'Amalfi town apartments on Airbnb typically €100-150/night. Good base for coast exploration — central ferry dock, bus connections to Ravello. Look for sea view terrace. Cheaper than Positano.',
    },
    {
      name: 'Hostel of the Sun (Naples Budget)',
      type: 'hostel', status: 'researched',
      address: 'Via Guglielmo Melisurgo 15, 80133 Napoli',
      cost_per_night: 35, total_cost: 70, currency: 'EUR',
      booking_url: 'https://www.hostelnapoli.com',
      rating: 4.5,
      notes: 'Highly rated hostel near the port — perfect for ferry departures to Capri/Amalfi. Private rooms ~€70-90. Friendly staff, communal kitchen. Near Castel Nuovo.',
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

  console.log('\n✅ Naples / Amalfi Coast fully seeded!');
  console.log('\n📋 Summary:');
  console.log('   ✓ Description updated');
  console.log('   ✓ 19 highlights (8 attractions, 6 restaurants, 5 activities)');
  console.log('   ✓ 12 months weather data');
  console.log('   ✓ 5 accommodation options (€35-250/night)');
  console.log('   ✓ Transport notes (4.5hr train from Vicenza, ferries, Circumvesuviana)');
  console.log('   ✓ Photo URL set');
  console.log('   ✓ Research status: fully_researched');
  console.log('   ✓ Safety notes + cultural tips');

  await sql.end();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
