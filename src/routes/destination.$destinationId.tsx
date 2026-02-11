import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getDestinationDetail } from '../server/destination-detail';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  ArrowLeft, MapPin, Calendar, Globe, Thermometer, DollarSign,
  Shield, Utensils, Camera, Clock, Star, ExternalLink,
  Sun, CloudRain, Info, Lightbulb, Plane, Languages,
  Mountain, Users, ChevronDown, ChevronUp, Navigation,
  Hotel, ShoppingBag, TreePine, Music, Landmark, Eye, Map
} from 'lucide-react';
import { DestinationDetailMap } from '../components/map/DestinationDetailMap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend, Area, AreaChart } from 'recharts';

export const Route = createFileRoute('/destination/$destinationId')({
  component: DestinationDetailPage,
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
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [activeHighlightCategory, setActiveHighlightCategory] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['destination-detail', destinationId],
    queryFn: () => getDestinationDetail({ data: { destinationId } }),
  });

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

  const { destination, research, highlights, weather, accommodations } = data;
  const tips: string[] = research?.travelTips ? JSON.parse(research.travelTips) : [];

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

        <div className="absolute top-4 left-4">
          <Link
            to="/trips/$tripId"
            params={{ tripId: destination.tripId }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/90 text-sm hover:bg-black/60 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Trip
          </Link>
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
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Thermometer size={20} className="text-ody-accent" /> Climate
          </h2>
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
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Star size={20} className="text-ody-accent" /> Things to Do & See
          </h2>

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

          {/* Highlights grid */}
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
                      {h.websiteUrl && (
                        <a
                          href={h.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-ody-accent hover:underline mt-1"
                        >
                          <ExternalLink size={12} /> Website
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Accommodations for this destination */}
      {accommodations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Hotel size={20} className="text-ody-accent" /> Accommodations
          </h2>
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
        </motion.div>
      )}

      {/* Transport Notes */}
      {research?.transportNotes && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 space-y-3"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Navigation size={20} className="text-ody-accent" /> Getting Around
          </h2>
          <p className="text-sm text-ody-text-muted whitespace-pre-line">{research.transportNotes}</p>
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

      {/* Interactive Map */}
      {destination.lat && destination.lng && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Map size={20} className="text-ody-accent" /> Route from Vicenza
          </h2>
          <DestinationDetailMap
            destinationId={destination.id}
            destinationName={destination.name}
            destLat={destination.lat}
            destLng={destination.lng}
            highlights={highlights}
          />
          <div className="text-center">
            <a
              href={`https://www.google.com/maps/dir/Contrà+S.+Rocco+60,+Vicenza/${destination.lat},${destination.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-ody-accent hover:text-ody-accent-hover transition-colors"
            >
              <Navigation size={14} /> Open in Google Maps
              <ExternalLink size={12} />
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
}
