import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Plane, ChevronRight, Plus, Wallet } from 'lucide-react';

interface Trip {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string | null;
  totalBudget: string | null;
  currency: string | null;
  createdAt: string;
}

export const Route = createFileRoute('/')({
  component: Dashboard,
});

function getCountdown(startDate: string): { days: number; hours: number; minutes: number; isPast: boolean } {
  const now = new Date();
  const start = new Date(startDate);
  const diff = start.getTime() - now.getTime();
  const isPast = diff < 0;
  const absDiff = Math.abs(diff);
  return {
    days: Math.floor(absDiff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60)),
    isPast,
  };
}

function getTripProgress(startDate: string, endDate: string): number {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now < start) return 0;
  if (now > end) return 100;
  return Math.round(((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100);
}

function getTripDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  planning: { label: 'Planning', color: 'text-ody-info', bg: 'bg-ody-info/10' },
  active: { label: 'Active', color: 'text-ody-success', bg: 'bg-ody-success/10' },
  completed: { label: 'Completed', color: 'text-ody-text-muted', bg: 'bg-ody-text-muted/10' },
  cancelled: { label: 'Cancelled', color: 'text-ody-danger', bg: 'bg-ody-danger/10' },
};

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold text-ody-accent tabular-nums">{value}</span>
      <span className="text-xs text-ody-text-muted uppercase tracking-wider">{label}</span>
    </div>
  );
}

function TripCard({ trip, index }: { trip: Trip; index: number }) {
  const status = statusConfig[trip.status || 'planning'];
  const hasDateRange = trip.startDate && trip.endDate;
  const countdown = trip.startDate ? getCountdown(trip.startDate) : null;
  const progress = hasDateRange ? getTripProgress(trip.startDate!, trip.endDate!) : 0;
  const duration = hasDateRange ? getTripDuration(trip.startDate!, trip.endDate!) : 0;
  const isUpcoming = countdown && !countdown.isPast && (trip.status === 'planning' || trip.status === 'active');
  const isActive = trip.status === 'active';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: 'easeOut' }}
      className={`glass-card overflow-hidden group hover:border-ody-accent/40 transition-all duration-300 ${isActive ? 'animate-pulse-glow' : ''}`}
    >
      {/* Cover image or gradient */}
      <div className="h-32 relative overflow-hidden">
        {trip.coverImage ? (
          <img src={trip.coverImage} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-ody-accent/20 via-ody-surface to-ody-surface-raised" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ody-surface via-transparent to-transparent" />
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color} ${status.bg} backdrop-blur-sm`}>
            {status.label}
          </span>
        </div>
        <div className="absolute bottom-3 left-4">
          <h3 className="text-lg font-bold text-white drop-shadow-lg">{trip.name}</h3>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {trip.description && (
          <p className="text-sm text-ody-text-muted line-clamp-2">{trip.description}</p>
        )}

        {/* Date range */}
        {hasDateRange && (
          <div className="flex items-center gap-2 text-sm text-ody-text-muted">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>{formatDate(trip.startDate!)} — {formatDate(trip.endDate!)}</span>
            <span className="text-ody-text-dim">·</span>
            <span>{duration} days</span>
          </div>
        )}

        {/* Countdown for upcoming trips */}
        {isUpcoming && countdown && countdown.days > 0 && (
          <div className="bg-ody-bg/50 rounded-lg p-3">
            <p className="text-xs text-ody-text-muted mb-2 text-center uppercase tracking-wider">
              {isActive ? 'Trip in progress' : 'Departure in'}
            </p>
            <div className="flex justify-center gap-6">
              <CountdownUnit value={countdown.days} label="days" />
              <CountdownUnit value={countdown.hours} label="hrs" />
              <CountdownUnit value={countdown.minutes} label="min" />
            </div>
          </div>
        )}

        {/* Progress bar for active or past-start trips */}
        {hasDateRange && progress > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-ody-text-muted">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-ody-bg rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-ody-accent to-ody-accent-hover rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: index * 0.1 + 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Budget */}
        {trip.totalBudget && (
          <div className="flex items-center gap-2 text-sm text-ody-text-muted">
            <Wallet className="w-4 h-4" />
            <span>{trip.currency || '$'}{Number(trip.totalBudget).toLocaleString()} budget</span>
          </div>
        )}

        {/* Action link */}
        <a
          href={`/trips/${trip.id}`}
          className="flex items-center gap-1 text-sm text-ody-accent hover:text-ody-accent-hover transition-colors pt-1"
        >
          View details <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-12 text-center"
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ody-accent/10 flex items-center justify-center">
        <Plane className="w-8 h-8 text-ody-accent" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No trips yet</h3>
      <p className="text-ody-text-muted text-sm mb-6">Start planning your next adventure</p>
      <button className="px-4 py-2 bg-ody-accent hover:bg-ody-accent-hover text-white rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2">
        <Plus className="w-4 h-4" /> Create Trip
      </button>
    </motion.div>
  );
}

function StatsBar({ trips }: { trips: Trip[] }) {
  const active = trips.filter(t => t.status === 'active').length;
  const planning = trips.filter(t => t.status === 'planning').length;
  const completed = trips.filter(t => t.status === 'completed').length;
  const totalDays = trips.reduce((sum, t) => {
    if (t.startDate && t.endDate) return sum + getTripDuration(t.startDate, t.endDate);
    return sum;
  }, 0);

  const stats = [
    { label: 'Active', value: active, icon: Plane, color: 'text-ody-success' },
    { label: 'Planning', value: planning, icon: Clock, color: 'text-ody-info' },
    { label: 'Completed', value: completed, icon: MapPin, color: 'text-ody-text-muted' },
    { label: 'Total Days', value: totalDays, icon: Calendar, color: 'text-ody-accent' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className="glass-card p-4 flex items-center gap-3"
        >
          <stat.icon className={`w-5 h-5 ${stat.color}`} />
          <div>
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-xs text-ody-text-muted">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function Dashboard() {
  const { data: trips = [], isLoading } = useQuery<Trip[]>({
    queryKey: ['trips'],
    queryFn: () => fetch('/api/trips').then(r => r.json()),
  });

  // Sort: active first, then planning, then by start date
  const sortedTrips = [...trips].sort((a, b) => {
    const order: Record<string, number> = { active: 0, planning: 1, completed: 2, cancelled: 3 };
    const diff = (order[a.status || 'planning'] ?? 9) - (order[b.status || 'planning'] ?? 9);
    if (diff !== 0) return diff;
    if (a.startDate && b.startDate) return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    return 0;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold">Trip Overview</h2>
          <p className="text-ody-text-muted mt-1">Your adventures at a glance</p>
        </div>
        <button className="px-4 py-2 bg-ody-accent hover:bg-ody-accent-hover text-white rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Trip
        </button>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="glass-card h-72 animate-pulse">
              <div className="h-32 bg-ody-surface-hover" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-ody-surface-hover rounded w-3/4" />
                <div className="h-3 bg-ody-surface-hover rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : trips.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <StatsBar trips={trips} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedTrips.map((trip, i) => (
              <TripCard key={trip.id} trip={trip} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
