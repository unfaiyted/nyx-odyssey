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
  if (lower.includes('naples') || lower.includes('napoli') || lower.includes('amalfi')) return naplesAmalfiData();
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
      currency: 'EUR (€)', population: '390,000', elevation: '54m', bestTimeToVisit: 'Apr-Jun, Sep-Oct (avoid Aug — many restaurants close for Ferragosto)',
      dailyBudgetLow: '55', dailyBudgetMid: '110', dailyBudgetHigh: '250', budgetCurrency: 'USD',
      nearestAirport: 'BLQ (Marconi)', safetyRating: 4,
      safetyNotes: 'Very safe. Pickpocketing around the train station area — standard Italian city precautions. The university quarter can be rowdy late at night but not dangerous.',
      transportNotes: 'From Vicenza: Frecciarossa ~1h20 (€15-30) or Regionale ~2h (€10-14). DO NOT DRIVE — ZTL covers the entire historic center and parking is miserable. The city center is entirely walkable. Bus system exists but you won\'t need it except for San Luca (tourist train or bus 20).',
      culturalNotes: 'Bologna has three nicknames: La Grassa (The Fat One — for its food), La Dotta (The Learned — oldest university, est. 1088), La Rossa (The Red — for its terracotta architecture AND its left-leaning politics). Locals are proud, opinionated about food, and will correct you if you order wrong. Embrace it.',
      summary: 'Italy\'s undisputed food capital and one of its most livable cities. Home of tortellini in brodo, tagliatelle al ragù, mortadella, lasagne verde, and tigelle. The Quadrilatero market district is a medieval food paradise. 62km of UNESCO-listed porticoes keep you sheltered rain or shine. The Two Towers (climb the Asinelli — 498 steps, book ahead!) offer the best rooftop panorama in Italy. The university quarter buzzes with student nightlife. A cooking class here is worth every euro. Day trip works but overnight is better.',
      travelTips: JSON.stringify([
        'Never order "spaghetti bolognese" — it doesn\'t exist. The dish is tagliatelle al ragù.',
        'Tortellini are served in brodo (broth), NOT with cream. Cream tortellini is a tourist trap.',
        'Climb Torre degli Asinelli — 498 steps, €5, book at duetorribologna.com. Best view in the city.',
        'The Quadrilatero market is best visited 8:00-12:00 when stalls are buzzing.',
        'Buy food from Quadrilatero stalls and bring it to Osteria del Sole (est. 1465) — BYO food, they sell wine from €3.',
        'Don\'t eat at restaurants ON Piazza Maggiore — tourist traps. Walk 2 blocks in any direction.',
        'Lambrusco is the local wine — fizzy, red, chilled. Don\'t skip it.',
        'Walk the Portico di San Luca — 3.8km, 666 arches uphill to a sanctuary with stunning views.',
        'Aperitivo hour (18:00-20:00) is sacred. Bars serve free snacks with your drink.',
        'Via del Pratello is bar-crawl central. Things don\'t start until 22:00+.',
        'FICO Eataly World (food theme park) — skip it. Overpriced, soulless, possibly closed. Eat in the real city instead.',
        'Cooking class recommendation: Le Cesarine (cook in a nonna\'s home, ~€75-95) or La Vecchia Scuola Bolognese (~€70-90).',
        'Best trattorias: Anna Maria (tortellini — reserve!), dal Biassanot, Nonna Rosa (phone only), Via Serra (book way ahead).',
        'Best osterias: Fondazza (lasagne!), dell\'Orsa (cheap student favorite), Santa Caterina (hidden gem).',
        'For overnight: Via del Pratello nightlife, Le Stanze (cocktails in a frescoed chapel), Camera a Sud.',
      ]),
      costNotes: 'Day trip: €60-110/person (train + food + tower). Overnight with cooking class: €250-450/person. Bologna is excellent value compared to Florence or Venice — real food at real prices.',
    },
    highlights: [
      { title: 'Tortellini in Brodo', description: 'THE dish of Bologna. Hand-folded pasta parcels (pork, prosciutto, mortadella, Parmigiano) in golden capon broth. Not with cream — in broth. Best at: Trattoria Anna Maria, Nonna Rosa.', category: 'food', rating: 5.0, priceLevel: 2, duration: 'Lunch/Dinner' },
      { title: 'Tagliatelle al Ragù', description: 'What the world wrongly calls "spaghetti bolognese." Wide egg pasta ribbons with slow-cooked meat ragù. The official recipe is deposited at the Bologna Chamber of Commerce. Never served on spaghetti.', category: 'food', rating: 4.9, priceLevel: 2, duration: 'Lunch/Dinner' },
      { title: 'Quadrilatero Market District', description: 'Medieval market labyrinth between Piazza Maggiore and the Two Towers. Cured meats, fresh pasta, Parmigiano, produce. Key shops: Tamburini (buffet by weight), Salumeria Simoni (tagliere + Lambrusco), Atti (pasta since 1880). Best 8:00-12:00.', category: 'food', rating: 4.8, priceLevel: 2, duration: '2-3 hours' },
      { title: 'Torre degli Asinelli (Two Towers)', description: 'Italy\'s tallest medieval tower (97.2m). 498 steps up a narrow wooden staircase to a 360° panorama of terracotta rooftops and the Apennines. BOOK AHEAD at duetorribologna.com — €5, every 15 min, max 25 people. Not for vertigo/claustrophobia.', category: 'attraction', rating: 4.7, priceLevel: 1, duration: '45 min' },
      { title: 'Piazza Maggiore & San Petronio', description: 'Bologna\'s magnificent central square. San Petronio basilica (5th largest church in the world, unfinished facade, world\'s longest sundial inside — free). Neptune Fountain by Giambologna. Palazzo d\'Accursio. Atmospheric day and night.', category: 'attraction', rating: 4.6, priceLevel: 1, duration: '1 hour' },
      { title: 'Portico di San Luca (UNESCO)', description: '3.8km covered walkway with 666 arches climbing from Porta Saragozza to the Sanctuary of Madonna di San Luca. 45-60 min uphill walk rewarded with sweeping Po Valley views. Part of Bologna\'s 62km UNESCO-listed portico network. Alt: San Luca Express train (~€10).', category: 'attraction', rating: 4.7, priceLevel: 1, duration: '2-3 hours round trip' },
      { title: 'Osteria del Sole (est. 1465)', description: 'Oldest bar in Bologna. They sell ONLY wine (from €3/glass) — bring your own food from the Quadrilatero market stalls. Buy mortadella, cheese, bread, and eat like a true Bolognese. Pure, authentic, unforgettable.', category: 'food', rating: 4.8, priceLevel: 1, duration: '1 hour' },
      { title: 'Cooking Class — Make Tortellini', description: 'Le Cesarine: cook in a local nonna\'s kitchen (€75-95, 3-4h, includes meal + wine). La Vecchia Scuola Bolognese: professional school (€70-90, 3h). Italy Segreta: market tour + cooking combo (€120-150, 4-5h). Best activity in Bologna.', category: 'activity', rating: 4.9, priceLevel: 3, duration: '3-5 hours' },
      { title: 'Mortadella & Tigelle', description: 'Mortadella: the original "bologna" — silky pork cold cut, nothing like American baloney. Try it paper-thin at Tamburini. Tigelle: warm flatbreads filled with cured meats, squacquerone cheese, and pesto modenese. Perfect aperitivo or casual lunch.', category: 'food', rating: 4.7, priceLevel: 1, duration: 'Snack' },
      { title: 'University Quarter & Nightlife', description: 'Via Zamboni — the oldest university in the Western world (1088). Visit the Archiginnasio anatomical theater (€3). By night: Via del Pratello bar crawl, Le Stanze (cocktails in a frescoed chapel), Ruggine (craft beer). Things heat up after 22:00.', category: 'nightlife', rating: 4.5, priceLevel: 2, duration: 'Evening' },
      { title: 'Trattoria Anna Maria', description: 'Celebrity-covered walls, legendary tortellini in brodo, tagliatelle al ragù. Run by Anna Maria herself for decades. Reserve ahead — always packed. Via Belle Arti 17/a. Mains €12-18.', category: 'food', rating: 4.8, priceLevel: 2, duration: 'Lunch/Dinner' },
      { title: 'Osteria della Fondazza', description: 'Pub-like atmosphere, cheap prices, their lasagne is life-changing — melts in your mouth with Parmigiano and béchamel. Arrive when they open to skip the queue. Via Fondazza 36.', category: 'food', rating: 4.7, priceLevel: 1, duration: 'Lunch/Dinner' },
      { title: 'Lasagne Verde alla Bolognese', description: 'Spinach-tinted fresh pasta layers, ragù, béchamel, Parmigiano. Richer than ricotta-heavy versions elsewhere. Traditional Sunday lunch dish. Best at Osteria della Fondazza.', category: 'food', rating: 4.8, priceLevel: 2, duration: 'Lunch' },
    ],
    weather: [
      { month: 1, avgHighC: 5, avgLowC: -1, rainyDays: 5, sunshineHours: 3 },
      { month: 2, avgHighC: 8, avgLowC: 1, rainyDays: 5, sunshineHours: 4 },
      { month: 3, avgHighC: 14, avgLowC: 5, rainyDays: 6, sunshineHours: 5 },
      { month: 4, avgHighC: 18, avgLowC: 9, rainyDays: 8, sunshineHours: 6 },
      { month: 5, avgHighC: 24, avgLowC: 14, rainyDays: 8, sunshineHours: 8 },
      { month: 6, avgHighC: 28, avgLowC: 18, rainyDays: 6, sunshineHours: 9 },
      { month: 7, avgHighC: 31, avgLowC: 20, rainyDays: 4, sunshineHours: 10 },
      { month: 8, avgHighC: 31, avgLowC: 20, rainyDays: 5, sunshineHours: 9 },
      { month: 9, avgHighC: 26, avgLowC: 16, rainyDays: 5, sunshineHours: 7 },
      { month: 10, avgHighC: 19, avgLowC: 11, rainyDays: 7, sunshineHours: 5 },
      { month: 11, avgHighC: 12, avgLowC: 5, rainyDays: 7, sunshineHours: 3 },
      { month: 12, avgHighC: 6, avgLowC: 1, rainyDays: 5, sunshineHours: 2 },
    ],
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

function naplesAmalfiData() {
  return {
    research: {
      country: 'Italy', region: 'Campania', timezone: 'CET (UTC+1)', language: 'Italian',
      currency: 'EUR (€)', population: '3,000,000 (metro)', elevation: '17m (Naples)', bestTimeToVisit: 'May-Jun, Sep-Oct (avoid Jul-Aug peak crowds on coast)',
      avgTempHighC: 25, avgTempLowC: 14, rainyDaysPerMonth: 5,
      weatherNotes: 'Mediterranean climate. Summers hot (30°C+) and crowded on the coast. September is arguably the sweet spot — warm sea, thinner crowds, lower prices. Winter is mild but some coastal services shut down.',
      dailyBudgetLow: '55', dailyBudgetMid: '120', dailyBudgetHigh: '300', budgetCurrency: 'USD',
      costNotes: 'Naples itself is very affordable (pizza €4-5!). Amalfi Coast and Capri are significantly pricier — Positano hotels can be 3-5x Naples prices. Train from Vicenza RT €80-140. 3-day total: €400-600 budget, €650-1000 mid-range, €1200-1700+ splurge.',
      transportNotes: 'Trenitalia Frecciarossa or Italo from Vicenza → Napoli Centrale (~4h, €40-80 one-way if booked early). Circumvesuviana train for Pompeii/Herculaneum (€4, 30-40 min). Amalfi Coast: ferry (TravelMar/Alilauro, Apr-Oct, €8-15/segment) or SITA bus (€2-3). DO NOT drive the coast road in summer — narrow, terrifying, no parking. Private transfer Naples→Positano ~€120-150.',
      nearestAirport: 'NAP (Naples Capodichino)',
      safetyRating: 3,
      safetyNotes: 'Naples has a reputation worse than reality for tourists. Pickpocketing on Circumvesuviana and around Via Toledo — use cross-body bag, zipped. Phone snatching by scooter happens — keep phone secured. Avoid Piazza Garibaldi (station area) at night. The Camorra operates in the periphery, not the tourist center. Amalfi Coast and Capri are very safe. US Travel Advisory Level 2 (same as all of Italy).',
      culturalNotes: 'Naples is raw, chaotic, and intensely alive — the anti-Florence. Pizza was born here (UNESCO Intangible Cultural Heritage). Coffee culture is sacred — order "un caffè" at the bar, drink standing. The sfogliatella and babà are essential pastries. Neapolitans are loud, warm, and fiercely proud of their city. Don\'t compare their pizza to anyone else\'s.',
      summary: 'Naples and the Amalfi Coast represent southern Italy at its most intense — chaotic, beautiful, delicious, and ancient. Naples is the pizza capital of the world (Da Michele, Sorbillo, Starita). Pompeii and Herculaneum offer Roman ruins frozen in time by Vesuvius. The Amalfi Coast (Positano, Amalfi, Ravello) is one of Earth\'s most beautiful coastlines. Add a Capri day trip for island glamour. Budget 3-4 days minimum from Vicenza.',
      travelTips: JSON.stringify([
        'Book Pompeii tickets in advance — 20,000/day cap, timed entry required, sells out in summer.',
        'Visit Naples Archaeological Museum (MANN) BEFORE Pompeii — the context makes the ruins 10x more meaningful.',
        'Pizza at Da Michele: only Margherita or Marinara. Go at 11am opening to beat the 1-2hr lines. €4-5 per pizza.',
        'Sorbillo (Via dei Tribunali) for variety, Starita for pizza fritta (fried pizza — a Naples street food staple).',
        'Cappella Sansevero (Veiled Christ sculpture) — book timed entry ahead, it sells out.',
        'Amalfi Coast ferry > bus in summer. Bus is cheap but packed and motion-sickness-inducing on hairpin roads.',
        'Positano is the most photogenic but priciest. Stay in Praiano or Amalfi for better value.',
        'La Tagliata in Positano: hilltop family restaurant with incredible views and food — MUST book ahead.',
        'Ravello is the cultured, quieter gem. Villa Cimbrone\'s Terrace of Infinity is one of Italy\'s best viewpoints.',
        'Capri: take earliest ferry (7:00-7:30 AM). Blue Grotto first (often closed due to waves — check conditions). Bring lunch from mainland to save money.',
        'September is the best month: warm water, fewer crowds, lower prices.',
        'Lemon everything: limoncello, delizie al limone (cream cake), lemon granita, lemon salad. Buy from small producers, not tourist shops.',
        'Path of the Gods hike: Bomerano → Nocelle, 7.8km, 3-4 hours, dramatic cliffside trail. Then 1,700 steps down to Positano.',
        'Don\'t drive the SS163 coast road in peak summer unless you enjoy white-knuckle terror with tour buses inches from your mirrors.',
        'Book Amalfi Coast hotels months ahead for July/August. Positano books up fastest.',
      ]),
    },
    highlights: [
      { title: 'L\'Antica Pizzeria Da Michele', description: 'The purist\'s pilgrimage. Founded 1870, serves only TWO pizzas: Margherita and Marinara. Featured in Eat Pray Love. €4-5 per pizza. Go at 11am opening or expect 1-2hr waits.', category: 'food', rating: 4.9, priceLevel: 1, address: 'Via Cesare Sersale 1, Naples', websiteUrl: 'damichele.net', duration: '1 hour' },
      { title: 'Gino e Toto Sorbillo', description: 'Celebrity pizzaiolo Gino Sorbillo\'s original Via dei Tribunali location. More variety than Da Michele, creative toppings alongside flawless classics. Also has epic lines.', category: 'food', rating: 4.8, priceLevel: 1, address: 'Via dei Tribunali 32, Naples', duration: '1 hour' },
      { title: 'Pizzeria Starita a Materdei', description: 'Founded 1901, featured in L\'Oro di Napoli (Sophia Loren). Famous for pizza fritta (fried pizza) and the Montanara. Slightly off-tourist-trail in Materdei.', category: 'food', rating: 4.8, priceLevel: 1, address: 'Via Materdei 27/28, Naples', duration: '1 hour' },
      { title: '50 Kalò (Ciro Salvo)', description: 'Perfect Margherita on the Naples waterfront at Via Partenope. Less chaotic than the centro storico spots, great views. Modern but traditional.', category: 'food', rating: 4.8, priceLevel: 2, address: 'Via Partenope, Naples', duration: '1 hour' },
      { title: 'Pompeii', description: 'Roman city frozen in ash by Vesuvius in 79 AD. 170 acres of ruins — Forum, House of the Faun, Garden of the Fugitives, Villa of the Mysteries. 20,000/day cap — book timed entry! Circumvesuviana train 30-40 min from Naples.', category: 'attraction', rating: 4.9, priceLevel: 2, address: 'Pompei Scavi', websiteUrl: 'pompeiisites.org', duration: '3-4 hours' },
      { title: 'Herculaneum (Ercolano)', description: 'Smaller but better preserved than Pompeii — buried under 20m of volcanic mud, preserving wood, fabric, and upper floors. Far less crowded. The boat houses with 300+ skeletons are haunting.', category: 'attraction', rating: 4.8, priceLevel: 2, duration: '1.5-2 hours' },
      { title: 'Naples Archaeological Museum (MANN)', description: 'Houses the majority of Pompeii/Herculaneum artifacts. Farnese Collection, Alexander Mosaic, Secret Cabinet (Roman erotic art). Visit BEFORE Pompeii for context. €18.', category: 'cultural', rating: 4.8, priceLevel: 2, websiteUrl: 'museoarcheologiconapoli.it', duration: '2-3 hours' },
      { title: 'Cappella Sansevero', description: 'The Veiled Christ — one of the most extraordinary marble sculptures ever created. Transparent marble veil over Christ\'s body. Tiny chapel, book timed entry. €10.', category: 'cultural', rating: 4.9, priceLevel: 2, websiteUrl: 'museosansevero.it', duration: '45 min' },
      { title: 'Spaccanapoli', description: 'The ancient street that "splits Naples" — walk from Via Toledo through the chaotic historic center. Narrow streets, churches every 50 meters, street vendors, laundry overhead. THIS is Naples.', category: 'attraction', rating: 4.7, priceLevel: 1, duration: '2-3 hours' },
      { title: 'Positano', description: 'The most photogenic Amalfi Coast town — cascading pastel buildings to the beach. Most expensive and touristic. Spiaggia Grande for beach, La Tagliata for hillside dining with views.', category: 'attraction', rating: 4.8, priceLevel: 3, duration: 'Half day' },
      { title: 'Ravello', description: 'Perched high above the coast — the cultured, quieter alternative. Villa Rufolo (Wagner was inspired here) and Villa Cimbrone (Terrace of Infinity). Summer music festival. Cumpa Cosimo for dinner.', category: 'attraction', rating: 4.7, priceLevel: 2, duration: '3-4 hours' },
      { title: 'Amalfi', description: 'Historic heart of the coast, once a powerful maritime republic. 9th-century Duomo with Arab-Norman architecture. More affordable than Positano. Paper museum is a unique gem.', category: 'attraction', rating: 4.6, priceLevel: 2, duration: '2-3 hours' },
      { title: 'Capri & Blue Grotto', description: 'Glamorous island day trip. Blue Grotto (€28 total, weather-dependent), boat tour of Faraglioni, Monte Solaro chairlift (€12 RT), Gardens of Augustus. Take earliest ferry from Naples (~50 min, €22-25).', category: 'attraction', rating: 4.7, priceLevel: 3, duration: 'Full day' },
      { title: 'Path of the Gods (Sentiero degli Dei)', description: 'Signature Amalfi Coast hike: Bomerano → Nocelle, 7.8km, 3-4 hours along dramatic cliffs above the sea. Then 1,700 steps down to Positano. Not for vertigo sufferers. Go early morning.', category: 'activity', rating: 4.8, priceLevel: 1, duration: '4-5 hours' },
      { title: 'La Tagliata (Positano)', description: 'Hillside family restaurant above Positano with jaw-dropping coast views. Multi-course feast of local dishes. BOOK AHEAD — always full. One of the most memorable meals on the coast.', category: 'food', rating: 4.9, priceLevel: 2, address: 'Via Tagliata 22, Positano', duration: 'Dinner' },
      { title: 'Lemon Everything', description: 'Amalfi\'s giant Sfusato Amalfitano lemons are legendary. Limoncello from small producers, delizie al limone (cream cake), lemon granita, lemon salad. Visit a limoneto (lemon grove) for tastings.', category: 'food', rating: 4.6, priceLevel: 1, duration: 'Ongoing' },
      { title: 'Naples Underground (Napoli Sotterranea)', description: 'Greek-Roman aqueducts 40m below the streets. Guided tours only, ~90 min. Fascinating layers of history beneath the chaotic city above.', category: 'attraction', rating: 4.5, priceLevel: 2, duration: '90 min' },
      { title: 'Sfogliatella & Babà', description: 'Naples\' essential pastries. Sfogliatella: crispy shell-shaped ricotta pastry (try Sfogliatella Mary or Pintauro). Babà: rum-soaked sponge cake. Pair with espresso at Caffè Gambrinus on Piazza del Plebiscito.', category: 'food', rating: 4.7, priceLevel: 1, duration: 'Snack' },
    ],
    weather: [
      { month: 1, avgHighC: 13, avgLowC: 4, rainyDays: 9, sunshineHours: 4 },
      { month: 2, avgHighC: 13, avgLowC: 4, rainyDays: 9, sunshineHours: 4 },
      { month: 3, avgHighC: 16, avgLowC: 6, rainyDays: 8, sunshineHours: 5 },
      { month: 4, avgHighC: 19, avgLowC: 9, rainyDays: 7, sunshineHours: 7 },
      { month: 5, avgHighC: 23, avgLowC: 13, rainyDays: 5, sunshineHours: 8 },
      { month: 6, avgHighC: 27, avgLowC: 17, rainyDays: 3, sunshineHours: 10 },
      { month: 7, avgHighC: 30, avgLowC: 19, rainyDays: 2, sunshineHours: 11 },
      { month: 8, avgHighC: 30, avgLowC: 20, rainyDays: 3, sunshineHours: 10 },
      { month: 9, avgHighC: 27, avgLowC: 17, rainyDays: 5, sunshineHours: 8 },
      { month: 10, avgHighC: 22, avgLowC: 13, rainyDays: 7, sunshineHours: 6 },
      { month: 11, avgHighC: 17, avgLowC: 8, rainyDays: 9, sunshineHours: 4 },
      { month: 12, avgHighC: 14, avgLowC: 5, rainyDays: 10, sunshineHours: 3 },
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
