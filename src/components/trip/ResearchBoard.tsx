import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTripDestination } from '../../server/fns/trip-details';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Calendar, GripVertical, ChevronRight, ChevronLeft,
  ChevronDown, ChevronUp, ExternalLink, Image as ImageIcon,
  TrendingUp, Target, CheckCircle2, Clock,
} from 'lucide-react';
import type { TripDestination, ResearchStatus } from '../../types/trips';

interface Props {
  tripId: string;
  items: TripDestination[];
}

const columns: { id: ResearchStatus; label: string; color: string; bg: string; border: string; icon: string; textColor: string }[] = [
  { id: 'pending', label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30', icon: '⏳', textColor: 'amber' },
  { id: 'researched', label: 'Researched', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30', icon: '🔍', textColor: 'blue' },
  { id: 'approved', label: 'Approved', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', icon: '✅', textColor: 'emerald' },
  { id: 'booked', label: 'Booked', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30', icon: '🎫', textColor: 'purple' },
];

const statIcons = [Clock, Search, Target, CheckCircle2];

function DestinationCard({
  dest,
  colId,
  draggedId,
  onDragStart,
  onDragEnd,
  onMoveNext,
  onMovePrev,
  isFirst,
  isLast,
}: {
  dest: TripDestination;
  colId: ResearchStatus;
  draggedId: string | null;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onMoveNext: (d: TripDestination) => void;
  onMovePrev: (d: TripDestination) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: draggedId === dest.id ? 0.5 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      draggable
      onDragStart={e => onDragStart(e as unknown as React.DragEvent, dest.id)}
      onDragEnd={onDragEnd}
      className="glass-card overflow-hidden cursor-grab active:cursor-grabbing group hover:border-ody-accent/30 transition-colors"
    >
      {/* Photo thumbnail */}
      {dest.photoUrl && (
        <div className="h-24 w-full overflow-hidden">
          <img
            src={dest.photoUrl}
            alt={dest.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-3">
        <div className="flex items-start gap-2">
          <GripVertical className="w-4 h-4 text-ody-text-dim mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="font-medium text-sm truncate flex-1">{dest.name}</p>
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-ody-text-dim hover:text-ody-text transition-colors p-0.5"
              >
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            </div>
            {dest.description && !expanded && (
              <p className="text-xs text-ody-text-muted mt-1 line-clamp-1">{dest.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-ody-text-dim">
              {dest.arrivalDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={10} />
                  {dest.arrivalDate}
                </span>
              )}
              {dest.lat && dest.lng && (
                <span className="flex items-center gap-1">
                  <MapPin size={10} />
                  {dest.lat.toFixed(1)}, {dest.lng.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-ody-border/50 space-y-2">
                {dest.description && (
                  <p className="text-xs text-ody-text-muted">{dest.description}</p>
                )}
                {dest.departureDate && (
                  <div className="flex items-center gap-2 text-xs text-ody-text-dim">
                    <Calendar size={10} />
                    <span>Departs: {dest.departureDate}</span>
                  </div>
                )}
                {dest.lat && dest.lng && (
                  <a
                    href={`https://www.google.com/maps?q=${dest.lat},${dest.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-ody-accent hover:underline"
                  >
                    <ExternalLink size={10} />
                    View on Google Maps
                  </a>
                )}
                {!dest.photoUrl && (
                  <div className="flex items-center gap-1.5 text-xs text-ody-text-dim">
                    <ImageIcon size={10} />
                    No photo added
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation arrows */}
        <div className="flex items-center justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isFirst && (
            <button
              onClick={() => onMovePrev(dest)}
              className="text-ody-text-dim hover:text-ody-accent transition-colors p-1"
              title={`Move to ${columns[columns.findIndex(c => c.id === colId) - 1]?.label}`}
            >
              <ChevronLeft size={14} />
            </button>
          )}
          {!isLast && (
            <button
              onClick={() => onMoveNext(dest)}
              className="text-ody-text-dim hover:text-ody-accent transition-colors p-1"
              title={`Move to ${columns[columns.findIndex(c => c.id === colId) + 1]?.label}`}
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function ResearchBoard({ tripId, items }: Props) {
  const queryClient = useQueryClient();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ResearchStatus | null>(null);
  const [filter, setFilter] = useState('');

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; researchStatus: ResearchStatus }) =>
      updateTripDestination({ data: { tripId, ...data } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const getColumnItems = (status: ResearchStatus) =>
    items
      .filter(d => (d.researchStatus || 'pending') === status)
      .filter(d => !filter || d.name.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => a.orderIndex - b.orderIndex);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: ResearchStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDrop = (e: React.DragEvent, status: ResearchStatus) => {
    e.preventDefault();
    if (draggedId) {
      const dest = items.find(d => d.id === draggedId);
      if (dest && (dest.researchStatus || 'pending') !== status) {
        updateMutation.mutate({ id: draggedId, researchStatus: status });
      }
    }
    setDraggedId(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverColumn(null);
  };

  const moveToNext = (dest: TripDestination) => {
    const currentIdx = columns.findIndex(c => c.id === (dest.researchStatus || 'pending'));
    if (currentIdx < columns.length - 1) {
      updateMutation.mutate({ id: dest.id, researchStatus: columns[currentIdx + 1].id });
    }
  };

  const moveToPrev = (dest: TripDestination) => {
    const currentIdx = columns.findIndex(c => c.id === (dest.researchStatus || 'pending'));
    if (currentIdx > 0) {
      updateMutation.mutate({ id: dest.id, researchStatus: columns[currentIdx - 1].id });
    }
  };

  // Stats
  const stats = columns.map((col, i) => ({
    ...col,
    count: items.filter(d => (d.researchStatus || 'pending') === col.id).length,
    Icon: statIcons[i],
  }));
  const totalCount = items.length;
  const completedCount = stats.find(s => s.id === 'booked')!.count + stats.find(s => s.id === 'approved')!.count;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Summary stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(col => {
          const Icon = col.Icon;
          return (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border ${col.border} ${col.bg} p-4`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-5 h-5 ${col.color}`} />
                <span className={`text-2xl font-bold ${col.color}`}>{col.count}</span>
              </div>
              <p className="text-xs text-ody-text-muted mt-2">{col.label}</p>
              {totalCount > 0 && (
                <div className="mt-2 h-1 bg-ody-bg/50 rounded-full overflow-hidden">
                  <motion.div
                    className={col.bg.replace('/10', '/60')}
                    initial={{ width: 0 }}
                    animate={{ width: `${(col.count / totalCount) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    style={{ height: '100%' }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Header with search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              Research Board
              <TrendingUp className="w-4 h-4 text-ody-accent" />
            </h3>
            <p className="text-sm text-ody-text-muted mt-0.5">
              {progressPct}% complete · {totalCount} destinations
            </p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ody-text-dim" />
          <input
            type="text"
            placeholder="Filter destinations..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="pl-9 pr-4 py-2 bg-ody-bg border border-ody-border rounded-lg text-sm outline-none focus:border-ody-accent w-64"
          />
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-ody-bg rounded-full overflow-hidden flex">
        {stats.map(col => (
          <motion.div
            key={col.id}
            className={col.bg.replace('/10', '/60')}
            initial={{ width: 0 }}
            animate={{ width: totalCount > 0 ? `${(col.count / totalCount) * 100}%` : '0%' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col, colIdx) => {
          const colItems = getColumnItems(col.id);
          const isOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={e => handleDragOver(e, col.id)}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={e => handleDrop(e, col.id)}
              className={`rounded-xl border transition-colors duration-200 ${
                isOver ? `${col.border} ${col.bg}` : 'border-ody-border bg-ody-surface/50'
              }`}
            >
              {/* Column header */}
              <div className="px-4 py-3 border-b border-ody-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{col.icon}</span>
                  <span className={`font-medium text-sm ${col.color}`}>{col.label}</span>
                </div>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${col.bg} ${col.color}`}>
                  {colItems.length}
                </span>
              </div>

              {/* Cards */}
              <div className="p-3 space-y-2 min-h-[120px]">
                <AnimatePresence mode="popLayout">
                  {colItems.map(dest => (
                    <DestinationCard
                      key={dest.id}
                      dest={dest}
                      colId={col.id}
                      draggedId={draggedId}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onMoveNext={moveToNext}
                      onMovePrev={moveToPrev}
                      isFirst={colIdx === 0}
                      isLast={colIdx === columns.length - 1}
                    />
                  ))}
                </AnimatePresence>

                {colItems.length === 0 && (
                  <div className="text-center py-6 text-ody-text-dim text-xs">
                    {filter ? 'No matches' : 'Drop destinations here'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
