import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db } from '../db';
import { workouts, workoutExercises } from '../db/schema';
import { desc, eq, and } from 'drizzle-orm';

// ── Schemas ────────────────────────────────────────────

const exerciseSchema = z.object({
  name: z.string().min(1),
  orderIndex: z.number().optional(),
  sets: z.number().optional(),
  reps: z.number().optional(),
  weight: z.number().optional(),
  durationSeconds: z.number().optional(),
  distanceMiles: z.number().optional(),
  notes: z.string().optional(),
});

const createWorkoutSchema = z.object({
  date: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['strength', 'cardio', 'flexibility', 'hiit', 'sport', 'other']).default('strength'),
  durationMinutes: z.number().optional(),
  caloriesBurned: z.number().optional(),
  notes: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  completed: z.boolean().default(true),
  exercises: z.array(exerciseSchema).optional(),
});

const updateWorkoutSchema = createWorkoutSchema.partial().extend({
  id: z.string().min(1),
});

// ── Server Functions ───────────────────────────────────

export const getWorkouts = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ limit: z.number().default(50) }).optional())
  .handler(async ({ data }) => {
    const limit = data?.limit ?? 50;
    return db.select().from(workouts).orderBy(desc(workouts.date)).limit(limit);
  });

export const getWorkout = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data: { id } }) => {
    const [workout] = await db.select().from(workouts).where(eq(workouts.id, id));
    if (!workout) throw new Error('Workout not found');
    const exercises = await db
      .select()
      .from(workoutExercises)
      .where(eq(workoutExercises.workoutId, id))
      .orderBy(workoutExercises.orderIndex);
    return { ...workout, exercises };
  });

export const createWorkout = createServerFn({ method: 'POST' })
  .inputValidator(createWorkoutSchema)
  .handler(async ({ data: { exercises, ...workoutData } }) => {
    const [workout] = await db.insert(workouts).values(workoutData).returning();

    if (exercises?.length) {
      await db.insert(workoutExercises).values(
        exercises.map((ex, i) => ({
          workoutId: workout.id,
          ...ex,
          orderIndex: ex.orderIndex ?? i,
        })),
      );
    }

    return workout;
  });

export const updateWorkout = createServerFn({ method: 'POST' })
  .inputValidator(updateWorkoutSchema)
  .handler(async ({ data: { id, exercises, ...values } }) => {
    const [updated] = await db.update(workouts).set(values).where(eq(workouts.id, id)).returning();
    if (!updated) throw new Error('Workout not found');

    if (exercises) {
      await db.delete(workoutExercises).where(eq(workoutExercises.workoutId, id));
      if (exercises.length) {
        await db.insert(workoutExercises).values(
          exercises.map((ex, i) => ({
            workoutId: id,
            ...ex,
            orderIndex: ex.orderIndex ?? i,
          })),
        );
      }
    }

    return updated;
  });

export const deleteWorkout = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data: { id } }) => {
    await db.delete(workouts).where(eq(workouts.id, id));
    return { ok: true };
  });

// ── Exercise Sub-resource ──────────────────────────────

export const getWorkoutExercises = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ workoutId: z.string().min(1) }))
  .handler(async ({ data: { workoutId } }) => {
    return db
      .select()
      .from(workoutExercises)
      .where(eq(workoutExercises.workoutId, workoutId))
      .orderBy(workoutExercises.orderIndex);
  });

export const createWorkoutExercise = createServerFn({ method: 'POST' })
  .inputValidator(exerciseSchema.extend({ workoutId: z.string().min(1) }))
  .handler(async ({ data: { workoutId, ...exerciseData } }) => {
    const [exercise] = await db
      .insert(workoutExercises)
      .values({ workoutId, ...exerciseData })
      .returning();
    return exercise;
  });

export const updateWorkoutExercise = createServerFn({ method: 'POST' })
  .inputValidator(exerciseSchema.partial().extend({ id: z.string().min(1), workoutId: z.string().min(1) }))
  .handler(async ({ data: { id, workoutId, ...values } }) => {
    const [updated] = await db
      .update(workoutExercises)
      .set(values)
      .where(and(eq(workoutExercises.id, id), eq(workoutExercises.workoutId, workoutId)))
      .returning();
    if (!updated) throw new Error('Exercise not found');
    return updated;
  });

export const deleteWorkoutExercise = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1), workoutId: z.string().min(1) }))
  .handler(async ({ data: { id, workoutId } }) => {
    await db
      .delete(workoutExercises)
      .where(and(eq(workoutExercises.id, id), eq(workoutExercises.workoutId, workoutId)));
    return { ok: true };
  });
