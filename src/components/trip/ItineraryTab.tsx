import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Check, Clock, MapPin, Trash2, GripVertical,
  CalendarDays, CalendarRange,
} from 'lucide-react';
import type { ItineraryItem } from '../../types/trips';

interface Props {
  tripId: string;
  items: ItineraryItem[];
}

type ViewMode = 'day' | 'week';

const categoryConfig: Record<string, { icon: string; color: string; bgColor: string }> = {
  activity: { icon: '🎯', color: 'text-amber-400', bgColor: 'bg-amber-400/10 border-amber-400/30' },
  transport: { icon: '🚗', color: 'text-blue-400', bgColor: 'bg-blue-400/10 border-blue-400/30' },
  meal: { icon: '🍽️', color: 'text-green-400', bgColor: 'bg-green-400/10 border-green-400/30' },
  sightseeing: { icon: '📸', color: 'text-purple-400', bgColor: 'bg-purple-400/10 border-purple-400/30' },
  rest: { icon: '😴', color: 'text-indigo-400', bgColor: 'bg-indigo-400/10 border-indigo-400/30' },
};

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

function formatDateLong(dateStr: string) {
  return new Date(dateStr + 'T00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function getDaysBetween(start: string, end: string): string[] {
  const days: string[] = [];
  const d = new Date(start + 'T00:00');
  const endD = new Date(end + 'T00:00');
  while (d <= endD) {
    days.push(d.toISOString().split('T')[0]);
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function getWeekNumber(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00');
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function getWeekRange(dates: string[]): string {
  if (!dates.length) return '';
  const first = formatDate(dates[0]);
  const last = formatDate(dates[dates.length - 1]);
  return `${first} – ${last}`;
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().split('T')[0];
}

function isPast(dateStr: string): boolean {
  return dateStr < new Date().toISOString().split('T')[0];
}

// ─── Drag-and-drop item card ──────────────────────────
function TimelineItemCard({
  item, onToggle, onDelete,
}: {
  item: ItineraryItem;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const cat = categoryConfig[item.category] || categoryConfig.activity;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12, transition: { duration: 0.15 } }}
      draggable
      onDragStart={(e: any) => {
        e.dataTransfer?.setData('text/plain', JSON.stringify({ id: item.id, date: item.date }));
        e.currentTarget.style.opacity = '0.4';
      }}
      onDragEnd={(e: any) => { e.currentTarget.style.opacity = '1'; }}
      className={`group relative flex items-start gap-3 p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing
        ${item.completed ? 'opacity-50' : ''} ${cat.bgColor} hover:shadow-lg hover:shadow-black/10`}
    >
      {/* Grip handle */}
      <div className="mt-1 text-ody-text-dim opacity-0 group-hover:opacity-60 transition-opacity">
        <GripVertical size={14} />
      </div>

      {/* Completion toggle */}
      <button onClick={onToggle}
        className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all
          ${item.completed ? 'bg-emerald-500 border-emerald-500 scale-95' : 'border-ody-border hover:border-ody-accent hover:scale-110'}`}>
        {item.completed && <Check size={11} className="text-white" strokeWidth={3} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-base">{cat.icon}</span>
          <span className={`font-medium text-sm ${item.completed ? 'line-through text-ody-text-dim' : ''}`}>
            {item.title}
          </span>
          <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-semibold ${cat.color} bg-black/20`}>
            {item.category}
          </span>
        </div>
        {item.description && (
          <p className="text-xs text-ody-text-muted mt-0.5 line-clamp-2">{item.description}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-ody-text-dim">
          {item.startTime && (
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {item.startTime}{item.endTime && ` – ${item.endTime}`}
            </span>
          )}
          {item.location && (
            <span className="flex items-center gap-1">
              <MapPin size={10} />{item.location}
            </span>
          )}
        </div>
      </div>

      {/* Delete */}
      <button onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-ody-text-dim hover:text-red-400 transition-all p-1">
        <Trash2 size={13} />
      </button>
    </motion.div>
  );
}

// ─── Day Column ───────────────────────────────────────
function DayColumn({
  date, items, dayNumber, onToggle, onDelete, onDrop,
}: {
  date: string;
  items: ItineraryItem[];
  dayNumber: number;
  onToggle: (item: ItineraryItem) => void;
  onDelete: (id: string) => void;
  onDrop: (itemId: string, targetDate: string) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const today = isToday(date);
  const past = isPast(date);
  const sorted = [...items].sort((a, b) => {
    if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
    return a.orderIndex - b.orderIndex;
  });
  const completedCount = items.filter(i => i.completed).length;

  return (
    <div
      className={`relative transition-all ${dragOver ? 'scale-[1.01]' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        try {
          const data = JSON.parse(e.dataTransfer.getData('text/plain'));
          if (data.date !== date) onDrop(data.id, date);
        } catch {}
      }}
    >
      {/* Day header */}
      <div className={`flex items-center gap-3 mb-3 pb-2 border-b
        ${today ? 'border-ody-accent' : 'border-ody-border/50'}`}>
        <div className={`flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold
          ${today ? 'bg-ody-accent text-white shadow-lg shadow-ody-accent/30' :
            past ? 'bg-ody-surface text-ody-text-dim' : 'bg-ody-surface-hover text-ody-text'}`}>
          {dayNumber}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${today ? 'text-ody-accent' : past ? 'text-ody-text-dim' : ''}`}>
              {formatDateLong(date)}
            </span>
            {today && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-ody-accent/20 text-ody-accent font-semibold uppercase tracking-wider">
                Today
              </span>
            )}
          </div>
          {items.length > 0 && (
            <span className="text-[11px] text-ody-text-dim">
              {items.length} item{items.length !== 1 ? 's' : ''}
              {completedCount > 0 && ` · ${completedCount} done`}
            </span>
          )}
        </div>
      </div>

      {/* Drop zone indicator */}
      {dragOver && (
        <div className="absolute inset-0 rounded-xl border-2 border-dashed border-ody-accent/50 bg-ody-accent/5 pointer-events-none z-10" />
      )}

      {/* Items */}
      <div className="space-y-2 min-h-[48px]">
        <AnimatePresence mode="popLayout">
          {sorted.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-xs text-ody-text-dim text-center py-4 border border-dashed border-ody-border/30 rounded-xl"
            >
              {dragOver ? 'Drop here to schedule' : 'No activities planned'}
            </motion.div>
          ) : (
            sorted.map(item => (
              <TimelineItemCard
                key={item.id}
                item={item}
                onToggle={() => onToggle(item)}
                onDelete={() => onDelete(item.id)}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Week View ────────────────────────────────────────
function WeekView({
  dates, grouped, tripStartDate, onToggle, onDelete, onDrop,
}: {
  dates: string[];
  grouped: Record<string, ItineraryItem[]>;
  tripStartDate: string;
  onToggle: (item: ItineraryItem) => void;
  onDelete: (id: string) => void;
  onDrop: (itemId: string, targetDate: string) => void;
}) {
  const totalItems = dates.reduce((sum, d) => sum + (grouped[d]?.length || 0), 0);
  const completedItems = dates.reduce((sum, d) =>
    sum + (grouped[d]?.filter(i => i.completed).length || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <CalendarRange size={18} className="text-ody-accent" />
        <div>
          <h4 className="text-sm font-bold text-ody-accent">{getWeekRange(dates)}</h4>
          <span className="text-[11px] text-ody-text-dim">
            {totalItems} activities · {completedItems} completed
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dates.map((date) => {
          const dayNum = getDaysBetween(tripStartDate, date).length;
          return (
            <DayColumn
              key={date}
              date={date}
              items={grouped[date] || []}
              dayNumber={dayNum}
              tripId={tripId}
              onToggle={onToggle}
              onDelete={onDelete}
              onDrop={onDrop}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────
export function ItineraryTab({ tripId, items }: Props) {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    title: '', date: '', startTime: '', endTime: '',
    location: '', category: 'activity', description: '',
  });

  // ── Mutations ──
  const addMutation = useMutation({
    mutationFn: (data: typeof form) => fetch(`/api/trips/${tripId}/itinerary`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      setShowAdd(false);
      setForm({ title: '', date: '', startTime: '', endTime: '', location: '', category: 'activity', description: '' });
    },
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

  const moveMutation = useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) => fetch(`/api/trips/${tripId}/itinerary`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, date }),
    }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  // ── Handlers ──
  const handleDrop = useCallback((itemId: string, targetDate: string) => {
    moveMutation.mutate({ id: itemId, date: targetDate });
  }, [moveMutation]);

  // ── Data processing ──
  const grouped = items.reduce<Record<string, ItineraryItem[]>>((acc, item) => {
    (acc[item.date] ||= []).push(item);
    return acc;
  }, {});

  const allDates = Object.keys(grouped).sort();
  const tripStartDate = allDates[0] || new Date().toISOString().split('T')[0];
  const tripEndDate = allDates[allDates.length - 1] || tripStartDate;

  // Generate all dates between first and last item
  const fullDateRange = allDates.length > 0 ? getDaysBetween(tripStartDate, tripEndDate) : [];

  // Week grouping
  const weekGroups: Record<string, string[]> = {};
  for (const date of fullDateRange) {
    const wk = getWeekNumber(date);
    (weekGroups[wk] ||= []).push(date);
  }
  const sortedWeeks = Object.keys(weekGroups).sort();

  // Stats
  const totalItems = items.length;
  const completedItems = items.filter(i => i.completed).length;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header with stats and controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <CalendarDays size={20} className="text-ody-accent" />
            Itinerary Timeline
          </h3>
          {totalItems > 0 && (
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-ody-text-dim">
                {completedItems}/{totalItems} completed
              </span>
              <div className="w-24 h-1.5 rounded-full bg-ody-surface overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-ody-accent to-emerald-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <span className="text-[10px] text-ody-text-dim font-mono">{progress}%</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-ody-surface rounded-lg p-0.5 border border-ody-border/50">
            <button
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                ${viewMode === 'day' ? 'bg-ody-accent text-white shadow-sm' : 'text-ody-text-muted hover:text-ody-text'}`}
            >
              <CalendarDays size={12} /> Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                ${viewMode === 'week' ? 'bg-ody-accent text-white shadow-sm' : 'text-ody-text-muted hover:text-ody-text'}`}
            >
              <CalendarRange size={12} /> Week
            </button>
          </div>

          <button onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ody-accent/10 text-ody-accent text-sm hover:bg-ody-accent/20 transition-colors">
            <Plus size={14} /> Add Item
          </button>
        </div>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input placeholder="Title" value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
                <input type="date" value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
                <input type="time" value={form.startTime} placeholder="Start time"
                  onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))}
                  className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
                <input type="time" value={form.endTime} placeholder="End time"
                  onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))}
                  className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
                <input placeholder="Location" value={form.location}
                  onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
                <select value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent">
                  <option value="activity">🎯 Activity</option>
                  <option value="transport">🚗 Transport</option>
                  <option value="meal">🍽️ Meal</option>
                  <option value="sightseeing">📸 Sightseeing</option>
                  <option value="rest">😴 Rest</option>
                </select>
              </div>
              <textarea placeholder="Description (optional)" value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent resize-none h-20" />
              <div className="flex gap-2">
                <button onClick={() => addMutation.mutate(form)}
                  disabled={!form.title || !form.date}
                  className="px-4 py-2 rounded-lg bg-ody-accent text-white text-sm hover:bg-ody-accent-hover disabled:opacity-50 transition-colors">
                  Save
                </button>
                <button onClick={() => setShowAdd(false)}
                  className="px-4 py-2 rounded-lg border border-ody-border text-sm hover:bg-ody-surface-hover transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag & Drop hint */}
      {totalItems > 0 && (
        <p className="text-[11px] text-ody-text-dim flex items-center gap-1.5">
          <GripVertical size={11} /> Drag items between days to reschedule
        </p>
      )}

      {/* Timeline content */}
      {fullDateRange.length === 0 ? (
        <div className="text-center py-16">
          <CalendarDays size={48} className="mx-auto text-ody-text-dim/30 mb-4" />
          <p className="text-ody-text-muted mb-1">No itinerary items yet</p>
          <p className="text-xs text-ody-text-dim">Add your first activity to start building your timeline</p>
        </div>
      ) : viewMode === 'day' ? (
        /* ── Day-by-day view with vertical timeline ── */
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-6 bottom-6 w-px bg-gradient-to-b from-ody-accent/50 via-ody-border/30 to-transparent" />

          <div className="space-y-8">
            {fullDateRange.map((date, idx) => {
              const dayNum = idx + 1;
              return (
                <div key={date} className="relative pl-12">
                  {/* Timeline dot */}
                  <div className={`absolute left-3 top-1 w-3 h-3 rounded-full border-2
                    ${isToday(date) ? 'bg-ody-accent border-ody-accent shadow-lg shadow-ody-accent/40 scale-125' :
                      (grouped[date]?.length || 0) > 0 ? 'bg-ody-accent/60 border-ody-accent/60' :
                      'bg-ody-surface border-ody-border'}`}
                  />
                  <DayColumn
                    date={date}
                    items={grouped[date] || []}
                    dayNumber={dayNum}
                    tripId={tripId}
                    onToggle={(item) => toggleMutation.mutate(item)}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    onDrop={handleDrop}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── Week-by-week view ── */
        <div className="space-y-10">
          {sortedWeeks.map((weekKey, idx) => (
            <motion.div
              key={weekKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <WeekView
                weekKey={weekKey}
                dates={weekGroups[weekKey]}
                grouped={grouped}
                tripStartDate={tripStartDate}
                tripId={tripId}
                onToggle={(item) => toggleMutation.mutate(item)}
                onDelete={(id) => deleteMutation.mutate(id)}
                onDrop={handleDrop}
              />
              {idx < sortedWeeks.length - 1 && (
                <div className="border-b border-ody-border/20 mt-6" />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
