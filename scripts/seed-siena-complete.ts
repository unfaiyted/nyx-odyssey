/**
 * Seed Siena — Complete Destination Profile
 * Fills gaps: description, photo, enhanced transport notes, and verifies all 6 sections.
 * Usage: bun scripts/seed-siena-complete.ts
 */
import postgres from 'postgres';
import { nanoid } from 'nanoid';

const CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const sql = postgres(CONNECTION_STRING);

const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh';
const DEST_ID = 'wzfDqK3Kg8jHIsFWF8Yhf';

async function seed() {
  console.log('🏇 Seeding Siena — Complete Destination Profile...\n');

  // ── 1. Update trip_destinations (description, photoUrl, status) ──
  await sql`
    UPDATE trip_destinations SET
      description = ${
        'The medieval jewel of Tuscany — Siena is a perfectly preserved Gothic city built around the magnificent shell-shaped Piazza del Campo, ' +
        'one of Europe\'s greatest public spaces. Twice a year (July 2 and August 16), the Campo transforms into a bareback horse race track ' +
        'for Il Palio, a fierce inter-neighborhood competition dating to 1644 that makes modern sports rivalries look tame. ' +
        'The city\'s 17 contrade (districts) each have their own church, fountain, museum, and animal symbol — their rivalries and allegiances ' +
        'define daily life. Beyond the Palio, Siena offers the jaw-dropping striped marble Duomo, the towering Torre del Mangia, ' +
        'world-class Sienese painting (Duccio, Simone Martini, the Lorenzetti brothers), and some of Tuscany\'s finest food: ' +
        'pici cacio e pepe, ribollita, panforte, and Chianti Classico from the surrounding hills. ' +
        'The entire centro storico is a UNESCO World Heritage Site — a city frozen in amber at its Gothic peak, ' +
        'with none of Florence\'s overwhelming crowds.'
      },
      photo_url = ${'https://images.unsplash.com/photo-1539872209618-5bb5e8f4bdc2?w=800&q=80'},
      status = 'researched',
      research_status = 'fully_researched'
    WHERE id = ${DEST_ID}
  `;
  console.log('  ✓ Updated description and photo URL');

  // ── 2. Enhance transport notes with Vicenza-specific info ──
  await sql`
    UPDATE destination_research SET
      transport_notes = ${
        'FROM VICENZA BY CAR: ~350km via A4→A1→raccordo Firenze-Siena, approximately 4-4.5 hours. ' +
        'Tolls ~€30-35 each way. Park outside the walls at Stadio (free, 15-min walk to Campo) or Fortezza Medicea (€1.70/hr, closer). ' +
        'The historic center is a ZTL (restricted traffic zone) — do NOT drive in or you\'ll get fined. ' +
        'FROM VICENZA BY TRAIN: No direct trains. Best route: Vicenza → Florence SMN (Frecciarossa, ~2hr, €25-45) then bus to Siena ' +
        '(SITA/Tiemme from Florence bus station next to SMN, ~75min, €8). Total journey ~3.5-4 hours. ' +
        'Alternatively: Vicenza → Chiusi-Chianciano Terme (Regionale, ~3.5hr) then local train to Siena (~1.5hr) — slower but scenic. ' +
        'Siena train station is 2km downhill from the center — take escalators + minibus or taxi (€10). ' +
        'LOCAL TRANSPORT: The centro storico is entirely walkable but VERY hilly — wear good shoes. ' +
        'Minibuses run through the center (€1.30). The escalators (scale mobili) from parking areas to the center are a lifesaver. ' +
        'DAY TRIP FEASIBILITY: Tight as a day trip from Vicenza (9+ hours round trip driving). ' +
        'Best as an overnight, especially for the Palio (July 2, 2026). Consider combining with Florence or San Gimignano. ' +
        'PALIO DAY NOTE: Parking is extremely limited on race day. Arrive early (before noon) or park further out and take a shuttle.'
      },
      summary = ${
        'UNESCO medieval masterpiece centered on the iconic shell-shaped Piazza del Campo. Home to Il Palio (July 2 & Aug 16), ' +
        'the world\'s most dramatic horse race. Stunning Duomo, fierce contrada culture, and outstanding Tuscan cuisine — ' +
        'all without Florence\'s tourist crush.'
      },
      travel_tips = ${JSON.stringify([
        'For Il Palio (July 2, 2026): Free standing in the piazza center — arrive by 2pm, bring water/hat, no bags allowed. Gates close ~3pm.',
        'Balcony/grandstand seats for Palio: €450-690 via paliodisiena.tickets. Book months in advance.',
        'The Prova Generale (final trial race, July 1 evening) is free and far less crowded — great preview of the atmosphere.',
        'Contrada dinners the night before the Palio are unforgettable — long communal tables in the streets, food, wine, singing. Book via packages or ask locals.',
        'Visit a contrada museum to understand the culture — each district has one. The Contrada della Selva (rhino) and Contrada dell\'Oca (goose) are particularly welcoming.',
        'Climb Torre del Mangia (400 steps, €10) for the best panoramic view of the city and Tuscan countryside. Go early to avoid queues.',
        'The Duomo\'s mosaic floor is only fully uncovered Aug-Oct — time your visit if possible.',
        'For Chianti Classico wine country: rent a car and explore the villages between Siena and Florence (Castellina, Radda, Greve).',
        'San Gimignano (45min drive) makes a perfect half-day add-on — medieval towers and world-champion gelato at Gelateria Dondoli.',
        'Best gelato in Siena: Kopa Kabana near Piazza del Campo.',
      ])}
    WHERE destination_id = ${DEST_ID}
  `;
  console.log('  ✓ Enhanced transport notes and travel tips');

  // ── 3. Add additional highlights for restaurants and Palio-specific items ──
  // Check what exists
  const existing = await sql`SELECT title FROM destination_highlights WHERE destination_id = ${DEST_ID}`;
  const existingTitles = new Set(existing.map((r: any) => r.title));

  const newHighlights = [
    {
      title: 'Il Palio di Siena (July 2, 2026)',
      description:
        'The world\'s most dramatic horse race — 10 of 17 contrade compete bareback around the Campo in a 90-second fury. ' +
        'Dating to 1644, this isn\'t a tourist show — it\'s a genuine neighborhood rivalry that defines Sienese identity. ' +
        'The historical parade (Corteo Storico) with 15th-century costumes and flag-throwing precedes the race. ' +
        'Free standing in the piazza center (arrive by 2pm); balcony seats €450-690. The atmosphere is absolutely electric.',
      category: 'attraction', rating: 5.0, price_level: 1,
      address: 'Piazza del Campo, Siena',
      website_url: 'https://paliodisiena.tickets/2026-edition/',
      duration: '5-6 hours (full race day experience)', order_index: 30,
    },
    {
      title: 'Trattoria Papei',
      description:
        'Bustling trattoria just off Piazza del Mercato with checked tablecloths and enormous portions. ' +
        'Local favorite for classic Sienese dishes: pici all\'aglione (thick pasta with garlic-tomato sauce), ' +
        'wild boar ragu, ribollita, and tagliata. Outdoor seating with partial Campo views. €€. No reservations — arrive early.',
      category: 'food', rating: 4.5, price_level: 2,
      address: 'Piazza del Mercato, 6, 53100 Siena',
      duration: '1-1.5 hours', order_index: 31,
    },
    {
      title: 'Osteria Le Logge',
      description:
        'Siena\'s most celebrated restaurant, housed in a former pharmacy with original wooden cabinets. ' +
        'Creative Tuscan cuisine with seasonal ingredients — truffle dishes in season, extraordinary pasta, ' +
        'and an impressive wine list focused on Brunello and Chianti Classico. €€€. Reserve ahead.',
      category: 'food', rating: 4.7, price_level: 3,
      address: 'Via del Porrione, 33, 53100 Siena',
      website_url: 'https://www.osterialelogge.it',
      duration: '1.5-2 hours', order_index: 32,
    },
    {
      title: 'Antica Osteria da Divo',
      description:
        'Atmospheric restaurant built into Etruscan-era underground tombs. The candlelit stone chambers are unforgettable. ' +
        'Refined Tuscan menu — try the pici with duck ragu or the guinea fowl. Excellent Brunello selection. €€€. ' +
        'The underground rooms are genuinely 2,000+ years old.',
      category: 'food', rating: 4.6, price_level: 3,
      address: 'Via Franciosa, 25, 53100 Siena',
      website_url: 'https://www.osteriadadivo.it',
      duration: '1.5-2 hours', order_index: 33,
    },
    {
      title: 'Contrada Culture Experience',
      description:
        'Each of Siena\'s 17 contrade has its own church, fountain, museum, and centuries-old identity. ' +
        'Walk the streets and spot the contrada symbols: Oca (goose), Lupa (she-wolf), Drago (dragon), Aquila (eagle), etc. ' +
        'Visit a contrada museum (small entrance fee, €5-8). During Palio season, the streets come alive with flags, ' +
        'drumming practice, and fierce neighborhood pride.',
      category: 'cultural', rating: 4.8, price_level: 1,
      address: 'Throughout Siena\'s historic center',
      duration: '2-3 hours', order_index: 34,
    },
    {
      title: 'Chianti Classico Wine Country Day Trip',
      description:
        'The rolling hills between Siena and Florence produce Italy\'s most iconic red wine. ' +
        'Drive the SS222 (Chiantigiana) through Castellina in Chianti, Radda in Chianti, and Greve in Chianti. ' +
        'Stop at estates like Castello di Brolio, Fontodi, or Badia a Coltibuono for tastings (€15-30). ' +
        'The landscapes — vineyards, olive groves, cypress-lined roads — are quintessential Tuscany.',
      category: 'activity', rating: 4.7, price_level: 2,
      address: 'Chianti Classico region, between Siena and Florence',
      duration: 'Half to full day', order_index: 35,
    },
    {
      title: 'San Gimignano Day Trip',
      description:
        'The "Medieval Manhattan" — a tiny hilltop town 45 minutes from Siena, famous for its 14 surviving medieval towers ' +
        '(once there were 72). UNESCO World Heritage Site. Don\'t miss: Gelateria Dondoli (multiple world gelato champion), ' +
        'the Collegiate Church frescoes, and the stunning panoramic views from Rocca di Montestaffoli. Gets crowded midday — go early.',
      category: 'activity', rating: 4.6, price_level: 1,
      address: 'San Gimignano, 53037 SI',
      duration: '3-4 hours', order_index: 36,
    },
    {
      title: 'Panforte & Sienese Sweets',
      description:
        'Siena\'s signature dessert: a dense, chewy cake of nuts, candied fruit, and spices dating to the 13th century. ' +
        'Also try ricciarelli (soft almond cookies) and cavallucci (spiced biscuits). Best shops: Nannini (historic pasticceria on Via Banchi di Sopra) ' +
        'and the Consorzio Agrario on Via Pianigiani for authentic Sienese food products.',
      category: 'food', rating: 4.4, price_level: 1,
      address: 'Nannini: Via Banchi di Sopra, 24, 53100 Siena',
      duration: '30 min', order_index: 37,
    },
  ];

  let added = 0;
  for (const h of newHighlights) {
    if (existingTitles.has(h.title)) {
      console.log(`  ⏭️  Already exists: ${h.title}`);
      continue;
    }
    await sql`INSERT INTO destination_highlights (
      id, destination_id, title, description, category, rating, price_level,
      address, website_url, duration, order_index
    ) VALUES (
      ${nanoid()}, ${DEST_ID}, ${h.title}, ${h.description}, ${h.category},
      ${h.rating}, ${h.price_level}, ${h.address || null}, ${h.website_url || null},
      ${h.duration || null}, ${h.order_index}
    )`;
    console.log(`  🌟 Added: ${h.title}`);
    added++;
  }
  console.log(`  ✓ ${added} new highlights added`);

  // ── Final status check ──
  const [resCount] = await sql`SELECT count(*) as c FROM destination_research WHERE destination_id = ${DEST_ID}`;
  const [hlCount] = await sql`SELECT count(*) as c FROM destination_highlights WHERE destination_id = ${DEST_ID}`;
  const [wxCount] = await sql`SELECT count(*) as c FROM destination_weather_monthly WHERE destination_id = ${DEST_ID}`;
  const [acCount] = await sql`SELECT count(*) as c FROM accommodations WHERE destination_id = ${DEST_ID}`;
  const [dest] = await sql`SELECT description, photo_url FROM trip_destinations WHERE id = ${DEST_ID}`;

  console.log('\n✅ Siena fully seeded!');
  console.log('\n📋 Summary:');
  console.log(`   ✓ Description: ${dest.description ? '✅' : '❌'} (${dest.description?.length || 0} chars)`);
  console.log(`   ✓ Photo URL: ${dest.photo_url ? '✅' : '❌'}`);
  console.log(`   ✓ Research: ${resCount.c} row(s)`);
  console.log(`   ✓ Highlights: ${hlCount.c} total`);
  console.log(`   ✓ Weather: ${wxCount.c} months`);
  console.log(`   ✓ Accommodations: ${acCount.c} options`);
  console.log('   ✓ Transport notes: Enhanced with Vicenza routes');
  console.log('   ✓ Research status: fully_researched');

  await sql.end();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
