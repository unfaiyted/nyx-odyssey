import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Minus, Bell, BellOff, Plus, X, Trash2,
  Plane, ArrowRight, Target, DollarSign, BarChart3, Activity, AlertTriangle,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ReferenceLine, Area, AreaChart,
} from 'recharts';
import {
  getFlightPriceTracking, getPriceAlerts,
  createPriceAlert, updatePriceAlert, deletePriceAlert,
} from '../../server/price-alerts';
import { addPriceSnapshot } from '../../server/flight-research';

// ── Types ────────────────────────────────────────────

interface PriceHistoryPoint {
  price: number;
  date: string;
  source: string | null;
  airline: string;
  optionId: string;
}

interface PriceAlert {
  id: string;
  tripId: string;
  searchId: string | null;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string | null;
  targetPrice: string;
  currency: string | null;
  currentLowestPrice: string | null;
  lastChecked: string | null;
  triggered: boolean | null;
  triggeredAt: string | null;
  active: boolean | null;
  notes: string | null;
  createdAt: string;
}

interface RouteTracking {
  searchId: string;
  origin: string;
  destination: string;
  originCity: string | null;
  destinationCity: string | null;
  departureDate: string;
  returnDate: string | null;
  passengers: number;
  cabinClass: string | null;
  currentBestPrice: number | null;
  previousBestPrice: number | null;
  priceChange: number | null;
  priceChangePercent: number | null;
  optionCount: number;
  priceHistory: PriceHistoryPoint[];
  alerts: PriceAlert[];
  lowestEver: number | null;
  highestEver: number | null;
}

interface Props {
  tripId: string;
}

// ── Helpers ──────────────────────────────────────────

function formatPrice(price: number | null, currency = 'USD'): string {
  if (price === null || price === undefined) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);
}

function formatDateShort(date: string): string {
  const d = new Date(date + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Price Change Indicator ───────────────────────────

function PriceChangeIndicator({ change, percent }: { change: number | null; percent: number | null }) {
  if (change === null || percent === null) {
    return <span className="text-xs text-ody-text-dim flex items-center gap-1"><Minus size={12} /> No change data</span>;
  }

  const isDown = change < 0;
  const isUp = change > 0;
  const absChange = Math.abs(change);
  const absPercent = Math.abs(percent).toFixed(1);

  if (isDown) {
    return (
      <motion.span
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="text-xs text-ody-success flex items-center gap-1 font-medium"
      >
        <TrendingDown size={14} />
        <span>↓ ${absChange.toFixed(0)} ({absPercent}%)</span>
      </motion.span>
    );
  }

  if (isUp) {
    return (
      <motion.span
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="text-xs text-ody-danger flex items-center gap-1 font-medium"
      >
        <TrendingUp size={14} />
        <span>↑ ${absChange.toFixed(0)} ({absPercent}%)</span>
      </motion.span>
    );
  }

  return <span className="text-xs text-ody-text-dim flex items-center gap-1"><Minus size={12} /> No change</span>;
}

// ── Route Price Chart ────────────────────────────────

function RoutePriceChart({ route }: { route: RouteTracking }) {
  const chartData = useMemo(() => {
    if (route.priceHistory.length === 0) return [];

    // Group by date, showing the lowest price per day
    const byDate = new Map<string, { date: string; price: number; airlines: string[] }>();
    for (const point of route.priceHistory) {
      const dateKey = new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = byDate.get(dateKey);
      if (!existing || point.price < existing.price) {
        byDate.set(dateKey, {
          date: dateKey,
          price: point.price,
          airlines: existing ? [...existing.airlines, point.airline] : [point.airline],
        });
      } else {
        existing.airlines.push(point.airline);
      }
    }
    return Array.from(byDate.values());
  }, [route.priceHistory]);

  // Also add current best as the latest point if not in history
  const dataWithCurrent = useMemo(() => {
    if (chartData.length === 0 && route.currentBestPrice) {
      return [{ date: 'Now', price: route.currentBestPrice, airlines: [] }];
    }
    return chartData;
  }, [chartData, route.currentBestPrice]);

  if (dataWithCurrent.length < 1) {
    return (
      <div className="flex items-center justify-center py-8 text-ody-text-dim text-sm">
        <Activity size={16} className="mr-2 opacity-50" />
        No price history data yet. Add price snapshots to flight options to see trends.
      </div>
    );
  }

  const targetPrice = route.alerts.length > 0 ? parseFloat(route.alerts[0].targetPrice) : null;

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dataWithCurrent}>
          <defs>
            <linearGradient id={`gradient-${route.searchId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} />
          <YAxis tick={{ fontSize: 10, fill: '#888' }} tickFormatter={v => `$${v}`} domain={['dataMin - 50', 'dataMax + 50']} />
          <Tooltip
            contentStyle={{
              background: '#1a1a2e',
              border: '1px solid #333',
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(val: any) => [`$${val}`, 'Best Price']}
          />
          {targetPrice && (
            <ReferenceLine
              y={targetPrice}
              stroke="#22c55e"
              strokeDasharray="5 5"
              label={{ value: `Target: $${targetPrice}`, fill: '#22c55e', fontSize: 10, position: 'right' }}
            />
          )}
          <Area
            type="monotone"
            dataKey="price"
            stroke="#6366f1"
            strokeWidth={2}
            fill={`url(#gradient-${route.searchId})`}
            dot={{ fill: '#6366f1', r: 4, strokeWidth: 2, stroke: '#1a1a2e' }}
            activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Alert Form ───────────────────────────────────────

function AlertForm({ tripId, route, onClose }: {
  tripId: string;
  route?: RouteTracking;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    origin: route?.origin || '',
    destination: route?.destination || '',
    departureDate: route?.departureDate || '',
    returnDate: route?.returnDate || '',
    targetPrice: route?.currentBestPrice ? String(Math.floor(route.currentBestPrice * 0.9)) : '',
    notes: '',
  });

  const mutation = useMutation({
    mutationFn: (data: any) => createPriceAlert({ data: { tripId, searchId: route?.searchId, ...data } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-tracking', tripId] });
      queryClient.invalidateQueries({ queryKey: ['price-alerts', tripId] });
      onClose();
    },
  });

  const f = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }));

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Bell size={16} className="text-ody-accent" /> Set Price Alert
        </h4>
        <button onClick={onClose} className="text-ody-text-dim hover:text-ody-text-muted"><X size={16} /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs text-ody-text-dim font-medium">Origin Airport</label>
          <input placeholder="e.g. DFW" value={form.origin}
            onChange={e => f('origin', e.target.value.toUpperCase())}
            className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-ody-text-dim font-medium">Destination Airport</label>
          <input placeholder="e.g. VCE" value={form.destination}
            onChange={e => f('destination', e.target.value.toUpperCase())}
            className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-ody-text-dim font-medium">Departure Date</label>
          <input type="date" value={form.departureDate} onChange={e => f('departureDate', e.target.value)}
            className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-ody-text-dim font-medium">Return Date</label>
          <input type="date" value={form.returnDate} onChange={e => f('returnDate', e.target.value)}
            className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-ody-text-dim font-medium">Target Price ($)</label>
          <input type="number" placeholder="e.g. 500" value={form.targetPrice}
            onChange={e => f('targetPrice', e.target.value)}
            className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
        </div>
      </div>

      <textarea placeholder="Notes (optional)" value={form.notes} onChange={e => f('notes', e.target.value)}
        className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent resize-none h-16" />

      <div className="flex gap-2">
        <button onClick={() => mutation.mutate(form)}
          disabled={!form.origin || !form.destination || !form.departureDate || !form.targetPrice}
          className="px-4 py-2 rounded-lg bg-ody-accent text-white text-sm hover:bg-ody-accent-hover disabled:opacity-50 transition-colors">
          Create Alert
        </button>
        <button onClick={onClose}
          className="px-4 py-2 rounded-lg border border-ody-border text-sm hover:bg-ody-surface-hover transition-colors">
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

// ── Route Tracking Card ──────────────────────────────

function RouteTrackingCard({ route, tripId }: { route: RouteTracking; tripId: string }) {
  const [showChart, setShowChart] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const queryClient = useQueryClient();

  const toggleAlertMut = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updatePriceAlert({ data: { id, tripId, active } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-tracking', tripId] });
    },
  });

  const deleteAlertMut = useMutation({
    mutationFn: (id: string) => deletePriceAlert({ data: { id, tripId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-tracking', tripId] });
    },
  });

  const hasAlert = route.alerts.length > 0;
  const activeAlert = route.alerts.find(a => a.active);
  const targetPrice = activeAlert ? parseFloat(activeAlert.targetPrice) : null;
  const belowTarget = targetPrice && route.currentBestPrice ? route.currentBestPrice <= targetPrice : false;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card overflow-hidden transition-all ${belowTarget ? 'ring-2 ring-ody-success/50' : ''}`}
    >
      {/* Alert banner */}
      {belowTarget && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          className="bg-ody-success/10 px-4 py-2 flex items-center gap-2 text-ody-success text-xs font-medium border-b border-ody-success/20"
        >
          <AlertTriangle size={14} />
          Price dropped below your target of {formatPrice(targetPrice)}!
        </motion.div>
      )}

      <div className="p-4 space-y-4">
        {/* Route header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ody-accent/15 flex items-center justify-center">
              <Plane size={18} className="text-ody-accent" />
            </div>
            <div>
              <div className="font-semibold text-sm flex items-center gap-2">
                <span>{route.origin}</span>
                {route.originCity && <span className="text-xs text-ody-text-dim font-normal">({route.originCity})</span>}
                <ArrowRight size={14} className="text-ody-accent" />
                <span>{route.destination}</span>
                {route.destinationCity && <span className="text-xs text-ody-text-dim font-normal">({route.destinationCity})</span>}
              </div>
              <div className="text-xs text-ody-text-dim mt-0.5">
                {formatDateShort(route.departureDate)}
                {route.returnDate && <> — {formatDateShort(route.returnDate)}</>}
                {' · '}{route.optionCount} options tracked
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChart(!showChart)}
              className={`p-2 rounded-lg transition-colors ${showChart ? 'bg-ody-accent/10 text-ody-accent' : 'text-ody-text-dim hover:text-ody-accent'}`}
              title="Toggle price chart"
            >
              <BarChart3 size={16} />
            </button>
            <button
              onClick={() => setShowAlertForm(!showAlertForm)}
              className={`p-2 rounded-lg transition-colors ${hasAlert ? 'bg-ody-warning/10 text-ody-warning' : 'text-ody-text-dim hover:text-ody-warning'}`}
              title={hasAlert ? 'Manage alert' : 'Set price alert'}
            >
              {hasAlert ? <Bell size={16} /> : <BellOff size={16} />}
            </button>
          </div>
        </div>

        {/* Price summary row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-ody-surface/50 rounded-xl p-3">
            <div className="text-[10px] text-ody-text-dim uppercase tracking-wider mb-1">Current Best</div>
            <div className="text-lg font-bold text-ody-accent">
              {formatPrice(route.currentBestPrice)}
            </div>
          </div>
          <div className="bg-ody-surface/50 rounded-xl p-3">
            <div className="text-[10px] text-ody-text-dim uppercase tracking-wider mb-1">Since Last Check</div>
            <PriceChangeIndicator change={route.priceChange} percent={route.priceChangePercent} />
          </div>
          <div className="bg-ody-surface/50 rounded-xl p-3">
            <div className="text-[10px] text-ody-text-dim uppercase tracking-wider mb-1">Lowest Ever</div>
            <div className="text-sm font-semibold text-ody-success">{formatPrice(route.lowestEver)}</div>
          </div>
          <div className="bg-ody-surface/50 rounded-xl p-3">
            <div className="text-[10px] text-ody-text-dim uppercase tracking-wider mb-1">
              {targetPrice ? 'Target Price' : 'Highest Ever'}
            </div>
            <div className={`text-sm font-semibold ${targetPrice ? 'text-ody-warning' : 'text-ody-danger'}`}>
              {targetPrice ? formatPrice(targetPrice) : formatPrice(route.highestEver)}
            </div>
          </div>
        </div>

        {/* Active alerts */}
        {route.alerts.length > 0 && (
          <div className="space-y-2">
            {route.alerts.map(alert => (
              <div key={alert.id} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                alert.active ? 'border-ody-warning/30 bg-ody-warning/5' : 'border-ody-border/30 bg-ody-surface/30 opacity-50'
              }`}>
                <div className="flex items-center gap-2">
                  <Target size={14} className={alert.active ? 'text-ody-warning' : 'text-ody-text-dim'} />
                  <span className="text-xs">
                    Alert when price drops below <span className="font-semibold">{formatPrice(parseFloat(alert.targetPrice))}</span>
                  </span>
                  {alert.triggered && (
                    <span className="text-[10px] bg-ody-success/10 text-ody-success px-2 py-0.5 rounded-full">Triggered!</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleAlertMut.mutate({ id: alert.id, active: !alert.active })}
                    className="p-1 text-ody-text-dim hover:text-ody-text-muted"
                    title={alert.active ? 'Pause alert' : 'Resume alert'}
                  >
                    {alert.active ? <Bell size={12} /> : <BellOff size={12} />}
                  </button>
                  <button
                    onClick={() => deleteAlertMut.mutate(alert.id)}
                    className="p-1 text-ody-text-dim hover:text-ody-danger"
                    title="Delete alert"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chart */}
        <AnimatePresence>
          {showChart && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <RoutePriceChart route={route} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alert form */}
        <AnimatePresence>
          {showAlertForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <AlertForm tripId={tripId} route={route} onClose={() => setShowAlertForm(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Main Component ───────────────────────────────────

export function PriceTrackingTab({ tripId }: Props) {
  const [showNewAlert, setShowNewAlert] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['price-tracking', tripId],
    queryFn: () => getFlightPriceTracking({ data: { tripId } }),
  });

  if (isLoading) return <div className="text-center py-8 text-ody-text-dim">Loading price tracking…</div>;

  const routes = (data?.routes || []) as RouteTracking[];
  const alertsCount = routes.reduce((sum, r) => sum + r.alerts.filter(a => a.active).length, 0);
  const belowTargetCount = routes.filter(r => {
    const alert = r.alerts.find(a => a.active);
    return alert && r.currentBestPrice && r.currentBestPrice <= parseFloat(alert.targetPrice);
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Activity size={20} /> Price Tracking
          {alertsCount > 0 && (
            <span className="text-xs bg-ody-warning/10 text-ody-warning rounded-full px-2 py-0.5">
              {alertsCount} active alert{alertsCount > 1 ? 's' : ''}
            </span>
          )}
          {belowTargetCount > 0 && (
            <span className="text-xs bg-ody-success/10 text-ody-success rounded-full px-2 py-0.5 animate-pulse">
              {belowTargetCount} below target!
            </span>
          )}
        </h3>
        <button onClick={() => setShowNewAlert(!showNewAlert)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ody-accent/10 text-ody-accent text-sm hover:bg-ody-accent/20 transition-colors">
          <Plus size={14} /> New Alert
        </button>
      </div>

      {/* New alert form (standalone) */}
      <AnimatePresence>
        {showNewAlert && <AlertForm tripId={tripId} onClose={() => setShowNewAlert(false)} />}
      </AnimatePresence>

      {/* Routes */}
      {routes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-ody-accent/10 flex items-center justify-center mx-auto mb-4">
            <Activity size={28} className="text-ody-accent" />
          </div>
          <p className="text-ody-text-muted mb-2">No flight routes tracked yet</p>
          <p className="text-ody-text-dim text-sm">Add flight searches in the Research tab to start tracking prices.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {routes.map(route => (
            <RouteTrackingCard key={route.searchId} route={route} tripId={tripId} />
          ))}
        </div>
      )}
    </div>
  );
}
