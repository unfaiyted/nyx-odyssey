/**
 * Seed script: Florence weekend trip research data.
 *
 * Florence is 2-2.5 hrs from Vicenza. This seeds a weekend itinerary
 * with Uffizi Gallery, Duomo complex, and other highlights.
 * Key note: Uffizi and Duomo Dome require timed entry tickets booked in advance.
 *
 * Usage:  bun scripts/seed-florence-weekend.ts
 */
import { getDb } from '../src/db';
const db = getDb();
import { tripDestinations, itineraryItems, budgetItems } from '../src/db/schema';
import { eq } from 'drizzle-orm';

const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh'; // Italy 2026

async function seed() {
  console.log('🏛️ Seeding Florence weekend trip data...');

  // ── Florence sub-destinations ──────────────────────────
  const florenceDestinations = [
    {
      tripId: TRIP_ID,
      name: 'Uffizi Gallery',
      description:
        'World\'s greatest collection of Italian Renaissance art. Botticelli\'s Birth of Venus, da Vinci\'s Annunciation, Raphael, Caravaggio, Titian. ⚠️ TIMED ENTRY REQUIRED — book 2-4 weeks in advance at uffizi.it. Sells out in summer. Allow 2-3 hours. €25 + €4 reservation fee. Closed Mondays.',
      lat: 43.7677,
      lng: 11.2553,
      arrivalDate: null,
      departureDate: null,
      photoUrl: null,
      status: 'researched' as const,
      researchStatus: 'researched' as const,
      orderIndex: 20,
    },
    {
      tripId: TRIP_ID,
      name: 'Florence Duomo Complex',
      description:
        'Cathedral of Santa Maria del Fiore + Brunelleschi\'s Dome + Giotto\'s Bell Tower + Baptistery + Crypt + Opera Museum. Cathedral entry is FREE (but expect 30-60 min queues). ⚠️ DOME CLIMB REQUIRES TIMED RESERVATION — Brunelleschi Pass (€30) includes all monuments + timed dome slot. Book 1-2 months ahead at duomo.firenze.it. 463 steps, no elevator. Pass valid 3 days.',
      lat: 43.7731,
      lng: 11.2560,
      arrivalDate: null,
      departureDate: null,
      photoUrl: null,
      status: 'researched' as const,
      researchStatus: 'researched' as const,
      orderIndex: 21,
    },
    {
      tripId: TRIP_ID,
      name: 'Ponte Vecchio',
      description:
        'Medieval stone bridge over the Arno, lined with jewelry shops since 1593. Free to walk across. Best photos from Ponte Santa Trinita at sunset. Connects to Oltrarno neighborhood.',
      lat: 43.7680,
      lng: 11.2531,
      arrivalDate: null,
      departureDate: null,
      photoUrl: null,
      status: 'researched' as const,
      researchStatus: 'researched' as const,
      orderIndex: 22,
    },
    {
      tripId: TRIP_ID,
      name: 'Piazzale Michelangelo',
      description:
        'Panoramic terrace overlooking all of Florence. Best at sunset — bring wine and snacks. Free. 20-min uphill walk from center or take bus 12/13. The iconic postcard view of the city.',
      lat: 43.7629,
      lng: 11.2650,
      arrivalDate: null,
      departureDate: null,
      photoUrl: null,
      status: 'researched' as const,
      researchStatus: 'researched' as const,
      orderIndex: 23,
    },
    {
      tripId: TRIP_ID,
      name: 'Mercato Centrale',
      description:
        'Florence\'s main food market. Ground floor: fresh produce, meats, cheese (mornings). Upper floor: gourmet food court open daily until midnight. Lampredotto (tripe sandwich), fresh pasta, Florentine steak. Budget €10-20/meal.',
      lat: 43.7764,
      lng: 11.2536,
      arrivalDate: null,
      departureDate: null,
      photoUrl: null,
      status: 'researched' as const,
      researchStatus: 'researched' as const,
      orderIndex: 24,
    },
    {
      tripId: TRIP_ID,
      name: 'Piazza della Signoria',
      description:
        'Florence\'s main square and open-air sculpture gallery. Palazzo Vecchio (city hall, climbable tower €12.50), replica of Michelangelo\'s David, Loggia dei Lanzi (free outdoor sculptures including Perseus). Heart of the city.',
      lat: 43.7694,
      lng: 11.2556,
      arrivalDate: null,
      departureDate: null,
      photoUrl: null,
      status: 'researched' as const,
      researchStatus: 'researched' as const,
      orderIndex: 25,
    },
    {
      tripId: TRIP_ID,
      name: 'Galleria dell\'Accademia',
      description:
        'Home of Michelangelo\'s original David (4.3m marble masterpiece). Also his unfinished "Prisoners" sculptures. ⚠️ TIMED ENTRY REQUIRED — book in advance at galleriaaccademiafirenze.it. €16 + reservation. Allow 1-1.5 hours. Closed Mondays.',
      lat: 43.7768,
      lng: 11.2588,
      arrivalDate: null,
      departureDate: null,
      photoUrl: null,
      status: 'researched' as const,
      researchStatus: 'researched' as const,
      orderIndex: 26,
    },
    {
      tripId: TRIP_ID,
      name: 'San Lorenzo & Medici Chapels',
      description:
        'Medici family church with Michelangelo-designed New Sacristy. Stunning tombs and architecture. Near Mercato Centrale. €9 entry, timed tickets available. Allow 1 hour.',
      lat: 43.7748,
      lng: 11.2536,
      arrivalDate: null,
      departureDate: null,
      photoUrl: null,
      status: 'researched' as const,
      researchStatus: 'researched' as const,
      orderIndex: 27,
    },
  ];

  const insertedDests = await db
    .insert(tripDestinations)
    .values(florenceDestinations)
    .returning();
  console.log(`✅ Added ${insertedDests.length} Florence destinations`);

  // ── Weekend itinerary (placeholder weekend in late June) ──
  // Florence is best as a Sat-Sun trip from Vicenza
  // Using June 27-28 as a sample weekend (can be adjusted)
  const florenceItinerary = [
    // ── Saturday: Art & Culture Day ──
    {
      tripId: TRIP_ID,
      date: '2026-06-27',
      title: '🚗 Drive Vicenza → Florence',
      description:
        'Depart early. Take A4 → A1 via Bologna. ~2.5 hrs, ~280 km. Tolls ~€20-25 each way. Parking: Garage Nazionale (€3/hr) or Parcheggio Beccaria (€2/hr, slightly further). Avoid ZTL (restricted traffic zone) in center!',
      startTime: '07:00',
      endTime: '09:30',
      location: 'Vicenza → Florence',
      category: 'transport' as const,
      orderIndex: 0,
    },
    {
      tripId: TRIP_ID,
      date: '2026-06-27',
      title: '☕ Breakfast at Ditta Artigianale',
      description:
        'Specialty coffee near the center. One of Florence\'s best third-wave coffee shops. Grab a cornetto and espresso before the museum rush.',
      startTime: '09:45',
      endTime: '10:15',
      location: 'Via dei Neri 32R, Florence',
      category: 'meal' as const,
      orderIndex: 1,
    },
    {
      tripId: TRIP_ID,
      date: '2026-06-27',
      title: '🎨 Uffizi Gallery (TIMED ENTRY)',
      description:
        '⚠️ PRE-BOOK at uffizi.it — book 2-4 weeks ahead for summer. Choose 10:00 slot. Highlights: Room 10-14 (Botticelli), Room 35 (da Vinci), Room 66 (Raphael), Room 83 (Titian), Room 90 (Caravaggio). Rooftop terrace café for Duomo views. Allow 2.5-3 hours. €25 + €4 booking fee.',
      startTime: '10:30',
      endTime: '13:00',
      location: 'Piazzale degli Uffizi, Florence',
      category: 'sightseeing' as const,
      orderIndex: 2,
    },
    {
      tripId: TRIP_ID,
      date: '2026-06-27',
      title: '🥩 Lunch: Trattoria Mario',
      description:
        'Iconic no-frills Florentine lunch spot since 1953. Communal tables, handwritten menu. Try: ribollita (bread soup), bistecca alla fiorentina, house wine. Cash only. Opens 12:00, arrive early — line forms fast. €15-25/person.',
      startTime: '13:15',
      endTime: '14:15',
      location: 'Via Rosina 2 (near San Lorenzo)',
      category: 'meal' as const,
      orderIndex: 3,
    },
    {
      tripId: TRIP_ID,
      date: '2026-06-27',
      title: '🏛️ Piazza della Signoria & Loggia dei Lanzi',
      description:
        'Free open-air sculpture gallery. See: Perseus by Cellini, Rape of the Sabine Women by Giambologna, David replica. Walk through the piazza, take in the Palazzo Vecchio facade.',
      startTime: '14:30',
      endTime: '15:15',
      location: 'Piazza della Signoria',
      category: 'sightseeing' as const,
      orderIndex: 4,
    },
    {
      tripId: TRIP_ID,
      date: '2026-06-27',
      title: '🌉 Walk Ponte Vecchio & Oltrarno',
      description:
        'Cross the iconic bridge, browse the jewelry shops. Wander into Oltrarno for artisan workshops and quieter streets. Stop at Gelateria La Carraia for gelato (€2.50).',
      startTime: '15:15',
      endTime: '16:30',
      location: 'Ponte Vecchio → Oltrarno',
      category: 'sightseeing' as const,
      orderIndex: 5,
    },
    {
      tripId: TRIP_ID,
      date: '2026-06-27',
      title: '🍷 Aperitivo at Le Volpi e l\'Uva',
      description:
        'Wine bar near Ponte Vecchio on the Oltrarno side. Excellent natural wines, crostini, cheese boards. Perfect late-afternoon spot. €10-15.',
      startTime: '16:30',
      endTime: '17:30',
      location: 'Piazza dei Rossi 1, Oltrarno',
      category: 'meal' as const,
      orderIndex: 6,
    },
    {
      tripId: TRIP_ID,
      date: '2026-06-27',
      title: '🌅 Sunset at Piazzale Michelangelo',
      description:
        'THE sunset spot. Panoramic view of Florence — Duomo, Ponte Vecchio, Arno, hills. Bring wine from a nearby enoteca. Sunset ~9pm in late June. Bus 12/13 or 20-min uphill walk.',
      startTime: '19:30',
      endTime: '21:00',
      location: 'Piazzale Michelangelo',
      category: 'sightseeing' as const,
      orderIndex: 7,
    },
    {
      tripId: TRIP_ID,
      date: '2026-06-27',
      title: '🍝 Dinner: Buca Mario',
      description:
        'Historic cellar restaurant since 1886. Classic Florentine fare — bistecca, pappa al pomodoro, pappardelle al cinghiale. Reservations recommended. €30-50/person.',
      startTime: '21:15',
      endTime: '22:30',
      location: 'Piazza degli Ottaviani 16R',
      category: 'meal' as const,
      orderIndex: 8,
    },

    // ── Sunday: Duomo & Departure Day ──
    {
      tripId: TRIP_ID,
      date: '2026-06-28',
      title: '🏛️ Brunelleschi\'s Dome Climb (TIMED ENTRY)',
      description:
        '⚠️ PRE-BOOK at duomo.firenze.it — Brunelleschi Pass (€30) required. Book 1-2 months ahead! 463 steps, no elevator. Choose 08:30 slot to beat heat and crowds. Stunning frescoes inside the dome (Last Judgment by Vasari) and rooftop panorama. Allow 1-1.5 hours for climb.',
      startTime: '08:30',
      endTime: '10:00',
      location: 'Piazza del Duomo, Florence',
      category: 'sightseeing' as const,
      orderIndex: 0,
    },
    {
      tripId: TRIP_ID,
      date: '2026-06-28',
      title: '🔔 Giotto\'s Bell Tower (included in Brunelleschi Pass)',
      description:
        'Climb 414 steps for another panoramic view — this time WITH the Dome in frame. No timed reservation needed (included in Pass). Slightly less crowded than the Dome. Allow 45 min.',
      startTime: '10:15',
      endTime: '11:00',
      location: 'Piazza del Duomo',
      category: 'sightseeing' as const,
      orderIndex: 1,
    },
    {
      tripId: TRIP_ID,
      date: '2026-06-28',
      title: '⛪ Baptistery of San Giovanni',
      description:
        'Oldest building in Florence (11th century). Famous gilded bronze "Gates of Paradise" doors by Ghiberti. Stunning ceiling mosaics. Included in Brunelleschi Pass. 15-20 min visit.',
      startTime: '11:00',
      endTime: '11:30',
      location: 'Piazza del Duomo',
      category: 'sightseeing' as const,
      orderIndex: 2,
    },
    {
      tripId: TRIP_ID,
      date: '2026-06-28',
      title: '🍕 Lunch at Mercato Centrale',
      description:
        'Upper floor food court — open daily. Try lampredotto (tripe sandwich, Florence\'s iconic street food), fresh pasta, Florentine schiacciata (flat bread). Great variety, €10-20/meal.',
      startTime: '11:45',
      endTime: '12:45',
      location: 'Piazza del Mercato Centrale',
      category: 'meal' as const,
      orderIndex: 3,
    },
    {
      tripId: TRIP_ID,
      date: '2026-06-28',
      title: '🗿 Galleria dell\'Accademia — Michelangelo\'s David (TIMED ENTRY)',
      description:
        '⚠️ PRE-BOOK at galleriaaccademiafirenze.it. The original 4.3m David. Also see the "Prisoners" — unfinished sculptures emerging from marble. €16 + booking fee. Allow 1-1.5 hours. Closed Mondays.',
      startTime: '13:00',
      endTime: '14:15',
      location: 'Via Ricasoli 58/60',
      category: 'sightseeing' as const,
      orderIndex: 4,
    },
    {
      tripId: TRIP_ID,
      date: '2026-06-28',
      title: '🛍️ San Lorenzo leather market',
      description:
        'Browse leather goods, souvenirs, scarves near the Medici Chapels. Haggling expected. Good quality leather jackets, bags, wallets. Be wary of tourist-trap pricing.',
      startTime: '14:30',
      endTime: '15:15',
      location: 'Piazza San Lorenzo',
      category: 'sightseeing' as const,
      orderIndex: 5,
    },
    {
      tripId: TRIP_ID,
      date: '2026-06-28',
      title: '🍦 Final gelato at Vivoli or Gelateria dei Neri',
      description:
        'Last Florence treat. Vivoli (since 1930, near Santa Croce) or Gelateria dei Neri (Via dei Neri). Try crema fiorentina or pistachio.',
      startTime: '15:15',
      endTime: '15:45',
      location: 'Via Isola delle Stinche 7R / Via dei Neri',
      category: 'meal' as const,
      orderIndex: 6,
    },
    {
      tripId: TRIP_ID,
      date: '2026-06-28',
      title: '🚗 Drive Florence → Vicenza',
      description:
        'Head back via A1 → A4. ~2.5 hrs. If time permits, stop in Bologna for dinner (1 hr mark). Otherwise, arrive home by ~18:30.',
      startTime: '16:00',
      endTime: '18:30',
      location: 'Florence → Vicenza',
      category: 'transport' as const,
      orderIndex: 7,
    },
  ];

  const insertedItems = await db
    .insert(itineraryItems)
    .values(florenceItinerary)
    .returning();
  console.log(`✅ Added ${insertedItems.length} Florence itinerary items`);

  // ── Budget estimates ──────────────────────────────────
  const florenceBudget = [
    {
      tripId: TRIP_ID,
      category: 'activities',
      description: 'Uffizi Gallery — timed entry ticket',
      estimatedCost: '29.00',
      date: '2026-06-27',
    },
    {
      tripId: TRIP_ID,
      category: 'activities',
      description: 'Brunelleschi Pass (Dome + Bell Tower + Baptistery + Museum)',
      estimatedCost: '30.00',
      date: '2026-06-28',
    },
    {
      tripId: TRIP_ID,
      category: 'activities',
      description: 'Galleria dell\'Accademia — timed entry ticket',
      estimatedCost: '20.00',
      date: '2026-06-28',
    },
    {
      tripId: TRIP_ID,
      category: 'transport',
      description: 'Florence highway tolls (round trip Vicenza↔Florence)',
      estimatedCost: '50.00',
      date: '2026-06-27',
    },
    {
      tripId: TRIP_ID,
      category: 'transport',
      description: 'Florence parking (2 days garage)',
      estimatedCost: '40.00',
      date: '2026-06-27',
    },
    {
      tripId: TRIP_ID,
      category: 'food',
      description: 'Florence meals — Saturday (breakfast, lunch, aperitivo, dinner)',
      estimatedCost: '70.00',
      date: '2026-06-27',
    },
    {
      tripId: TRIP_ID,
      category: 'food',
      description: 'Florence meals — Sunday (lunch, gelato, snacks)',
      estimatedCost: '35.00',
      date: '2026-06-28',
    },
  ];

  const insertedBudget = await db
    .insert(budgetItems)
    .values(florenceBudget)
    .returning();
  console.log(`✅ Added ${insertedBudget.length} Florence budget items`);

  console.log('\n📋 Florence Weekend Summary:');
  console.log('  Saturday (Jun 27): Uffizi Gallery → Piazza Signoria → Ponte Vecchio → Sunset at Piazzale Michelangelo');
  console.log('  Sunday (Jun 28): Dome Climb → Bell Tower → Baptistery → Accademia (David) → San Lorenzo Market');
  console.log('\n⚠️  BOOKING REMINDERS:');
  console.log('  1. Uffizi Gallery — book 2-4 weeks ahead at uffizi.it (€25 + €4 fee)');
  console.log('  2. Brunelleschi Dome — book 1-2 months ahead at duomo.firenze.it (€30 pass)');
  console.log('  3. Accademia Gallery — book 2+ weeks ahead at galleriaaccademiafirenze.it (€16 + fee)');
  console.log('  💰 Estimated total: ~€274 for the weekend');
  console.log('\n🏛️ Done! Florence weekend data seeded.');

  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
