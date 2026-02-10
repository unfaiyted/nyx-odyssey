import { json, createAPIFileRoute } from '@tanstack/react-start/api';
import { db } from '../../db';
import { workoutExercises } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export const APIRoute = createAPIFileRoute('/api/workouts/$id/exercises')({
  POST: async ({ request, params }) => {
    const body = await request.json();
    const [exercise] = await db.insert(workoutExercises).values({
      workoutId: params.id,
      ...body,
    }).returning();
    return json(exercise, { status: 201 });
  },
  PUT: async ({ request, params }) => {
    const body = await request.json();
    const { id, ...data } = body;
    const [updated] = await db.update(workoutExercises).set(data)
      .where(and(eq(workoutExercises.id, id), eq(workoutExercises.workoutId, params.id)))
      .returning();
    return json(updated);
  },
  DELETE: async ({ request, params }) => {
    const { id } = await request.json();
    await db.delete(workoutExercises)
      .where(and(eq(workoutExercises.id, id), eq(workoutExercises.workoutId, params.id)));
    return json({ ok: true });
  },
});
