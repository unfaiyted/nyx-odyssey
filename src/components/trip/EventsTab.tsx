import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addEvent, updateEvent, deleteEvent } from '../../server/fns/trip-details';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Calendar, DollarSign, Trash2, MapPin, ExternalLink,
  Filter, ChevronDown, ChevronUp, Edit3, Check, Search,
  Music, Trophy, Compass, Ticket, Clock, Users, Copy, CheckCircle,
  Eye, Star, ShoppingBag, X,
} from 'lucide-react';
import type { DestinationEvent, TripDestination } from '../../types/trips';

interface Props {
  tripId: string;
  items: DestinationEvent[];
  destinations?: TripDestination[];
}

const typeConfig: Record<string, { icon: typeof Music; label: string; emoji: string }> = {
  performance: { icon: Music, label: 'Performance', emoji: '🎭' },
  concert: { icon: Music, label: 'Concert', emoji: '🎵' },
  sports: { icon: Trophy, label: 'Sports', emoji: '⚽' },
  tour: { icon: Compass, label: 'Tour', emoji: '🗺️' },
  festival: { icon: Star, label: 'Festival', emoji: '🎪' },
  exhibition: { icon: Eye, label: 'Exhibition', emoji: '🖼️' },
  market: { icon: ShoppingBag, label: 'Market', emoji: '🛍️' },
  other: { icon: Calendar, label: 'Other', emoji: '📅' },
};

const statusConfig: Record<string, { color: string; bg: string; label: string; step: number }> = {
  researched: { color: 'text-ody-text-muted', bg: 'bg-ody-text-muted/15', label: 'Researched', step: 0 },
  interested: { color: 'text-ody-info', bg: 'bg-ody-info/15', label: 'Interested', step: 1 },
  booked: { color: 'text-ody-success', bg: 'bg-ody-success/15', label: 'Booked', step: 2 },
  attended: { color: 'text-ody-accent', bg: 'bg-ody-accent/15', label: 'Attended', step: 3 },
};

const statusFlow = ['researched', 'interested', 'booked', 'attended'];

type SortField = 'startDate' | 'name' | 'status' | 'ticketPriceFrom';
type FilterStatus = 'all' | 'researched' | 'interested' | 'booked' | 'attended';
type FilterType = 'all' | string;

function formatDate(d: string | null): string {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(t: string | null): string {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

function priceDisplay(from: string | null, to: string | null, currency: string): string {
  if (!from && !to) return '';
  if (from && to && from !== to) return `${currency} ${from}–${to}`;
  return `${currency} ${from || to}`;
}

const emptyForm = {
  name: '', description: '', eventType: 'performance', startDate: '', endDate: '',
  startTime: '', endTime: '', venue: '', venueAddress: '', status: 'researched',
  ticketUrl: '', bookingUrl: '', confirmationCode: '', ticketPriceFrom: '', ticketPriceTo: '',
  groupSize: '1', totalCost: '', currency: 'EUR', notes: '', destinationId: '',
};

export function EventsTab({ tripId, items, destinations = [] }: Props) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortField, setSortField] = useState<SortField>('startDate');
  const [sortAsc, setSortAsc] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[string, string]>(['', '']);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const destMap = useMemo(() => {
    const m = new Map<string, TripDestination>();
    destinations.forEach(d => m.set(d.id, d));
    return m;
  }, [destinations]);

  // Mutations
  const addMutation = useMutation({
    mutationFn: (data: any) => addEvent({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      setShowAdd(false);
      setForm({ ...emptyForm });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateEvent({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      setEditingId(null);
      setForm({ ...emptyForm });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEvent({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const handleSubmit = () => {
    const payload = {
      ...form,
      groupSize: parseInt(form.groupSize) || 1,
      totalCost: form.totalCost || null,
      ticketPriceFrom: form.ticketPriceFrom || null,
      ticketPriceTo: form.ticketPriceTo || null,
      confirmationCode: form.confirmationCode || null,
      ticketUrl: form.ticketUrl || null,
      bookingUrl: form.bookingUrl || null,
      venue: form.venue || null,
      venueAddress: form.venueAddress || null,
      description: form.description || null,
      notes: form.notes || null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      startTime: form.startTime || null,
      endTime: form.endTime || null,
      destinationId: form.destinationId || null,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      addMutation.mutate(payload);
    }
  };

  const startEdit = (ev: DestinationEvent) => {
    setForm({
      name: ev.name,
      description: ev.description || '',
      eventType: ev.eventType,
      startDate: ev.startDate || '',
      endDate: ev.endDate || '',
      startTime: ev.startTime || '',
      endTime: ev.endTime || '',
      venue: ev.venue || '',
      venueAddress: ev.venueAddress || '',
      status: ev.status,
      ticketUrl: ev.ticketUrl || '',
      bookingUrl: ev.bookingUrl || '',
      confirmationCode: ev.confirmationCode || '',
      ticketPriceFrom: ev.ticketPriceFrom || '',
      ticketPriceTo: ev.ticketPriceTo || '',
      groupSize: String(ev.groupSize || 1),
      totalCost: ev.totalCost || '',
      currency: ev.currency || 'EUR',
      notes: ev.notes || '',
      destinationId: ev.destinationId || '',
    });
    setEditingId(ev.id);
    setShowAdd(true);
  };

  const advanceStatus = (ev: DestinationEvent) => {
    const idx = statusFlow.indexOf(ev.status);
    if (idx < statusFlow.length - 1) {
      updateMutation.mutate({ id: ev.id, status: statusFlow[idx + 1] });
    }
  };

  const copyConfirmation = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter & sort
  const filtered = useMemo(() => {
    let list = [...items];
    if (filterStatus !== 'all') list = list.filter(e => e.status === filterStatus);
    if (filterType !== 'all') list = list.filter(e => e.eventType === filterType);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q) || e.venue?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q));
    }
    if (priceRange[0]) list = list.filter(e => parseFloat(e.ticketPriceFrom || '0') >= parseFloat(priceRange[0]));
    if (priceRange[1]) list = list.filter(e => parseFloat(e.ticketPriceTo || '99999') <= parseFloat(priceRange[1]));

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'startDate': cmp = (a.startDate || '').localeCompare(b.startDate || ''); break;
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'status': cmp = statusFlow.indexOf(a.status) - statusFlow.indexOf(b.status); break;
        case 'ticketPriceFrom': cmp = parseFloat(a.ticketPriceFrom || '0') - parseFloat(b.ticketPriceFrom || '0'); break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [items, filterStatus, filterType, searchQuery, sortField, sortAsc, priceRange]);

  // Calendar data
  const calendarEvents = useMemo(() => {
    const map = new Map<string, DestinationEvent[]>();
    items.forEach(e => {
      if (e.startDate) {
        const existing = map.get(e.startDate) || [];
        existing.push(e);
        map.set(e.startDate, existing);
      }
    });
    return map;
  }, [items]);

  // Stats
  const stats = useMemo(() => {
    const total = items.length;
    const booked = items.filter(e => e.status === 'booked' || e.status === 'attended').length;
    const totalSpend = items.reduce((sum, e) => sum + parseFloat(e.totalCost || '0'), 0);
    return { total, booked, totalSpend };
  }, [items]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    sortField === field ? (sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : null
  );

  // Form component
  const renderForm = () => (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
      className="bg-ody-surface border border-ody-border rounded-xl p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{editingId ? 'Edit Event' : 'Add Event'}</h3>
        <button onClick={() => { setShowAdd(false); setEditingId(null); setForm({ ...emptyForm }); }}
          className="p-1 hover:bg-ody-surface-hover rounded"><X size={18} /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <label className="text-xs text-ody-text-muted mb-1 block">Name *</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 bg-ody-bg border border-ody-border rounded-lg text-sm" placeholder="Event name" />
        </div>

        <div>
          <label className="text-xs text-ody-text-muted mb-1 block">Destination</label>
          <select value={form.destinationId} onChange={e => setForm({ ...form, destinationId: e.target.value })}
            className="w-full px-3 py-2 bg-ody-bg border border-ody-border rounded-lg text-sm">
            <option value="">Select destination</option>
            {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs text-ody-text-muted mb-1 block">Type</label>
          <select value={form.eventType} onChange={e => setForm({ ...form, eventType: e.target.value })}
            className="w-full px-3 py-2 bg-ody-bg border border-ody-border rounded-lg text-sm">
            {Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs text-ody-text-muted mb-1 block">Start Date</label>
          <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
            className="w-full px-3 py-2 bg-ody-bg border border-ody-border rounded-lg text-sm" />
        </div>

        <div>
          <label className="text-xs text-ody-text-muted mb-1 block">End Date</label>
          <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
            className="w-full px-3 py-2 bg-ody-bg border border-ody-border rounded-lg text-sm" />
        </div>

        <div>
          <label className="text-xs text-ody-text-muted mb-1 block">Start Time</label>
          <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })}
            className="w-full px-3 py-2 bg-ody-bg border border-ody-border rounded-lg text-sm" />
        </div>

        <div>
          <label className="text-xs text-ody-text-muted mb-1 block">End Time</label>
          <input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })}
            className="w-full px-3 py-2 bg-ody-bg border border-ody-border rounded-lg text-sm" />
        </div>

        <div>
          <label className="text-xs text-ody-text-muted mb-1 block">Venue</label>
          <input value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })}
            className="w-full px-3 py-2 bg-ody-bg border border-ody-border rounded-lg text-sm" placeholder="Venue name" />
        </div>

        <div>
          <label className="text-xs text-ody-text-muted mb-1 block">Venue Address</label>
          <input value={form.venueAddress} onChange={e => setForm({ ...form, venueAddress: e.target.value })}
            className="w-full px-3 py-2 bg-ody-bg border border-ody-border rounded-lg text-sm" placeholder="Address" />
        </div>

        <div>
          <label className="text-xs text-ody-text-muted mb-1 block">Status</label>
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
            className="w-full px-3 py-2 bg-ody-bg border border-ody-border rounded-lg text-sm">
            {statusFlow.map(s => <option key={s} value={s}>{statusConfig[s].label}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs text-ody-text-muted mb-1 block">Currency</label>
          <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}
            className="w-full px-3 py-2 bg-ody-bg border border-ody-border rounded-lg text-sm">
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-ody-text-muted mb-1 block">Price From (per person)</label>
          <input type="number" step="0.01" value={form.ticketPriceFrom} onChange={e => setForm({ ...form, ticketPriceFrom: e.target.value })}
            className="w-full px-3 py-2 bg-ody-bg border border-ody-border rounded-lg text-sm" placeholder="Min price" />
        </div>

        <div>
          <label className="text-xs text-ody-text-muted mb-1 block">Price To (per person)</label>
          <input type="number" step="0.01" value={form.ticketPriceTo} onChange={e => setForm({ ...form, ticketPriceTo: e.target.value })}
            className="w-full px-3 py-2 bg-ody-bg border border-ody-border rounded-lg text-sm" placeholder="Max price" />
        </div>

        <div>
          <label className="text-xs text-ody-text-muted mb-1 block">Group Size</label>
          <input type="number" value={form.groupSize} onChange={e => setForm({ ...form, groupSize: e.target.value })}
            className="w-full px-3 py-2 bg-ody-bg border border-ody-border rounded-lg text-sm" />
        </div>

        <div>
          <label className="text-xs text-ody-text-muted mb-1 block">Total Cost (group)</label>
          <input type="number" step="0.01" value={form.totalCost} onChange={e => setForm({ ...form, totalCost: e.target.value })}
            className="w-full px-3 py-2 bg-ody-bg border border-ody-border rounded-lg text-sm" placeholder="Total for group" />
        </div>

        <div>
          <label className="text-xs text-ody-text-muted mb-1 block">Ticket URL</label>
          <input value={form.ticketUrl} onChange={e => setForm({ ...form, ticketUrl: e.target.value })}
            className="w-full px-3 py-2 bg-ody-bg border border-ody-border rounded-lg text-sm" placeholder="https://..." />
        </div>

        <div>
          <label className="text-xs text-ody-text-muted mb-1 block">Booking URL</label>
          <input value={form.bookingUrl} onChange={e => setForm({ ...form, bookingUrl: e.target.value })}
            className="w-full px-3 py-2 bg-ody-bg border border-ody-border rounded-lg text-sm" placeholder="https://..." />
        </div>

        <div>
          <label className="text-xs text-ody-text-muted mb-1 block">Confirmation Code</label>
          <input value={form.confirmationCode} onChange={e => setForm({ ...form, confirmationCode: e.target.value })}
            className="w-full px-3 py-2 bg-ody-bg border border-ody-border rounded-lg text-sm" placeholder="ABC123" />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-ody-text-muted mb-1 block">Description</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 bg-ody-bg border border-ody-border rounded-lg text-sm" rows={2} />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-ody-text-muted mb-1 block">Notes</label>
          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
            className="w-full px-3 py-2 bg-ody-bg border border-ody-border rounded-lg text-sm" rows={2} />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button onClick={() => { setShowAdd(false); setEditingId(null); setForm({ ...emptyForm }); }}
          className="px-4 py-2 text-sm rounded-lg border border-ody-border hover:bg-ody-surface-hover">Cancel</button>
        <button onClick={handleSubmit} disabled={!form.name || !form.destinationId || addMutation.isPending || updateMutation.isPending}
          className="px-4 py-2 text-sm rounded-lg bg-ody-accent text-white hover:bg-ody-accent/90 disabled:opacity-50">
          {editingId ? 'Update' : 'Add'} Event
        </button>
      </div>
    </motion.div>
  );

  // Calendar view
  const renderCalendar = () => {
    const allDates = items.filter(e => e.startDate).map(e => e.startDate!).sort();
    if (allDates.length === 0) return <p className="text-center text-ody-text-muted py-8">No events with dates to show</p>;

    const start = new Date(allDates[0] + 'T00:00:00');
    const end = new Date(allDates[allDates.length - 1] + 'T00:00:00');
    // Expand to full weeks
    start.setDate(start.getDate() - start.getDay());
    end.setDate(end.getDate() + (6 - end.getDay()));

    const weeks: Date[][] = [];
    const cur = new Date(start);
    while (cur <= end) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }
      weeks.push(week);
    }

    return (
      <div className="bg-ody-surface border border-ody-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 text-center text-xs font-medium text-ody-text-muted border-b border-ody-border">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-2">{d}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-ody-border last:border-b-0">
            {week.map((day, di) => {
              const dateStr = day.toISOString().split('T')[0];
              const dayEvents = calendarEvents.get(dateStr) || [];
              return (
                <div key={di} className="min-h-[80px] p-1 border-r border-ody-border last:border-r-0">
                  <div className="text-xs text-ody-text-dim mb-1">{day.getDate()}</div>
                  {dayEvents.map(ev => {
                    const cfg = statusConfig[ev.status] || statusConfig.researched;
                    const typeCfg = typeConfig[ev.eventType] || typeConfig.other;
                    return (
                      <div key={ev.id} className={`text-[10px] px-1 py-0.5 rounded mb-0.5 truncate cursor-pointer ${cfg.bg} ${cfg.color}`}
                        title={`${ev.name} - ${typeCfg.label}`}>
                        {typeCfg.emoji} {ev.name}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-ody-surface border border-ody-border rounded-xl p-3 text-center">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-ody-text-muted">Total Events</div>
        </div>
        <div className="bg-ody-surface border border-ody-border rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-ody-success">{stats.booked}</div>
          <div className="text-xs text-ody-text-muted">Booked / Attended</div>
        </div>
        <div className="bg-ody-surface border border-ody-border rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-ody-warning">€{stats.totalSpend.toFixed(0)}</div>
          <div className="text-xs text-ody-text-muted">Total Spend</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ody-text-dim" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-ody-surface border border-ody-border rounded-lg text-sm"
            placeholder="Search events..." />
        </div>
        <div className="flex gap-1 bg-ody-surface border border-ody-border rounded-lg p-0.5">
          <button onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${viewMode === 'list' ? 'bg-ody-accent text-white' : 'text-ody-text-muted hover:text-ody-text'}`}>
            List
          </button>
          <button onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-ody-accent text-white' : 'text-ody-text-muted hover:text-ody-text'}`}>
            Calendar
          </button>
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg border transition-colors ${showFilters ? 'bg-ody-accent/10 border-ody-accent text-ody-accent' : 'border-ody-border hover:bg-ody-surface-hover'}`}>
          <Filter size={14} /> Filters
        </button>
        <button onClick={() => { setShowAdd(true); setEditingId(null); setForm({ ...emptyForm }); }}
          className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg bg-ody-accent text-white hover:bg-ody-accent/90">
          <Plus size={16} /> Add Event
        </button>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-3 bg-ody-surface border border-ody-border rounded-xl p-3">
            <div>
              <label className="text-xs text-ody-text-muted block mb-1">Status</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as FilterStatus)}
                className="px-2 py-1.5 bg-ody-bg border border-ody-border rounded-lg text-sm">
                <option value="all">All</option>
                {statusFlow.map(s => <option key={s} value={s}>{statusConfig[s].label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-ody-text-muted block mb-1">Category</label>
              <select value={filterType} onChange={e => setFilterType(e.target.value)}
                className="px-2 py-1.5 bg-ody-bg border border-ody-border rounded-lg text-sm">
                <option value="all">All</option>
                {Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-ody-text-muted block mb-1">Sort By</label>
              <div className="flex gap-1">
                {([['startDate', 'Date'], ['name', 'Name'], ['status', 'Status'], ['ticketPriceFrom', 'Price']] as [SortField, string][]).map(([f, l]) => (
                  <button key={f} onClick={() => toggleSort(f)}
                    className={`flex items-center gap-1 px-2 py-1.5 text-xs rounded-lg border transition-colors ${sortField === f ? 'bg-ody-accent/10 border-ody-accent text-ody-accent' : 'border-ody-border hover:bg-ody-surface-hover'}`}>
                    {l} <SortIcon field={f} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-ody-text-muted block mb-1">Price Range</label>
              <div className="flex items-center gap-1">
                <input type="number" value={priceRange[0]} onChange={e => setPriceRange([e.target.value, priceRange[1]])}
                  className="w-20 px-2 py-1.5 bg-ody-bg border border-ody-border rounded-lg text-sm" placeholder="Min" />
                <span className="text-ody-text-dim">–</span>
                <input type="number" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], e.target.value])}
                  className="w-20 px-2 py-1.5 bg-ody-bg border border-ody-border rounded-lg text-sm" placeholder="Max" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAdd && renderForm()}
      </AnimatePresence>

      {/* Content */}
      {viewMode === 'calendar' ? renderCalendar() : (
        <>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-ody-text-muted">
              <Ticket size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium mb-1">No events yet</p>
              <p className="text-sm">Add shows, concerts, tours, and more for your destinations</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(ev => {
                const typeCfg = typeConfig[ev.eventType] || typeConfig.other;
                const stCfg = statusConfig[ev.status] || statusConfig.researched;
                const dest = destMap.get(ev.destinationId);
                const TypeIcon = typeCfg.icon;
                const price = priceDisplay(ev.ticketPriceFrom, ev.ticketPriceTo, ev.currency);

                return (
                  <motion.div key={ev.id} layout
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-ody-surface border border-ody-border rounded-xl p-4 hover:border-ody-accent/30 transition-colors">
                    <div className="flex items-start gap-3">
                      {/* Type icon */}
                      <div className="w-10 h-10 rounded-lg bg-ody-accent/10 flex items-center justify-center text-lg shrink-0">
                        {typeCfg.emoji}
                      </div>

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold truncate">{ev.name}</h4>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full ${stCfg.bg} ${stCfg.color}`}>
                            {stCfg.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ody-text-muted">
                          {dest && (
                            <span className="flex items-center gap-1"><MapPin size={12} /> {dest.name}</span>
                          )}
                          {ev.venue && (
                            <span className="flex items-center gap-1"><MapPin size={12} /> {ev.venue}</span>
                          )}
                          {ev.startDate && (
                            <span className="flex items-center gap-1">
                              <Calendar size={12} /> {formatDate(ev.startDate)}
                              {ev.endDate && ev.endDate !== ev.startDate && ` – ${formatDate(ev.endDate)}`}
                            </span>
                          )}
                          {ev.startTime && (
                            <span className="flex items-center gap-1"><Clock size={12} /> {formatTime(ev.startTime)}{ev.endTime ? ` – ${formatTime(ev.endTime)}` : ''}</span>
                          )}
                          {price && (
                            <span className="flex items-center gap-1"><DollarSign size={12} /> {price}/pp</span>
                          )}
                          {ev.groupSize > 1 && (
                            <span className="flex items-center gap-1"><Users size={12} /> {ev.groupSize} people</span>
                          )}
                          {ev.totalCost && (
                            <span className="flex items-center gap-1 font-medium text-ody-warning"><DollarSign size={12} /> {ev.currency} {ev.totalCost} total</span>
                          )}
                        </div>

                        {ev.description && (
                          <p className="text-xs text-ody-text-dim mt-1 line-clamp-2">{ev.description}</p>
                        )}

                        {ev.confirmationCode && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-ody-success/10 text-ody-success px-2 py-1 rounded font-mono">
                              {ev.confirmationCode}
                            </span>
                            <button onClick={() => copyConfirmation(ev.confirmationCode!, ev.id)}
                              className="text-ody-text-dim hover:text-ody-text">
                              {copiedId === ev.id ? <CheckCircle size={14} className="text-ody-success" /> : <Copy size={14} />}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {ev.ticketUrl && (
                          <a href={ev.ticketUrl} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 hover:bg-ody-surface-hover rounded-lg text-ody-text-dim hover:text-ody-accent" title="Tickets">
                            <Ticket size={16} />
                          </a>
                        )}
                        {ev.bookingUrl && (
                          <a href={ev.bookingUrl} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 hover:bg-ody-surface-hover rounded-lg text-ody-text-dim hover:text-ody-accent" title="Booking">
                            <ExternalLink size={16} />
                          </a>
                        )}
                        {statusFlow.indexOf(ev.status) < statusFlow.length - 1 && (
                          <button onClick={() => advanceStatus(ev)} title={`Move to ${statusConfig[statusFlow[statusFlow.indexOf(ev.status) + 1]]?.label}`}
                            className="p-1.5 hover:bg-ody-surface-hover rounded-lg text-ody-text-dim hover:text-ody-success">
                            <Check size={16} />
                          </button>
                        )}
                        <button onClick={() => startEdit(ev)}
                          className="p-1.5 hover:bg-ody-surface-hover rounded-lg text-ody-text-dim hover:text-ody-text">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => { if (confirm('Delete this event?')) deleteMutation.mutate(ev.id); }}
                          className="p-1.5 hover:bg-ody-surface-hover rounded-lg text-ody-text-dim hover:text-ody-danger">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Status workflow indicator */}
                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-ody-border/50">
                      {statusFlow.map((s, i) => {
                        const cfg = statusConfig[s];
                        const isActive = statusFlow.indexOf(ev.status) >= i;
                        return (
                          <div key={s} className="flex items-center gap-1 flex-1">
                            <div className={`h-1.5 flex-1 rounded-full transition-colors ${isActive ? cfg.bg.replace('/15', '/40') : 'bg-ody-border'}`} />
                            {i === statusFlow.length - 1 ? null : null}
                          </div>
                        );
                      })}
                      <span className="text-[10px] text-ody-text-dim ml-1">{stCfg.label}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
