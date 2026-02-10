import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, LayoutGrid, List } from 'lucide-react';
import type { TripDestination } from '../../types/trips';
import { DestinationCard } from './DestinationCard';

interface Props {
  tripId: string;
  items: TripDestination[];
}

export function DestinationsTab({ tripId, items }: Props) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [form, setForm] = useState({ name: '', description: '', arrivalDate: '', departureDate: '', lat: '', lng: '', photoUrl: '' });

  const addMutation = useMutation({
    mutationFn: (data: any) => fetch(`/api/trips/${tripId}/destinations`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, lat: data.lat ? Number(data.lat) : null, lng: data.lng ? Number(data.lng) : null, orderIndex: items.length }),
    }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trip', tripId] }); setShowAdd(false); setForm({ name: '', description: '', arrivalDate: '', departureDate: '', lat: '', lng: '', photoUrl: '' }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/trips/${tripId}/destinations`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
    }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => fetch(`/api/trips/${tripId}/destinations`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const sorted = [...items].sort((a, b) => a.orderIndex - b.orderIndex);

  // Use first destination as base for distance calculation
  const base = sorted[0];
  const baseLat = base?.lat;
  const baseLng = base?.lng;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Destinations</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-ody-surface rounded-lg border border-ody-border p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-ody-accent/20 text-ody-accent' : 'text-ody-text-dim hover:text-ody-text-muted'}`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-ody-accent/20 text-ody-accent' : 'text-ody-text-dim hover:text-ody-text-muted'}`}
            >
              <List size={14} />
            </button>
          </div>
          <button onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ody-accent/10 text-ody-accent text-sm hover:bg-ody-accent/20 transition-colors">
            <Plus size={14} /> Add Destination
          </button>
        </div>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder="Destination name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
            <input placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
            <input type="date" placeholder="Arrival" value={form.arrivalDate} onChange={e => setForm(p => ({ ...p, arrivalDate: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
            <input type="date" placeholder="Departure" value={form.departureDate} onChange={e => setForm(p => ({ ...p, departureDate: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
            <input placeholder="Latitude" value={form.lat} onChange={e => setForm(p => ({ ...p, lat: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
            <input placeholder="Longitude" value={form.lng} onChange={e => setForm(p => ({ ...p, lng: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
            <input placeholder="Photo URL (optional)" value={form.photoUrl} onChange={e => setForm(p => ({ ...p, photoUrl: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent md:col-span-2" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => addMutation.mutate(form)} disabled={!form.name}
              className="px-4 py-2 rounded-lg bg-ody-accent text-white text-sm hover:bg-ody-accent-hover disabled:opacity-50 transition-colors">Save</button>
            <button onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-lg border border-ody-border text-sm hover:bg-ody-surface-hover transition-colors">Cancel</button>
          </div>
        </motion.div>
      )}

      {sorted.length === 0 ? (
        <p className="text-ody-text-muted text-center py-8">No destinations added yet.</p>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((dest, i) => (
            <DestinationCard
              key={dest.id}
              destination={dest}
              index={i}
              baseLat={baseLat}
              baseLng={baseLng}
              onDelete={(id) => deleteMutation.mutate(id)}
              onStatusChange={(id, status) => updateStatusMutation.mutate({ id, status })}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((dest, i) => (
            <DestinationCard
              key={dest.id}
              destination={dest}
              index={i}
              baseLat={baseLat}
              baseLng={baseLng}
              onDelete={(id) => deleteMutation.mutate(id)}
              onStatusChange={(id, status) => updateStatusMutation.mutate({ id, status })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
