import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addRentalCar, deleteRentalCar, updateRentalCar } from '../../server/fns/trip-details';
import { motion } from 'framer-motion';
import { Plus, Car, Trash2, ExternalLink, MapPin, Calendar, Shield, Fuel, Gauge, Star, ChevronDown, ChevronUp } from 'lucide-react';
import type { RentalCar } from '../../types/trips';

interface Props {
  tripId: string;
  items: RentalCar[];
}

const statusColors: Record<string, string> = {
  researched: 'bg-ody-info/20 text-ody-info',
  shortlisted: 'bg-ody-warning/20 text-ody-warning',
  booked: 'bg-ody-success/20 text-ody-success',
  cancelled: 'bg-ody-danger/20 text-ody-danger',
};

const vehicleIcons: Record<string, string> = {
  compact: '🚗',
  sedan: '🚙',
  suv: '🚐',
  minivan: '🚐',
  luxury: '✨',
  convertible: '🏎️',
  other: '🚗',
};

const defaultForm = {
  company: '',
  vehicleType: 'compact',
  vehicleName: '',
  status: 'researched',
  pickupLocation: '',
  dropoffLocation: '',
  pickupDate: '',
  pickupTime: '',
  dropoffDate: '',
  dropoffTime: '',
  dailyRate: '',
  totalCost: '',
  currency: 'EUR',
  confirmationCode: '',
  bookingUrl: '',
  insuranceIncluded: false,
  mileagePolicy: 'unlimited',
  fuelPolicy: 'full-to-full',
  transmission: 'manual',
  notes: '',
  rating: '',
};

function formatDate(date: string | null): string {
  if (!date) return '—';
  const d = new Date(date + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(time: string | null): string {
  if (!time) return '';
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

function daysBetween(start: string | null, end: string | null): number | null {
  if (!start || !end) return null;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function RentalCarCard({ car, index, onDelete, onUpdate }: {
  car: RentalCar;
  index: number;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<RentalCar>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const days = daysBetween(car.pickupDate, car.dropoffDate);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass-card p-0 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-ody-accent/10 border-b border-ody-border">
        <div className="flex items-center gap-2">
          <span className="text-lg">{vehicleIcons[car.vehicleType] || '🚗'}</span>
          <span className="font-semibold text-sm text-ody-accent">{car.company}</span>
          {car.vehicleName && (
            <span className="text-xs text-ody-text-muted">• {car.vehicleName}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[car.status] || statusColors.researched}`}>
            {car.status}
          </span>
          {car.bookingUrl && (
            <a href={car.bookingUrl} target="_blank" rel="noopener noreferrer"
              className="text-ody-text-dim hover:text-ody-accent transition-colors p-1">
              <ExternalLink size={14} />
            </a>
          )}
          <button onClick={() => onDelete(car.id)}
            className="text-ody-text-dim hover:text-ody-danger transition-colors p-1">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Main info */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Pickup */}
          <div>
            <div className="text-xs text-ody-text-dim uppercase tracking-wide mb-1">Pickup</div>
            <div className="flex items-center gap-1 text-sm">
              <MapPin size={12} className="text-ody-accent shrink-0" />
              <span>{car.pickupLocation || 'TBD'}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-ody-text-muted mt-1">
              <Calendar size={10} />
              <span>{formatDate(car.pickupDate)} {formatTime(car.pickupTime)}</span>
            </div>
          </div>

          {/* Dropoff */}
          <div>
            <div className="text-xs text-ody-text-dim uppercase tracking-wide mb-1">Drop-off</div>
            <div className="flex items-center gap-1 text-sm">
              <MapPin size={12} className="text-ody-accent shrink-0" />
              <span>{car.dropoffLocation || car.pickupLocation || 'TBD'}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-ody-text-muted mt-1">
              <Calendar size={10} />
              <span>{formatDate(car.dropoffDate)} {formatTime(car.dropoffTime)}</span>
            </div>
          </div>
        </div>

        {/* Cost summary */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-ody-border">
          <div className="flex items-center gap-4 text-sm">
            {car.dailyRate && (
              <span className="text-ody-text-muted">
                {car.currency} {car.dailyRate}/day
              </span>
            )}
            {days !== null && (
              <span className="text-ody-text-dim text-xs">{days} day{days !== 1 ? 's' : ''}</span>
            )}
            <span className="text-xs px-2 py-0.5 rounded bg-ody-surface text-ody-text-muted capitalize">
              {car.transmission}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {car.totalCost && (
              <span className="font-bold text-ody-accent">
                {car.currency} {car.totalCost}
              </span>
            )}
            <button onClick={() => setExpanded(!expanded)}
              className="text-ody-text-dim hover:text-ody-text transition-colors p-1">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mt-3 pt-3 border-t border-ody-border space-y-2"
          >
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Shield size={12} className={car.insuranceIncluded ? 'text-ody-success' : 'text-ody-text-dim'} />
                <span>{car.insuranceIncluded ? 'Insurance included' : 'No insurance'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Gauge size={12} className="text-ody-text-dim" />
                <span className="capitalize">{car.mileagePolicy || 'Unknown'} mileage</span>
              </div>
              <div className="flex items-center gap-1">
                <Fuel size={12} className="text-ody-text-dim" />
                <span className="capitalize">{car.fuelPolicy?.replace('-', ' ') || 'Unknown'}</span>
              </div>
            </div>
            {car.confirmationCode && (
              <div className="text-xs">
                <span className="text-ody-text-dim">Confirmation: </span>
                <span className="font-mono bg-ody-bg px-2 py-0.5 rounded">{car.confirmationCode}</span>
              </div>
            )}
            {car.rating && (
              <div className="flex items-center gap-1 text-xs">
                <Star size={12} className="text-yellow-500" />
                <span>{car.rating}/5</span>
              </div>
            )}
            {car.notes && (
              <p className="text-xs text-ody-text-muted italic">{car.notes}</p>
            )}
            {/* Quick status change buttons */}
            <div className="flex gap-2 pt-1">
              {(['researched', 'shortlisted', 'booked', 'cancelled'] as const).map(s => (
                <button key={s} onClick={() => onUpdate(car.id, { status: s })}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    car.status === s
                      ? statusColors[s]
                      : 'bg-ody-surface text-ody-text-dim hover:text-ody-text'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export function RentalCarsTab({ tripId, items }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const qc = useQueryClient();

  const invalidate = () => qc.invalidateQueries({ queryKey: ['trip', tripId] });

  const createMut = useMutation({
    mutationFn: (data: typeof form) =>
      addRentalCar({ data: {
        tripId, ...data,
        rating: data.rating ? parseFloat(data.rating) : undefined,
        dailyRate: data.dailyRate || undefined,
        totalCost: data.totalCost || undefined,
      } }),
    onSuccess: () => { invalidate(); setForm(defaultForm); setShowForm(false); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteRentalCar({ data: { tripId, id } }),
    onSuccess: invalidate,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<RentalCar>) =>
      updateRentalCar({ data: { tripId, id, ...data } }),
    onSuccess: invalidate,
  });

  // Group by status
  const groups = {
    booked: items.filter(i => i.status === 'booked'),
    shortlisted: items.filter(i => i.status === 'shortlisted'),
    researched: items.filter(i => i.status === 'researched'),
    cancelled: items.filter(i => i.status === 'cancelled'),
  };

  const totalBooked = groups.booked.reduce((sum, c) => sum + parseFloat(c.totalCost || '0'), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Car size={20} className="text-ody-accent" /> Rental Cars
          </h3>
          <p className="text-sm text-ody-text-muted mt-1">
            {items.length} option{items.length !== 1 ? 's' : ''} researched
            {totalBooked > 0 && ` · €${totalBooked.toFixed(2)} booked`}
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Rental Car
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={e => { e.preventDefault(); createMut.mutate(form); }}
          className="glass-card p-4 space-y-4"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <input placeholder="Company *" required value={form.company}
              onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
              className="input-field" />
            <select value={form.vehicleType}
              onChange={e => setForm(f => ({ ...f, vehicleType: e.target.value }))}
              className="input-field">
              <option value="compact">Compact</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="minivan">Minivan</option>
              <option value="luxury">Luxury</option>
              <option value="convertible">Convertible</option>
              <option value="other">Other</option>
            </select>
            <input placeholder="Vehicle name (e.g. VW Golf)" value={form.vehicleName}
              onChange={e => setForm(f => ({ ...f, vehicleName: e.target.value }))}
              className="input-field" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input placeholder="Pickup location" value={form.pickupLocation}
              onChange={e => setForm(f => ({ ...f, pickupLocation: e.target.value }))}
              className="input-field" />
            <input type="date" value={form.pickupDate}
              onChange={e => setForm(f => ({ ...f, pickupDate: e.target.value }))}
              className="input-field" />
            <input placeholder="Drop-off location" value={form.dropoffLocation}
              onChange={e => setForm(f => ({ ...f, dropoffLocation: e.target.value }))}
              className="input-field" />
            <input type="date" value={form.dropoffDate}
              onChange={e => setForm(f => ({ ...f, dropoffDate: e.target.value }))}
              className="input-field" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input placeholder="Daily rate" type="number" step="0.01" value={form.dailyRate}
              onChange={e => setForm(f => ({ ...f, dailyRate: e.target.value }))}
              className="input-field" />
            <input placeholder="Total cost" type="number" step="0.01" value={form.totalCost}
              onChange={e => setForm(f => ({ ...f, totalCost: e.target.value }))}
              className="input-field" />
            <select value={form.transmission}
              onChange={e => setForm(f => ({ ...f, transmission: e.target.value }))}
              className="input-field">
              <option value="manual">Manual</option>
              <option value="automatic">Automatic</option>
            </select>
            <select value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="input-field">
              <option value="researched">Researched</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="booked">Booked</option>
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select value={form.mileagePolicy}
              onChange={e => setForm(f => ({ ...f, mileagePolicy: e.target.value }))}
              className="input-field">
              <option value="unlimited">Unlimited mileage</option>
              <option value="limited">Limited mileage</option>
            </select>
            <select value={form.fuelPolicy}
              onChange={e => setForm(f => ({ ...f, fuelPolicy: e.target.value }))}
              className="input-field">
              <option value="full-to-full">Full-to-Full</option>
              <option value="prepaid">Prepaid</option>
            </select>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.insuranceIncluded}
                onChange={e => setForm(f => ({ ...f, insuranceIncluded: e.target.checked }))}
                className="accent-ody-accent" />
              Insurance included
            </label>
            <input placeholder="Booking URL" value={form.bookingUrl}
              onChange={e => setForm(f => ({ ...f, bookingUrl: e.target.value }))}
              className="input-field" />
          </div>

          <textarea placeholder="Notes (tips, comparison notes, etc.)" value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            className="input-field w-full" rows={2} />

          <div className="flex gap-2">
            <button type="submit" disabled={createMut.isPending}
              className="btn-primary text-sm">
              {createMut.isPending ? 'Adding...' : 'Add Rental Car'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="btn-secondary text-sm">Cancel</button>
          </div>
        </motion.form>
      )}

      {/* Grouped listings */}
      {items.length === 0 ? (
        <div className="text-center py-12 text-ody-text-dim">
          <Car size={48} className="mx-auto mb-3 opacity-30" />
          <p>No rental car options yet</p>
          <p className="text-sm mt-1">Start researching by adding your first option above</p>
        </div>
      ) : (
        Object.entries(groups).map(([status, cars]) =>
          cars.length > 0 && (
            <div key={status}>
              <h4 className="text-sm font-medium text-ody-text-muted uppercase tracking-wide mb-3 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  status === 'booked' ? 'bg-ody-success' :
                  status === 'shortlisted' ? 'bg-ody-warning' :
                  status === 'cancelled' ? 'bg-ody-danger' : 'bg-ody-info'
                }`} />
                {status} ({cars.length})
              </h4>
              <div className="space-y-3">
                {cars.map((car, i) => (
                  <RentalCarCard
                    key={car.id}
                    car={car}
                    index={i}
                    onDelete={id => deleteMut.mutate(id)}
                    onUpdate={(id, data) => updateMut.mutate({ id, ...data })}
                  />
                ))}
              </div>
            </div>
          )
        )
      )}
    </div>
  );
}
