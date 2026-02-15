/**
 * Complete Uffizi Gallery profile — Adds detailed research data
 * Usage: bun run scripts/seed-uffizi-complete.ts
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../src/db/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odyssey';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

const UFFIZI_ID = 'vQETAHGK-KwKpozploCGB';

async function seedUffiziComplete() {
  console.log('🎨 Updating Uffizi Gallery with complete research data...\n');

  const transportNotes = `**Getting There from Vicenza:**

🚂 **Train to Florence (RECOMMENDED)**
- Frecciarossa high-speed: ~2 hours from Vicenza
- Cost: €20-40 one way (book early for best prices)
- Arrive at: Firenze Santa Maria Novella (SMN)
- From SMN: 15-minute walk to Uffizi through the Duomo area

🚶 **From Florence SMN to Uffizi:**
- Walk south from station → Via de' Cerretani → Duomo → Via dei Calzaiuoli → Piazza della Signoria → Uffizi (12-15 min)
- Bus lines C1, C3, 23 to "Galleria degli Uffizi"
- Taxi: ~€8-12 from most central hotels

**Location:** Between Piazza della Signoria and the Arno River, right next to Ponte Vecchio`;

  const travelTips = JSON.stringify([
    "BOOK TICKETS MONTHS IN ADVANCE — summer sells out days/weeks ahead",
    "Book on official site: uffizi.it/en — €29 (Mar-Oct) + €4 booking fee",
    "Tickets are nominal — bring ID, they do random checks",
    "Arrive before 10 AM for smallest crowds",
    "AVOID the first Sunday of the month — free entry but insane crowds",
    "Best days: Tuesday or Wednesday, early morning",
    "Plan at least 2-3 hours minimum (you could spend a full day)",
    "Wear comfortable shoes — it's a LOT of walking on hard floors",
    "Main elevators under renovation — expect stairs to 2nd floor",
    "No large bags or backpacks — free cloakroom available",
    "Don't miss the rooftop terrace café — coffee with a view of Piazza della Signoria",
    "Vasari Corridor (secret passage to Pitti Palace) reopened — book separately",
    "Audio guide available (€8) but a guided tour is worth it for context",
    "Photography allowed (no flash, no tripods)",
    "PassePartout combo ticket: Uffizi + Pitti Palace + Boboli Gardens for €38",
    "The gallery follows chronological order — start from Room 2 and go forward"
  ]);

  const summary = `The Uffizi Gallery — One of the world's greatest art museums, housing the most complete collection of Renaissance masterpieces on Earth. Originally built in 1560 as the Medici family's private office complex and art vault, opened to the public in 1765.

**Must-See Masterpieces:** Botticelli's Birth of Venus and Primavera (Rooms 10-14), Leonardo da Vinci's Annunciation (Room 35), Michelangelo's Doni Tondo (Room 41), Caravaggio's Medusa and Bacchus (Room 90), Raphael's Madonna of the Goldfinch (Room 66), Titian's Venus of Urbino (Room 83), and Giotto's Ognissanti Madonna (Room 2).

**The Experience:** 1,200+ masterpieces across 100+ rooms tracing Western art from medieval to Baroque. The U-shaped building itself is a masterpiece — Vasari's design with frescoed ceilings and the famous corridor overlooking the Arno. The rooftop terrace café offers stunning views over Piazza della Signoria.

**Practical:** €29 (peak season) + €4 booking fee. Book WELL in advance for summer. Open Tue-Sun 8:15AM-6:30PM. Plan 2-3 hours minimum. Right next to Ponte Vecchio and Piazza della Signoria — combine with Florence's greatest hits.`;

  // Upsert destination_research
  const existing = await db.select().from(schema.destinationResearch)
    .where(eq(schema.destinationResearch.destinationId, UFFIZI_ID));

  if (existing.length > 0) {
    await db.update(schema.destinationResearch)
      .set({
        transportNotes,
        travelTips,
        summary,
        country: 'Italy',
        region: 'Tuscany',
        language: 'Italian',
        currency: 'EUR',
        bestTimeToVisit: 'Early morning, Tue-Wed. Avoid first Sunday of month.',
        updatedAt: new Date(),
      })
      .where(eq(schema.destinationResearch.destinationId, UFFIZI_ID));
    console.log('✅ Updated destination_research');
  } else {
    await db.insert(schema.destinationResearch).values({
      destinationId: UFFIZI_ID,
      transportNotes,
      travelTips,
      summary,
      country: 'Italy',
      region: 'Tuscany',
      language: 'Italian',
      currency: 'EUR',
      bestTimeToVisit: 'Early morning, Tue-Wed. Avoid first Sunday of month.',
    });
    console.log('✅ Created destination_research');
  }

  // Clear existing highlights and add fresh ones
  await db.delete(schema.destinationHighlights)
    .where(eq(schema.destinationHighlights.destinationId, UFFIZI_ID));

  const highlights = [
    {
      destinationId: UFFIZI_ID,
      title: "Botticelli's Birth of Venus & Primavera",
      description: "The crown jewels of the Uffizi. Birth of Venus (c. 1485) — the iconic goddess emerging from the sea on a shell, arguably the most famous painting in Florence. Primavera (c. 1482) — an allegorical masterpiece of Spring with over 500 identified plant species. Rooms 10-14, always crowded. Arrive early for breathing room.",
      category: 'cultural',
      websiteUrl: 'https://www.uffizi.it/en/artworks/birth-of-venus',
      priceLevel: 0,
      duration: '20-30 min',
      orderIndex: 0,
    },
    {
      destinationId: UFFIZI_ID,
      title: "Leonardo da Vinci's Annunciation",
      description: "One of Leonardo's earliest known works (c. 1472), painted when he was about 20 years old and still in Verrocchio's workshop. The angel's wings were originally modeled on real bird wings. Room 35. Notice the atmospheric perspective in the background landscape — classic Leonardo.",
      category: 'cultural',
      priceLevel: 0,
      duration: '10-15 min',
      orderIndex: 1,
    },
    {
      destinationId: UFFIZI_ID,
      title: "Michelangelo's Doni Tondo",
      description: "The ONLY completed panel painting by Michelangelo to survive. A circular (tondo) painting of the Holy Family (c. 1507) with incredibly muscular figures that foreshadow the Sistine Chapel ceiling. The original gilded frame is as much a work of art as the painting itself. Room 41.",
      category: 'cultural',
      priceLevel: 0,
      duration: '10-15 min',
      orderIndex: 2,
    },
    {
      destinationId: UFFIZI_ID,
      title: "Caravaggio's Medusa & Bacchus",
      description: "Two masterpieces by the bad boy of Baroque. Medusa (1597) — a shield painted with Medusa's severed head, commissioned by Cardinal del Monte as a gift for the Medici. Bacchus (1597) — the god of wine looking slightly hungover. Room 90. Caravaggio's dramatic chiaroscuro changed Western art forever.",
      category: 'cultural',
      priceLevel: 0,
      duration: '15-20 min',
      orderIndex: 3,
    },
    {
      destinationId: UFFIZI_ID,
      title: "Titian's Venus of Urbino",
      description: "One of the most provocative paintings of the Renaissance (1534). A reclining nude gazing directly at the viewer — Mark Twain called it 'the foulest, the vilest, the obscenest picture the world possesses.' Room 83. Secret tip: look for Titian's hidden self-portrait in the small canvas nearby (The Workman Carrying a Bucket).",
      category: 'cultural',
      priceLevel: 0,
      duration: '10-15 min',
      orderIndex: 4,
    },
    {
      destinationId: UFFIZI_ID,
      title: "Raphael's Madonna of the Goldfinch",
      description: "A tender scene of the Virgin Mary with infant Jesus and young John the Baptist holding a goldfinch (symbol of Christ's future crucifixion). Painted in 1506, it was shattered into 17 pieces in a building collapse and painstakingly reassembled. Room 66. The soft sfumato technique shows Raphael's mastery.",
      category: 'cultural',
      priceLevel: 0,
      duration: '10-15 min',
      orderIndex: 5,
    },
    {
      destinationId: UFFIZI_ID,
      title: "Rooftop Terrace Café",
      description: "Don't miss the terrace on the 2nd floor! Grab an espresso or Aperol Spritz with a jaw-dropping view over Piazza della Signoria, the Palazzo Vecchio tower, and across Florence's rooftops. Perfect mid-museum break. The café is inside security — no re-entry needed.",
      category: 'food',
      priceLevel: 2,
      duration: '15-30 min',
      orderIndex: 6,
    },
    {
      destinationId: UFFIZI_ID,
      title: "Vasari Corridor",
      description: "A 1km elevated enclosed passageway connecting the Uffizi to Pitti Palace across the Arno via Ponte Vecchio. Built in 1565 so the Medici could commute without mixing with commoners. Recently reopened to the public after years of restoration. Book separately — limited capacity. One of Florence's most unique experiences.",
      category: 'activity',
      websiteUrl: 'https://www.uffizi.it/en/vasari-corridor',
      priceLevel: 2,
      duration: '30-45 min',
      orderIndex: 7,
    },
    {
      destinationId: UFFIZI_ID,
      title: "Giotto's Ognissanti Madonna (Room 2)",
      description: "The starting point of the chronological journey. Giotto's monumental altarpiece (c. 1310) hangs alongside similar works by Cimabue and Duccio — you can literally SEE the moment medieval art evolved into the Renaissance. The three-dimensional depth and human emotion in Giotto's version was revolutionary.",
      category: 'cultural',
      priceLevel: 0,
      duration: '10-15 min',
      orderIndex: 8,
    },
    {
      destinationId: UFFIZI_ID,
      title: "Eating Near the Uffizi",
      description: "Post-museum dining options: Trattoria Anita (5 min walk, classic Tuscan, €€), Osteria Vini e Vecchi Sapori (near Palazzo Vecchio, tiny & authentic), All'Antico Vinaio (legendary panini, always a queue but worth it — the schiacciata is insane). Avoid tourist traps directly on Piazza della Signoria. Walk 2 blocks for better food at half the price.",
      category: 'food',
      priceLevel: 1,
      duration: '1 hour',
      orderIndex: 9,
    },
  ];

  for (const highlight of highlights) {
    await db.insert(schema.destinationHighlights).values(highlight);
  }
  console.log(`✅ Added ${highlights.length} highlights`);

  // Update trip destination status
  await db.update(schema.tripDestinations)
    .set({
      researchStatus: 'fully_researched',
      lastResearchedAt: new Date(),
    })
    .where(eq(schema.tripDestinations.id, UFFIZI_ID));
  console.log('✅ Updated trip destination status to fully_researched');

  console.log('\n🎨 Uffizi Gallery research complete!');
  await client.end();
  process.exit(0);
}

seedUffiziComplete().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
