import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, MapPin, Calendar, Trash2 } from 'lucide-react';
import type { TripDestination } from '../../types/trips';

interface Props {
  tripId: string;
  items: TripDestination[];
}

export function DestinationsTab({ tripId, items }: Props) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', arrivalDate: '', departureDate: '', lat: '', lng: '' });

  const addMutation = useMutation({
    mutationFn: (data: any) => fetch(`/api/trips/${tripId}/destinations`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, lat: data.lat ? Number(data.lat) : null, lng: data.lng ? Number(data.lng) : null, orderIndex: items.length }),
    }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trip', tripId] }); setShowAdd(false); setForm({ name: '', description: '', arrivalDate: '', departureDate: '', lat: '', lng: '' }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/trips/${tripId}/destinations`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
    }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const sorted = [...items].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Destinations</h3>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ody-accent/10 text-ody-accent text-sm hover:bg-ody-accent/20 transition-colors">
          <Plus size={14} /> Add Destination
        </button>
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
      ) : (
        <div className="space-y-3">
          {sorted.map((dest, i) => (
            <motion.div key={dest.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }} className="glass-card p-4 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-ody-accent/20 text-ody-accent flex items-center justify-center text-sm font-bold flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium">{dest.name}</h4>
                {dest.description && <p className="text-sm text-ody-text-muted mt-1">{dest.description}</p>}
                <div className="flex items-center gap-4 mt-2 text-xs text-ody-text-dim">
                  {dest.arrivalDate && (
                    <span className="flex items-center gap-1"><Calendar size={10} />{dest.arrivalDate} → {dest.departureDate || '?'}</span>
                  )}
                  {dest.lat && dest.lng && (
                    <span className="flex items-center gap-1"><MapPin size={10} />{dest.lat.toFixed(2)}, {dest.lng.toFixed(2)}</span>
                  )}
                </div>
              </div>
              <button onClick={() => deleteMutation.mutate(dest.id)}
                className="text-ody-text-dim hover:text-ody-danger transition-colors p-1">
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
