import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hotel, Star, MapPin, DollarSign, X, BarChart3, Check, ArrowRight } from 'lucide-react';

interface Accommodation {
  id: string;
  name: string;
  type: string | null;
  status: string | null;
  address: string | null;
  checkIn: string | null;
  checkOut: string | null;
  costPerNight: string | null;
  totalCost: string | null;
  currency: string | null;
  rating: number | null;
  booked: boolean | null;
  imageUrl: string | null;
  lat: number | null;
  lng: number | null;
}

interface Highlight {
  id: string;
  title: string;
  category: string | null;
  lat: number | null;
  lng: number | null;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getNights(checkIn: string | null, checkOut: string | null): number | null {
  if (!checkIn || !checkOut) return null;
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function bestValue(values: (number | null)[], lower = true): number | null {
  const nums = values.filter((v): v is number => v !== null);
  if (!nums.length) return null;
  return lower ? Math.min(...nums) : Math.max(...nums);
}

export function AccommodationCompare({
  accommodations,
  highlights,
  onClose,
}: {
  accommodations: Accommodation[];
  highlights: Highlight[];
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const maxSelect = 3;

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < maxSelect ? [...prev, id] : prev
    );
  };

  const compared = useMemo(
    () => accommodations.filter((a) => selected.includes(a.id)),
    [accommodations, selected],
  );

  // Highlights with coordinates for distance calc
  const geoHighlights = useMemo(
    () => highlights.filter((h) => h.lat != null && h.lng != null),
    [highlights],
  );

  const avgDistances = useMemo(() => {
    if (!geoHighlights.length) return new Map<string, number | null>();
    const map = new Map<string, number | null>();
    for (const acc of compared) {
      if (acc.lat == null || acc.lng == null) {
        map.set(acc.id, null);
        continue;
      }
      const dists = geoHighlights.map((h) => haversineKm(acc.lat!, acc.lng!, h.lat!, h.lng!));
      map.set(acc.id, Math.round((dists.reduce((a, b) => a + b, 0) / dists.length) * 10) / 10);
    }
    return map;
  }, [compared, geoHighlights]);

  const showComparison = compared.length >= 2;

  // Find best values for highlighting
  const bestPricePerNight = bestValue(compared.map((a) => (a.costPerNight ? parseFloat(a.costPerNight) : null)));
  const bestTotal = bestValue(compared.map((a) => (a.totalCost ? parseFloat(a.totalCost) : null)));
  const bestRating = bestValue(compared.map((a) => a.rating), false);
  const bestDist = bestValue([...avgDistances.values()]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="glass-card p-6 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 size={20} className="text-ody-accent" /> Compare Accommodations
        </h2>
        <button onClick={onClose} className="p-1 rounded hover:bg-ody-surface text-ody-text-dim">
          <X size={18} />
        </button>
      </div>

      {/* Selection */}
      <div className="space-y-2">
        <p className="text-sm text-ody-text-dim">
          Select {maxSelect} accommodations to compare ({selected.length}/{maxSelect})
        </p>
        <div className="flex flex-wrap gap-2">
          {accommodations.map((acc) => {
            const isSelected = selected.includes(acc.id);
            return (
              <button
                key={acc.id}
                onClick={() => toggle(acc.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-all ${
                  isSelected
                    ? 'border-ody-accent bg-ody-accent/10 text-ody-accent'
                    : 'border-ody-border-subtle bg-ody-bg hover:border-ody-border text-ody-text-secondary'
                } ${!isSelected && selected.length >= maxSelect ? 'opacity-40 cursor-not-allowed' : ''}`}
                disabled={!isSelected && selected.length >= maxSelect}
              >
                {isSelected && <Check size={14} />}
                <Hotel size={14} />
                {acc.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <AnimatePresence>
        {showComparison && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-x-auto"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ody-border-subtle">
                  <th className="text-left py-3 px-2 text-ody-text-dim font-medium w-36"></th>
                  {compared.map((acc) => (
                    <th key={acc.id} className="text-center py-3 px-3 min-w-[160px]">
                      <div className="space-y-1">
                        {acc.imageUrl && (
                          <img
                            src={acc.imageUrl}
                            alt={acc.name}
                            className="w-full h-20 object-cover rounded-lg mx-auto"
                          />
                        )}
                        <div className="font-semibold text-ody-text-primary">{acc.name}</div>
                        <div className="text-xs text-ody-text-dim capitalize">{acc.type}</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ody-border-subtle/50">
                {/* Price per Night */}
                <CompareRow label="Price / Night" icon={<DollarSign size={14} />}>
                  {compared.map((acc) => {
                    const val = acc.costPerNight ? parseFloat(acc.costPerNight) : null;
                    const isBest = val !== null && val === bestPricePerNight;
                    return (
                      <td key={acc.id} className="text-center py-3 px-3">
                        <span className={isBest ? 'text-ody-success font-semibold' : ''}>
                          {val !== null ? `${acc.currency ?? '€'}${val.toFixed(0)}` : '—'}
                        </span>
                        {isBest && <span className="ml-1 text-[10px] text-ody-success">Best</span>}
                      </td>
                    );
                  })}
                </CompareRow>

                {/* Total Cost */}
                <CompareRow label="Total Cost" icon={<DollarSign size={14} />}>
                  {compared.map((acc) => {
                    const val = acc.totalCost ? parseFloat(acc.totalCost) : null;
                    const isBest = val !== null && val === bestTotal;
                    return (
                      <td key={acc.id} className="text-center py-3 px-3">
                        <span className={isBest ? 'text-ody-success font-semibold' : ''}>
                          {val !== null ? `${acc.currency ?? '€'}${val.toFixed(0)}` : '—'}
                        </span>
                        {isBest && <span className="ml-1 text-[10px] text-ody-success">Best</span>}
                      </td>
                    );
                  })}
                </CompareRow>

                {/* Nights */}
                <CompareRow label="Nights" icon={<Hotel size={14} />}>
                  {compared.map((acc) => {
                    const nights = getNights(acc.checkIn, acc.checkOut);
                    return (
                      <td key={acc.id} className="text-center py-3 px-3">
                        {nights !== null ? `${nights} nights` : '—'}
                      </td>
                    );
                  })}
                </CompareRow>

                {/* Rating */}
                <CompareRow label="Rating" icon={<Star size={14} />}>
                  {compared.map((acc) => {
                    const isBest = acc.rating !== null && acc.rating === bestRating;
                    return (
                      <td key={acc.id} className="text-center py-3 px-3">
                        {acc.rating !== null ? (
                          <span className={`inline-flex items-center gap-1 ${isBest ? 'text-ody-warning font-semibold' : ''}`}>
                            <Star size={12} className="fill-ody-warning text-ody-warning" />
                            {acc.rating.toFixed(1)}
                            {isBest && <span className="text-[10px] text-ody-warning">Best</span>}
                          </span>
                        ) : '—'}
                      </td>
                    );
                  })}
                </CompareRow>

                {/* Dates */}
                <CompareRow label="Dates" icon={<ArrowRight size={14} />}>
                  {compared.map((acc) => (
                    <td key={acc.id} className="text-center py-3 px-3 text-xs">
                      {acc.checkIn && acc.checkOut
                        ? `${acc.checkIn} → ${acc.checkOut}`
                        : '—'}
                    </td>
                  ))}
                </CompareRow>

                {/* Status */}
                <CompareRow label="Status" icon={<Check size={14} />}>
                  {compared.map((acc) => (
                    <td key={acc.id} className="text-center py-3 px-3">
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                          acc.booked
                            ? 'bg-ody-success/20 text-ody-success'
                            : 'bg-ody-info/20 text-ody-info'
                        }`}
                      >
                        {acc.status ?? 'unknown'}
                      </span>
                    </td>
                  ))}
                </CompareRow>

                {/* Distance from Highlights */}
                {geoHighlights.length > 0 && (
                  <CompareRow label="Avg Distance to Highlights" icon={<MapPin size={14} />}>
                    {compared.map((acc) => {
                      const dist = avgDistances.get(acc.id);
                      const isBest = dist !== null && dist !== undefined && dist === bestDist;
                      return (
                        <td key={acc.id} className="text-center py-3 px-3">
                          {dist !== null && dist !== undefined ? (
                            <span className={isBest ? 'text-ody-success font-semibold' : ''}>
                              {dist.toFixed(1)} km
                              {isBest && (
                                <span className="ml-1 text-[10px] text-ody-success">Closest</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-ody-text-dim text-xs">No coords</span>
                          )}
                        </td>
                      );
                    })}
                  </CompareRow>
                )}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {!showComparison && selected.length > 0 && (
        <p className="text-sm text-ody-text-dim text-center py-4">
          Select at least one more accommodation to compare
        </p>
      )}
    </motion.div>
  );
}

function CompareRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <tr className="hover:bg-ody-surface/30 transition-colors">
      <td className="py-3 px-2 text-ody-text-dim font-medium">
        <span className="flex items-center gap-1.5">
          {icon}
          {label}
        </span>
      </td>
      {children}
    </tr>
  );
}
