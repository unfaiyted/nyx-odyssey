import { motion } from 'framer-motion';
import { Car, Clock, MapPin, Route } from 'lucide-react';
import type { TripRoute, TripDestination } from '../../types/trips';

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function getDifficultyColor(minutes: number) {
  if (minutes <= 60) return 'text-emerald-400';
  if (minutes <= 120) return 'text-sky-400';
  if (minutes <= 180) return 'text-amber-400';
  return 'text-rose-400';
}

function getDifficultyLabel(minutes: number) {
  if (minutes <= 60) return 'Easy Day Trip';
  if (minutes <= 120) return 'Half-Day Drive';
  if (minutes <= 180) return 'Long Drive';
  return 'Full Day / Overnight';
}

interface RoutesTabProps {
  tripId: string;
  routes: TripRoute[];
  destinations: TripDestination[];
}

export function RoutesTab({ tripId, routes, destinations }: RoutesTabProps) {
  const destMap = new Map(destinations.map(d => [d.id, d]));

  // Find Vicenza (base) destination
  const base = destinations.find(d => d.name.toLowerCase().includes('vicenza'));

  // Separate routes from base vs between other destinations
  const fromBaseRoutes = routes
    .filter(r => base && r.fromDestinationId === base.id)
    .sort((a, b) => (a.durationMinutes || 0) - (b.durationMinutes || 0));

  const otherRoutes = routes
    .filter(r => !base || r.fromDestinationId !== base.id)
    .sort((a, b) => (a.durationMinutes || 0) - (b.durationMinutes || 0));

  const totalKm = fromBaseRoutes.reduce((sum, r) => sum + (r.distanceKm || 0), 0);
  const avgDuration = fromBaseRoutes.length > 0
    ? Math.round(fromBaseRoutes.reduce((sum, r) => sum + (r.durationMinutes || 0), 0) / fromBaseRoutes.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
          className="bg-ody-surface border border-ody-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-ody-text-muted text-sm mb-1">
            <Route size={14} /> Routes Mapped
          </div>
          <p className="text-2xl font-bold">{fromBaseRoutes.length}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-ody-surface border border-ody-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-ody-text-muted text-sm mb-1">
            <Car size={14} /> Total Distance
          </div>
          <p className="text-2xl font-bold">{totalKm.toFixed(0)} <span className="text-sm font-normal text-ody-text-muted">km</span></p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-ody-surface border border-ody-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-ody-text-muted text-sm mb-1">
            <Clock size={14} /> Avg Drive Time
          </div>
          <p className="text-2xl font-bold">{formatDuration(avgDuration)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-ody-surface border border-ody-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-ody-text-muted text-sm mb-1">
            <MapPin size={14} /> Base
          </div>
          <p className="text-2xl font-bold">{base?.name || 'N/A'}</p>
        </motion.div>
      </div>

      {/* Routes from Base */}
      {fromBaseRoutes.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Car size={20} className="text-ody-accent" />
            Driving Routes from {base?.name || 'Base'}
          </h3>
          <div className="space-y-3">
            {fromBaseRoutes.map((route, i) => {
              const toDest = destMap.get(route.toDestinationId);
              const duration = route.durationMinutes || 0;
              return (
                <motion.div key={route.id}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-ody-surface border border-ody-border rounded-xl p-4 hover:border-ody-accent/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Duration badge */}
                      <div className={`text-center shrink-0 w-16 ${getDifficultyColor(duration)}`}>
                        <p className="text-lg font-bold leading-tight">{formatDuration(duration)}</p>
                      </div>

                      {/* Route info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">{toDest?.name || 'Unknown'}</p>
                          {route.tolls && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 shrink-0">
                              Tolls
                            </span>
                          )}
                          {route.highway && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 shrink-0">
                              Highway
                            </span>
                          )}
                        </div>
                        {route.routeDescription && (
                          <p className="text-sm text-ody-text-muted mt-0.5">{route.routeDescription}</p>
                        )}
                        {route.notes && (
                          <p className="text-xs text-ody-text-dim mt-1 italic">{route.notes}</p>
                        )}
                      </div>
                    </div>

                    {/* Distance */}
                    <div className="text-right shrink-0 ml-4">
                      {route.distanceKm && (
                        <p className="font-medium">{route.distanceKm.toFixed(0)} km</p>
                      )}
                      {route.distanceMiles && (
                        <p className="text-xs text-ody-text-muted">{route.distanceMiles.toFixed(0)} mi</p>
                      )}
                    </div>
                  </div>

                  {/* Difficulty indicator bar */}
                  <div className="mt-3 h-1 rounded-full bg-ody-border overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((duration / 360) * 100, 100)}%` }}
                      transition={{ delay: i * 0.04 + 0.2, duration: 0.5 }}
                      className={`h-full rounded-full ${
                        duration <= 60 ? 'bg-emerald-500' :
                        duration <= 120 ? 'bg-sky-500' :
                        duration <= 180 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                    />
                  </div>
                  <p className={`text-xs mt-1 ${getDifficultyColor(duration)}`}>
                    {getDifficultyLabel(duration)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Routes between other destinations */}
      {otherRoutes.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Route size={20} className="text-ody-accent" />
            Routes Between Destinations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {otherRoutes.map((route, i) => {
              const fromDest = destMap.get(route.fromDestinationId);
              const toDest = destMap.get(route.toDestinationId);
              const duration = route.durationMinutes || 0;
              return (
                <motion.div key={route.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-ody-surface border border-ody-border rounded-xl p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {fromDest?.name || '?'} → {toDest?.name || '?'}
                      </p>
                      {route.routeDescription && (
                        <p className="text-xs text-ody-text-muted mt-0.5">{route.routeDescription}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className={`text-sm font-bold ${getDifficultyColor(duration)}`}>
                        {formatDuration(duration)}
                      </p>
                      {route.distanceKm && (
                        <p className="text-xs text-ody-text-muted">{route.distanceKm.toFixed(0)} km</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-ody-surface border border-ody-border rounded-xl p-4">
        <h4 className="text-sm font-semibold mb-3">Drive Time Guide</h4>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-ody-text-muted">≤ 1h — Easy Day Trip</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-sky-500" />
            <span className="text-ody-text-muted">1-2h — Half-Day Drive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-ody-text-muted">2-3h — Long Drive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-ody-text-muted">3h+ — Full Day / Overnight</span>
          </div>
        </div>
      </div>

      {routes.length === 0 && (
        <div className="text-center py-12 text-ody-text-muted">
          <Car size={48} className="mx-auto mb-3 opacity-30" />
          <p>No driving routes calculated yet.</p>
        </div>
      )}
    </div>
  );
}
