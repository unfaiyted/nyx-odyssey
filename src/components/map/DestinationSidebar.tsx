import { motion, AnimatePresence } from 'framer-motion';
import type { Destination, Route } from '../../types/destinations';

const categoryColors: Record<string, string> = {
  start: '#22c55e',
  stop: '#8b5cf6',
  end: '#ef4444',
  poi: '#f59e0b',
};

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

interface DestinationSidebarProps {
  destinations: Destination[];
  routes: Route[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function DestinationSidebar({ destinations, routes, selectedId, onSelect }: DestinationSidebarProps) {
  const sorted = [...destinations].sort((a, b) => a.orderIndex - b.orderIndex);
  const routeMap = new Map(routes.map((r) => [`${r.fromDestinationId}-${r.toDestinationId}`, r]));

  const totalMiles = routes.reduce((sum, r) => sum + (r.distanceMiles || 0), 0);
  const totalMinutes = routes.reduce((sum, r) => sum + (r.durationMinutes || 0), 0);

  return (
    <div className="flex flex-col h-full">
      {/* Summary */}
      <div className="p-4 border-b border-ody-border">
        <h3 className="text-lg font-bold">Trip Route</h3>
        <div className="flex gap-4 mt-2 text-sm text-ody-text-muted">
          <span>📍 {destinations.length} stops</span>
          {totalMiles > 0 && <span>📏 {totalMiles.toFixed(0)} mi</span>}
          {totalMinutes > 0 && <span>⏱ {formatDuration(totalMinutes)}</span>}
        </div>
      </div>

      {/* Destination list */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {sorted.map((dest, i) => {
            const nextDest = sorted[i + 1];
            const route = nextDest ? routeMap.get(`${dest.id}-${nextDest.id}`) : undefined;

            return (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <button
                  onClick={() => onSelect(dest.id)}
                  className={`w-full text-left p-4 border-b border-ody-border transition-colors hover:bg-ody-surface-hover ${
                    selectedId === dest.id ? 'bg-ody-surface-hover' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Order indicator */}
                    <div className="flex flex-col items-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: categoryColors[dest.category || 'stop'] }}
                      >
                        {dest.visited ? '✓' : i + 1}
                      </div>
                      {nextDest && (
                        <div className="w-0.5 h-6 bg-ody-border mt-1" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{dest.name}</p>
                      {dest.address && (
                        <p className="text-xs text-ody-text-muted truncate mt-0.5">{dest.address}</p>
                      )}
                      {dest.plannedDate && (
                        <p className="text-xs text-ody-text-muted mt-0.5">📅 {dest.plannedDate}</p>
                      )}
                    </div>
                  </div>
                </button>

                {/* Route info between stops */}
                {route && (
                  <div className="flex items-center gap-2 px-4 py-1.5 text-xs text-ody-text-muted bg-ody-bg/50">
                    <span className="ml-11">
                      {route.distanceMiles && `${route.distanceMiles.toFixed(1)} mi`}
                      {route.distanceMiles && route.durationMinutes && ' · '}
                      {route.durationMinutes && formatDuration(route.durationMinutes)}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-ody-border">
        <div className="flex flex-wrap gap-3 text-xs text-ody-text-muted">
          {Object.entries(categoryColors).map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: color }} />
              <span className="capitalize">{cat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
