import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Star, X, ExternalLink, ArrowRight, Clock, Plane,
  Filter, ChevronDown, ChevronUp, BarChart3, Trash2,
  Eye, SlidersHorizontal, TrendingDown, Layers,
} from 'lucide-react';
import {
  getFlightSearches, createFlightSearch, deleteFlightSearch,
  createFlightOption, updateFlightOption, deleteFlightOption,
} from '../../server/flight-research';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// ── Types ────────────────────────────────────────────

interface FlightOption {
  id: string;
  searchId: string;
  tripId: string;
  airline: string;
  flightNumbers: string | null;
  routeType: string | null;
  stops: number | null;
  layoverAirports: string | null;
  layoverDurations: string | null;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  departureTime: string | null;
  arrivalDate: string;
  arrivalTime: string | null;
  duration: string | null;
  returnDepartureDate: string | null;
  returnDepartureTime: string | null;
  returnArrivalDate: string | null;
  returnArrivalTime: string | null;
  returnDuration: string | null;
  returnStops: number | null;
  returnLayoverAirports: string | null;
  returnLayoverDurations: string | null;
  pricePerPerson: string | null;
  totalPrice: string | null;
  currency: string | null;
  cabinClass: string | null;
  baggageIncluded: string | null;
  refundable: boolean | null;
  bookingUrl: string | null;
  bookingSource: string | null;
  status: string | null;
  comparisonNotes: string | null;
  rating: number | null;
  createdAt: string;
  updatedAt: string;
  priceHistory: { id: string; price: string; currency: string | null; source: string | null; checkedAt: string }[];
}

interface FlightSearch {
  id: string;
  tripId: string;
  origin: string;
  destination: string;
  originCity: string | null;
  destinationCity: string | null;
  departureDate: string;
  returnDate: string | null;
  passengers: number;
  cabinClass: string | null;
  tripType: string | null;
  notes: string | null;
  createdAt: string;
  options: FlightOption[];
}

interface Props {
  tripId: string;
}

// ── Helpers ──────────────────────────────────────────

function formatPrice(price: string | null, currency: string | null = 'USD'): string {
  if (!price) return '—';
  const num = parseFloat(price);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(num);
}

function formatTime12(time: string | null): string {
  if (!time) return '';
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

function formatDateShort(date: string): string {
  const d = new Date(date + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  found: { bg: 'bg-ody-text-muted/15', text: 'text-ody-text-muted', label: 'Found' },
  shortlisted: { bg: 'bg-ody-warning/15', text: 'text-ody-warning', label: '★ Shortlisted' },
  rejected: { bg: 'bg-ody-danger/15', text: 'text-ody-danger', label: 'Rejected' },
  booked: { bg: 'bg-ody-success/15', text: 'text-ody-success', label: '✓ Booked' },
};

const cabinLabels: Record<string, string> = {
  economy: 'Economy',
  premium_economy: 'Premium Economy',
  business: 'Business',
  first: 'First',
};

type SortKey = 'price' | 'duration' | 'stops' | 'airline';
type SortDir = 'asc' | 'desc';

function parseDuration(d: string | null): number {
  if (!d) return Infinity;
  const hm = d.match(/(\d+)h\s*(\d+)?m?/);
  if (hm) return parseInt(hm[1]) * 60 + (parseInt(hm[2]) || 0);
  return Infinity;
}

function sortOptions(options: FlightOption[], key: SortKey, dir: SortDir): FlightOption[] {
  const sorted = [...options].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case 'price':
        cmp = (parseFloat(a.totalPrice || '999999') - parseFloat(b.totalPrice || '999999'));
        break;
      case 'duration':
        cmp = parseDuration(a.duration) - parseDuration(b.duration);
        break;
      case 'stops':
        cmp = (a.stops || 0) - (b.stops || 0);
        break;
      case 'airline':
        cmp = a.airline.localeCompare(b.airline);
        break;
    }
    return dir === 'desc' ? -cmp : cmp;
  });
  return sorted;
}

// ── Sub-components ───────────────────────────────────

function SearchForm({ tripId, onClose }: { tripId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    origin: '', destination: '', originCity: '', destinationCity: '',
    departureDate: '', returnDate: '', passengers: 1,
    cabinClass: 'economy', tripType: 'round_trip', notes: '',
  });

  const mutation = useMutation({
    mutationFn: (data: any) => createFlightSearch({ data: { tripId, ...data } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flight-searches', tripId] });
      onClose();
    },
  });

  const f = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }));

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Search size={16} className="text-ody-accent" /> New Flight Search
        </h4>
        <button onClick={onClose} className="text-ody-text-dim hover:text-ody-text-muted"><X size={16} /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs text-ody-text-dim font-medium">Origin</label>
          <input placeholder="Airport code (e.g. DFW)" value={form.origin}
            onChange={e => f('origin', e.target.value.toUpperCase())}
            className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
          <input placeholder="City (optional)" value={form.originCity}
            onChange={e => f('originCity', e.target.value)}
            className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-ody-text-dim font-medium">Destination</label>
          <input placeholder="Airport code (e.g. VCE)" value={form.destination}
            onChange={e => f('destination', e.target.value.toUpperCase())}
            className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
          <input placeholder="City (optional)" value={form.destinationCity}
            onChange={e => f('destinationCity', e.target.value)}
            className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-ody-text-dim font-medium">Departure</label>
          <input type="date" value={form.departureDate} onChange={e => f('departureDate', e.target.value)}
            className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-ody-text-dim font-medium">Return</label>
          <input type="date" value={form.returnDate} onChange={e => f('returnDate', e.target.value)}
            className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-ody-text-dim font-medium">Passengers</label>
          <input type="number" min={1} max={10} value={form.passengers}
            onChange={e => f('passengers', parseInt(e.target.value) || 1)}
            className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-ody-text-dim font-medium">Cabin Class</label>
          <select value={form.cabinClass} onChange={e => f('cabinClass', e.target.value)}
            className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent">
            <option value="economy">Economy</option>
            <option value="premium_economy">Premium Economy</option>
            <option value="business">Business</option>
            <option value="first">First</option>
          </select>
        </div>
      </div>

      <textarea placeholder="Notes (optional)" value={form.notes} onChange={e => f('notes', e.target.value)}
        className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent resize-none h-16" />

      <div className="flex gap-2">
        <button onClick={() => mutation.mutate(form)}
          disabled={!form.origin || !form.destination || !form.departureDate}
          className="px-4 py-2 rounded-lg bg-ody-accent text-white text-sm hover:bg-ody-accent-hover disabled:opacity-50 transition-colors">
          Create Search
        </button>
        <button onClick={onClose}
          className="px-4 py-2 rounded-lg border border-ody-border text-sm hover:bg-ody-surface-hover transition-colors">
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

function AddOptionForm({ tripId, searchId, search, onClose }: {
  tripId: string; searchId: string; search: FlightSearch; onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    airline: '', flightNumbers: '', routeType: 'direct', stops: 0,
    layoverAirports: '', layoverDurations: '',
    departureAirport: search.origin, arrivalAirport: search.destination,
    departureDate: search.departureDate, departureTime: '', arrivalDate: search.departureDate, arrivalTime: '',
    duration: '',
    returnDepartureDate: search.returnDate || '', returnDepartureTime: '',
    returnArrivalDate: search.returnDate || '', returnArrivalTime: '',
    returnDuration: '', returnStops: 0, returnLayoverAirports: '', returnLayoverDurations: '',
    pricePerPerson: '', totalPrice: '', currency: 'USD',
    cabinClass: search.cabinClass || 'economy',
    baggageIncluded: '', refundable: false,
    bookingUrl: '', bookingSource: '',
  });

  const mutation = useMutation({
    mutationFn: (data: any) => createFlightOption({ data: { tripId, searchId, ...data } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flight-searches', tripId] });
      onClose();
    },
  });

  const f = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }));

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 space-y-3 border-l-2 border-ody-accent/40">
      <div className="flex items-center justify-between">
        <h5 className="font-medium text-sm">Add Flight Option</h5>
        <button onClick={onClose} className="text-ody-text-dim hover:text-ody-text-muted"><X size={14} /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input placeholder="Airline" value={form.airline} onChange={e => f('airline', e.target.value)}
          className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        <input placeholder="Flight #s (e.g. AA100, AA200)" value={form.flightNumbers} onChange={e => f('flightNumbers', e.target.value)}
          className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        <select value={form.routeType} onChange={e => f('routeType', e.target.value)}
          className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent">
          <option value="direct">Direct</option>
          <option value="connecting">Connecting</option>
        </select>
        <input type="number" min={0} placeholder="Stops" value={form.stops}
          onChange={e => f('stops', parseInt(e.target.value) || 0)}
          className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
      </div>

      {/* Outbound */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <input placeholder="From" value={form.departureAirport} onChange={e => f('departureAirport', e.target.value.toUpperCase())}
          className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        <input placeholder="To" value={form.arrivalAirport} onChange={e => f('arrivalAirport', e.target.value.toUpperCase())}
          className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        <input type="time" value={form.departureTime} onChange={e => f('departureTime', e.target.value)}
          className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        <input type="time" value={form.arrivalTime} onChange={e => f('arrivalTime', e.target.value)}
          className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        <input placeholder="Duration (e.g. 10h 30m)" value={form.duration} onChange={e => f('duration', e.target.value)}
          className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <input placeholder="Price/person" value={form.pricePerPerson} onChange={e => f('pricePerPerson', e.target.value)}
          className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        <input placeholder="Total price" value={form.totalPrice} onChange={e => f('totalPrice', e.target.value)}
          className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        <input placeholder="Baggage (e.g. 1 carry-on)" value={form.baggageIncluded} onChange={e => f('baggageIncluded', e.target.value)}
          className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        <input placeholder="Booking URL" value={form.bookingUrl} onChange={e => f('bookingUrl', e.target.value)}
          className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        <input placeholder="Source (e.g. Google Flights)" value={form.bookingSource} onChange={e => f('bookingSource', e.target.value)}
          className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
      </div>

      <div className="flex gap-2">
        <button onClick={() => mutation.mutate(form)}
          disabled={!form.airline || !form.departureAirport || !form.arrivalAirport || !form.departureDate || !form.arrivalDate}
          className="px-4 py-2 rounded-lg bg-ody-accent text-white text-sm hover:bg-ody-accent-hover disabled:opacity-50 transition-colors">
          Add Option
        </button>
        <button onClick={onClose}
          className="px-4 py-2 rounded-lg border border-ody-border text-sm hover:bg-ody-surface-hover transition-colors">
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

function PriceHistoryChart({ option }: { option: FlightOption }) {
  const data = option.priceHistory.map(p => ({
    date: new Date(p.checkedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: parseFloat(p.price),
    source: p.source || '',
  }));

  if (data.length < 2) return null;

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 pt-3 border-t border-ody-border/50">
      <div className="flex items-center gap-2 mb-2">
        <TrendingDown size={14} className="text-ody-accent" />
        <span className="text-xs font-medium text-ody-text-dim">Price History</span>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} />
          <YAxis tick={{ fontSize: 10, fill: '#888' }} tickFormatter={v => `$${v}`} />
          <Tooltip
            contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 8, fontSize: 12 }}
            formatter={(val: any) => [`$${val}`, 'Price']}
          />
          <Line type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

function FlightOptionCard({ option, tripId }: { option: FlightOption; tripId: string }) {
  const queryClient = useQueryClient();
  const [showChart, setShowChart] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(option.comparisonNotes || '');

  const updateMut = useMutation({
    mutationFn: (data: any) => updateFlightOption({ data: { id: option.id, tripId, ...data } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['flight-searches', tripId] }),
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteFlightOption({ data: { id: option.id, tripId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['flight-searches', tripId] }),
  });

  const status = option.status || 'found';
  const sc = statusColors[status] || statusColors.found;
  const isRejected = status === 'rejected';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isRejected ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`glass-card p-0 overflow-hidden transition-all ${isRejected ? 'opacity-50' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-ody-surface to-transparent border-b border-ody-border/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Plane size={14} className="text-ody-accent" />
            <span className="font-semibold text-sm">{option.airline}</span>
            {option.flightNumbers && (
              <span className="text-xs text-ody-text-dim font-mono">{option.flightNumbers}</span>
            )}
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>{sc.label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Star/shortlist */}
          <button onClick={() => updateMut.mutate({ status: status === 'shortlisted' ? 'found' : 'shortlisted' })}
            className={`p-1.5 rounded-lg transition-colors ${status === 'shortlisted' ? 'text-ody-warning bg-ody-warning/10' : 'text-ody-text-dim hover:text-ody-warning'}`}
            title="Shortlist">
            <Star size={14} fill={status === 'shortlisted' ? 'currentColor' : 'none'} />
          </button>
          {/* Reject */}
          <button onClick={() => updateMut.mutate({ status: status === 'rejected' ? 'found' : 'rejected' })}
            className={`p-1.5 rounded-lg transition-colors ${status === 'rejected' ? 'text-ody-danger bg-ody-danger/10' : 'text-ody-text-dim hover:text-ody-danger'}`}
            title="Reject">
            <X size={14} />
          </button>
          {/* Chart toggle */}
          {option.priceHistory.length >= 2 && (
            <button onClick={() => setShowChart(!showChart)}
              className="p-1.5 rounded-lg text-ody-text-dim hover:text-ody-accent transition-colors" title="Price history">
              <BarChart3 size={14} />
            </button>
          )}
          {/* Delete */}
          <button onClick={() => deleteMut.mutate()}
            className="p-1.5 rounded-lg text-ody-text-dim hover:text-ody-danger transition-colors" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Flight details */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-4">
          {/* Outbound leg */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-lg font-bold">{option.departureAirport}</div>
                <div className="text-xs text-ody-text-dim">{formatTime12(option.departureTime)}</div>
                <div className="text-[10px] text-ody-text-dim">{formatDateShort(option.departureDate)}</div>
              </div>
              <div className="flex-1 flex flex-col items-center gap-0.5 min-w-[80px]">
                {option.duration && (
                  <span className="text-[10px] text-ody-text-dim flex items-center gap-0.5">
                    <Clock size={8} /> {option.duration}
                  </span>
                )}
                <div className="w-full flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-ody-accent" />
                  <div className="flex-1 h-px bg-ody-accent/40 relative">
                    {(option.stops || 0) > 0 && Array.from({ length: option.stops! }).map((_, i) => (
                      <div key={i} className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-ody-warning"
                        style={{ left: `${((i + 1) / (option.stops! + 1)) * 100}%` }} />
                    ))}
                  </div>
                  <div className="w-2 h-2 rounded-full bg-ody-accent" />
                </div>
                <span className="text-[10px] text-ody-text-dim">
                  {(option.stops || 0) === 0 ? 'Direct' : `${option.stops} stop${(option.stops || 0) > 1 ? 's' : ''}`}
                  {option.layoverAirports && ` · ${option.layoverAirports}`}
                </span>
              </div>
              <div className="text-left">
                <div className="text-lg font-bold">{option.arrivalAirport}</div>
                <div className="text-xs text-ody-text-dim">{formatTime12(option.arrivalTime)}</div>
                <div className="text-[10px] text-ody-text-dim">{formatDateShort(option.arrivalDate)}</div>
              </div>
            </div>

            {/* Return leg */}
            {option.returnDepartureDate && (
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-ody-border/30">
                <div className="text-right">
                  <div className="text-lg font-bold">{option.arrivalAirport}</div>
                  <div className="text-xs text-ody-text-dim">{formatTime12(option.returnDepartureTime)}</div>
                  <div className="text-[10px] text-ody-text-dim">{formatDateShort(option.returnDepartureDate)}</div>
                </div>
                <div className="flex-1 flex flex-col items-center gap-0.5 min-w-[80px]">
                  {option.returnDuration && (
                    <span className="text-[10px] text-ody-text-dim flex items-center gap-0.5">
                      <Clock size={8} /> {option.returnDuration}
                    </span>
                  )}
                  <div className="w-full flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-ody-accent" />
                    <div className="flex-1 h-px bg-ody-accent/40" />
                    <div className="w-2 h-2 rounded-full bg-ody-accent" />
                  </div>
                  <span className="text-[10px] text-ody-text-dim">
                    {(option.returnStops || 0) === 0 ? 'Direct' : `${option.returnStops} stop${(option.returnStops || 0) > 1 ? 's' : ''}`}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold">{option.departureAirport}</div>
                  <div className="text-xs text-ody-text-dim">{formatTime12(option.returnArrivalTime)}</div>
                  <div className="text-[10px] text-ody-text-dim">{option.returnArrivalDate && formatDateShort(option.returnArrivalDate)}</div>
                </div>
              </div>
            )}
          </div>

          {/* Price column */}
          <div className="text-right pl-4 border-l border-ody-border/30 min-w-[120px]">
            <div className="text-xl font-bold text-ody-accent">{formatPrice(option.totalPrice, option.currency)}</div>
            {option.pricePerPerson && (
              <div className="text-xs text-ody-text-dim">{formatPrice(option.pricePerPerson, option.currency)}/person</div>
            )}
            <div className="mt-1 text-[10px] text-ody-text-dim">{cabinLabels[option.cabinClass || 'economy']}</div>
            {option.baggageIncluded && (
              <div className="text-[10px] text-ody-text-dim mt-0.5">{option.baggageIncluded}</div>
            )}
            {option.refundable && (
              <div className="text-[10px] text-ody-success mt-0.5">Refundable</div>
            )}
          </div>
        </div>

        {/* Actions row */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-ody-border/30">
          {option.bookingUrl && (
            <a href={option.bookingUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ody-accent text-white text-xs hover:bg-ody-accent-hover transition-colors">
              <ExternalLink size={12} /> Book
            </a>
          )}
          {option.bookingSource && (
            <span className="text-[10px] text-ody-text-dim">via {option.bookingSource}</span>
          )}
          <button onClick={() => setShowNotes(!showNotes)}
            className="text-xs text-ody-text-dim hover:text-ody-text-muted transition-colors ml-auto">
            {showNotes ? 'Hide' : 'Add'} Notes
          </button>
          {/* Rating */}
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(r => (
              <button key={r} onClick={() => updateMut.mutate({ rating: option.rating === r ? 0 : r })}
                className={`text-xs ${(option.rating || 0) >= r ? 'text-ody-warning' : 'text-ody-text-dim/30'}`}>
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <AnimatePresence>
          {showNotes && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mt-2">
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Comparison notes..."
                className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent resize-none h-16" />
              <button onClick={() => { updateMut.mutate({ comparisonNotes: notes }); setShowNotes(false); }}
                className="mt-1 px-3 py-1 rounded-lg bg-ody-accent/10 text-ody-accent text-xs hover:bg-ody-accent/20 transition-colors">
                Save Notes
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Price chart */}
        <AnimatePresence>
          {showChart && <PriceHistoryChart option={option} />}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ComparisonView({ options }: { options: FlightOption[]; tripId: string }) {
  const shortlisted = options.filter(o => o.status === 'shortlisted');
  if (shortlisted.length < 2) return (
    <div className="text-center py-8 text-ody-text-dim text-sm">
      Shortlist at least 2 flights to compare them side-by-side.
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-4 min-w-full pb-2">
        {shortlisted.map(opt => (
          <div key={opt.id} className="glass-card p-4 min-w-[280px] max-w-[320px] space-y-3">
            <div className="flex items-center gap-2">
              <Plane size={14} className="text-ody-accent" />
              <span className="font-semibold text-sm">{opt.airline}</span>
            </div>
            <div className="text-2xl font-bold text-ody-accent">{formatPrice(opt.totalPrice, opt.currency)}</div>
            {opt.pricePerPerson && <div className="text-xs text-ody-text-dim">{formatPrice(opt.pricePerPerson, opt.currency)}/person</div>}

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-ody-text-dim">Route</span>
                <span>{opt.departureAirport} → {opt.arrivalAirport}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ody-text-dim">Duration</span>
                <span>{opt.duration || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ody-text-dim">Stops</span>
                <span>{(opt.stops || 0) === 0 ? 'Direct' : `${opt.stops} stop${(opt.stops || 0) > 1 ? 's' : ''}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ody-text-dim">Departs</span>
                <span>{formatTime12(opt.departureTime)} · {formatDateShort(opt.departureDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ody-text-dim">Cabin</span>
                <span>{cabinLabels[opt.cabinClass || 'economy']}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ody-text-dim">Baggage</span>
                <span>{opt.baggageIncluded || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ody-text-dim">Refundable</span>
                <span>{opt.refundable ? '✓ Yes' : '✗ No'}</span>
              </div>
              {opt.comparisonNotes && (
                <div className="pt-2 border-t border-ody-border/30">
                  <span className="text-ody-text-dim">Notes:</span>
                  <p className="text-ody-text-muted mt-0.5">{opt.comparisonNotes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(r => (
                <span key={r} className={`text-sm ${(opt.rating || 0) >= r ? 'text-ody-warning' : 'text-ody-text-dim/30'}`}>★</span>
              ))}
            </div>

            {opt.bookingUrl && (
              <a href={opt.bookingUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg bg-ody-accent text-white text-xs hover:bg-ody-accent-hover transition-colors">
                <ExternalLink size={12} /> Book This Flight
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SearchCard({ search, tripId }: { search: FlightSearch; tripId: string }) {
  const queryClient = useQueryClient();
  const [showAddOption, setShowAddOption] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [view, setView] = useState<'list' | 'compare'>('list');
  const [sortKey, setSortKey] = useState<SortKey>('price');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAirline, setFilterAirline] = useState('');
  const [filterMaxStops, setFilterMaxStops] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const deleteMut = useMutation({
    mutationFn: () => deleteFlightSearch({ data: { id: search.id, tripId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['flight-searches', tripId] }),
  });

  const airlines = useMemo(() => [...new Set(search.options.map(o => o.airline))].sort(), [search.options]);

  const filteredOptions = useMemo(() => {
    let opts = search.options;
    if (filterStatus !== 'all') opts = opts.filter(o => o.status === filterStatus);
    if (filterAirline) opts = opts.filter(o => o.airline === filterAirline);
    if (filterMaxStops !== null) opts = opts.filter(o => (o.stops || 0) <= filterMaxStops);
    return sortOptions(opts, sortKey, sortDir);
  }, [search.options, filterStatus, filterAirline, filterMaxStops, sortKey, sortDir]);

  const stats = useMemo(() => {
    const prices = search.options.filter(o => o.totalPrice).map(o => parseFloat(o.totalPrice!));
    return {
      total: search.options.length,
      shortlisted: search.options.filter(o => o.status === 'shortlisted').length,
      cheapest: prices.length > 0 ? Math.min(...prices) : null,
    };
  }, [search.options]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  return (
    <motion.div layout className="space-y-3">
      {/* Search header */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-3 flex-1 text-left">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-ody-accent/15 flex items-center justify-center">
                <Search size={16} className="text-ody-accent" />
              </div>
              <div>
                <div className="font-semibold text-sm flex items-center gap-2">
                  {search.origin}
                  {search.originCity && <span className="text-xs text-ody-text-dim font-normal">({search.originCity})</span>}
                  <ArrowRight size={14} className="text-ody-accent" />
                  {search.destination}
                  {search.destinationCity && <span className="text-xs text-ody-text-dim font-normal">({search.destinationCity})</span>}
                </div>
                <div className="text-xs text-ody-text-dim flex items-center gap-2 mt-0.5">
                  <span>{formatDateShort(search.departureDate)}</span>
                  {search.returnDate && <><span>—</span><span>{formatDateShort(search.returnDate)}</span></>}
                  <span>·</span>
                  <span>{search.passengers} pax</span>
                  <span>·</span>
                  <span>{cabinLabels[search.cabinClass || 'economy']}</span>
                </div>
              </div>
            </div>
            {expanded ? <ChevronUp size={16} className="text-ody-text-dim" /> : <ChevronDown size={16} className="text-ody-text-dim" />}
          </button>
          <div className="flex items-center gap-2 ml-3">
            <div className="flex items-center gap-1.5 text-xs text-ody-text-dim">
              <span className="bg-ody-surface px-2 py-0.5 rounded-full">{stats.total} options</span>
              {stats.shortlisted > 0 && <span className="bg-ody-warning/10 text-ody-warning px-2 py-0.5 rounded-full">★ {stats.shortlisted}</span>}
              {stats.cheapest !== null && <span className="bg-ody-success/10 text-ody-success px-2 py-0.5 rounded-full">from ${stats.cheapest}</span>}
            </div>
            <button onClick={() => deleteMut.mutate()}
              className="p-1.5 text-ody-text-dim hover:text-ody-danger transition-colors" title="Delete search">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="space-y-3 pl-2">

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setShowAddOption(!showAddOption)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ody-accent/10 text-ody-accent text-xs hover:bg-ody-accent/20 transition-colors">
                <Plus size={12} /> Add Option
              </button>

              <div className="flex items-center gap-1 ml-auto">
                {/* View toggle */}
                <button onClick={() => setView('list')}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${view === 'list' ? 'bg-ody-accent/10 text-ody-accent' : 'text-ody-text-dim hover:text-ody-text-muted'}`}>
                  <Layers size={14} />
                </button>
                <button onClick={() => setView('compare')}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${view === 'compare' ? 'bg-ody-accent/10 text-ody-accent' : 'text-ody-text-dim hover:text-ody-text-muted'}`}>
                  <Eye size={14} />
                </button>

                <div className="w-px h-4 bg-ody-border mx-1" />

                {/* Sort buttons */}
                {(['price', 'duration', 'stops', 'airline'] as SortKey[]).map(key => (
                  <button key={key} onClick={() => toggleSort(key)}
                    className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider transition-colors ${sortKey === key ? 'bg-ody-accent/10 text-ody-accent' : 'text-ody-text-dim hover:text-ody-text-muted'}`}>
                    {key} {sortKey === key && (sortDir === 'asc' ? '↑' : '↓')}
                  </button>
                ))}

                <div className="w-px h-4 bg-ody-border mx-1" />

                <button onClick={() => setShowFilters(!showFilters)}
                  className={`p-1.5 rounded-lg transition-colors ${showFilters ? 'bg-ody-accent/10 text-ody-accent' : 'text-ody-text-dim hover:text-ody-text-muted'}`}>
                  <SlidersHorizontal size={14} />
                </button>
              </div>
            </div>

            {/* Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap items-center gap-3 p-3 glass-card">
                  <div className="flex items-center gap-1.5">
                    <Filter size={12} className="text-ody-text-dim" />
                    <span className="text-xs text-ody-text-dim">Filter:</span>
                  </div>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    className="bg-ody-bg border border-ody-border rounded-lg px-2 py-1 text-xs outline-none focus:border-ody-accent">
                    <option value="all">All statuses</option>
                    <option value="found">Found</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                    <option value="booked">Booked</option>
                  </select>
                  <select value={filterAirline} onChange={e => setFilterAirline(e.target.value)}
                    className="bg-ody-bg border border-ody-border rounded-lg px-2 py-1 text-xs outline-none focus:border-ody-accent">
                    <option value="">All airlines</option>
                    {airlines.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <select value={filterMaxStops ?? ''} onChange={e => setFilterMaxStops(e.target.value ? parseInt(e.target.value) : null)}
                    className="bg-ody-bg border border-ody-border rounded-lg px-2 py-1 text-xs outline-none focus:border-ody-accent">
                    <option value="">Any stops</option>
                    <option value="0">Direct only</option>
                    <option value="1">≤ 1 stop</option>
                    <option value="2">≤ 2 stops</option>
                  </select>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Add option form */}
            <AnimatePresence>
              {showAddOption && <AddOptionForm tripId={tripId} searchId={search.id} search={search} onClose={() => setShowAddOption(false)} />}
            </AnimatePresence>

            {/* Results */}
            {view === 'list' ? (
              <div className="space-y-2">
                {filteredOptions.length === 0 ? (
                  <div className="text-center py-6 text-ody-text-dim text-sm">
                    {search.options.length === 0 ? 'No flight options yet. Add one above.' : 'No options match your filters.'}
                  </div>
                ) : (
                  filteredOptions.map(opt => (
                    <FlightOptionCard key={opt.id} option={opt} tripId={tripId} />
                  ))
                )}
              </div>
            ) : (
              <ComparisonView options={filteredOptions} tripId={tripId} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Component ───────────────────────────────────

export function FlightResearchTab({ tripId }: Props) {
  const [showNewSearch, setShowNewSearch] = useState(false);

  const { data: searches = [], isLoading } = useQuery({
    queryKey: ['flight-searches', tripId],
    queryFn: () => getFlightSearches({ data: { tripId } }),
  });

  if (isLoading) return <div className="text-center py-8 text-ody-text-dim">Loading flight research…</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Search size={20} /> Flight Research
          {searches.length > 0 && (
            <span className="text-xs bg-ody-accent/10 text-ody-accent rounded-full px-2 py-0.5">
              {searches.length} {searches.length === 1 ? 'search' : 'searches'}
            </span>
          )}
        </h3>
        <button onClick={() => setShowNewSearch(!showNewSearch)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ody-accent/10 text-ody-accent text-sm hover:bg-ody-accent/20 transition-colors">
          <Plus size={14} /> New Search
        </button>
      </div>

      <AnimatePresence>
        {showNewSearch && <SearchForm tripId={tripId} onClose={() => setShowNewSearch(false)} />}
      </AnimatePresence>

      {searches.length === 0 && !showNewSearch ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-ody-accent/10 flex items-center justify-center mx-auto mb-4">
            <Plane size={28} className="text-ody-accent" />
          </div>
          <p className="text-ody-text-muted mb-2">No flight searches yet</p>
          <p className="text-ody-text-dim text-sm">Create a search to start comparing flights.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {(searches as FlightSearch[]).map(search => (
            <SearchCard key={search.id} search={search} tripId={tripId} />
          ))}
        </div>
      )}
    </div>
  );
}
