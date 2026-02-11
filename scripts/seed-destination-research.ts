import { db } from '../src/db';
import { tripDestinations, destinationResearch, destinationHighlights, destinationWeatherMonthly } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function seed() {
  // Find existing destinations
  const destinations = await db.select().from(tripDestinations);
  if (destinations.length === 0) {
    console.log('No trip destinations found. Run other seed scripts first.');
    process.exit(0);
  }

  console.log(`Found ${destinations.length} destinations. Seeding research data...`);

  for (const dest of destinations) {
    // Check if research already exists
    const existing = await db.select().from(destinationResearch)
      .where(eq(destinationResearch.destinationId, dest.id));
    if (existing.length > 0) {
      console.log(`  Skipping ${dest.name} (already has research)`);
      continue;
    }

    const data = getResearchData(dest.name);
    if (!data) {
      console.log(`  No research template for ${dest.name}`);
      continue;
    }

    console.log(`  Seeding research for ${dest.name}...`);

    // Insert research
    await db.insert(destinationResearch).values({
      destinationId: dest.id,
      ...data.research,
    });

    // Insert highlights
    for (const [i, h] of data.highlights.entries()) {
      await db.insert(destinationHighlights).values({
        destinationId: dest.id,
        orderIndex: i,
        ...h,
      });
    }

    // Insert weather
    for (const w of data.weather) {
      await db.insert(destinationWeatherMonthly).values({
        destinationId: dest.id,
        ...w,
      });
    }
  }

  console.log('Done!');
  process.exit(0);
}

function getResearchData(name: string) {
  const lower = name.toLowerCase();

  if (lower.includes('rome') || lower.includes('roma')) return romeData();
  if (lower.includes('florence') || lower.includes('firenze')) return florenceData();
  if (lower.includes('como')) return comoData();
  if (lower.includes('venice') || lower.includes('venezia')) return veniceData();
  if (lower.includes('siena')) return sienaData();
  if (lower.includes('bologna')) return bolognaData();
  if (lower.includes('verona')) return veronaData();
  if (lower.includes('milan') || lower.includes('milano')) return milanData();
  // Generic Italian city fallback
  if (lower.includes('italy') || lower.includes('italia')) return genericItalyData(name);
  return null;
}

function romeData() {
  return {
    research: {
      country: 'Italy',
      region: 'Lazio',
      timezone: 'CET (UTC+1)',
      language: 'Italian',
      currency: 'EUR (€)',
      population: '2.8 million',
      elevation: '21m (69 ft)',
      bestTimeToVisit: 'Apr-Jun, Sep-Oct',
      avgTempHighC: 22,
      avgTempLowC: 10,
      rainyDaysPerMonth: 8,
      weatherNotes: 'Mediterranean climate with hot dry summers and mild wet winters. Summer can be extremely hot (35°C+). Spring and fall are ideal.',
      dailyBudgetLow: '70',
      dailyBudgetMid: '150',
      dailyBudgetHigh: '350',
      budgetCurrency: 'USD',
      costNotes: 'Rome is moderately expensive by European standards. Eating away from tourist areas saves significantly. Many churches and piazzas are free.',
      transportNotes: 'Metro has 3 lines (A, B, C). Single ticket €1.50, day pass €7. Walking is the best way to explore the centro storico. Taxis use meters. Uber exists but is less common. FCO airport is 30km away; Leonardo Express train to Termini is €14.',
      nearestAirport: 'FCO (Fiumicino)',
      safetyRating: 4,
      safetyNotes: 'Generally safe, watch for pickpockets near tourist sites',
      culturalNotes: 'Dress modestly for churches (covered shoulders and knees). Lunch is 12:30-2:30, dinner typically starts after 8pm. Tipping is not expected but rounding up is appreciated. "Coperto" (cover charge) of €1-3 is normal at restaurants.',
      summary: 'The Eternal City — a living museum where ancient ruins stand alongside baroque fountains and bustling piazzas. From the Colosseum to Vatican City, Rome offers an unparalleled density of world-class art, architecture, and cuisine.',
      travelTips: JSON.stringify([
        'Book Vatican Museums tickets online to skip 2+ hour lines',
        'Visit the Colosseum early morning or late afternoon for fewer crowds',
        'The Roma Pass (€32/48h) covers 1-2 museums + unlimited transport',
        'Drink from nasoni (public fountains) — the water is excellent',
        'Avoid restaurants with picture menus right next to major sights',
        'Sunday is best for Trastevere — the flea market at Porta Portese is great',
        'Try supplì (fried rice balls) from street food shops — Roman fast food at its best',
        'The Borghese Gallery requires advance reservations — book weeks ahead',
      ]),
    },
    highlights: [
      { title: 'Colosseum & Roman Forum', description: 'The iconic amphitheater and ancient political center of Rome. Combined ticket gives access to both.', category: 'attraction', rating: 4.8, priceLevel: 2, duration: '3-4 hours', imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&h=400&fit=crop' },
      { title: 'Vatican Museums & Sistine Chapel', description: 'One of the world\'s greatest art collections culminating in Michelangelo\'s masterpiece ceiling.', category: 'attraction', rating: 4.7, priceLevel: 2, duration: '3-5 hours', imageUrl: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=600&h=400&fit=crop' },
      { title: 'Trastevere', description: 'Charming neighborhood with cobblestone streets, excellent restaurants, and vibrant nightlife.', category: 'food', rating: 4.6, priceLevel: 2, duration: 'Evening', imageUrl: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=600&h=400&fit=crop' },
      { title: 'Pantheon', description: 'Best-preserved ancient Roman building with its magnificent unreinforced concrete dome. Free entry.', category: 'attraction', rating: 4.8, priceLevel: 1, duration: '1 hour', imageUrl: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=600&h=400&fit=crop' },
      { title: 'Testaccio Food Tour', description: 'The authentic food neighborhood — mercato, supplì, pizza al taglio, and Roman classics.', category: 'food', rating: 4.5, priceLevel: 2, duration: '3 hours', address: 'Testaccio' },
      { title: 'Borghese Gallery', description: 'Intimate museum with Bernini sculptures and Caravaggio paintings in a beautiful villa setting.', category: 'cultural', rating: 4.9, priceLevel: 2, duration: '2 hours' },
      { title: 'Trevi Fountain at Night', description: 'The baroque masterpiece is even more magical illuminated. Toss a coin to ensure your return to Rome.', category: 'attraction', rating: 4.5, priceLevel: 1, duration: '30 min' },
      { title: 'Aperitivo in Campo de\' Fiori', description: 'Evening drinks and people-watching in one of Rome\'s liveliest piazzas.', category: 'nightlife', rating: 4.3, priceLevel: 2, duration: 'Evening' },
    ],
    weather: [
      { month: 1, avgHighC: 12, avgLowC: 3, rainyDays: 7, sunshineHours: 4 },
      { month: 2, avgHighC: 13, avgLowC: 3, rainyDays: 7, sunshineHours: 5 },
      { month: 3, avgHighC: 16, avgLowC: 5, rainyDays: 7, sunshineHours: 6 },
      { month: 4, avgHighC: 19, avgLowC: 8, rainyDays: 8, sunshineHours: 7 },
      { month: 5, avgHighC: 24, avgLowC: 12, rainyDays: 6, sunshineHours: 9 },
      { month: 6, avgHighC: 28, avgLowC: 16, rainyDays: 3, sunshineHours: 10 },
      { month: 7, avgHighC: 31, avgLowC: 18, rainyDays: 2, sunshineHours: 11 },
      { month: 8, avgHighC: 31, avgLowC: 18, rainyDays: 3, sunshineHours: 10 },
      { month: 9, avgHighC: 27, avgLowC: 15, rainyDays: 5, sunshineHours: 8 },
      { month: 10, avgHighC: 22, avgLowC: 11, rainyDays: 8, sunshineHours: 6 },
      { month: 11, avgHighC: 17, avgLowC: 7, rainyDays: 9, sunshineHours: 4 },
      { month: 12, avgHighC: 13, avgLowC: 4, rainyDays: 8, sunshineHours: 4 },
    ],
  };
}

function florenceData() {
  return {
    research: {
      country: 'Italy',
      region: 'Tuscany',
      timezone: 'CET (UTC+1)',
      language: 'Italian',
      currency: 'EUR (€)',
      population: '382,000',
      elevation: '50m (164 ft)',
      bestTimeToVisit: 'Apr-Jun, Sep-Oct',
      avgTempHighC: 21,
      avgTempLowC: 9,
      dailyBudgetLow: '65',
      dailyBudgetMid: '140',
      dailyBudgetHigh: '300',
      budgetCurrency: 'USD',
      costNotes: 'Similar to Rome but slightly cheaper for food. Museum passes can save money if visiting multiple sites.',
      transportNotes: 'Very walkable historic center (mostly pedestrian). No metro. Bus system covers greater area. Train station (SMN) is central. Tramway line T1 connects station to suburbs.',
      nearestAirport: 'FLR (Peretola)',
      safetyRating: 4,
      safetyNotes: 'Very safe city, standard pickpocket precautions around tourist sites',
      culturalNotes: 'Birthplace of the Renaissance. The Florentine steak (bistecca alla fiorentina) is a must-try. Wine shops offer tastings. Leather goods from San Lorenzo market are famous but negotiate prices.',
      summary: 'The cradle of the Renaissance, Florence packs an extraordinary concentration of art and architecture into its compact centro storico. The Uffizi, Duomo, and Ponte Vecchio are just the beginning.',
      travelTips: JSON.stringify([
        'Book Uffizi and Accademia tickets well in advance',
        'Climb the Duomo dome for stunning city views (463 steps)',
        'The best gelato is at small shops that make their own — look for natural colors',
        'Cross the Arno to Oltrarno for artisan workshops and quieter dining',
        'The Firenze Card (€85/72h) covers 72+ museums with skip-the-line',
        'San Lorenzo Central Market upstairs food court is great for lunch',
      ]),
    },
    highlights: [
      { title: 'Uffizi Gallery', description: 'World-class Renaissance art collection featuring Botticelli, Leonardo, and Michelangelo.', category: 'cultural', rating: 4.8, priceLevel: 2, duration: '3-4 hours', imageUrl: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=600&h=400&fit=crop' },
      { title: 'Duomo & Brunelleschi\'s Dome', description: 'Florence\'s iconic cathedral with its revolutionary dome. Climb for panoramic views.', category: 'attraction', rating: 4.7, priceLevel: 1, duration: '2-3 hours', imageUrl: 'https://images.unsplash.com/photo-1541370976299-4d24ebbc9077?w=600&h=400&fit=crop' },
      { title: 'Ponte Vecchio', description: 'Medieval stone bridge lined with jewelry shops, spanning the Arno River.', category: 'attraction', rating: 4.5, priceLevel: 1, duration: '30 min' },
      { title: 'Mercato Centrale', description: 'Historic food market — ground floor for fresh produce, upper floor for prepared dishes.', category: 'food', rating: 4.4, priceLevel: 2, duration: '1-2 hours' },
      { title: 'Piazzale Michelangelo', description: 'Hilltop terrace with the best panoramic view of Florence, especially at sunset.', category: 'nature', rating: 4.6, priceLevel: 1, duration: '1 hour' },
      { title: 'Bistecca alla Fiorentina', description: 'The legendary T-bone steak — try at Trattoria Mario or Perseus.', category: 'food', rating: 4.7, priceLevel: 3, duration: 'Dinner' },
    ],
    weather: [
      { month: 1, avgHighC: 10, avgLowC: 1, rainyDays: 6, sunshineHours: 4 },
      { month: 2, avgHighC: 12, avgLowC: 2, rainyDays: 6, sunshineHours: 5 },
      { month: 3, avgHighC: 15, avgLowC: 5, rainyDays: 7, sunshineHours: 5 },
      { month: 4, avgHighC: 19, avgLowC: 8, rainyDays: 8, sunshineHours: 6 },
      { month: 5, avgHighC: 24, avgLowC: 12, rainyDays: 7, sunshineHours: 8 },
      { month: 6, avgHighC: 28, avgLowC: 15, rainyDays: 5, sunshineHours: 10 },
      { month: 7, avgHighC: 32, avgLowC: 18, rainyDays: 3, sunshineHours: 11 },
      { month: 8, avgHighC: 32, avgLowC: 18, rainyDays: 4, sunshineHours: 10 },
      { month: 9, avgHighC: 27, avgLowC: 14, rainyDays: 5, sunshineHours: 8 },
      { month: 10, avgHighC: 21, avgLowC: 10, rainyDays: 7, sunshineHours: 6 },
      { month: 11, avgHighC: 15, avgLowC: 5, rainyDays: 8, sunshineHours: 4 },
      { month: 12, avgHighC: 10, avgLowC: 2, rainyDays: 7, sunshineHours: 3 },
    ],
  };
}

function comoData() {
  return {
    research: {
      country: 'Italy',
      region: 'Lombardy',
      timezone: 'CET (UTC+1)',
      language: 'Italian',
      currency: 'EUR (€)',
      population: '84,000',
      elevation: '201m (659 ft)',
      bestTimeToVisit: 'May-Sep',
      avgTempHighC: 19,
      avgTempLowC: 8,
      dailyBudgetLow: '80',
      dailyBudgetMid: '180',
      dailyBudgetHigh: '400',
      budgetCurrency: 'USD',
      costNotes: 'Lake Como is one of Italy\'s more expensive destinations. Bellagio and Varenna are pricier; Como town is more affordable.',
      transportNotes: 'Ferry system connects lakeside towns (day pass ~€15). Buses serve the area. Train from Milan Centrale to Como takes ~40 min. Renting a car allows exploring smaller villages. Narrow roads around the lake.',
      nearestAirport: 'MXP (Milan Malpensa)',
      safetyRating: 5,
      safetyNotes: 'Very safe, quiet area',
      culturalNotes: 'Lake Como has been a retreat for the wealthy since Roman times. George Clooney\'s villa is in Laglio. The area is known for silk production. Many villa gardens are open to visitors.',
      summary: 'Italy\'s most glamorous lake, where Alpine peaks meet Mediterranean gardens. Elegant villas, charming villages, and stunning blue waters make Lake Como one of Europe\'s most beautiful destinations.',
      travelTips: JSON.stringify([
        'Take the ferry between Bellagio, Varenna, and Menaggio for the best lake experience',
        'Villa Carlotta and Villa del Balbianello are the must-see gardens',
        'Book restaurants in Bellagio in advance during summer',
        'The funicular in Como town gives great views',
        'Consider staying in Varenna — less crowded and equally beautiful',
      ]),
    },
    highlights: [
      { title: 'Bellagio', description: 'The "Pearl of Lake Como" — picturesque village with gardens, shops, and stunning views.', category: 'attraction', rating: 4.8, priceLevel: 3, duration: 'Half day', imageUrl: 'https://images.unsplash.com/photo-1537799943037-f5da89a65689?w=600&h=400&fit=crop' },
      { title: 'Villa del Balbianello', description: 'Romantic lakeside villa with spectacular gardens. Featured in Star Wars and James Bond.', category: 'cultural', rating: 4.7, priceLevel: 2, duration: '2 hours' },
      { title: 'Ferry Cruise', description: 'Cross the lake between villages — the views of mountains and villas are incredible.', category: 'activity', rating: 4.6, priceLevel: 1, duration: '1-3 hours' },
      { title: 'Varenna', description: 'Quieter, equally charming lakeside village with colorful houses and the Lovers\' Walk.', category: 'attraction', rating: 4.5, priceLevel: 2, duration: 'Half day' },
    ],
    weather: [
      { month: 1, avgHighC: 6, avgLowC: -1, rainyDays: 5, sunshineHours: 3 },
      { month: 2, avgHighC: 8, avgLowC: 0, rainyDays: 5, sunshineHours: 4 },
      { month: 3, avgHighC: 13, avgLowC: 4, rainyDays: 6, sunshineHours: 5 },
      { month: 4, avgHighC: 17, avgLowC: 7, rainyDays: 8, sunshineHours: 6 },
      { month: 5, avgHighC: 21, avgLowC: 11, rainyDays: 10, sunshineHours: 7 },
      { month: 6, avgHighC: 25, avgLowC: 15, rainyDays: 8, sunshineHours: 8 },
      { month: 7, avgHighC: 28, avgLowC: 17, rainyDays: 6, sunshineHours: 9 },
      { month: 8, avgHighC: 27, avgLowC: 17, rainyDays: 7, sunshineHours: 8 },
      { month: 9, avgHighC: 23, avgLowC: 13, rainyDays: 6, sunshineHours: 7 },
      { month: 10, avgHighC: 17, avgLowC: 9, rainyDays: 7, sunshineHours: 5 },
      { month: 11, avgHighC: 11, avgLowC: 4, rainyDays: 7, sunshineHours: 3 },
      { month: 12, avgHighC: 7, avgLowC: 0, rainyDays: 5, sunshineHours: 3 },
    ],
  };
}

function veniceData() {
  return {
    research: {
      country: 'Italy', region: 'Veneto', timezone: 'CET (UTC+1)', language: 'Italian',
      currency: 'EUR (€)', population: '260,000', bestTimeToVisit: 'Apr-Jun, Sep-Nov',
      dailyBudgetLow: '80', dailyBudgetMid: '170', dailyBudgetHigh: '400', budgetCurrency: 'USD',
      transportNotes: 'No cars — vaporetto (water bus) is main transport. 24h pass €25. Walking is essential. Water taxis are very expensive (€70+).',
      nearestAirport: 'VCE (Marco Polo)', safetyRating: 4,
      summary: 'A floating masterpiece of marble palaces, hidden piazzas, and winding canals. Venice is unlike anywhere else on Earth.',
      travelTips: JSON.stringify(['Get lost on purpose — the best discoveries are off the main paths', 'Avoid San Marco restaurants', 'Visit Murano for glassmaking and Burano for colorful houses']),
    },
    highlights: [
      { title: 'St. Mark\'s Basilica', description: 'Byzantine masterpiece with golden mosaics.', category: 'attraction', rating: 4.8, priceLevel: 1, duration: '1-2 hours' },
      { title: 'Rialto Market', description: 'Historic market for fresh seafood and produce since 1097.', category: 'food', rating: 4.5, priceLevel: 1, duration: '1 hour' },
      { title: 'Burano Island', description: 'Colorful fishing village famous for lace-making.', category: 'attraction', rating: 4.6, priceLevel: 1, duration: 'Half day' },
    ],
    weather: [
      { month: 1, avgHighC: 6, avgLowC: 0, rainyDays: 6, sunshineHours: 3 },
      { month: 2, avgHighC: 8, avgLowC: 1, rainyDays: 5, sunshineHours: 4 },
      { month: 3, avgHighC: 12, avgLowC: 4, rainyDays: 6, sunshineHours: 5 },
      { month: 4, avgHighC: 17, avgLowC: 8, rainyDays: 8, sunshineHours: 6 },
      { month: 5, avgHighC: 21, avgLowC: 13, rainyDays: 8, sunshineHours: 8 },
      { month: 6, avgHighC: 25, avgLowC: 16, rainyDays: 7, sunshineHours: 9 },
      { month: 7, avgHighC: 28, avgLowC: 19, rainyDays: 5, sunshineHours: 10 },
      { month: 8, avgHighC: 27, avgLowC: 18, rainyDays: 6, sunshineHours: 9 },
      { month: 9, avgHighC: 24, avgLowC: 15, rainyDays: 5, sunshineHours: 7 },
      { month: 10, avgHighC: 18, avgLowC: 10, rainyDays: 7, sunshineHours: 5 },
      { month: 11, avgHighC: 12, avgLowC: 5, rainyDays: 8, sunshineHours: 3 },
      { month: 12, avgHighC: 7, avgLowC: 1, rainyDays: 6, sunshineHours: 3 },
    ],
  };
}

function sienaData() {
  return {
    research: {
      country: 'Italy', region: 'Tuscany', timezone: 'CET (UTC+1)', language: 'Italian',
      currency: 'EUR (€)', population: '54,000', bestTimeToVisit: 'Apr-Jun, Sep-Oct',
      dailyBudgetLow: '55', dailyBudgetMid: '120', dailyBudgetHigh: '250', budgetCurrency: 'USD',
      nearestAirport: 'FLR (Florence)', safetyRating: 5,
      summary: 'Medieval Tuscan hill town famous for the Palio horse race and its shell-shaped Piazza del Campo. A UNESCO World Heritage Site.',
      travelTips: JSON.stringify(['The Palio is Jul 2 and Aug 16 — book months ahead', 'Try ricciarelli (almond cookies) and panforte', 'Walk the medieval streets at sunset']),
    },
    highlights: [
      { title: 'Piazza del Campo', description: 'One of Europe\'s greatest medieval squares and site of the famous Palio horse race.', category: 'attraction', rating: 4.8, priceLevel: 1, duration: '1-2 hours' },
      { title: 'Duomo di Siena', description: 'Stunning striped marble cathedral with intricate floor mosaics.', category: 'cultural', rating: 4.7, priceLevel: 2, duration: '2 hours' },
    ],
    weather: florenceData().weather, // similar to Florence
  };
}

function bolognaData() {
  return {
    research: {
      country: 'Italy', region: 'Emilia-Romagna', timezone: 'CET (UTC+1)', language: 'Italian',
      currency: 'EUR (€)', population: '390,000', bestTimeToVisit: 'Apr-Jun, Sep-Oct',
      dailyBudgetLow: '55', dailyBudgetMid: '110', dailyBudgetHigh: '250', budgetCurrency: 'USD',
      nearestAirport: 'BLQ (Marconi)', safetyRating: 4,
      summary: 'Italy\'s gastronomic capital — home of ragù, tortellini, mortadella, and the world\'s oldest university. Known as "La Grassa" (The Fat One).',
      travelTips: JSON.stringify(['Never order "spaghetti bolognese" — it doesn\'t exist here. Ask for tagliatelle al ragù', 'Climb the Asinelli Tower for panoramic views', 'The Quadrilatero market area is perfect for a food crawl']),
    },
    highlights: [
      { title: 'Quadrilatero Food District', description: 'Historic market streets packed with delis, pasta shops, and food stalls.', category: 'food', rating: 4.8, priceLevel: 2, duration: '2-3 hours' },
      { title: 'Two Towers', description: 'Bologna\'s iconic leaning towers — climb Asinelli for the best city view.', category: 'attraction', rating: 4.5, priceLevel: 1, duration: '1 hour' },
      { title: 'Tagliatelle al Ragù', description: 'The original "bolognese" — rich meat sauce on fresh egg pasta. A religious experience.', category: 'food', rating: 4.9, priceLevel: 2, duration: 'Dinner' },
    ],
    weather: florenceData().weather,
  };
}

function veronaData() {
  return {
    research: {
      country: 'Italy', region: 'Veneto', timezone: 'CET (UTC+1)', language: 'Italian',
      currency: 'EUR (€)', population: '258,000', bestTimeToVisit: 'Apr-Jun, Sep',
      dailyBudgetLow: '55', dailyBudgetMid: '120', dailyBudgetHigh: '270', budgetCurrency: 'USD',
      nearestAirport: 'VRN (Valerio Catullo)', safetyRating: 5,
      summary: 'Shakespeare\'s city of love. A stunning Roman arena hosts world-class opera, medieval streets wind through piazzas, and Juliet\'s balcony draws romantics from around the world.',
      travelTips: JSON.stringify(['Book Arena opera tickets for summer — it\'s magical under the stars', 'Skip the overpriced Juliet balcony and explore Castelvecchio instead', 'Great day trip base for Lake Garda']),
    },
    highlights: [
      { title: 'Arena di Verona', description: 'Roman amphitheater hosting spectacular open-air opera performances in summer.', category: 'cultural', rating: 4.8, priceLevel: 3, duration: '3 hours' },
      { title: 'Piazza delle Erbe', description: 'Vibrant market square surrounded by frescoed medieval buildings.', category: 'attraction', rating: 4.5, priceLevel: 1, duration: '1 hour' },
    ],
    weather: veniceData().weather,
  };
}

function milanData() {
  return {
    research: {
      country: 'Italy', region: 'Lombardy', timezone: 'CET (UTC+1)', language: 'Italian',
      currency: 'EUR (€)', population: '1.4 million', bestTimeToVisit: 'Apr-Jun, Sep-Oct',
      dailyBudgetLow: '70', dailyBudgetMid: '160', dailyBudgetHigh: '400', budgetCurrency: 'USD',
      nearestAirport: 'MXP (Malpensa)', safetyRating: 4,
      summary: 'Italy\'s fashion and design capital. Beyond the shopping, Milan offers Leonardo\'s Last Supper, a magnificent Duomo, and a thriving culinary scene.',
      travelTips: JSON.stringify(['Book Last Supper tickets months in advance — only 25 people every 15 minutes', 'Aperitivo culture is huge — most bars offer free buffets with evening drinks', 'The metro is excellent and covers the city well']),
    },
    highlights: [
      { title: 'Duomo di Milano', description: 'Magnificent Gothic cathedral — climb to the rooftop terraces for stunning views.', category: 'attraction', rating: 4.7, priceLevel: 2, duration: '2-3 hours' },
      { title: 'The Last Supper', description: 'Leonardo da Vinci\'s masterpiece in Santa Maria delle Grazie. Advance booking essential.', category: 'cultural', rating: 4.9, priceLevel: 2, duration: '1 hour' },
      { title: 'Navigli District', description: 'Canal-side neighborhood with aperitivo bars, restaurants, and Sunday antique market.', category: 'nightlife', rating: 4.4, priceLevel: 2, duration: 'Evening' },
    ],
    weather: [
      { month: 1, avgHighC: 5, avgLowC: -1, rainyDays: 5, sunshineHours: 3 },
      { month: 2, avgHighC: 8, avgLowC: 1, rainyDays: 5, sunshineHours: 4 },
      { month: 3, avgHighC: 14, avgLowC: 5, rainyDays: 6, sunshineHours: 5 },
      { month: 4, avgHighC: 18, avgLowC: 8, rainyDays: 8, sunshineHours: 6 },
      { month: 5, avgHighC: 23, avgLowC: 13, rainyDays: 9, sunshineHours: 7 },
      { month: 6, avgHighC: 27, avgLowC: 17, rainyDays: 7, sunshineHours: 9 },
      { month: 7, avgHighC: 30, avgLowC: 19, rainyDays: 5, sunshineHours: 10 },
      { month: 8, avgHighC: 29, avgLowC: 19, rainyDays: 6, sunshineHours: 9 },
      { month: 9, avgHighC: 25, avgLowC: 15, rainyDays: 5, sunshineHours: 7 },
      { month: 10, avgHighC: 18, avgLowC: 10, rainyDays: 7, sunshineHours: 5 },
      { month: 11, avgHighC: 11, avgLowC: 4, rainyDays: 7, sunshineHours: 3 },
      { month: 12, avgHighC: 6, avgLowC: 0, rainyDays: 5, sunshineHours: 2 },
    ],
  };
}

function genericItalyData(name: string) {
  return {
    research: {
      country: 'Italy', timezone: 'CET (UTC+1)', language: 'Italian', currency: 'EUR (€)',
      dailyBudgetLow: '60', dailyBudgetMid: '130', dailyBudgetHigh: '280', budgetCurrency: 'USD',
      safetyRating: 4,
      summary: `${name} — a beautiful Italian destination worth exploring.`,
    },
    highlights: [],
    weather: [],
  };
}

seed();
