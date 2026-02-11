import { createServerFn } from '@tanstack/react-start';
import { db } from '../../db';
import { trips, itineraryItems, nutritionEntries, packingItems, flights } from '../../db/schema';
import { eq, and, gte, lte, lt, asc, desc } from 'drizzle-orm';

export interface Notification {
  id: string;
  type: 'event' | 'task' | 'nutrition' | 'flight' | 'packing';
  severity: 'info' | 'warning' | 'urgent';
  title: string;
  description: string;
  timestamp: string;
  tripId?: string;
}

export const getNotifications = createServerFn({ method: 'GET' }).handler(async () => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const tomorrow = new Date(now.getTime() + 86400000).toISOString().split('T')[0];
  const threeDays = new Date(now.getTime() + 3 * 86400000).toISOString().split('T')[0];
  const yesterday = new Date(now.getTime() - 86400000).toISOString().split('T')[0];
  const sevenDays = new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0];

  const notifications: Notification[] = [];

  const activeTrips = await db.select().from(trips).where(eq(trips.status, 'planning')).limit(5);
  const activeTripIds = activeTrips.map(t => t.id);

  for (const tripId of activeTripIds) {
    const upcoming = await db.select().from(itineraryItems)
      .where(and(eq(itineraryItems.tripId, tripId), gte(itineraryItems.date, today), lte(itineraryItems.date, threeDays), eq(itineraryItems.completed, false)))
      .orderBy(asc(itineraryItems.date), asc(itineraryItems.startTime))
      .limit(5);

    for (const item of upcoming) {
      const isToday = item.date === today;
      const isTomorrow = item.date === tomorrow;
      notifications.push({
        id: `event-${item.id}`, type: 'event',
        severity: isToday ? 'urgent' : isTomorrow ? 'warning' : 'info',
        title: item.title,
        description: `${isToday ? 'Today' : isTomorrow ? 'Tomorrow' : item.date}${item.startTime ? ` at ${item.startTime}` : ''}`,
        timestamp: item.date, tripId,
      });
    }

    const overdue = await db.select().from(itineraryItems)
      .where(and(eq(itineraryItems.tripId, tripId), lt(itineraryItems.date, today), eq(itineraryItems.completed, false)))
      .orderBy(desc(itineraryItems.date)).limit(5);

    for (const item of overdue) {
      notifications.push({
        id: `overdue-${item.id}`, type: 'task', severity: 'urgent',
        title: item.title, description: `Overdue since ${item.date}`,
        timestamp: item.date, tripId,
      });
    }

    const upcomingFlights = await db.select().from(flights)
      .where(and(eq(flights.tripId, tripId), gte(flights.departureDate, today), lte(flights.departureDate, sevenDays)))
      .orderBy(asc(flights.departureDate)).limit(3);

    for (const flight of upcomingFlights) {
      const isToday = flight.departureDate === today;
      const isTomorrow = flight.departureDate === tomorrow;
      notifications.push({
        id: `flight-${flight.id}`, type: 'flight',
        severity: isToday ? 'urgent' : isTomorrow ? 'warning' : 'info',
        title: `${flight.airline} ${flight.flightNumber}`,
        description: `${flight.departureCity || flight.departureAirport} → ${flight.arrivalCity || flight.arrivalAirport} · ${isToday ? 'Today' : isTomorrow ? 'Tomorrow' : flight.departureDate}${flight.departureTime ? ` at ${flight.departureTime}` : ''}`,
        timestamp: flight.departureDate, tripId,
      });
    }
  }

  const yesterdayNutrition = await db.select().from(nutritionEntries).where(eq(nutritionEntries.date, yesterday));
  if (yesterdayNutrition.length > 0) {
    const totals = yesterdayNutrition.reduce((acc, e) => ({ calories: acc.calories + (e.calories || 0), protein: acc.protein + (e.protein || 0) }), { calories: 0, protein: 0 });
    if (totals.calories < 1200) {
      notifications.push({ id: `nutrition-cal-${yesterday}`, type: 'nutrition', severity: 'warning', title: 'Low calorie intake yesterday', description: `${Math.round(totals.calories)} cal — below 1,200 target`, timestamp: yesterday });
    }
    if (totals.protein < 80) {
      notifications.push({ id: `nutrition-pro-${yesterday}`, type: 'nutrition', severity: 'warning', title: 'Low protein yesterday', description: `${Math.round(totals.protein)}g — below 80g target`, timestamp: yesterday });
    }
  } else {
    notifications.push({ id: `nutrition-none-${yesterday}`, type: 'nutrition', severity: 'warning', title: 'No nutrition logged yesterday', description: 'Remember to track your meals', timestamp: yesterday });
  }

  for (const trip of activeTrips) {
    if (trip.startDate && trip.startDate <= sevenDays && trip.startDate >= today) {
      const unpacked = await db.select().from(packingItems)
        .where(and(eq(packingItems.tripId, trip.id), eq(packingItems.packed, false)));
      if (unpacked.length > 0) {
        notifications.push({
          id: `packing-${trip.id}`, type: 'packing',
          severity: unpacked.length > 10 ? 'warning' : 'info',
          title: `${unpacked.length} items still unpacked`,
          description: `${trip.name} starts ${trip.startDate === today ? 'today' : trip.startDate === tomorrow ? 'tomorrow' : `on ${trip.startDate}`}`,
          timestamp: trip.startDate, tripId: trip.id,
        });
      }
    }
  }

  const severityOrder = { urgent: 0, warning: 1, info: 2 };
  notifications.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    notifications,
    counts: {
      total: notifications.length,
      urgent: notifications.filter(n => n.severity === 'urgent').length,
      warning: notifications.filter(n => n.severity === 'warning').length,
      info: notifications.filter(n => n.severity === 'info').length,
    },
  };
});
