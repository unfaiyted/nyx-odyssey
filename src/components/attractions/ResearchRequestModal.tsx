import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Check, AlertCircle, Info, Image, Clock, Ticket, History, Lightbulb, ExternalLink } from 'lucide-react';
import { createResearchRequest } from '../../server/attractions';

interface Props {
  attractionId?: string;
  attractionName?: string;
  destinationId: string;
  tripId: string;
  open: boolean;
  onClose: () => void;
}

const MISSING_INFO_OPTIONS = [
  { key: 'missingHours', label: 'Opening Hours', icon: Clock },
  { key: 'missingTickets', label: 'Ticket Prices', icon: Ticket },
  { key: 'missingPhotos', label: 'Photos', icon: Image },
  { key: 'missingHistory', label: 'History/Description', icon: History },
  { key: 'missingTips', label: 'Visitor Tips', icon: Lightbulb },
  { key: 'missingBookingLinks', label: 'Booking Links', icon: ExternalLink },
] as const;

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'text-ody-text-dim', bg: 'bg-ody-surface' },
  { value: 'medium', label: 'Medium', color: 'text-ody-warning', bg: 'bg-ody-warning/10' },
  { value: 'high', label: 'High', color: 'text-ody-error', bg: 'bg-ody-error/10' },
] as const;

export function ResearchRequestModal({ 
  attractionId, 
  attractionName,
  destinationId, 
  tripId, 
  open, 
  onClose 
}: Props) {
  const queryClient = useQueryClient();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({
    missingHours: false,
    missingTickets: false,
    missingPhotos: false,
    missingHistory: false,
    missingTips: false,
    missingBookingLinks: false,
  });
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);

  const createMutation = useMutation({
    mutationFn: () => createResearchRequest({
      data: {
        attractionId,
        destinationId,
        tripId,
        attractionName,
        ...selectedOptions,
        priority,
        notes: notes || undefined,
      },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attractions'] });
      queryClient.invalidateQueries({ queryKey: ['research-requests'] });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    },
  });

  const toggleOption = (key: string) => {
    setSelectedOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const hasSelectedOption = Object.values(selectedOptions).some(Boolean);

  if (!open) return null;

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
          className="relative w-full max-w-md max-h-[85vh] overflow-hidden rounded-2xl bg-[#0a0a0f] border border-[#2a2a3a] shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-ody-border/50 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Request Research</h3>
              {attractionName && (
                <p className="text-sm text-ody-text-dim">{attractionName}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-ody-surface transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {success ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center py-8 gap-3"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check size={32} className="text-emerald-400" />
                </div>
                <p className="text-emerald-400 font-medium">Request submitted!</p>
                <p className="text-sm text-ody-text-dim text-center">
                  We'll research this attraction and update the information soon.
                </p>
              </motion.div>
            ) : (
              <>
                {/* Missing Info Checkboxes */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Info size={14} className="text-ody-accent" />
                    What information is missing?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {MISSING_INFO_OPTIONS.map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => toggleOption(key)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs transition-all border ${
                          selectedOptions[key]
                            ? 'bg-ody-accent/20 border-ody-accent/50 text-ody-accent'
                            : 'bg-ody-surface border-ody-border/50 hover:border-ody-accent/30'
                        }`}
                      >
                        <Icon size={14} />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <AlertCircle size={14} className="text-ody-accent" />
                    Priority
                  </label>
                  <div className="flex gap-2">
                    {PRIORITY_OPTIONS.map(({ value, label, color, bg }) => (
                      <button
                        key={value}
                        onClick={() => setPriority(value as 'low' | 'medium' | 'high')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                          priority === value
                            ? `${bg} ${color} border-current`
                            : 'bg-ody-surface border-ody-border/50 hover:border-ody-accent/30'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Additional Notes</label>
                  <textarea
                    placeholder="Any specific questions or details you'd like us to research..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent resize-none h-24"
                  />
                </div>

                {/* Info Box */}
                <div className="p-3 rounded-lg bg-ody-info/10 border border-ody-info/20 text-xs text-ody-text-dim">
                  <p className="flex items-start gap-2">
                    <Info size={14} className="text-ody-info shrink-0 mt-0.5" />
                    This will create a research task and notify our team. You'll be able to track the status in the Research Queue.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          {!success && (
            <div className="px-6 py-4 border-t border-ody-border/50 flex gap-2">
              <button
                onClick={() => createMutation.mutate()}
                disabled={!hasSelectedOption || createMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-ody-accent text-white text-sm font-medium hover:bg-ody-accent-hover disabled:opacity-50 transition-colors"
              >
                {createMutation.isPending ? (
                  <><Loader2 size={14} className="animate-spin" /> Submitting...</>
                ) : (
                  'Submit Request'
                )}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg border border-ody-border text-sm hover:bg-ody-surface-hover transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
