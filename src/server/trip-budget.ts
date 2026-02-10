import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { budgetItems, budgetCategories } from '../db/schema';
import { eq, and } from 'drizzle-orm';

// ── Budget Items ───────────────────────────────────────

const createBudgetItemSchema = z.object({
  tripId: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  estimatedCost: z.string().optional(),
  actualCost: z.string().optional(),
  paid: z.boolean().default(false),
  date: z.string().optional(),
});

const updateBudgetItemSchema = createBudgetItemSchema.partial().extend({
  id: z.string().min(1),
  tripId: z.string().min(1),
});

export const getTripBudgetItems = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ tripId: z.string().min(1) }))
  .handler(async ({ data: { tripId } }) => {
    return db.select().from(budgetItems).where(eq(budgetItems.tripId, tripId));
  });

export const createBudgetItem = createServerFn({ method: 'POST' })
  .inputValidator(createBudgetItemSchema)
  .handler(async ({ data }) => {
    const [item] = await db.insert(budgetItems).values(data).returning();
    return item;
  });

export const updateBudgetItem = createServerFn({ method: 'POST' })
  .inputValidator(updateBudgetItemSchema)
  .handler(async ({ data: { id, tripId, ...values } }) => {
    const [updated] = await db.update(budgetItems).set(values)
      .where(and(eq(budgetItems.id, id), eq(budgetItems.tripId, tripId)))
      .returning();
    if (!updated) throw new Error('Budget item not found');
    return updated;
  });

export const deleteBudgetItem = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1), tripId: z.string().min(1) }))
  .handler(async ({ data: { id, tripId } }) => {
    await db.delete(budgetItems).where(and(eq(budgetItems.id, id), eq(budgetItems.tripId, tripId)));
    return { ok: true };
  });

// ── Budget Categories ──────────────────────────────────

const createBudgetCategorySchema = z.object({
  tripId: z.string().min(1),
  category: z.string().min(1),
  allocatedBudget: z.string().default('0'),
  color: z.string().optional(),
  icon: z.string().optional(),
});

const updateBudgetCategorySchema = createBudgetCategorySchema.partial().extend({
  id: z.string().min(1),
  tripId: z.string().min(1),
});

export const getTripBudgetCategories = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ tripId: z.string().min(1) }))
  .handler(async ({ data: { tripId } }) => {
    return db.select().from(budgetCategories).where(eq(budgetCategories.tripId, tripId));
  });

export const createBudgetCategory = createServerFn({ method: 'POST' })
  .inputValidator(createBudgetCategorySchema)
  .handler(async ({ data }) => {
    const [item] = await db.insert(budgetCategories).values(data).returning();
    return item;
  });

export const updateBudgetCategory = createServerFn({ method: 'POST' })
  .inputValidator(updateBudgetCategorySchema)
  .handler(async ({ data: { id, tripId, ...values } }) => {
    const [updated] = await db.update(budgetCategories).set(values)
      .where(and(eq(budgetCategories.id, id), eq(budgetCategories.tripId, tripId)))
      .returning();
    if (!updated) throw new Error('Budget category not found');
    return updated;
  });

export const deleteBudgetCategory = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1), tripId: z.string().min(1) }))
  .handler(async ({ data: { id, tripId } }) => {
    await db.delete(budgetCategories)
      .where(and(eq(budgetCategories.id, id), eq(budgetCategories.tripId, tripId)));
    return { ok: true };
  });
