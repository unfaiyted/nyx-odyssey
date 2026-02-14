/**
 * Complete Padua (Padova) destination profile — Adds detailed research data
 * Populates: enhanced transport notes, travel tips, summary, detailed highlights
 * Usage: bun run scripts/seed-padua-complete.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../src/db/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

const PADUA_ID = '298jfhi3suggy0HR63T9W';

async function seedPaduaCompleteResearch() {
  console.log('🎓 Updating Padua with complete research data...\n');

  // Update destination_research with detailed transport and tips
  const existing = await db.select().from(schema.destinationResearch)
    .where(eq(schema.destinationResearch.destinationId, PADUA_ID));

  const transportNotes = `**Getting There from Vicenza:**

🚂 **Train (RECOMMENDED)**
- Italo high-speed or Trenitalia regional: 15-21 minutes
- Cost: €4-9 one way
- 65+ trains per day
- First train: ~5:08 AM | Last train: ~11:03 PM
- Arrive at: Padua train station (25-min walk or tram to center)

🚗 **Drive**
- Distance: 30 km (19 miles)
- Time: ~30-40 minutes
- Parking: Limited in historic center — use park-and-ride or park outside walls

**Getting Around Padua:**
- Historic center is compact and walkable
- Trams/buses available from train station to center
- Most attractions within 15-20 min walk of each other`;

  const travelTips = JSON.stringify([
    "Book Scrovegni Chapel tickets WELL in advance — sells out, especially summer",
    "Arrive 30 min early to Scrovegni to collect tickets — late arrivals = no entry",
    "Scrovegni entry is timed in small groups with 15-20 min inside",
    "Wear comfortable shoes — lots of cobblestone walking",
    "Combine with easy lunch at Piazza delle Erbe market",
    "Visit Orto Botanico — oldest university botanical garden in the world (1545)",
    "Prato della Valle is perfect for a coffee break or picnic",
    "Try Pedrocchi Café — historic, once open 24/7 with 'no doors'",
    "Piazza delle Erbe and Piazza della Frutta markets close by early afternoon",
    "June-July: Hot but long days (sunset ~9pm), perfect for extended sightseeing",
    "Basilica of Saint Anthony is free to enter — millions of pilgrims visit yearly",
    "Scrovegni Chapel has airlock chamber for temperature stabilization — unique entry experience",
    "Padua's riddle: 'A saint without a name, a meadow without grass, a café without doors'",
    "Local specialties: Bigoli pasta, risotto, prosecco from nearby hills",
    "Perfect easy day trip — only 30 min from Vicenza by train"
  ]);

  const summary = `Padua (Padova) — The perfect easy day trip from Vicenza, only 30 minutes by train. A vibrant university city (founded 1222, second-oldest in Italy) with world-class art, historic markets, and one of the most important fresco cycles in Western art.

**Must-See:** Scrovegni Chapel — Giotto's frescoes that launched the Renaissance. Book well in advance! UNESCO World Heritage since 2021. Basilica of Saint Anthony — massive 14th-century pilgrimage site. Prato della Valle — one of Europe's largest and most beautiful public squares. Orto Botanico — oldest university botanical garden in the world (1545), also UNESCO.

**The Experience:** Walkable historic center, lively markets at Piazza delle Erbe, coffee at historic Pedrocchi Café, and that relaxed university-town vibe. Much less touristy than Venice but with serious cultural cred.

**Perfect for:** Art lovers (Giotto!), easy day trips, market browsing, and experiencing authentic Veneto city life without the Venice crowds.`;

  if (existing.length > 0) {
    await db.update(schema.destinationResearch)
      .set({
        transportNotes,
        travelTips,
        summary,
        updatedAt: new Date(),
      })
      .where(eq(schema.destinationResearch.destinationId, PADUA_ID));
    console.log('✅ Updated destination_research');
  } else {
    await db.insert(schema.destinationResearch).values({
      destinationId: PADUA_ID,
      transportNotes,
      travelTips,
      summary,
    });
    console.log('✅ Created destination_research');
  }

  // Get current highest orderIndex
  const existingHighlights = await db.select().from(schema.destinationHighlights)
    .where(eq(schema.destinationHighlights.destinationId, PADUA_ID))
    .orderBy(schema.destinationHighlights.orderIndex);
  
  let nextOrder = existingHighlights.length > 0 
    ? Math.max(...existingHighlights.map(h => h.orderIndex ?? 0)) + 1 
    : 0;

  // Add detailed highlights with ticket/pricing info
  const newHighlights = [
    {
      destinationId: PADUA_ID,
      title: "Scrovegni Chapel — Giotto's Renaissance Masterpiece",
      description: "THE reason to visit Padua. 14th-century chapel covered floor-to-ceiling with Giotto's frescoes depicting the Life of Christ and Virgin. Revolutionized art with emotion, depth, and realism. UNESCO World Heritage 2021. Timed entry in small groups, 15-20 min inside. Tickets €10-15 + €1 reservation fee. CRITICAL: Book well in advance — sells out in summer! Arrive 30 min early.",
      category: 'attraction',
      websiteUrl: 'https://www.cappelladegliscrovegni.it',
      priceLevel: 1,
      orderIndex: nextOrder++,
    },
    {
      destinationId: PADUA_ID,
      title: "Basilica of Saint Anthony (Il Santo)",
      description: "Massive 14th-century basilica dedicated to Saint Anthony of Padua (yes, 'the Saint' is from here!). Distinctive red brick exterior with silver Byzantine domes. Mix of architectural styles. Contains tomb/sarcophagus of Saint Anthony — millions of pilgrims visit yearly. FREE entry. Located in Piazza del Santo, short walk from Prato della Valle.",
      category: 'attraction',
      websiteUrl: 'https://www.basilicadelsanto.org',
      priceLevel: 0,
      orderIndex: nextOrder++,
    },
    {
      destinationId: PADUA_ID,
      title: "Prato della Valle — Europe's Largest Square",
      description: "One of Europe's largest public squares at 90,000 sq meters. Massive oval island in center surrounded by canal, lined with 78 statues of famous Paduans. Locals hang out, students study, people picnic. Perfect for coffee break or lunch. 'Prato without grass' in Padua's famous riddle. Great vibe, especially late afternoon.",
      category: 'attraction',
      priceLevel: 0,
      orderIndex: nextOrder++,
    },
    {
      destinationId: PADUA_ID,
      title: "Orto Botanico di Padova — World's Oldest Botanical Garden",
      description: "Founded 1545 — oldest university botanical garden in the world! UNESCO World Heritage since 1997. Beautiful circular Renaissance layout, 6,000+ plant specimens. Features Goethe's Palm (400+ years old). Modern Biodiversity Garden addition (2014) showcasing different climate zones. Right in city center. Ticket ~€10.",
      category: 'attraction',
      websiteUrl: 'https://www.ortobotanicopd.it',
      priceLevel: 1,
      orderIndex: nextOrder++,
    },
    {
      destinationId: PADUA_ID,
      title: "Piazza delle Erbe & Piazza della Frutta Markets",
      description: "Lively daily markets right next to each other in historic center. Piazza delle Erbe: fresh produce, herbs, local specialties. Piazza della Frutta: fruit market with iconic loggia. Great for browsing, picking up picnic supplies, or just soaking up local atmosphere. Close early afternoon — visit before 2 PM.",
      category: 'shopping',
      priceLevel: 1,
      orderIndex: nextOrder++,
    },
    {
      destinationId: PADUA_ID,
      title: "Pedrocchi Café — The Café Without Doors",
      description: "Historic café famous for being open 24/7 with 'no doors' — hence Padua's riddle. Once a gathering place for intellectuals and revolutionaries. Great for coffee, people-watching, and soaking up history. Green room (for students), red room (for aristocrats), white room (for everyone). Pricey but iconic.",
      category: 'food',
      websiteUrl: 'https://www.pedrocchi.it',
      priceLevel: 2,
      orderIndex: nextOrder++,
    },
    {
      destinationId: PADUA_ID,
      title: "Palazzo della Ragione — Medieval Market Hall",
      description: "Impressive 13th-century medieval market hall and courthouse. Huge wooden ship's keel roof. Frescoed walls depicting zodiac signs and astrological themes. Used as covered market on ground floor (Piazza dei Signori side). Unique architectural gem.",
      category: 'attraction',
      priceLevel: 0,
      orderIndex: nextOrder++,
    },
    {
      destinationId: PADUA_ID,
      title: "Caffè Capitol — Local Favorite for Aperitivo",
      description: "Popular local spot for aperitivo and coffee near Piazza dei Signori. Less touristy than Pedrocchi, more authentic Paduan experience. Great spritz and cicchetti. Perfect for an afternoon break after sightseeing.",
      category: 'food',
      priceLevel: 1,
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
    .where(eq(schema.tripDestinations.id, PADUA_ID));
  console.log('✅ Updated trip destination status');

  console.log('\n🎓 Padua research complete!');
  console.log('Added detailed Scrovegni Chapel booking info, Orto Botanico UNESCO status, insider tips.');
  
  await client.end();
  process.exit(0);
}

seedPaduaCompleteResearch().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
