/**
 * Seed script: Rome Weekend Trip Research
 *
 * Research findings:
 * - Rome is ~4-5 hrs drive from Vicenza or ~1hr flight (Vicenza → Rome Fiumicino)
 * - Train: Vicenza → Roma Termini via Frecciarossa/Frecciargento, ~3.5-4 hrs, €40-80/person
 * - Colosseum: MUST book in advance — tickets sell out weeks ahead
 *   - Official site: https://www.coopculture.it (Parco Archeologico del Colosseo)
 *   - Combined ticket: Colosseum + Roman Forum + Palatine Hill (~€16-22, full experience €22-24)
 *   - Arena floor access: limited, ~€24 supplement
 *   - Underground tour: ~€9 supplement (highly recommended, book early)
 *   - Tickets open ~30-60 days in advance, sell out fast
 * - Vatican Museums + Sistine Chapel: MUST book in advance
 *   - Official: https://tickets.museivaticani.va
 *   - Standard entry: €17 + €4 reservation fee = €21/person
 *   - Guided tours: €33-39/person
 *   - Open Mon-Sat (closed Sundays except last Sunday of month — free but massive queues)
 *   - Best time: early morning (7:30 AM entry) or late afternoon (after 14:00)
 *   - Last Sunday of month: free entry, opens 9:00-12:30, insanely crowded
 * - St. Peter's Basilica: free entry, but expect 30-60 min queue
 *   - Dome climb: €8 (stairs) or €10 (elevator + stairs), opens 07:30
 *   - Dress code: covered shoulders and knees required
 * - Best weekend plan: Sat = Vatican side, Sun = Ancient Rome side
 *
 * Booking links:
 *   Colosseum: https://www.coopculture.it/en/colosseo-e-shop.cfm
 *   Vatican: https://tickets.museivaticani.va/home
 *   Trains: https://www.trenitalia.com
 *
 * Usage: bun scripts/seed-rome-weekend.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../src/db/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seed() {
  console.log('🏛️ Seeding Rome Weekend Trip research data...\n');

  // ── Find existing Italy 2026 trip ────────────────────
  const [trip] = await db
    .select()
    .from(schema.trips)
    .where(eq(schema.trips.name, 'Italy 2026'))
    .limit(1);

  if (!trip) {
    console.error('❌ Italy 2026 trip not found. Run seed-italy-trip.ts first.');
    process.exit(1);
  }

  const TRIP_ID = trip.id;

  // ── Trip Destination: Rome ───────────────────────────
  const [romeDest] = await db.insert(schema.tripDestinations).values({
    tripId: TRIP_ID,
    name: 'Rome',
    description: 'Weekend trip to the Eternal City. Colosseum, Vatican, ancient ruins, incredible food. 4-5 hr drive or 3.5 hr high-speed train from Vicenza.',
    lat: 41.9028,
    lng: 12.4964,
    arrivalDate: 'TBD',
    departureDate: 'TBD',
    status: 'researched',
    researchStatus: 'researched',
    orderIndex: 20,
  }).returning();

  console.log(`  ✅ Rome destination added (id: ${romeDest.id})`);

  // ── Day 1 (Saturday): Vatican & Trastevere ───────────
  const day1Itinerary = [
    {
      tripId: TRIP_ID,
      title: '🚄 High-Speed Train: Vicenza → Roma Termini',
      description: `Frecciarossa or Frecciargento from Vicenza to Roma Termini. ~3.5 hrs direct or 4 hrs with Bologna stop.

BOOKING: https://www.trenitalia.com — book 2-4 weeks ahead for best prices.
- Standard: €40-60/person
- Business: €60-90/person
- Executive: €90-120/person

Alternative: drive (~4.5-5 hrs via A1/E35, tolls ~€30-40 each way, parking in Rome is a nightmare — train strongly recommended).

Alternative: fly Verona/Venice → Rome Fiumicino (~1 hr, €30-80 on Ryanair/ITA Airways if booked early).`,
      date: 'TBD-SAT',
      startTime: '06:30',
      endTime: '10:00',
      location: 'Vicenza → Roma Termini',
      category: 'transport',
      orderIndex: 0,
    },
    {
      tripId: TRIP_ID,
      title: '🏨 Check-in & Drop Bags',
      description: `Drop bags at accommodation near Vatican/Centro Storico. If early check-in not available, most hotels hold luggage.

Recommended areas to stay:
- Prati (near Vatican, quieter, good restaurants)
- Trastevere (charming, great nightlife & food)
- Centro Storico (central but pricier)
- Monti (hip neighborhood near Colosseum)`,
      date: 'TBD-SAT',
      startTime: '10:00',
      endTime: '10:30',
      location: 'Rome accommodation',
      category: 'activity',
      orderIndex: 1,
    },
    {
      tripId: TRIP_ID,
      title: '🎨 Vatican Museums & Sistine Chapel',
      description: `⚠️ MUST BOOK IN ADVANCE — sells out weeks ahead!

Book at: https://tickets.museivaticani.va/home
- Standard: €17 + €4 reservation = €21/person
- Guided tour: €33-39/person (worth it for context)
- Audio guide: €7/person

TIPS:
• Book the earliest time slot (7:30 or 8:00 AM entry)
• Allow 3-4 hours minimum
• Route: Pinacoteca → Egyptian Museum → Gallery of Maps → Raphael Rooms → Sistine Chapel
• Sistine Chapel: no photos allowed (enforced), no talking
• The "secret exit" from Sistine Chapel leads directly into St. Peter's Basilica — use it!
• Dress code: covered shoulders and knees (both men & women)

Closed Sundays (except last Sunday of month — free but insane queues).`,
      date: 'TBD-SAT',
      startTime: '10:30',
      endTime: '14:00',
      location: 'Vatican Museums, Viale Vaticano, 00165 Roma',
      category: 'sightseeing',
      orderIndex: 2,
    },
    {
      tripId: TRIP_ID,
      title: '⛪ St. Peter\'s Basilica & Dome',
      description: `Free entry to the basilica. Use the Sistine Chapel exit to skip the external queue.

DOME CLIMB (Cupola):
- Stairs only: €8 (551 steps — not for the claustrophobic!)
- Elevator + stairs: €10 (elevator to terrace, then 320 steps to top)
- Opens 07:30, last entry ~17:00
- The view from the top is one of the best in Rome

Inside: Michelangelo's Pietà (first chapel on right), Bernini's baldachin, St. Peter's throne.
Allow 1-1.5 hours for basilica + dome.

DRESS CODE: Shoulders and knees covered. No exceptions.`,
      date: 'TBD-SAT',
      startTime: '14:00',
      endTime: '15:30',
      location: 'St. Peter\'s Basilica, Piazza San Pietro, 00120 Vatican City',
      category: 'sightseeing',
      orderIndex: 3,
    },
    {
      tripId: TRIP_ID,
      title: '🍕 Late Lunch in Prati',
      description: `Prati neighborhood (just outside Vatican walls) has excellent non-touristy restaurants.

Recommendations:
- Bonci Pizzarium (Via della Meloria 43) — Rome's best pizza al taglio, legendary. Expect a queue.
- Sciascia Caffè (Via Fabio Massimo 80) — famous for chocolate-rimmed coffee
- Il Sorpasso (Via Properzio 31-33) — trendy bistro, great aperitivo
- Fa-Bio (Via Germanico 43) — organic wraps & smoothies if feeling healthy`,
      date: 'TBD-SAT',
      startTime: '15:30',
      endTime: '16:30',
      location: 'Prati, Rome',
      category: 'meal',
      orderIndex: 4,
    },
    {
      tripId: TRIP_ID,
      title: '🏰 Castel Sant\'Angelo (exterior) & Ponte Sant\'Angelo',
      description: 'Walk along the Tiber to Castel Sant\'Angelo. Beautiful from outside, especially at golden hour. Cross Ponte Sant\'Angelo (Bernini\'s angel statues). Optional: interior visit €15, takes 1-1.5 hrs.',
      date: 'TBD-SAT',
      startTime: '16:30',
      endTime: '17:15',
      location: 'Castel Sant\'Angelo, Lungotevere Castello 50, Rome',
      category: 'sightseeing',
      orderIndex: 5,
    },
    {
      tripId: TRIP_ID,
      title: '🚶 Walk to Piazza Navona & Pantheon',
      description: `Cross the river into the Centro Storico.

PIAZZA NAVONA: Bernini's Fountain of the Four Rivers, street artists, gorgeous Baroque architecture. Avoid overpriced cafés on the piazza itself.

PANTHEON (5 min walk): Free entry (reservation required since 2023 — €5 booking fee). Best-preserved ancient Roman building. The oculus (open hole in the dome) is mesmerizing. Book at: https://www.pantheonroma.com`,
      date: 'TBD-SAT',
      startTime: '17:15',
      endTime: '18:30',
      location: 'Piazza Navona → Pantheon, Rome',
      category: 'sightseeing',
      orderIndex: 6,
    },
    {
      tripId: TRIP_ID,
      title: '🍝 Dinner in Trastevere',
      description: `Cross the Tiber to Trastevere — Rome's most charming neighborhood for evening dining.

Top picks:
- Da Enzo al 29 (Via dei Vascellari 29) — legendary Roman trattoria, LONG queue, no reservations, go at 19:00 sharp. Cacio e pepe, carbonara, amatriciana all exceptional.
- Tonnarello (Via della Paglia 1-2-3) — large, great traditional Roman, takes reservations
- Grazia & Graziella (Largo M.D. Fumasoni Biondi 5) — beautiful piazza setting
- Nannarella (Piazza di S. Calisto 7a) — tiramisù to die for

Must-order Roman pastas: cacio e pepe, carbonara, amatriciana, gricia (the "Roman quartet").
Budget: €25-40/person.`,
      date: 'TBD-SAT',
      startTime: '19:30',
      endTime: '21:00',
      location: 'Trastevere, Rome',
      category: 'meal',
      orderIndex: 7,
    },
    {
      tripId: TRIP_ID,
      title: '🌙 Evening Passeggiata',
      description: 'Night stroll through illuminated Rome. Trastevere → Isola Tiberina → back through Centro Storico. Rome at night is magical — fountains lit up, cobblestone streets, gelato in hand. Stop at Piazza della Rotonda to see the Pantheon lit up.',
      date: 'TBD-SAT',
      startTime: '21:00',
      endTime: '22:30',
      location: 'Trastevere → Centro Storico, Rome',
      category: 'activity',
      orderIndex: 8,
    },
  ];

  // ── Day 2 (Sunday): Ancient Rome & Departure ────────
  const day2Itinerary = [
    {
      tripId: TRIP_ID,
      title: '☕ Breakfast — Roman Style',
      description: `Italian breakfast = cornetto (croissant) + cappuccino at a bar. Stand at the counter like a local (sitting costs more at some places).

Recommendations:
- Roscioli Caffè (Piazza Benedetto Cairoli 16) — pastries to die for
- Antico Caffè Greco (Via dei Condotti 86) — oldest café in Rome (since 1760), touristy but iconic
- Bar del Fico (Piazza del Fico 26) — hip, great people-watching`,
      date: 'TBD-SUN',
      startTime: '07:30',
      endTime: '08:15',
      location: 'Rome Centro',
      category: 'meal',
      orderIndex: 10,
    },
    {
      tripId: TRIP_ID,
      title: '🏟️ Colosseum',
      description: `⚠️ MUST BOOK IN ADVANCE — tickets sell out fast!

Book at: https://www.coopculture.it/en/colosseo-e-shop.cfm
Tickets released ~30-60 days in advance. Set a calendar reminder!

TICKET OPTIONS:
- Standard (Colosseum + Forum + Palatine): €16-18/person
- Full Experience (+ Arena floor OR Underground): €22-24/person
- Full Experience SUPER (Arena + Underground + special areas): €24/person
- Underground tour: highly recommended — see the hypogeum where gladiators & animals waited

TIPS:
• Book the 8:30 or 9:00 AM slot (least crowded)
• Enter from the east side (Via dei Fori Imperiali entrance is less crowded)
• Allow 1.5-2 hours inside
• Audio guide: €5.50 (or download Rick Steves free audio tour)
• Combined ticket valid for 2 consecutive days (Colosseum on day 1, Forum on day 2 or vice versa)
• No large bags, no glass bottles`,
      date: 'TBD-SUN',
      startTime: '08:30',
      endTime: '10:30',
      location: 'Colosseum, Piazza del Colosseo 1, 00184 Roma',
      category: 'sightseeing',
      orderIndex: 11,
    },
    {
      tripId: TRIP_ID,
      title: '🏛️ Roman Forum & Palatine Hill',
      description: `Included with Colosseum ticket. Enter directly from Colosseum area.

ROMAN FORUM: Walk the Via Sacra (Sacred Way), see the Arch of Titus, Temple of Saturn, Senate House (Curia Julia). This was the heart of ancient Roman public life.

PALATINE HILL: Overlooking the Forum — legendary founding place of Rome. Emperor's palaces, gardens, stunning views over the Circus Maximus.

Allow 1.5-2 hours for both. Wear comfortable shoes — lots of uneven ground.
Bring water — little shade in summer.`,
      date: 'TBD-SUN',
      startTime: '10:30',
      endTime: '12:30',
      location: 'Roman Forum & Palatine Hill, Via della Salara Vecchia 5/6, Roma',
      category: 'sightseeing',
      orderIndex: 12,
    },
    {
      tripId: TRIP_ID,
      title: '🍝 Lunch near Colosseum',
      description: `Avoid tourist traps directly facing the Colosseum. Walk 5-10 min to Monti neighborhood.

Recommendations:
- Ai Tre Scalini (Via Panisperna 251) — great wine bar & traditional Roman
- La Taverna dei Fori Imperiali (Via della Madonna dei Monti 9) — family-run, excellent pastas
- Fatamorgana Monti (Piazza degli Zingari 5) — best artisanal gelato in Rome (after lunch!)

Budget: €15-25/person for lunch.`,
      date: 'TBD-SUN',
      startTime: '12:30',
      endTime: '13:30',
      location: 'Monti neighborhood, Rome',
      category: 'meal',
      orderIndex: 13,
    },
    {
      tripId: TRIP_ID,
      title: '⛲ Trevi Fountain & Spanish Steps',
      description: `Quick hits before departing:

TREVI FOUNTAIN: Toss a coin (right hand over left shoulder) to ensure you'll return to Rome. Insanely crowded during day — if you went at night yesterday, even better. Recently restored, stunning.

SPANISH STEPS (10 min walk): Iconic staircase. Can't sit on the steps anymore (€250 fine!). Nice photo op, luxury shopping on Via dei Condotti below.

Both free, allow 30-45 min total.`,
      date: 'TBD-SUN',
      startTime: '13:30',
      endTime: '14:30',
      location: 'Trevi Fountain → Spanish Steps, Rome',
      category: 'sightseeing',
      orderIndex: 14,
    },
    {
      tripId: TRIP_ID,
      title: '🚄 Train: Roma Termini → Vicenza',
      description: `Afternoon Frecciarossa back to Vicenza. Book return in advance for best price.

Depart ~15:00-16:00 from Roma Termini, arrive Vicenza ~19:00-20:00.
Metro Line A or B to Termini from most central locations.

Allow 30 min to get to Termini + find platform.`,
      date: 'TBD-SUN',
      startTime: '15:00',
      endTime: '19:00',
      location: 'Roma Termini → Vicenza',
      category: 'transport',
      orderIndex: 15,
    },
  ];

  await db.insert(schema.itineraryItems).values(day1Itinerary);
  console.log(`  ✅ ${day1Itinerary.length} Day 1 itinerary items (Vatican & Trastevere)`);

  await db.insert(schema.itineraryItems).values(day2Itinerary);
  console.log(`  ✅ ${day2Itinerary.length} Day 2 itinerary items (Ancient Rome & departure)`);

  // ── Accommodation Research ───────────────────────────
  const accommodations = [
    {
      tripId: TRIP_ID,
      destinationId: romeDest.id,
      name: 'Hotel Bramante',
      type: 'hotel',
      status: 'researched',
      address: 'Vicolo delle Palline 24, 00193 Roma',
      checkIn: 'TBD-SAT',
      checkOut: 'TBD-SUN',
      costPerNight: '120.00',
      totalCost: '120.00',
      currency: 'EUR',
      bookingUrl: 'https://www.hotelbramante.com',
      rating: 4.3,
      notes: 'Charming boutique hotel in a 16th-century building, steps from Vatican. Quiet location on a cobblestone lane. Some rooms have original frescoes.',
    },
    {
      tripId: TRIP_ID,
      destinationId: romeDest.id,
      name: 'Hotel Santa Maria',
      type: 'hotel',
      status: 'researched',
      address: 'Vicolo del Piede 2, 00153 Roma (Trastevere)',
      checkIn: 'TBD-SAT',
      checkOut: 'TBD-SUN',
      costPerNight: '150.00',
      totalCost: '150.00',
      currency: 'EUR',
      bookingUrl: 'https://www.htlsantamaria.com',
      rating: 4.5,
      notes: 'Beautiful courtyard hotel in the heart of Trastevere. Former 16th-century cloister. Orange tree garden. Perfect for evening strolls.',
    },
    {
      tripId: TRIP_ID,
      destinationId: romeDest.id,
      name: 'The RomeHello Hostel',
      type: 'hostel',
      status: 'researched',
      address: 'Via Torino 45, 00184 Roma',
      checkIn: 'TBD-SAT',
      checkOut: 'TBD-SUN',
      costPerNight: '40.00',
      totalCost: '40.00',
      currency: 'EUR',
      bookingUrl: 'https://www.the-romehello.com',
      rating: 4.4,
      notes: 'Budget option near Termini. Private rooms available (~€80-100). Rooftop terrace. Walking distance to Colosseum. Good for budget-conscious trip.',
    },
  ];

  await db.insert(schema.accommodations).values(accommodations);
  console.log(`  ✅ ${accommodations.length} accommodation options researched`);

  // ── Budget Estimates ─────────────────────────────────
  const budgetItems = [
    {
      tripId: TRIP_ID,
      category: 'transport',
      description: 'Frecciarossa train Vicenza → Roma Termini (roundtrip × 2 people)',
      estimatedCost: '200.00',
      paid: false,
      date: 'TBD',
    },
    {
      tripId: TRIP_ID,
      category: 'activities',
      description: 'Vatican Museums + Sistine Chapel tickets × 2 (€21/person)',
      estimatedCost: '42.00',
      paid: false,
      date: 'TBD-SAT',
    },
    {
      tripId: TRIP_ID,
      category: 'activities',
      description: 'St. Peter\'s Basilica dome climb × 2 (€10/person elevator option)',
      estimatedCost: '20.00',
      paid: false,
      date: 'TBD-SAT',
    },
    {
      tripId: TRIP_ID,
      category: 'activities',
      description: 'Colosseum Full Experience tickets × 2 (€24/person incl. underground)',
      estimatedCost: '48.00',
      paid: false,
      date: 'TBD-SUN',
    },
    {
      tripId: TRIP_ID,
      category: 'activities',
      description: 'Pantheon reservation × 2 (€5/person)',
      estimatedCost: '10.00',
      paid: false,
      date: 'TBD-SAT',
    },
    {
      tripId: TRIP_ID,
      category: 'accommodation',
      description: 'Rome hotel — 1 night (mid-range, Trastevere/Prati area)',
      estimatedCost: '150.00',
      paid: false,
      date: 'TBD-SAT',
    },
    {
      tripId: TRIP_ID,
      category: 'food',
      description: 'Rome food budget — 2 days (meals + gelato + coffee)',
      estimatedCost: '150.00',
      paid: false,
      date: 'TBD',
    },
    {
      tripId: TRIP_ID,
      category: 'transport',
      description: 'Rome metro/bus day passes × 2 days (€7/day × 2 people)',
      estimatedCost: '28.00',
      paid: false,
      date: 'TBD',
    },
  ];

  await db.insert(schema.budgetItems).values(budgetItems);
  console.log(`  ✅ ${budgetItems.length} budget items added`);

  // ── Summary ──────────────────────────────────────────
  const totalEstimated = budgetItems.reduce((sum, b) => sum + parseFloat(b.estimatedCost), 0);

  console.log('\n🏛️ Rome Weekend Trip seed complete!');
  console.log('\n📋 Research Summary:');
  console.log('  Destination: Rome, Italy (weekend trip from Vicenza)');
  console.log('  Transport: Frecciarossa high-speed train (~3.5 hrs, €40-80/person)');
  console.log('  Day 1 (Sat): Vatican Museums → Sistine Chapel → St. Peter\'s → Pantheon → Trastevere dinner');
  console.log('  Day 2 (Sun): Colosseum → Roman Forum → Palatine Hill → Trevi Fountain → Spanish Steps');
  console.log(`  Estimated total: €${totalEstimated.toFixed(2)} for 2 people`);
  console.log('\n⚠️  ADVANCE BOOKING REQUIRED:');
  console.log('  1. Colosseum: https://www.coopculture.it — opens 30-60 days ahead');
  console.log('  2. Vatican Museums: https://tickets.museivaticani.va — book ASAP');
  console.log('  3. Pantheon: https://www.pantheonroma.com — €5 reservation');
  console.log('  4. Train tickets: https://www.trenitalia.com — cheaper when booked early');

  await client.end();
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
