import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddDestinationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    lat: number;
    lng: number;
    address: string;
    category: string;
    plannedDate: string;
    notes: string;
  }) => void;
}

export function AddDestinationModal({ open, onClose, onSubmit }: AddDestinationModalProps) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    lat: '',
    lng: '',
    address: '',
    category: 'stop',
    plannedDate: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
    });
    setForm({ name: '', description: '', lat: '', lng: '', address: '', category: 'stop', plannedDate: '', notes: '' });
    onClose();
  };

  const inputClass =
    'w-full rounded-md border border-ody-border bg-ody-bg px-3 py-2 text-sm text-ody-text focus:outline-none focus:border-ody-accent';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-ody-surface border border-ody-border rounded-xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">Add Destination</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                required
                placeholder="Name *"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={inputClass}
              />
              <input
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className={inputClass}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  type="number"
                  step="any"
                  placeholder="Latitude *"
                  value={form.lat}
                  onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
                  className={inputClass}
                />
                <input
                  required
                  type="number"
                  step="any"
                  placeholder="Longitude *"
                  value={form.lng}
                  onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <input
                placeholder="Address"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className={inputClass}
              />
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className={inputClass}
              >
                <option value="start">Start</option>
                <option value="stop">Stop</option>
                <option value="end">End</option>
                <option value="poi">Point of Interest</option>
              </select>
              <input
                type="date"
                placeholder="Planned date"
                value={form.plannedDate}
                onChange={(e) => setForm((f) => ({ ...f, plannedDate: e.target.value }))}
                className={inputClass}
              />
              <textarea
                placeholder="Notes"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className={inputClass}
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-md border border-ody-border px-4 py-2 text-sm hover:bg-ody-surface-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-md bg-ody-accent px-4 py-2 text-sm font-medium text-white hover:bg-ody-accent-hover transition-colors"
                >
                  Add
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
