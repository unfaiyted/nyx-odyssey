import { json, createAPIFileRoute } from '@tanstack/react-start/api';
import { db } from '../../db';
import { nutritionEntries } from '../../db/schema';
import { desc, eq } from 'drizzle-orm';

export const APIRoute = createAPIFileRoute('/api/nutrition')({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const date = url.searchParams.get('date');
    let query = db.select().from(nutritionEntries);
    if (date) {
      const entries = await query.where(eq(nutritionEntries.date, date))
        .orderBy(desc(nutritionEntries.createdAt));
      return json(entries);
    }
    const entries = await query.orderBy(desc(nutritionEntries.date)).limit(limit);
    return json(entries);
  },
  POST: async ({ request }) => {
    const body = await request.json();
    const [entry] = await db.insert(nutritionEntries).values({
      date: body.date,
      mealType: body.mealType || 'meal',
      name: body.name,
      calories: body.calories,
      protein: body.protein,
      carbs: body.carbs,
      fat: body.fat,
      fiber: body.fiber,
      sugar: body.sugar,
      sodium: body.sodium,
      servingSize: body.servingSize,
      servings: body.servings || 1,
      notes: body.notes,
    }).returning();
    return json(entry, { status: 201 });
  },
});
