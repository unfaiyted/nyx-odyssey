import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Search, Bookmark, CheckCircle, Filter } from 'lucide-react';
import type { TripDestination, TripRoute } from '../../types/trips';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Search; bg: string; count?: number }> = {
  researched: { label: 'Researched', color: 'text-ody-info', icon: Search, bg: 'bg-ody-info/15' },
  booked: { label: 'Booked', color: 'text-ody-warning', icon: Bookmark, bg: 'bg-ody-warning/15' },
  visited: { label: 'Visited', color: 'text-ody-success', icon: CheckCircle, bg: 'bg-ody-success/15' },
};

const PLACEHOLDER_PHOTOS = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200&h=120&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=120&fit=crop',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=200&h=120&fit=crop',
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=200&h=120&fit=crop',
];

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

interface Props {
  destinations: TripDestination[];
  routes: TripRoute[];
  selectedId: string | null;
  selectedRouteId: string | null;
  onSelectDestination: (id: string) => void;
  onSelectRoute: (id: string) => void;
  filterCategory: string | null;
  onFilterChange: (category: string | null) => void;
}

export function TripMapSidebar({
  destinations,
  routes,
  selectedId,
  selectedRouteId,
  onSelectDestination,
  onSelectRoute,
  filterCategory,
  onFilterChange,
}: Props) {
  const sorted = [...destinations].sort((a, b) => a.orderIndex - b.orderIndex);

  // Status counts
  const counts = destinations.reduce((acc, d) => {
    const s = d.status || 'researched';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col h-full">
      {/* Filter chips */}
      <div className="p-3 border-b border-ody-border">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onFilterChange(null)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              !filterCategory ? 'bg-ody-accent/20 text-ody-accent' : 'text-ody-text-dim hover:bg-ody-surface-hover'
            }`}
          >
            <Filter size={10} />
            All ({destinations.length})
          </button>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            const count = counts[key] || 0;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => onFilterChange(filterCategory === key ? null : key)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  filterCategory === key ? `${config.bg} ${config.color}` : 'text-ody-text-dim hover:bg-ody-surface-hover'
                }`}
              >
                <Icon size={10} />
                {count}
              </button>
            );
          })}
        </div>
      </div>

      {/* Destination list with photos */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {sorted.map((dest, i) => {
            const status = dest.status || 'researched';
            const config = STATUS_CONFIG[status] || STATUS_CONFIG.researched;
            const StatusIcon = config.icon;
            const photoUrl = dest.photoUrl || PLACEHOLDER_PHOTOS[i % PLACEHOLDER_PHOTOS.length];
            const isSelected = selectedId === dest.id;

            // Find route to next destination
            const nextDest = sorted[i + 1];
            const routeToNext = nextDest
              ? routes.find((r) => r.fromDestinationId === dest.id && r.toDestinationId === nextDest.id)
              : undefined;

            return (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <button
                  onClick={() => onSelectDestination(dest.id)}
                  className={`w-full text-left transition-colors hover:bg-ody-surface-hover ${
                    isSelected ? 'bg-ody-surface-hover border-l-2 border-l-ody-accent' : ''
                  }`}
                >
                  <div className="flex gap-3 p-3">
                    {/* Photo thumbnail */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={photoUrl}
                        alt={dest.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-0.5 left-0.5">
                        <span className="w-5 h-5 rounded-full bg-ody-accent/90 text-white text-[10px] font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate">{dest.name}</p>
                      {dest.description && (
                        <p className="text-xs text-ody-text-muted truncate mt-0.5">{dest.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${config.bg} ${config.color}`}>
                          <StatusIcon size={9} />
                          {config.label}
                        </span>
                        {dest.arrivalDate && (
                          <span className="text-[10px] text-ody-text-dim">
                            📅 {dest.arrivalDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Route connector to next */}
                {routeToNext && (
                  <button
                    onClick={() => onSelectRoute(routeToNext.id)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-[10px] transition-colors hover:bg-ody-bg/80 ${
                      selectedRouteId === routeToNext.id ? 'bg-ody-bg/80 text-ody-accent' : 'text-ody-text-dim bg-ody-bg/40'
                    }`}
                  >
                    <div className="ml-5 flex items-center gap-1.5">
                      <Navigation size={9} className="text-ody-accent" />
                      {routeToNext.distanceMiles && `${routeToNext.distanceMiles.toFixed(1)} mi`}
                      {routeToNext.distanceKm && ` (${routeToNext.distanceKm.toFixed(0)} km)`}
                      {routeToNext.durationMinutes && ` · ${formatDuration(routeToNext.durationMinutes)}`}
                    </div>
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
