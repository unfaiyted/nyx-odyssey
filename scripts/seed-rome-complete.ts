/**
 * Seed Rome — Complete Destination Profile
 * The Eternal City: Colosseum, Vatican, incredible food, ancient history
 * Usage: bun run scripts/seed-rome-complete.ts
 */
import postgres from 'postgres';
import { nanoid } from 'nanoid';

const CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const sql = postgres(CONNECTION_STRING);

const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh';
const DEST_ID = 'TiT7aVixLBRCmek5idZMA';

async function seed() {
  console.log('🏛️ Seeding Rome — Complete Destination Profile...\n');

  // ── 1. Update trip_destinations (description, photoUrl, status) ──
  await sql`
    UPDATE trip_destinations SET
      description = ${
        'The Eternal City needs no introduction — Rome is 2,800 years of history layered like a living archaeological dig, ' +
        'where ancient ruins stand shoulder-to-shoulder with Baroque churches, Renaissance palaces, and buzzing trattorias. ' +
        'The Colosseum and Roman Forum anchor the ancient world; the Vatican Museums and Sistine Chapel represent the pinnacle of Renaissance art; ' +
        'and neighborhoods like Trastevere pulse with the chaotic, beautiful energy of modern Roman life. ' +
        'The food is legendary — cacio e pepe, carbonara, amatriciana, and gricia form the sacred "Roman quartet" of pasta, ' +
        'while supplì (fried rice balls), pizza al taglio, and gelato fuel every street corner. ' +
        'Rome rewards the wanderer: get lost in cobblestone alleys, stumble upon hidden piazzas, toss a coin in the Trevi Fountain, ' +
        'and linger over espresso at a sidewalk café. Just book your major attractions well in advance — the Colosseum and Vatican sell out weeks ahead.'
      },
      photo_url = ${'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80'},
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
    ${nanoid()}, ${DEST_ID}, 'Italy', 'Lazio',
    'Europe/Rome (CET/CEST)', 'Italian',
    'EUR', '~2,870,000 (metro ~4.3M)',
    'April–June and September–October. Summer (Jul-Aug) is brutally hot (35°C+) and packed with tourists. Spring and autumn offer perfect weather and manageable crowds.',
    ${25}, ${13}, ${7},
    ${
      'Mediterranean climate. Summers are hot and dry (Jul-Aug avg highs 31-32°C, can hit 38°C+). Winters mild (avg highs 12-13°C, rarely below freezing). ' +
      'Rain peaks November-December. Spring (April-May) is ideal: warm, flowers everywhere, comfortable for walking. ' +
      'September-October also excellent with warm temps and summer crowds thinning out. The "scirocco" hot wind from Africa can make summer days oppressive.'
    },
    ${40}, ${90}, ${200}, 'EUR',
    ${
      'FROM VICENZA BY TRAIN (RECOMMENDED): Frecciarossa/Frecciargento high-speed train Vicenza → Roma Termini, ~3.5 hrs direct. ' +
      'Price: €40-80/person depending on class and advance booking. Book at trenitalia.com 2-4 weeks ahead for best prices. ' +
      'Multiple daily departures. Standard class is fine; Business has wider seats and power outlets. ' +
      'BY CAR: ~480km via A1/E35 autostrada, 4.5-5 hrs. Tolls ~€30-40 each way. STRONGLY DISCOURAGED — parking in Rome is a nightmare ' +
      '(ZTL restricted zones will get you fined, street parking nearly impossible in centro). If driving, park at a peripheral metro station. ' +
      'BY AIR: Verona Villafranca (VRN) or Venice Marco Polo (VCE) → Rome Fiumicino (FCO). ~1hr flight, €30-80 on Ryanair/ITA Airways if booked early. ' +
      'Fiumicino → Roma Termini: Leonardo Express train, 32 min, €14. ' +
      'LOCAL TRANSPORT: Rome Metro has 3 lines (A, B, C). Single ride €1.50, 24hr pass €7, 48hr €12.50, 72hr €18. ' +
      'Metro + buses cover most tourist areas. Walking is best for the centro storico. Taxis: official white cars only, meter starts at €3.50. ' +
      'UBER exists but limited. Bolt app also works.'
    },
    'Rome Fiumicino (FCO) — main international hub, 30km southwest. Rome Ciampino (CIA) — budget airlines, 15km southeast.',
    ${4},
    ${
      'Generally safe but pickpocketing is RAMPANT in tourist areas and on public transport. Top scam/theft hotspots: ' +
      'Metro Line A (especially Termini-Ottaviano stretch), Colosseum area, Trevi Fountain, bus 64 (Vatican route). ' +
      'Common scams: "gladiators" at Colosseum demanding payment for photos, friendship bracelet scam (someone ties it on your wrist then demands money), ' +
      'rose sellers at restaurants, fake petition signers (distract while accomplice picks pocket), overcharging at touristy restaurants (always check menu prices). ' +
      'Tips: use a cross-body bag with zipper, keep phone in front pocket, avoid engaging with street vendors, eat at least 2 blocks from major monuments.'
    },
    ${
      'Romans take food seriously — never order cappuccino after 11 AM (it\'s a breakfast drink), don\'t ask for parmesan on seafood pasta, ' +
      'and standing at a bar for coffee is cheaper than sitting at a table. Tipping is not expected (coperto/service charge is on the bill) ' +
      'but rounding up is appreciated. Dress code enforced at Vatican and churches: covered shoulders and knees. ' +
      'Sunday is family day — many smaller shops close. August sees many Romans flee the city (ferragosto), so some local restaurants close. ' +
      'The passeggiata (evening stroll) is sacred — join the flow around 7-8 PM. Water fountains (nasoni) throughout the city dispense free, clean drinking water.'
    },
    ${
      'The Eternal City — 2,800 years of history from ancient ruins to Renaissance masterpieces, legendary food, and la dolce vita. ' +
      'A weekend from Vicenza via high-speed train. Must pre-book Colosseum and Vatican.'
    },
    ${JSON.stringify([
      'Book Colosseum tickets 30-60 days ahead at coopculture.it — they sell out fast. Get the Full Experience with underground access.',
      'Book Vatican Museums at tickets.museivaticani.va — earliest time slot (7:30 AM). Use the Sistine Chapel exit into St. Peter\'s to skip the basilica queue.',
      'Pantheon requires €5 reservation since 2023: pantheonroma.com',
      'The "Roman quartet" pastas: cacio e pepe, carbonara, amatriciana, gricia. Try all four. Never add cream to carbonara (it\'s egg and guanciale).',
      'Eat where Romans eat: 2+ blocks from major monuments. Trastevere, Testaccio, and Monti are foodie neighborhoods.',
      'Pickpockets are aggressive on Metro Line A and bus 64. Use a cross-body bag, stay alert at Termini station.',
      'Free water from nasoni (little nose) fountains all over the city — bring a reusable bottle.',
      'Can\'t sit on the Spanish Steps (€250 fine). Can\'t eat near monuments. Can\'t wade in fountains.',
      'Supplì (fried rice balls with mozzarella) are Rome\'s best street snack. Try Supplizio near Campo de\' Fiori.',
      'Roma Pass (48hr €32 / 72hr €52): includes 1-2 free museums + unlimited transport. Worth it if hitting multiple paid sites.',
    ])}
  )`;
  console.log('  ✓ Destination research (transport, budget, tips, safety)');

  // ── 3. Highlights — Attractions, Restaurants, Activities ──
  await sql`DELETE FROM destination_highlights WHERE destination_id = ${DEST_ID}`;

  const highlights = [
    // ATTRACTIONS
    {
      title: 'Colosseum & Roman Forum',
      description:
        'The iconic amphitheater (70 AD) that held 50,000 spectators for gladiatorial combat. Combined ticket includes the Roman Forum and Palatine Hill. ' +
        'The Underground tour reveals the hypogeum where gladiators and animals waited. Book 30-60 days ahead at coopculture.it — sells out fast. ' +
        'Full Experience ticket (€22-24) with underground access is absolutely worth it. Allow 3-4 hours for all three sites.',
      category: 'attraction', rating: 4.9, price_level: 2,
      address: 'Piazza del Colosseo 1, 00184 Roma',
      website_url: 'https://www.coopculture.it/en/colosseo-e-shop.cfm',
      duration: '3-4 hours (Colosseum + Forum + Palatine)', order_index: 0,
    },
    {
      title: 'Vatican Museums & Sistine Chapel',
      description:
        'One of the world\'s greatest art collections, culminating in Michelangelo\'s Sistine Chapel ceiling. ' +
        'Book the earliest slot (7:30 AM) at tickets.museivaticani.va. Standard + reservation: €21/person. ' +
        'Pro tip: use the exit from the Sistine Chapel directly into St. Peter\'s Basilica to skip the external queue. ' +
        'No photos in Sistine Chapel. Dress code: covered shoulders and knees. Allow 3-4 hours minimum. Closed Sundays (except last Sunday of month — free but insane queues).',
      category: 'attraction', rating: 4.9, price_level: 3,
      address: 'Viale Vaticano, 00165 Roma',
      website_url: 'https://tickets.museivaticani.va/home',
      duration: '3-4 hours', order_index: 1,
    },
    {
      title: 'St. Peter\'s Basilica & Dome',
      description:
        'The world\'s largest church, free to enter. Michelangelo\'s Pietà, Bernini\'s baldachin, and the dome climb with panoramic views of Rome. ' +
        'Dome: €8 (stairs) or €10 (elevator + stairs). Dress code enforced. Use the Sistine Chapel exit shortcut to skip the main queue.',
      category: 'attraction', rating: 4.8, price_level: 1,
      address: 'Piazza San Pietro, 00120 Vatican City',
      duration: '1.5-2 hours', order_index: 2,
    },
    {
      title: 'Pantheon',
      description:
        'Best-preserved ancient Roman building (125 AD). The unreinforced concrete dome with its open oculus is an engineering marvel. ' +
        'Free entry but €5 reservation required since 2023. Book at pantheonroma.com. Raphael is buried here. ' +
        'When it rains, water falls through the oculus onto the slightly convex floor and drains away — magical.',
      category: 'attraction', rating: 4.8, price_level: 1,
      address: 'Piazza della Rotonda, 00186 Roma',
      website_url: 'https://www.pantheonroma.com',
      duration: '30-45 min', order_index: 3,
    },
    {
      title: 'Trevi Fountain',
      description:
        'Baroque masterpiece (1762) and Rome\'s most famous fountain. Toss a coin with your right hand over your left shoulder to ensure your return to Rome. ' +
        'Absolutely stunning when illuminated at night — visit both day and night if possible. Extremely crowded during the day. Free.',
      category: 'attraction', rating: 4.7, price_level: 1,
      address: 'Piazza di Trevi, 00187 Roma',
      duration: '15-30 min', order_index: 4,
    },
    {
      title: 'Spanish Steps',
      description:
        '135 steps connecting Piazza di Spagna to the Trinità dei Monti church. Iconic but you can\'t sit on them anymore (€250 fine). ' +
        'Nice for photos and the luxury shopping district on Via dei Condotti below. Keats-Shelley Memorial House at the base.',
      category: 'attraction', rating: 4.3, price_level: 1,
      address: 'Piazza di Spagna, 00187 Roma',
      duration: '15-20 min', order_index: 5,
    },
    {
      title: 'Trastevere Neighborhood',
      description:
        'Rome\'s most charming neighborhood — cobblestone streets, ivy-covered buildings, artisan shops, and the city\'s best evening atmosphere. ' +
        'Cross the Tiber and get lost in the narrow alleys. Best at golden hour and after dark. Home to many of Rome\'s best trattorias. ' +
        'Piazza di Santa Maria in Trastevere is the heart — the basilica has stunning 12th-century mosaics.',
      category: 'attraction', rating: 4.7, price_level: 1,
      address: 'Trastevere, 00153 Roma',
      duration: '2-3 hours (wandering + dinner)', order_index: 6,
    },
    {
      title: 'Piazza Navona',
      description:
        'Stunning Baroque square built on the ruins of Domitian\'s stadium. Bernini\'s Fountain of the Four Rivers dominates. ' +
        'Street artists, buskers, beautiful architecture. Avoid the overpriced cafés on the square itself — step one block away for better value.',
      category: 'attraction', rating: 4.6, price_level: 1,
      address: 'Piazza Navona, 00186 Roma',
      duration: '20-30 min', order_index: 7,
    },
    {
      title: 'Castel Sant\'Angelo',
      description:
        'Originally Hadrian\'s mausoleum (139 AD), later a papal fortress connected to the Vatican by a secret passageway. ' +
        'Beautiful from outside, especially crossing Ponte Sant\'Angelo with Bernini\'s angel statues. Interior visit €15, panoramic terrace at top.',
      category: 'attraction', rating: 4.5, price_level: 2,
      address: 'Lungotevere Castello, 50, 00186 Roma',
      duration: '1-1.5 hours', order_index: 8,
    },
    // RESTAURANTS
    {
      title: 'Da Enzo al 29 (Trastevere)',
      description:
        'Legendary Roman trattoria — the cacio e pepe and carbonara here are considered among Rome\'s absolute best. ' +
        'No reservations, queue starts before opening. Go at 19:00 sharp. Small, family-run, all traditional Roman dishes. €€. Budget: €25-35/person.',
      category: 'food', rating: 4.8, price_level: 2,
      address: 'Via dei Vascellari, 29, 00153 Roma',
      duration: '1-1.5 hours', order_index: 9,
    },
    {
      title: 'Tonnarello (Trastevere)',
      description:
        'Large, lively Trastevere trattoria that takes reservations (rare for this neighborhood). Excellent Roman classics — ' +
        'cacio e pepe served in a wheel of pecorino, fantastic amatriciana. Great outdoor seating. €€.',
      category: 'food', rating: 4.6, price_level: 2,
      address: 'Via della Paglia, 1-2-3, 00153 Roma',
      duration: '1-1.5 hours', order_index: 10,
    },
    {
      title: 'Bonci Pizzarium',
      description:
        'Rome\'s best pizza al taglio (by the slice), by Gabriele Bonci. Creative toppings on perfectly airy, crispy crust. ' +
        'Near the Vatican — perfect post-museum lunch. Always a queue but moves fast. Sold by weight. €.',
      category: 'food', rating: 4.8, price_level: 1,
      address: 'Via della Meloria, 43, 00136 Roma',
      duration: '20-30 min', order_index: 11,
    },
    {
      title: 'Supplizio',
      description:
        'Gourmet supplì (Rome\'s signature fried rice balls with stretchy mozzarella inside). ' +
        'Classic supplì al telefono plus creative variations. The ultimate Roman street food. Near Campo de\' Fiori. €.',
      category: 'food', rating: 4.6, price_level: 1,
      address: 'Via dei Banchi Vecchi, 143, 00186 Roma',
      duration: '15-20 min', order_index: 12,
    },
    {
      title: 'Roscioli Salumeria con Cucina',
      description:
        'Part deli, part restaurant — one of Rome\'s most celebrated food destinations. Exceptional cured meats, cheeses, carbonara, and wine list. ' +
        'Reservations essential. More upscale but worth it for a special meal. €€€.',
      category: 'food', rating: 4.7, price_level: 3,
      address: 'Via dei Giubbonari, 21, 00186 Roma',
      website_url: 'https://www.salumeriaroscioli.com',
      duration: '1.5-2 hours', order_index: 13,
    },
    {
      title: 'La Taverna dei Fori Imperiali (Monti)',
      description:
        'Family-run trattoria in the hip Monti neighborhood, walking distance from the Colosseum. ' +
        'Excellent traditional Roman pastas at fair prices. Much better than tourist traps near the Colosseum. €€.',
      category: 'food', rating: 4.5, price_level: 2,
      address: 'Via della Madonna dei Monti, 9, 00184 Roma',
      duration: '1 hour', order_index: 14,
    },
    {
      title: 'Fatamorgana (Artisanal Gelato)',
      description:
        'Rome\'s best artisanal gelato — all natural ingredients, creative flavors (Kentucky tobacco, Sicilian almond, dark chocolate with wasabi). ' +
        'Multiple locations; Monti and Trastevere are most convenient. €.',
      category: 'food', rating: 4.7, price_level: 1,
      address: 'Piazza degli Zingari, 5, 00184 Roma (Monti location)',
      duration: '15 min', order_index: 15,
    },
    // ACTIVITIES
    {
      title: 'Evening Passeggiata & Night Walk',
      description:
        'Rome at night is magical. Walk from Trastevere across the Tiber, past the illuminated Castel Sant\'Angelo, through Piazza Navona, ' +
        'to the Pantheon (lit up beautifully), and on to Trevi Fountain (less crowded after 10 PM). Gelato in hand, cobblestones underfoot.',
      category: 'activity', rating: 4.8, price_level: 1,
      duration: '2-3 hours', order_index: 16,
    },
    {
      title: 'Campo de\' Fiori Morning Market',
      description:
        'Lively outdoor market every morning (except Sunday) with fresh produce, flowers, spices, and local products. ' +
        'Great for breakfast pastries and people-watching. The square transforms into a bar/nightlife scene after dark.',
      category: 'activity', rating: 4.3, price_level: 1,
      address: 'Campo de\' Fiori, 00186 Roma',
      duration: '30-45 min', order_index: 17,
    },
    {
      title: 'The Roman Quartet Pasta Challenge',
      description:
        'Try all four of Rome\'s iconic pastas during your visit: cacio e pepe (pecorino + black pepper), carbonara (guanciale + egg + pecorino), ' +
        'amatriciana (guanciale + tomato + pecorino), and gricia (guanciale + pecorino, the "white amatriciana"). ' +
        'Unofficial food challenge — Da Enzo, Tonnarello, Roscioli, and Felice a Testaccio are top spots for each.',
      category: 'activity', rating: 4.9, price_level: 2,
      duration: 'Across your whole trip', order_index: 18,
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
    { month: 1,  avg_high_c: 12.0, avg_low_c: 3.0,  rainy_days: 7,  sunshine_hours: 4.0 },
    { month: 2,  avg_high_c: 13.0, avg_low_c: 3.5,  rainy_days: 7,  sunshine_hours: 5.0 },
    { month: 3,  avg_high_c: 16.0, avg_low_c: 5.5,  rainy_days: 7,  sunshine_hours: 6.0 },
    { month: 4,  avg_high_c: 19.0, avg_low_c: 8.0,  rainy_days: 7,  sunshine_hours: 7.5 },
    { month: 5,  avg_high_c: 24.0, avg_low_c: 12.0, rainy_days: 5,  sunshine_hours: 9.0 },
    { month: 6,  avg_high_c: 28.0, avg_low_c: 16.0, rainy_days: 3,  sunshine_hours: 10.0 },
    { month: 7,  avg_high_c: 31.5, avg_low_c: 18.5, rainy_days: 2,  sunshine_hours: 11.0 },
    { month: 8,  avg_high_c: 31.5, avg_low_c: 18.5, rainy_days: 3,  sunshine_hours: 10.0 },
    { month: 9,  avg_high_c: 27.0, avg_low_c: 15.5, rainy_days: 5,  sunshine_hours: 8.0 },
    { month: 10, avg_high_c: 22.0, avg_low_c: 11.5, rainy_days: 7,  sunshine_hours: 6.0 },
    { month: 11, avg_high_c: 16.5, avg_low_c: 7.0,  rainy_days: 9,  sunshine_hours: 4.5 },
    { month: 12, avg_high_c: 12.5, avg_low_c: 4.0,  rainy_days: 8,  sunshine_hours: 3.5 },
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
      name: 'Hotel Santa Maria (Trastevere)',
      type: 'hotel', status: 'researched',
      address: 'Vicolo del Piede 2, 00153 Roma',
      cost_per_night: 150, total_cost: 300, currency: 'EUR',
      booking_url: 'https://www.htlsantamaria.com',
      rating: 4.5,
      notes: 'Beautiful courtyard hotel in the heart of Trastevere. Former 16th-century cloister with orange tree garden. Perfect base for evening strolls and dinner.',
    },
    {
      name: 'Hotel Bramante (Vatican/Prati)',
      type: 'hotel', status: 'researched',
      address: 'Vicolo delle Palline 24, 00193 Roma',
      cost_per_night: 120, total_cost: 240, currency: 'EUR',
      booking_url: 'https://www.hotelbramante.com',
      rating: 4.3,
      notes: 'Charming boutique in a 16th-century building steps from the Vatican. Quiet cobblestone lane. Some rooms have original frescoes.',
    },
    {
      name: 'Hotel Raffaello (Monti/Termini)',
      type: 'hotel', status: 'researched',
      address: 'Via Urbana 3, 00184 Roma',
      cost_per_night: 100, total_cost: 200, currency: 'EUR',
      booking_url: 'https://www.hotelraffaello.it',
      rating: 4.2,
      notes: 'Good mid-range option in trendy Monti neighborhood. Walking distance to Colosseum and Termini station. Rooftop breakfast.',
    },
    {
      name: 'Trastevere Airbnb (typical option)',
      type: 'airbnb', status: 'researched',
      address: 'Trastevere, 00153 Roma',
      cost_per_night: 90, total_cost: 180, currency: 'EUR',
      rating: 4.4,
      notes: 'Trastevere apartments on Airbnb typically €80-120/night. Look for places on quieter side streets. Kitchen access great for morning espresso.',
    },
    {
      name: 'The RomeHello (Budget)',
      type: 'hostel', status: 'researched',
      address: 'Via Torino 45, 00184 Roma',
      cost_per_night: 45, total_cost: 90, currency: 'EUR',
      booking_url: 'https://www.the-romehello.com',
      rating: 4.4,
      notes: 'Trendy hostel near Termini. Private rooms ~€80-100. Rooftop terrace. Walking distance to Colosseum. Great budget option.',
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

  console.log('\n✅ Rome fully seeded!');
  console.log('\n📋 Summary:');
  console.log('   ✓ Description updated');
  console.log('   ✓ 19 highlights (9 attractions, 7 restaurants, 3 activities)');
  console.log('   ✓ 12 months weather data');
  console.log('   ✓ 5 accommodation options (€45-150/night)');
  console.log('   ✓ Transport notes (3.5hr train from Vicenza, local metro)');
  console.log('   ✓ Photo URL set');
  console.log('   ✓ Research status: fully_researched');
  console.log('   ✓ Safety notes with scam awareness');

  await sql.end();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
