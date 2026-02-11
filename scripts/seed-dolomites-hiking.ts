import { getDb } from '../src/db';
const db = getDb();
import { tripDestinations, itineraryItems } from '../src/db/schema';
import { eq, and, like } from 'drizzle-orm';

const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh'; // Italy 2026

// Dolomites hiking schedule: 3-4 day trips spread across the month
// Trip dates: June 10 - July 10, 2026
// Dolomites section: ~June 20 - July 5 (roughly weeks 2-4 of the trip)

async function seed() {
  console.log('🏔️ Seeding Dolomites hiking schedule...');

  // Add Dolomites sub-destinations with dates
  const dolomiteDestinations = [
    {
      tripId: TRIP_ID,
      name: 'Alpe di Siusi',
      description: 'Europe\'s largest high-altitude Alpine meadow. Gentle trails with stunning Sassolungo views. Perfect acclimatization hikes.',
      lat: 46.5417,
      lng: 11.6250,
      arrivalDate: '2026-06-20',
      departureDate: '2026-06-23',
      photoUrl: null,
      status: 'researched' as const,
      researchStatus: 'researched' as const,
      orderIndex: 10,
    },
    {
      tripId: TRIP_ID,
      name: 'Tre Cime di Lavaredo',
      description: 'Iconic three peaks circuit. One of the most famous hikes in the Dolomites — the classic loop around the towers.',
      lat: 46.6187,
      lng: 12.3019,
      arrivalDate: '2026-06-26',
      departureDate: '2026-06-28',
      photoUrl: null,
      status: 'researched' as const,
      researchStatus: 'researched' as const,
      orderIndex: 11,
    },
    {
      tripId: TRIP_ID,
      name: 'Lago di Braies',
      description: 'Emerald-green alpine lake surrounded by towering peaks. Easy lakeside walk + nearby Pragser Wildsee trails.',
      lat: 46.6940,
      lng: 12.0854,
      arrivalDate: '2026-06-28',
      departureDate: '2026-06-30',
      photoUrl: null,
      status: 'researched' as const,
      researchStatus: 'researched' as const,
      orderIndex: 12,
    },
    {
      tripId: TRIP_ID,
      name: 'Seceda',
      description: 'Sharp ridgeline above Val Gardena with dramatic Odle/Geisler group views. Cable car access + ridge hike.',
      lat: 46.6011,
      lng: 11.7264,
      arrivalDate: '2026-07-02',
      departureDate: '2026-07-04',
      photoUrl: null,
      status: 'researched' as const,
      researchStatus: 'researched' as const,
      orderIndex: 13,
    },
    {
      tripId: TRIP_ID,
      name: 'Cinque Torri',
      description: 'Five dramatic rock towers near Cortina. Moderate hiking with WW1 open-air museum and panoramic views.',
      lat: 46.5217,
      lng: 12.0444,
      arrivalDate: '2026-07-04',
      departureDate: '2026-07-06',
      photoUrl: null,
      status: 'researched' as const,
      researchStatus: 'researched' as const,
      orderIndex: 14,
    },
  ];

  const insertedDests = await db.insert(tripDestinations).values(dolomiteDestinations).returning();
  console.log(`✅ Added ${insertedDests.length} Dolomites destinations`);

  // Itinerary items for each hiking trip
  const hikingItinerary = [
    // ── Week 1: Alpe di Siusi (June 20-23) ──
    {
      tripId: TRIP_ID, date: '2026-06-20', title: 'Drive to Alpe di Siusi',
      description: 'Pick up from base in Bolzano/Verona area. Drive to Compatsch via Siusi cable car or road (restricted access after 9am).',
      startTime: '08:00', endTime: '11:00', location: 'Compatsch, Alpe di Siusi',
      category: 'transport' as const, orderIndex: 0,
    },
    {
      tripId: TRIP_ID, date: '2026-06-20', title: 'Acclimatization walk: Compatsch to Saltria',
      description: 'Easy 6km meadow walk across the plateau. Gentle introduction to altitude (~1,850m). Enjoy panoramic Sassolungo views.',
      startTime: '12:00', endTime: '15:00', location: 'Alpe di Siusi plateau',
      category: 'activity' as const, orderIndex: 1,
    },
    {
      tripId: TRIP_ID, date: '2026-06-20', title: 'Dinner at mountain hut',
      description: 'Traditional South Tyrolean cuisine — canederli, speck, strudel. Try local wines.',
      startTime: '18:30', endTime: '20:00', location: 'Rifugio Alpe di Siusi',
      category: 'meal' as const, orderIndex: 2,
    },
    {
      tripId: TRIP_ID, date: '2026-06-21', title: 'Hike: Bullaccia (Puflatsch) panoramic trail',
      description: 'Circular route to Bullaccia summit (2,176m). 360° views of Sassolungo, Sassopiatto, and Sciliar massif. ~4h, moderate.',
      startTime: '08:00', endTime: '13:00', location: 'Bullaccia / Puflatsch',
      category: 'activity' as const, orderIndex: 0,
    },
    {
      tripId: TRIP_ID, date: '2026-06-21', title: 'Lunch at Rifugio Bullaccia',
      description: 'Mountain refuge lunch with views. Fresh pasta and local cheese.',
      startTime: '13:00', endTime: '14:30', location: 'Rifugio Bullaccia',
      category: 'meal' as const, orderIndex: 1,
    },
    {
      tripId: TRIP_ID, date: '2026-06-21', title: 'Sunset photography at Sassolungo',
      description: 'Golden hour at the meadow viewpoints. Best light hits Sassolungo around 8pm in late June.',
      startTime: '19:30', endTime: '21:00', location: 'Alpe di Siusi viewpoints',
      category: 'sightseeing' as const, orderIndex: 2,
    },
    {
      tripId: TRIP_ID, date: '2026-06-22', title: 'Hike: Sassopiatto circuit (Plattkofel)',
      description: 'More challenging loop around Sassopiatto. Stunning rock formations and alpine flowers. ~5-6h, 800m elevation gain.',
      startTime: '07:30', endTime: '14:00', location: 'Sassopiatto / Plattkofel',
      category: 'activity' as const, orderIndex: 0,
    },
    {
      tripId: TRIP_ID, date: '2026-06-22', title: 'Rest & recovery afternoon',
      description: 'Relax at accommodation. Optional short walk to nearby viewpoints. Stretch and prepare for next day.',
      startTime: '15:00', endTime: '18:00', location: 'Accommodation',
      category: 'rest' as const, orderIndex: 1,
    },
    {
      tripId: TRIP_ID, date: '2026-06-23', title: 'Morning hike: Sciliar/Schlern approach',
      description: 'Half-day hike toward the Sciliar massif. Visit the Schlern plateau if energy permits. Return by noon.',
      startTime: '07:00', endTime: '12:00', location: 'Sciliar / Schlern',
      category: 'activity' as const, orderIndex: 0,
    },
    {
      tripId: TRIP_ID, date: '2026-06-23', title: 'Drive to base for next trip',
      description: 'Head back to valley. Rest day before Tre Cime trip.',
      startTime: '13:00', endTime: '15:00', location: 'Bolzano area',
      category: 'transport' as const, orderIndex: 1,
    },

    // ── Rest days June 24-25 ──
    {
      tripId: TRIP_ID, date: '2026-06-24', title: 'Rest day — explore Bolzano',
      description: 'Recovery day. Explore Bolzano old town, Ötzi museum, local markets. Legs need a break.',
      startTime: '10:00', endTime: '17:00', location: 'Bolzano',
      category: 'sightseeing' as const, orderIndex: 0,
    },
    {
      tripId: TRIP_ID, date: '2026-06-25', title: 'Rest & gear prep',
      description: 'Light day. Restock supplies, check gear, plan routes for Tre Cime. Maybe a gentle walk.',
      startTime: '10:00', endTime: '16:00', location: 'Base',
      category: 'rest' as const, orderIndex: 0,
    },

    // ── Week 2-3: Tre Cime + Braies (June 26-30) ──
    {
      tripId: TRIP_ID, date: '2026-06-26', title: 'Drive to Tre Cime area',
      description: 'Drive to Auronzo Refuge (2,320m). Toll road €30. Park early — gets packed by 10am.',
      startTime: '06:30', endTime: '09:30', location: 'Rifugio Auronzo',
      category: 'transport' as const, orderIndex: 0,
    },
    {
      tripId: TRIP_ID, date: '2026-06-26', title: 'Tre Cime circuit hike',
      description: 'THE classic Dolomites hike. Full loop around the three peaks (9.5km, ~3.5h). Stop at Rifugio Lavaredo and Rifugio Locatelli for photos of the iconic north face.',
      startTime: '10:00', endTime: '15:00', location: 'Tre Cime di Lavaredo',
      category: 'activity' as const, orderIndex: 1,
    },
    {
      tripId: TRIP_ID, date: '2026-06-26', title: 'Lunch at Rifugio Locatelli',
      description: 'Iconic mountain hut with the most famous Tre Cime viewpoint. Hearty mountain food.',
      startTime: '13:00', endTime: '14:00', location: 'Rifugio Locatelli',
      category: 'meal' as const, orderIndex: 2,
    },
    {
      tripId: TRIP_ID, date: '2026-06-27', title: 'Extended hike: Tre Cime to Lago di Cengia',
      description: 'Longer route beyond the standard circuit. Visit the turquoise Lago di Cengia. More challenging terrain, fewer crowds. ~6h.',
      startTime: '08:00', endTime: '15:00', location: 'Lago di Cengia / Büllelejoch',
      category: 'activity' as const, orderIndex: 0,
    },
    {
      tripId: TRIP_ID, date: '2026-06-27', title: 'Photography: golden hour at Tre Cime',
      description: 'If weather holds, evening light on the three peaks from the south side is magical.',
      startTime: '19:00', endTime: '21:00', location: 'Tre Cime south viewpoint',
      category: 'sightseeing' as const, orderIndex: 1,
    },
    {
      tripId: TRIP_ID, date: '2026-06-28', title: 'Drive to Lago di Braies',
      description: 'Short drive from Tre Cime area to Braies. Arrive early to beat crowds at the lake.',
      startTime: '07:00', endTime: '08:30', location: 'Lago di Braies',
      category: 'transport' as const, orderIndex: 0,
    },
    {
      tripId: TRIP_ID, date: '2026-06-28', title: 'Lago di Braies lakeside walk + boat',
      description: 'Easy loop around the lake (~3.5km, 1.5h). Rent a rowing boat on the emerald waters. Iconic photo spot.',
      startTime: '09:00', endTime: '12:00', location: 'Lago di Braies',
      category: 'activity' as const, orderIndex: 1,
    },
    {
      tripId: TRIP_ID, date: '2026-06-28', title: 'Hike: Croda del Becco approach',
      description: 'Afternoon hike from Braies toward Croda del Becco (2,810m). Challenging but rewarding summit with lake views. ~4h up and down.',
      startTime: '13:00', endTime: '17:30', location: 'Croda del Becco',
      category: 'activity' as const, orderIndex: 2,
    },
    {
      tripId: TRIP_ID, date: '2026-06-29', title: 'Hike: Pragser Wildsee to Grünwaldalm',
      description: 'Trail from Braies through forest to alpine meadows at Grünwaldalm. Moderate, peaceful. ~4h round trip.',
      startTime: '08:30', endTime: '13:00', location: 'Pragser Wildsee area',
      category: 'activity' as const, orderIndex: 0,
    },
    {
      tripId: TRIP_ID, date: '2026-06-29', title: 'Afternoon at Braies',
      description: 'Relaxed afternoon. Final lakeside photos, maybe another boat ride. Pack up.',
      startTime: '14:00', endTime: '17:00', location: 'Lago di Braies',
      category: 'rest' as const, orderIndex: 1,
    },
    {
      tripId: TRIP_ID, date: '2026-06-30', title: 'Drive back to valley base',
      description: 'Return to Bolzano/Val Gardena area. Rest before Seceda trip.',
      startTime: '09:00', endTime: '12:00', location: 'Val Gardena',
      category: 'transport' as const, orderIndex: 0,
    },

    // ── Rest day July 1 ──
    {
      tripId: TRIP_ID, date: '2026-07-01', title: 'Rest day in Val Gardena',
      description: 'Explore Ortisei village. Local shops, gelato, light walk. Rest legs for Seceda.',
      startTime: '10:00', endTime: '17:00', location: 'Ortisei, Val Gardena',
      category: 'rest' as const, orderIndex: 0,
    },

    // ── Week 3-4: Seceda + Cinque Torri (July 2-6) ──
    {
      tripId: TRIP_ID, date: '2026-07-02', title: 'Cable car to Seceda summit',
      description: 'Take the Ortisei-Seceda cable car to 2,500m. Arrive early for clear skies. Incredible Odle/Geisler views from the top.',
      startTime: '08:00', endTime: '09:00', location: 'Seceda, Val Gardena',
      category: 'transport' as const, orderIndex: 0,
    },
    {
      tripId: TRIP_ID, date: '2026-07-02', title: 'Hike: Seceda ridgeline to Pieralongia',
      description: 'Dramatic ridge walk with the Odle group towering beside you. One of the most photographed spots in the Dolomites. ~3h, moderate.',
      startTime: '09:00', endTime: '13:00', location: 'Seceda Ridge / Pieralongia',
      category: 'activity' as const, orderIndex: 1,
    },
    {
      tripId: TRIP_ID, date: '2026-07-02', title: 'Lunch at Rifugio Firenze',
      description: 'Mountain hut below the Odle peaks. Spectacular setting. Traditional Tyrolean food.',
      startTime: '13:30', endTime: '15:00', location: 'Rifugio Firenze / Regensburger Hütte',
      category: 'meal' as const, orderIndex: 2,
    },
    {
      tripId: TRIP_ID, date: '2026-07-03', title: 'Hike: Adolf Munkel Trail',
      description: 'Classic trail at the base of the Odle group. Forest and meadow trail with constant peak views. ~3.5h, easy-moderate.',
      startTime: '08:00', endTime: '12:30', location: 'Adolf Munkel Trail, Odle',
      category: 'activity' as const, orderIndex: 0,
    },
    {
      tripId: TRIP_ID, date: '2026-07-03', title: 'Drive to Cortina d\'Ampezzo area',
      description: 'Transfer to Cortina area for Cinque Torri. Scenic drive through mountain passes.',
      startTime: '14:00', endTime: '16:30', location: 'Cortina d\'Ampezzo',
      category: 'transport' as const, orderIndex: 1,
    },
    {
      tripId: TRIP_ID, date: '2026-07-04', title: 'Chairlift to Cinque Torri',
      description: 'Take the Averau-5 Torri chairlift from Bai de Dones. Quick access to the five towers.',
      startTime: '08:30', endTime: '09:00', location: 'Cinque Torri, Cortina',
      category: 'transport' as const, orderIndex: 0,
    },
    {
      tripId: TRIP_ID, date: '2026-07-04', title: 'Hike: Cinque Torri circuit + WW1 museum',
      description: 'Loop around the five towers with open-air WW1 trenches and museum. Fascinating history + geology. ~2.5h easy loop.',
      startTime: '09:00', endTime: '12:00', location: 'Cinque Torri',
      category: 'activity' as const, orderIndex: 1,
    },
    {
      tripId: TRIP_ID, date: '2026-07-04', title: 'Hike: Extend to Rifugio Averau',
      description: 'Continue from Cinque Torri up to Rifugio Averau (2,413m) for panoramic views toward Marmolada and Tofane. ~2h extra.',
      startTime: '12:30', endTime: '15:00', location: 'Rifugio Averau',
      category: 'activity' as const, orderIndex: 2,
    },
    {
      tripId: TRIP_ID, date: '2026-07-04', title: 'Dinner in Cortina',
      description: 'Celebrate the last hiking day in Cortina. Nice restaurant in the center. Well-earned feast.',
      startTime: '19:00', endTime: '21:00', location: 'Cortina d\'Ampezzo',
      category: 'meal' as const, orderIndex: 3,
    },
    {
      tripId: TRIP_ID, date: '2026-07-05', title: 'Morning hike: Lago di Sorapis (optional)',
      description: 'If legs allow — the famous turquoise lake hike from Passo Tre Croci. Challenging (12km, 500m gain). Start EARLY.',
      startTime: '07:00', endTime: '13:00', location: 'Lago di Sorapis',
      category: 'activity' as const, orderIndex: 0,
    },
    {
      tripId: TRIP_ID, date: '2026-07-05', title: 'Afternoon rest & explore Cortina',
      description: 'Wind down in Cortina. Browse shops, gelato, maybe a spa. Relax after two weeks of hiking.',
      startTime: '14:00', endTime: '18:00', location: 'Cortina d\'Ampezzo',
      category: 'rest' as const, orderIndex: 1,
    },
    {
      tripId: TRIP_ID, date: '2026-07-06', title: 'Depart Dolomites',
      description: 'Drive back to next destination or airport. End of Dolomites hiking chapter.',
      startTime: '09:00', endTime: '12:00', location: 'Dolomites → next destination',
      category: 'transport' as const, orderIndex: 0,
    },
  ];

  const insertedItems = await db.insert(itineraryItems).values(hikingItinerary).returning();
  console.log(`✅ Added ${insertedItems.length} itinerary items for Dolomites hiking`);

  console.log('\n📋 Schedule summary:');
  console.log('  Week 1 (Jun 20-23): Alpe di Siusi — meadow walks, Sassolungo views');
  console.log('  Rest (Jun 24-25): Recovery in Bolzano');
  console.log('  Week 2-3 (Jun 26-30): Tre Cime circuit + Lago di Braies');
  console.log('  Rest (Jul 1): Val Gardena village day');
  console.log('  Week 3-4 (Jul 2-6): Seceda ridgeline + Cinque Torri + optional Sorapis');
  console.log('\n🏔️ Done! Dolomites hiking schedule seeded.');

  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
