/**
 * Vegas F1 2026 — Restaurant & Dining Research
 * Populates destination_highlights (food category) and budget_items
 * Usage: bun run scripts/seed-vegas-restaurants.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';
import * as schema from '../src/db/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

const VEGAS_DEST_ID = 'Uz6JyIvdeg0h8bPYe8y7R';
const TRIP_ID = '2el8do_u2fmjxf5DU9bf1';

async function seedVegasRestaurants() {
  console.log('🍽️ Seeding Vegas restaurant research...\n');

  // Get current highest orderIndex for this destination
  const existingHighlights = await db.select().from(schema.destinationHighlights)
    .where(eq(schema.destinationHighlights.destinationId, VEGAS_DEST_ID))
    .orderBy(schema.destinationHighlights.orderIndex);

  let nextOrder = existingHighlights.length > 0
    ? Math.max(...existingHighlights.map(h => h.orderIndex ?? 0)) + 1
    : 0;

  const restaurants = [
    {
      destinationId: VEGAS_DEST_ID,
      title: 'Restaurant Guy Savoy',
      description: 'French fine dining at Caesars Palace. Forbes 5-star. Celebration menu $500/pp ($800 w/ wine), Prestige $1,000 w/ wine. Signature: Colors of Caviar ($105), artichoke & black truffle soup ($100). 12,000-bottle wine cellar. Own valet entrance. Tue-Sat 5-9pm.',
      category: 'food',
      rating: 4.8,
      priceLevel: 4,
      address: '3570 S Las Vegas Blvd, Las Vegas, NV 89109',
      lat: 36.1162,
      lng: -115.1745,
      websiteUrl: 'https://www.caesars.com/caesars-palace/restaurants/restaurant-guy-savoy',
      duration: '2-3 hours',
      orderIndex: nextOrder++,
    },
    {
      destinationId: VEGAS_DEST_ID,
      title: 'Bazaar Mar by José Andrés',
      description: 'Seafood-forward Spanish dining at Shops at Crystals. Tasting menus $175-$235. Bluefin tuna sashimi, Hokkaido scallops, Ora King salmon. Bar Centro downstairs for casual bites. Sun-Thu 5-9pm, Fri-Sat 5-10pm.',
      category: 'food',
      rating: 4.6,
      priceLevel: 4,
      address: '3720 S Las Vegas Blvd, Las Vegas, NV 89158',
      lat: 36.1071,
      lng: -115.1748,
      websiteUrl: 'https://www.theshopsatcrystals.com/dining/bazaar-mar',
      duration: '2 hours',
      orderIndex: nextOrder++,
    },
    {
      destinationId: VEGAS_DEST_ID,
      title: 'Wakuda',
      description: 'Japanese fine dining at The Palazzo by Michelin chef Tetsuya Wakuda. Tokyo Golden Gai-inspired entrance. Exclusive 8-seat omakase room ($300/pp). Fine sushi, Ora King salmon, soft shell crab. Daily 5-11pm.',
      category: 'food',
      rating: 4.7,
      priceLevel: 4,
      address: '3325 S Las Vegas Blvd, Las Vegas, NV 89109',
      lat: 36.1248,
      lng: -115.1693,
      websiteUrl: 'https://www.venetianlasvegas.com/restaurants/wakuda.html',
      duration: '2 hours',
      orderIndex: nextOrder++,
    },
    {
      destinationId: VEGAS_DEST_ID,
      title: 'Carbone',
      description: 'Italian-American fine dining at Aria. NYC transplant. Legendary spicy rigatoni, theatrical tableside Caesar salad, incredible veal parm. Extremely hard reservation — book exactly 30 days out. Mains $40-70+.',
      category: 'food',
      rating: 4.7,
      priceLevel: 4,
      address: '3730 S Las Vegas Blvd, Las Vegas, NV 89158',
      lat: 36.1073,
      lng: -115.1764,
      websiteUrl: 'https://aria.mgmresorts.com/en/restaurants/carbone.html',
      duration: '2 hours',
      orderIndex: nextOrder++,
    },
    {
      destinationId: VEGAS_DEST_ID,
      title: 'Delilah',
      description: 'Art Deco supper club at Wynn with live jazz nightly. Beef Wellington for two ($190), lobster tail ($225). Late-night menu Thu-Sun after 11pm. Perfect romantic date night. Daily 5:30-10:30pm.',
      category: 'food',
      rating: 4.6,
      priceLevel: 4,
      address: '3131 S Las Vegas Blvd, Las Vegas, NV 89109',
      lat: 36.1290,
      lng: -115.1663,
      duration: '2 hours',
      orderIndex: nextOrder++,
    },
    {
      destinationId: VEGAS_DEST_ID,
      title: 'COTE Vegas',
      description: 'Michelin-starred Korean BBQ at The Venetian. Tableside Wagyu grilling, DJ, clubby energy. Omakase $225/pp. Sun-Tue 5-11pm, Thu-Sat 5pm-midnight. Fun, social, party vibe.',
      category: 'food',
      rating: 4.6,
      priceLevel: 4,
      address: '3355 Las Vegas Blvd S, Las Vegas, NV 89109',
      lat: 36.1234,
      lng: -115.1698,
      duration: '2 hours',
      orderIndex: nextOrder++,
    },
    {
      destinationId: VEGAS_DEST_ID,
      title: 'Gymkhana',
      description: 'Indian fine dining at Aria (2 Michelin stars in London). Tandoori masala lamb chops, wagyu naan, spiced short rib. Mezcal margarita. Sun-Thu 5-10pm, Fri-Sat 9am-10:30pm. Mains $30-60.',
      category: 'food',
      rating: 4.5,
      priceLevel: 3,
      address: '3730 Las Vegas Blvd S, Las Vegas, NV 89158',
      lat: 36.1073,
      lng: -115.1760,
      websiteUrl: 'https://aria.mgmresorts.com/en/restaurants/gymkhana.html',
      duration: '1.5-2 hours',
      orderIndex: nextOrder++,
    },
    {
      destinationId: VEGAS_DEST_ID,
      title: 'Stubborn Seed',
      description: 'Farm-to-table tasting menu at Resorts World by Top Chef winner Jeremy Ford. Tasting $145/pp, wine pairing $70. Wagyu smash burger at bar ($28). Seasonal, vegetable-forward. Daily 5-10pm.',
      category: 'food',
      rating: 4.5,
      priceLevel: 3,
      address: '3000 S Las Vegas Blvd, Las Vegas, NV 89109',
      lat: 36.1350,
      lng: -115.1683,
      duration: '2 hours',
      orderIndex: nextOrder++,
    },
    {
      destinationId: VEGAS_DEST_ID,
      title: 'Chyna Club',
      description: 'Cantonese fine dining at Fontainebleau. Best Peking duck in Vegas (carved tableside), Wagyu with white asparagus. French Art Deco design. Wed-Sun 5:30-9:30pm only (closed Mon-Tue).',
      category: 'food',
      rating: 4.5,
      priceLevel: 4,
      address: '2777 S Las Vegas Blvd, Las Vegas, NV 89109',
      lat: 36.1370,
      lng: -115.1670,
      duration: '2 hours',
      orderIndex: nextOrder++,
    },
    {
      destinationId: VEGAS_DEST_ID,
      title: 'Eiffel Tower Restaurant',
      description: 'French dining 100 feet up inside the Paris Las Vegas Eiffel Tower replica. Stunning view of Bellagio fountains. Classic romance spot. Mains $45-75.',
      category: 'food',
      rating: 4.3,
      priceLevel: 3,
      address: '3655 S Las Vegas Blvd, Las Vegas, NV 89109',
      lat: 36.1125,
      lng: -115.1720,
      websiteUrl: 'https://www.caesars.com/paris-las-vegas/restaurants/eiffel-tower-restaurant',
      duration: '1.5-2 hours',
      orderIndex: nextOrder++,
    },
    {
      destinationId: VEGAS_DEST_ID,
      title: 'Bacchanal Buffet',
      description: 'Best buffet in Vegas at Caesars Palace. 250+ dishes, 10 kitchens, 25,000 sq ft. Dinner $87-92/pp. Reserve an entry time (line pass) — essential during F1 week. Mon-Thu 2:30-9pm, Fri-Sun 9am-10pm.',
      category: 'food',
      rating: 4.4,
      priceLevel: 3,
      address: '3570 S Las Vegas Blvd, Las Vegas, NV 89109',
      lat: 36.1162,
      lng: -115.1740,
      duration: '1.5-2 hours',
      orderIndex: nextOrder++,
    },
    {
      destinationId: VEGAS_DEST_ID,
      title: 'The Buffet at Wynn',
      description: 'Upscale buffet with 16 cooking stations, 90+ dishes, palm tree-lined room. Brunch $60/pp, dinner $80/pp. Ultimate upgrade includes lobster tail + unlimited drinks. Daily brunch 8am-1pm, dinner 1-9pm.',
      category: 'food',
      rating: 4.3,
      priceLevel: 3,
      address: '3131 S Las Vegas Blvd, Las Vegas, NV 89109',
      lat: 36.1290,
      lng: -115.1660,
      duration: '1.5-2 hours',
      orderIndex: nextOrder++,
    },
    {
      destinationId: VEGAS_DEST_ID,
      title: 'Milpa',
      description: 'Best tacos in Vegas — off-Strip neighborhood gem. 150 lbs of corn turned into tortillas daily. Birria tacos $5-6, harvest bowls $14-16, tetelas $16. Only 30 seats, order for takeout. Mon-Sat 8am-9pm.',
      category: 'food',
      rating: 4.6,
      priceLevel: 1,
      address: '4226 S Durango Dr, Las Vegas, NV 89147',
      lat: 36.1040,
      lng: -115.2790,
      duration: '30-45 min',
      orderIndex: nextOrder++,
    },
    {
      destinationId: VEGAS_DEST_ID,
      title: 'Secret Pizza',
      description: 'Hidden speakeasy-style pizza joint at Cosmopolitan (3rd floor). No signage — follow the smell. Pizza by the slice $6-8. Perfect late-night snack.',
      category: 'food',
      rating: 4.2,
      priceLevel: 1,
      address: '3708 S Las Vegas Blvd, Las Vegas, NV 89109',
      lat: 36.1098,
      lng: -115.1736,
      duration: '20-30 min',
      orderIndex: nextOrder++,
    },
  ];

  for (const restaurant of restaurants) {
    await db.insert(schema.destinationHighlights).values(restaurant);
  }
  console.log(`✅ Added ${restaurants.length} restaurant highlights`);

  // Add dining budget items
  const budgetItems = [
    {
      tripId: TRIP_ID,
      category: 'food',
      description: 'Fine dining splurge night (Guy Savoy, Carbone, or Delilah)',
      estimatedCost: '400',
      date: '2026-11-20',
    },
    {
      tripId: TRIP_ID,
      category: 'food',
      description: 'Romantic dinner (Chyna Club or Eiffel Tower)',
      estimatedCost: '300',
      date: '2026-11-19',
    },
    {
      tripId: TRIP_ID,
      category: 'food',
      description: 'Trendy dinner (Gymkhana, Stubborn Seed, or COTE)',
      estimatedCost: '250',
      date: '2026-11-18',
    },
    {
      tripId: TRIP_ID,
      category: 'food',
      description: 'Bacchanal Buffet lunch (2 ppl)',
      estimatedCost: '185',
      date: '2026-11-20',
    },
    {
      tripId: TRIP_ID,
      category: 'food',
      description: 'Wynn Buffet brunch (2 ppl, departure day)',
      estimatedCost: '140',
      date: '2026-11-22',
    },
    {
      tripId: TRIP_ID,
      category: 'food',
      description: 'Casual eats (tacos, pizza, In-N-Out, snacks) — multiple days',
      estimatedCost: '150',
    },
    {
      tripId: TRIP_ID,
      category: 'food',
      description: 'Race day dining (lunch + pre-race apps)',
      estimatedCost: '200',
      date: '2026-11-21',
    },
  ];

  for (const item of budgetItems) {
    await db.insert(schema.budgetItems).values(item);
  }
  console.log(`✅ Added ${budgetItems.length} dining budget items`);
  console.log('\n💰 Estimated total dining budget: ~$1,625 for the trip');

  console.log('\n🍽️ Vegas restaurant research complete!');
  await client.end();
  process.exit(0);
}

seedVegasRestaurants().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
