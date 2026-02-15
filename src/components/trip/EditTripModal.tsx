import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { Trip } from '../../types/trips';

interface EditTripModalProps {
  trip: Trip;
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Trip>) => void;
  saving?: boolean;
}

const STATUS_OPTIONS = ['planning', 'active', 'completed', 'cancelled'] as const;
const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF'] as const;

export function EditTripModal({ trip, open, onClose, onSave, saving }: EditTripModalProps) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    coverImage: '',
    totalBudget: '',
    currency: 'USD',
    status: 'planning',
    homeBaseName: '',
    homeBaseLat: '',
    homeBaseLng: '',
    homeBaseAddress: '',
    homeBaseCurrency: '',
  });

  useEffect(() => {
    if (open && trip) {
      setForm({
        name: trip.name || '',
        description: trip.description || '',
        startDate: trip.startDate || '',
        endDate: trip.endDate || '',
        coverImage: trip.coverImage || '',
        totalBudget: trip.totalBudget || '',
        currency: trip.currency || 'USD',
        status: trip.status || 'planning',
        homeBaseName: trip.homeBaseName || '',
        homeBaseLat: trip.homeBaseLat?.toString() || '',
        homeBaseLng: trip.homeBaseLng?.toString() || '',
        homeBaseAddress: trip.homeBaseAddress || '',
        homeBaseCurrency: trip.homeBaseCurrency || '',
      });
    }
  }, [open, trip]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: form.name,
      description: form.description || null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      coverImage: form.coverImage || null,
      totalBudget: form.totalBudget || null,
      currency: form.currency,
      status: form.status,
      homeBaseName: form.homeBaseName || null,
      homeBaseLat: form.homeBaseLat ? parseFloat(form.homeBaseLat) : null,
      homeBaseLng: form.homeBaseLng ? parseFloat(form.homeBaseLng) : null,
      homeBaseAddress: form.homeBaseAddress || null,
      homeBaseCurrency: form.homeBaseCurrency || null,
    } as Partial<Trip>);
  };

  const inputClass = 'w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm focus:border-ody-accent outline-none';
  const labelClass = 'block text-sm font-medium text-ody-text-muted mb-1';

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
            className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Trip</h3>
              <button onClick={onClose} className="p-1 rounded hover:bg-ody-surface-hover"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className={inputClass} required />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className={inputClass} rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>End Date</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                    className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Cover Image URL</label>
                <input value={form.coverImage} onChange={e => setForm(p => ({ ...p, coverImage: e.target.value }))}
                  className={inputClass} placeholder="https://..." />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Total Budget</label>
                  <input type="number" step="0.01" value={form.totalBudget}
                    onChange={e => setForm(p => ({ ...p, totalBudget: e.target.value }))}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Currency</label>
                  <select value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
                    className={inputClass}>
                    {CURRENCY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Home Base Section */}
              <div className="border-t border-ody-border pt-4 mt-2">
                <h4 className="text-sm font-semibold mb-3 text-ody-text-muted">🏠 Home Base</h4>
                <div className="space-y-3">
                  <div>
                    <label className={labelClass}>Name</label>
                    <input value={form.homeBaseName} onChange={e => setForm(p => ({ ...p, homeBaseName: e.target.value }))}
                      className={inputClass} placeholder="e.g. Vicenza Home, Cosmopolitan Hotel" />
                  </div>
                  <div>
                    <label className={labelClass}>Address</label>
                    <input value={form.homeBaseAddress} onChange={e => setForm(p => ({ ...p, homeBaseAddress: e.target.value }))}
                      className={inputClass} placeholder="Full address" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Latitude</label>
                      <input type="number" step="any" value={form.homeBaseLat}
                        onChange={e => setForm(p => ({ ...p, homeBaseLat: e.target.value }))}
                        className={inputClass} placeholder="e.g. 45.5485" />
                    </div>
                    <div>
                      <label className={labelClass}>Longitude</label>
                      <input type="number" step="any" value={form.homeBaseLng}
                        onChange={e => setForm(p => ({ ...p, homeBaseLng: e.target.value }))}
                        className={inputClass} placeholder="e.g. 11.5479" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Local Currency</label>
                    <select value={form.homeBaseCurrency} onChange={e => setForm(p => ({ ...p, homeBaseCurrency: e.target.value }))}
                      className={inputClass}>
                      <option value="">Same as trip currency</option>
                      {CURRENCY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                  className={inputClass}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={!form.name || saving}
                  className="px-4 py-2 rounded-lg bg-ody-accent text-white hover:bg-ody-accent-hover transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-ody-border hover:bg-ody-surface-hover transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
