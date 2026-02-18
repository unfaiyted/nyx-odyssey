#!/usr/bin/env bun
/**
 * Fix Vegas trip images by re-fetching through Iris API
 * Replaces raw SearXNG URLs with proper images from Iris search
 */

import postgres from 'postgres';

const sql = postgres('postgresql://postgres:postgres@localhost:5432/odyssey');
const IRIS_URL = 'http://localhost:3007';
const DEST_ID = 'Uz6JyIvdeg0h8bPYe8y7R';
const TRIP_ID = '2el8do_u2fmjxf5DU9bf1';

async function searchImage(query: string): Promise<string | null> {
  try {
    const res = await fetch(`${IRIS_URL}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Find best image - prefer ones with thumbnailUrl (means they're real search results)
    const good = data.images?.filter((img: any) => 
      img.url && 
      img.thumbnailUrl && 
      !img.url.includes('lucide') && 
      !img.url.includes('devicon') &&
      !img.url.includes('artic.edu') &&
      (img.url.startsWith('http://') || img.url.startsWith('https://'))
    );
    return good?.[0]?.url || data.images?.[0]?.url || null;
  } catch (e) {
    console.error(`  ❌ Iris search failed for "${query}":`, (e as Error).message);
    return null;
  }
}

async function fixEvents() {
  const events = await sql`
    SELECT id, name, image_url FROM destination_events 
    WHERE destination_id = ${DEST_ID} 
    ORDER BY created_at DESC
  `;
  
  console.log(`\n🎭 Fixing ${events.length} event images...\n`);
  let fixed = 0, failed = 0;
  
  for (const ev of events) {
    const query = `${ev.name} Las Vegas`;
    const imageUrl = await searchImage(query);
    if (imageUrl) {
      await sql`UPDATE destination_events SET image_url = ${imageUrl} WHERE id = ${ev.id}`;
      console.log(`  ✅ ${ev.name}`);
      fixed++;
    } else {
      console.log(`  ❌ ${ev.name} — no image found`);
      failed++;
    }
    await new Promise(r => setTimeout(r, 500)); // rate limit
  }
  console.log(`\n  Events: ✅ ${fixed} | ❌ ${failed}`);
}

async function fixAccommodations() {
  const accoms = await sql`
    SELECT id, name, image_url FROM accommodations 
    WHERE trip_id = ${TRIP_ID}
    ORDER BY created_at DESC
  `;
  
  console.log(`\n🏨 Fixing ${accoms.length} accommodation images...\n`);
  let fixed = 0, failed = 0;
  
  for (const a of accoms) {
    const query = `${a.name} hotel Las Vegas exterior`;
    const imageUrl = await searchImage(query);
    if (imageUrl) {
      await sql`UPDATE accommodations SET image_url = ${imageUrl} WHERE id = ${a.id}`;
      console.log(`  ✅ ${a.name}`);
      fixed++;
    } else {
      console.log(`  ❌ ${a.name} — no image found`);
      failed++;
    }
    await new Promise(r => setTimeout(r, 500));
  }
  console.log(`\n  Accommodations: ✅ ${fixed} | ❌ ${failed}`);
}

async function fixHighlights() {
  const highlights = await sql`
    SELECT id, title, category, image_url FROM destination_highlights 
    WHERE destination_id = ${DEST_ID}
    ORDER BY order_index
  `;
  
  console.log(`\n🎯 Fixing ${highlights.length} highlight images...\n`);
  let fixed = 0, failed = 0;
  
  for (const h of highlights) {
    const suffix = h.category === 'food' ? 'restaurant' : 'Las Vegas';
    const query = `${h.title} ${suffix}`;
    const imageUrl = await searchImage(query);
    if (imageUrl) {
      await sql`UPDATE destination_highlights SET image_url = ${imageUrl} WHERE id = ${h.id}`;
      console.log(`  ✅ ${h.title}`);
      fixed++;
    } else {
      console.log(`  ❌ ${h.title} — no image found`);
      failed++;
    }
    await new Promise(r => setTimeout(r, 500));
  }
  console.log(`\n  Highlights: ✅ ${fixed} | ❌ ${failed}`);
}

async function main() {
  console.log('🔧 Fixing Vegas trip images via Iris API...\n');
  await fixEvents();
  await fixAccommodations();
  await fixHighlights();
  console.log('\n✅ Done!');
  await sql.end();
}

main().catch(console.error);
