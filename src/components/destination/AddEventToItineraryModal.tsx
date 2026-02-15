import { useState, useEffect, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Calendar, Car, Train, Bus, Footprints, MapPin, Loader2, Check, StickyNote, CalendarDays } from 'lucide-react';
import { addEventToItinerary } from '../../server/event-detail';

interface EventData {
  id: string;
  destinationId: string;
  name: string;
  description: string | null;
  eventType: string | null;
  venue: string | null;
  venueAddress: string | null;
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  imageUrl?: string | null;
}

interface Props {
  event: EventData;
  tripId: string;
  startDate?: string | null;
  endDate?: string | null;
  open: boolean;
  onClose: () => void;
}

const TIME_SLOTS = [
  { label: '🌅 Early Morning', value: '07:00' },
  { label: '☀️ Morning', value: '09:00' },
  { label: '🌤️ Late Morning', value: '11:00' },
  { label: '🍽️ Lunch', value: '12:30' },
  { label: '☀️ Afternoon', value: '14:00' },
  { label: '🌇 Late Afternoon', value: '16:00' },
  { label: '🌆 Evening', value: '18:00' },
  { label: '🌙 Night', value: '20:00' },
];

const TRAVEL_MODES = [
  { mode: 'car', icon: Car, label: 'Car', emoji: '🚗' },
  { mode: 'train', icon: Train, label: 'Train', emoji: '🚆' },
  { mode: 'bus', icon: Bus, label: 'Bus', emoji: '🚌' },
  { mode: 'walk', icon: Footprints, label: 'Walk', emoji: '🚶' },
];

const TYPE_EMOJIS: Record<string, string> = {
  performance: '🎭', concert: '🎵', sports: '⚽', tour: '🗺️',
  festival: '🎪', exhibition: '🖼️', market: '🛍️', other: '📅',
};

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

function formatDayShort(d: string) {
  return new Date(d + 'T00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function AddEventToItineraryModal({ event, tripId, startDate, endDate, open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [timeSlot, setTimeSlot] = useState('18:00');
  const [customTime, setCustomTime] = useState('');
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [travelMode, setTravelMode] = useState('car');
  const [notes, setNotes] = useState('');
  const [addTravel, setAddTravel] = useState(true);
  const [success, setSuccess] = useState(false);

  const tripDays = startDate && endDate ? getDaysBetween(startDate, endDate) : [];

  // Determine if event has fixed dates
  const hasFixedDate = !!event.startDate;
  const isMultiDay = !!(event.startDate && event.endDate && event.endDate !== event.startDate);
  const eventDays = useMemo(() => {
    if (event.startDate && event.endDate && event.endDate !== event.startDate) {
      return getDaysBetween(event.startDate, event.endDate);
    }
    if (event.startDate) return [event.startDate];
    return [];
  }, [event.startDate, event.endDate]);

  // Pre-populate from event data
  useEffect(() => {
    if (!open) return;
    // Reset state on open
    setSuccess(false);
    setNotes('');

    if (hasFixedDate) {
      // Fixed date event — select all event days by default
      setSelectedDates([...eventDays]);
    } else if (tripDays.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      setSelectedDates([tripDays.find(d => d >= today) || tripDays[0]]);
    }

    if (event.startTime) {
      setCustomTime(event.startTime.slice(0, 5));
      setUseCustomTime(true);
    } else {
      setUseCustomTime(false);
    }

    if (event.startTime && event.endTime) {
      const [sh, sm] = event.startTime.split(':').map(Number);
      const [eh, em] = event.endTime.split(':').map(Number);
      const dur = ((eh || 0) * 60 + (em || 0)) - ((sh || 0) * 60 + (sm || 0));
      if (dur > 0) setDurationMinutes(dur);
    }
  }, [open, event.id]);

  const startTime = useCustomTime ? customTime : timeSlot;

  // Calculate end time
  const [sh, sm] = (startTime || '18:00').split(':').map(Number);
  const endMinutes = (sh || 0) * 60 + (sm || 0) + durationMinutes;
  const endTime = `${String(Math.floor(endMinutes / 60) % 24).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;

  // Toggle a date in selection (for non-fixed-date events)
  function toggleDate(d: string) {
    setSelectedDates(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort()
    );
  }

  const addMutation = useMutation({
    mutationFn: () => addEventToItinerary({
      data: {
        tripId,
        eventId: event.id,
        destinationId: event.destinationId,
        title: event.name,
        description: event.description || undefined,
        dates: selectedDates,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        durationMinutes,
        location: event.venue || event.venueAddress || undefined,
        category: 'activity',
        travelMode: addTravel ? travelMode : undefined,
        notes: notes || undefined,
      },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', event.id] });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    },
  });

  if (!open) return null;

  const emoji = TYPE_EMOJIS[event.eventType || 'other'] || '📅';

  // Dates to show in the picker
  const pickableDates = hasFixedDate ? eventDays : tripDays;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-lg max-h-[80vh] overflow-hidden rounded-2xl bg-[#0a0a0f] border border-[#2a2a3a] shadow-2xl flex flex-col"
        >
          {/* Hero Section */}
          <div className="relative shrink-0">
            {event.imageUrl ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative h-48 overflow-hidden"
              >
                <img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0f]" />
              </motion.div>
            ) : (
              <div className="h-24 bg-gradient-to-b from-[#13131a] to-[#0a0a0f] flex items-center justify-center">
                <span className="text-4xl">{emoji}</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors z-10"
            >
              <X size={18} className="text-white" />
            </button>

            <div className={`absolute left-0 right-0 px-6 ${event.imageUrl ? 'bottom-4' : 'bottom-0 pt-4'}`}>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h3 className="text-xl font-bold text-white drop-shadow-lg">{event.name}</h3>
                {(event.venue || event.venueAddress) && (
                  <p className="text-sm text-white/70 mt-1 flex items-center gap-1 drop-shadow-md">
                    <MapPin size={12} /> {event.venue || event.venueAddress}
                  </p>
                )}
              </motion.div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-5">
            {success ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center py-8 gap-3"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check size={32} className="text-emerald-400" />
                </div>
                <p className="text-emerald-400 font-medium">
                  Added to itinerary{selectedDates.length > 1 ? ` (${selectedDates.length} days)` : ''}!
                </p>
              </motion.div>
            ) : (
              <>
                {/* Multi-day event banner */}
                {isMultiDay && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-ody-accent/10 border border-ody-accent/20 text-sm">
                    <CalendarDays size={16} className="text-ody-accent shrink-0" />
                    <span className="text-ody-text-muted">
                      This is a <span className="text-ody-accent font-medium">{eventDays.length}-day event</span> — it will appear on each selected day in your itinerary
                    </span>
                  </div>
                )}

                {/* Date Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Calendar size={14} className="text-ody-accent" />
                    {hasFixedDate ? 'Event Dates' : 'Date'}
                    {hasFixedDate && (
                      <span className="text-xs text-ody-text-dim font-normal ml-1">(fixed)</span>
                    )}
                  </label>

                  {pickableDates.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {pickableDates.map(d => {
                        const isSelected = selectedDates.includes(d);
                        const isFixed = hasFixedDate;
                        return (
                          <button
                            key={d}
                            onClick={() => {
                              if (isFixed && isMultiDay) {
                                // For multi-day events, allow toggling individual days
                                toggleDate(d);
                              } else if (isFixed) {
                                // Single fixed date — can't deselect
                                return;
                              } else {
                                // Free date picking — toggle for multi-select
                                toggleDate(d);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                              isSelected
                                ? 'bg-ody-accent text-white shadow-lg shadow-ody-accent/30'
                                : 'bg-ody-surface border border-ody-border/50 hover:border-ody-accent/50'
                            } ${isFixed && !isMultiDay ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            {formatDayShort(d)}
                            {isMultiDay && (
                              <span className="ml-1 opacity-70">
                                (Day {eventDays.indexOf(d) + 1})
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <input
                      type="date"
                      value={selectedDates[0] || ''}
                      onChange={e => setSelectedDates([e.target.value])}
                      className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent"
                    />
                  )}

                  {isMultiDay && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedDates([...eventDays])}
                        className="text-xs text-ody-accent hover:underline"
                      >
                        Select all days
                      </button>
                      <span className="text-xs text-ody-text-dim">·</span>
                      <button
                        onClick={() => setSelectedDates([])}
                        className="text-xs text-ody-text-dim hover:text-ody-text"
                      >
                        Clear
                      </button>
                    </div>
                  )}

                  {!hasFixedDate && selectedDates.length > 1 && (
                    <p className="text-xs text-ody-accent">
                      Adding to {selectedDates.length} days — one itinerary entry per day
                    </p>
                  )}
                </div>

                {/* Time Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Clock size={14} className="text-ody-accent" /> Time
                    {event.startTime && (
                      <span className="text-xs text-ody-text-dim font-normal ml-1">(from event)</span>
                    )}
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => setUseCustomTime(false)}
                      className={`text-xs px-2 py-1 rounded ${!useCustomTime ? 'bg-ody-accent/20 text-ody-accent' : 'text-ody-text-dim'}`}
                    >
                      Quick Pick
                    </button>
                    <button
                      onClick={() => setUseCustomTime(true)}
                      className={`text-xs px-2 py-1 rounded ${useCustomTime ? 'bg-ody-accent/20 text-ody-accent' : 'text-ody-text-dim'}`}
                    >
                      Custom
                    </button>
                  </div>
                  {useCustomTime ? (
                    <input
                      type="time"
                      value={customTime}
                      onChange={e => setCustomTime(e.target.value)}
                      className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent"
                    />
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {TIME_SLOTS.map(slot => (
                        <button
                          key={slot.value}
                          onClick={() => setTimeSlot(slot.value)}
                          className={`px-2 py-2 rounded-lg text-xs text-center transition-all ${
                            timeSlot === slot.value
                              ? 'bg-ody-accent text-white shadow-sm'
                              : 'bg-ody-surface border border-ody-border/50 hover:border-ody-accent/50'
                          }`}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-ody-text-dim">
                    {startTime} – {endTime} ({Math.floor(durationMinutes / 60)}h{durationMinutes % 60 > 0 ? ` ${durationMinutes % 60}m` : ''})
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={15}
                      max={480}
                      step={15}
                      value={durationMinutes}
                      onChange={e => setDurationMinutes(Number(e.target.value))}
                      className="flex-1 accent-[var(--color-ody-accent)]"
                    />
                    <span className="text-sm font-mono w-16 text-right">
                      {Math.floor(durationMinutes / 60)}h{durationMinutes % 60 > 0 ? `${durationMinutes % 60}m` : ''}
                    </span>
                  </div>
                  {event.startTime && event.endTime && (
                    <p className="text-xs text-ody-text-dim">
                      Event times: {event.startTime.slice(0, 5)} – {event.endTime.slice(0, 5)}
                    </p>
                  )}
                </div>

                {/* Travel Mode */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Travel</label>
                    <label className="flex items-center gap-2 text-xs text-ody-text-dim cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addTravel}
                        onChange={e => setAddTravel(e.target.checked)}
                        className="accent-[var(--color-ody-accent)]"
                      />
                      Include travel info
                    </label>
                  </div>
                  {addTravel && (
                    <div className="grid grid-cols-2 gap-2">
                      {TRAVEL_MODES.map(m => {
                        const Icon = m.icon;
                        return (
                          <button
                            key={m.mode}
                            onClick={() => setTravelMode(m.mode)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs transition-all ${
                              travelMode === m.mode
                                ? 'bg-ody-accent/20 border border-ody-accent/50 text-ody-accent'
                                : 'bg-ody-surface border border-ody-border/50 hover:border-ody-accent/30'
                            }`}
                          >
                            <Icon size={14} />
                            <span className="font-medium">{m.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <StickyNote size={14} className="text-ody-accent" /> Notes
                  </label>
                  <textarea
                    placeholder="Optional notes..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent resize-none h-16"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 pb-2">
                  <button
                    onClick={() => addMutation.mutate()}
                    disabled={selectedDates.length === 0 || !startTime || addMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-ody-accent text-white text-sm font-medium hover:bg-ody-accent-hover disabled:opacity-50 transition-colors"
                  >
                    {addMutation.isPending ? (
                      <><Loader2 size={14} className="animate-spin" /> Adding...</>
                    ) : selectedDates.length > 1 ? (
                      `Add to ${selectedDates.length} Days`
                    ) : (
                      'Add to Itinerary'
                    )}
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-lg border border-ody-border text-sm hover:bg-ody-surface-hover transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
