import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Plane, Clock, Trash2 } from 'lucide-react';
import type { Flight } from '../../types/trips';

interface Props {
  tripId: string;
  items: Flight[];
}

const statusColors: Record<string, string> = {
  confirmed: 'bg-ody-success/20 text-ody-success',
  cancelled: 'bg-ody-danger/20 text-ody-danger',
  delayed: 'bg-ody-warning/20 text-ody-warning',
};

function formatTime(time: string | null): string {
  if (!time) return '--:--';
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

function formatDate(date: string): string {
  const d = new Date(date + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function FlightCard({ flight, index, onDelete }: { flight: Flight; index: number; onDelete: (id: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card p-0 overflow-hidden"
    >
      {/* Airline header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-ody-accent/10 border-b border-ody-border">
        <div className="flex items-center gap-2">
          <Plane size={14} className="text-ody-accent" />
          <span className="font-semibold text-sm text-ody-accent">{flight.airline}</span>
          <span className="text-xs text-ody-text-muted font-mono">{flight.flightNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          {flight.confirmationCode && (
            <span className="text-xs bg-ody-bg rounded px-2 py-0.5 font-mono text-ody-text-muted">
              {flight.confirmationCode}
            </span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[flight.status] || statusColors.confirmed}`}>
            {flight.status}
          </span>
          <button onClick={() => onDelete(flight.id)}
            className="text-ody-text-dim hover:text-ody-danger transition-colors p-1">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Visual flight timeline */}
      <div className="px-4 py-5">
        <div className="flex items-center gap-4">
          {/* Departure */}
          <div className="flex-1 text-right">
            <div className="text-2xl font-bold tracking-tight">{flight.departureAirport}</div>
            <div className="text-xs text-ody-text-dim">{flight.departureCity || ''}</div>
            <div className="text-sm font-medium mt-1">{formatTime(flight.departureTime)}</div>
            <div className="text-xs text-ody-text-dim">{formatDate(flight.departureDate)}</div>
          </div>

          {/* Timeline connector */}
          <div className="flex-1 flex flex-col items-center gap-1 min-w-[120px]">
            {flight.duration && (
              <span className="text-xs text-ody-text-dim flex items-center gap-1">
                <Clock size={10} /> {flight.duration}
              </span>
            )}
            <div className="relative w-full flex items-center">
              <div className="w-3 h-3 rounded-full bg-ody-accent border-2 border-ody-accent/30 z-10" />
              <div className="flex-1 h-0.5 bg-gradient-to-r from-ody-accent/60 via-ody-accent/30 to-ody-accent/60 relative">
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2"
                  animate={{ left: ['10%', '90%', '10%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Plane size={12} className="text-ody-accent -rotate-0" />
                </motion.div>
              </div>
              <div className="w-3 h-3 rounded-full bg-ody-accent border-2 border-ody-accent/30 z-10" />
            </div>
            {flight.class && flight.class !== 'economy' && (
              <span className="text-xs text-ody-text-dim capitalize">{flight.class}</span>
            )}
          </div>

          {/* Arrival */}
          <div className="flex-1 text-left">
            <div className="text-2xl font-bold tracking-tight">{flight.arrivalAirport}</div>
            <div className="text-xs text-ody-text-dim">{flight.arrivalCity || ''}</div>
            <div className="text-sm font-medium mt-1">{formatTime(flight.arrivalTime)}</div>
            <div className="text-xs text-ody-text-dim">{formatDate(flight.arrivalDate)}</div>
          </div>
        </div>

        {/* Extra details row */}
        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-ody-border/50 text-xs text-ody-text-dim">
          {flight.seatNumber && <span>Seat: <strong className="text-ody-text-muted">{flight.seatNumber}</strong></span>}
          {flight.class && <span className="capitalize">{flight.class} class</span>}
          {flight.notes && <span className="text-ody-text-muted">{flight.notes}</span>}
        </div>
      </div>
    </motion.div>
  );
}

export function FlightsTab({ tripId, items }: Props) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    airline: '', flightNumber: '', confirmationCode: '', departureAirport: '', departureCity: '',
    arrivalAirport: '', arrivalCity: '', departureDate: '', departureTime: '', arrivalDate: '',
    arrivalTime: '', duration: '', seatNumber: '', class: 'economy', notes: '',
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => fetch(`/api/trips/${tripId}/flights`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      setShowAdd(false);
      setForm({ airline: '', flightNumber: '', confirmationCode: '', departureAirport: '', departureCity: '',
        arrivalAirport: '', arrivalCity: '', departureDate: '', departureTime: '', arrivalDate: '',
        arrivalTime: '', duration: '', seatNumber: '', class: 'economy', notes: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/trips/${tripId}/flights`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
    }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  // Re-render cards with working delete
  const sorted = [...items].sort((a, b) => {
    const dateA = `${a.departureDate}T${a.departureTime || '00:00'}`;
    const dateB = `${b.departureDate}T${b.departureTime || '00:00'}`;
    return dateA.localeCompare(dateB);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Plane size={20} /> Flights
          {items.length > 0 && (
            <span className="text-xs bg-ody-accent/10 text-ody-accent rounded-full px-2 py-0.5">
              {items.length} {items.length === 1 ? 'flight' : 'flights'}
            </span>
          )}
        </h3>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ody-accent/10 text-ody-accent text-sm hover:bg-ody-accent/20 transition-colors">
          <Plus size={14} /> Add Flight
        </button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input placeholder="Airline (e.g. American Airlines)" value={form.airline} onChange={e => setForm(p => ({ ...p, airline: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
            <input placeholder="Flight # (e.g. AA 1234)" value={form.flightNumber} onChange={e => setForm(p => ({ ...p, flightNumber: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
            <input placeholder="Confirmation code" value={form.confirmationCode} onChange={e => setForm(p => ({ ...p, confirmationCode: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs text-ody-text-dim font-medium">Departure</label>
              <input placeholder="Airport code (e.g. DFW)" value={form.departureAirport} onChange={e => setForm(p => ({ ...p, departureAirport: e.target.value }))}
                className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
              <input placeholder="City" value={form.departureCity} onChange={e => setForm(p => ({ ...p, departureCity: e.target.value }))}
                className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
              <input type="date" value={form.departureDate} onChange={e => setForm(p => ({ ...p, departureDate: e.target.value }))}
                className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
              <input type="time" value={form.departureTime} onChange={e => setForm(p => ({ ...p, departureTime: e.target.value }))}
                className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-ody-text-dim font-medium">Arrival</label>
              <input placeholder="Airport code (e.g. VCE)" value={form.arrivalAirport} onChange={e => setForm(p => ({ ...p, arrivalAirport: e.target.value }))}
                className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
              <input placeholder="City" value={form.arrivalCity} onChange={e => setForm(p => ({ ...p, arrivalCity: e.target.value }))}
                className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
              <input type="date" value={form.arrivalDate} onChange={e => setForm(p => ({ ...p, arrivalDate: e.target.value }))}
                className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
              <input type="time" value={form.arrivalTime} onChange={e => setForm(p => ({ ...p, arrivalTime: e.target.value }))}
                className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input placeholder="Duration (e.g. 10h 30m)" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
            <input placeholder="Seat #" value={form.seatNumber} onChange={e => setForm(p => ({ ...p, seatNumber: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
            <select value={form.class} onChange={e => setForm(p => ({ ...p, class: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent">
              <option value="economy">Economy</option><option value="premium_economy">Premium Economy</option>
              <option value="business">Business</option><option value="first">First</option>
            </select>
          </div>
          <textarea placeholder="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent resize-none h-16" />
          <div className="flex gap-2">
            <button onClick={() => addMutation.mutate(form)} disabled={!form.airline || !form.flightNumber || !form.departureAirport || !form.arrivalAirport || !form.departureDate || !form.arrivalDate}
              className="px-4 py-2 rounded-lg bg-ody-accent text-white text-sm hover:bg-ody-accent-hover disabled:opacity-50 transition-colors">Save</button>
            <button onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-lg border border-ody-border text-sm hover:bg-ody-surface-hover transition-colors">Cancel</button>
          </div>
        </motion.div>
      )}

      {items.length === 0 ? (
        <p className="text-ody-text-muted text-center py-8">No flights added yet.</p>
      ) : (
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-ody-border" />

          <div className="space-y-2">
            {sorted.map((flight, i) => (
              <div key={flight.id} className="relative flex gap-4">
                <div className="relative z-10 flex-shrink-0 w-12 flex items-start justify-center pt-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.15 }}
                    className="w-4 h-4 rounded-full bg-ody-accent shadow-lg shadow-ody-accent/30"
                  />
                </div>
                <div className="flex-1 pb-4">
                  <FlightCard flight={flight} index={i} onDelete={(id) => deleteMutation.mutate(id)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
