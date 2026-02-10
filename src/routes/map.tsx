import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, lazy, Suspense } from 'react';
import { DestinationSidebar } from '../components/map/DestinationSidebar';
import { AddDestinationModal } from '../components/map/AddDestinationModal';
import type { Destination, Route as RouteType } from '../types/destinations';

const DestinationMap = lazy(() =>
  import('../components/map/DestinationMap').then((m) => ({ default: m.DestinationMap }))
);

export const Route = createFileRoute('/map')({
  component: MapPage,
});

function MapPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['destinations'],
    queryFn: async () => {
      const res = await fetch('/api/destinations');
      return res.json() as Promise<{ destinations: Destination[]; routes: RouteType[] }>;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (dest: Partial<Destination>) => {
      const res = await fetch('/api/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dest, orderIndex: (data?.destinations.length ?? 0) }),
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

  const destinations = data?.destinations ?? [];
  const routes = data?.routes ?? [];
  const selectedDest = destinations.find((d) => d.id === selectedId);

  return (
    <div className="flex flex-col h-[calc(100vh-73px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ody-border">
        <div>
          <h2 className="text-xl font-bold">Destination Map</h2>
          <p className="text-sm text-ody-text-muted">Plan your route and track destinations</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="rounded-md bg-ody-accent px-4 py-2 text-sm font-medium text-white hover:bg-ody-accent-hover transition-colors"
        >
          + Add Destination
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-ody-border bg-ody-surface overflow-hidden shrink-0">
          <DestinationSidebar
            destinations={destinations}
            routes={routes}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-ody-text-muted">
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
              <DestinationMap
                destinations={destinations}
                routes={routes}
                selectedId={selectedId}
                onDestinationClick={(dest) => setSelectedId(dest.id)}
              />
            </Suspense>
          )}

          {/* Selected destination detail panel */}
          {selectedDest && (
            <div className="absolute bottom-4 left-4 right-4 max-w-md bg-ody-surface/95 backdrop-blur border border-ody-border rounded-xl p-4 z-[1000]">
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
            </div>
          )}
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
