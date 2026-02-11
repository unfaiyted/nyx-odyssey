/**
 * Seed Florence — Complete Destination Profile
 * The Cradle of the Renaissance: Uffizi, Duomo, bistecca, Oltrarno artisans
 * Usage: bun run scripts/seed-florence-complete.ts
 */
import postgres from 'postgres';
import { nanoid } from 'nanoid';

const CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const sql = postgres(CONNECTION_STRING);

const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh';
const DEST_ID = 'MV_8JF04jaW_AjIOtvnP1';

async function seed() {
  console.log('🏛️ Seeding Florence — Complete Destination Profile...\n');

  // ── 1. Update trip_destinations (description, photoUrl, status) ──
  await sql`
    UPDATE trip_destinations SET
      description = ${
        'Florence is the cradle of the Renaissance — a compact, walkable city where every cobblestone corner reveals another masterpiece. ' +
        'Brunelleschi\'s terracotta dome dominates the skyline, the Uffizi houses the world\'s greatest collection of Italian Renaissance art, ' +
        'and Michelangelo\'s David stands in eternal perfection at the Accademia. But Florence is more than museums: ' +
        'it\'s the smoky char of a 1.2kg bistecca alla fiorentina grilled over chestnut coals, a lampredotto sandwich from a street cart, ' +
        'a sunset from Piazzale Michelangelo with the whole city glowing gold below. Cross the Ponte Vecchio into Oltrarno to find ' +
        'artisan workshops, natural wine bars, and trattorias where tourists haven\'t yet overrun the locals. ' +
        'The Chianti hills are just 30 minutes south for vineyard day trips. At 2–2.5 hours from Vicenza by car or train, ' +
        'Florence makes a perfect weekend escape — but book the Uffizi, Accademia, and Duomo dome climb well in advance, ' +
        'because the whole world wants to be here.'
      },
      photo_url = ${'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=800&q=80'},
      status = 'researched',
      research_status = 'fully_researched'
    WHERE id = ${DEST_ID}
  `;
  console.log('  ✓ Updated description, photo, status');

  const travelTips = JSON.stringify([
    'Book Uffizi tickets 2-4 weeks ahead at uffizi.it (€25 + €4 reservation). Sells out in summer.',
    'Book Brunelleschi Dome climb 1-2 months ahead at duomo.firenze.it (€30 Brunelleschi Pass). 463 steps, no elevator.',
    'Book Accademia (David) 2+ weeks ahead at galleriaaccademiafirenze.it (€16 + reservation).',
    'Firenze Card (€85/72hr) covers 72+ museums with skip-the-line — worth it for 3+ days.',
    'Avoid ZTL driving zone! Cameras auto-fine you €100+. Park outside centro.',
    "Bistecca alla fiorentina is sold by weight (~€45-55/kg). It's meant for sharing (minimum ~1 kg). Always served rare (al sangue).",
    'Lampredotto sandwich from street carts (look for "trippaio" signs) is the real Florentine fast food — €4-5.',
    'Cross the Arno to Oltrarno for artisan workshops, less touristy dining, and the best aperitivo spots.',
    'Piazzale Michelangelo at sunset is non-negotiable. Bring wine from an enoteca. Bus 12/13 or 20-min walk uphill.',
    'Chianti wine region starts 30 min south — easy half-day trip by car. Greve in Chianti is the gateway town.',
  ]);

  // ── 2. Update destination_research (enrich transport, weather notes) ──
  await sql`
    UPDATE destination_research SET
      transport_notes = ${
        'FROM VICENZA BY CAR: A4 east → A13 south → A1 south via Bologna, ~280 km, 2.5–3 hrs. Tolls ~€20-25 each way. ' +
        '⚠️ ZTL (Zona Traffico Limitato) covers the entire centro storico — entering means an automatic €100+ fine. ' +
        'Park outside: Parcheggio Beccaria (€2/hr, 10-min walk to center), Garage Palazzo Vecchio (€3/hr, central but pricey), ' +
        'or free-ish lots at Piazzale Michelangelo (limited). ' +
        'BY TRAIN: Trenitalia Frecciarossa from Vicenza → Firenze Santa Maria Novella (SMN), ~2 hrs direct or ~2.5 hrs with Bologna change. ' +
        '€25-55 each way if booked 2-4 weeks ahead at trenitalia.com. Italo also runs the route. SMN station is right in the center. ' +
        'BY AIR: Florence Airport (FLR/Peretola) has limited routes. Better to fly into Bologna (BLQ) + 35-min train to Florence. ' +
        'LOCAL TRANSPORT: Florence is extremely walkable — the entire historic center is ~2 km across. ' +
        'ATAF buses cover outer areas. Tram Line T1 connects SMN station to suburbs. Single ride €1.50, 90-min pass €2.50. ' +
        'Bus 12/13 to Piazzale Michelangelo. No metro system. Taxis available but rarely needed in centro. ' +
        'Bike rental popular — Florence is flat. Mobike/Lime e-scooters available.'
      },
      weather_notes = ${
        'Mediterranean climate with hot summers and mild winters. July-August average highs 32-34°C — can be brutally hot with limited shade in piazzas. ' +
        'Spring (April-May) is ideal: 18-24°C, manageable crowds, flowers blooming in Boboli Gardens. ' +
        'September-October also excellent: warm (22-27°C), lighter tourist traffic, grape harvest in nearby Chianti. ' +
        'November-February: cool and damp (8-12°C highs), occasional frost, but far fewer tourists and lower hotel prices. ' +
        'Rain peaks November-December (~8-9 rainy days/month). The Arno can look dramatic during autumn rains.'
      },
      budget_currency = 'EUR',
      cultural_notes = ${
        'Florence is the birthplace of the Renaissance, home to the Medici dynasty who bankrolled an artistic revolution. ' +
        'Food culture is deeply Tuscan: bistecca alla fiorentina (T-bone from Chianina cattle, min 1 kg, served rare), ' +
        'lampredotto (tripe sandwich — the city\'s iconic street food), ribollita (bread and vegetable soup), schiacciata (Florentine focaccia), ' +
        'and pappa al pomodoro (tomato bread soup). Wine is Chianti Classico, Brunello, and Super Tuscans. ' +
        'Florentines are proud and direct — less effusive than Romans. Leather craft is a local tradition centered on Santa Croce and Oltrarno. ' +
        'Dress code enforced at all churches: covered shoulders and knees. Many museums closed Mondays. ' +
        'The passeggiata is alive and well — join the evening stroll along the Lungarno or through Piazza della Repubblica.'
      },
      travel_tips = ${travelTips},
      updated_at = NOW()
    WHERE destination_id = ${DEST_ID}
  `;
  console.log('  ✓ Updated research (transport, weather, cultural notes, tips)');

  // ── 3. Add more highlights (keep existing 6, add restaurants, activities, attractions) ──
  // Get current max order_index
  const maxIdx = await sql`SELECT COALESCE(MAX(order_index), -1) as m FROM destination_highlights WHERE destination_id = ${DEST_ID}`;
  let idx = (maxIdx[0].m as number) + 1;

  const newHighlights = [
    // ATTRACTIONS
    {
      title: 'Galleria dell\'Accademia (Michelangelo\'s David)',
      description:
        'Home to the original 4.3m marble David — Michelangelo\'s masterpiece of human form. Also houses the haunting unfinished ' +
        '"Prisoners" sculptures, seemingly struggling to emerge from raw marble. ⚠️ Timed entry required — book 2+ weeks ahead at ' +
        'galleriaaccademiafirenze.it. €16 + reservation fee. Closed Mondays. Allow 1-1.5 hours.',
      category: 'attraction', rating: 4.8, price_level: 2,
      address: 'Via Ricasoli 58/60, 50129 Firenze',
      website_url: 'https://www.galleriaaccademiafirenze.it',
      duration: '1-1.5 hours',
    },
    {
      title: 'Palazzo Pitti & Boboli Gardens',
      description:
        'Massive Renaissance palace on the Oltrarno side — former Medici residence housing multiple museums (Palatine Gallery with Raphael and Titian, ' +
        'Modern Art Gallery, Costume Gallery). Boboli Gardens behind are a masterpiece of Italian landscaping with grottoes, fountains, and city views. ' +
        'Combined ticket €22. Allow 2-3 hours for palace + gardens.',
      category: 'attraction', rating: 4.6, price_level: 2,
      address: 'Piazza dei Pitti 1, 50125 Firenze',
      duration: '2-3 hours',
    },
    {
      title: 'Santa Croce Basilica',
      description:
        'The "Temple of the Italian Glories" — burial place of Michelangelo, Galileo, Machiavelli, and Rossini. ' +
        'Beautiful Gothic church with Giotto frescoes. Leather school inside (Scuola del Cuoio) sells genuine Florentine leather goods. €8 entry.',
      category: 'attraction', rating: 4.5, price_level: 1,
      address: 'Piazza di Santa Croce 16, 50122 Firenze',
      duration: '45 min-1 hour',
    },
    {
      title: 'Oltrarno Neighborhood',
      description:
        'The "other side of the Arno" — Florence\'s most authentic neighborhood. Artisan workshops (leather, bookbinding, woodwork), ' +
        'natural wine bars, local trattorias without tourist markup. Piazza Santo Spirito hosts a daily morning market and lively aperitivo scene. ' +
        'Wander Via Maggio and Borgo San Frediano for the real Florence.',
      category: 'attraction', rating: 4.7, price_level: 1,
      address: 'Oltrarno, Florence',
      duration: '2-3 hours (wandering)',
    },
    {
      title: 'San Lorenzo Market & Medici Chapels',
      description:
        'Outdoor leather market surrounding the Basilica di San Lorenzo (haggling expected — start at 50% of asking price). ' +
        'Inside, the Medici Chapels feature Michelangelo\'s New Sacristy with his famous Dawn/Dusk and Night/Day sculptures. ' +
        'Chapels: €9, timed entry. The market is great for leather jackets, bags, and souvenirs but quality varies — check stitching.',
      category: 'attraction', rating: 4.3, price_level: 2,
      address: 'Piazza San Lorenzo, 50123 Firenze',
      duration: '1-2 hours',
    },
    // RESTAURANTS
    {
      title: 'Trattoria Mario',
      description:
        'Iconic no-frills Florentine lunch spot since 1953. Communal tables, handwritten menu, no reservations. ' +
        'The ribollita and bistecca are legendary. Cash only. Opens 12:00 — arrive 10 min early or face a long queue. ' +
        'Closes 3:30 PM, lunch only. €15-25/person. This is the real Florence.',
      category: 'food', rating: 4.7, price_level: 1,
      address: 'Via Rosina 2, 50123 Firenze (near San Lorenzo)',
      duration: '45 min-1 hour',
    },
    {
      title: 'Buca Mario',
      description:
        'Historic cellar restaurant since 1886 — one of Florence\'s oldest. Classic Florentine fare in a vaulted underground dining room. ' +
        'The bistecca alla fiorentina here is excellent (€50-55/kg). Also try pappardelle al cinghiale (wild boar) and pappa al pomodoro. ' +
        'Reservations recommended. €30-50/person.',
      category: 'food', rating: 4.5, price_level: 3,
      address: 'Piazza degli Ottaviani 16R, 50123 Firenze',
      duration: '1.5 hours',
    },
    {
      title: 'Trattoria Sostanza (Il Troia)',
      description:
        'Legendary since 1869 for two dishes: butter chicken breast and artichoke omelette. Tiny, cramped, communal tables, no frills. ' +
        'The bistecca is also superb. Cash only, no reservations for walk-ins (call to try). Lunch and dinner. €25-40/person. A Florentine institution.',
      category: 'food', rating: 4.8, price_level: 2,
      address: 'Via del Porcellana 25R, 50123 Firenze',
      duration: '1 hour',
    },
    {
      title: 'All\'Antico Vinaio',
      description:
        'Florence\'s most famous sandwich shop — and possibly Italy\'s. Giant schiacciata sandwiches stuffed with cured meats, truffle cream, ' +
        'burrata, artichokes. Always a queue but moves fast. €5-8 for a massive sandwich. Multiple locations on Via dei Neri. ' +
        'Perfect quick lunch between museums.',
      category: 'food', rating: 4.6, price_level: 1,
      address: 'Via dei Neri 74R, 50122 Firenze',
      duration: '15-20 min',
    },
    {
      title: 'Il Latini',
      description:
        'Boisterous, old-school Florentine feast house. Prosciutto hangs from the ceiling, wine flows freely, and massive bisteccas arrive on platters. ' +
        'Fixed-ish menu of Tuscan classics. Communal tables, loud, fun — a theatrical dining experience. Reservations essential. €40-55/person.',
      category: 'food', rating: 4.4, price_level: 3,
      address: 'Via dei Palchetti 6R, 50123 Firenze',
      duration: '1.5-2 hours',
    },
    {
      title: 'Lampredotto Street Carts (Trippaio)',
      description:
        'Florence\'s signature street food: lampredotto (the fourth stomach of a cow) simmered for hours, served in a bread roll ' +
        'dipped in the cooking broth, topped with salsa verde and spicy sauce. Look for "trippaio" carts — best ones at Mercato Nuovo (near Porcellino), ' +
        'Piazza dei Cimatori, and outside Mercato Centrale. €4-5. The ultimate Florentine experience.',
      category: 'food', rating: 4.5, price_level: 1,
      address: 'Various locations (street carts)',
      duration: '10 min',
    },
    {
      title: 'Le Volpi e l\'Uva',
      description:
        'Intimate wine bar near Ponte Vecchio on the Oltrarno side. Exceptional natural wines by the glass, paired with ' +
        'crostini, cheese boards, and cured meats. Perfect aperitivo spot. Knowledgeable staff who love talking wine. €10-20.',
      category: 'food', rating: 4.6, price_level: 2,
      address: 'Piazza dei Rossi 1, 50125 Firenze',
      duration: '1 hour',
    },
    {
      title: 'Gelateria La Carraia',
      description:
        'Excellent artisanal gelato at honest prices right by the Arno in Oltrarno. Try crema fiorentina, pistachio, or dark chocolate. ' +
        'Small cone from €1.50. Perfect post-Ponte Vecchio treat. Open late.',
      category: 'food', rating: 4.5, price_level: 1,
      address: 'Piazza Nazario Sauro 25R, 50124 Firenze',
      duration: '10 min',
    },
    // ACTIVITIES
    {
      title: 'Chianti Day Trip',
      description:
        'The rolling Chianti hills start just 30 minutes south of Florence. Drive the SR222 "Chiantigiana" road through vineyards and hilltop villages. ' +
        'Greve in Chianti (main town, Piazza Matteotti, butcher Macelleria Falorni), Panzano (famous butcher Dario Cecchini), ' +
        'Castellina in Chianti, Radda in Chianti. Most wineries require reservations for tastings (€15-30). Antinori nel Chianti Classico ' +
        'is architecturally stunning. Half-day minimum, full day ideal. Car essential.',
      category: 'activity', rating: 4.8, price_level: 2,
      duration: 'Half to full day',
    },
    {
      title: 'Sunset at Piazzale Michelangelo',
      description:
        'THE Florence experience. This panoramic terrace offers the iconic postcard view of the entire city — Duomo, Ponte Vecchio, ' +
        'Arno, Tuscan hills. Arrive 30-45 min before sunset to claim a spot on the steps. Bring wine and snacks from a nearby enoteca. ' +
        'Bus 12/13 from center, or a scenic 20-min uphill walk through the rose garden (Giardino delle Rose, free). Sunset ~9 PM in late June.',
      category: 'activity', rating: 4.9, price_level: 1,
      duration: '1-2 hours',
    },
    {
      title: '2-3 Day Florence Itinerary',
      description:
        'DAY 1: Uffizi (morning, pre-booked), lunch at Trattoria Mario, Piazza Signoria + Loggia dei Lanzi, Ponte Vecchio → Oltrarno walk, ' +
        'aperitivo at Le Volpi e l\'Uva, sunset at Piazzale Michelangelo, dinner at Buca Mario. ' +
        'DAY 2: Duomo dome climb (8:30 AM slot), Giotto\'s Bell Tower, Baptistery, lunch at Mercato Centrale, Accademia (David), ' +
        'San Lorenzo market, Santa Croce, dinner in Oltrarno. ' +
        'DAY 3 (optional): Palazzo Pitti + Boboli Gardens morning, Chianti day trip afternoon, Dario Cecchini\'s bistecca in Panzano.',
      category: 'activity', rating: 4.7, price_level: 2,
      duration: '2-3 days',
    },
  ];

  for (const h of newHighlights) {
    await sql`INSERT INTO destination_highlights (
      id, destination_id, title, description, category, rating, price_level,
      address, website_url, duration, order_index
    ) VALUES (
      ${nanoid()}, ${DEST_ID}, ${h.title}, ${h.description}, ${h.category},
      ${h.rating}, ${h.price_level}, ${h.address || null}, ${h.website_url || null},
      ${h.duration || null}, ${idx}
    )`;
    console.log(`  🌟 Highlight: ${h.title}`);
    idx++;
  }

  // ── 4. Accommodations ──
  await sql`DELETE FROM accommodations WHERE destination_id = ${DEST_ID}`;

  const accommodations = [
    {
      name: 'Hotel Davanzati (Centro)',
      type: 'hotel', status: 'researched',
      address: 'Via Porta Rossa 5, 50123 Firenze',
      cost_per_night: 160, total_cost: 320, currency: 'EUR',
      booking_url: 'https://www.hoteldavanzati.it',
      rating: 4.6,
      notes: 'Boutique hotel in a 14th-century palazzo between Piazza della Signoria and Ponte Vecchio. Beautiful frescoed ceilings, ' +
        'free minibar, rooftop terrace with Duomo views. Excellent central location. Breakfast included.',
    },
    {
      name: 'Hotel Palazzo Guadagni (Oltrarno)',
      type: 'hotel', status: 'researched',
      address: 'Piazza Santo Spirito 9, 50125 Firenze',
      cost_per_night: 130, total_cost: 260, currency: 'EUR',
      booking_url: 'https://www.palazzoguadagni.com',
      rating: 4.5,
      notes: 'Charming Renaissance palazzo right on Piazza Santo Spirito — the heart of Oltrarno. Loggia terrace with panoramic views. ' +
        'Surrounded by great restaurants and wine bars. Less touristy location, more authentic Florence feel.',
    },
    {
      name: 'Hotel Perseo (Near SMN Station)',
      type: 'hotel', status: 'researched',
      address: 'Via de\' Cerretani 1, 50123 Firenze',
      cost_per_night: 95, total_cost: 190, currency: 'EUR',
      booking_url: 'https://www.hotelperseo.it',
      rating: 4.2,
      notes: 'Solid mid-range option steps from the Duomo and train station. Family-run, clean, good breakfast. ' +
        'Perfect if arriving by train — 2-min walk from SMN. Good value for the location.',
    },
    {
      name: 'Oltrarno Airbnb Apartment',
      type: 'airbnb', status: 'researched',
      address: 'Oltrarno/Santo Spirito area, Firenze',
      cost_per_night: 100, total_cost: 200, currency: 'EUR',
      rating: 4.4,
      notes: 'Oltrarno apartments on Airbnb typically €80-120/night for a 1-bedroom. Kitchen access for morning coffee and light meals. ' +
        'Look for places near Piazza Santo Spirito or Borgo San Frediano. Best neighborhood for local vibes and evening dining.',
    },
    {
      name: 'Plus Florence (Budget/Hostel)',
      type: 'hostel', status: 'researched',
      address: 'Via Santa Caterina d\'Alessandria 15, 50129 Firenze',
      cost_per_night: 40, total_cost: 80, currency: 'EUR',
      booking_url: 'https://www.plusflorence.com',
      rating: 4.3,
      notes: 'Modern hostel with pool, rooftop bar, and private rooms available (~€70-90). Near San Lorenzo market and train station. ' +
        'Dorm beds from €25-40. Good social atmosphere. Excellent budget base.',
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

  console.log('\n✅ Florence fully seeded!');
  console.log('\n📋 Summary:');
  console.log('   ✓ Description updated (full paragraph)');
  console.log('   ✓ 16 new highlights added (5 attractions, 8 restaurants, 3 activities)');
  console.log('   ✓ 12 months weather already existed');
  console.log('   ✓ 5 accommodation options (€40-160/night)');
  console.log('   ✓ Transport notes enriched (car, train, local from Vicenza)');
  console.log('   ✓ Photo URL set');
  console.log('   ✓ Research status: fully_researched');

  await sql.end();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
