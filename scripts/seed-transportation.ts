import { getDb } from '../src/db';
const db = getDb();
import { destinationTransportOptions, tripDestinations, trips } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function seedTransportation() {
  console.log('🚗 Seeding transportation options...');
  const allTrips = await db.select().from(trips);
  if (allTrips.length === 0) { console.log('No trips found.'); return; }
  const trip = allTrips.find(t => t.name.toLowerCase().includes("italy")) || allTrips[0];
  const dests = await db.select().from(tripDestinations).where(eq(tripDestinations.tripId, trip.id));
  if (dests.length === 0) { console.log('No destinations found.'); return; }
  await db.delete(destinationTransportOptions).where(eq(destinationTransportOptions.tripId, trip.id));
  const findDest = (name: string) => dests.find(d => d.name.toLowerCase().includes(name.toLowerCase()));

  const data: any[] = [
    { dest: 'Venice', opts: [
      { mode: 'driving', durationMinutes: 75, distanceKm: 75, estimatedCost: '15', routeName: 'A4/E70', tollCost: '6.50', parkingNotes: 'Tronchetto €25-35/day, Piazzale Roma €26/day', directionsUrl: 'https://www.google.com/maps/dir/Vicenza/Venice', pros: JSON.stringify(['Flexible schedule','Can stop at Padova']), cons: JSON.stringify(['Parking very expensive','No cars in Venice center']), recommended: false },
      { mode: 'train', durationMinutes: 45, distanceKm: 72, estimatedCost: '8', departureStation: 'Vicenza', arrivalStation: 'Venezia Santa Lucia', transfers: 0, trainProvider: 'trenitalia', bookingUrl: 'https://www.trenitalia.com', pros: JSON.stringify(['Cheapest option','Direct to city center','No parking hassle','Every 30 min']), cons: JSON.stringify(['Fixed schedule','Crowded weekends']), recommended: true },
      { mode: 'bus', durationMinutes: 120, distanceKm: 75, estimatedCost: '6', busProvider: 'FlixBus', busRoute: 'Vicenza → Venice Tronchetto', bookingUrl: 'https://www.flixbus.com', pros: JSON.stringify(['Cheapest','WiFi']), cons: JSON.stringify(['Slow','Infrequent','Drops at Tronchetto']), recommended: false },
    ]},
    { dest: 'Florence', opts: [
      { mode: 'driving', durationMinutes: 195, distanceKm: 250, estimatedCost: '45', routeName: 'A13 → A1', tollCost: '22', parkingNotes: 'ZTL restricted. Garage Porta al Prato €20/day', directionsUrl: 'https://www.google.com/maps/dir/Vicenza/Florence', pros: JSON.stringify(['Flexible schedule','Can stop at Bologna']), cons: JSON.stringify(['Long drive','Expensive tolls','ZTL zones','Parking expensive']), recommended: false },
      { mode: 'train', durationMinutes: 120, distanceKm: 230, estimatedCost: '25', departureStation: 'Vicenza', arrivalStation: 'Firenze S.M.N.', transfers: 1, trainProvider: 'both', bookingUrl: 'https://www.trenitalia.com', pros: JSON.stringify(['Fast Frecciarossa','Central station','No ZTL worry','Scenic route']), cons: JSON.stringify(['Transfer at Bologna','Peak €40+']), recommended: true, notes: 'Regionale to Bologna then Frecciarossa. Book early.' },
    ]},
    { dest: 'Verona', opts: [
      { mode: 'driving', durationMinutes: 40, distanceKm: 52, estimatedCost: '10', routeName: 'A4/E70', tollCost: '4.20', parkingNotes: 'Arsenale €2/hr. Borgo Trento street parking.', directionsUrl: 'https://www.google.com/maps/dir/Vicenza/Verona', pros: JSON.stringify(['Quick drive','Good for evening events']), cons: JSON.stringify(['Parking tricky near Arena','ZTL']), recommended: true },
      { mode: 'train', durationMinutes: 30, distanceKm: 52, estimatedCost: '5', departureStation: 'Vicenza', arrivalStation: 'Verona Porta Nuova', transfers: 0, trainProvider: 'trenitalia', bookingUrl: 'https://www.trenitalia.com', pros: JSON.stringify(['Very cheap','Frequent','Walkable to center']), cons: JSON.stringify(['Last train ~23:00']), recommended: false, notes: 'Regional every 20-30 min. €4.55.' },
    ]},
    { dest: 'Dolomites', opts: [
      { mode: 'driving', durationMinutes: 150, distanceKm: 160, estimatedCost: '30', routeName: 'A31 → SS47 → SS50', tollCost: '8', parkingNotes: 'Free at most trailheads. Tre Cime toll road €30.', directionsUrl: 'https://www.google.com/maps/dir/Vicenza/Cortina+d%27Ampezzo', pros: JSON.stringify(['Only viable for mountains','Flexible multi-stop','Scenic drive','Trailhead access']), cons: JSON.stringify(['Mountain roads challenging','Snow chains in winter','Long for day trip']), recommended: true, notes: 'Car essential for Dolomites.' },
      { mode: 'bus', durationMinutes: 240, distanceKm: 170, estimatedCost: '15', busProvider: 'Dolomiti Bus', busRoute: 'Vicenza → Belluno → Cortina', bookingUrl: 'https://dolomitibus.it', pros: JSON.stringify(['No mountain driving stress']), cons: JSON.stringify(['Very slow','Main towns only','Infrequent','No trailhead access']), recommended: false },
    ]},
    { dest: 'Bologna', opts: [
      { mode: 'driving', durationMinutes: 105, distanceKm: 130, estimatedCost: '20', routeName: 'A4 → A13', tollCost: '10.50', parkingNotes: 'Staveco near center €12/day. ZTL in old town.', directionsUrl: 'https://www.google.com/maps/dir/Vicenza/Bologna', pros: JSON.stringify(['Straightforward route']), cons: JSON.stringify(['ZTL restrictions','Tolls add up']), recommended: false },
      { mode: 'train', durationMinutes: 60, distanceKm: 115, estimatedCost: '12', departureStation: 'Vicenza', arrivalStation: 'Bologna Centrale', transfers: 0, trainProvider: 'both', bookingUrl: 'https://www.trenitalia.com', pros: JSON.stringify(['Fast and direct','Frequent Frecciarossa','Station in center','Food capital']), cons: JSON.stringify(['Peak prices higher']), recommended: true, notes: 'Frecciarossa 1hr. Regionale 1.5hr at €10.' },
    ]},
    { dest: 'Garda', opts: [
      { mode: 'driving', durationMinutes: 70, distanceKm: 85, estimatedCost: '15', routeName: 'A4 → Peschiera', tollCost: '6', parkingNotes: 'Sirmione €5/hr. Arrive early summer weekends.', directionsUrl: 'https://www.google.com/maps/dir/Vicenza/Sirmione', pros: JSON.stringify(['Flexible lakeside exploration','Multiple towns','Good for families']), cons: JSON.stringify(['Summer traffic heavy','Sirmione parking fills fast']), recommended: true },
      { mode: 'train', durationMinutes: 55, distanceKm: 80, estimatedCost: '7', departureStation: 'Vicenza', arrivalStation: 'Peschiera del Garda', transfers: 0, trainProvider: 'trenitalia', bookingUrl: 'https://www.trenitalia.com', pros: JSON.stringify(['Cheap','Direct','No parking stress']), cons: JSON.stringify(['Limited to station towns','Need bus/ferry for villages']), recommended: false },
    ]},
    { dest: 'Padova', opts: [
      { mode: 'driving', durationMinutes: 30, distanceKm: 32, estimatedCost: '7', routeName: 'A4/E70', tollCost: '3', parkingNotes: 'Prato della Valle area. Tram park-and-ride.', directionsUrl: 'https://www.google.com/maps/dir/Vicenza/Padova', pros: JSON.stringify(['Very close','Quick highway']), cons: JSON.stringify(['ZTL in center','Limited parking near Scrovegni']), recommended: false },
      { mode: 'train', durationMinutes: 20, distanceKm: 32, estimatedCost: '4', departureStation: 'Vicenza', arrivalStation: 'Padova', transfers: 0, trainProvider: 'trenitalia', bookingUrl: 'https://www.trenitalia.com', pros: JSON.stringify(['Super fast','Very cheap','Every 15 min','Station near old town']), cons: JSON.stringify(['None really!']), recommended: true },
    ]},
  ];

  let count = 0;
  for (const { dest, opts } of data) {
    const d = findDest(dest);
    if (!d) { console.log(`  ⚠️ "${dest}" not found`); continue; }
    for (const opt of opts) {
      await db.insert(destinationTransportOptions).values({ tripId: trip.id, destinationId: d.id, ...opt });
      count++;
    }
    console.log(`  ✅ ${dest}: ${opts.length} options`);
  }
  console.log(`\n🎉 Seeded ${count} transportation options!`);
  process.exit(0);
}
seedTransportation().catch(console.error);
