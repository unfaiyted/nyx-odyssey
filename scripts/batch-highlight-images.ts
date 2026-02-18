#!/usr/bin/env bun
/**
 * Batch find images for highlights using SearXNG directly
 * Usage: bun scripts/batch-highlight-images.ts <destination-id>
 */

const SEARXNG_URL = 'https://search.faiyts.casa';
const DB_URL = 'postgresql://postgres:postgres@localhost:5432/odyssey';

const destinationId = process.argv[2];
if (!destinationId) {
  console.error('Usage: bun scripts/batch-highlight-images.ts <destination-id>');
  process.exit(1);
}

const { Client } = await import('pg');
const client = new Client(DB_URL);
await client.connect();

const destResult = await client.query('SELECT name FROM trip_destinations WHERE id = $1', [destinationId]);
const destName = destResult.rows[0]?.name || '';
console.log(`🎯 ${destName}`);

const result = await client.query(
  'SELECT id, title, image_url FROM destination_highlights WHERE destination_id = $1 ORDER BY order_index',
  [destinationId]
);

const highlights = result.rows;
const needImages = highlights.filter(h => !h.image_url || h.image_url.includes('unsplash.com'));
console.log(`🖼️  ${needImages.length}/${highlights.length} need images`);

function isGoodUrl(url: string): boolean {
  if (!url) return false;
  if (url.endsWith('.svg') || url.includes('favicon') || url.includes('devicon') || url.includes('lucide')) return false;
  if (url.includes('/icon') && url.length < 80) return false;
  return true;
}

async function searchImages(query: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const url = `${SEARXNG_URL}/search?q=${encodeURIComponent(query)}&categories=images&format=json&engines=google_images,bing_images`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    const results = (data.results || []) as any[];
    for (const r of results) {
      const imgUrl = r.img_src || r.url;
      if (imgUrl && isGoodUrl(imgUrl)) return imgUrl;
    }
    return null;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

let updated = 0, failed = 0;

for (const h of needImages) {
  process.stdout.write(`  ${h.title} `);
  
  const imageUrl = await searchImages(`${h.title} ${destName}`);
  
  if (imageUrl) {
    await client.query('UPDATE destination_highlights SET image_url = $1 WHERE id = $2', [imageUrl, h.id]);
    console.log(`✅`);
    updated++;
  } else {
    console.log(`❌`);
    failed++;
  }
  
  await new Promise(r => setTimeout(r, 800));
}

console.log(`Done: ✅ ${updated} | ❌ ${failed}`);
await client.end();
