import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TripDestination, TripRoute } from '../../types/trips';

const statusColors: Record<string, string> = {
  researched: '#3b82f6',
  booked: '#22c55e',
  visited: '#a855f7',
};

const statusEmoji: Record<string, string> = {
  researched: '🔍',
  booked: '✅',
  visited: '🏁',
};

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

interface TripMapSidebarProps {
  destinations: TripDestination[];
  routes: TripRoute[];
  selectedId: string | null;
  selectedRouteId: string | null;
  onSelectDestination: (id: string | null) => void;
  onSelectRoute: (id: string | null) => void;
  filterCategory: string | null;
  onFilterChange: (cat: string | null) => void;
}

type SidebarTab = 'destinations' | 'routes';

export function TripMapSidebar({
  destinations,
  routes,
  selectedId,
  selectedRouteId,
  onSelectDestination,
  onSelectRoute,
  filterCategory,
  onFilterChange,
}: TripMapSidebarProps) {
  const [tab, setTab] = useState<SidebarTab>('destinations');
  const sorted = [...destinations].sort((a, b) => a.orderIndex - b.orderIndex);
  const destMap = new Map(destinations.map((d) => [d.id, d]));

  const totalKm = routes.reduce((sum, r) => sum + (r.distanceKm || 0), 0);
  const totalMinutes = routes.reduce((sum, r) => sum + (r.durationMinutes || 0), 0);

  // Group routes by origin
  const routesByOrigin = new Map<string, TripRoute[]>();
  for (const r of routes) {
    const origin = r.fromDestination?.name || r.fromDestinationId;
    const arr = routesByOrigin.get(origin) ?? [];
    arr.push(r);
    routesByOrigin.set(origin, arr);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Summary header */}
      <div className="p-4 border-b border-ody-border">
        <h3 className="text-lg font-bold">Trip Map</h3>
        <div className="flex gap-3 mt-2 text-xs text-ody-text-muted">
          <span>📍 {destinations.length}</span>
          <span>🛣️ {routes.length}</span>
          {totalKm > 0 && <span>📏 {totalKm.toFixed(0)} km</span>}
          {totalMinutes > 0 && <span>⏱ {formatDuration(totalMinutes)}</span>}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex border-b border-ody-border">
        <button
          onClick={() => setTab('destinations')}
          className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
            tab === 'destinations'
              ? 'text-ody-accent border-b-2 border-ody-accent'
              : 'text-ody-text-muted hover:text-ody-text'
          }`}
        >
          📍 Destinations
        </button>
        <button
          onClick={() => setTab('routes')}
          className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
            tab === 'routes'
              ? 'text-ody-accent border-b-2 border-ody-accent'
              : 'text-ody-text-muted hover:text-ody-text'
          }`}
        >
          🛣️ Routes
        </button>
      </div>

      {/* Filter pills */}
      {tab === 'destinations' && (
        <div className="flex gap-1.5 px-3 py-2 border-b border-ody-border flex-wrap">
          <button
            onClick={() => onFilterChange(null)}
            className={`px-2 py-0.5 rounded-full text-xs transition-colors ${
              !filterCategory ? 'bg-ody-accent text-white' : 'bg-ody-bg text-ody-text-muted hover:bg-ody-surface-hover'
            }`}
          >
            All
          </button>
          {Object.entries(statusColors).map(([status, color]) => (
            <button
              key={status}
              onClick={() => onFilterChange(filterCategory === status ? null : status)}
              className={`px-2 py-0.5 rounded-full text-xs transition-colors ${
                filterCategory === status ? 'text-white' : 'text-ody-text-muted hover:bg-ody-surface-hover'
              }`}
              style={filterCategory === status ? { background: color } : { background: 'var(--color-ody-bg)' }}
            >
              {statusEmoji[status]} {status}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'destinations' ? (
          <AnimatePresence mode="popLayout">
            {sorted.map((dest, i) => (
              <motion.button
                key={dest.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => onSelectDestination(dest.id === selectedId ? null : dest.id)}
                className={`w-full text-left p-3 border-b border-ody-border transition-colors hover:bg-ody-surface-hover ${
                  selectedId === dest.id ? 'bg-ody-surface-hover ring-l-2 ring-ody-accent' : ''
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                    style={{ background: statusColors[dest.status] || '#8b5cf6' }}
                  >
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{dest.name}</p>
                    {dest.description && (
                      <p className="text-xs text-ody-text-muted truncate mt-0.5">{dest.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {dest.arrivalDate && (
                        <span className="text-[10px] text-ody-text-muted bg-ody-bg/60 px-1.5 py-0.5 rounded">
                          📅 {dest.arrivalDate}
                        </span>
                      )}
                      <span className="text-[10px] capitalize" style={{ color: statusColors[dest.status] }}>
                        {statusEmoji[dest.status]} {dest.status}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        ) : (
          <div className="divide-y divide-ody-border">
            {[...routesByOrigin.entries()].map(([origin, originRoutes]) => (
              <div key={origin}>
                <div className="px-3 py-2 bg-ody-bg/50 text-xs font-semibold text-ody-text-muted">
                  From {origin}
                </div>
                {originRoutes.map((route) => {
                  const toDest = route.toDestination ?? destMap.get(route.toDestinationId);
                  const isSelected = route.id === selectedRouteId;
                  return (
                    <button
                      key={route.id}
                      onClick={() => onSelectRoute(isSelected ? null : route.id)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-ody-surface-hover transition-colors ${
                        isSelected ? 'bg-ody-surface-hover' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">
                          → {toDest?.name ?? '?'}
                        </span>
                        <span className="text-xs text-ody-text-muted shrink-0 ml-2">
                          {route.distanceKm && `${route.distanceKm}km`}
                        </span>
                      </div>
                      <div className="flex gap-2 text-[10px] text-ody-text-muted mt-0.5">
                        {route.durationMinutes && <span>⏱ {formatDuration(route.durationMinutes)}</span>}
                        {route.tolls && <span>💰 Tolls</span>}
                        {route.highway && <span>🛣️ Hwy</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="p-3 border-t border-ody-border">
        <div className="flex flex-wrap gap-3 text-xs text-ody-text-muted">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: color }} />
              <span className="capitalize">{status}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 bg-indigo-500" />
            <span>Hub route</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 bg-purple-500" />
            <span>Route</span>
          </div>
        </div>
      </div>
    </div>
  );
}
