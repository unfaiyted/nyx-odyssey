import { db } from '../src/db';
import { 
  tripDestinations, 
  destinationResearch, 
  destinationHighlights,
  itineraryItems,
  accommodations,
  tripRoutes,
  tripRecommendations,
  destinationEvents
} from '../src/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

async function migrate() {
  console.log('=== Merging Duplicate Destinations into Parents ===\n');

  // IDs from the issue
  const teatroOlimpicoId = 'jpFDaIrXUiNkjL1vEWDyL';
  const proseccoHillsId = 'BLb6wLWIIAXKgQ8SM7kYK';
  const vicenzaId = 'rrtTb8XZ0fMIgEIAxQ_sL';
  const valdobbiadeneId = 'l3Upuk_Osw--cDw5MfImC';
  const tripId = 'LMp0E_5U2QFsNL-MoGDHh';

  // ============================================================================
  // PART 1: Merge Teatro Olimpico into Vicenza
  // ============================================================================
  console.log('--- Part 1: Merging Teatro Olimpico into Vicenza ---\n');

  // 1.1 Get the duplicate destination data
  const teatroDest = await db.select().from(tripDestinations)
    .where(eq(tripDestinations.id, teatroOlimpicoId));
  
  if (teatroDest.length === 0) {
    console.log('Teatro Olimpico destination not found, skipping...');
  } else {
    const teatro = teatroDest[0];
    console.log(`Found: ${teatro.name}`);

    // 1.2 Get research data
    const teatroResearch = await db.select().from(destinationResearch)
      .where(eq(destinationResearch.destinationId, teatroOlimpicoId));
    
    // 1.3 Check if Vicenza already has a Teatro Olimpico highlight
    const vicenzaHighlights = await db.select().from(destinationHighlights)
      .where(eq(destinationHighlights.destinationId, vicenzaId));
    
    const existingTeatroHighlight = vicenzaHighlights.find(h => 
      h.title.toLowerCase().includes('teatro') && 
      h.title.toLowerCase().includes('olimpico')
    );

    if (existingTeatroHighlight) {
      console.log(`Found existing Teatro Olimpico highlight [${existingTeatroHighlight.id}]`);
      
      // Merge the duplicate's highlights into the existing highlight's description
      const duplicateHighlights = await db.select().from(destinationHighlights)
        .where(eq(destinationHighlights.destinationId, teatroOlimpicoId));
      
      // Build enhanced description from duplicate's highlights (they're actually bullet points)
      const bulletPoints = duplicateHighlights
        .filter(h => h.category === 'attraction' && h.title.startsWith('**'))
        .map(h => h.title.replace(/\*\*/g, '').trim());
      
      let enhancedDescription = existingTeatroHighlight.description || '';
      if (teatroResearch.length > 0) {
        const r = teatroResearch[0];
        if (r.summary && r.summary !== teatro.description) {
          enhancedDescription = r.summary;
        }
      }
      
      // Add bullet points if we have them
      if (bulletPoints.length > 0) {
        enhancedDescription += '\n\n**Why it\'s special:**\n' + bulletPoints.map(p => `• ${p}`).join('\n');
      }

      // Update the existing highlight with enhanced description and photo
      await db.update(destinationHighlights)
        .set({
          description: enhancedDescription.trim(),
          imageUrl: teatro.photoUrl || existingTeatroHighlight.imageUrl,
          rating: 4.9, // High rating for this UNESCO site
        })
        .where(eq(destinationHighlights.id, existingTeatroHighlight.id));
      
      console.log(`  Updated highlight [${existingTeatroHighlight.id}] with merged data`);
      
      // Merge research data into Vicenza's research
      if (teatroResearch.length > 0) {
        const vicenzaResearch = await db.select().from(destinationResearch)
          .where(eq(destinationResearch.destinationId, vicenzaId));
        
        if (vicenzaResearch.length > 0) {
          const vr = vicenzaResearch[0];
          const tr = teatroResearch[0];
          
          // Append Teatro-specific transport notes to Vicenza's transport notes
          const mergedTransportNotes = vr.transportNotes 
            ? `${vr.transportNotes}\n\n--- Teatro Olimpico ---\n${tr.transportNotes}`
            : tr.transportNotes;
          
          // Parse and merge travel tips
          let existingTips: string[] = [];
          try {
            if (vr.travelTips) existingTips = JSON.parse(vr.travelTips);
          } catch {}
          
          let newTips: string[] = [];
          try {
            if (tr.travelTips) newTips = JSON.parse(tr.travelTips);
          } catch {}
          
          const mergedTips = [...existingTips, ...newTips.filter(t => !existingTips.includes(t))];
          
          await db.update(destinationResearch)
            .set({
              transportNotes: mergedTransportNotes,
              travelTips: JSON.stringify(mergedTips),
            })
            .where(eq(destinationResearch.id, vr.id));
          
          console.log(`  Merged research data into Vicenza's research [${vr.id}]`);
        }
      }
    } else {
      // Create a new highlight for Teatro Olimpico
      console.log('No existing Teatro Olimpico highlight found, creating new one...');
      
      const newHighlight = {
        id: nanoid(),
        destinationId: vicenzaId,
        title: 'Teatro Olimpico',
        description: teatro.description || '',
        category: 'attraction',
        rating: 4.9,
        imageUrl: teatro.photoUrl,
        orderIndex: 0,
      };
      
      await db.insert(destinationHighlights).values(newHighlight);
      console.log(`  Created new highlight [${newHighlight.id}]`);
    }

    // 1.4 Delete duplicate's highlights
    const deletedTeatroHighlights = await db.delete(destinationHighlights)
      .where(eq(destinationHighlights.destinationId, teatroOlimpicoId))
      .returning();
    console.log(`  Deleted ${deletedTeatroHighlights.length} duplicate highlights`);

    // 1.5 Delete duplicate's research
    if (teatroResearch.length > 0) {
      await db.delete(destinationResearch)
        .where(eq(destinationResearch.destinationId, teatroOlimpicoId));
      console.log(`  Deleted ${teatroResearch.length} duplicate research records`);
    }

    // 1.6 Delete the duplicate destination
    await db.delete(tripDestinations)
      .where(eq(tripDestinations.id, teatroOlimpicoId));
    console.log(`  Deleted duplicate destination [${teatroOlimpicoId}]`);
  }

  // ============================================================================
  // PART 2: Merge Prosecco Hills into Valdobbiadene & Prosecco Hills
  // ============================================================================
  console.log('\n--- Part 2: Merging Prosecco Hills into Valdobbiadene & Prosecco Hills ---\n');

  // 2.1 Get the duplicate destination data
  const proseccoDest = await db.select().from(tripDestinations)
    .where(eq(tripDestinations.id, proseccoHillsId));
  
  if (proseccoDest.length === 0) {
    console.log('Prosecco Hills destination not found, skipping...');
  } else {
    const prosecco = proseccoDest[0];
    console.log(`Found: ${prosecco.name}`);

    // 2.2 Get research data
    const proseccoResearch = await db.select().from(destinationResearch)
      .where(eq(destinationResearch.destinationId, proseccoHillsId));

    // 2.3 Create a new highlight for Prosecco Hills
    // Get max order index from parent
    const parentHighlights = await db.select().from(destinationHighlights)
      .where(eq(destinationHighlights.destinationId, valdobbiadeneId))
      .orderBy(destinationHighlights.orderIndex);
    
    const maxOrderIndex = parentHighlights.length > 0 
      ? Math.max(...parentHighlights.map(h => h.orderIndex || 0))
      : 0;

    let highlightDescription = prosecco.description || '';
    let travelTips: string[] = [];
    
    if (proseccoResearch.length > 0) {
      const r = proseccoResearch[0];
      
      // Use summary as base description if it's more detailed
      if (r.summary && r.summary.length > (prosecco.description?.length || 0)) {
        highlightDescription = r.summary;
      }
      
      // Parse travel tips
      try {
        if (r.travelTips) travelTips = JSON.parse(r.travelTips);
      } catch {}
      
      // Add travel tips as bullet points
      if (travelTips.length > 0) {
        highlightDescription += '\n\n**Why it\'s special:**\n' + travelTips.map(t => `• ${t.split('\n')[0]}`).join('\n');
      }
    }

    const newHighlight = {
      id: nanoid(),
      destinationId: valdobbiadeneId,
      title: 'The Prosecco Hills of Valdobbiadene',
      description: highlightDescription.trim(),
      category: 'attraction',
      rating: 4.8,
      imageUrl: prosecco.photoUrl,
      orderIndex: maxOrderIndex + 1,
      duration: 'Half day to full day',
    };
    
    await db.insert(destinationHighlights).values(newHighlight);
    console.log(`  Created new highlight [${newHighlight.id}]`);

    // 2.4 Merge research data into parent's research
    if (proseccoResearch.length > 0) {
      const valdobbiadeneResearch = await db.select().from(destinationResearch)
        .where(eq(destinationResearch.destinationId, valdobbiadeneId));
      
      if (valdobbiadeneResearch.length > 0) {
        const vr = valdobbiadeneResearch[0];
        const pr = proseccoResearch[0];
        
        // Append Prosecco-specific transport notes
        const mergedTransportNotes = vr.transportNotes 
          ? `${vr.transportNotes}\n\n--- Prosecco Hills Access ---\n${pr.transportNotes}`
          : pr.transportNotes;
        
        // Parse and merge travel tips
        let existingTips: string[] = [];
        try {
          if (vr.travelTips) existingTips = JSON.parse(vr.travelTips);
        } catch {}
        
        let newTips: string[] = [];
        try {
          if (pr.travelTips) newTips = JSON.parse(pr.travelTips);
        } catch {}
        
        const mergedTips = [...existingTips, ...newTips.filter(t => !existingTips.includes(t))];
        
        await db.update(destinationResearch)
          .set({
            transportNotes: mergedTransportNotes,
            travelTips: JSON.stringify(mergedTips),
          })
          .where(eq(destinationResearch.id, vr.id));
        
        console.log(`  Merged research data into Valdobbiadene's research [${vr.id}]`);
      }
    }

    // 2.5 Delete duplicate's highlights
    const deletedProseccoHighlights = await db.delete(destinationHighlights)
      .where(eq(destinationHighlights.destinationId, proseccoHillsId))
      .returning();
    console.log(`  Deleted ${deletedProseccoHighlights.length} duplicate highlights`);

    // 2.6 Delete duplicate's research
    if (proseccoResearch.length > 0) {
      await db.delete(destinationResearch)
        .where(eq(destinationResearch.destinationId, proseccoHillsId));
      console.log(`  Deleted ${proseccoResearch.length} duplicate research records`);
    }

    // 2.7 Delete the duplicate destination
    await db.delete(tripDestinations)
      .where(eq(tripDestinations.id, proseccoHillsId));
    console.log(`  Deleted duplicate destination [${proseccoHillsId}]`);
  }

  console.log('\n=== Migration Complete ===');
  process.exit(0);
}

migrate().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
