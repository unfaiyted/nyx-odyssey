#!/usr/bin/env bun
const SEARXNG = 'https://search.faiyts.casa';
const DB_URL = 'postgresql://postgres:postgres@localhost:5432/odyssey';
const tripId = process.argv[2] || 'LMp0E_5U2QFsNL-MoGDHh';

const { Client } = await import('pg');
const client = new Client(DB_URL);
await client.connect();

const { rows: events } = await client.query(`
  SELECT de.id, de.name, td.name as dest_name
  FROM destination_events de
  JOIN trip_destinations td ON td.id = de.destination_id
  WHERE td.trip_id = $1 AND de.image_url IS NULL
  ORDER BY td.name, de.name
`, [tripId]);

console.log(`🎭 ${events.length} events need images\n`);

let ok = 0, fail = 0;
for (const e of events) {
  process.stdout.write(`  ${e.name} (${e.dest_name}) `);
  try {
    const q = `${e.name} ${e.dest_name}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(`${SEARXNG}/search?q=${encodeURIComponent(q)}&categories=images&format=json`, { signal: controller.signal });
    clearTimeout(timer);
    const data = await res.json();
    const img = (data.results || []).find((r: any) => r.img_src && !r.img_src.endsWith('.svg'));
    if (img?.img_src) {
      await client.query('UPDATE destination_events SET image_url = $1 WHERE id = $2', [img.img_src, e.id]);
      console.log('✅');
      ok++;
    } else {
      console.log('❌');
      fail++;
    }
  } catch (err: any) {
    console.log(`❌ ${err.message?.slice(0, 40)}`);
    fail++;
  }
  await new Promise(r => setTimeout(r, 1000));
}

console.log(`\nDone: ✅ ${ok} | ❌ ${fail}`);
await client.end();
