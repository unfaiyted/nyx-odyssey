import { json, createAPIFileRoute } from '@tanstack/react-start/api';
import { db } from '../../db';
import { weightEntries } from '../../db/schema';
import { desc, eq } from 'drizzle-orm';

export const APIRoute = createAPIFileRoute('/api/weight')({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '90');
    const entries = await db.select().from(weightEntries)
      .orderBy(desc(weightEntries.date))
      .limit(limit);
    return json(entries);
  },
  POST: async ({ request }) => {
    const body = await request.json();
    const [entry] = await db.insert(weightEntries).values({
      date: body.date,
      weight: body.weight,
      unit: body.unit || 'lbs',
      bodyFatPct: body.bodyFatPct,
      muscleMassPct: body.muscleMassPct,
      waterPct: body.waterPct,
      notes: body.notes,
    }).returning();
    return json(entry, { status: 201 });
  },
});
