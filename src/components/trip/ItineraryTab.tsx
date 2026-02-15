import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addItineraryItem, updateItineraryItem, deleteItineraryItem, reorderItinerary } from '../../server/fns/trip-details';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Check, Clock, MapPin, Trash2, GripVertical,
  CalendarDays, CalendarRange, ChevronDown, ChevronRight,
  Navigation, Filter, ExternalLink, Ticket,
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import type { ItineraryItem, TripDestination } from '../../types/trips';

interface Props {
  tripId: string;
  items: ItineraryItem[];
  startDate?: string | null;
  endDate?: string | null;
  destinations?: TripDestination[];
}

type ViewMode = 'day' | 'week';
type DragData = { id: string; date: string; orderIndex: number };

const categoryConfig: Record<string, { icon: string; color: string; bgColor: string }> = {
  activity: { icon: '🎯', color: 'text-amber-400', bgColor: 'bg-amber-400/10 border-amber-400/30' },
  transport: { icon: '🚗', color: 'text-blue-400', bgColor: 'bg-blue-400/10 border-blue-400/30' },
  meal: { icon: '🍽️', color: 'text-green-400', bgColor: 'bg-green-400/10 border-green-400/30' },
  sightseeing: { icon: '📸', color: 'text-purple-400', bgColor: 'bg-purple-400/10 border-purple-400/30' },
  rest: { icon: '😴', color: 'text-indigo-400', bgColor: 'bg-indigo-400/10 border-indigo-400/30' },
  travel: { icon: '🧭', color: 'text-cyan-400', bgColor: 'bg-cyan-400/10 border-cyan-400/30' },
};

const categoryOptions = [
  { value: 'activity', label: '🎯 Activity' },
  { value: 'transport', label: '🚗 Transport' },
  { value: 'meal', label: '🍽️ Meal' },
  { value: 'sightseeing', label: '📸 Sightseeing' },
  { value: 'rest', label: '😴 Rest' },
];

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

function getWeekKey(dateStr: string, tripStart: string): number {
  const d = new Date(dateStr + 'T00:00');
  const s = new Date(tripStart + 'T00:00');
  return Math.floor((d.getTime() - s.getTime()) / (7 * 86400000));
}

function getWeekRange(dates: string[]): string {
  if (!dates.length) return '';
  return `${formatDate(dates[0])} – ${formatDate(dates[dates.length - 1])}`;
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().split('T')[0];
}

function isPast(dateStr: string): boolean {
  return dateStr < new Date().toISOString().split('T')[0];
}

/** Find which destination covers a given date */
function getDestinationForDate(date: string, destinations: TripDestination[]): TripDestination | null {
  for (const dest of destinations) {
    if (dest.arrivalDate && dest.departureDate) {
      if (date >= dest.arrivalDate && date <= dest.departureDate) return dest;
    }
  }
  return null;
}

// ─── Drag-and-drop item card ──────────────────────────
const eventStatusConfig: Record<string, { label: string; color: string }> = {
  interested: { label: 'Interested', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
  booked: { label: 'Booked', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  confirmed: { label: 'Confirmed', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  cancelled: { label: 'Cancelled', color: 'text-red-400 bg-red-400/10 border-red-400/30' },
  attended: { label: 'Attended', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
};

function TimelineItemCard({
  item, onToggle, onDelete,
}: {
  item: ItineraryItem;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const cat = categoryConfig[item.category] || categoryConfig.activity;
  const destName = item.destinationName;
  const destId = item.destinationId;
  const evtStatus = item.eventStatus ? eventStatusConfig[item.eventStatus] : null;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/json', JSON.stringify({ id: item.id, date: item.date, orderIndex: item.orderIndex }));
        e.currentTarget.style.opacity = '0.4';
      }}
      onDragEnd={(e) => { e.currentTarget.style.opacity = '1'; }}
      className={`group relative flex items-start gap-3 p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing
        ${item.completed ? 'opacity-50' : ''} ${cat.bgColor} hover:shadow-lg hover:shadow-black/10`}
    >
      <div className="mt-1 text-ody-text-dim opacity-0 group-hover:opacity-60 transition-opacity">
        <GripVertical size={14} />
      </div>

      <button onClick={onToggle}
        className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all
          ${item.completed ? 'bg-emerald-500 border-emerald-500 scale-95' : 'border-ody-border hover:border-ody-accent hover:scale-110'}`}>
        {item.completed && <Check size={11} className="text-white" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-base">{cat.icon}</span>
          {item.destinationHighlightId ? (
            <Link
              to="/highlight/$highlightId"
              params={{ highlightId: item.destinationHighlightId }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className={`font-medium text-sm hover:text-ody-accent hover:underline transition-colors ${item.completed ? 'line-through text-ody-text-dim' : ''}`}
            >
              {item.title}
            </Link>
          ) : (
            <span className={`font-medium text-sm ${item.completed ? 'line-through text-ody-text-dim' : ''}`}>
              {item.title}
            </span>
          )}
          <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-semibold ${cat.color} bg-black/20`}>
            {item.category}
          </span>
          {/* Destination badge */}
          {destName && destId && (
            <Link
              to="/destination/$destinationId"
              params={{ destinationId: destId }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-ody-accent/10 text-ody-accent border border-ody-accent/20 hover:bg-ody-accent/20 hover:border-ody-accent/40 transition-colors cursor-pointer"
            >
              <MapPin size={8} />
              {destName}
              <ExternalLink size={7} className="opacity-60" />
            </Link>
          )}
          {/* Event booking status badge */}
          {evtStatus && (
            <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${evtStatus.color}`}>
              <Ticket size={8} />
              {evtStatus.label}
            </span>
          )}
        </div>
        {/* Event name if linked */}
        {item.eventName && (
          <p className="text-[11px] text-ody-text-muted mt-0.5 flex items-center gap-1">
            🎫 {item.eventId ? (
              <Link
                to="/event/$eventId"
                params={{ eventId: item.eventId }}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                className="text-ody-accent hover:underline"
              >
                {item.eventName}
              </Link>
            ) : item.eventName}
            {item.eventBookingUrl && (
              <a
                href={item.eventBookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                className="text-ody-accent hover:underline"
              >
                Book →
              </a>
            )}
          </p>
        )}
        {item.description && (
          <p className="text-xs text-ody-text-muted mt-0.5 line-clamp-2">{item.description}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-ody-text-dim flex-wrap">
          {item.startTime && (
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {item.startTime}{item.endTime && ` – ${item.endTime}`}
            </span>
          )}
          {item.location && (
            <span className="flex items-center gap-1">
              <MapPin size={10} />
              {destId ? (
                <Link
                  to="/destination/$destinationId"
                  params={{ destinationId: destId }}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  className="hover:text-ody-accent transition-colors"
                >
                  {item.location}
                </Link>
              ) : (
                item.location
              )}
            </span>
          )}
          {item.travelTimeMinutes && item.travelMode && (
            <span className="flex items-center gap-1 text-blue-400">
              <Navigation size={10} />
              {item.travelTimeMinutes}min by {item.travelMode}
              {item.travelFromLocation && ` from ${item.travelFromLocation}`}
            </span>
          )}
          {item.notes && (
            <span className="text-ody-text-dim italic">📝 {item.notes}</span>
          )}
        </div>
      </div>

      <button onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-ody-text-dim hover:text-red-400 transition-all p-1">
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ─── Drop indicator line ───────────────────────────────
function DropIndicator({ isActive }: { isActive: boolean }) {
  return (
    <div className={`h-1 rounded-full mx-2 transition-all duration-150
      ${isActive ? 'bg-ody-accent/60 scale-y-[2]' : 'bg-transparent'}`}
    />
  );
}

// ─── Day Column ───────────────────────────────────────
function DayColumn({
  date, items, dayNumber, destination, collapsed, onToggleCollapse,
  onToggle, onDelete, onDrop, onReorder,
}: {
  date: string;
  items: ItineraryItem[];
  dayNumber: number;
  destination: TripDestination | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onToggle: (item: ItineraryItem) => void;
  onDelete: (id: string) => void;
  onDrop: (itemId: string, targetDate: string, targetIndex: number) => void;
  onReorder: (itemId: string, targetDate: string, targetIndex: number) => void;
}) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const today = isToday(date);
  const past = isPast(date);
  const sorted = [...items].sort((a, b) => {
    if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
    return a.orderIndex - b.orderIndex;
  });
  const completedCount = items.filter(i => i.completed).length;

  // Compute drop index from mouse Y position relative to item rects
  const computeDropIndex = (e: React.DragEvent) => {
    const container = e.currentTarget;
    const itemEls = container.querySelectorAll<HTMLElement>('[data-item-index]');
    const mouseY = e.clientY;

    for (let i = 0; i < itemEls.length; i++) {
      const rect = itemEls[i].getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (mouseY < midY) return i;
    }
    return itemEls.length;
  };

  const handleContainerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
    const idx = computeDropIndex(e);
    setDragOverIndex(idx);
  };

  const handleContainerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const targetIndex = computeDropIndex(e);
    setDragOverIndex(null);
    setIsDragOver(false);
    try {
      const data: DragData = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.date === date) {
        onReorder(data.id, date, targetIndex);
      } else {
        onDrop(data.id, date, targetIndex);
      }
    } catch {}
  };

  const handleContainerDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the container entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverIndex(null);
      setIsDragOver(false);
    }
  };

  return (
    <div
      id={`day-${date}`}
      className="relative transition-all"
    >
      {/* Day header */}
      <button
        onClick={onToggleCollapse}
        className={`flex items-center gap-3 mb-3 pb-2 border-b w-full text-left
        ${today ? 'border-ody-accent' : 'border-ody-border/50'}`}
      >
        <div className={`flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold transition-transform
          ${today ? 'bg-ody-accent text-white shadow-lg shadow-ody-accent/30' :
            past ? 'bg-ody-surface text-ody-text-dim' : 'bg-ody-surface-hover text-ody-text'}`}>
          {dayNumber}
        </div>
        <div className="flex-1 min-w-0">
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
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <span className="text-[11px] text-ody-text-dim">
                {items.length} item{items.length !== 1 ? 's' : ''}
                {completedCount > 0 && ` · ${completedCount} done`}
              </span>
            )}
            {destination && (
              <span className="text-[11px] text-ody-accent/70 flex items-center gap-1">
                <MapPin size={9} />{destination.name}
              </span>
            )}
          </div>
        </div>
        {collapsed ? <ChevronRight size={16} className="text-ody-text-dim" /> : <ChevronDown size={16} className="text-ody-text-dim" />}
      </button>

      {/* Items — entire area is one big drop zone */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className={`space-y-1 min-h-[48px] rounded-xl p-1 transition-colors ${
                isDragOver ? 'bg-ody-accent/5 ring-1 ring-ody-accent/20' : ''
              }`}
              onDragOver={handleContainerDragOver}
              onDrop={handleContainerDrop}
              onDragLeave={handleContainerDragLeave}
            >
              {sorted.length === 0 ? (
                <div
                  className={`text-xs text-ody-text-dim text-center py-6 border border-dashed rounded-xl transition-colors
                    ${isDragOver ? 'border-ody-accent/50 bg-ody-accent/5' : 'border-ody-border/30'}`}
                >
                  {isDragOver ? 'Drop here to schedule' : 'No activities planned'}
                </div>
              ) : (
                sorted.map((item, idx) => (
                  <div key={item.id}>
                    {dragOverIndex === idx && <DropIndicator isActive />}
                    <div data-item-index={idx}>
                      <TimelineItemCard
                        item={item}
                        onToggle={() => onToggle(item)}
                        onDelete={() => onDelete(item.id)}
                      />
                    </div>
                  </div>
                ))
              )}
              {dragOverIndex === sorted.length && sorted.length > 0 && <DropIndicator isActive />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Week View ────────────────────────────────────────
function WeekView({
  weekNumber, dates, grouped, tripStartDate, destinations,
  collapsedDays, onToggleCollapse,
  onToggle, onDelete, onDrop, onReorder,
}: {
  weekNumber: number;
  dates: string[];
  grouped: Record<string, ItineraryItem[]>;
  tripStartDate: string;
  destinations: TripDestination[];
  collapsedDays: Set<string>;
  onToggleCollapse: (date: string) => void;
  onToggle: (item: ItineraryItem) => void;
  onDelete: (id: string) => void;
  onDrop: (itemId: string, targetDate: string, targetIndex: number) => void;
  onReorder: (itemId: string, targetDate: string, targetIndex: number) => void;
}) {
  const totalItems = dates.reduce((sum, d) => sum + (grouped[d]?.length || 0), 0);
  const completedItems = dates.reduce((sum, d) =>
    sum + (grouped[d]?.filter(i => i.completed).length || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <CalendarRange size={18} className="text-ody-accent" />
        <div>
          <h4 className="text-sm font-bold text-ody-accent">Week {weekNumber + 1} · {getWeekRange(dates)}</h4>
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
              destination={getDestinationForDate(date, destinations)}
              collapsed={collapsedDays.has(date)}
              onToggleCollapse={() => onToggleCollapse(date)}
              onToggle={onToggle}
              onDelete={onDelete}
              onDrop={onDrop}
              onReorder={onReorder}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────
export function ItineraryTab({ tripId, items, startDate, endDate, destinations = [] }: Props) {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [showAdd, setShowAdd] = useState(false);
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', date: '', startTime: '', endTime: '',
    location: '', category: 'activity', description: '',
  });

  // ── Mutations ──
  const addMutation = useMutation({
    mutationFn: (data: typeof form) => addItineraryItem({ data: { tripId, ...data } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      setShowAdd(false);
      setForm({ title: '', date: '', startTime: '', endTime: '', location: '', category: 'activity', description: '' });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (item: ItineraryItem) => updateItineraryItem({ data: { tripId, id: item.id, completed: !item.completed } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteItineraryItem({ data: { tripId, id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, date, orderIndex }: { id: string; date: string; orderIndex: number }) =>
      updateItineraryItem({ data: { tripId, id, date, orderIndex } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const reorderMutation = useMutation({
    mutationFn: (updates: { id: string; orderIndex: number }[]) =>
      reorderItinerary({ data: { tripId, items: updates } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  // ── Handlers ──
  const handleDrop = useCallback((itemId: string, targetDate: string, targetIndex: number) => {
    moveMutation.mutate({ id: itemId, date: targetDate, orderIndex: targetIndex });
  }, [moveMutation]);

  const handleReorder = useCallback((itemId: string, targetDate: string, targetIndex: number) => {
    // Compute new order for all items in this day
    const dayItems = (grouped[targetDate] || [])
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .filter(i => i.id !== itemId);
    const movedItem = items.find(i => i.id === itemId);
    if (!movedItem) return;

    dayItems.splice(targetIndex, 0, movedItem);
    const updates = dayItems.map((item, idx) => ({ id: item.id, orderIndex: idx }));
    reorderMutation.mutate(updates);
  }, [items, reorderMutation]);

  const toggleCollapse = useCallback((date: string) => {
    setCollapsedDays(prev => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  }, []);

  const scrollToToday = useCallback(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const el = document.getElementById(`day-${todayStr}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const collapseAllPast = useCallback(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    setCollapsedDays(new Set(fullDateRange.filter(d => d < todayStr)));
  }, []);

  // ── Data processing ──
  const filteredItems = filterCategory ? items.filter(i => i.category === filterCategory) : items;

  const grouped = filteredItems.reduce<Record<string, ItineraryItem[]>>((acc, item) => {
    (acc[item.date] ||= []).push(item);
    return acc;
  }, {});

  // Use trip dates if available, otherwise derive from items
  const allDates = Object.keys(grouped).sort();
  const tripStartDate = startDate || allDates[0] || new Date().toISOString().split('T')[0];
  const tripEndDate = endDate || allDates[allDates.length - 1] || tripStartDate;

  const fullDateRange = getDaysBetween(tripStartDate, tripEndDate);

  // Week grouping by trip-relative weeks
  const weekGroups: Record<number, string[]> = {};
  for (const date of fullDateRange) {
    const wk = getWeekKey(date, tripStartDate);
    (weekGroups[wk] ||= []).push(date);
  }
  const sortedWeeks = Object.keys(weekGroups).map(Number).sort((a, b) => a - b);

  // Stats
  const totalItems = items.length;
  const completedItems = items.filter(i => i.completed).length;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const todayInRange = fullDateRange.includes(new Date().toISOString().split('T')[0]);

  // Destination segments for the timeline
  const destSegments: { dest: TripDestination | null; startIdx: number; endIdx: number }[] = [];
  let currentDest: TripDestination | null = null;
  let segStart = 0;
  fullDateRange.forEach((date, idx) => {
    const dest = getDestinationForDate(date, destinations);
    const destId = dest?.id || null;
    const curId = currentDest?.id || null;
    if (destId !== curId) {
      if (idx > 0) destSegments.push({ dest: currentDest, startIdx: segStart, endIdx: idx - 1 });
      currentDest = dest;
      segStart = idx;
    }
  });
  if (fullDateRange.length > 0) {
    destSegments.push({ dest: currentDest, startIdx: segStart, endIdx: fullDateRange.length - 1 });
  }

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

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category filter */}
          <div className="relative">
            <select
              value={filterCategory || ''}
              onChange={e => setFilterCategory(e.target.value || null)}
              className="appearance-none bg-ody-surface border border-ody-border/50 rounded-lg px-3 py-1.5 pr-7 text-xs outline-none focus:border-ody-accent"
            >
              <option value="">All categories</option>
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <Filter size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-ody-text-dim pointer-events-none" />
          </div>

          {/* Scroll to today */}
          {todayInRange && (
            <button onClick={scrollToToday}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ody-border/50 text-xs text-ody-text-muted hover:text-ody-accent hover:border-ody-accent/50 transition-colors">
              <Navigation size={12} /> Today
            </button>
          )}

          {/* Collapse past days */}
          <button onClick={collapseAllPast}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ody-border/50 text-xs text-ody-text-muted hover:text-ody-text hover:border-ody-border transition-colors">
            <ChevronRight size={12} /> Hide past
          </button>

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
                  {categoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
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
          <GripVertical size={11} /> Drag items between days to reschedule, or within a day to reorder
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

          <div className="space-y-6">
            {destSegments.map((seg, segIdx) => (
              <div key={segIdx}>
                {/* Destination header */}
                {seg.dest && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-12 mb-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ody-accent/5 border border-ody-accent/20 w-fit"
                  >
                    <MapPin size={13} className="text-ody-accent" />
                    <span className="text-xs font-semibold text-ody-accent">{seg.dest.name}</span>
                    {seg.dest.arrivalDate && seg.dest.departureDate && (
                      <span className="text-[10px] text-ody-text-dim">
                        {formatDate(seg.dest.arrivalDate)} – {formatDate(seg.dest.departureDate)}
                      </span>
                    )}
                  </motion.div>
                )}

                {fullDateRange.slice(seg.startIdx, seg.endIdx + 1).map((date) => {
                  const dayNum = getDaysBetween(tripStartDate, date).length;
                  return (
                    <div key={date} className="relative pl-12">
                      {/* Timeline dot */}
                      <div className={`absolute left-3 top-1 w-3 h-3 rounded-full border-2 transition-all
                        ${isToday(date) ? 'bg-ody-accent border-ody-accent shadow-lg shadow-ody-accent/40 scale-125' :
                          (grouped[date]?.length || 0) > 0 ? 'bg-ody-accent/60 border-ody-accent/60' :
                          'bg-ody-surface border-ody-border'}`}
                      />
                      <DayColumn
                        date={date}
                        items={grouped[date] || []}
                        dayNumber={dayNum}
                        destination={getDestinationForDate(date, destinations)}
                        collapsed={collapsedDays.has(date)}
                        onToggleCollapse={() => toggleCollapse(date)}
                        onToggle={(item) => toggleMutation.mutate(item)}
                        onDelete={(id) => deleteMutation.mutate(id)}
                        onDrop={handleDrop}
                        onReorder={handleReorder}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── Week-by-week view ── */
        <div className="space-y-10">
          {sortedWeeks.map((weekNum, idx) => (
            <motion.div
              key={weekNum}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <WeekView
                weekNumber={weekNum}
                dates={weekGroups[weekNum]}
                grouped={grouped}
                tripStartDate={tripStartDate}
                destinations={destinations}
                collapsedDays={collapsedDays}
                onToggleCollapse={toggleCollapse}
                onToggle={(item) => toggleMutation.mutate(item)}
                onDelete={(id) => deleteMutation.mutate(id)}
                onDrop={handleDrop}
                onReorder={handleReorder}
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
