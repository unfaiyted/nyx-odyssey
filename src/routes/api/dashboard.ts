import { json, createAPIFileRoute } from '@tanstack/react-start/api';
import { db } from '../../db';
import { trips, nutritionEntries, weightEntries, workouts, itineraryItems } from '../../db/schema';
import { desc, eq, gte, and, asc } from 'drizzle-orm';

export const APIRoute = createAPIFileRoute('/api/dashboard')({
  GET: async () => {
    const today = new Date().toISOString().split('T')[0];

    // Next upcoming trip (planning or active, with start date in the future or ongoing)
    const allTrips = await db.select().from(trips)
      .orderBy(asc(trips.startDate))
      .limit(10);

    const upcomingTrip = allTrips.find(t =>
      (t.status === 'planning' || t.status === 'active') && t.startDate
    ) || null;

    // Today's nutrition
    const todayNutrition = await db.select().from(nutritionEntries)
      .where(eq(nutritionEntries.date, today));

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

    // Latest weight
    const [latestWeight] = await db.select().from(weightEntries)
      .orderBy(desc(weightEntries.date))
      .limit(1);

    // Recent weight trend (last 7 entries)
    const weightTrend = await db.select().from(weightEntries)
      .orderBy(desc(weightEntries.date))
      .limit(7);

    // Today's workout
    const todayWorkouts = await db.select().from(workouts)
      .where(eq(workouts.date, today));

    // Upcoming itinerary items (next 7 days)
    const upcomingItems = upcomingTrip
      ? await db.select().from(itineraryItems)
          .where(
            and(
              eq(itineraryItems.tripId, upcomingTrip.id),
              gte(itineraryItems.date, today)
            )
          )
          .orderBy(asc(itineraryItems.date), asc(itineraryItems.startTime))
          .limit(8)
      : [];

    return json({
      trip: upcomingTrip,
      fitness: {
        nutrition: nutritionTotals,
        weight: latestWeight || null,
        weightTrend: weightTrend.reverse(),
        todayWorkouts,
      },
      upcomingItems,
    });
  },
});
