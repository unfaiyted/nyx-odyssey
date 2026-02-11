import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addTripDestination, deleteTripDestination, updateTripDestination } from '../../server/fns/trip-details';
import { getDestinationResearchSummaries } from '../../server/trip-destinations';
import { motion } from 'framer-motion';
import { Plus, LayoutGrid, List, Filter } from 'lucide-react';
import type { TripDestination, ResearchStatus } from '../../types/trips';
import { DestinationCard } from './DestinationCard';

interface Props {
  tripId: string;
  items: TripDestination[];
}

const RESEARCH_FILTERS: { value: ResearchStatus | 'all'; label: string; emoji: string }[] = [
  { value: 'all', label: 'All', emoji: '📋' },
  { value: 'not_started', label: 'Not Started', emoji: '⬜' },
  { value: 'basic', label: 'Basic', emoji: '🟡' },
  { value: 'fully_researched', label: 'Fully Researched', emoji: '🟢' },
  { value: 'booked', label: 'Booked', emoji: '✅' },
];

export function DestinationsTab({ tripId, items }: Props) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [researchFilter, setResearchFilter] = useState<ResearchStatus | 'all'>('all');
  const [form, setForm] = useState({ name: '', description: '', arrivalDate: '', departureDate: '', lat: '', lng: '', photoUrl: '' });

  const { data: researchSummaries } = useQuery({
    queryKey: ['trip', tripId, 'research-summaries'],
    queryFn: () => getDestinationResearchSummaries({ data: { tripId } }),
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => addTripDestination({ data: { tripId, ...data, lat: data.lat ? Number(data.lat) : null, lng: data.lng ? Number(data.lng) : null, orderIndex: items.length } }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trip', tripId] }); queryClient.invalidateQueries({ queryKey: ['trip', tripId, 'research-summaries'] }); setShowAdd(false); setForm({ name: '', description: '', arrivalDate: '', departureDate: '', lat: '', lng: '', photoUrl: '' }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTripDestination({ data: { tripId, id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateTripDestination({ data: { tripId, id, status } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const updatePhotoMutation = useMutation({
    mutationFn: ({ id, photoUrl }: { id: string; photoUrl: string }) => updateTripDestination({ data: { tripId, id, photoUrl } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const updateResearchStatusMutation = useMutation({
    mutationFn: ({ id, researchStatus }: { id: string; researchStatus: ResearchStatus }) => updateTripDestination({ data: { tripId, id, researchStatus } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const sorted = [...items].sort((a, b) => a.orderIndex - b.orderIndex);
  const filtered = researchFilter === 'all'
    ? sorted
    : sorted.filter(d => (d.researchStatus || 'not_started') === researchFilter);

  const base = sorted[0];
  const baseLat = base?.lat;
  const baseLng = base?.lng;

  const statusCounts = RESEARCH_FILTERS.reduce((acc, f) => {
    acc[f.value] = f.value === 'all' ? items.length : items.filter(d => (d.researchStatus || 'not_started') === f.value).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Destinations</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-ody-surface rounded-lg border border-ody-border p-0.5">
            <button onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-ody-accent/20 text-ody-accent' : 'text-ody-text-dim hover:text-ody-text-muted'}`}>
              <LayoutGrid size={14} />
            </button>
            <button onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-ody-accent/20 text-ody-accent' : 'text-ody-text-dim hover:text-ody-text-muted'}`}>
              <List size={14} />
            </button>
          </div>
          <button onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ody-accent/10 text-ody-accent text-sm hover:bg-ody-accent/20 transition-colors">
            <Plus size={14} /> Add Destination
          </button>
        </div>
      </div>

      {/* Research status filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-ody-text-dim" />
        {RESEARCH_FILTERS.map((f) => (
          <button key={f.value} onClick={() => setResearchFilter(f.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              researchFilter === f.value
                ? 'bg-ody-accent/20 text-ody-accent border border-ody-accent/40'
                : 'bg-ody-surface border border-ody-border text-ody-text-muted hover:border-ody-accent/30'
            }`}>
            <span>{f.emoji}</span>
            {f.label}
            <span className="ml-1 text-ody-text-dim">({statusCounts[f.value]})</span>
          </button>
        ))}
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

      {filtered.length === 0 ? (
        <p className="text-ody-text-muted text-center py-8">
          {researchFilter !== 'all' ? `No destinations with "${RESEARCH_FILTERS.find(f => f.value === researchFilter)?.label}" status.` : 'No destinations added yet.'}
        </p>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((dest, i) => (
            <DestinationCard key={dest.id} destination={dest} index={i} baseLat={baseLat} baseLng={baseLng}
              onDelete={(id) => deleteMutation.mutate(id)}
              onStatusChange={(id, status) => updateStatusMutation.mutate({ id, status })}
              onResearchStatusChange={(id, researchStatus) => updateResearchStatusMutation.mutate({ id, researchStatus })}
              onPhotoChange={(id, photoUrl) => updatePhotoMutation.mutate({ id, photoUrl })}
              research={researchSummaries?.[dest.id]} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((dest, i) => (
            <DestinationCard key={dest.id} destination={dest} index={i} baseLat={baseLat} baseLng={baseLng}
              onDelete={(id) => deleteMutation.mutate(id)}
              onStatusChange={(id, status) => updateStatusMutation.mutate({ id, status })}
              onResearchStatusChange={(id, researchStatus) => updateResearchStatusMutation.mutate({ id, researchStatus })}
              onPhotoChange={(id, photoUrl) => updatePhotoMutation.mutate({ id, photoUrl })}
              research={researchSummaries?.[dest.id]} />
          ))}
        </div>
      )}
    </div>
  );
}
