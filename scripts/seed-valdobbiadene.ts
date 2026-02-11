import { db } from '../src/db';
import {
  tripDestinations,
  destinationResearch,
  destinationHighlights,
  destinationWeatherMonthly,
  accommodations,
} from '../src/db/schema';

const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh';

async function seed() {
  console.log('🏔️ Creating Valdobbiadene & Prosecco Hills destination...');

  // Create the destination
  const [destination] = await db
    .insert(tripDestinations)
    .values({
      tripId: TRIP_ID,
      name: 'Valdobbiadene & Prosecco Hills',
      description:
        "UNESCO World Heritage wine country, the birthplace of authentic Prosecco Superiore DOCG. Rolling hills covered in vineyards, picturesque villages, and the famous Strada del Prosecco wine route. Home to the prestigious Cartizze vineyards — the 'Grand Cru' of Prosecco.",
      lat: 45.9147,
      lng: 11.9675,
      photoUrl: '/research/004-valdobbiadene-screenshot.png',
      status: 'researched',
      researchStatus: 'approved',
      orderIndex: 35, // After Vicenza
    })
    .returning();

  console.log(`✅ Created destination: ${destination.id}`);

  // Insert research data
  await db.insert(destinationResearch).values({
    destinationId: destination.id,
    country: 'Italy',
    region: 'Veneto',
    timezone: 'CET (UTC+1)',
    language: 'Italian',
    currency: 'EUR (€)',
    bestTimeToVisit: 'May-Oct (harvest season Sep-Oct)',
    avgTempHighC: 28,
    avgTempLowC: 17,
    rainyDaysPerMonth: 9,
    weatherNotes:
      'Warm, sunny summers ideal for vineyard tours. June-July offer long days and reliable weather. Afternoon thunderstorms possible but brief.',
    dailyBudgetLow: '80',
    dailyBudgetMid: '150',
    dailyBudgetHigh: '300',
    budgetCurrency: 'USD',
    costNotes:
      'Wine tastings €15-35 per estate. Mid-range hotels €120-200/night. Fine dining at Michelin restaurants €80-150 per person.',
    transportNotes:
      'Best explored by car — ~55 min drive from Vicenza via A27 and SR348. Wine tour companies like Beescover offer guided day trips from Venice/Verona. Local bus service limited. Cycling routes available for the adventurous.',
    nearestAirport: 'VCE (Venice Marco Polo) / TSF (Treviso)',
    safetyRating: 5,
    safetyNotes: 'Very safe rural area with minimal crime',
    culturalNotes:
      'Wine is deeply embedded in local culture. Many wineries are family-owned for generations. Reservations recommended for tastings, especially on weekends. The Conegliano-Valdobbiadene area received UNESCO World Heritage status in 2019 for its unique wine-growing landscape.',
    summary:
      'The heart of Italy\'s sparkling wine country, where rolling vineyard-covered hills create a patchwork quilt of green. This UNESCO World Heritage region produces the world\'s finest Prosecco Superiore DOCG, with the Cartizze subzone representing the pinnacle of quality. Charming villages, ancient castles, and family-run wineries make this a must-visit for wine lovers and those seeking authentic Italian countryside charm.',
    travelTips: JSON.stringify([
      'Book winery tastings in advance — many are small family operations',
      'Cartizze is the prestige zone — wines here are the region\'s finest',
      'Combine with Asolo (the "City of a Hundred Horizons") for a perfect day',
      'The Strada del Prosecco scenic route winds through the best vineyards',
      'Visit in late September for harvest season activities',
      'Osteria Senza Oste offers self-service wine and panoramic views',
      'Conegliano has a wine school (Scuola Enologica) and historic castle',
      'Stay overnight to enjoy sunset over the vineyards with a glass of brut',
    ]),
  });

  console.log('✅ Added destination research');

  // Insert highlights
  const highlights = [
    {
      title: 'Cartizze Vineyards',
      description:
        "The 'Grand Cru' of Prosecco — 107 hectares of the most prestigious vineyards in the world. Prosecco Superiore di Cartizze DOCG represents the pinnacle of quality, with grapes grown on steep south-facing hillsides in the commune of Valdobbiadene.",
      category: 'attraction',
      rating: 4.9,
      priceLevel: 3,
      duration: '2-3 hours',
      imageUrl:
        'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&h=400&fit=crop',
    },
    {
      title: 'Asolo — The City of a Hundred Horizons',
      description:
        'A medieval hilltop town of extraordinary beauty, beloved by poets and artists. The castle ruins, ancient walls, and panoramic views across the Veneto plain make this one of Italy\'s most enchanting villages. Queen Cornaro made it her court in the 15th century.',
      category: 'attraction',
      rating: 4.8,
      priceLevel: 2,
      duration: 'Half day',
      imageUrl:
        'https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?w=600&h=400&fit=crop',
    },
    {
      title: 'Strada del Prosecco Wine Route',
      description:
        'A scenic 47km route winding through vineyards, connecting Conegliano to Valdobbiadene. Dozens of wineries dot the route, offering tastings of Prosecco Superiore DOCG, including the rare Cartizze and Rive varieties.',
      category: 'activity',
      rating: 4.7,
      priceLevel: 2,
      duration: 'Full day',
      address: 'SR348 from Conegliano to Valdobbiadene',
    },
    {
      title: 'Conegliano Castle & Historic Center',
      description:
        'The medieval castle dominates the town from its hilltop perch, housing a small museum. Below, the historic center features the Scuola Enologica (Italy\'s oldest wine school) and charming arcaded streets.',
      category: 'cultural',
      rating: 4.5,
      priceLevel: 1,
      duration: '2 hours',
    },
    {
      title: 'Winery Tasting at Bisol',
      description:
        'Historic family winery producing exceptional Prosecco since 1875. Their Cartizze is legendary, and the estate offers tours through ancient underground cellars.',
      category: 'food',
      rating: 4.8,
      priceLevel: 3,
      duration: '1.5 hours',
      websiteUrl: 'https://www.bisol.it',
    },
    {
      title: 'Winery Tasting at Ruggeri',
      description:
        'Multi-award-winning winery known for their Giustino B. Extra Dry. Beautiful tasting room with vineyard views and knowledgeable staff.',
      category: 'food',
      rating: 4.6,
      priceLevel: 2,
      duration: '1 hour',
      websiteUrl: 'https://www.ruggeri.it',
    },
    {
      title: 'Osteria Senza Oste',
      description:
        'Unique self-service wine bar in the hills above Valdobbiadene. Honor system — pour your own wine, pay what you owe, enjoy breathtaking views. A local institution.',
      category: 'food',
      rating: 4.7,
      priceLevel: 1,
      duration: '1 hour',
      address: 'Località San Michele, Valdobbiadene',
    },
    {
      title: 'Vittorio Veneto Historic Center',
      description:
        'Two ancient towns (Ceneda and Serravalle) merged into one charming city. Serravalle features a beautifully preserved medieval core along the Meschio River.',
      category: 'attraction',
      rating: 4.3,
      priceLevel: 1,
      duration: '2-3 hours',
    },
  ];

  for (let i = 0; i < highlights.length; i++) {
    await db.insert(destinationHighlights).values({
      destinationId: destination.id,
      orderIndex: i,
      ...highlights[i],
    });
  }

  console.log(`✅ Added ${highlights.length} highlights`);

  // Insert weather data for June and July
  const weatherData = [
    {
      month: 6,
      avgHighC: 27,
      avgLowC: 17,
      rainyDays: 11,
      sunshineHours: 8.5,
    },
    {
      month: 7,
      avgHighC: 30,
      avgLowC: 19,
      rainyDays: 9,
      sunshineHours: 9.5,
    },
  ];

  for (const w of weatherData) {
    await db.insert(destinationWeatherMonthly).values({
      destinationId: destination.id,
      ...w,
    });
  }

  console.log('✅ Added June/July weather data');

  // Insert accommodations
  const accommodationsData = [
    {
      tripId: TRIP_ID,
      destinationId: destination.id,
      name: 'Villa Abbazia Relais & Spa',
      type: 'hotel',
      status: 'researched',
      address: 'Piazza IV Novembre 3, Follina (near Valdobbiadene)',
      costPerNight: '250',
      totalCost: '500',
      currency: 'EUR',
      rating: 4.7,
      bookingUrl: 'https://www.booking.com/hotel/it/villa-abbazia.html',
      notes:
        'Luxury boutique hotel in a converted abbey. Stunning gardens, spa, and Michelin dining. Perfect for a romantic wine country retreat.',
    },
    {
      tripId: TRIP_ID,
      destinationId: destination.id,
      name: 'Hotel Villa Cipriani',
      type: 'hotel',
      status: 'researched',
      address: 'Via Canova 298, Asolo',
      costPerNight: '200',
      totalCost: '400',
      currency: 'EUR',
      rating: 4.6,
      bookingUrl: 'https://www.villcipriani.com',
      notes:
        'Historic villa in Asolo with panoramic gardens. Once home to poet Robert Browning. Elegant rooms with countryside views.',
    },
    {
      tripId: TRIP_ID,
      destinationId: destination.id,
      name: 'Albergo Italia',
      type: 'hotel',
      status: 'researched',
      address: 'Piazza Marconi 2, Valdobbiadene',
      costPerNight: '130',
      totalCost: '260',
      currency: 'EUR',
      rating: 4.3,
      bookingUrl:
        'https://www.booking.com/hotel/it/albergo-italia-valdobbiadene.html',
      notes:
        'Central location in Valdobbiadene, walking distance to restaurants. Simple but comfortable, great value for the area.',
    },
    {
      tripId: TRIP_ID,
      destinationId: destination.id,
      name: 'Casa di Lucia (Agriturismo)',
      type: 'villa',
      status: 'researched',
      address: 'Località Guia, Valdobbiadene',
      costPerNight: '110',
      totalCost: '220',
      currency: 'EUR',
      rating: 4.5,
      bookingUrl:
        'https://www.airbnb.com/s/Valdobbiadene--Italy/homes',
      notes:
        'Family-run farmhouse stay surrounded by vineyards. Home-cooked meals, wine tastings, and authentic hospitality. Book via Airbnb or agriturismo sites.',
    },
    {
      tripId: TRIP_ID,
      destinationId: destination.id,
      name: 'Hotel Canon d\'Oro',
      type: 'hotel',
      status: 'researched',
      address: 'Via XX Settembre 4, Conegliano',
      costPerNight: '95',
      totalCost: '190',
      currency: 'EUR',
      rating: 4.2,
      bookingUrl: 'https://www.hotelcanondoro.it',
      notes:
        'Historic hotel in Conegliano center, near the train station. Great base for exploring the wine route by car. On-site restaurant with local specialties.',
    },
  ];

  for (const acc of accommodationsData) {
    await db.insert(accommodations).values(acc);
  }

  console.log(`✅ Added ${accommodationsData.length} accommodations`);

  console.log('\n🎉 Valdobbiadene & Prosecco Hills seeded successfully!');
  console.log(`Destination ID: ${destination.id}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
