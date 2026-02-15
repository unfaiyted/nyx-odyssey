import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, Train, Bus, Clock, MapPin, 
  ExternalLink, ChevronDown, ChevronUp, Calculator,
  Navigation, AlertCircle, CarFront
} from 'lucide-react';

interface TransportMode {
  mode: 'drive' | 'train' | 'bus' | 'taxi';
  timeMinutes: number | null;
  cost: number | null;
  notes: string | null;
}

interface HomeBase {
  name: string;
  lat: number;
  lng: number;
  address?: string;
  currency?: string;
}

interface TransportModeCardsProps {
  transportModes: TransportMode[];
  destinationName: string;
  destinationId: string;
  destinationLat: number;
  destinationLng: number;
  onCalculate: () => void;
  isCalculating: boolean;
  homeBase?: HomeBase | null;
}

const MODE_CONFIG = {
  drive: {
    label: 'Drive',
    icon: Car,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    textColor: 'text-blue-400',
    description: 'Via car',
    bookingUrl: null,
  },
  train: {
    label: 'Train',
    icon: Train,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    textColor: 'text-green-400',
    description: 'Via rail',
    bookingUrl: null,
  },
  bus: {
    label: 'Bus',
    icon: Bus,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    textColor: 'text-orange-400',
    description: 'Via FlixBus or regional services',
    bookingUrl: 'https://www.flixbus.it/',
  },
  taxi: {
    label: 'Taxi / Rideshare',
    icon: CarFront,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    textColor: 'text-purple-400',
    description: 'For groups or late night',
    bookingUrl: null,
  },
};

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function formatCost(amount: number, currency?: string): string {
  const symbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€';
  if (amount < 1) return `${symbol}${amount.toFixed(2)}`;
  if (amount === Math.floor(amount)) return `${symbol}${amount}`;
  return `${symbol}${amount.toFixed(2)}`;
}

function TransportModeCard({ 
  mode, 
  destinationName,
  hasData,
  homeBase,
}: { 
  mode: TransportMode; 
  destinationName: string;
  hasData: boolean;
  homeBase?: HomeBase | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = MODE_CONFIG[mode.mode];
  const Icon = config.icon;

  const fromLocation = homeBase?.address || homeBase?.name || 'Home';
  const googleMapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(fromLocation)}/${encodeURIComponent(destinationName)}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border ${config.borderColor} ${config.bgColor} overflow-hidden transition-all duration-200`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-4 text-left"
      >
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shrink-0 shadow-lg`}>
          <Icon size={24} className="text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-ody-text">{config.label}</h3>
            {!hasData && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-ody-text-dim/20 text-ody-text-dim">
                Needs calculation
              </span>
            )}
          </div>
          <p className="text-xs text-ody-text-muted">{config.description}</p>
        </div>

        <div className="text-right shrink-0">
          {mode.timeMinutes ? (
            <div className={`font-semibold ${config.textColor} flex items-center gap-1`}>
              <Clock size={14} />
              {formatDuration(mode.timeMinutes)}
            </div>
          ) : (
            <div className="text-ody-text-dim text-sm">--</div>
          )}
          {mode.cost ? (
            <div className="text-sm text-ody-text-muted flex items-center gap-1 justify-end">
              ~{formatCost(mode.cost, homeBase?.currency)}
            </div>
          ) : (
            <div className="text-xs text-ody-text-dim">--</div>
          )}
        </div>

        <div className="shrink-0 text-ody-text-dim">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-ody-border-subtle"
          >
            <div className="p-4 space-y-3">
              {mode.notes ? (
                <div className="text-sm text-ody-text-muted whitespace-pre-line">
                  {mode.notes}
                </div>
              ) : (
                <div className="flex items-start gap-2 text-sm text-ody-text-dim">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>No detailed information available yet. Click Calculate to get estimates.</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-ody-surface hover:bg-ody-surface-hover text-ody-text-muted hover:text-ody-text transition-colors"
                >
                  <Navigation size={12} />
                  View on Google Maps
                  <ExternalLink size={10} />
                </a>
                
                {config.bookingUrl && (
                  <a
                    href={config.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg ${config.bgColor} ${config.textColor} hover:opacity-80 transition-opacity`}
                  >
                    <ExternalLink size={12} />
                    Check {config.label} options
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function TransportModeCards({
  transportModes,
  destinationName,
  destinationId,
  destinationLat,
  destinationLng,
  onCalculate,
  isCalculating,
  homeBase,
}: TransportModeCardsProps) {
  const homeBaseName = homeBase?.name || 'Home Base';
  const hasAnyData = transportModes.some(m => m.timeMinutes !== null || m.cost !== null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Navigation size={20} className="text-ody-accent" />
          Getting There from {homeBaseName}
        </h2>
        
        <button
          onClick={onCalculate}
          disabled={isCalculating}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
            hasAnyData 
              ? 'bg-ody-surface-hover text-ody-text-muted hover:text-ody-text border border-ody-border' 
              : 'bg-ody-accent text-white hover:bg-ody-accent-hover'
          }`}
        >
          {isCalculating ? (
            <>
              <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Calculator size={16} />
              {hasAnyData ? 'Recalculate' : 'Calculate Routes'}
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {transportModes.map((mode, index) => (
          <TransportModeCard
            key={mode.mode}
            mode={mode}
            destinationName={destinationName}
            hasData={mode.timeMinutes !== null || mode.cost !== null}
            homeBase={homeBase}
          />
        ))}
      </div>

      {/* Transport Notes from Research */}
      {/* This will be rendered by the parent component if available */}
    </div>
  );
}
