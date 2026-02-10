import { json, createAPIFileRoute } from '@tanstack/react-start/api';
import { db } from '../../db';
import { workouts, workoutExercises } from '../../db/schema';
import { desc, eq } from 'drizzle-orm';

export const APIRoute = createAPIFileRoute('/api/workouts')({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const allWorkouts = await db.select().from(workouts)
      .orderBy(desc(workouts.date))
      .limit(limit);
    return json(allWorkouts);
  },
  POST: async ({ request }) => {
    const body = await request.json();
    const { exercises, ...workoutData } = body;
    const [workout] = await db.insert(workouts).values({
      date: workoutData.date,
      name: workoutData.name,
      type: workoutData.type || 'strength',
      durationMinutes: workoutData.durationMinutes,
      caloriesBurned: workoutData.caloriesBurned,
      notes: workoutData.notes,
      rating: workoutData.rating,
      completed: workoutData.completed ?? true,
    }).returning();

    if (exercises?.length) {
      await db.insert(workoutExercises).values(
        exercises.map((ex: any, i: number) => ({
          workoutId: workout.id,
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

    return json(workout, { status: 201 });
  },
});
