import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plane, TrendingUp, TrendingDown, Minus, ArrowRight, Bell, Activity } from 'lucide-react';
import { getFlightPriceTracking } from '../server/price-alerts';
import { Link } from '@tanstack/react-router';

interface Props {
  tripId: string;
  tripName?: string;
}

function formatPrice(price: number | null, currency = 'USD'): string {
  if (price === null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);
}

function PriceIndicator({ change, percent }: { change: number | null; percent: number | null }) {
  if (change === null) return <Minus size={12} className="text-ody-text-dim" />;
  if (change < 0) return <TrendingDown size={14} className="text-ody-success" />;
  if (change > 0) return <TrendingUp size={14} className="text-ody-danger" />;
  return <Minus size={12} className="text-ody-text-dim" />;
}

export function FlightPriceWidget({ tripId, tripName }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['price-tracking', tripId],
    queryFn: () => getFlightPriceTracking({ data: { tripId } }),
    refetchInterval: 5 * 60 * 1000, // refresh every 5 min
  });

  if (isLoading) return null;

  const routes = data?.routes || [];
  if (routes.length === 0) return null;

  const activeAlerts = routes.flatMap(r => r.alerts.filter((a: any) => a.active));
  const belowTarget = routes.filter(r => {
    const alert = r.alerts.find((a: any) => a.active);
    return alert && r.currentBestPrice && r.currentBestPrice <= parseFloat(alert.targetPrice);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Activity size={16} className="text-ody-accent" />
          Flight Prices
        </h4>
        {activeAlerts.length > 0 && (
          <span className="text-[10px] bg-ody-warning/10 text-ody-warning px-2 py-0.5 rounded-full flex items-center gap-1">
            <Bell size={10} /> {activeAlerts.length}
          </span>
        )}
      </div>

      {belowTarget.length > 0 && (
        <div className="bg-ody-success/10 border border-ody-success/20 rounded-lg px-3 py-2 text-xs text-ody-success font-medium animate-pulse">
          🎉 {belowTarget.length} route{belowTarget.length > 1 ? 's' : ''} below target price!
        </div>
      )}

      <div className="space-y-2">
        {routes.slice(0, 5).map((route: any) => {
          const alert = route.alerts.find((a: any) => a.active);
          const isBelowTarget = alert && route.currentBestPrice && route.currentBestPrice <= parseFloat(alert.targetPrice);

          return (
            <Link
              key={route.searchId}
              to="/trips/$tripId"
              params={{ tripId }}
              search={{ tab: 'price-tracking' }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors hover:bg-ody-surface/80 ${
                isBelowTarget ? 'bg-ody-success/5 border border-ody-success/20' : 'bg-ody-surface/40'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Plane size={12} className="text-ody-accent shrink-0" />
                <span className="text-xs font-medium truncate">
                  {route.origin} <ArrowRight size={10} className="inline" /> {route.destination}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <PriceIndicator change={route.priceChange} percent={route.priceChangePercent} />
                <span className={`text-sm font-bold ${isBelowTarget ? 'text-ody-success' : 'text-ody-accent'}`}>
                  {formatPrice(route.currentBestPrice)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
