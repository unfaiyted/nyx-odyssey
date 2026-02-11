/**
 * Complete Bologna destination profile — Full research for all 6 sections
 * Populates: description, highlights, weather (already exists), accommodations, transport, photo
 * Usage: bun run scripts/seed-bologna-complete.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../src/db/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh';
const DEST_ID = 'BrSNJbsXkTvO2pP7kipvj';
const RESEARCH_ID = 'k9jw4hFRXyZ0cn-wJlEed';

async function seed() {
  console.log('🍝 Completing Bologna full research profile...\n');

  // 1. Update trip_destinations: photo URL, description, and research status
  await db.update(schema.tripDestinations)
    .set({
      photoUrl: 'https://images.unsplash.com/photo-1598950538592-09aa42cce4c1?w=800&q=80',
      description:
        'Bologna, "La Grassa" (The Fat One), is the undisputed food capital of Italy and the heart of ' +
        'Emilia-Romagna — the region that gave the world Parmigiano-Reggiano, prosciutto di Parma, and balsamic ' +
        'vinegar. Home to the oldest university in the Western world (founded 1088), the city pulses with ' +
        'youthful energy under 40km of elegant medieval porticoes (UNESCO World Heritage). The historic ' +
        'Quadrilatero market district teems with artisan food stalls, while traditional trattorias serve ' +
        'tortellini in brodo, tagliatelle al ragù (never "spaghetti bolognese"!), lasagne verdi, and ' +
        'silky mortadella. Landmark sights include the leaning Two Towers (Asinelli & Garisenda), the ' +
        'grand Piazza Maggiore with Basilica di San Petronio, the ornate Archiginnasio library, and the ' +
        'seven-church complex of Santo Stefano. Just 1.5 hours from Vicenza by train, Bologna makes an ' +
        'ideal day trip — though an overnight stay rewards with aperitivo culture, gelato crawls, and ' +
        'the city\'s famously warm nightlife.',
      researchStatus: 'fully_researched',
    })
    .where(eq(schema.tripDestinations.id, DEST_ID));
  console.log('  ✅ Updated photo URL, description, and research status');

  // 2. Update destination_research with full details
  await db.update(schema.destinationResearch)
    .set({
      country: 'Italy',
      region: 'Emilia-Romagna',
      timezone: 'CET (UTC+1) / CEST (UTC+2 summer)',
      language: 'Italian',
      currency: 'EUR',
      population: '~400,000 (metro ~1 million)',
      elevation: '54m',
      bestTimeToVisit: 'April-June and September-October. Summers can be hot (35°C+). University gives the city energy year-round except August when locals flee.',
      nearestAirport: 'Bologna Guglielmo Marconi (BLQ) — 6km from center. Also reachable from Venice (VCE) ~2h.',
      safetyRating: 4,
      safetyNotes: 'Very safe city overall. Standard Italian city precautions: watch for pickpockets near train station and tourist areas. The university district can be rowdy at night but not dangerous. Well-lit porticoes make walking feel safe even at night.',
      culturalNotes: 'Bologna has three nicknames: La Dotta (The Learned — oldest university), La Rossa (The Red — both the terracotta buildings and left-leaning politics), La Grassa (The Fat — the food). The city takes its food incredibly seriously — never order "spaghetti bolognese" (it doesn\'t exist here). The correct dish is tagliatelle al ragù. Bolognesi eat late: lunch 13:00-14:30, dinner 20:00-22:00. Aperitivo culture (18:00-20:00) is strong.',
      dailyBudgetLow: '55.00',
      dailyBudgetMid: '100.00',
      dailyBudgetHigh: '200.00',
      budgetCurrency: 'EUR',
      costNotes: 'Trattorias: €12-18 for a primo, €15-25 for a secondo. Full meal with wine: €25-45/person at traditional spots, €50-80 at upscale restaurants. Aperitivo with free buffet: €6-10 for a drink. Gelato: €2.50-4. Cooking class: €60-150/person. Asinelli Tower climb: €5. Most attractions are free or cheap.',
      rainyDaysPerMonth: 8,
      transportNotes:
        'FROM VICENZA:\n' +
        '• Train (recommended): Trenitalia Regionale ~1h20-1h40, €10-15 one-way. Frecce high-speed ~1h, €20-35. ' +
        'Trains run frequently (every 30-60 min). Bologna Centrale is a major hub.\n' +
        '• Driving: ~1.5h via A13 autostrada. 150km. Tolls ~€10 one-way. Parking in Bologna is expensive and ' +
        'the ZTL (restricted traffic zone) covers most of the center. Use Park & Ride at Tandem (free with bus ticket) or ' +
        'parking garages at €15-25/day.\n\n' +
        'DAY TRIP VS OVERNIGHT:\n' +
        '• Day trip works well — train schedule is frequent, and the historic center is walkable and compact.\n' +
        '• Overnight recommended if you want a cooking class + full dinner experience, or to explore beyond the center.\n\n' +
        'LOCAL TRANSPORT:\n' +
        '• The historic center is very walkable (1.5km across). The famous porticoes provide shelter from rain and sun.\n' +
        '• TPER buses cover the city. Single ticket €1.50. Day pass €5.\n' +
        '• Taxi from Bologna Centrale to Piazza Maggiore: €8-10.\n' +
        '• Bike sharing available (RideMovi). Flat city = great for cycling.\n' +
        '• From station to center: 15-20 min walk via Via dell\'Indipendenza (under porticoes the whole way).',
      weatherNotes:
        'JUNE-JULY (trip months): Hot and humid. June highs 27-29°C, July 30-32°C. ' +
        'Occasional afternoon thunderstorms bring brief relief. Humidity can make it feel hotter. ' +
        'Evenings are pleasant (18-22°C), perfect for outdoor dining.\n\n' +
        'Tip: Porticoes provide essential shade. Schedule indoor activities (museums, cooking classes) for ' +
        'midday heat. Mornings and evenings are best for market exploration and walking.',
      travelTips: JSON.stringify([
        'Never order "spaghetti bolognese" — it doesn\'t exist here. Ask for tagliatelle al ragù',
        'Climb the Asinelli Tower (498 steps) for panoramic views — arrive early to avoid queues',
        'The Quadrilatero market area is perfect for a food crawl — go hungry!',
        'Book restaurants for dinner, especially on weekends — popular trattorias fill up fast',
        'Take the train from Vicenza, not the car — parking in Bologna is a nightmare',
        'Try mortadella from a proper salumeria — it\'s nothing like supermarket bologna',
        'Aperitivo hour (18:00-20:00) is sacred — many bars include free food buffet with drinks',
        'Walk under the porticoes to San Luca sanctuary (3.8km uphill) for exercise and views',
        'Gelato: look for "produzione propria" (house-made) and natural colors, not neon',
        'The university area (Via Zamboni) has cheap eats, street art, and nightlife',
        'Cooking classes should be booked 1-2 weeks in advance, especially in peak season',
        'Bologna is compact — you can see the major sights in one full day, but two days lets you eat more',
      ]),
      updatedAt: new Date(),
    })
    .where(eq(schema.destinationResearch.id, RESEARCH_ID));
  console.log('  ✅ Updated destination research details');

  // 3. Add highlights (restaurants, attractions, activities)
  const newHighlights = [
    // === RESTAURANTS (Traditional Trattorias — NOT tourist traps) ===
    {
      destinationId: DEST_ID,
      title: 'Drogheria della Rosa',
      description: 'Intimate trattoria in a former pharmacy. No printed menu — the owner describes daily dishes based on what\'s fresh at the market. Legendary tortellini in brodo, bollito misto, and seasonal vegetables. Book at least a week ahead. One of Bologna\'s best-kept secrets among locals.',
      category: 'food' as const,
      rating: 4.8,
      priceLevel: 2,
      address: 'Via Cartoleria 10, 40124 Bologna',
      websiteUrl: 'https://www.drogheriadellarosa.it/',
      duration: '1.5-2 hours',
      orderIndex: 10,
    },
    {
      destinationId: DEST_ID,
      title: 'Trattoria Anna Maria',
      description: 'Beloved local institution since 1981, walls covered in photos of celebrities and regulars. Famous for handmade tortellini in brodo and tagliatelle al ragù — both exceptional. Family-run with genuine warmth. Reservations essential.',
      category: 'food' as const,
      rating: 4.7,
      priceLevel: 2,
      address: 'Via Belle Arti 17/a, 40126 Bologna',
      duration: '1.5 hours',
      orderIndex: 11,
    },
    {
      destinationId: DEST_ID,
      title: 'Osteria dell\'Orsa',
      description: 'University-area favorite with huge portions at fair prices. Known for tagliatelle al ragù and crescentine (fried bread with cured meats). Casual, lively atmosphere. No reservations — arrive early or queue. Great people-watching.',
      category: 'food' as const,
      rating: 4.4,
      priceLevel: 1,
      address: 'Via Mentana 1, 40126 Bologna',
      duration: '1-1.5 hours',
      orderIndex: 12,
    },
    {
      destinationId: DEST_ID,
      title: 'Trattoria dal Biassanot',
      description: 'Cozy neighborhood trattoria tucked away in the university quarter. Excellent cotoletta alla bolognese (veal cutlet with prosciutto, Parmigiano, and truffle), handmade pasta, and an impressive local wine list. Warm service, fair prices.',
      category: 'food' as const,
      rating: 4.6,
      priceLevel: 2,
      address: 'Via Piella 16/a, 40126 Bologna',
      duration: '1.5 hours',
      orderIndex: 13,
    },
    {
      destinationId: DEST_ID,
      title: 'Da Cesari',
      description: 'Classic Bolognese trattoria since 1955 near Piazza Maggiore. Traditional multi-course meals: tortellini in brodo, cotoletta alla petroniana, and a rich selection of bollito. White tablecloths, attentive service. A full traditional experience.',
      category: 'food' as const,
      rating: 4.5,
      priceLevel: 2,
      address: 'Via de\' Carbonesi 8, 40123 Bologna',
      websiteUrl: 'https://www.dacesari.it/',
      duration: '1.5-2 hours',
      orderIndex: 14,
    },
    {
      destinationId: DEST_ID,
      title: 'Osteria Bartolini',
      description: 'Gambero Rosso-recommended osteria in Piazza Malpighi. Seafood-focused with dishes from the Adriatic tradition — sardines, clams, tagliolini with fish ragù. Beautiful outdoor seating under a centuries-old plane tree. No reservations accepted.',
      category: 'food' as const,
      rating: 4.5,
      priceLevel: 2,
      address: 'Piazza Malpighi 16, 40123 Bologna',
      websiteUrl: 'https://www.osteriabartolinibologna.com/',
      duration: '1.5 hours',
      orderIndex: 15,
    },
    {
      destinationId: DEST_ID,
      title: 'Ristorante Diana',
      description: 'Bologna institution since 1919. Classic white-tablecloth restaurant serving definitive versions of tortellini in brodo and tagliatelle al ragù. Slightly more formal than a trattoria but not stuffy. Where Bolognese families celebrate special occasions.',
      category: 'food' as const,
      rating: 4.5,
      priceLevel: 3,
      address: 'Via dell\'Indipendenza 24, 40121 Bologna',
      duration: '1.5-2 hours',
      orderIndex: 16,
    },
    {
      destinationId: DEST_ID,
      title: 'Salumeria Simoni',
      description: 'Historic deli in the Quadrilatero since 1960. Incredible mortadella, culatello, and Parmigiano-Reggiano. Grab a tagliere (charcuterie board) and a glass of Lambrusco at the tiny bar inside. Perfect for a quick, authentic lunch.',
      category: 'food' as const,
      rating: 4.6,
      priceLevel: 1,
      address: 'Via Pescherie Vecchie 3/b, 40124 Bologna',
      duration: '30-45 min',
      orderIndex: 17,
    },
    // === GELATO ===
    {
      destinationId: DEST_ID,
      title: 'Cremeria Funivia',
      description: 'Widely considered Bologna\'s best gelato. Small shop near Porta Saragozza with house-made flavors using seasonal ingredients. The pistachio and crema are legendary. Look for the queue — it\'s always worth the wait.',
      category: 'food' as const,
      rating: 4.8,
      priceLevel: 1,
      address: 'Via Porrettana 2, 40122 Bologna',
      duration: '15-30 min',
      orderIndex: 18,
    },
    {
      destinationId: DEST_ID,
      title: 'Cremeria Santo Stefano',
      description: 'Artisan gelateria in the beautiful Piazza Santo Stefano. Seasonal flavors with natural ingredients — no artificial colors. Try the fior di latte or seasonal fruit sorbets. Perfect after exploring the Seven Churches.',
      category: 'food' as const,
      rating: 4.6,
      priceLevel: 1,
      address: 'Via Santo Stefano 70, 40125 Bologna',
      duration: '15-30 min',
      orderIndex: 19,
    },
    // === ATTRACTIONS ===
    {
      destinationId: DEST_ID,
      title: 'Archiginnasio di Bologna',
      description: 'Stunning former main building of the University of Bologna (1563). The Anatomical Theatre is a masterpiece of carved wood — where dissections were performed for medical students. The walls are covered with 6,000 coats of arms of former students. Free entry to courtyard; €3 for theatre.',
      category: 'attraction' as const,
      rating: 4.7,
      priceLevel: 1,
      address: 'Piazza Galvani 1, 40124 Bologna',
      websiteUrl: 'https://www.archiginnasio.it/',
      duration: '45 min - 1 hour',
      orderIndex: 20,
    },
    {
      destinationId: DEST_ID,
      title: 'Piazza Maggiore & Basilica di San Petronio',
      description: 'Bologna\'s grand main square, flanked by medieval palaces and the massive unfinished Basilica di San Petronio — the 10th largest church in the world. Inside, see the world\'s longest indoor meridian line (66.8m). The piazza is the heart of city life.',
      category: 'attraction' as const,
      rating: 4.6,
      priceLevel: 1,
      address: 'Piazza Maggiore, 40124 Bologna',
      duration: '30-60 min',
      orderIndex: 21,
    },
    {
      destinationId: DEST_ID,
      title: 'Basilica di Santo Stefano (Seven Churches)',
      description: 'Extraordinary complex of interconnected churches, courtyards, and cloisters dating from the 5th century. Known as "Sette Chiese" (Seven Churches). One of Bologna\'s most atmospheric and peaceful spots. Free entry.',
      category: 'cultural' as const,
      rating: 4.7,
      priceLevel: 1,
      address: 'Via Santo Stefano 24, 40125 Bologna',
      duration: '30-45 min',
      orderIndex: 22,
    },
    {
      destinationId: DEST_ID,
      title: 'Portico di San Luca',
      description: 'The world\'s longest portico — 3.8km with 666 arches climbing from Porta Saragozza to the Sanctuary of the Madonna di San Luca. UNESCO World Heritage. The walk is a beloved local tradition and rewards with panoramic views of the city and Apennines.',
      category: 'attraction' as const,
      rating: 4.6,
      priceLevel: 1,
      address: 'Via di San Luca, 40135 Bologna',
      duration: '1.5-2 hours (round trip walk)',
      orderIndex: 23,
    },
    {
      destinationId: DEST_ID,
      title: 'Finestrella di Via Piella',
      description: 'Bologna\'s "secret window" — a tiny opening in a wall on Via Piella that reveals a hidden canal below, reminiscent of Venice. One of the city\'s most Instagram-worthy spots. Quick stop, always fun.',
      category: 'attraction' as const,
      rating: 4.2,
      priceLevel: 1,
      address: 'Via Piella, 40126 Bologna',
      duration: '5-10 min',
      orderIndex: 24,
    },
    // === ACTIVITIES ===
    {
      destinationId: DEST_ID,
      title: 'Pasta-Making Cooking Class',
      description: 'Hands-on class learning to make tortellini, tagliatelle, or other fresh pasta. Top providers: Taste Bologna (tastebologna.net, small groups, €60-150), Le Cesarine (cook in a local\'s home), or La Vecchia Scuola Bolognese. Book 1-2 weeks ahead for summer.',
      category: 'activity' as const,
      rating: 4.8,
      priceLevel: 3,
      duration: '2.5-3 hours',
      orderIndex: 30,
    },
    {
      destinationId: DEST_ID,
      title: 'Bologna Food Walking Tour',
      description: 'Guided food tour through the Quadrilatero and beyond. Sample mortadella, fresh pasta, Parmigiano, traditional balsamic, and local wines. Curious Appetite and Taste Bologna offer excellent small-group tours. ~3 hours, €70-90/person.',
      category: 'activity' as const,
      rating: 4.7,
      priceLevel: 3,
      duration: '3 hours',
      orderIndex: 31,
    },
    {
      destinationId: DEST_ID,
      title: 'Mercato di Mezzo Food Hall',
      description: 'Indoor food market in the heart of the Quadrilatero. Multiple stalls selling fresh pasta, fried street food, craft beer, charcuterie, and more. Great for a casual meal or tasting session. Open late, lively atmosphere.',
      category: 'activity' as const,
      rating: 4.3,
      priceLevel: 2,
      address: 'Via Clavature 12, 40124 Bologna',
      duration: '30-60 min',
      orderIndex: 32,
    },
  ];

  const insertedHighlights = await db.insert(schema.destinationHighlights).values(newHighlights).returning();
  console.log(`  ✅ Added ${insertedHighlights.length} new highlights`);

  // 4. Add accommodations
  const accommodations = [
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'Hotel Corona d\'Oro',
      type: 'hotel' as const,
      status: 'researched' as const,
      address: 'Via Oberdan 12, 40126 Bologna',
      costPerNight: '160.00',
      currency: 'EUR',
      bookingUrl: 'https://www.hco.it/en/',
      rating: 4.5,
      notes: '4-star hotel in a 14th-century palazzo, 2 min walk from Piazza Maggiore. Beautiful Art Nouveau interiors, quiet courtyard. Excellent breakfast. One of Bologna\'s most elegant mid-range hotels. €130-200/night.',
    },
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'Art Hotel Orologio',
      type: 'hotel' as const,
      status: 'researched' as const,
      address: 'Via IV Novembre 10, 40123 Bologna',
      costPerNight: '140.00',
      currency: 'EUR',
      bookingUrl: 'https://www.bolognarthotels.it/en/art-hotel-orologio/',
      rating: 4.4,
      notes: 'Directly on Piazza Maggiore — unbeatable location. Clean, comfortable rooms with city views. Good breakfast buffet. Can be noisy on piazza side; request a courtyard room. €110-180/night.',
    },
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'Hotel Metropolitan',
      type: 'hotel' as const,
      status: 'researched' as const,
      address: 'Via dell\'Orso 6, 40121 Bologna',
      costPerNight: '120.00',
      currency: 'EUR',
      bookingUrl: 'https://www.hotelmetropolitan.com/en/',
      rating: 4.3,
      notes: 'Solid 4-star near Via dell\'Indipendenza. Modern rooms, rooftop terrace with city views, good breakfast. 10 min walk to Piazza Maggiore. Good value. €100-150/night.',
    },
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'Airbnb: Central Bologna Apartment',
      type: 'airbnb' as const,
      status: 'researched' as const,
      address: 'Historic Center, Bologna',
      costPerNight: '90.00',
      currency: 'EUR',
      bookingUrl: 'https://www.airbnb.com/s/Bologna--Italy/homes',
      rating: 4.3,
      notes: 'Typical 1-bedroom apartment in the historic center. €70-120/night. Good for longer stays — kitchen for breakfast, local neighborhood feel. Look for apartments in the Quadrilatero or Santo Stefano areas for the best location.',
    },
    {
      tripId: TRIP_ID,
      destinationId: DEST_ID,
      name: 'We Bologna Hostel',
      type: 'hostel' as const,
      status: 'researched' as const,
      address: 'Via de\' Falegnami 6/4, 40121 Bologna',
      costPerNight: '35.00',
      currency: 'EUR',
      bookingUrl: 'https://www.webologna.it/',
      rating: 4.1,
      notes: 'Well-reviewed hostel near the center. Private rooms from €60, dorms from €25-35. Good for budget-conscious travelers. Clean, social atmosphere, helpful staff.',
    },
  ];

  for (const acc of accommodations) {
    await db.insert(schema.accommodations).values(acc);
  }
  console.log(`  ✅ Added ${accommodations.length} accommodations`);

  console.log('\n🍝 Bologna research profile COMPLETE!');
  console.log('  📸 Photo: Unsplash Bologna cityscape');
  console.log('  📝 Description: Full overview paragraph');
  console.log('  🎯 Highlights: 3 existing + 18 new (restaurants, gelato, attractions, activities)');
  console.log('  🌤️  Weather: 12 months already existed + detailed June/July notes added');
  console.log('  🏨 Accommodations: 5 options (hotels, airbnb, hostel)');
  console.log('  🚗 Transport: Train/drive from Vicenza, local transport, day trip vs overnight');
  console.log('  Status: fully_researched ✅');

  process.exit(0);
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
