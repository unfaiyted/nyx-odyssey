import { json, createAPIFileRoute } from '@tanstack/react-start/api';
import { db } from '../../db';
import { workouts, workoutExercises } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const APIRoute = createAPIFileRoute('/api/workouts/$id')({
  GET: async ({ params }) => {
    const [workout] = await db.select().from(workouts).where(eq(workouts.id, params.id));
    if (!workout) return json({ error: 'Not found' }, { status: 404 });
    const exercises = await db.select().from(workoutExercises)
      .where(eq(workoutExercises.workoutId, params.id));
    return json({ ...workout, exercises });
  },
  PUT: async ({ request, params }) => {
    const body = await request.json();
    const { exercises, ...workoutData } = body;
    const [updated] = await db.update(workouts).set(workoutData)
      .where(eq(workouts.id, params.id)).returning();
    if (!updated) return json({ error: 'Not found' }, { status: 404 });

    if (exercises) {
      await db.delete(workoutExercises).where(eq(workoutExercises.workoutId, params.id));
      if (exercises.length) {
        await db.insert(workoutExercises).values(
          exercises.map((ex: any, i: number) => ({
            workoutId: params.id,
            name: ex.name,
            orderIndex: ex.orderIndex ?? i,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            durationSeconds: ex.durationSeconds,
            distanceMiles: ex.distanceMiles,
            notes: ex.notes,
          }))
        );
      }
    }

    return json(updated);
  },
  DELETE: async ({ params }) => {
    await db.delete(workouts).where(eq(workouts.id, params.id));
    return json({ ok: true });
  },
});
