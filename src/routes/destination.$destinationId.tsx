import { createFileRoute, Link, useSearch } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getDestinationDetail, calculateTransportFromHome } from '../server/destination-detail';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  ArrowLeft, MapPin, Calendar, Globe, Thermometer, DollarSign,
  Shield, Utensils, Camera, Clock, Star, ExternalLink,
  Sun, CloudRain, Info, Lightbulb, Plane, Languages,
  Mountain, Users, ChevronDown, ChevronUp, Navigation,
  Hotel, ShoppingBag, TreePine, Music, Landmark, Eye, CalendarPlus,
  Wand2, LayoutGrid, List, BarChart3
} from 'lucide-react';
import { z } from 'zod';
import { AddToItineraryModal } from '../components/destination/AddToItineraryModal';
import { AccommodationCompare } from '../components/destination/AccommodationCompare';
import { AddEventToItineraryModal } from '../components/destination/AddEventToItineraryModal';
import { EventsSection } from '../components/destination/EventsSection';
import { TransportMap } from '../components/destination/TransportMap';
import { TransportModeCards } from '../components/destination/TransportModeCards';
import { ImagePickerModal } from '../components/ImagePickerModal';
import { findDestinationImages, updateDestinationImage } from '../server/destination-image';
import type { CandidateImage } from '../server/destination-image';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend, Area, AreaChart, ReferenceArea } from 'recharts';

// Search params schema for fromTab
const searchSchema = z.object({
  fromTab: z.string().optional().catch(undefined),
});

export const Route = createFileRoute('/destination/$destinationId')({
  component: DestinationDetailPage,
  validateSearch: searchSchema,
});

const HIGHLIGHT_CATEGORIES: Record<string, { label: string; icon: typeof Camera; color: string }> = {
  attraction: { label: 'Attractions', icon: Camera, color: 'text-ody-accent' },
  food: { label: 'Food & Drink', icon: Utensils, color: 'text-orange-400' },
  activity: { label: 'Activities', icon: Mountain, color: 'text-green-400' },
  nightlife: { label: 'Nightlife', icon: Music, color: 'text-purple-400' },
  shopping: { label: 'Shopping', icon: ShoppingBag, color: 'text-pink-400' },
  nature: { label: 'Nature', icon: TreePine, color: 'text-emerald-400' },
  cultural: { label: 'Cultural', icon: Landmark, color: 'text-amber-400' },
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Returns month abbreviations that overlap with the trip date range */
function getTripMonths(arrivalDate?: string | null, departureDate?: string | null): Set<string> {
  if (!arrivalDate) return new Set();
  const start = new Date(arrivalDate);
  const end = departureDate ? new Date(departureDate) : start;
  if (isNaN(start.getTime())) return new Set();
  const months = new Set<string>();
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cur <= endMonth) {
    months.add(MONTH_NAMES[cur.getMonth()]);
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
}

/** Build contiguous ranges of trip months for ReferenceArea highlights */
function getTripMonthRanges(tripMonths: Set<string>): Array<{ x1: string; x2: string }> {
  if (tripMonths.size === 0) return [];
  const ranges: Array<{ x1: string; x2: string }> = [];
  let rangeStart: string | null = null;
  let rangeLast: string | null = null;
  for (const month of MONTH_NAMES) {
    if (tripMonths.has(month)) {
      if (!rangeStart) rangeStart = month;
      rangeLast = month;
    } else {
      if (rangeStart && rangeLast) {
        ranges.push({ x1: rangeStart, x2: rangeLast });
      }
      rangeStart = null;
      rangeLast = null;
    }
  }
  if (rangeStart && rangeLast) {
    ranges.push({ x1: rangeStart, x2: rangeLast });
  }
  return ranges;
}

// Map tab IDs to display names
const TAB_NAMES: Record<string, string> = {
  itinerary: 'Itinerary',
  destinations: 'Destinations',
  research: 'Research Board',
  accommodations: 'Accommodations',
  budget: 'Budget',
  packing: 'Packing List',
  flights: 'Flights',
  'rental-cars': 'Rental Cars',
  routes: 'Driving Routes',
  schedule: 'Schedule',
};

function SafetyStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Shield
          key={i}
          size={16}
          className={i <= rating ? 'text-ody-success fill-ody-success/30' : 'text-ody-text-dim'}
        />
      ))}
    </div>
  );
}

function PriceLevel({ level }: { level: number }) {
  return (
    <span className="text-xs font-medium">
      {[1, 2, 3, 4].map(i => (
        <span key={i} className={i <= level ? 'text-ody-warning' : 'text-ody-text-dim'}>$</span>
      ))}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sublabel, className = '' }: {
  icon: typeof Globe; label: string; value: string; sublabel?: string; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-4 space-y-1 ${className}`}
    >
      <div className="flex items-center gap-2 text-ody-text-dim text-xs">
        <Icon size={14} />
        {label}
      </div>
      <div className="text-lg font-semibold">{value}</div>
      {sublabel && <div className="text-xs text-ody-text-muted">{sublabel}</div>}
    </motion.div>
  );
}

function DestinationDetailPage() {
  const { destinationId } = Route.useParams();
  const search = useSearch({ from: Route.fullPath });
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [activeHighlightCategory, setActiveHighlightCategory] = useState<string | null>(null);
  const [highlightView, setHighlightView] = useState<'grid' | 'list'>('grid');
  const [itineraryHighlight, setItineraryHighlight] = useState<any>(null);
  const [isCalculatingTransport, setIsCalculatingTransport] = useState(false);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [candidateImages, setCandidateImages] = useState<CandidateImage[]>([]);
  const [imageSearchLoading, setImageSearchLoading] = useState(false);
  const [imageToast, setImageToast] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [itineraryEvent, setItineraryEvent] = useState<any>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['destination-detail', destinationId],
    queryFn: () => getDestinationDetail({ data: { destinationId } }),
  });

  const handleCalculateTransport = async () => {
    if (!data?.destination?.lat || !data?.destination?.lng) return;
    
    setIsCalculatingTransport(true);
    try {
      await calculateTransportFromHome({
        data: {
          destinationId,
          destinationLat: data.destination.lat,
          destinationLng: data.destination.lng,
        },
      });
      await refetch();
    } catch (e) {
      console.error('Failed to calculate transport:', e);
    } finally {
      setIsCalculatingTransport(false);
    }
  };

  const handleFindImage = async () => {
    setImagePickerOpen(true);
    setImageSearchLoading(true);
    setCandidateImages([]);
    try {
      const results = await findDestinationImages({
        data: {
          destinationName: data?.destination?.name || '',
          country: data?.research?.country,
          websiteUrl: data?.destination?.websiteUrl || undefined,
        },
      });
      setCandidateImages(results);
    } catch (err) {
      console.error('Failed to find images:', err);
    } finally {
      setImageSearchLoading(false);
    }
  };

  const handleSelectImage = async (imageUrl: string) => {
    try {
      await updateDestinationImage({
        data: { destinationId, imageUrl },
      });
      setImageToast('Image updated successfully!');
      setTimeout(() => setImageToast(null), 3000);
      await refetch();
    } catch (err) {
      console.error('Failed to update image:', err);
      setImageToast('Failed to update image');
      setTimeout(() => setImageToast(null), 3000);
    }
  };

  // We need trip dates for the itinerary modal - derive from destination
  const tripId = data?.destination?.tripId;
  const tripStartDate = data?.destination?.arrivalDate;
  const tripEndDate = data?.destination?.departureDate;

  // Get the tab we came from (default to 'destinations' if not specified)
  const fromTab = search.fromTab || 'destinations';
  const backTabName = TAB_NAMES[fromTab] || 'Destinations';

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-ody-surface rounded-xl" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-ody-surface rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-center py-12 text-ody-text-muted">Destination not found</div>;

  const { destination, research, highlights, weather, accommodations, events } = data;
  const tips: string[] = research?.travelTips ? JSON.parse(research.travelTips) : [];

  const tripMonths = getTripMonths(destination.arrivalDate, destination.departureDate);
  const tripMonthRanges = getTripMonthRanges(tripMonths);

  const weatherData = weather.map(w => ({
    month: MONTH_NAMES[w.month - 1],
    high: w.avgHighC ? Math.round(w.avgHighC * 9 / 5 + 32) : null,
    low: w.avgLowC ? Math.round(w.avgLowC * 9 / 5 + 32) : null,
    rain: w.rainyDays,
    sun: w.sunshineHours,
  }));

  const highlightsByCategory = highlights.reduce((acc, h) => {
    const cat = h.category || 'attraction';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(h);
    return acc;
  }, {} as Record<string, typeof highlights>);

  const filteredHighlights = activeHighlightCategory
    ? highlights.filter(h => (h.category || 'attraction') === activeHighlightCategory)
    : highlights;

  const activeCats = Object.keys(highlightsByCategory);

  const photoUrl = destination.photoUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=600&fit=crop';

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Hero */}
      <div className="relative h-72 rounded-2xl overflow-hidden">
        <img src={photoUrl} alt={destination.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ody-bg via-ody-bg/40 to-transparent" />

        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          <Link
            to="/trips/$tripId"
            params={{ tripId: destination.tripId }}
            search={{ tab: fromTab }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/90 text-sm hover:bg-black/60 transition-colors"
          >
            <ArrowLeft size={16} /> Back to {backTabName}
          </Link>
          <button
            onClick={handleFindImage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/90 text-sm hover:bg-black/60 transition-colors"
          >
            <Wand2 size={16} /> Find Image
          </button>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">{destination.name}</h1>
              {research?.region && research?.country && (
                <p className="text-white/70 mt-1 flex items-center gap-1">
                  <MapPin size={14} /> {research.region}, {research.country}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {destination.arrivalDate && (
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/90 text-sm">
                  <Calendar size={14} />
                  {destination.arrivalDate}
                  {destination.departureDate && ` → ${destination.departureDate}`}
                </span>
              )}
              {destination.status && (
                <span className={`px-3 py-1.5 rounded-lg text-sm backdrop-blur-sm ${
                  destination.status === 'visited' ? 'bg-ody-success/30 text-ody-success' :
                  destination.status === 'booked' ? 'bg-ody-warning/30 text-ody-warning' :
                  'bg-ody-info/30 text-ody-info'
                }`}>
                  {destination.status}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {research?.summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <p className="text-ody-text-muted leading-relaxed">{research.summary}</p>
        </motion.div>
      )}

      {/* Quick Stats Grid */}
      {research && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {research.language && (
            <StatCard icon={Languages} label="Language" value={research.language} />
          )}
          {research.currency && (
            <StatCard icon={DollarSign} label="Currency" value={research.currency} />
          )}
          {research.timezone && (
            <StatCard icon={Clock} label="Timezone" value={research.timezone} />
          )}
          {research.population && (
            <StatCard icon={Users} label="Population" value={research.population} />
          )}
          {research.bestTimeToVisit && (
            <StatCard icon={Sun} label="Best Time" value={research.bestTimeToVisit} />
          )}
          {research.nearestAirport && (
            <StatCard icon={Plane} label="Airport" value={research.nearestAirport} />
          )}
          {research.elevation && (
            <StatCard icon={Mountain} label="Elevation" value={research.elevation} />
          )}
          {research.safetyRating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 space-y-1"
            >
              <div className="flex items-center gap-2 text-ody-text-dim text-xs">
                <Shield size={14} /> Safety
              </div>
              <SafetyStars rating={research.safetyRating} />
              {research.safetyNotes && (
                <div className="text-xs text-ody-text-muted">{research.safetyNotes}</div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* Budget Section */}
      {research && (research.dailyBudgetLow || research.dailyBudgetMid || research.dailyBudgetHigh) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign size={20} className="text-ody-accent" /> Daily Budget Estimates
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {research.dailyBudgetLow && (
              <div className="text-center p-4 rounded-xl bg-ody-success/10 border border-ody-success/20">
                <div className="text-xs text-ody-success uppercase tracking-wide font-medium mb-1">Budget</div>
                <div className="text-2xl font-bold text-ody-success">${research.dailyBudgetLow}</div>
                <div className="text-xs text-ody-text-dim mt-1">per day</div>
              </div>
            )}
            {research.dailyBudgetMid && (
              <div className="text-center p-4 rounded-xl bg-ody-warning/10 border border-ody-warning/20">
                <div className="text-xs text-ody-warning uppercase tracking-wide font-medium mb-1">Mid-Range</div>
                <div className="text-2xl font-bold text-ody-warning">${research.dailyBudgetMid}</div>
                <div className="text-xs text-ody-text-dim mt-1">per day</div>
              </div>
            )}
            {research.dailyBudgetHigh && (
              <div className="text-center p-4 rounded-xl bg-ody-accent/10 border border-ody-accent/20">
                <div className="text-xs text-ody-accent uppercase tracking-wide font-medium mb-1">Luxury</div>
                <div className="text-2xl font-bold text-ody-accent">${research.dailyBudgetHigh}</div>
                <div className="text-xs text-ody-text-dim mt-1">per day</div>
              </div>
            )}
          </div>
          {research.costNotes && (
            <p className="text-sm text-ody-text-muted">{research.costNotes}</p>
          )}
        </motion.div>
      )}

      {/* Weather Chart */}
      {weatherData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Thermometer size={20} className="text-ody-accent" /> Climate
            </h2>
            {tripMonths.size > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-purple-400">
                <span className="inline-block w-3 h-3 rounded-sm bg-purple-400/20 border border-purple-400/40" />
                Your trip months
              </span>
            )}
          </div>
          {research?.weatherNotes && (
            <p className="text-sm text-ody-text-muted">{research.weatherNotes}</p>
          )}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weatherData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-ody-border, #333)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--color-ody-text-dim, #888)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--color-ody-text-dim, #888)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-ody-surface, #1a1a2e)',
                    border: '1px solid var(--color-ody-border, #333)',
                    borderRadius: '8px',
                    color: 'var(--color-ody-text, #e0e0e0)',
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'rain' ? `${value} days` : `${value}°F`,
                    name === 'high' ? 'High' : name === 'low' ? 'Low' : 'Rain Days'
                  ]}
                />
                <Legend />
                {tripMonthRanges.map((range, i) => (
                  <ReferenceArea
                    key={`trip-temp-${i}`}
                    x1={range.x1}
                    x2={range.x2}
                    fill="#a78bfa"
                    fillOpacity={0.12}
                    stroke="#a78bfa"
                    strokeOpacity={0.3}
                    strokeDasharray="4 2"
                    label={{ value: 'Trip', position: 'insideTopRight', fill: '#a78bfa', fontSize: 11 }}
                  />
                ))}
                <Area
                  type="monotone"
                  dataKey="high"
                  name="High °F"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="low"
                  name="Low °F"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Rainfall chart */}
          {weatherData.some(w => w.rain !== null) && (
            <div className="h-40 mt-4">
              <h3 className="text-sm font-medium text-ody-text-muted mb-2 flex items-center gap-1">
                <CloudRain size={14} /> Rainy Days per Month
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weatherData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <XAxis dataKey="month" tick={{ fill: 'var(--color-ody-text-dim, #888)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--color-ody-text-dim, #888)', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-ody-surface, #1a1a2e)',
                      border: '1px solid var(--color-ody-border, #333)',
                      borderRadius: '8px',
                      color: 'var(--color-ody-text, #e0e0e0)',
                    }}
                  />
                  {tripMonthRanges.map((range, i) => (
                    <ReferenceArea
                      key={`trip-rain-${i}`}
                      x1={range.x1}
                      x2={range.x2}
                      fill="#a78bfa"
                      fillOpacity={0.12}
                      stroke="#a78bfa"
                      strokeOpacity={0.3}
                      strokeDasharray="4 2"
                    />
                  ))}
                  <Bar dataKey="rain" name="Rainy Days" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      )}

      {/* Highlights / Things to Do */}
      {highlights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Star size={20} className="text-ody-accent" /> Things to Do & See
            </h2>
            <div className="flex items-center gap-1 bg-ody-surface rounded-lg p-1">
              <button
                onClick={() => setHighlightView('grid')}
                className={`p-1.5 rounded-md transition-colors ${highlightView === 'grid' ? 'bg-ody-accent/20 text-ody-accent' : 'text-ody-text-muted hover:text-ody-text'}`}
                title="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setHighlightView('list')}
                className={`p-1.5 rounded-md transition-colors ${highlightView === 'list' ? 'bg-ody-accent/20 text-ody-accent' : 'text-ody-text-muted hover:text-ody-text'}`}
                title="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveHighlightCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                !activeHighlightCategory ? 'bg-ody-accent/20 text-ody-accent' : 'bg-ody-surface text-ody-text-muted hover:bg-ody-surface-hover'
              }`}
            >
              All ({highlights.length})
            </button>
            {activeCats.map(cat => {
              const config = HIGHLIGHT_CATEGORIES[cat] || HIGHLIGHT_CATEGORIES.attraction;
              const Icon = config.icon;
              const count = highlightsByCategory[cat]?.length || 0;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveHighlightCategory(activeHighlightCategory === cat ? null : cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    activeHighlightCategory === cat ? 'bg-ody-accent/20 text-ody-accent' : 'bg-ody-surface text-ody-text-muted hover:bg-ody-surface-hover'
                  }`}
                >
                  <Icon size={14} /> {config.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Highlights grid/list */}
          {highlightView === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredHighlights.map((h, i) => {
                  const cat = HIGHLIGHT_CATEGORIES[h.category || 'attraction'] || HIGHLIGHT_CATEGORIES.attraction;
                  const CatIcon = cat.icon;
                  return (
                    <motion.div
                      key={h.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card overflow-hidden group hover:border-ody-accent/30 transition-colors"
                    >
                      <Link to="/highlight/$highlightId" params={{ highlightId: h.id }} className="block">
                      {h.imageUrl && (
                        <div className="h-36 overflow-hidden">
                          <img src={h.imageUrl} alt={h.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                        </div>
                      )}
                      <div className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold">{h.title}</h3>
                          <div className="flex items-center gap-2 shrink-0">
                            {h.priceLevel && <PriceLevel level={h.priceLevel} />}
                            {h.rating && (
                              <span className="flex items-center gap-0.5 text-xs text-ody-warning">
                                <Star size={12} className="fill-ody-warning" /> {h.rating}
                              </span>
                            )}
                          </div>
                        </div>
                        {h.description && (
                          <p className="text-sm text-ody-text-muted line-clamp-3">{h.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-ody-text-dim pt-1">
                          <span className={`flex items-center gap-1 ${cat.color}`}>
                            <CatIcon size={12} /> {cat.label}
                          </span>
                          {h.duration && (
                            <span className="flex items-center gap-1">
                              <Clock size={12} /> {h.duration}
                            </span>
                          )}
                          {h.address && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} /> {h.address}
                            </span>
                          )}
                        </div>
                      </div>
                      </Link>
                      <div className="px-4 pb-4">
                        <div className="flex items-center gap-2">
                          {h.websiteUrl && (
                            <a
                              href={h.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-ody-accent hover:underline"
                              onClick={e => e.stopPropagation()}
                            >
                              <ExternalLink size={12} /> Website
                            </a>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setItineraryHighlight(h); }}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-ody-accent/10 text-ody-accent hover:bg-ody-accent/20 transition-colors ml-auto"
                          >
                            <CalendarPlus size={12} /> Add to Itinerary
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="space-y-1">
              <AnimatePresence mode="popLayout">
                {filteredHighlights.map((h, i) => {
                  const cat = HIGHLIGHT_CATEGORIES[h.category || 'attraction'] || HIGHLIGHT_CATEGORIES.attraction;
                  const CatIcon = cat.icon;
                  return (
                    <motion.div
                      key={h.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: i * 0.02 }}
                      className="glass-card group hover:border-ody-accent/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 p-3">
                        {h.imageUrl && (
                          <Link to="/highlight/$highlightId" params={{ highlightId: h.id }} className="shrink-0">
                            <img src={h.imageUrl} alt={h.title} className="w-12 h-12 rounded-lg object-cover" loading="lazy" />
                          </Link>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link to="/highlight/$highlightId" params={{ highlightId: h.id }} className="font-medium text-sm hover:text-ody-accent transition-colors truncate">
                              {h.title}
                            </Link>
                            {h.rating && (
                              <span className="flex items-center gap-0.5 text-xs text-ody-warning shrink-0">
                                <Star size={10} className="fill-ody-warning" /> {h.rating}
                              </span>
                            )}
                            {h.priceLevel && <span className="shrink-0"><PriceLevel level={h.priceLevel} /></span>}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-ody-text-dim mt-0.5">
                            <span className={`flex items-center gap-1 ${cat.color}`}>
                              <CatIcon size={11} /> {cat.label}
                            </span>
                            {h.duration && (
                              <span className="flex items-center gap-1">
                                <Clock size={11} /> {h.duration}
                              </span>
                            )}
                            {h.address && (
                              <span className="flex items-center gap-1 truncate">
                                <MapPin size={11} /> {h.address}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {h.websiteUrl && (
                            <a
                              href={h.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-ody-text-muted hover:text-ody-accent transition-colors"
                              title="Website"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                          <button
                            onClick={() => setItineraryHighlight(h)}
                            className="p-1.5 text-ody-text-muted hover:text-ody-accent transition-colors"
                            title="Add to Itinerary"
                          >
                            <CalendarPlus size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}

      {/* Accommodations for this destination */}
      {accommodations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Hotel size={20} className="text-ody-accent" /> Accommodations
            </h2>
            {accommodations.length >= 2 && (
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                  compareMode
                    ? 'border-ody-accent bg-ody-accent/10 text-ody-accent'
                    : 'border-ody-border-subtle hover:border-ody-border text-ody-text-dim'
                }`}
              >
                <BarChart3 size={14} />
                {compareMode ? 'Hide Compare' : 'Compare'}
              </button>
            )}
          </div>

          <AnimatePresence>
            {compareMode && (
              <AccommodationCompare
                accommodations={accommodations}
                highlights={highlights}
                onClose={() => setCompareMode(false)}
              />
            )}
          </AnimatePresence>

          {!compareMode && (
            <div className="space-y-3">
              {accommodations.map(acc => (
                <div key={acc.id} className="flex items-center justify-between p-3 rounded-lg bg-ody-bg border border-ody-border-subtle">
                  <div>
                    <div className="font-medium">{acc.name}</div>
                    <div className="text-xs text-ody-text-dim flex items-center gap-3">
                      <span>{acc.type}</span>
                      {acc.checkIn && <span>{acc.checkIn} → {acc.checkOut}</span>}
                      {acc.rating && (
                        <span className="flex items-center gap-0.5 text-ody-warning">
                          <Star size={10} className="fill-ody-warning" /> {acc.rating}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {acc.totalCost && (
                      <div className="font-semibold">{acc.currency} {acc.totalCost}</div>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      acc.booked ? 'bg-ody-success/20 text-ody-success' : 'bg-ody-info/20 text-ody-info'
                    }`}>
                      {acc.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Events */}
      {events.length > 0 && (
        <EventsSection
          events={events}
          tripId={destination.tripId}
          startDate={tripStartDate}
          endDate={tripEndDate}
          onAddToItinerary={(event) => setItineraryEvent(event)}
        />
      )}

      {/* Transport Section - Map + Mode Comparison */}
      {destination.lat && destination.lng && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 space-y-6"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Navigation size={20} className="text-ody-accent" /> Getting There
          </h2>

          {/* Transport Map */}
          <TransportMap
            destinationLat={destination.lat}
            destinationLng={destination.lng}
            destinationName={destination.name}
            polyline={research?.routePolyline}
            distanceKm={research?.driveDistanceKm}
            homeBase={data?.homeBase}
            className="h-72"
          />

          {/* Transport Mode Cards */}
          <TransportModeCards
            transportModes={[
              {
                mode: 'drive',
                timeMinutes: research?.driveTimeMinutes ?? null,
                cost: research?.driveCost ? parseFloat(research.driveCost) : null,
                notes: research?.driveRouteNotes ?? null,
              },
              {
                mode: 'train',
                timeMinutes: research?.trainTimeMinutes ?? null,
                cost: research?.trainCost ? parseFloat(research.trainCost) : null,
                notes: research?.trainRouteNotes ?? null,
              },
              {
                mode: 'bus',
                timeMinutes: research?.busTimeMinutes ?? null,
                cost: research?.busCost ? parseFloat(research.busCost) : null,
                notes: research?.busRouteNotes ?? null,
              },
              {
                mode: 'taxi',
                timeMinutes: research?.taxiTimeMinutes ?? null,
                cost: research?.taxiCost ? parseFloat(research.taxiCost) : null,
                notes: research?.taxiRouteNotes ?? null,
              },
            ]}
            destinationName={destination.name}
            destinationId={destinationId}
            destinationLat={destination.lat}
            destinationLng={destination.lng}
            onCalculate={handleCalculateTransport}
            isCalculating={isCalculatingTransport}
            homeBase={data?.homeBase}
          />

          {/* Legacy Transport Notes (if any) */}
          {research?.transportNotes && (
            <div className="p-4 rounded-lg bg-ody-bg border border-ody-border-subtle">
              <h3 className="text-sm font-medium text-ody-text mb-2">Additional Transport Notes</h3>
              <p className="text-sm text-ody-text-muted whitespace-pre-line">{research.transportNotes}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Cultural Notes */}
      {research?.culturalNotes && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 space-y-3"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Globe size={20} className="text-ody-accent" /> Culture & Customs
          </h2>
          <p className="text-sm text-ody-text-muted whitespace-pre-line">{research.culturalNotes}</p>
        </motion.div>
      )}

      {/* Travel Tips */}
      {tips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb size={20} className="text-ody-warning" /> Travel Tips
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tips.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-ody-bg border border-ody-border-subtle"
              >
                <div className="w-6 h-6 rounded-full bg-ody-accent/20 text-ody-accent flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-ody-text-muted">{tip}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Map Link */}
      {destination.lat && destination.lng && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${destination.lat},${destination.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-ody-accent hover:text-ody-accent-hover transition-colors"
          >
            <MapPin size={18} /> View on Google Maps
            <ExternalLink size={14} />
          </a>
        </motion.div>
      )}

      {/* Add to Itinerary Modal */}
      {itineraryHighlight && tripId && (
        <AddToItineraryModal
          highlight={itineraryHighlight}
          tripId={tripId}
          startDate={tripStartDate}
          endDate={tripEndDate}
          open={!!itineraryHighlight}
          onClose={() => setItineraryHighlight(null)}
          destinationPhotoUrl={destination.photoUrl}
        />
      )}

      {/* Add Event to Itinerary Modal */}
      {itineraryEvent && tripId && (
        <AddEventToItineraryModal
          event={itineraryEvent}
          tripId={tripId}
          startDate={tripStartDate}
          endDate={tripEndDate}
          open={!!itineraryEvent}
          onClose={() => setItineraryEvent(null)}
        />
      )}

      {/* Image Picker Modal */}
      <ImagePickerModal
        open={imagePickerOpen}
        images={candidateImages}
        loading={imageSearchLoading}
        onSelect={handleSelectImage}
        onClose={() => setImagePickerOpen(false)}
      />

      {/* Toast */}
      <AnimatePresence>
        {imageToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg bg-ody-accent text-white text-sm font-medium shadow-lg"
          >
            {imageToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
