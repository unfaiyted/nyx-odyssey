#!/usr/bin/env bun
const SEARXNG = 'https://search.faiyts.casa';
const DB_URL = 'postgresql://postgres:postgres@localhost:5432/odyssey';
const tripId = process.argv[2] || 'LMp0E_5U2QFsNL-MoGDHh';

const { Client } = await import('pg');
const client = new Client(DB_URL);
await client.connect();

const { rows } = await client.query(`
  SELECT a.id, a.name, td.name as dest_name
  FROM accommodations a
  JOIN trip_destinations td ON td.id = a.destination_id
  WHERE a.trip_id = $1 AND a.image_url IS NULL
  ORDER BY td.name, a.name
`, [tripId]);

console.log(`🏨 ${rows.length} accommodations need images\n`);

function isGoodUrl(url: string): boolean {
  if (!url) return false;
  if (url.endsWith('.svg') || url.includes('favicon') || url.includes('devicon') || url.includes('lucide')) return false;
  if (url.includes('/icon') && url.length < 80) return false;
  return true;
}

let ok = 0, fail = 0;
for (const acc of rows) {
  process.stdout.write(`  ${acc.name} (${acc.dest_name}) `);
  try {
    // Clean the name for better search (remove parenthetical notes)
    const cleanName = acc.name.replace(/\s*\(.*?\)\s*/g, ' ').trim();
    const query = `${cleanName} ${acc.dest_name} Italy hotel`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${SEARXNG}/search?q=${encodeURIComponent(query)}&categories=images&format=json`, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) { console.log(`❌ ${res.status}`); fail++; continue; }
    const data = await res.json();
    const img = (data.results || []).find((r: any) => {
      const u = r.img_src || '';
      return u && isGoodUrl(u);
    });
    if (img?.img_src) {
      await client.query('UPDATE accommodations SET image_url = $1 WHERE id = $2', [img.img_src, acc.id]);
      console.log('✅');
      ok++;
    } else { console.log('❌'); fail++; }
  } catch (err: any) {
    console.log(`❌ ${err.message?.slice(0, 40)}`);
    fail++;
  }
  await new Promise(r => setTimeout(r, 1000));
}

console.log(`\nDone: ✅ ${ok} | ❌ ${fail}`);
await client.end();
