import { createServerFn } from '@tanstack/react-start';
import { db } from '../../db';
import { trips, nutritionEntries, weightEntries, workouts, itineraryItems } from '../../db/schema';
import { desc, eq, gte, and, asc } from 'drizzle-orm';

export const getDashboard = createServerFn({ method: 'GET' }).handler(async () => {
  const today = new Date().toISOString().split('T')[0];

  const allTrips = await db.select().from(trips).orderBy(asc(trips.startDate)).limit(10);
  const upcomingTrip = allTrips.find(t =>
    (t.status === 'planning' || t.status === 'active') && t.startDate
  ) || null;

  const todayNutrition = await db.select().from(nutritionEntries).where(eq(nutritionEntries.date, today));
  const nutritionTotals = todayNutrition.reduce(
    (acc, entry) => ({
      calories: acc.calories + (entry.calories || 0),
      protein: acc.protein + (entry.protein || 0),
      carbs: acc.carbs + (entry.carbs || 0),
      fat: acc.fat + (entry.fat || 0),
      meals: acc.meals + 1,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 }
  );

  const [latestWeight] = await db.select().from(weightEntries).orderBy(desc(weightEntries.date)).limit(1);
  const weightTrend = await db.select().from(weightEntries).orderBy(desc(weightEntries.date)).limit(7);
  const todayWorkouts = await db.select().from(workouts).where(eq(workouts.date, today));

  const upcomingItems = upcomingTrip
    ? await db.select().from(itineraryItems)
        .where(and(eq(itineraryItems.tripId, upcomingTrip.id), gte(itineraryItems.date, today)))
        .orderBy(asc(itineraryItems.date), asc(itineraryItems.startTime))
        .limit(8)
    : [];

  return {
    trip: upcomingTrip,
    fitness: {
      nutrition: nutritionTotals,
      weight: latestWeight || null,
      weightTrend: weightTrend.reverse(),
      todayWorkouts,
    },
    upcomingItems,
  };
});
