/**
 * Complete Venice destination profile — Adds detailed research data
 * Populates: enhanced transport notes, travel tips, summary, detailed highlights
 * Usage: bun run scripts/seed-venice-complete.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../src/db/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

const VENICE_ID = 'WrIRgFGe_VlerbL9rbTDj';

async function seedVeniceCompleteResearch() {
  console.log('🚂 Updating Venice with complete research data...\n');

  // Update destination_research with detailed transport and tips
  const existing = await db.select().from(schema.destinationResearch)
    .where(eq(schema.destinationResearch.destinationId, VENICE_ID));

  const transportNotes = `**Getting There from Vicenza:**

🚂 **Train (RECOMMENDED)**
- Frecciarossa/Italo: 30-44 minutes
- Cost: €8-22 ($8.22)
- 49 trains/day, 45 direct
- First train: 5:08 AM | Last train: 11:03 PM
- Arrive at: Venice Santa Lucia (walkable to main sights)

🚗 **Drive**
- Time: ~1 hour / 70km
- Parking: Piazzale Roma (€30+/day) or Tronchetto
- Not recommended — Venice is car-free, parking is expensive

**Getting Around Venice:**
- Vaporetto (water bus): €9.50 single, day passes €25-45
- Gondola: €90 daytime / €110 nighttime (30 min, up to 5 people)
- Traghetto (gondola ferry): €2 across Grand Canal
- **Best:** Walk + occasional vaporetto

**Summer Crowd Survival:**
- Arrive early (first train 5:08 AM) — beat day-trippers
- Stay late (after 6 PM) — Venice becomes magical
- Lunch during siesta (2-5 PM) — crowds thin
- Avoid cruise ship days: Tuesday/Thursday/Saturday`;

  const travelTips = JSON.stringify([
    "Book skip-the-line tickets for St. Mark's Basilica — queues can be 1-2 hours in summer",
    "Book Doge's Palace 30+ days ahead for €30 online price (vs €35 at door)",
    "Dress modestly for churches: shoulders and knees covered",
    "Get vaporetto day pass (€25) if taking more than 2 water bus rides",
    "Food near St. Mark's Square is overpriced — walk 10 minutes away",
    "Best gondola times: early morning or after sunset",
    "Try cicchetti (Venetian tapas) at local bacari wine bars",
    "Rialto Market closes by noon — visit in the morning",
    "Evening openings at St. Mark's available on select dates",
    "Secret Itineraries Tour at Doge's Palace includes hidden prison cells",
    "Shared gondola rides available for ~€25/person",
    "Most shops close during siesta (2-5 PM) — perfect for gelato break",
    "San Marco area is most touristy — explore side alleys for authentic Venice",
    "Bridge of Sighs best viewed from Ponte della Paglia outside",
    "Venice is entirely walkable — comfortable shoes essential"
  ]);

  const summary = `Venice — The Floating City. One of the world's most iconic destinations, built on 118 islands with 400+ bridges, no cars, just boats and footsteps. From Vicenza, it's an easy 30-minute train ride to this UNESCO World Heritage Site.

**Must-See:** St. Mark's Basilica (Byzantine masterpiece), Doge's Palace (Gothic power seat), Rialto Bridge (oldest over Grand Canal), Grand Canal (S-shaped main waterway), Bridge of Sighs (prisoners' last view).

**Signature Experiences:** Gondola ride through silent canals, Aperol Spritz at sunset, cicchetti hopping between bacari (wine bars), watching the world go by in St. Mark's Square.

**Summer Reality:** Peak tourist season means crowds, but also long daylight hours (sunset ~9 PM) and magical warm evenings. Book skip-the-line tickets, arrive early, stay late, and get intentionally lost in the maze of alleys — that's where the real Venice lives.`;

  if (existing.length > 0) {
    await db.update(schema.destinationResearch)
      .set({
        transportNotes,
        travelTips,
        summary,
        updatedAt: new Date(),
      })
      .where(eq(schema.destinationResearch.destinationId, VENICE_ID));
    console.log('✅ Updated destination_research');
  } else {
    await db.insert(schema.destinationResearch).values({
      destinationId: VENICE_ID,
      transportNotes,
      travelTips,
      summary,
    });
    console.log('✅ Created destination_research');
  }

  // Get current highest orderIndex
  const existingHighlights = await db.select().from(schema.destinationHighlights)
    .where(eq(schema.destinationHighlights.destinationId, VENICE_ID))
    .orderBy(schema.destinationHighlights.orderIndex);
  
  let nextOrder = existingHighlights.length > 0 
    ? Math.max(...existingHighlights.map(h => h.orderIndex ?? 0)) + 1 
    : 0;

  // Add detailed highlights with ticket/pricing info
  const newHighlights = [
    {
      destinationId: VENICE_ID,
      title: "St. Mark's Basilica — Skip-the-Line Entry",
      description: "The crown jewel of Byzantine architecture — 1,000 years old, covered in golden mosaics. Standard entry €18-20. Skip-the-line + audio €20. Terrace access €30. Guided tour + terrace + museum €58. Evening openings €35 on select dates. Book ahead — queues can be 1-2 hours in summer.",
      category: 'attraction',
      websiteUrl: 'https://www.basilicasanmarco.it',
      priceLevel: 2,
      orderIndex: nextOrder++,
    },
    {
      destinationId: VENICE_ID,
      title: "Doge's Palace — Book 30+ Days Ahead",
      description: "Gothic masterpiece — former seat of Venetian power, connected to prison by Bridge of Sighs. Standard €35 (€30 if booked 30+ days ahead). Reduced €15 (ages 6-14, students, seniors). Secret Itineraries Tour €40 (hidden prison cells). Hours: Apr-Oct 9 AM – 7 PM, Nov-Mar 9 AM – 6 PM.",
      category: 'attraction',
      websiteUrl: 'https://palazzoducale.visitmuve.it',
      priceLevel: 3,
      orderIndex: nextOrder++,
    },
    {
      destinationId: VENICE_ID,
      title: "Rialto Bridge — Early Morning Visit",
      description: "The oldest and most famous bridge over the Grand Canal — 48m long, built 1591. Best time: 8:30 AM to avoid crowds. FREE. Nearby: Rialto Market (produce and fish, closes by noon).",
      category: 'attraction',
      priceLevel: 0,
      orderIndex: nextOrder++,
    },
    {
      destinationId: VENICE_ID,
      title: "Grand Canal by Vaporetto — Line 1",
      description: "The main waterway of Venice — S-shaped, 2 miles long, lined with palaces. Vaporetto: €9.50 single ride. Day passes: €25 (1-day), €35 (2-day), €45 (3-day). Key sights: Ca' d'Oro, Palazzo Venier dei Leoni (Peggy Guggenheim), Fondaco dei Turchi.",
      category: 'activity',
      priceLevel: 1,
      orderIndex: nextOrder++,
    },
    {
      destinationId: VENICE_ID,
      title: "Gondola Ride — Official Pricing",
      description: "€90 daytime (9 AM – 7 PM) / €110 nighttime (7 PM – 3 AM) for 30 minutes. PER GONDOLA (not per person) — fits up to 5 people. Shared gondola options: ~€25/person. Less crowded piers: Danieli, Santa Maria del Giglio, San Tomà (avoid San Marco queues).",
      category: 'activity',
      priceLevel: 3,
      orderIndex: nextOrder++,
    },
    {
      destinationId: VENICE_ID,
      title: "Caffè Florian — Oldest Café in Europe",
      description: "Est. 1720 in St. Mark's Square. The historic café where Casanova, Goethe, and Byron once sipped coffee. Pricey but iconic. Perfect for people-watching with live orchestra. Coffee €15-20, but you are paying for 300 years of history.",
      category: 'food',
      websiteUrl: 'https://www.caffeflorian.com',
      priceLevel: 3,
      orderIndex: nextOrder++,
    },
    {
      destinationId: VENICE_ID,
      title: "Cicchetti Hopping — Venetian Tapas",
      description: "The local way to eat: small plates at bacari (wine bars). Try: Sarde in saor (sweet/sour sardines), Baccalà mantecato (creamed cod), Risotto al nero di seppia (squid ink). Pair with an Aperol Spritz or ombra (house wine). Budget: €2-4 per cicchetto.",
      category: 'food',
      priceLevel: 1,
      orderIndex: nextOrder++,
    },
    {
      destinationId: VENICE_ID,
      title: "St. Mark's Campanile — Panoramic Views",
      description: "Best panoramic views of Venice — 99m tall, elevator to top. €10 (often included in combo tickets). Hours: 9:45 AM – 9 PM (varies by season).",
      category: 'attraction',
      priceLevel: 1,
      orderIndex: nextOrder++,
    },
    {
      destinationId: VENICE_ID,
      title: "Bridge of Sighs — Inside & Outside Views",
      description: "Famous white limestone bridge connecting Doge's Palace to prison. Prisoners' last view of Venice. Best outside view: Ponte della Paglia (waterfront bridge). Inside view: Included with Doge's Palace ticket.",
      category: 'attraction',
      priceLevel: 0,
      orderIndex: nextOrder++,
    },
    {
      destinationId: VENICE_ID,
      title: "Traghetto — €2 Gondola Ferry",
      description: "Locals' secret: Gondola ferry across the Grand Canal for just €2. Stand up like the Venetians do! Several crossing points including Santa Sofia and Rialto.",
      category: 'activity',
      priceLevel: 0,
      orderIndex: nextOrder++,
    },
  ];

  // Insert new highlights
  for (const highlight of newHighlights) {
    await db.insert(schema.destinationHighlights).values(highlight);
  }
  console.log(`✅ Added ${newHighlights.length} new detailed highlights`);

  // Update the trip destination record
  await db.update(schema.tripDestinations)
    .set({
      researchStatus: 'fully_researched',
      lastResearchedAt: new Date(),
    })
    .where(eq(schema.tripDestinations.id, VENICE_ID));
  console.log('✅ Updated trip destination status');

  console.log('\n🎭 Venice research complete!');
  console.log('Added detailed ticket prices, booking links, and insider tips.');
  
  await client.end();
  process.exit(0);
}

seedVeniceCompleteResearch().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
