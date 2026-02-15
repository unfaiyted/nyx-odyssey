import { useState, useEffect, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Loader2, Check, StickyNote, Moon } from 'lucide-react';
import { addAccommodationToItinerary } from '../../server/accommodation-detail';

interface AccommodationData {
  id: string;
  tripId: string;
  destinationId: string | null;
  name: string;
  type: string | null;
  checkIn: string | null;
  checkOut: string | null;
}

interface Props {
  accommodation: AccommodationData;
  tripId: string;
  open: boolean;
  onClose: () => void;
}

function getNightsBetween(checkIn: string, checkOut: string): string[] {
  const nights: string[] = [];
  const d = new Date(checkIn + 'T00:00:00');
  const end = new Date(checkOut + 'T00:00:00');
  while (d < end) {
    nights.push(d.toISOString().split('T')[0]);
    d.setDate(d.getDate() + 1);
  }
  return nights;
}

function formatDayShort(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

const TYPE_EMOJIS: Record<string, string> = {
  hotel: '🏨', hostel: '🛏️', airbnb: '🏠', villa: '🏡',
  resort: '🏖️', camping: '⛺', other: '📍',
};

export function AddAccommodationToItineraryModal({ accommodation, tripId, open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [selectedNights, setSelectedNights] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);

  const allNights = useMemo(() => {
    if (!checkIn || !checkOut) return [];
    return getNightsBetween(checkIn, checkOut);
  }, [checkIn, checkOut]);

  useEffect(() => {
    if (!open) return;
    setSuccess(false);
    setNotes('');
    const ci = accommodation.checkIn || '';
    const co = accommodation.checkOut || '';
    setCheckIn(ci);
    setCheckOut(co);
    if (ci && co) {
      setSelectedNights(getNightsBetween(ci, co));
    } else {
      setSelectedNights([]);
    }
  }, [open, accommodation.id]);

  // Update selected nights when dates change
  useEffect(() => {
    if (checkIn && checkOut) {
      const nights = getNightsBetween(checkIn, checkOut);
      setSelectedNights(nights);
    }
  }, [checkIn, checkOut]);

  function toggleNight(d: string) {
    setSelectedNights(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort()
    );
  }

  const addMutation = useMutation({
    mutationFn: () => addAccommodationToItinerary({
      data: {
        tripId,
        accommodationId: accommodation.id,
        destinationId: accommodation.destinationId || undefined,
        title: accommodation.name,
        checkIn,
        checkOut,
        notes: notes || undefined,
        selectedNights,
      },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accommodation', accommodation.id] });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    },
  });

  if (!open) return null;

  const emoji = TYPE_EMOJIS[accommodation.type || 'hotel'] || '🏨';
  const hasFixedDates = !!(accommodation.checkIn && accommodation.checkOut);

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
          {/* Hero */}
          <div className="relative shrink-0">
            <div className="h-24 bg-gradient-to-b from-[#13131a] to-[#0a0a0f] flex items-center justify-center">
              <span className="text-4xl">{emoji}</span>
            </div>
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors z-10"
            >
              <X size={18} className="text-white" />
            </button>
            <div className="absolute left-0 right-0 bottom-0 px-6 pt-4">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h3 className="text-xl font-bold text-white drop-shadow-lg">{accommodation.name}</h3>
              </motion.div>
            </div>
          </div>

          {/* Content */}
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
                  Added {selectedNights.length} night{selectedNights.length !== 1 ? 's' : ''} to itinerary!
                </p>
              </motion.div>
            ) : (
              <>
                {/* Info banner */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-ody-accent/10 border border-ody-accent/20 text-sm">
                  <Moon size={16} className="text-ody-accent shrink-0" />
                  <span className="text-ody-text-muted">
                    Each night gets its own itinerary entry so you can see where you're staying each day
                  </span>
                </div>

                {/* Date Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Calendar size={14} className="text-ody-accent" />
                    Stay Dates
                    {hasFixedDates && (
                      <span className="text-xs text-ody-text-dim font-normal ml-1">(from booking)</span>
                    )}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-ody-text-dim block mb-1">Check-in</label>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={e => setCheckIn(e.target.value)}
                        disabled={hasFixedDates}
                        className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-ody-text-dim block mb-1">Check-out</label>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={e => setCheckOut(e.target.value)}
                        disabled={hasFixedDates}
                        className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>

                {/* Night Selection */}
                {allNights.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Moon size={14} className="text-ody-accent" />
                      Nights ({selectedNights.length} of {allNights.length} selected)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {allNights.map((night, i) => {
                        const isSelected = selectedNights.includes(night);
                        return (
                          <button
                            key={night}
                            onClick={() => toggleNight(night)}
                            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                              isSelected
                                ? 'bg-ody-accent text-white shadow-lg shadow-ody-accent/30'
                                : 'bg-ody-surface border border-ody-border/50 hover:border-ody-accent/50'
                            }`}
                          >
                            {formatDayShort(night)}
                            <span className="ml-1 opacity-70">(Night {i + 1})</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedNights([...allNights])}
                        className="text-xs text-ody-accent hover:underline"
                      >
                        Select all
                      </button>
                      <span className="text-xs text-ody-text-dim">·</span>
                      <button
                        onClick={() => setSelectedNights([])}
                        className="text-xs text-ody-text-dim hover:text-ody-text"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}

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
                    disabled={selectedNights.length === 0 || !checkIn || !checkOut || addMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-ody-accent text-white text-sm font-medium hover:bg-ody-accent-hover disabled:opacity-50 transition-colors"
                  >
                    {addMutation.isPending ? (
                      <><Loader2 size={14} className="animate-spin" /> Adding...</>
                    ) : (
                      `Add ${selectedNights.length} Night${selectedNights.length !== 1 ? 's' : ''} to Itinerary`
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
