import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { weightEntries } from '../db/schema';
import { desc, eq } from 'drizzle-orm';

// ── Schemas ────────────────────────────────────────────

const createWeightSchema = z.object({
  date: z.string().min(1),
  weight: z.number().positive(),
  unit: z.string().default('lbs'),
  bodyFatPct: z.number().optional(),
  muscleMassPct: z.number().optional(),
  waterPct: z.number().optional(),
  notes: z.string().optional(),
});

const updateWeightSchema = createWeightSchema.partial().extend({
  id: z.string().min(1),
});

// ── Server Functions ───────────────────────────────────

export const getWeightEntries = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ limit: z.number().default(90) }).optional())
  .handler(async ({ data }) => {
    const limit = data?.limit ?? 90;
    return db.select().from(weightEntries).orderBy(desc(weightEntries.date)).limit(limit);
  });

export const getWeightEntry = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data: { id } }) => {
    const [entry] = await db.select().from(weightEntries).where(eq(weightEntries.id, id));
    if (!entry) throw new Error('Weight entry not found');
    return entry;
  });

export const createWeightEntry = createServerFn({ method: 'POST' })
  .inputValidator(createWeightSchema)
  .handler(async ({ data }) => {
    const [entry] = await db.insert(weightEntries).values(data).returning();
    return entry;
  });

export const updateWeightEntry = createServerFn({ method: 'POST' })
  .inputValidator(updateWeightSchema)
  .handler(async ({ data: { id, ...values } }) => {
    const [updated] = await db.update(weightEntries).set(values).where(eq(weightEntries.id, id)).returning();
    if (!updated) throw new Error('Weight entry not found');
    return updated;
  });

export const deleteWeightEntry = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data: { id } }) => {
    await db.delete(weightEntries).where(eq(weightEntries.id, id));
    return { ok: true };
  });
