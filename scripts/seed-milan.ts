/**
 * Seed script: Milan day trip / overnight research data.
 *
 * Milan is ~2 hours by train from Vicenza. This seeds destinations,
 * itinerary items, and budget for a Milan visit covering the Duomo,
 * The Last Supper, Navigli, Brera, fashion district, and modern architecture.
 *
 * ⚠️ CRITICAL: Last Supper tickets for June-July 2026 expected to release
 * mid-March 2026. Set calendar reminders!
 *
 * Usage:  bun scripts/seed-milan.ts
 */
import { getDb } from '../src/db';
const db = getDb();
import { tripDestinations, itineraryItems, budgetItems } from '../src/db/schema';

const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh'; // Italy 2026

async function seed() {
  console.log('🏙️ Seeding Milan trip data...');

  // ── Milan sub-destinations ──────────────────────────────
  const milanDestinations = [
    {
      tripId: TRIP_ID,
      name: 'Duomo di Milano',
      description:
        'Italy\'s largest cathedral and 3rd largest in the world. Gothic masterpiece with 135 marble spires, 3,400+ statues. ⚠️ ROOFTOP TERRACES are the highlight — walk among the spires with Alpine views on clear days. Duomo Pass + Lift: €20. Book online at duomomilano.it to skip lines. Dress code enforced (covered shoulders/knees). Allow 2-3 hours for cathedral + rooftop.',
      lat: 45.4641,
      lng: 9.1919,
      arrivalDate: null,
      departureDate: null,
      photoUrl: null,
      status: 'researched' as const,
      researchStatus: 'researched' as const,
      orderIndex: 30,
    },
    {
      tripId: TRIP_ID,
      name: 'The Last Supper (Cenacolo Vinciano)',
      description:
        'Leonardo da Vinci\'s masterpiece (1495-1498) at Santa Maria delle Grazie. ⚠️ EXTREMELY LIMITED: only 40 visitors per 15-minute slot. Tickets released quarterly — June-July 2026 tickets expected mid-March 2026. Book at lastsupper.shop (max 5 tickets) or call +39 02 92800360 (max 9). €15 + €2 fee. BACKUP: GetYourGuide/Viator guided tours (€50-80) guarantee entry. Arrive 15 min early — late = denied, no refund.',
      lat: 45.4660,
      lng: 9.1711,
      arrivalDate: null,
      departureDate: null,
      photoUrl: null,
      status: 'researched' as const,
      researchStatus: 'researched' as const,
      orderIndex: 31,
    },
    {
      tripId: TRIP_ID,
      name: 'Galleria Vittorio Emanuele II',
      description:
        'Italy\'s oldest active shopping gallery (1877). Stunning iron-and-glass vaulted ceiling, luxury flagships (Prada was born here 1913). FREE to walk through. Spin your heel on the bull mosaic for luck. Stop at Caffè Camparino (1867) for a Campari Spritz at the source. Best when lit up at night.',
      lat: 45.4657,
      lng: 9.1900,
      arrivalDate: null,
      departureDate: null,
      photoUrl: null,
      status: 'researched' as const,
      researchStatus: 'researched' as const,
      orderIndex: 32,
    },
    {
      tripId: TRIP_ID,
      name: 'Navigli Canal District',
      description:
        'Milan\'s most atmospheric neighborhood for evening aperitivo. Canals partly designed by Leonardo da Vinci. Milanese aperitivo tradition: €8-12 cocktail comes with generous free buffet (pasta, bruschetta, salads). Try: Negroni Sbagliato (born in Milan!), Aperol Spritz, Campari Soda. Top bars: Mag Caffè, Rita, Fonderie Milanesi. Metro M2 Porta Genova. Antique market last Sunday of month.',
      lat: 45.4497,
      lng: 9.1793,
      arrivalDate: null,
      departureDate: null,
      photoUrl: null,
      status: 'researched' as const,
      researchStatus: 'researched' as const,
      orderIndex: 33,
    },
    {
      tripId: TRIP_ID,
      name: 'Pinacoteca di Brera',
      description:
        'One of Italy\'s greatest art collections in a 17th-century palazzo. Raphael\'s Marriage of the Virgin, Mantegna\'s Dead Christ, Caravaggio\'s Supper at Emmaus, Piero della Francesca\'s Brera Madonna. €15. Tues-Sun 8:30-19:15 (closed Mon). Thursday evenings until 22:15 for just €3 after 18:00! Now manages The Last Supper Museum too.',
      lat: 45.4720,
      lng: 9.1880,
      arrivalDate: null,
      departureDate: null,
      photoUrl: null,
      status: 'researched' as const,
      researchStatus: 'researched' as const,
      orderIndex: 34,
    },
    {
      tripId: TRIP_ID,
      name: 'Bosco Verticale & Porta Nuova',
      description:
        'Award-winning "Vertical Forest" towers covered in 900+ trees and 20,000+ plants (Stefano Boeri, 2014). Private residences — view from Piazza Gae Aulenti and BAM park at the base. Milan\'s most Instagrammable modern architecture. Combine with nearby Porta Nuova district for a futuristic contrast to the Gothic Duomo.',
      lat: 45.4868,
      lng: 9.1900,
      arrivalDate: null,
      departureDate: null,
      photoUrl: null,
      status: 'researched' as const,
      researchStatus: 'researched' as const,
      orderIndex: 35,
    },
    {
      tripId: TRIP_ID,
      name: 'CityLife District',
      description:
        'Milan\'s newest skyline: three starchitect towers — Isozaki (209m, Milan\'s tallest), Zaha Hadid (twisting), Libeskind (curved). Modern park and shopping district. Metro M5 Tre Torri. Worth a quick visit for architecture fans; combine with Bosco Verticale for a modern Milan half-day.',
      lat: 45.4750,
      lng: 9.1550,
      arrivalDate: null,
      departureDate: null,
      photoUrl: null,
      status: 'researched' as const,
      researchStatus: 'researched' as const,
      orderIndex: 36,
    },
    {
      tripId: TRIP_ID,
      name: 'Quadrilatero della Moda (Fashion District)',
      description:
        'Milan\'s fashion quadrilateral: Via Montenapoleone, Via della Spiga, Via Sant\'Andrea, Via Manzoni. Worth visiting even without shopping — incredible architecture, world-class window displays, elite people-watching. Visit Armani/Silos museum (€12, 4 floors of iconic designs). Coffee at Cova Pasticceria (since 1817). Free to stroll.',
      lat: 45.4690,
      lng: 9.1960,
      arrivalDate: null,
      departureDate: null,
      photoUrl: null,
      status: 'researched' as const,
      researchStatus: 'researched' as const,
      orderIndex: 37,
    },
    {
      tripId: TRIP_ID,
      name: 'Fondazione Prada',
      description:
        'Contemporary art museum in a former gin distillery, expanded by Rem Koolhaas/OMA. Stunning architecture. Bar Luce (Wes Anderson-designed café) worth a coffee just for the aesthetic. €15. Wed-Mon 10:00-19:00. Near Porta Romana, south Milan.',
      lat: 45.4445,
      lng: 9.2048,
      arrivalDate: null,
      departureDate: null,
      photoUrl: null,
      status: 'researched' as const,
      researchStatus: 'researched' as const,
      orderIndex: 38,
    },
  ];

  const insertedDests = await db
    .insert(tripDestinations)
    .values(milanDestinations)
    .returning();
  console.log(`✅ Added ${insertedDests.length} Milan destinations`);

  // ── Overnight itinerary (recommended) ──────────────────
  const milanItinerary = [
    // ── Day 1: Afternoon Arrival ──
    {
      tripId: TRIP_ID,
      date: '2026-07-04',
      title: '🚂 Train Vicenza → Milano Centrale',
      description:
        'Frecciarossa/Frecciargento high-speed train. ~1h 45m-2h 15m. Book 2-4 weeks ahead on Trenitalia app for Super Economy fares (~€19-25). Walk-up: €40-55. Milano Centrale connects to Metro M2/M3.',
      startTime: '12:00',
      endTime: '14:00',
      location: 'Vicenza → Milano Centrale',
      category: 'transport' as const,
      orderIndex: 0,
    },
    {
      tripId: TRIP_ID,
      date: '2026-07-04',
      title: '🏨 Check in & drop bags',
      description:
        'Hotel near Navigli or Brera. Budget: €80-130/night. Hostels from €30-50. Drop bags and head out.',
      startTime: '14:15',
      endTime: '14:45',
      location: 'Milan hotel',
      category: 'accommodation' as const,
      orderIndex: 1,
    },
    {
      tripId: TRIP_ID,
      date: '2026-07-04',
      title: '👗 Fashion District stroll',
      description:
        'Walk Via Montenapoleone → Via della Spiga. Window shop, people-watch, admire the architecture. Even without buying, the visual merchandising is art. Stop at Cova Pasticceria (since 1817) for coffee.',
      startTime: '15:00',
      endTime: '16:30',
      location: 'Quadrilatero della Moda',
      category: 'sightseeing' as const,
      orderIndex: 2,
    },
    {
      tripId: TRIP_ID,
      date: '2026-07-04',
      title: '🎨 Brera neighborhood wander',
      description:
        'Cobblestone streets, art galleries, independent boutiques, bookshops. Milan\'s bohemian heart. Visit Orto Botanico di Brera (free botanical garden). More refined aperitivo scene than Navigli.',
      startTime: '16:30',
      endTime: '17:30',
      location: 'Brera District',
      category: 'sightseeing' as const,
      orderIndex: 3,
    },
    {
      tripId: TRIP_ID,
      date: '2026-07-04',
      title: '🍹 Aperitivo — Milanese Style',
      description:
        'THE Milan experience. €8-12 cocktail with generous free buffet. Try a Negroni Sbagliato (invented here!) or Campari Soda. Head to Navigli: Mag Caffè (craft cocktails), Rita (great buffet), or Fonderie Milanesi (converted foundry vibes). Aperitivo runs 6-9 PM.',
      startTime: '18:00',
      endTime: '20:00',
      location: 'Navigli Canal District',
      category: 'meal' as const,
      orderIndex: 4,
    },
    {
      tripId: TRIP_ID,
      date: '2026-07-04',
      title: '🍝 Dinner along the canals',
      description:
        'If aperitivo buffet wasn\'t enough: Trattoria Milanese (Via Santa Marta 11, since 1933, perfect cotoletta & risotto, €30-45/pp) or Al Pont de Ferr (1 Michelin star, canal-side, €80-100/pp, book ahead). Must-try: risotto alla Milanese (saffron), cotoletta alla Milanese, ossobuco.',
      startTime: '20:30',
      endTime: '22:00',
      location: 'Navigli / Milan center',
      category: 'meal' as const,
      orderIndex: 5,
    },

    // ── Day 2: Full Sightseeing ──
    {
      tripId: TRIP_ID,
      date: '2026-07-05',
      title: '🎨 The Last Supper (TIMED ENTRY)',
      description:
        '⚠️ PRE-BOOK MONTHS AHEAD at lastsupper.shop. Tickets for June-July 2026 expected mid-March 2026 — check daily! Only 40 people per 15-min slot. Exactly 15 minutes of viewing. Arrive 15 min early — late = denied, no refund. Painting is MUCH larger than expected (~15×29 ft). Photos OK, no flash.',
      startTime: '08:15',
      endTime: '09:00',
      location: 'Santa Maria delle Grazie, Piazza di Santa Maria delle Grazie 2',
      category: 'sightseeing' as const,
      orderIndex: 0,
    },
    {
      tripId: TRIP_ID,
      date: '2026-07-05',
      title: '⛪ Duomo di Milano + Rooftop Terraces',
      description:
        'Walk from Last Supper (~20 min) or Metro. Cathedral interior + rooftop terraces among 135 marble spires. Duomo Pass + Lift: €20. Book online. Dress code: covered shoulders/knees. On clear days, see the Alps from the roof. Golden hour is magical but it\'ll be morning — still incredible.',
      startTime: '09:30',
      endTime: '12:00',
      location: 'Piazza del Duomo',
      category: 'sightseeing' as const,
      orderIndex: 1,
    },
    {
      tripId: TRIP_ID,
      date: '2026-07-05',
      title: '🏛️ Galleria Vittorio Emanuele II + Luini Panzerotti',
      description:
        'Walk through Italy\'s most beautiful covered arcade (directly adjacent to Duomo). Then grab lunch at Luini Panzerotti (Via S. Radegonda 16) — iconic fried dough pockets with mozzarella & tomato, €3. Queue moves fast. Since 1888.',
      startTime: '12:00',
      endTime: '12:45',
      location: 'Galleria Vittorio Emanuele II → Via S. Radegonda',
      category: 'meal' as const,
      orderIndex: 2,
    },
    {
      tripId: TRIP_ID,
      date: '2026-07-05',
      title: '🎨 Pinacoteca di Brera',
      description:
        'One of Italy\'s greatest art museums. Raphael, Mantegna\'s Dead Christ, Caravaggio, Bellini, Piero della Francesca. €15. Allow 1.5-2 hours. Thursday evenings: €3 after 18:00.',
      startTime: '13:00',
      endTime: '15:00',
      location: 'Via Brera 28',
      category: 'sightseeing' as const,
      orderIndex: 3,
    },
    {
      tripId: TRIP_ID,
      date: '2026-07-05',
      title: '🏗️ Modern Milan: Bosco Verticale + Piazza Gae Aulenti',
      description:
        'Metro M2 to Garibaldi. See the award-winning Vertical Forest towers, stroll BAM park, and admire the futuristic Porta Nuova district. Great photos from Piazza Gae Aulenti. 30-45 min.',
      startTime: '15:15',
      endTime: '16:00',
      location: 'Porta Nuova / Via Gaetano de Castillia',
      category: 'sightseeing' as const,
      orderIndex: 4,
    },
    {
      tripId: TRIP_ID,
      date: '2026-07-05',
      title: '☕ Coffee at Ratanà',
      description:
        'Modern Milanese cuisine in a restored railway building right near Bosco Verticale. Great for a late-afternoon coffee/snack or early aperitivo. Excellent risotto if hungry.',
      startTime: '16:00',
      endTime: '16:30',
      location: 'Via Gaetano de Castillia 28',
      category: 'meal' as const,
      orderIndex: 5,
    },
    {
      tripId: TRIP_ID,
      date: '2026-07-05',
      title: '🚂 Train Milano Centrale → Vicenza',
      description:
        'Head back to Centrale. Evening train home. Arrive Vicenza by ~19:00-20:00.',
      startTime: '17:00',
      endTime: '19:00',
      location: 'Milano Centrale → Vicenza',
      category: 'transport' as const,
      orderIndex: 6,
    },
  ];

  const insertedItems = await db
    .insert(itineraryItems)
    .values(milanItinerary)
    .returning();
  console.log(`✅ Added ${insertedItems.length} Milan itinerary items`);

  // ── Budget estimates ──────────────────────────────────
  const milanBudget = [
    {
      tripId: TRIP_ID,
      category: 'transport',
      description: 'Train Vicenza↔Milan round trip (booked ahead)',
      estimatedCost: '50.00',
      date: '2026-07-04',
    },
    {
      tripId: TRIP_ID,
      category: 'transport',
      description: 'Milan Metro day pass (2 days)',
      estimatedCost: '15.20',
      date: '2026-07-04',
    },
    {
      tripId: TRIP_ID,
      category: 'accommodation',
      description: 'Milan hotel (1 night, budget-mid range)',
      estimatedCost: '110.00',
      date: '2026-07-04',
    },
    {
      tripId: TRIP_ID,
      category: 'activities',
      description: 'The Last Supper — timed entry ticket',
      estimatedCost: '17.00',
      date: '2026-07-05',
    },
    {
      tripId: TRIP_ID,
      category: 'activities',
      description: 'Duomo Pass + Lift (cathedral + rooftop + museum)',
      estimatedCost: '20.00',
      date: '2026-07-05',
    },
    {
      tripId: TRIP_ID,
      category: 'activities',
      description: 'Pinacoteca di Brera',
      estimatedCost: '15.00',
      date: '2026-07-05',
    },
    {
      tripId: TRIP_ID,
      category: 'food',
      description: 'Day 1 — aperitivo + dinner (Navigli)',
      estimatedCost: '55.00',
      date: '2026-07-04',
    },
    {
      tripId: TRIP_ID,
      category: 'food',
      description: 'Day 2 — Luini lunch + coffee + snacks',
      estimatedCost: '25.00',
      date: '2026-07-05',
    },
  ];

  const insertedBudget = await db
    .insert(budgetItems)
    .values(milanBudget)
    .returning();
  console.log(`✅ Added ${insertedBudget.length} Milan budget items`);

  console.log('\n📋 Milan Overnight Summary:');
  console.log('  Day 1 (Jul 4): Arrive → Fashion District → Brera → Aperitivo in Navigli → Dinner');
  console.log('  Day 2 (Jul 5): Last Supper → Duomo + Rooftop → Galleria → Brera Art → Bosco Verticale → Home');
  console.log('\n⚠️  CRITICAL BOOKING REMINDERS:');
  console.log('  1. THE LAST SUPPER — Tickets for Jun-Jul 2026 release ~mid-March 2026');
  console.log('     → Check lastsupper.shop DAILY starting early March');
  console.log('     → Backup: GetYourGuide/Viator guided tours (€50-80)');
  console.log('  2. Duomo rooftop — Book online at duomomilano.it (skip ticket line)');
  console.log('  3. Train tickets — Book 2-4 weeks ahead on Trenitalia for €19-25 fares');
  console.log('  💰 Estimated total: ~€307 per person (overnight)');
  console.log('\n🏙️ Done! Milan data seeded.');

  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
