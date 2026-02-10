import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DestinationSidebar } from '../components/map/DestinationSidebar';
import { TripMapSidebar } from '../components/map/TripMapSidebar';
import { AddDestinationModal } from '../components/map/AddDestinationModal';
import { RouteDetailPanel } from '../components/map/RouteDetailPanel';
import type { Destination, Route as RouteType } from '../types/destinations';
import type { Trip, TripDestination, TripRoute } from '../types/trips';

const DestinationMap = lazy(() =>
  import('../components/map/DestinationMap').then((m) => ({ default: m.DestinationMap }))
);
const TripDestinationMap = lazy(() =>
  import('../components/map/TripDestinationMap').then((m) => ({ default: m.TripDestinationMap }))
);

export const Route = createFileRoute('/map')({
  component: MapPage,
});

type MapMode = 'global' | 'trip';

function MapPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [mode, setMode] = useState<MapMode>('trip');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showRoutes, setShowRoutes] = useState(true);

  // Fetch trips for selector
  const { data: tripsData } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const res = await fetch('/api/trips');
      return res.json() as Promise<Trip[]>;
    },
  });

  // Auto-select first trip
  const trips = tripsData ?? [];
  const activeTripId = selectedTripId ?? trips[0]?.id ?? null;

  // Fetch global destinations
  const { data: globalData, isLoading: globalLoading } = useQuery({
    queryKey: ['destinations'],
    queryFn: async () => {
      const res = await fetch('/api/destinations');
      return res.json() as Promise<{ destinations: Destination[]; routes: RouteType[] }>;
    },
    enabled: mode === 'global',
  });

  // Fetch trip destinations + routes
  const { data: tripDestsData, isLoading: tripDestsLoading } = useQuery({
    queryKey: ['trip-destinations', activeTripId],
    queryFn: async () => {
      const res = await fetch(`/api/trips/${activeTripId}/destinations`);
      return res.json() as Promise<TripDestination[]>;
    },
    enabled: mode === 'trip' && !!activeTripId,
  });

  const { data: tripRoutesData, isLoading: tripRoutesLoading } = useQuery({
    queryKey: ['trip-routes', activeTripId],
    queryFn: async () => {
      const res = await fetch(`/api/trips/${activeTripId}/routes`);
      return res.json() as Promise<{ routes: TripRoute[] }>;
    },
    enabled: mode === 'trip' && !!activeTripId,
  });

  // Global mutations
  const addMutation = useMutation({
    mutationFn: async (dest: Partial<Destination>) => {
      const res = await fetch('/api/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dest, orderIndex: (globalData?.destinations.length ?? 0) }),
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['destinations'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/destinations/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      setSelectedId(null);
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
    },
  });

  const toggleVisitedMutation = useMutation({
    mutationFn: async (dest: Destination) => {
      await fetch(`/api/destinations/${dest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visited: !dest.visited }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['destinations'] }),
  });

  const destinations = globalData?.destinations ?? [];
  const routes = globalData?.routes ?? [];
  const tripDests = (tripDestsData ?? []).filter((d) => d.lat && d.lng);
  const tripRoutes = tripRoutesData?.routes ?? [];
  const selectedDest = destinations.find((d) => d.id === selectedId);
  const selectedTripDest = tripDests.find((d) => d.id === selectedId);
  const selectedRoute = tripRoutes.find((r) => r.id === selectedRouteId);
  const isLoading = mode === 'global' ? globalLoading : tripDestsLoading || tripRoutesLoading;
  const activeTrip = trips.find((t) => t.id === activeTripId);

  // Filter destinations by category
  const filteredTripDests = filterCategory
    ? tripDests.filter((d) => d.status === filterCategory)
    : tripDests;

  // Stats
  const totalKm = tripRoutes.reduce((sum, r) => sum + (r.distanceKm || 0), 0);
  const totalMiles = tripRoutes.reduce((sum, r) => sum + (r.distanceMiles || 0), 0);
  const totalMinutes = tripRoutes.reduce((sum, r) => sum + (r.durationMinutes || 0), 0);

  return (
    <div className="flex flex-col h-[calc(100vh-73px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ody-border bg-ody-surface">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              🗺️ Destination Map
              {activeTrip && mode === 'trip' && (
                <span className="text-sm font-normal text-ody-text-muted">— {activeTrip.name}</span>
              )}
            </h2>
            {mode === 'trip' && tripDests.length > 0 && (
              <div className="flex gap-3 text-xs text-ody-text-muted mt-1">
                <span>📍 {tripDests.length} destinations</span>
                <span>🛣️ {tripRoutes.length} routes</span>
                {totalKm > 0 && <span>📏 {totalKm.toFixed(0)} km ({totalMiles.toFixed(0)} mi)</span>}
                {totalMinutes > 0 && <span>⏱ {formatDuration(totalMinutes)}</span>}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode toggle */}
          <div className="flex rounded-lg border border-ody-border overflow-hidden text-xs">
            <button
              onClick={() => setMode('trip')}
              className={`px-3 py-1.5 transition-colors ${
                mode === 'trip' ? 'bg-ody-accent text-white' : 'hover:bg-ody-surface-hover'
              }`}
            >
              Trip View
            </button>
            <button
              onClick={() => setMode('global')}
              className={`px-3 py-1.5 transition-colors ${
                mode === 'global' ? 'bg-ody-accent text-white' : 'hover:bg-ody-surface-hover'
              }`}
            >
              All Destinations
            </button>
          </div>

          {/* Trip selector */}
          {mode === 'trip' && trips.length > 0 && (
            <select
              value={activeTripId ?? ''}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="rounded-md border border-ody-border bg-ody-bg px-3 py-1.5 text-sm text-ody-text"
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}

          {/* Route toggle */}
          <button
            onClick={() => setShowRoutes(!showRoutes)}
            className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
              showRoutes
                ? 'border-ody-accent text-ody-accent bg-ody-accent/10'
                : 'border-ody-border text-ody-text-muted hover:bg-ody-surface-hover'
            }`}
          >
            {showRoutes ? '🛣️ Routes On' : '🛣️ Routes Off'}
          </button>

          {mode === 'global' && (
            <button
              onClick={() => setShowAdd(true)}
              className="rounded-md bg-ody-accent px-4 py-2 text-sm font-medium text-white hover:bg-ody-accent-hover transition-colors"
            >
              + Add Destination
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-ody-border bg-ody-surface overflow-hidden shrink-0">
          {mode === 'trip' ? (
            <TripMapSidebar
              destinations={filteredTripDests}
              routes={tripRoutes}
              selectedId={selectedId}
              selectedRouteId={selectedRouteId}
              onSelectDestination={setSelectedId}
              onSelectRoute={setSelectedRouteId}
              filterCategory={filterCategory}
              onFilterChange={setFilterCategory}
            />
          ) : (
            <DestinationSidebar
              destinations={destinations}
              routes={routes}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-ody-text-muted">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-3xl mr-3"
              >
                🌍
              </motion.div>
              Loading map...
            </div>
          ) : (
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full text-ody-text-muted">
                  Loading map...
                </div>
              }
            >
              {mode === 'trip' ? (
                <TripDestinationMap
                  destinations={filteredTripDests}
                  routes={showRoutes ? tripRoutes : []}
                  selectedId={selectedId}
                  selectedRouteId={selectedRouteId}
                  onDestinationClick={(dest) => {
                    setSelectedId(dest.id);
                    setSelectedRouteId(null);
                  }}
                  onRouteClick={(route) => {
                    setSelectedRouteId(route.id);
                    setSelectedId(null);
                  }}
                />
              ) : (
                <DestinationMap
                  destinations={destinations}
                  routes={showRoutes ? routes : []}
                  selectedId={selectedId}
                  onDestinationClick={(dest) => setSelectedId(dest.id)}
                />
              )}
            </Suspense>
          )}

          {/* Selected destination detail panel (global mode) */}
          <AnimatePresence>
            {mode === 'global' && selectedDest && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-4 right-4 max-w-md bg-ody-surface/95 backdrop-blur border border-ody-border rounded-xl p-4 z-[1000]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{selectedDest.name}</h3>
                    {selectedDest.description && (
                      <p className="text-sm text-ody-text-muted mt-1">{selectedDest.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="text-ody-text-muted hover:text-ody-text text-lg"
                  >
                    ×
                  </button>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => toggleVisitedMutation.mutate(selectedDest)}
                    className="rounded-md border border-ody-border px-3 py-1.5 text-xs hover:bg-ody-surface-hover transition-colors"
                  >
                    {selectedDest.visited ? 'Mark Unvisited' : 'Mark Visited ✓'}
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(selectedDest.id)}
                    className="rounded-md border border-ody-danger/50 text-ody-danger px-3 py-1.5 text-xs hover:bg-ody-danger/10 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selected trip destination detail panel */}
          <AnimatePresence>
            {mode === 'trip' && selectedTripDest && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-4 max-w-sm bg-ody-surface/95 backdrop-blur border border-ody-border rounded-xl p-4 z-[1000]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{selectedTripDest.name}</h3>
                    {selectedTripDest.description && (
                      <p className="text-sm text-ody-text-muted mt-1 line-clamp-2">{selectedTripDest.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="text-ody-text-muted hover:text-ody-text text-lg ml-2"
                  >
                    ×
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-ody-text-muted">
                  {selectedTripDest.arrivalDate && (
                    <span className="bg-ody-bg/60 px-2 py-0.5 rounded">📅 {selectedTripDest.arrivalDate}</span>
                  )}
                  <span className={`px-2 py-0.5 rounded ${
                    statusColors[selectedTripDest.status] ?? 'bg-ody-bg/60'
                  }`}>
                    {selectedTripDest.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded ${
                    researchColors[selectedTripDest.researchStatus] ?? 'bg-ody-bg/60'
                  }`}>
                    {selectedTripDest.researchStatus}
                  </span>
                </div>
                {/* Show routes from this destination */}
                {(() => {
                  const outRoutes = tripRoutes.filter((r) => r.fromDestinationId === selectedTripDest.id);
                  const inRoutes = tripRoutes.filter((r) => r.toDestinationId === selectedTripDest.id);
                  if (outRoutes.length === 0 && inRoutes.length === 0) return null;
                  return (
                    <div className="mt-3 border-t border-ody-border pt-2">
                      <p className="text-xs font-semibold text-ody-text-muted mb-1">Routes</p>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {outRoutes.map((r) => (
                          <button
                            key={r.id}
                            onClick={() => { setSelectedRouteId(r.id); setSelectedId(null); }}
                            className="block w-full text-left text-xs hover:bg-ody-surface-hover rounded px-1.5 py-0.5"
                          >
                            → {r.toDestination?.name ?? '?'}{' '}
                            <span className="text-ody-text-muted">
                              {r.distanceKm && `${r.distanceKm}km`}
                              {r.durationMinutes && ` · ${formatDuration(r.durationMinutes)}`}
                            </span>
                          </button>
                        ))}
                        {inRoutes.map((r) => (
                          <button
                            key={r.id}
                            onClick={() => { setSelectedRouteId(r.id); setSelectedId(null); }}
                            className="block w-full text-left text-xs hover:bg-ody-surface-hover rounded px-1.5 py-0.5"
                          >
                            ← {r.fromDestination?.name ?? '?'}{' '}
                            <span className="text-ody-text-muted">
                              {r.distanceKm && `${r.distanceKm}km`}
                              {r.durationMinutes && ` · ${formatDuration(r.durationMinutes)}`}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Route detail panel */}
          <AnimatePresence>
            {selectedRoute && (
              <RouteDetailPanel
                route={selectedRoute}
                onClose={() => setSelectedRouteId(null)}
                onSelectDestination={(id) => {
                  setSelectedId(id);
                  setSelectedRouteId(null);
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <AddDestinationModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={(data) => addMutation.mutate(data)}
      />
    </div>
  );
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const statusColors: Record<string, string> = {
  researched: 'bg-blue-500/20 text-blue-400',
  booked: 'bg-green-500/20 text-green-400',
  visited: 'bg-purple-500/20 text-purple-400',
};

const researchColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  researched: 'bg-blue-500/20 text-blue-400',
  approved: 'bg-green-500/20 text-green-400',
  booked: 'bg-emerald-500/20 text-emerald-400',
};
