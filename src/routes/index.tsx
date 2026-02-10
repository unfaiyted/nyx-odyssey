import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane, Calendar, Clock, Dumbbell, Utensils, Weight,
  ChevronRight, TrendingDown, TrendingUp, Minus,
  Flame, Beef, Wheat, Droplets, ListChecks, MapPin,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
} from 'recharts';
import { useEffect, useState } from 'react';

// ── Types ──────────────────────────────────────────────
interface Trip {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string | null;
}

interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: number;
}

interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  unit: string | null;
  bodyFatPct: number | null;
}

interface Workout {
  id: string;
  date: string;
  name: string;
  type: string | null;
  durationMinutes: number | null;
  caloriesBurned: number | null;
  rating: number | null;
}

interface ItineraryItem {
  id: string;
  tripId: string;
  title: string;
  description: string | null;
  date: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  category: string | null;
  completed: boolean | null;
}

interface DashboardData {
  trip: Trip | null;
  fitness: {
    nutrition: NutritionTotals;
    weight: WeightEntry | null;
    weightTrend: WeightEntry[];
    todayWorkouts: Workout[];
  };
  upcomingItems: ItineraryItem[];
}

export const Route = createFileRoute('/')({
  component: Dashboard,
});

// ── Helpers ────────────────────────────────────────────
function getCountdown(startDate: string) {
  const now = new Date();
  const start = new Date(startDate);
  const diff = start.getTime() - now.getTime();
  const isPast = diff < 0;
  const abs = Math.abs(diff);
  return {
    days: Math.floor(abs / (1000 * 60 * 60 * 24)),
    hours: Math.floor((abs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((abs % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((abs % (1000 * 60)) / 1000),
    isPast,
  };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const card = 'glass-card p-5';
const sectionTitle = 'text-sm font-semibold uppercase tracking-wider text-ody-text-muted mb-4 flex items-center gap-2';

// ── Trip Countdown ─────────────────────────────────────
function TripCountdown({ trip }: { trip: Trip }) {
  const [countdown, setCountdown] = useState(getCountdown(trip.startDate!));

  useEffect(() => {
    const interval = setInterval(() => setCountdown(getCountdown(trip.startDate!)), 1000);
    return () => clearInterval(interval);
  }, [trip.startDate]);

  const units = [
    { value: countdown.days, label: 'Days' },
    { value: countdown.hours, label: 'Hours' },
    { value: countdown.minutes, label: 'Min' },
    { value: countdown.seconds, label: 'Sec' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${card} relative overflow-hidden`}
    >
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-ody-accent/5 via-transparent to-transparent pointer-events-none" />

      <div className={sectionTitle}>
        <Plane className="w-4 h-4 text-ody-accent" />
        {countdown.isPast ? 'Trip In Progress' : 'Next Adventure'}
      </div>

      <div className="relative">
        <Link
          to="/trips/$tripId"
          params={{ tripId: trip.id }}
          className="text-xl font-bold hover:text-ody-accent transition-colors"
        >
          {trip.name}
        </Link>

        {trip.startDate && trip.endDate && (
          <p className="text-sm text-ody-text-muted mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
          </p>
        )}

        {/* Countdown digits */}
        <div className="grid grid-cols-4 gap-3 mt-5">
          {units.map((u, i) => (
            <motion.div
              key={u.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-ody-bg/60 rounded-lg p-3 text-center"
            >
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={u.value}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="block text-2xl font-bold text-ody-accent tabular-nums"
                >
                  {u.value}
                </motion.span>
              </AnimatePresence>
              <span className="text-[10px] text-ody-text-muted uppercase tracking-widest">
                {u.label}
              </span>
            </motion.div>
          ))}
        </div>

        <Link
          to="/trips/$tripId"
          params={{ tripId: trip.id }}
          className="mt-4 inline-flex items-center gap-1 text-sm text-ody-accent hover:text-ody-accent-hover transition-colors"
        >
          View trip details <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}

// ── Macro Ring ─────────────────────────────────────────
function MacroRing({
  value, max, label, color, icon: Icon,
}: {
  value: number; max: number; label: string; color: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const pct = Math.min((value / max) * 100, 100);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={radius} fill="none" stroke="currentColor"
            className="text-ody-surface-hover" strokeWidth="4" />
          <motion.circle
            cx="32" cy="32" r={radius} fill="none" stroke={color}
            strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="w-4 h-4 text-ody-text-muted" />
        </div>
      </div>
      <span className="text-sm font-semibold tabular-nums">{Math.round(value)}</span>
      <span className="text-[10px] text-ody-text-muted uppercase tracking-wider">{label}</span>
    </div>
  );
}

// ── Fitness Snapshot ───────────────────────────────────
function FitnessSnapshot({ fitness }: { fitness: DashboardData['fitness'] }) {
  const { nutrition, weight, weightTrend, todayWorkouts } = fitness;
  const hasNutrition = nutrition.meals > 0;

  const weightChange = weightTrend.length >= 2
    ? weightTrend[weightTrend.length - 1].weight - weightTrend[0].weight
    : 0;

  const TrendIcon = weightChange < 0 ? TrendingDown : weightChange > 0 ? TrendingUp : Minus;
  const trendColor = weightChange < 0 ? 'text-ody-success' : weightChange > 0 ? 'text-ody-danger' : 'text-ody-text-muted';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={card}
    >
      <div className={sectionTitle}>
        <Dumbbell className="w-4 h-4 text-ody-accent" />
        Today's Fitness
      </div>

      {/* Macro rings */}
      {hasNutrition ? (
        <div className="flex justify-around mb-5">
          <MacroRing value={nutrition.calories} max={2200} label="Cal" color="#f59e0b" icon={Flame} />
          <MacroRing value={nutrition.protein} max={180} label="Protein" color="#3b82f6" icon={Beef} />
          <MacroRing value={nutrition.carbs} max={250} label="Carbs" color="#8b5cf6" icon={Wheat} />
          <MacroRing value={nutrition.fat} max={80} label="Fat" color="#ec4899" icon={Droplets} />
        </div>
      ) : (
        <div className="text-center py-4 text-ody-text-muted text-sm mb-4">
          <Utensils className="w-5 h-5 mx-auto mb-1 opacity-40" />
          No meals logged today
        </div>
      )}

      {/* Weight + trend chart */}
      {weight && (
        <div className="border-t border-ody-border pt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Weight className="w-4 h-4 text-ody-text-muted" />
              <span className="text-lg font-bold tabular-nums">{weight.weight}</span>
              <span className="text-xs text-ody-text-muted">{weight.unit || 'lbs'}</span>
            </div>
            <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
              <TrendIcon className="w-3.5 h-3.5" />
              <span>{Math.abs(weightChange).toFixed(1)} lbs</span>
            </div>
          </div>

          {weightTrend.length > 1 && (
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightTrend.map(w => ({ date: w.date.slice(5), weight: w.weight }))}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-ody-accent)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--color-ody-accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone" dataKey="weight"
                    stroke="var(--color-ody-accent)" strokeWidth={2}
                    fill="url(#weightGrad)"
                  />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-ody-surface)',
                      border: '1px solid var(--color-ody-border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Today's workouts */}
      {todayWorkouts.length > 0 && (
        <div className="border-t border-ody-border pt-4 mt-4 space-y-2">
          {todayWorkouts.map(w => (
            <div key={w.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-3.5 h-3.5 text-ody-accent" />
                <span>{w.name}</span>
              </div>
              <div className="flex items-center gap-3 text-ody-text-muted text-xs">
                {w.durationMinutes && <span>{w.durationMinutes}min</span>}
                {w.caloriesBurned && <span>{w.caloriesBurned} cal</span>}
                {w.rating && <span>{'⭐'.repeat(w.rating)}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Upcoming Tasks ─────────────────────────────────────
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  activity: ListChecks,
  transport: Plane,
  meal: Utensils,
  sightseeing: MapPin,
  rest: Clock,
};

const categoryColors: Record<string, string> = {
  activity: 'bg-blue-500/10 text-blue-400',
  transport: 'bg-amber-500/10 text-amber-400',
  meal: 'bg-green-500/10 text-green-400',
  sightseeing: 'bg-purple-500/10 text-purple-400',
  rest: 'bg-slate-500/10 text-slate-400',
};

function UpcomingTasks({ items, tripId }: { items: ItineraryItem[]; tripId?: string }) {
  // Group by date
  const grouped = items.reduce<Record<string, ItineraryItem[]>>((acc, item) => {
    (acc[item.date] ??= []).push(item);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={card}
    >
      <div className={sectionTitle}>
        <ListChecks className="w-4 h-4 text-ody-accent" />
        Upcoming Itinerary
      </div>

      {items.length === 0 ? (
        <div className="text-center py-6 text-ody-text-muted text-sm">
          <Calendar className="w-5 h-5 mx-auto mb-1 opacity-40" />
          No upcoming items
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, dateItems]) => (
            <div key={date}>
              <p className="text-xs font-medium text-ody-text-dim mb-2 uppercase tracking-wider">
                {formatDate(date)}
              </p>
              <div className="space-y-2">
                {dateItems.map((item, i) => {
                  const cat = item.category || 'activity';
                  const Icon = categoryIcons[cat] || ListChecks;
                  const colorClass = categoryColors[cat] || categoryColors.activity;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.04 }}
                      className={`flex items-start gap-3 p-2.5 rounded-lg bg-ody-bg/40 ${item.completed ? 'opacity-50' : ''}`}
                    >
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${colorClass}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium ${item.completed ? 'line-through' : ''}`}>
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-ody-text-muted mt-0.5">
                          {item.startTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {item.startTime}
                              {item.endTime && ` – ${item.endTime}`}
                            </span>
                          )}
                          {item.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {item.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {tripId && items.length > 0 && (
        <Link
          to="/trips/$tripId"
          params={{ tripId }}
          className="mt-4 inline-flex items-center gap-1 text-sm text-ody-accent hover:text-ody-accent-hover transition-colors"
        >
          Full itinerary <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </motion.div>
  );
}

// ── Dashboard ──────────────────────────────────────────
function Dashboard() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => fetch('/api/dashboard').then(r => r.json()),
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[0, 1, 2].map(i => (
            <div key={i} className="glass-card h-64 animate-pulse">
              <div className="p-5 space-y-4">
                <div className="h-4 bg-ody-surface-hover rounded w-1/3" />
                <div className="h-8 bg-ody-surface-hover rounded w-2/3" />
                <div className="h-20 bg-ody-surface-hover rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { trip, fitness, upcomingItems } = data || {
    trip: null,
    fitness: { nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 }, weight: null, weightTrend: [], todayWorkouts: [] },
    upcomingItems: [],
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-ody-text-muted mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* Three-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Trip countdown */}
        {trip ? (
          <TripCountdown trip={trip} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={card}
          >
            <div className={sectionTitle}>
              <Plane className="w-4 h-4 text-ody-accent" />
              Next Adventure
            </div>
            <div className="text-center py-8 text-ody-text-muted text-sm">
              <Plane className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No upcoming trips</p>
              <Link
                to="/trips"
                className="mt-3 inline-flex items-center gap-1 text-sm text-ody-accent hover:text-ody-accent-hover"
              >
                Plan one <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Fitness snapshot */}
        <FitnessSnapshot fitness={fitness} />

        {/* Upcoming tasks */}
        <UpcomingTasks items={upcomingItems} tripId={trip?.id} />
      </div>
    </div>
  );
}
