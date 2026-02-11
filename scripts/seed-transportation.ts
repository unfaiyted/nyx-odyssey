import { getDb } from '../src/db';
const db = getDb();
import { destinationTransportOptions, tripDestinations, trips } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function seedTransportation() {
  console.log('🚗 Seeding transportation options...');

  // Get the first trip
  const allTrips = await db.select().from(trips);
  if (allTrips.length === 0) {
    console.log('No trips found. Run db:seed first.');
    return;
  }
  const trip = allTrips[0];

  // Get destinations
  const dests = await db.select().from(tripDestinations).where(eq(tripDestinations.tripId, trip.id));
  if (dests.length === 0) {
    console.log('No destinations found.');
    return;
  }

  // Clear existing transport options
  await db.delete(destinationTransportOptions).where(eq(destinationTransportOptions.tripId, trip.id));

  // Map destinations by name (case-insensitive partial match)
  const findDest = (name: string) => dests.find(d => d.name.toLowerCase().includes(name.toLowerCase()));

  // Transportation data from Vicenza
  const transportData: Array<{
    destName: string;
    options: Array<Omit<typeof destinationTransportOptions.$inferInsert, 'tripId' | 'destinationId'>>;
  }> = [
    {
      destName: 'Venice',
      options: [
        {
          mode: 'driving',
          durationMinutes: 75,
          distanceKm: 75,
          estimatedCost: '15',
          routeName: 'A4/E70',
          tollCost: '6.50',
          parkingNotes: 'Tronchetto parking €25-35/day. Piazzale Roma garage €26/day. Park at Mestre and take train for cheaper option.',
          directionsUrl: 'https://www.google.com/maps/dir/Vicenza/Venice',
          pros: JSON.stringify(['Flexible schedule', 'Can stop at Padova en route', 'Good for day trips with luggage']),
          cons: JSON.stringify(['Parking very expensive', 'No cars in Venice center', 'Traffic near Mestre']),
          recommended: false,
        },
        {
          mode: 'train',
          durationMinutes: 45,
          distanceKm: 72,
          estimatedCost: '8',
          departureStation: 'Vicenza',
          arrivalStation: 'Venezia Santa Lucia',
          transfers: 0,
          trainProvider: 'trenitalia',
          bookingUrl: 'https://www.trenitalia.com',
          pros: JSON.stringify(['Cheapest option', 'Direct to city center', 'No parking hassle', 'Frequent departures (every 30 min)']),
          cons: JSON.stringify(['Fixed schedule', 'Crowded on weekends']),
          recommended: true,
        },
        {
          mode: 'bus',
          durationMinutes: 120,
          distanceKm: 75,
          estimatedCost: '6',
          busProvider: 'FlixBus',
          busRoute: 'Vicenza → Venice Mestre → Venice Tronchetto',
          bookingUrl: 'https://www.flixbus.com',
          pros: JSON.stringify(['Cheapest option', 'WiFi on board']),
          cons: JSON.stringify(['Slow', 'Infrequent service', 'Drops at Tronchetto not city center']),
          recommended: false,
        },
      ],
    },
    {
      destName: 'Florence',
      options: [
        {
          mode: 'driving',
          durationMinutes: 195,
          distanceKm: 250,
          estimatedCost: '45',
          routeName: 'A13 → A1',
          tollCost: '22',
          parkingNotes: 'ZTL restricted zone in center. Park at Garage Porta al Prato (€20/day) or Fortezza da Basso.',
          directionsUrl: 'https://www.google.com/maps/dir/Vicenza/Florence',
          pros: JSON.stringify(['Flexible schedule', 'Can stop at Bologna en route']),
          cons: JSON.stringify(['Long drive', 'Expensive tolls', 'ZTL restricted zones', 'Parking expensive']),
          recommended: false,
        },
        {
          mode: 'train',
          durationMinutes: 120,
          distanceKm: 230,
          estimatedCost: '25',
          departureStation: 'Vicenza',
          arrivalStation: 'Firenze Santa Maria Novella',
          transfers: 1,
          trainProvider: 'both',
          bookingUrl: 'https://www.trenitalia.com',
          pros: JSON.stringify(['Fast with Frecciarossa', 'Central station location', 'No parking/ZTL worry', 'Scenic route through Apennines']),
          cons: JSON.stringify(['Transfer at Bologna usually', 'Peak prices can be €40+']),
          recommended: true,
          notes: 'Take Regionale to Bologna, then Frecciarossa to Florence. Book in advance for best prices. Italo also runs this route.',
        },
      ],
    },
    {
      destName: 'Verona',
      options: [
        {
          mode: 'driving',
          durationMinutes: 40,
          distanceKm: 52,
          estimatedCost: '10',
          routeName: 'A4/E70',
          tollCost: '4.20',
          parkingNotes: 'Parking Arsenale €2/hr. Parcheggio Centro €15/day. Street parking in Borgo Trento area.',
          directionsUrl: 'https://www.google.com/maps/dir/Vicenza/Verona',
          pros: JSON.stringify(['Quick drive', 'Easy highway route', 'Good for evening events (opera, etc.)']),
          cons: JSON.stringify(['Parking can be tricky near Arena', 'ZTL in historic center']),
          recommended: true,
        },
        {
          mode: 'train',
          durationMinutes: 30,
          distanceKm: 52,
          estimatedCost: '5',
          departureStation: 'Vicenza',
          arrivalStation: 'Verona Porta Nuova',
          transfers: 0,
          trainProvider: 'trenitalia',
          bookingUrl: 'https://www.trenitalia.com',
          pros: JSON.stringify(['Very cheap', 'Frequent service', 'Station is walkable to center']),
          cons: JSON.stringify(['Last train ~23:00', 'Limited flexibility for late events']),
          recommended: false,
          notes: 'Regional trains every 20-30 minutes. Only €4.55 with Regionale.',
        },
      ],
    },
    {
      destName: 'Dolomites',
      options: [
        {
          mode: 'driving',
          durationMinutes: 150,
          distanceKm: 160,
          estimatedCost: '30',
          routeName: 'A31 → SS47 → SS50',
          tollCost: '8',
          parkingNotes: 'Free parking at most trailheads. Tre Cime di Lavaredo toll road €30. Arrive early in summer.',
          directionsUrl: 'https://www.google.com/maps/dir/Vicenza/Cortina+d%27Ampezzo',
          pros: JSON.stringify(['Only viable option for mountain access', 'Flexible for multiple stops', 'Scenic drive through valleys', 'Access to remote trailheads']),
          cons: JSON.stringify(['Mountain roads can be challenging', 'Snow chains required in winter', 'Long drive for a day trip']),
          recommended: true,
          notes: 'Essential to have a car for the Dolomites. Public transport is very limited and doesn\'t reach most trailheads.',
        },
        {
          mode: 'bus',
          durationMinutes: 240,
          distanceKm: 170,
          estimatedCost: '15',
          busProvider: 'Dolomiti Bus / Cortina Express',
          busRoute: 'Vicenza → Bassano → Feltre → Belluno → Cortina',
          bookingUrl: 'https://dolomitibus.it',
          pros: JSON.stringify(['No driving stress on mountain roads', 'Scenic journey']),
          cons: JSON.stringify(['Very slow', 'Limited to main towns only', 'Infrequent service', 'No trailhead access']),
          recommended: false,
          notes: 'Only practical if staying in Cortina and doing organized tours from there.',
        },
      ],
    },
    {
      destName: 'Bologna',
      options: [
        {
          mode: 'driving',
          durationMinutes: 105,
          distanceKm: 130,
          estimatedCost: '20',
          routeName: 'A4 → A13',
          tollCost: '10.50',
          parkingNotes: 'Parcheggio Staveco near center €12/day. ZTL in old town.',
          directionsUrl: 'https://www.google.com/maps/dir/Vicenza/Bologna',
          pros: JSON.stringify(['Straightforward highway route']),
          cons: JSON.stringify(['ZTL restrictions', 'Tolls add up', 'City driving stressful']),
          recommended: false,
        },
        {
          mode: 'train',
          durationMinutes: 60,
          distanceKm: 115,
          estimatedCost: '12',
          departureStation: 'Vicenza',
          arrivalStation: 'Bologna Centrale',
          transfers: 0,
          trainProvider: 'both',
          bookingUrl: 'https://www.trenitalia.com',
          pros: JSON.stringify(['Fast and direct', 'Frequent Frecciarossa service', 'Station in city center', 'Food capital - no car needed']),
          cons: JSON.stringify(['Peak prices can be higher']),
          recommended: true,
          notes: 'Frecciarossa takes 1 hour. Regionale takes ~1.5 hours but cheaper at €10. Perfect day trip.',
        },
      ],
    },
    {
      destName: 'Lake Garda',
      options: [
        {
          mode: 'driving',
          durationMinutes: 70,
          distanceKm: 85,
          estimatedCost: '15',
          routeName: 'A4 → exit Peschiera del Garda',
          tollCost: '6',
          parkingNotes: 'Parking available in Sirmione (€5/hr), Desenzano, and Peschiera. Summer weekends very crowded.',
          directionsUrl: 'https://www.google.com/maps/dir/Vicenza/Sirmione',
          pros: JSON.stringify(['Flexible lakeside exploration', 'Can visit multiple towns', 'Good for families with gear']),
          cons: JSON.stringify(['Summer traffic very heavy', 'Parking fills up fast in Sirmione']),
          recommended: true,
          notes: 'Arrive early on summer weekends. Gardaland nearby if traveling with kids.',
        },
        {
          mode: 'train',
          durationMinutes: 55,
          distanceKm: 80,
          estimatedCost: '7',
          departureStation: 'Vicenza',
          arrivalStation: 'Peschiera del Garda / Desenzano',
          transfers: 0,
          trainProvider: 'trenitalia',
          bookingUrl: 'https://www.trenitalia.com',
          pros: JSON.stringify(['Cheap', 'Direct service', 'No parking stress']),
          cons: JSON.stringify(['Limited to station towns', 'Need bus/ferry for lakeside villages', 'Less flexible for exploration']),
          recommended: false,
        },
      ],
    },
    {
      destName: 'Padova',
      options: [
        {
          mode: 'driving',
          durationMinutes: 30,
          distanceKm: 32,
          estimatedCost: '7',
          routeName: 'A4/E70',
          tollCost: '3',
          parkingNotes: 'Park at Prato della Valle area. Tram park-and-ride available.',
          directionsUrl: 'https://www.google.com/maps/dir/Vicenza/Padova',
          pros: JSON.stringify(['Very close', 'Quick highway route']),
          cons: JSON.stringify(['ZTL in center', 'Parking limited near Scrovegni Chapel']),
          recommended: false,
        },
        {
          mode: 'train',
          durationMinutes: 20,
          distanceKm: 32,
          estimatedCost: '4',
          departureStation: 'Vicenza',
          arrivalStation: 'Padova',
          transfers: 0,
          trainProvider: 'trenitalia',
          bookingUrl: 'https://www.trenitalia.com',
          pros: JSON.stringify(['Super fast', 'Very cheap', 'Trains every 15 min', 'Station near old town']),
          cons: JSON.stringify(['None really!']),
          recommended: true,
        },
      ],
    },
  ];

  let count = 0;
  for (const { destName, options } of transportData) {
    const dest = findDest(destName);
    if (!dest) {
      console.log(`  ⚠️ Destination "${destName}" not found, skipping`);
      continue;
    }

    for (const opt of options) {
      await db.insert(destinationTransportOptions).values({
        tripId: trip.id,
        destinationId: dest.id,
        ...opt,
      });
      count++;
    }
    console.log(`  ✅ ${destName}: ${options.length} options`);
  }

  console.log(`\n🎉 Seeded ${count} transportation options!`);
  process.exit(0);
}

seedTransportation().catch(console.error);
