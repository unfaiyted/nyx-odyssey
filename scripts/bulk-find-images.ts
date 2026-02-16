import postgres from 'postgres';

const sql = postgres('postgresql://postgres:postgres@localhost:5432/odyssey');
const IRIS_URL = 'http://localhost:3007';

async function searchImages(query: string, limit = 8): Promise<{ url: string; score: number }[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(`${IRIS_URL}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await res.json();
    return (data.images || []).map((img: any) => ({
      url: img.url || img.img_src,
      score: img.score || 0.5,
    }));
  } catch (e) {
    console.error(`  Search failed for "${query}":`, (e as Error).message);
    return [];
  }
}

async function extractImages(url: string): Promise<{ url: string; score: number }[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(`${IRIS_URL}/api/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await res.json();
    return (data.images || []).map((img: any) => ({
      url: img.url,
      score: img.score || 0.3,
    }));
  } catch {
    return [];
  }
}

async function findBestImage(query: string, extractUrl?: string | null): Promise<string | null> {
  const results: { url: string; score: number }[] = [];
  
  const promises: Promise<void>[] = [
    searchImages(query).then(imgs => results.push(...imgs)),
  ];
  if (extractUrl) {
    promises.push(extractImages(extractUrl).then(imgs => results.push(...imgs)));
  }
  await Promise.allSettled(promises);

  if (results.length === 0) return null;
  results.sort((a, b) => b.score - a.score);
  return results[0].url;
}

async function main() {
  const destId = 'Uz6JyIvdeg0h8bPYe8y7R'; // Vegas
  const tripId = '2el8do_u2fmjxf5DU9bf1';

  // 1. Highlights without images
  const highlights = await sql`
    SELECT h.id, h.title, h.category, h.website_url, d.name as dest_name
    FROM destination_highlights h
    JOIN trip_destinations d ON d.id = h.destination_id
    WHERE h.destination_id = ${destId} AND h.image_url IS NULL
  `;
  console.log(`\n🎯 ${highlights.length} highlights need images`);
  for (const h of highlights) {
    const query = `${h.title} Las Vegas`;
    console.log(`  Finding image for: ${h.title}`);
    const url = await findBestImage(query, h.website_url);
    if (url) {
      await sql`UPDATE destination_highlights SET image_url = ${url} WHERE id = ${h.id}`;
      console.log(`    ✅ Set image`);
    } else {
      console.log(`    ❌ No image found`);
    }
    await new Promise(r => setTimeout(r, 500)); // rate limit
  }

  // 2. Events without images
  const events = await sql`
    SELECT e.id, e.name, e.venue, e.event_type, e.booking_url, d.name as dest_name
    FROM destination_events e
    JOIN trip_destinations d ON d.id = e.destination_id
    WHERE e.destination_id = ${destId} AND e.image_url IS NULL
  `;
  console.log(`\n🎫 ${events.length} events need images`);
  for (const e of events) {
    const query = [e.name, e.venue, 'Las Vegas'].filter(Boolean).join(' ');
    console.log(`  Finding image for: ${e.name}`);
    const url = await findBestImage(query, e.booking_url);
    if (url) {
      await sql`UPDATE destination_events SET image_url = ${url} WHERE id = ${e.id}`;
      console.log(`    ✅ Set image`);
    } else {
      console.log(`    ❌ No image found`);
    }
    await new Promise(r => setTimeout(r, 500));
  }

  // 3. Accommodations without images
  const accoms = await sql`
    SELECT id, name, type, address, booking_url
    FROM accommodations
    WHERE trip_id = ${tripId} AND image_url IS NULL
  `;
  console.log(`\n🏨 ${accoms.length} accommodations need images`);
  for (const a of accoms) {
    const query = `${a.name} hotel Las Vegas exterior`;
    console.log(`  Finding image for: ${a.name}`);
    const url = await findBestImage(query, a.booking_url);
    if (url) {
      await sql`UPDATE accommodations SET image_url = ${url} WHERE id = ${a.id}`;
      console.log(`    ✅ Set image`);
    } else {
      console.log(`    ❌ No image found`);
    }
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n✅ Done!');
  await sql.end();
}

main().catch(console.error);
