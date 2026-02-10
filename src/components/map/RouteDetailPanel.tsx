import { motion } from 'framer-motion';
import type { TripRoute } from '../../types/trips';

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

interface Props {
  route: TripRoute;
  onClose: () => void;
  onSelectDestination: (id: string) => void;
}

export function RouteDetailPanel({ route, onClose, onSelectDestination }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-4 right-4 w-80 bg-ody-surface/95 backdrop-blur border border-ody-border rounded-xl p-4 z-[1000]"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-sm">Route Details</h3>
        <button
          onClick={onClose}
          className="text-ody-text-muted hover:text-ody-text text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* From → To */}
      <div className="flex items-center gap-2 text-sm mb-3">
        <button
          onClick={() => onSelectDestination(route.fromDestinationId)}
          className="font-medium text-ody-accent hover:underline truncate"
        >
          {route.fromDestination?.name ?? 'Origin'}
        </button>
        <span className="text-ody-text-dim">→</span>
        <button
          onClick={() => onSelectDestination(route.toDestinationId)}
          className="font-medium text-ody-accent hover:underline truncate"
        >
          {route.toDestination?.name ?? 'Destination'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {route.distanceMiles && (
          <div className="flex items-center gap-1.5 text-ody-text-muted">
            <Navigation size={11} className="text-ody-accent" />
            {route.distanceMiles.toFixed(1)} mi
            {route.distanceKm && ` (${route.distanceKm.toFixed(0)} km)`}
          </div>
        )}
        {route.durationMinutes && (
          <div className="flex items-center gap-1.5 text-ody-text-muted">
            <Clock size={11} className="text-ody-accent" />
            {formatDuration(route.durationMinutes)}
          </div>
        )}
      </div>

      {/* Extras */}
      <div className="flex gap-2 mt-3 text-[10px] text-ody-text-dim">
        {route.highway && <span className="bg-ody-bg/60 px-2 py-0.5 rounded">🛣️ Highway</span>}
        {route.tolls && <span className="bg-ody-warning/10 text-ody-warning px-2 py-0.5 rounded">💰 Tolls</span>}
      </div>

      {route.notes && (
        <p className="text-xs text-ody-text-muted mt-2 border-t border-ody-border pt-2">{route.notes}</p>
      )}

      {route.routeDescription && (
        <p className="text-xs text-ody-text-muted mt-2">{route.routeDescription}</p>
      )}
    </motion.div>
  );
}
