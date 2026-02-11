import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateTravelTime } from '../../server/travel';

interface TravelEstimate {
  mode: string;
  durationMinutes: number;
  distanceKm: number;
  label: string;
}

interface TravelEstimatePanelProps {
  lat: number | null;
  lng: number | null;
  /** Debounce delay in ms (default 800) */
  debounceMs?: number;
}

const modeIcons: Record<string, string> = {
  car: '🚗',
  train: '🚆',
  bus: '🚌',
  walk: '🚶',
  flight: '✈️',
};

const modeLabels: Record<string, string> = {
  car: 'Drive',
  train: 'Train',
  bus: 'Bus',
  walk: 'Walk',
  flight: 'Flight',
};

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function TravelEstimatePanel({ lat, lng, debounceMs = 800 }: TravelEstimatePanelProps) {
  const [estimates, setEstimates] = useState<TravelEstimate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      setEstimates([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    timerRef.current = setTimeout(async () => {
      try {
        // Home base: Vicenza
        const result = await calculateTravelTime({
          data: {
            fromLat: 45.5455,
            fromLng: 11.5354,
            toLat: lat,
            toLng: lng,
            fromName: 'Vicenza (Home)',
          },
        });

        // Add flight estimate for long distances (>300km)
        const carEst = result.find((e: TravelEstimate) => e.mode === 'car');
        if (carEst && carEst.distanceKm > 300) {
          const flightMin = Math.round(carEst.distanceKm / 800 * 60 + 90); // ~800km/h + 90min airport overhead
          result.push({
            mode: 'flight',
            durationMinutes: flightMin,
            distanceKm: carEst.distanceKm,
            label: `✈️ Flight · ~${formatDuration(flightMin)}`,
          });
        }

        setEstimates(result);
      } catch {
        setError('Could not calculate travel times');
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [lat, lng, debounceMs]);

  if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="rounded-lg border border-ody-border bg-ody-bg/50 p-3"
      >
        <div className="text-xs font-medium text-ody-text-muted mb-2">
          📍 Travel from Vicenza (Home)
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-xs text-ody-text-dim">
            <div className="h-3 w-3 rounded-full border-2 border-ody-accent border-t-transparent animate-spin" />
            Calculating travel times...
          </div>
        )}

        {error && (
          <div className="text-xs text-red-400">{error}</div>
        )}

        {!loading && estimates.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {estimates.map((est) => (
              <div
                key={est.mode}
                className="flex items-center gap-2 rounded-md bg-ody-surface/50 px-2.5 py-1.5 text-xs"
              >
                <span className="text-base">{modeIcons[est.mode] || '🚗'}</span>
                <div className="min-w-0">
                  <div className="font-medium text-ody-text">
                    {modeLabels[est.mode] || est.mode}
                  </div>
                  <div className="text-ody-text-dim">
                    {formatDuration(est.durationMinutes)}
                    {est.mode === 'car' && ` · ${est.distanceKm} km`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
