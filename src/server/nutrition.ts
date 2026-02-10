import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { nutritionEntries } from '../db/schema';
import { desc, eq } from 'drizzle-orm';

// ── Schemas ────────────────────────────────────────────

const createNutritionSchema = z.object({
  date: z.string().min(1),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'meal']).default('meal'),
  name: z.string().min(1),
  calories: z.number().optional(),
  protein: z.number().optional(),
  carbs: z.number().optional(),
  fat: z.number().optional(),
  fiber: z.number().optional(),
  sugar: z.number().optional(),
  sodium: z.number().optional(),
  servingSize: z.string().optional(),
  servings: z.number().default(1),
  notes: z.string().optional(),
});

const updateNutritionSchema = createNutritionSchema.partial().extend({
  id: z.string().min(1),
});

// ── Server Functions ───────────────────────────────────

export const getNutritionEntries = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ limit: z.number().default(100), date: z.string().optional() }).optional())
  .handler(async ({ data }) => {
    const limit = data?.limit ?? 100;
    const date = data?.date;

    if (date) {
      return db
        .select()
        .from(nutritionEntries)
        .where(eq(nutritionEntries.date, date))
        .orderBy(desc(nutritionEntries.createdAt));
    }

    return db.select().from(nutritionEntries).orderBy(desc(nutritionEntries.date)).limit(limit);
  });

export const getNutritionEntry = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data: { id } }) => {
    const [entry] = await db.select().from(nutritionEntries).where(eq(nutritionEntries.id, id));
    if (!entry) throw new Error('Nutrition entry not found');
    return entry;
  });

export const createNutritionEntry = createServerFn({ method: 'POST' })
  .inputValidator(createNutritionSchema)
  .handler(async ({ data }) => {
    const [entry] = await db.insert(nutritionEntries).values(data).returning();
    return entry;
  });

export const updateNutritionEntry = createServerFn({ method: 'POST' })
  .inputValidator(updateNutritionSchema)
  .handler(async ({ data: { id, ...values } }) => {
    const [updated] = await db
      .update(nutritionEntries)
      .set(values)
      .where(eq(nutritionEntries.id, id))
      .returning();
    if (!updated) throw new Error('Nutrition entry not found');
    return updated;
  });

export const deleteNutritionEntry = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data: { id } }) => {
    await db.delete(nutritionEntries).where(eq(nutritionEntries.id, id));
    return { ok: true };
  });
