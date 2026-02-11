/**
 * Seed script: Arena di Verona Opera — Aida on July 10, 2026
 *
 * Research findings:
 * - Arena di Verona Opera Festival 2026 runs June 12 – September 12
 * - Aida (Stefano Poda adaptation) plays: June 19, 25, July 2, 10, 19, 24
 * - Aida (Franco Zeffirelli adaptation) plays: July 30, Aug 9, 15, 23, 30, Sep 4, 10
 * - July 10 = Aida (Poda) — perfect finale for the trip (last night!)
 * - Also available July 10 week: La Traviata (Jul 9), La Bohème (Jul 11)
 *
 * Ticket tiers (from arena.it):
 *   - Gradinata (stone steps, unnumbered): ~€28-35
 *   - Gradinata Numerata (numbered stone steps): ~€45-65
 *   - Poltronissima (premium stalls w/ backrest): ~€150-220
 *   - Platea (stalls): ~€90-130
 *   - Gold (front-center stalls): ~€200-280
 *
 * Booking: https://www.arena.it/en/arena-verona-opera-festival/aida/
 *
 * Usage: bun scripts/seed-verona-opera.ts
 */
import { getDb } from '../src/db';
const db = getDb();
import { itineraryItems, budgetItems } from '../src/db/schema';

const TRIP_ID = 'LMp0E_5U2QFsNL-MoGDHh'; // Italy 2026

async function seed() {
  console.log('🎭 Seeding Verona Opera — Aida (July 10 finale)...');

  // ── Itinerary: Opera Night ───────────────────────────
  const operaItinerary = [
    {
      tripId: TRIP_ID,
      title: '🚗 Drive Vicenza → Verona',
      description: 'Head to Verona early to explore the city before the show. ~45 min drive via A4/E70. Parking: Saba Arena (Via M. Bentegodi, 8) or Arsenale (Piazza Arsenale, 8) — book in advance.',
      date: '2026-07-10',
      startTime: '15:00',
      endTime: '16:00',
      location: 'Vicenza → Verona',
      category: 'transport',
      orderIndex: 1,
    },
    {
      tripId: TRIP_ID,
      title: '🍝 Pre-Opera Dinner in Verona',
      description: 'Dinner near Piazza Brà before the show. Recommendations: Ristorante Liston (right on the piazza), Osteria del Bugiardo (local wines + cicchetti), or Trattoria al Pompiere (classic Veronese). Eat early — gates open at 19:15.',
      date: '2026-07-10',
      startTime: '17:00',
      endTime: '18:30',
      location: 'Piazza Brà, Verona',
      category: 'meal',
      orderIndex: 2,
    },
    {
      tripId: TRIP_ID,
      title: '🎫 Collect Tickets — Arena Gate 7',
      description: 'If booked via reseller: exchange voucher at Gate 7 (desk of Montebaldo) between 17:30-19:30. If direct from arena.it, e-tickets should work at any gate. Arrive at least 1 hour before curtain.',
      date: '2026-07-10',
      startTime: '19:00',
      endTime: '19:30',
      location: 'Arena di Verona, Gate 7',
      category: 'activity',
      orderIndex: 3,
    },
    {
      tripId: TRIP_ID,
      title: '🎭 AIDA — Arena di Verona (Stefano Poda)',
      description: `Giuseppe Verdi's Aida at the Arena di Verona — the trip finale!

Stefano Poda's visionary new production. Set in the world's best-preserved Roman amphitheater (1st century AD, capacity ~15,000).

Performance starts at 21:15. Runtime ~2.5 hours with intermission.

DRESS CODE: Long trousers + shirt/polo minimum for stall seats. No tank tops, shorts, or beach sandals.

TIPS:
• Bring/rent a cushion (stone steps are not cushioned)
• No food/drink allowed inside (no bottles >0.5L)
• Traditional: audience lights candles during Act 2 Triumphal March
• Subtitles in English on screens
• Sung in Italian

Language: Italian with English subtitles
Composer: Giuseppe Verdi
Libretto: Antonio Ghislanzoni`,
      date: '2026-07-10',
      startTime: '21:15',
      endTime: '23:45',
      location: 'Arena di Verona, Piazza Brà 1, 37121 Verona VR',
      category: 'activity',
      orderIndex: 4,
    },
    {
      tripId: TRIP_ID,
      title: '🌙 Post-Opera Passeggiata',
      description: 'Night walk through illuminated Verona after the show. The city is magical at midnight — stroll past Juliet\'s balcony (Via Cappello 23), through Piazza delle Erbe, along the Adige river. Last night in Italy vibes.',
      date: '2026-07-10',
      startTime: '23:45',
      endTime: '00:30',
      location: 'Verona Centro Storico',
      category: 'activity',
      orderIndex: 5,
    },
  ];

  await db.insert(itineraryItems).values(operaItinerary);
  console.log(`  ✅ ${operaItinerary.length} itinerary items added for opera night`);

  // ── Budget: Opera Tickets ────────────────────────────
  const operaBudget = [
    {
      tripId: TRIP_ID,
      category: 'activities',
      description: 'Arena di Verona — Aida tickets (Jul 10) × 2 — Gradinata Numerata (numbered stone steps, Sector 6)',
      estimatedCost: '130.00', // ~€65 × 2
      actualCost: null,
      paid: false,
      date: '2026-07-10',
    },
    {
      tripId: TRIP_ID,
      category: 'activities',
      description: 'Arena di Verona — seat cushion rental × 2',
      estimatedCost: '10.00', // ~€5 each
      actualCost: null,
      paid: false,
      date: '2026-07-10',
    },
    {
      tripId: TRIP_ID,
      category: 'food',
      description: 'Pre-opera dinner in Verona (Piazza Brà area)',
      estimatedCost: '60.00',
      actualCost: null,
      paid: false,
      date: '2026-07-10',
    },
    {
      tripId: TRIP_ID,
      category: 'transport',
      description: 'Parking — Saba Arena car park, Verona (opera night)',
      estimatedCost: '15.00',
      actualCost: null,
      paid: false,
      date: '2026-07-10',
    },
  ];

  await db.insert(budgetItems).values(operaBudget);
  console.log(`  ✅ ${operaBudget.length} budget items added`);

  console.log('\n🎭 Verona Opera seed complete!');
  console.log('\n📋 Research Summary:');
  console.log('  Show: Aida (Stefano Poda production)');
  console.log('  Date: Friday, July 10, 2026 at 21:15');
  console.log('  Venue: Arena di Verona (1st-century Roman amphitheater)');
  console.log('  Book at: https://www.arena.it/en/arena-verona-opera-festival/aida/');
  console.log('  Alt booking: https://ticketsarenaverona.com/opera-festival/');
  console.log('  Recommended: Gradinata Numerata (~€65/person) or Platea (~€110/person)');
  console.log('  ⚠️  Book ASAP — July 10 is the last Poda-Aida of the season!');

  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
