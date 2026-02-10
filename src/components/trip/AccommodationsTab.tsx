import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Calendar, DollarSign, Trash2, MapPin, Star, ExternalLink,
  Phone, Mail, Filter, ChevronDown, ChevronUp, Edit3, Check,
  Building, Home, Tent, BedDouble, Hotel as HotelIcon, Search,
  Moon, Copy, CheckCircle,
} from 'lucide-react';
import type { Accommodation, TripDestination } from '../../types/trips';

interface Props {
  tripId: string;
  items: Accommodation[];
  destinations?: TripDestination[];
}

const typeConfig: Record<string, { icon: typeof HotelIcon; label: string; emoji: string }> = {
  hotel: { icon: HotelIcon, label: 'Hotel', emoji: '🏨' },
  hostel: { icon: BedDouble, label: 'Hostel', emoji: '🛏️' },
  airbnb: { icon: Home, label: 'Airbnb', emoji: '🏠' },
  villa: { icon: Building, label: 'Villa', emoji: '🏡' },
  resort: { icon: Star, label: 'Resort', emoji: '🏖️' },
  camping: { icon: Tent, label: 'Camping', emoji: '⛺' },
  other: { icon: MapPin, label: 'Other', emoji: '📍' },
};

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  researched: { color: 'text-ody-text-muted', bg: 'bg-ody-text-muted/15', label: 'Researched' },
  shortlisted: { color: 'text-ody-warning', bg: 'bg-ody-warning/15', label: 'Shortlisted' },
  booked: { color: 'text-ody-success', bg: 'bg-ody-success/15', label: 'Booked' },
  cancelled: { color: 'text-ody-danger', bg: 'bg-ody-danger/15', label: 'Cancelled' },
};

type SortField = 'checkIn' | 'name' | 'totalCost' | 'status';
type FilterStatus = 'all' | 'researched' | 'shortlisted' | 'booked' | 'cancelled';

function nightCount(checkIn: string | null, checkOut: string | null): number | null {
  if (!checkIn || !checkOut) return null;
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(d: string | null): string {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const emptyForm = {
  name: '', type: 'hotel', status: 'researched', address: '', checkIn: '', checkOut: '',
  costPerNight: '', totalCost: '', currency: 'USD', confirmationCode: '',
  bookingUrl: '', contactPhone: '', contactEmail: '', rating: '',
  notes: '', destinationId: '',
};

export function AccommodationsTab({ tripId, items, destinations = [] }: Props) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortField, setSortField] = useState<SortField>('checkIn');
  const [sortAsc, setSortAsc] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Mutations
  const addMutation = useMutation({
    mutationFn: (data: any) => fetch(`/api/trips/${tripId}/accommodations`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      setShowAdd(false);
      setForm({ ...emptyForm });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => fetch(`/api/trips/${tripId}/accommodations`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      setEditingId(null);
      setForm({ ...emptyForm });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/trips/${tripId}/accommodations`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
    }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  // Filter + sort
  const filtered = useMemo(() => {
    let result = [...items];
    if (filterStatus !== 'all') result = result.filter(i => i.status === filterStatus);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.address?.toLowerCase().includes(q) ||
        i.confirmationCode?.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'checkIn') cmp = (a.checkIn || '').localeCompare(b.checkIn || '');
      else if (sortField === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortField === 'totalCost') cmp = parseFloat(a.totalCost || '0') - parseFloat(b.totalCost || '0');
      else if (sortField === 'status') {
        const order = { booked: 0, shortlisted: 1, researched: 2, cancelled: 3 };
        cmp = (order[a.status as keyof typeof order] ?? 4) - (order[b.status as keyof typeof order] ?? 4);
      }
      return sortAsc ? cmp : -cmp;
    });
    return result;
  }, [items, filterStatus, searchQuery, sortField, sortAsc]);

  // Summary stats
  const stats = useMemo(() => {
    const booked = items.filter(i => i.status === 'booked');
    const totalNights = booked.reduce((s, i) => s + (nightCount(i.checkIn, i.checkOut) || 0), 0);
    const totalSpent = booked.reduce((s, i) => s + parseFloat(i.totalCost || '0'), 0);
    const avgPerNight = totalNights > 0 ? totalSpent / totalNights : 0;
    return {
      total: items.length,
      booked: booked.length,
      shortlisted: items.filter(i => i.status === 'shortlisted').length,
      totalNights,
      totalSpent,
      avgPerNight,
    };
  }, [items]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const startEdit = (item: Accommodation) => {
    setEditingId(item.id);
    setForm({
      name: item.name, type: item.type, status: item.status,
      address: item.address || '', checkIn: item.checkIn || '', checkOut: item.checkOut || '',
      costPerNight: item.costPerNight || '', totalCost: item.totalCost || '',
      currency: item.currency || 'USD', confirmationCode: item.confirmationCode || '',
      bookingUrl: item.bookingUrl || '', contactPhone: item.contactPhone || '',
      contactEmail: item.contactEmail || '', rating: item.rating?.toString() || '',
      notes: item.notes || '', destinationId: item.destinationId || '',
    });
  };

  const handleCopyConfirmation = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = () => {
    const data = {
      ...form,
      costPerNight: form.costPerNight || null,
      totalCost: form.totalCost || null,
      rating: form.rating ? parseFloat(form.rating) : null,
      destinationId: form.destinationId || null,
      booked: form.status === 'booked',
    };
    if (editingId) updateMutation.mutate({ id: editingId, ...data });
    else addMutation.mutate(data);
  };

  const AccommodationForm = () => (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }} className="glass-card p-5 space-y-4">
      <h4 className="font-medium text-sm text-ody-text-muted uppercase tracking-wider">
        {editingId ? 'Edit Accommodation' : 'Add Accommodation'}
      </h4>

      {/* Row 1: Name, Type, Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input placeholder="Accommodation name *" value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
          className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent">
          {Object.entries(typeConfig).map(([k, v]) => (
            <option key={k} value={k}>{v.emoji} {v.label}</option>
          ))}
        </select>
        <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
          className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent">
          {Object.entries(statusConfig).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Row 2: Address + Destination */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input placeholder="Address" value={form.address}
          onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
          className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        {destinations.length > 0 && (
          <select value={form.destinationId}
            onChange={e => setForm(p => ({ ...p, destinationId: e.target.value }))}
            className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent">
            <option value="">Link to destination...</option>
            {destinations.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Row 3: Dates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-ody-text-dim block mb-1">Check-in</label>
          <input type="date" value={form.checkIn}
            onChange={e => setForm(p => ({ ...p, checkIn: e.target.value }))}
            className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        </div>
        <div>
          <label className="text-xs text-ody-text-dim block mb-1">Check-out</label>
          <input type="date" value={form.checkOut}
            onChange={e => setForm(p => ({ ...p, checkOut: e.target.value }))}
            className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        </div>
        <div className="flex items-end">
          {form.checkIn && form.checkOut && (
            <div className="flex items-center gap-1 text-sm text-ody-text-muted bg-ody-bg border border-ody-border rounded-lg px-3 py-2 w-full">
              <Moon size={14} /> {nightCount(form.checkIn, form.checkOut)} nights
            </div>
          )}
        </div>
      </div>

      {/* Row 4: Costs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input placeholder="Cost per night" type="number" step="0.01" value={form.costPerNight}
          onChange={e => setForm(p => ({ ...p, costPerNight: e.target.value }))}
          className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        <input placeholder="Total cost" type="number" step="0.01" value={form.totalCost}
          onChange={e => setForm(p => ({ ...p, totalCost: e.target.value }))}
          className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        <select value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
          className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent">
          <option value="USD">USD $</option><option value="EUR">EUR €</option>
          <option value="GBP">GBP £</option><option value="JPY">JPY ¥</option>
        </select>
        <input placeholder="Rating (1-5)" type="number" min="1" max="5" step="0.1" value={form.rating}
          onChange={e => setForm(p => ({ ...p, rating: e.target.value }))}
          className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
      </div>

      {/* Row 5: Confirmation + Booking URL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input placeholder="Confirmation code" value={form.confirmationCode}
          onChange={e => setForm(p => ({ ...p, confirmationCode: e.target.value }))}
          className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        <input placeholder="Booking URL" value={form.bookingUrl}
          onChange={e => setForm(p => ({ ...p, bookingUrl: e.target.value }))}
          className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
      </div>

      {/* Row 6: Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input placeholder="Contact phone" value={form.contactPhone}
          onChange={e => setForm(p => ({ ...p, contactPhone: e.target.value }))}
          className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        <input placeholder="Contact email" value={form.contactEmail}
          onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))}
          className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
      </div>

      {/* Notes */}
      <textarea placeholder="Notes, amenities, pros/cons..." value={form.notes}
        onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
        className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent resize-none h-20" />

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={handleSubmit} disabled={!form.name}
          className="px-4 py-2 rounded-lg bg-ody-accent text-white text-sm hover:bg-ody-accent-hover disabled:opacity-50 transition-colors">
          {editingId ? 'Update' : 'Save'}
        </button>
        <button onClick={() => { setShowAdd(false); setEditingId(null); setForm({ ...emptyForm }); }}
          className="px-4 py-2 rounded-lg border border-ody-border text-sm hover:bg-ody-surface-hover transition-colors">
          Cancel
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Total', value: stats.total, icon: Building },
            { label: 'Booked', value: stats.booked, icon: CheckCircle },
            { label: 'Shortlisted', value: stats.shortlisted, icon: Star },
            { label: 'Total Nights', value: stats.totalNights, icon: Moon },
            { label: 'Total Cost', value: `$${stats.totalSpent.toFixed(0)}`, icon: DollarSign },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-3 flex items-center gap-3">
              <s.icon size={16} className="text-ody-accent shrink-0" />
              <div>
                <div className="text-lg font-semibold">{s.value}</div>
                <div className="text-xs text-ody-text-dim">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Header + Actions */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h3 className="font-semibold text-lg">Accommodations</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-ody-border text-sm hover:bg-ody-surface-hover transition-colors">
            <Filter size={14} /> Filter
          </button>
          <button onClick={() => { setShowAdd(!showAdd); setEditingId(null); setForm({ ...emptyForm }); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ody-accent/10 text-ody-accent text-sm hover:bg-ody-accent/20 transition-colors">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="glass-card p-4 space-y-3">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ody-text-dim" />
                <input placeholder="Search name, address, confirmation..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-ody-bg border border-ody-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-ody-accent" />
              </div>
              <div className="flex gap-1">
                {(['all', 'booked', 'shortlisted', 'researched', 'cancelled'] as FilterStatus[]).map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${filterStatus === s
                      ? 'bg-ody-accent text-white' : 'border border-ody-border hover:bg-ody-surface-hover'}`}>
                    {s === 'all' ? 'All' : statusConfig[s]?.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 items-center text-xs text-ody-text-dim">
              Sort:
              {(['checkIn', 'name', 'totalCost', 'status'] as SortField[]).map(f => (
                <button key={f} onClick={() => handleSort(f)}
                  className={`px-2 py-1 rounded transition-colors ${sortField === f
                    ? 'bg-ody-accent/10 text-ody-accent' : 'hover:bg-ody-surface-hover'}`}>
                  {f === 'checkIn' ? 'Date' : f === 'totalCost' ? 'Cost' : f.charAt(0).toUpperCase() + f.slice(1)}
                  {sortField === f && (sortAsc ? <ChevronUp size={10} className="inline ml-1" /> : <ChevronDown size={10} className="inline ml-1" />)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {(showAdd || editingId) && <AccommodationForm />}
      </AnimatePresence>

      {/* Accommodation Cards */}
      {filtered.length === 0 ? (
        <p className="text-ody-text-muted text-center py-8">
          {items.length === 0 ? 'No accommodations added yet.' : 'No accommodations match your filters.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((item, i) => {
            const tc = typeConfig[item.type] || typeConfig.other;
            const sc = statusConfig[item.status] || statusConfig.researched;
            const nights = nightCount(item.checkIn, item.checkOut);
            const dest = destinations.find(d => d.id === item.destinationId);

            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`glass-card p-4 space-y-3 ${item.status === 'cancelled' ? 'opacity-60' : ''}`}>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm">{tc.emoji}</span>
                      <h4 className="font-medium truncate">{item.name}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>
                        {sc.label}
                      </span>
                    </div>
                    {item.address && (
                      <p className="text-xs text-ody-text-dim mt-1 flex items-center gap-1">
                        <MapPin size={10} /> {item.address}
                      </p>
                    )}
                    {dest && (
                      <p className="text-xs text-ody-accent mt-0.5">📍 {dest.name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.rating && (
                      <span className="flex items-center gap-0.5 text-xs text-ody-warning">
                        <Star size={12} fill="currentColor" /> {item.rating}
                      </span>
                    )}
                    <button onClick={() => startEdit(item)}
                      className="text-ody-text-dim hover:text-ody-accent transition-colors p-1">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => deleteMutation.mutate(item.id)}
                      className="text-ody-text-dim hover:text-ody-danger transition-colors p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Dates + Cost */}
                <div className="flex flex-wrap gap-3 text-xs text-ody-text-dim">
                  {item.checkIn && (
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {formatDate(item.checkIn)} → {formatDate(item.checkOut)}
                      {nights !== null && <span className="text-ody-text-muted">({nights}n)</span>}
                    </span>
                  )}
                  {item.totalCost && (
                    <span className="flex items-center gap-1 font-medium text-ody-text">
                      <DollarSign size={10} />
                      {parseFloat(item.totalCost).toFixed(0)} {item.currency || 'USD'}
                    </span>
                  )}
                  {item.costPerNight && (
                    <span className="text-ody-text-dim">
                      ({parseFloat(item.costPerNight).toFixed(0)}/night)
                    </span>
                  )}
                </div>

                {/* Confirmation Code */}
                {item.confirmationCode && (
                  <div className="flex items-center gap-2">
                    <div className="text-xs bg-ody-bg rounded px-2 py-1 font-mono text-ody-text-muted flex-1">
                      Conf: {item.confirmationCode}
                    </div>
                    <button onClick={() => handleCopyConfirmation(item.confirmationCode!, item.id)}
                      className="text-ody-text-dim hover:text-ody-accent transition-colors p-1"
                      title="Copy confirmation code">
                      {copiedId === item.id ? <Check size={12} className="text-ody-success" /> : <Copy size={12} />}
                    </button>
                  </div>
                )}

                {/* Links + Contact */}
                {(item.bookingUrl || item.contactPhone || item.contactEmail) && (
                  <div className="flex flex-wrap gap-2 text-xs">
                    {item.bookingUrl && (
                      <a href={item.bookingUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-ody-accent hover:underline">
                        <ExternalLink size={10} /> Booking
                      </a>
                    )}
                    {item.contactPhone && (
                      <a href={`tel:${item.contactPhone}`}
                        className="flex items-center gap-1 text-ody-text-muted hover:text-ody-text">
                        <Phone size={10} /> {item.contactPhone}
                      </a>
                    )}
                    {item.contactEmail && (
                      <a href={`mailto:${item.contactEmail}`}
                        className="flex items-center gap-1 text-ody-text-muted hover:text-ody-text">
                        <Mail size={10} /> {item.contactEmail}
                      </a>
                    )}
                  </div>
                )}

                {/* Notes */}
                {item.notes && <p className="text-sm text-ody-text-muted">{item.notes}</p>}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
