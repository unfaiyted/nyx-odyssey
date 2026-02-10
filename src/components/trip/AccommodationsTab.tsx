import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Calendar, DollarSign, Trash2, CheckCircle, Circle } from 'lucide-react';
import type { Accommodation } from '../../types/trips';

interface Props {
  tripId: string;
  items: Accommodation[];
}

const typeLabels: Record<string, string> = {
  hotel: '🏨 Hotel',
  hostel: '🛏️ Hostel',
  airbnb: '🏠 Airbnb',
  camping: '⛺ Camping',
  other: '📍 Other',
};

export function AccommodationsTab({ tripId, items }: Props) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'hotel', address: '', checkIn: '', checkOut: '', costPerNight: '', totalCost: '', confirmationCode: '', notes: '' });

  const addMutation = useMutation({
    mutationFn: (data: any) => fetch(`/api/trips/${tripId}/accommodations`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trip', tripId] }); setShowAdd(false); setForm({ name: '', type: 'hotel', address: '', checkIn: '', checkOut: '', costPerNight: '', totalCost: '', confirmationCode: '', notes: '' }); },
  });

  const toggleBookedMutation = useMutation({
    mutationFn: (item: Accommodation) => fetch(`/api/trips/${tripId}/accommodations`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, booked: !item.booked }),
    }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/trips/${tripId}/accommodations`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
    }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Accommodations</h3>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ody-accent/10 text-ody-accent text-sm hover:bg-ody-accent/20 transition-colors">
          <Plus size={14} /> Add Accommodation
        </button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder="Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent">
              <option value="hotel">Hotel</option><option value="hostel">Hostel</option>
              <option value="airbnb">Airbnb</option><option value="camping">Camping</option>
              <option value="other">Other</option>
            </select>
            <input placeholder="Address" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent md:col-span-2" />
            <input type="date" placeholder="Check-in" value={form.checkIn} onChange={e => setForm(p => ({ ...p, checkIn: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
            <input type="date" placeholder="Check-out" value={form.checkOut} onChange={e => setForm(p => ({ ...p, checkOut: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
            <input placeholder="Cost/night" value={form.costPerNight} onChange={e => setForm(p => ({ ...p, costPerNight: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
            <input placeholder="Total cost" value={form.totalCost} onChange={e => setForm(p => ({ ...p, totalCost: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
            <input placeholder="Confirmation code" value={form.confirmationCode} onChange={e => setForm(p => ({ ...p, confirmationCode: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent md:col-span-2" />
          </div>
          <textarea placeholder="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent resize-none h-20" />
          <div className="flex gap-2">
            <button onClick={() => addMutation.mutate(form)} disabled={!form.name}
              className="px-4 py-2 rounded-lg bg-ody-accent text-white text-sm hover:bg-ody-accent-hover disabled:opacity-50 transition-colors">Save</button>
            <button onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-lg border border-ody-border text-sm hover:bg-ody-surface-hover transition-colors">Cancel</button>
          </div>
        </motion.div>
      )}

      {items.length === 0 ? (
        <p className="text-ody-text-muted text-center py-8">No accommodations added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="glass-card p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{typeLabels[item.type] || typeLabels.other}</span>
                    <h4 className="font-medium">{item.name}</h4>
                  </div>
                  {item.address && <p className="text-xs text-ody-text-dim mt-1">{item.address}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleBookedMutation.mutate(item)}
                    className={`p-1 transition-colors ${item.booked ? 'text-ody-success' : 'text-ody-text-dim hover:text-ody-accent'}`}
                    title={item.booked ? 'Booked' : 'Not booked'}>
                    {item.booked ? <CheckCircle size={16} /> : <Circle size={16} />}
                  </button>
                  <button onClick={() => deleteMutation.mutate(item.id)}
                    className="text-ody-text-dim hover:text-ody-danger transition-colors p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-ody-text-dim">
                {item.checkIn && <span className="flex items-center gap-1"><Calendar size={10} />{item.checkIn} → {item.checkOut || '?'}</span>}
                {item.totalCost && <span className="flex items-center gap-1"><DollarSign size={10} />${item.totalCost}</span>}
                {item.costPerNight && <span>${item.costPerNight}/night</span>}
              </div>
              {item.confirmationCode && (
                <div className="text-xs bg-ody-bg rounded px-2 py-1 font-mono text-ody-text-muted">
                  Conf: {item.confirmationCode}
                </div>
              )}
              {item.notes && <p className="text-sm text-ody-text-muted">{item.notes}</p>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
