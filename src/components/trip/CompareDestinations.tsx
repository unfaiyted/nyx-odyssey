import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale, X, ChevronDown, MapPin, Clock, DollarSign,
  Utensils, Landmark, Cloud, CheckCircle, Search, Bookmark,
  Navigation, CalendarPlus,
} from 'lucide-react';
import { getDestinationsForComparison, type ComparisonDestination } from '../../server/fns/destination-compare';
import { addItineraryItem } from '../../server/fns/trip-details';
import type { TripDestination } from '../../types/trips';

interface Props {
  tripId: string;
  destinations: TripDestination[];
  onClose?: () => void;
  isModal?: boolean;
}

const PLACEHOLDER_PHOTOS = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=400&fit=crop',
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Search }> = {
  pending: { label: 'Pending', color: 'text-ody-text-dim', icon: Search },
  researched: { label: 'Researched', color: 'text-ody-info', icon: Search },
  approved: { label: 'Approved', color: 'text-ody-success', icon: CheckCircle },
  booked: { label: 'Booked', color: 'text-ody-warning', icon: Bookmark },
  visited: { label: 'Visited', color: 'text-ody-success', icon: CheckCircle },
};

function haversineDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function getBestIndex(values: (number | null)[], mode: 'min' | 'max' = 'min'): number {
  let bestIdx = -1;
  let bestVal = mode === 'min' ? Infinity : -Infinity;
  values.forEach((v, i) => {
    if (v === null) return;
    if (mode === 'min' ? v < bestVal : v > bestVal) {
      bestVal = v;
      bestIdx = i;
    }
  });
  return bestIdx;
}

function ComparisonCell({ children, isBest = false, isWorst = false }: {
  children: React.ReactNode;
  isBest?: boolean;
  isWorst?: boolean;
}) {
  return (
    <div className={`px-4 py-3 rounded-lg transition-colors ${
      isBest ? 'bg-emerald-500/10 border border-emerald-500/30'
        : isWorst ? 'bg-rose-500/10 border border-rose-500/30'
          : 'bg-ody-surface border border-ody-border-subtle'
    }`}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, label }: { icon: typeof MapPin; label: string }) {
  return (
    <div className="flex items-center gap-2 py-2 mb-2 border-b border-ody-border-subtle">
      <Icon size={14} className="text-ody-accent" />
      <span className="text-xs font-semibold uppercase tracking-wider text-ody-text-dim">{label}</span>
    </div>
  );
}

export function CompareDestinations({ tripId, destinations, onClose, isModal = false }: Props) {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pickedId, setPickedId] = useState<string | null>(null);

  const { data: comparisonData, isLoading } = useQuery({
    queryKey: ['destination-compare', tripId, selectedIds],
    queryFn: () => getDestinationsForComparison({ data: { tripId, destinationIds: selectedIds } }),
    enabled: selectedIds.length >= 2,
  });

  const pickMutation = useMutation({
    mutationFn: (dest: ComparisonDestination) =>
      addItineraryItem({
        data: {
          tripId,
          title: `Visit ${dest.destination.name}`,
          description: `Day trip to ${dest.destination.name}`,
          date: new Date().toISOString().split('T')[0],
          category: 'sightseeing',
          orderIndex: 0,
        },
      }),
    onSuccess: (_, dest) => {
      setPickedId(dest.destination.id);
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      setTimeout(() => setPickedId(null), 3000);
    },
  });

  const toggleDestination = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const availableDestinations = destinations.filter((d) => !selectedIds.includes(d.id));
  const items = comparisonData || [];

  const sorted = [...destinations].sort((a, b) => a.orderIndex - b.orderIndex);
  const baseDest = sorted[0];

  const costs = items.map((i) => {
    const mid = i.research?.dailyBudgetMid;
    return mid ? parseFloat(mid) : null;
  });
  const distances = items.map((i) => {
    if (i.routeFromBase?.distanceKm) return i.routeFromBase.distanceKm;
    if (i.destination.lat && i.destination.lng && baseDest?.lat && baseDest?.lng) {
      return haversineDistanceKm(baseDest.lat, baseDest.lng, i.destination.lat, i.destination.lng);
    }
    return null;
  });
  const durations = items.map((i) => i.routeFromBase?.durationMinutes ?? null);

  const bestCostIdx = getBestIndex(costs, 'min');
  const worstCostIdx = getBestIndex(costs, 'max');
  const bestDistIdx = getBestIndex(distances, 'min');
  const worstDistIdx = getBestIndex(distances, 'max');

  const gridCols = items.length === 2 ? 'grid-cols-2' : 'grid-cols-3';

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ody-accent/15 flex items-center justify-center">
            <Scale size={20} className="text-ody-accent" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Compare Destinations</h3>
            <p className="text-xs text-ody-text-dim">Select 2-3 destinations to compare side-by-side</p>
          </div>
        </div>
        {isModal && onClose && (
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-ody-surface-hover transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Destination Selector */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {selectedIds.map((id) => {
            const dest = destinations.find((d) => d.id === id);
            if (!dest) return null;
            return (
              <motion.button
                key={id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => toggleDestination(id)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-ody-accent/15 text-ody-accent text-sm font-medium hover:bg-ody-accent/25 transition-colors"
              >
                <MapPin size={12} />
                {dest.name}
                <X size={12} />
              </motion.button>
            );
          })}

          {selectedIds.length < 3 && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-dashed border-ody-border text-sm text-ody-text-dim hover:border-ody-accent hover:text-ody-accent transition-colors"
              >
                Add destination
                <ChevronDown size={12} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full left-0 mt-1 z-50 w-64 max-h-64 overflow-y-auto rounded-xl border border-ody-border bg-ody-surface shadow-xl"
                  >
                    {availableDestinations.length === 0 ? (
                      <div className="p-3 text-sm text-ody-text-dim text-center">No more destinations</div>
                    ) : (
                      availableDestinations.map((dest) => (
                        <button
                          key={dest.id}
                          onClick={() => { toggleDestination(dest.id); setDropdownOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-ody-surface-hover transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={dest.photoUrl || PLACEHOLDER_PHOTOS[0]} alt="" className="w-full h-full object-cover" />
                          </div>
                          <span>{dest.name}</span>
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {selectedIds.length < 2 && (
          <p className="text-sm text-ody-text-dim italic">Select at least 2 destinations to start comparing</p>
        )}
      </div>

      {isLoading && selectedIds.length >= 2 && (
        <div className="text-center py-12 text-ody-text-muted">Loading comparison data...</div>
      )}

      {/* Comparison Grid */}
      {items.length >= 2 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Cover Photos */}
          <div className={`grid gap-4 ${gridCols}`}>
            {items.map((item, idx) => (
              <motion.div
                key={item.destination.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative rounded-xl overflow-hidden border border-ody-border group"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={item.destination.photoUrl || PLACEHOLDER_PHOTOS[idx % PLACEHOLDER_PHOTOS.length]}
                    alt={item.destination.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ody-bg/90 via-transparent to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h4 className="text-lg font-bold text-white drop-shadow-lg">{item.destination.name}</h4>
                  {item.destination.description && (
                    <p className="text-xs text-white/70 line-clamp-1 mt-0.5">{item.destination.description}</p>
                  )}
                </div>
                <AnimatePresence>
                  {pickedId === item.destination.id && (
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg"
                    >
                      <CheckCircle size={16} className="text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Distance */}
          <div>
            <SectionHeader icon={Navigation} label={`Distance from ${baseDest?.name || 'Home Base'}`} />
            <div className={`grid gap-3 ${gridCols}`}>
              {items.map((item, idx) => {
                const dist = distances[idx];
                const dur = durations[idx];
                const canHighlight = items.length > 1 && bestDistIdx !== worstDistIdx;
                return (
                  <ComparisonCell key={item.destination.id} isBest={canHighlight && idx === bestDistIdx} isWorst={canHighlight && idx === worstDistIdx}>
                    <div className="text-xl font-bold">{dist !== null ? `${Math.round(dist)} km` : '—'}</div>
                    <div className="text-xs text-ody-text-dim mt-1">
                      {dur !== null ? (
                        <span className="flex items-center gap-1"><Clock size={10} /> {formatDuration(dur)} drive</span>
                      ) : dist !== null ? (
                        <span className="flex items-center gap-1"><Clock size={10} /> ~{formatDuration(Math.round((dist / 80) * 60))} est.</span>
                      ) : 'No route data'}
                    </div>
                  </ComparisonCell>
                );
              })}
            </div>
          </div>

          {/* Cost */}
          <div>
            <SectionHeader icon={DollarSign} label="Estimated Daily Cost" />
            <div className={`grid gap-3 ${gridCols}`}>
              {items.map((item, idx) => {
                const r = item.research;
                const canHighlight = items.length > 1 && bestCostIdx !== worstCostIdx;
                return (
                  <ComparisonCell key={item.destination.id} isBest={canHighlight && idx === bestCostIdx} isWorst={canHighlight && idx === worstCostIdx}>
                    {r?.dailyBudgetMid ? (
                      <>
                        <div className="text-xl font-bold">
                          €{parseFloat(r.dailyBudgetMid).toFixed(0)}
                          <span className="text-xs font-normal text-ody-text-dim">/day</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-ody-text-dim">
                          {r.dailyBudgetLow && <span className="text-emerald-400">Low: €{parseFloat(r.dailyBudgetLow).toFixed(0)}</span>}
                          {r.dailyBudgetHigh && <span className="text-rose-400">High: €{parseFloat(r.dailyBudgetHigh).toFixed(0)}</span>}
                        </div>
                      </>
                    ) : <div className="text-ody-text-dim">No cost data</div>}
                  </ComparisonCell>
                );
              })}
            </div>
          </div>

          {/* Time Needed */}
          <div>
            <SectionHeader icon={Clock} label="Time Needed" />
            <div className={`grid gap-3 ${gridCols}`}>
              {items.map((item) => {
                const count = item.highlights.length;
                const timeEstimate = count <= 3 ? 'Half day' : count <= 6 ? 'Full day' : 'Overnight';
                return (
                  <ComparisonCell key={item.destination.id}>
                    <div className="text-lg font-bold">{timeEstimate}</div>
                    <div className="text-xs text-ody-text-dim mt-1">{count} attractions/restaurants</div>
                  </ComparisonCell>
                );
              })}
            </div>
          </div>

          {/* Research Status */}
          <div>
            <SectionHeader icon={Search} label="Research Status" />
            <div className={`grid gap-3 ${gridCols}`}>
              {items.map((item) => {
                const status = item.destination.researchStatus || 'pending';
                const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
                const Icon = config.icon;
                return (
                  <ComparisonCell key={item.destination.id}>
                    <div className={`flex items-center gap-2 ${config.color}`}>
                      <Icon size={16} />
                      <span className="font-semibold">{config.label}</span>
                    </div>
                    <div className="text-xs text-ody-text-dim mt-1">{item.research ? 'Has research data' : 'No research yet'}</div>
                  </ComparisonCell>
                );
              })}
            </div>
          </div>

          {/* Top 3 Attractions */}
          <div>
            <SectionHeader icon={Landmark} label="Top Attractions" />
            <div className={`grid gap-3 ${gridCols}`}>
              {items.map((item) => {
                const attractions = item.highlights
                  .filter((h) => h.category === 'attraction' || h.category === 'nature' || h.category === 'cultural')
                  .slice(0, 3);
                return (
                  <ComparisonCell key={item.destination.id}>
                    {attractions.length > 0 ? (
                      <ul className="space-y-2">
                        {attractions.map((a, i) => (
                          <li key={a.id} className="flex items-start gap-2">
                            <span className="text-xs font-bold text-ody-accent mt-0.5">{i + 1}.</span>
                            <div>
                              <div className="text-sm font-medium">{a.title}</div>
                              {a.duration && <span className="text-xs text-ody-text-dim">{a.duration}</span>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : <div className="text-sm text-ody-text-dim italic">No attractions listed</div>}
                  </ComparisonCell>
                );
              })}
            </div>
          </div>

          {/* Top 3 Restaurants */}
          <div>
            <SectionHeader icon={Utensils} label="Top Restaurants" />
            <div className={`grid gap-3 ${gridCols}`}>
              {items.map((item) => {
                const restaurants = item.highlights.filter((h) => h.category === 'food').slice(0, 3);
                return (
                  <ComparisonCell key={item.destination.id}>
                    {restaurants.length > 0 ? (
                      <ul className="space-y-2">
                        {restaurants.map((r, i) => (
                          <li key={r.id} className="flex items-start gap-2">
                            <span className="text-xs font-bold text-ody-accent mt-0.5">{i + 1}.</span>
                            <div>
                              <div className="text-sm font-medium">{r.title}</div>
                              {r.priceLevel && <span className="text-xs text-ody-text-dim">{'€'.repeat(r.priceLevel)}</span>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : <div className="text-sm text-ody-text-dim italic">No restaurants listed</div>}
                  </ComparisonCell>
                );
              })}
            </div>
          </div>

          {/* Weather */}
          <div>
            <SectionHeader icon={Cloud} label="Weather Considerations" />
            <div className={`grid gap-3 ${gridCols}`}>
              {items.map((item) => {
                const currentMonth = new Date().getMonth() + 1;
                const monthWeather = item.weather.find((w) => w.month === currentMonth);
                return (
                  <ComparisonCell key={item.destination.id}>
                    {monthWeather ? (
                      <div className="space-y-1">
                        <div className="text-lg font-bold">
                          {monthWeather.avgHighC !== null ? `${Math.round(monthWeather.avgHighC)}°C` : '—'}
                          {monthWeather.avgLowC !== null && (
                            <span className="text-sm font-normal text-ody-text-dim"> / {Math.round(monthWeather.avgLowC)}°C</span>
                          )}
                        </div>
                        {monthWeather.rainyDays !== null && <div className="text-xs text-ody-text-dim">{monthWeather.rainyDays} rainy days this month</div>}
                        {monthWeather.sunshineHours !== null && <div className="text-xs text-ody-text-dim">{monthWeather.sunshineHours}h sunshine/day</div>}
                      </div>
                    ) : item.research?.weatherNotes ? (
                      <div className="text-sm text-ody-text-dim">{item.research.weatherNotes}</div>
                    ) : <div className="text-sm text-ody-text-dim italic">No weather data</div>}
                  </ComparisonCell>
                );
              })}
            </div>
          </div>

          {/* Pick this one */}
          <div>
            <SectionHeader icon={CalendarPlus} label="Make Your Choice" />
            <div className={`grid gap-3 ${gridCols}`}>
              {items.map((item) => (
                <div key={item.destination.id} className="flex justify-center">
                  <button
                    onClick={() => pickMutation.mutate(item)}
                    disabled={pickMutation.isPending || pickedId === item.destination.id}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                      pickedId === item.destination.id
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'bg-ody-accent/15 text-ody-accent hover:bg-ody-accent hover:text-white hover:shadow-lg hover:shadow-ody-accent/25'
                    }`}
                  >
                    {pickedId === item.destination.id ? (
                      <><CheckCircle size={18} /> Added to Itinerary!</>
                    ) : (
                      <><CalendarPlus size={18} /> Pick {item.destination.name}</>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl bg-ody-bg rounded-2xl border border-ody-border p-6 shadow-2xl mb-12"
        >
          {content}
        </motion.div>
      </motion.div>
    );
  }

  return content;
}
