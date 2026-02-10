import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Check, Clock, MapPin, Trash2 } from 'lucide-react';
import type { ItineraryItem } from '../../types/trips';

interface Props {
  tripId: string;
  items: ItineraryItem[];
}

const categoryIcons: Record<string, string> = {
  activity: '🎯',
  transport: '🚗',
  meal: '🍽️',
  sightseeing: '📸',
  rest: '😴',
};

export function ItineraryTab({ tripId, items }: Props) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', startTime: '', endTime: '', location: '', category: 'activity', description: '' });

  const addMutation = useMutation({
    mutationFn: (data: typeof form) => fetch(`/api/trips/${tripId}/itinerary`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trip', tripId] }); setShowAdd(false); setForm({ title: '', date: '', startTime: '', endTime: '', location: '', category: 'activity', description: '' }); },
  });

  const toggleMutation = useMutation({
    mutationFn: (item: ItineraryItem) => fetch(`/api/trips/${tripId}/itinerary`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, completed: !item.completed }),
    }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/trips/${tripId}/itinerary`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
    }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  // Group by date
  const grouped = items.reduce<Record<string, ItineraryItem[]>>((acc, item) => {
    (acc[item.date] ||= []).push(item);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Itinerary</h3>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ody-accent/10 text-ody-accent text-sm hover:bg-ody-accent/20 transition-colors">
          <Plus size={14} /> Add Item
        </button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="glass-card p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder="Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
            <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
            <input type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
            <input type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
            <input placeholder="Location" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent">
              <option value="activity">Activity</option>
              <option value="transport">Transport</option>
              <option value="meal">Meal</option>
              <option value="sightseeing">Sightseeing</option>
              <option value="rest">Rest</option>
            </select>
          </div>
          <textarea placeholder="Description (optional)" value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent resize-none h-20" />
          <div className="flex gap-2">
            <button onClick={() => addMutation.mutate(form)} disabled={!form.title || !form.date}
              className="px-4 py-2 rounded-lg bg-ody-accent text-white text-sm hover:bg-ody-accent-hover disabled:opacity-50 transition-colors">Save</button>
            <button onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-lg border border-ody-border text-sm hover:bg-ody-surface-hover transition-colors">Cancel</button>
          </div>
        </motion.div>
      )}

      {sortedDates.length === 0 ? (
        <p className="text-ody-text-muted text-center py-8">No itinerary items yet. Start planning your day!</p>
      ) : (
        sortedDates.map(date => (
          <div key={date} className="space-y-2">
            <h4 className="text-sm font-semibold text-ody-accent">{new Date(date + 'T00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h4>
            <div className="space-y-2">
              {grouped[date].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || '')).map(item => (
                <motion.div key={item.id} layout
                  className={`glass-card p-4 flex items-start gap-3 ${item.completed ? 'opacity-60' : ''}`}>
                  <button onClick={() => toggleMutation.mutate(item)}
                    className={`mt-0.5 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors
                      ${item.completed ? 'bg-ody-success border-ody-success' : 'border-ody-border hover:border-ody-accent'}`}>
                    {item.completed && <Check size={12} className="text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span>{categoryIcons[item.category] || '🎯'}</span>
                      <span className={`font-medium ${item.completed ? 'line-through' : ''}`}>{item.title}</span>
                    </div>
                    {item.description && <p className="text-sm text-ody-text-muted mt-1">{item.description}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-ody-text-dim">
                      {item.startTime && <span className="flex items-center gap-1"><Clock size={10} />{item.startTime}{item.endTime && ` – ${item.endTime}`}</span>}
                      {item.location && <span className="flex items-center gap-1"><MapPin size={10} />{item.location}</span>}
                    </div>
                  </div>
                  <button onClick={() => deleteMutation.mutate(item.id)}
                    className="text-ody-text-dim hover:text-ody-danger transition-colors p-1">
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
