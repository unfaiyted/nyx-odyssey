import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteTripModalProps {
  tripName: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deleting?: boolean;
}

export function DeleteTripModal({ tripName, open, onClose, onConfirm, deleting }: DeleteTripModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-6 w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-ody-danger">
                <AlertTriangle size={20} />
                <h3 className="text-lg font-semibold">Delete Trip</h3>
              </div>
              <button onClick={onClose} className="p-1 rounded hover:bg-ody-surface-hover"><X size={18} /></button>
            </div>

            <p className="text-ody-text-muted mb-2">
              Are you sure you want to delete <strong className="text-ody-text">{tripName}</strong>?
            </p>
            <p className="text-sm text-ody-danger/80 mb-6">
              This will permanently delete all related data including destinations, itinerary items, budget, accommodations, and more. This action cannot be undone.
            </p>

            <div className="flex gap-2 justify-end">
              <button onClick={onClose}
                className="px-4 py-2 rounded-lg border border-ody-border hover:bg-ody-surface-hover transition-colors">
                Cancel
              </button>
              <button onClick={onConfirm} disabled={deleting}
                className="px-4 py-2 rounded-lg bg-ody-danger text-white hover:bg-ody-danger/80 transition-colors disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete Trip'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
