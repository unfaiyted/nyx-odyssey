import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Calendar, Car, Train, Bus, Footprints, MapPin, Loader2, Check, StickyNote } from 'lucide-react';
import { getTravelEstimates, addHighlightToItinerary } from '../../server/travel';

interface Highlight {
  id: string;
  destinationId: string;
  title: string;
  description: string | null;
  category: string;
  duration: string | null;
  address: string | null;
}

interface Props {
  highlight: Highlight;
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

function parseDurationToMinutes(dur: string | null): number | undefined {
  if (!dur) return undefined;
  // Parse "2-3 hours", "1 hour", "30 minutes", "half day", etc.
  const hourMatch = dur.match(/(\d+)(?:\s*-\s*(\d+))?\s*hour/i);
  if (hourMatch) {
    const low = parseInt(hourMatch[1]);
    const high = hourMatch[2] ? parseInt(hourMatch[2]) : low;
    return Math.round((low + high) / 2) * 60;
  }
  const minMatch = dur.match(/(\d+)\s*min/i);
  if (minMatch) return parseInt(minMatch[1]);
  if (/half\s*day/i.test(dur)) return 240;
  if (/full\s*day/i.test(dur)) return 480;
  return undefined;
}

export function AddToItineraryModal({ highlight, tripId, startDate, endDate, open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00');
  const [customTime, setCustomTime] = useState('');
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [travelMode, setTravelMode] = useState('car');
  const [notes, setNotes] = useState('');
  const [addTravel, setAddTravel] = useState(true);
  const [success, setSuccess] = useState(false);

  const tripDays = startDate && endDate ? getDaysBetween(startDate, endDate) : [];

  // Set initial duration from highlight
  useEffect(() => {
    const parsed = parseDurationToMinutes(highlight.duration);
    if (parsed) setDurationMinutes(parsed);
  }, [highlight.duration]);

  // Set first available date
  useEffect(() => {
    if (tripDays.length > 0 && !date) {
      const today = new Date().toISOString().split('T')[0];
      const futureDay = tripDays.find(d => d >= today) || tripDays[0];
      setDate(futureDay);
    }
  }, [tripDays, date]);

  const startTime = useCustomTime ? customTime : timeSlot;

  // Fetch travel estimates
  const { data: travelData, isLoading: loadingTravel } = useQuery({
    queryKey: ['travel-estimates', highlight.id, date, startTime],
    queryFn: () => getTravelEstimates({ data: { tripId, highlightId: highlight.id, date, startTime } }),
    enabled: open && !!date && !!startTime,
  });

  // Update duration from server suggestion
  useEffect(() => {
    if (travelData?.suggestedDuration && !parseDurationToMinutes(highlight.duration)) {
      setDurationMinutes(travelData.suggestedDuration);
    }
  }, [travelData?.suggestedDuration]);

  const addMutation = useMutation({
    mutationFn: () => addHighlightToItinerary({
      data: {
        tripId,
        highlightId: highlight.id,
        date,
        startTime,
        durationMinutes,
        travelMode,
        notes: notes || undefined,
        addTravelSegment: addTravel,
      },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      queryClient.invalidateQueries({ queryKey: ['destination-detail'] });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    },
  });

  // Calculate end time display
  const [sh, sm] = startTime.split(':').map(Number);
  const endMinutes = (sh || 0) * 60 + (sm || 0) + durationMinutes;
  const endTime = `${String(Math.floor(endMinutes / 60) % 24).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;

  const selectedEstimate = travelData?.estimates?.find(e => e.mode === travelMode);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg glass-card p-6 space-y-5 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">Add to Itinerary</h3>
              <p className="text-sm text-ody-text-muted mt-0.5">{highlight.title}</p>
              {highlight.address && (
                <p className="text-xs text-ody-text-dim mt-1 flex items-center gap-1">
                  <MapPin size={10} /> {highlight.address}
                </p>
              )}
            </div>
            <button onClick={onClose} className="p-1 hover:bg-ody-surface-hover rounded-lg transition-colors">
              <X size={18} className="text-ody-text-dim" />
            </button>
          </div>

          {success ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center py-8 gap-3"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check size={32} className="text-emerald-400" />
              </div>
              <p className="text-emerald-400 font-medium">Added to itinerary!</p>
            </motion.div>
          ) : (
            <>
              {/* Date Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar size={14} className="text-ody-accent" /> Date
                </label>
                {tripDays.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {tripDays.map(d => (
                      <button
                        key={d}
                        onClick={() => setDate(d)}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                          date === d
                            ? 'bg-ody-accent text-white shadow-lg shadow-ody-accent/30'
                            : 'bg-ody-surface border border-ody-border/50 hover:border-ody-accent/50'
                        }`}
                      >
                        {new Date(d + 'T00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent"
                  />
                )}
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Clock size={14} className="text-ody-accent" /> Time
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
                {highlight.duration && (
                  <p className="text-xs text-ody-text-dim">Suggested: {highlight.duration}</p>
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
                    Add travel segment
                  </label>
                </div>
                {addTravel && (
                  <>
                    {loadingTravel ? (
                      <div className="flex items-center gap-2 text-xs text-ody-text-dim py-2">
                        <Loader2 size={14} className="animate-spin" /> Calculating travel times...
                      </div>
                    ) : travelData?.fromName && (
                      <p className="text-xs text-ody-text-dim">
                        From: <span className="text-ody-text-muted">{travelData.fromName}</span>
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      {(travelData?.estimates || TRAVEL_MODES.map(m => ({ mode: m.mode, label: m.label, durationMinutes: 0, distanceKm: 0 }))).map(est => {
                        const modeConfig = TRAVEL_MODES.find(m => m.mode === est.mode);
                        if (!modeConfig) return null;
                        const Icon = modeConfig.icon;
                        return (
                          <button
                            key={est.mode}
                            onClick={() => setTravelMode(est.mode)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs transition-all ${
                              travelMode === est.mode
                                ? 'bg-ody-accent/20 border border-ody-accent/50 text-ody-accent'
                                : 'bg-ody-surface border border-ody-border/50 hover:border-ody-accent/30'
                            }`}
                          >
                            <Icon size={14} />
                            <div className="text-left">
                              <div className="font-medium">{modeConfig.label}</div>
                              {est.durationMinutes > 0 && (
                                <div className="text-[10px] opacity-70">{est.durationMinutes} min · {est.distanceKm} km</div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {selectedEstimate && selectedEstimate.durationMinutes > 0 && (
                      <p className="text-xs text-ody-accent">
                        ⏱️ Depart at {(() => {
                          const [h, m] = startTime.split(':').map(Number);
                          const dep = (h || 0) * 60 + (m || 0) - selectedEstimate.durationMinutes;
                          return `${String(Math.floor(Math.max(0, dep) / 60)).padStart(2, '0')}:${String(Math.max(0, dep) % 60).padStart(2, '0')}`;
                        })()} to arrive by {startTime}
                      </p>
                    )}
                  </>
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
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => addMutation.mutate()}
                  disabled={!date || !startTime || addMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-ody-accent text-white text-sm font-medium hover:bg-ody-accent-hover disabled:opacity-50 transition-colors"
                >
                  {addMutation.isPending ? (
                    <><Loader2 size={14} className="animate-spin" /> Adding...</>
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
