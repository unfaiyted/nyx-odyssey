import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getTripOverview } from '../server/fns/trip-overview';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane, Calendar, Clock, ChevronRight, MapPin,
  DollarSign, CheckCircle2, Hotel, Car,
  Globe, ArrowRight, Sparkles,
} from 'lucide-react';
import { FlightPriceWidget } from '../components/FlightPriceWidget';
import { useEffect, useState } from 'react';

// ── Types ──────────────────────────────────────────────
interface TripProgress {
  destinations: { total: number; booked: number };
  accommodations: { total: number; booked: number };
  budget: { total: number; estimated: number; spent: number };
  packing: { total: number; packed: number };
  itinerary: { total: number; completed: number };
  flights: { total: number; confirmed: number };
  rentalCars: number;
}

interface NextFlight {
  airline: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  date: string;
  time: string | null;
}

interface NextDestination {
  name: string;
  date: string | null;
}

interface TripOverview {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string | null;
  totalBudget: string | null;
  currency: string;
  progress: TripProgress;
  nextDestination: NextDestination | null;
  nextFlight: NextFlight | null;
}

interface OverviewData {
  trips: TripOverview[];
}

export const Route = createFileRoute('/')({
  component: TripOverviewDashboard,
});

// ── Helpers ────────────────────────────────────────────
function getCountdown(dateStr: string) {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  const isPast = diff < 0;
  const abs = Math.abs(diff);
  return {
    days: Math.floor(abs / 86400000),
    hours: Math.floor((abs % 86400000) / 3600000),
    minutes: Math.floor((abs % 3600000) / 60000),
    seconds: Math.floor((abs % 60000) / 1000),
    isPast,
    totalDays: Math.floor(abs / 86400000),
  };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatShortDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getTripDuration(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  return Math.ceil((e.getTime() - s.getTime()) / 86400000);
}

function getTripProgress(start: string, end: string) {
  const now = new Date();
  const s = new Date(start);
  const e = new Date(end);
  if (now < s) return 0;
  if (now > e) return 100;
  return Math.round(((now.getTime() - s.getTime()) / (e.getTime() - s.getTime())) * 100);
}

const card = 'glass-card p-5';
const sectionTitle = 'text-sm font-semibold uppercase tracking-wider text-ody-text-muted mb-4 flex items-center gap-2';

// ── Progress Bar ───────────────────────────────────────
function ProgressBar({ value, max, color = 'bg-ody-accent', label, showFraction = true }: {
  value: number; max: number; color?: string; label: string; showFraction?: boolean;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-ody-text-muted">{label}</span>
        <span className="text-ody-text-dim tabular-nums">
          {showFraction ? `${value}/${max}` : `${Math.round(pct)}%`}
        </span>
      </div>
      <div className="h-1.5 bg-ody-surface-hover rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ── Live Countdown ─────────────────────────────────────
function LiveCountdown({ date, compact = false }: { date: string; compact?: boolean }) {
  const [countdown, setCountdown] = useState(getCountdown(date));

  useEffect(() => {
    const interval = setInterval(() => setCountdown(getCountdown(date)), 1000);
    return () => clearInterval(interval);
  }, [date]);

  if (compact) {
    if (countdown.isPast) {
      return <span className="text-ody-success font-medium">In Progress</span>;
    }
    if (countdown.days > 0) {
      return <span className="tabular-nums font-bold text-ody-accent">{countdown.days}d {countdown.hours}h</span>;
    }
    return <span className="tabular-nums font-bold text-ody-accent">{countdown.hours}h {countdown.minutes}m</span>;
  }

  const units = [
    { value: countdown.days, label: 'Days' },
    { value: countdown.hours, label: 'Hours' },
    { value: countdown.minutes, label: 'Min' },
    { value: countdown.seconds, label: 'Sec' },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
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
  );
}

// ── Hero Trip Card (featured/next trip) ────────────────
function HeroTripCard({ trip }: { trip: TripOverview }) {
  const { progress } = trip;
  const isActive = trip.status === 'active';
  const hasDates = trip.startDate && trip.endDate;
  const duration = hasDates ? getTripDuration(trip.startDate!, trip.endDate!) : 0;
  const timeProgress = hasDates && isActive ? getTripProgress(trip.startDate!, trip.endDate!) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${card} relative overflow-hidden col-span-full`}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-ody-accent/8 via-transparent to-purple-500/5 pointer-events-none" />

      <div className="relative">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Left: Trip info + countdown */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                isActive
                  ? 'bg-ody-success/20 text-ody-success'
                  : 'bg-ody-info/20 text-ody-info'
              }`}>
                {isActive ? '✈️ Active' : '📋 Planning'}
              </span>
              {hasDates && (
                <span className="text-xs text-ody-text-dim">
                  {duration} days
                </span>
              )}
            </div>

            <div>
              <Link
                to="/trips/$tripId"
                params={{ tripId: trip.id }}
                className="text-2xl lg:text-3xl font-bold hover:text-ody-accent transition-colors"
              >
                {trip.name}
              </Link>
              {trip.description && (
                <p className="text-sm text-ody-text-muted mt-1 max-w-lg">{trip.description}</p>
              )}
            </div>

            {hasDates && (
              <div className="flex items-center gap-2 text-sm text-ody-text-muted">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(trip.startDate!)} — {formatDate(trip.endDate!)}</span>
              </div>
            )}

            {/* Key stats row */}
            <div className="flex flex-wrap gap-4 text-sm">
              {progress.destinations.total > 0 && (
                <div className="flex items-center gap-1.5 text-ody-text-muted">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  <span>{progress.destinations.total} destinations</span>
                </div>
              )}
              {progress.flights.total > 0 && (
                <div className="flex items-center gap-1.5 text-ody-text-muted">
                  <Plane className="w-3.5 h-3.5 text-amber-400" />
                  <span>{progress.flights.confirmed}/{progress.flights.total} flights</span>
                </div>
              )}
              {progress.accommodations.total > 0 && (
                <div className="flex items-center gap-1.5 text-ody-text-muted">
                  <Hotel className="w-3.5 h-3.5 text-blue-400" />
                  <span>{progress.accommodations.booked}/{progress.accommodations.total} booked</span>
                </div>
              )}
              {progress.rentalCars > 0 && (
                <div className="flex items-center gap-1.5 text-ody-text-muted">
                  <Car className="w-3.5 h-3.5 text-green-400" />
                  <span>{progress.rentalCars} rental{progress.rentalCars > 1 ? 's' : ''}</span>
                </div>
              )}
              {progress.budget.total > 0 && (
                <div className="flex items-center gap-1.5 text-ody-text-muted">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>${progress.budget.spent.toFixed(0)} / ${progress.budget.total.toFixed(0)}</span>
                </div>
              )}
            </div>

            {/* Next flight info */}
            {trip.nextFlight && (
              <div className="bg-ody-bg/60 rounded-lg p-3 flex items-center gap-3 max-w-md">
                <Plane className="w-5 h-5 text-ody-accent shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {trip.nextFlight.airline} {trip.nextFlight.flightNumber}
                  </p>
                  <p className="text-xs text-ody-text-muted flex items-center gap-1">
                    {trip.nextFlight.departure}
                    <ArrowRight className="w-3 h-3" />
                    {trip.nextFlight.arrival}
                    <span className="mx-1">·</span>
                    {formatShortDate(trip.nextFlight.date)}
                    {trip.nextFlight.time && ` at ${trip.nextFlight.time}`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Countdown */}
          <div className="lg:w-80 shrink-0 space-y-4">
            {trip.startDate && !isActive && (
              <>
                <p className="text-sm font-medium text-ody-text-muted text-center">
                  Departure Countdown
                </p>
                <LiveCountdown date={trip.startDate} />
              </>
            )}
            {isActive && hasDates && (
              <>
                <p className="text-sm font-medium text-ody-text-muted text-center">
                  Trip Progress
                </p>
                <div className="bg-ody-bg/60 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-ody-text-muted">Day {Math.ceil(timeProgress / 100 * duration)} of {duration}</span>
                    <span className="text-ody-accent font-bold tabular-nums">{timeProgress}%</span>
                  </div>
                  <div className="h-2 bg-ody-surface-hover rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-ody-accent to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${timeProgress}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                    />
                  </div>
                  {trip.nextDestination && (
                    <div className="flex items-center gap-2 text-xs text-ody-text-muted pt-1">
                      <MapPin className="w-3 h-3 text-purple-400" />
                      <span>Next: <span className="text-ody-text font-medium">{trip.nextDestination.name}</span></span>
                      {trip.nextDestination.date && (
                        <span>· {formatShortDate(trip.nextDestination.date)}</span>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Progress bars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-ody-border/50">
          {progress.itinerary.total > 0 && (
            <ProgressBar
              value={progress.itinerary.completed}
              max={progress.itinerary.total}
              label="Itinerary"
              color="bg-blue-500"
            />
          )}
          {progress.packing.total > 0 && (
            <ProgressBar
              value={progress.packing.packed}
              max={progress.packing.total}
              label="Packing"
              color="bg-purple-500"
            />
          )}
          {progress.budget.total > 0 && (
            <ProgressBar
              value={progress.budget.spent}
              max={progress.budget.total}
              label="Budget Spent"
              color="bg-emerald-500"
              showFraction={false}
            />
          )}
          {progress.accommodations.total > 0 && (
            <ProgressBar
              value={progress.accommodations.booked}
              max={progress.accommodations.total}
              label="Accommodations"
              color="bg-amber-500"
            />
          )}
        </div>

        <Link
          to="/trips/$tripId"
          params={{ tripId: trip.id }}
          className="mt-5 inline-flex items-center gap-1.5 text-sm text-ody-accent hover:text-ody-accent-hover transition-colors font-medium"
        >
          View full trip <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}

// ── Compact Trip Card (for additional trips) ───────────
function CompactTripCard({ trip, index }: { trip: TripOverview; index: number }) {
  const { progress } = trip;
  const isActive = trip.status === 'active';

  // Overall "readiness" score
  const scores: number[] = [];
  if (progress.flights.total > 0) scores.push(progress.flights.confirmed / progress.flights.total);
  if (progress.accommodations.total > 0) scores.push(progress.accommodations.booked / progress.accommodations.total);
  if (progress.packing.total > 0) scores.push(progress.packing.packed / progress.packing.total);
  const readiness = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05, duration: 0.4 }}
    >
      <Link
        to="/trips/$tripId"
        params={{ tripId: trip.id }}
        className={`block ${card} hover:border-ody-accent/40 transition-all group`}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg group-hover:text-ody-accent transition-colors">
              {trip.name}
            </h3>
            {trip.startDate && trip.endDate && (
              <p className="text-xs text-ody-text-muted mt-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatShortDate(trip.startDate)} — {formatShortDate(trip.endDate)}
              </p>
            )}
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
            isActive
              ? 'bg-ody-success/20 text-ody-success'
              : trip.status === 'completed'
                ? 'bg-ody-text-muted/20 text-ody-text-muted'
                : 'bg-ody-info/20 text-ody-info'
          }`}>
            {trip.status}
          </span>
        </div>

        {/* Countdown or status */}
        {trip.startDate && !isActive && trip.status === 'planning' && (
          <div className="flex items-center gap-2 mb-3 text-sm">
            <Clock className="w-3.5 h-3.5 text-ody-text-dim" />
            <LiveCountdown date={trip.startDate} compact />
          </div>
        )}

        {/* Mini stats */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ody-text-dim mb-3">
          {progress.destinations.total > 0 && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {progress.destinations.total} dest
            </span>
          )}
          {progress.flights.total > 0 && (
            <span className="flex items-center gap-1">
              <Plane className="w-3 h-3" /> {progress.flights.total} flights
            </span>
          )}
          {progress.budget.total > 0 && (
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> ${progress.budget.total.toFixed(0)}
            </span>
          )}
        </div>

        {/* Readiness bar */}
        {scores.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ody-text-muted">Readiness</span>
              <span className="text-ody-text-dim tabular-nums">{readiness}%</span>
            </div>
            <div className="h-1.5 bg-ody-surface-hover rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  readiness >= 80 ? 'bg-ody-success' : readiness >= 50 ? 'bg-amber-500' : 'bg-ody-accent'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${readiness}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 + index * 0.05 }}
              />
            </div>
          </div>
        )}
      </Link>
    </motion.div>
  );
}

// ── Empty State ────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-20"
    >
      <Globe className="w-16 h-16 mx-auto mb-4 text-ody-text-dim opacity-30" />
      <h2 className="text-2xl font-bold mb-2">No trips yet</h2>
      <p className="text-ody-text-muted mb-6 max-w-md mx-auto">
        Start planning your next adventure. Create a trip to track destinations,
        flights, accommodations, and more.
      </p>
      <Link
        to="/trips"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ody-accent text-white hover:bg-ody-accent-hover transition-colors font-medium"
      >
        <Sparkles className="w-4 h-4" />
        Plan Your First Trip
      </Link>
    </motion.div>
  );
}

// ── Loading State ──────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="h-8 bg-ody-surface-hover rounded w-48 animate-pulse" />
      <div className="glass-card h-72 animate-pulse">
        <div className="p-6 space-y-4">
          <div className="h-4 bg-ody-surface-hover rounded w-20" />
          <div className="h-8 bg-ody-surface-hover rounded w-64" />
          <div className="h-4 bg-ody-surface-hover rounded w-48" />
          <div className="grid grid-cols-4 gap-3 mt-4">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-ody-surface-hover rounded-lg" />
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map(i => (
          <div key={i} className="glass-card h-40 animate-pulse">
            <div className="p-5 space-y-3">
              <div className="h-5 bg-ody-surface-hover rounded w-32" />
              <div className="h-3 bg-ody-surface-hover rounded w-40" />
              <div className="h-3 bg-ody-surface-hover rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────
function TripOverviewDashboard() {
  const { data, isLoading } = useQuery<OverviewData>({
    queryKey: ['trip-overview'],
    queryFn: () => getTripOverview(),
    refetchInterval: 60_000,
  });

  if (isLoading) return <LoadingSkeleton />;

  const allTrips = data?.trips || [];

  if (allTrips.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <EmptyState />
      </div>
    );
  }

  // Separate featured (active or next planning) from others
  const activeTrips = allTrips.filter(t => t.status === 'active');
  const planningTrips = allTrips.filter(t => t.status === 'planning');
  const completedTrips = allTrips.filter(t => t.status === 'completed');

  // Featured: active first, then earliest planning
  const featured = activeTrips[0] || planningTrips[0] || allTrips[0];
  const others = allTrips.filter(t => t.id !== featured.id);
  const upcoming = others.filter(t => t.status === 'planning' || t.status === 'active');
  const past = others.filter(t => t.status === 'completed');

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6 text-ody-accent" />
            Trip Overview
          </h2>
          <p className="text-ody-text-muted mt-1">
            {activeTrips.length > 0
              ? `${activeTrips.length} active trip${activeTrips.length > 1 ? 's' : ''}`
              : `${planningTrips.length} trip${planningTrips.length !== 1 ? 's' : ''} in planning`
            }
            {completedTrips.length > 0 && ` · ${completedTrips.length} completed`}
          </p>
        </div>
        <Link
          to="/trips"
          className="text-sm text-ody-accent hover:text-ody-accent-hover transition-colors flex items-center gap-1"
        >
          All trips <ChevronRight className="w-4 h-4" />
        </Link>
      </motion.div>

      {/* Featured trip */}
      <HeroTripCard trip={featured} />

      {/* Flight price tracking widget */}
      <FlightPriceWidget tripId={featured.id} tripName={featured.name} />

      {/* Other upcoming trips */}
      {upcoming.length > 0 && (
        <div>
          <h3 className={sectionTitle}>
            <Calendar className="w-4 h-4 text-ody-accent" />
            {activeTrips.length > 0 ? 'Other Trips' : 'Upcoming Trips'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((trip, i) => (
              <CompactTripCard key={trip.id} trip={trip} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Completed trips */}
      {past.length > 0 && (
        <div>
          <h3 className={sectionTitle}>
            <CheckCircle2 className="w-4 h-4 text-ody-text-dim" />
            Past Adventures
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {past.map((trip, i) => (
              <CompactTripCard key={trip.id} trip={trip} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
