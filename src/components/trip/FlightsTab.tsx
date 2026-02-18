import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addFlight, updateFlight, deleteFlight } from '../../server/fns/trip-details';
import { motion } from 'framer-motion';
import { Plus, Plane, Clock, Trash2, Calendar, Ticket, Search, Edit3, DollarSign, Users, X } from 'lucide-react';
import type { Flight } from '../../types/trips';
import { FlightResearchTab } from './FlightResearchTab';

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

function formatDateShort(date: string): string {
  const d = new Date(date + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Group flights into journeys by confirmation code or date proximity */
function groupFlightLegs(flights: Flight[]): { label: string; legs: Flight[]; confirmationCode?: string }[] {
  const sorted = [...flights].sort((a, b) => {
    const dateA = `${a.departureDate}T${a.departureTime || '00:00'}`;
    const dateB = `${b.departureDate}T${b.departureTime || '00:00'}`;
    return dateA.localeCompare(dateB);
  });

  if (sorted.length === 0) return [];

  // Group by confirmation code
  const byCode = new Map<string, Flight[]>();
  const noCode: Flight[] = [];
  for (const f of sorted) {
    if (f.confirmationCode) {
      const existing = byCode.get(f.confirmationCode) || [];
      existing.push(f);
      byCode.set(f.confirmationCode, existing);
    } else {
      noCode.push(f);
    }
  }

  const groups: { label: string; legs: Flight[]; confirmationCode?: string }[] = [];

  for (const [code, legs] of Array.from(byCode.entries())) {
    // Split into outbound/return by finding the midpoint
    if (legs.length > 2) {
      const firstDep = legs[0].departureAirport;
      const splitIdx = legs.findIndex((f, i) => i > 0 && f.departureAirport !== legs[i - 1].arrivalAirport);
      // Or check if a later flight departs from the final destination back
      const returnIdx = legs.findIndex((f, i) => i > 0 && f.arrivalAirport === firstDep);

      if (returnIdx > 0) {
        const outbound = legs.slice(0, returnIdx);
        const returnLegs = legs.slice(returnIdx);
        groups.push({ label: `Outbound — ${outbound[0].departureAirport} → ${outbound[outbound.length - 1].arrivalAirport}`, legs: outbound, confirmationCode: code });
        groups.push({ label: `Return — ${returnLegs[0].departureAirport} → ${returnLegs[returnLegs.length - 1].arrivalAirport}`, legs: returnLegs, confirmationCode: code });
        continue;
      }
    }
    const first = legs[0];
    const last = legs[legs.length - 1];
    groups.push({ label: `${first.departureAirport} → ${last.arrivalAirport}`, legs, confirmationCode: code });
  }

  if (noCode.length > 0) {
    groups.push({ label: 'Other Flights', legs: noCode });
  }

  return groups;
}

/** Journey overview banner showing the full route */
function JourneyOverview({ flights }: { flights: Flight[] }) {
  const sorted = [...flights].sort((a, b) => {
    const dateA = `${a.departureDate}T${a.departureTime || '00:00'}`;
    const dateB = `${b.departureDate}T${b.departureTime || '00:00'}`;
    return dateA.localeCompare(dateB);
  });

  if (sorted.length === 0) return null;

  // Build unique airport stops in order
  const stops: string[] = [sorted[0].departureAirport];
  for (const f of sorted) {
    if (stops[stops.length - 1] !== f.departureAirport) stops.push(f.departureAirport);
    if (stops[stops.length - 1] !== f.arrivalAirport) stops.push(f.arrivalAirport);
  }

  const confirmationCode = sorted[0].confirmationCode;
  const totalFlights = sorted.length;
  const firstDate = sorted[0].departureDate;
  const lastDate = sorted[sorted.length - 1].arrivalDate;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 bg-gradient-to-br from-ody-accent/5 via-ody-surface to-ody-surface"
    >
      {/* Header with confirmation */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ody-accent/15 flex items-center justify-center">
            <Plane size={20} className="text-ody-accent" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">American Airlines</h4>
            <p className="text-xs text-ody-text-dim">{totalFlights} flights · {formatDateShort(firstDate)} — {formatDateShort(lastDate)}</p>
          </div>
        </div>
        {confirmationCode && (
          <div className="flex items-center gap-2 bg-ody-bg/80 rounded-lg px-3 py-2 border border-ody-border/50">
            <Ticket size={14} className="text-ody-accent" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-ody-text-dim leading-none">Confirmation</div>
              <div className="font-mono font-bold text-sm tracking-wider text-ody-accent">{confirmationCode}</div>
            </div>
          </div>
        )}
      </div>

      {/* Visual route map */}
      <div className="relative px-2">
        <div className="flex items-center justify-between">
          {stops.map((stop, i) => (
            <div key={`${stop}-${i}`} className="flex flex-col items-center z-10 relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                  ${i === 0 || i === stops.length - 1
                    ? 'bg-ody-accent text-white shadow-lg shadow-ody-accent/30'
                    : 'bg-ody-surface border-2 border-ody-accent/40 text-ody-accent'
                  }`}
              >
                {stop}
              </motion.div>
              <span className="text-[10px] text-ody-text-dim mt-1">
                {i === 0 ? 'Origin' : i === stops.length - 1 ? 'Home' : ''}
              </span>
            </div>
          ))}
        </div>
        {/* Connecting line behind the stops */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-gradient-to-r from-ody-accent via-ody-accent/40 to-ody-accent -z-0" />
      </div>
    </motion.div>
  );
}

function FlightCard({ flight, index, onDelete, onEdit }: { flight: Flight; index: number; onDelete: (id: string) => void; onEdit?: (flight: Flight) => void }) {
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
          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[flight.status] || statusColors.confirmed}`}>
            {flight.status}
          </span>
          {onEdit && (
            <button onClick={() => onEdit(flight)}
              className="text-ody-text-dim hover:text-ody-accent transition-colors p-1">
              <Edit3 size={14} />
            </button>
          )}
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
                  <Plane size={12} className="text-ody-accent" />
                </motion.div>
              </div>
              <div className="w-3 h-3 rounded-full bg-ody-accent border-2 border-ody-accent/30 z-10" />
            </div>
            {flight.departureDate !== flight.arrivalDate && (
              <span className="text-[10px] text-ody-warning">+1 day</span>
            )}
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
          {flight.totalPrice && <span className="flex items-center gap-1 font-medium text-ody-text"><DollarSign size={10} /> {flight.currency || 'USD'} {flight.totalPrice} total</span>}
          {flight.pricePerPerson && <span className="text-ody-text-dim">({flight.currency || 'USD'} {flight.pricePerPerson}/pp)</span>}
          {flight.passengers && flight.passengers > 1 && <span className="flex items-center gap-1"><Users size={10} /> {flight.passengers} pax</span>}
          {flight.notes && <span className="text-ody-text-muted">{flight.notes}</span>}
        </div>
      </div>
    </motion.div>
  );
}

/** Layover indicator between legs */
function LayoverBadge({ prevFlight, nextFlight }: { prevFlight: Flight; nextFlight: Flight }) {
  if (!prevFlight.arrivalTime || !nextFlight.departureTime) return null;
  if (prevFlight.arrivalAirport !== nextFlight.departureAirport) return null;

  const [ah, am] = prevFlight.arrivalTime.split(':').map(Number);
  const [dh, dm] = nextFlight.departureTime.split(':').map(Number);

  let diffMin = (dh * 60 + dm) - (ah * 60 + am);
  // Account for overnight
  if (prevFlight.arrivalDate !== nextFlight.departureDate) {
    const dayDiff = Math.max(1, Math.round((new Date(nextFlight.departureDate).getTime() - new Date(prevFlight.arrivalDate).getTime()) / 86400000));
    diffMin += dayDiff * 1440;
  }

  if (diffMin <= 0) return null;

  const hours = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  const layoverStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  const isLong = diffMin > 180;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 pl-16 py-1"
    >
      <div className={`text-xs px-3 py-1 rounded-full border ${isLong ? 'border-ody-warning/30 bg-ody-warning/10 text-ody-warning' : 'border-ody-border bg-ody-surface text-ody-text-dim'}`}>
        <Clock size={10} className="inline mr-1" />
        {layoverStr} layover in {prevFlight.arrivalAirport}
      </div>
    </motion.div>
  );
}

type SubTab = 'booked' | 'research';

export function FlightsTab({ tripId, items }: Props) {
  const [subTab, setSubTab] = useState<SubTab>('booked');

  return (
    <div className="space-y-6">
      {/* Sub-tab navigation */}
      <div className="flex items-center gap-1 border-b border-ody-border/50 pb-0">
        {([
          { id: 'booked' as SubTab, label: 'Booked Flights', icon: Plane },
          { id: 'research' as SubTab, label: 'Flight Research', icon: Search },
        ]).map(tab => (
          <button key={tab.id} onClick={() => setSubTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors relative
              ${subTab === tab.id ? 'text-ody-accent' : 'text-ody-text-dim hover:text-ody-text-muted'}`}>
            <tab.icon size={14} />
            {tab.label}
            {subTab === tab.id && (
              <motion.div layoutId="flights-subtab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-ody-accent" />
            )}
          </button>
        ))}
      </div>

      {subTab === 'booked' ? (
        <BookedFlightsView tripId={tripId} items={items} />
      ) : (
        <FlightResearchTab tripId={tripId} />
      )}
    </div>
  );
}

function BookedFlightsView({ tripId, items }: Props) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    airline: '', flightNumber: '', confirmationCode: '', departureAirport: '', departureCity: '',
    arrivalAirport: '', arrivalCity: '', departureDate: '', departureTime: '', arrivalDate: '',
    arrivalTime: '', duration: '', seatNumber: '', class: 'economy', notes: '',
    pricePerPerson: '', totalPrice: '', currency: 'USD', passengers: '1', status: 'confirmed',
  });

  const groups = useMemo(() => groupFlightLegs(items), [items]);

  // Total flight cost
  const totalFlightCost = useMemo(() => {
    return items.reduce((sum, f) => sum + parseFloat(f.totalPrice || '0'), 0);
  }, [items]);
  const mainCurrency = items.find(f => f.currency)?.currency || 'USD';

  const emptyForm = {
    airline: '', flightNumber: '', confirmationCode: '', departureAirport: '', departureCity: '',
    arrivalAirport: '', arrivalCity: '', departureDate: '', departureTime: '', arrivalDate: '',
    arrivalTime: '', duration: '', seatNumber: '', class: 'economy', notes: '',
    pricePerPerson: '', totalPrice: '', currency: 'USD', passengers: '1', status: 'confirmed',
  };

  const addMutation = useMutation({
    mutationFn: (data: any) => addFlight({ data: { tripId, ...data } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      setShowAdd(false);
      setEditingId(null);
      setForm({ ...emptyForm });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateFlight({ data: { tripId, ...data } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      setShowAdd(false);
      setEditingId(null);
      setForm({ ...emptyForm });
    },
  });

  const startEdit = (flight: Flight) => {
    setEditingId(flight.id);
    setForm({
      airline: flight.airline, flightNumber: flight.flightNumber,
      confirmationCode: flight.confirmationCode || '', departureAirport: flight.departureAirport,
      departureCity: flight.departureCity || '', arrivalAirport: flight.arrivalAirport,
      arrivalCity: flight.arrivalCity || '', departureDate: flight.departureDate,
      departureTime: flight.departureTime || '', arrivalDate: flight.arrivalDate,
      arrivalTime: flight.arrivalTime || '', duration: flight.duration || '',
      seatNumber: flight.seatNumber || '', class: flight.class || 'economy',
      notes: flight.notes || '', pricePerPerson: flight.pricePerPerson || '',
      totalPrice: flight.totalPrice || '', currency: flight.currency || 'USD',
      passengers: String(flight.passengers || 1), status: flight.status || 'confirmed',
    });
    setShowAdd(true);
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFlight({ data: { tripId, id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
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
        <button onClick={() => { setShowAdd(!showAdd); setEditingId(null); setForm({ ...emptyForm }); }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ody-accent/10 text-ody-accent text-sm hover:bg-ody-accent/20 transition-colors">
          <Plus size={14} /> Add Flight
        </button>
      </div>

      {/* Total cost summary */}
      {totalFlightCost > 0 && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 flex items-center justify-between bg-gradient-to-r from-ody-accent/5 to-transparent">
          <div className="flex items-center gap-2 text-sm text-ody-text-muted">
            <DollarSign size={16} className="text-ody-accent" />
            Total Flight Cost
          </div>
          <div className="text-lg font-bold text-ody-accent">{mainCurrency} {totalFlightCost.toFixed(2)}</div>
        </motion.div>
      )}

      {/* Journey overview */}
      {items.length > 0 && <JourneyOverview flights={items} />}

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
          {/* Price fields */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input placeholder="Price per person" type="number" step="0.01" value={form.pricePerPerson} onChange={e => setForm(p => ({ ...p, pricePerPerson: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
            <input placeholder="Total price" type="number" step="0.01" value={form.totalPrice} onChange={e => setForm(p => ({ ...p, totalPrice: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
            <select value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent">
              <option value="USD">USD $</option><option value="EUR">EUR €</option>
              <option value="GBP">GBP £</option><option value="JPY">JPY ¥</option>
            </select>
            <input placeholder="Passengers" type="number" min="1" value={form.passengers} onChange={e => setForm(p => ({ ...p, passengers: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent">
              <option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option><option value="delayed">Delayed</option>
            </select>
          </div>
          <textarea placeholder="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent resize-none h-16" />
          <div className="flex gap-2">
            <button onClick={() => {
              const payload = { ...form, pricePerPerson: form.pricePerPerson || null, totalPrice: form.totalPrice || null, passengers: parseInt(form.passengers) || 1 };
              if (editingId) updateMutation.mutate({ id: editingId, ...payload });
              else addMutation.mutate(payload);
            }} disabled={!form.airline || !form.flightNumber || !form.departureAirport || !form.arrivalAirport || !form.departureDate || !form.arrivalDate}
              className="px-4 py-2 rounded-lg bg-ody-accent text-white text-sm hover:bg-ody-accent-hover disabled:opacity-50 transition-colors">{editingId ? 'Update' : 'Save'}</button>
            <button onClick={() => { setShowAdd(false); setEditingId(null); setForm({ ...emptyForm }); }}
              className="px-4 py-2 rounded-lg border border-ody-border text-sm hover:bg-ody-surface-hover transition-colors">Cancel</button>
          </div>
        </motion.div>
      )}

      {items.length === 0 ? (
        <p className="text-ody-text-muted text-center py-8">No flights added yet.</p>
      ) : (
        <div className="space-y-8">
          {groups.map((group, gi) => (
            <div key={gi} className="space-y-2">
              {/* Group header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2 text-sm font-medium text-ody-text-muted">
                  <Calendar size={14} className="text-ody-accent" />
                  {group.label}
                </div>
                <div className="flex-1 h-px bg-ody-border/50" />
                <span className="text-xs text-ody-text-dim">
                  {formatDateShort(group.legs[0].departureDate)}
                </span>
              </div>

              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-ody-border" />
                <div className="space-y-1">
                  {group.legs.map((flight, i) => (
                    <div key={flight.id}>
                      {/* Layover indicator */}
                      {i > 0 && (
                        <LayoverBadge prevFlight={group.legs[i - 1]} nextFlight={flight} />
                      )}
                      <div className="relative flex gap-4">
                        <div className="relative z-10 flex-shrink-0 w-12 flex items-start justify-center pt-6">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: (gi * group.legs.length + i) * 0.1 }}
                            className="w-4 h-4 rounded-full bg-ody-accent shadow-lg shadow-ody-accent/30"
                          />
                        </div>
                        <div className="flex-1 pb-2">
                          <FlightCard flight={flight} index={gi * 10 + i} onDelete={(id) => deleteMutation.mutate(id)} onEdit={startEdit} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
