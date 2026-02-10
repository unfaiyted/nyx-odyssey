import { motion } from 'framer-motion';
import type { TripRoute } from '../../types/trips';

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

interface RouteDetailPanelProps {
  route: TripRoute;
  onClose: () => void;
  onSelectDestination: (id: string) => void;
}

export function RouteDetailPanel({ route, onClose, onSelectDestination }: RouteDetailPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-4 right-4 w-80 bg-ody-surface/95 backdrop-blur border border-ody-border rounded-xl p-4 z-[1000]"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-base">Route Details</h3>
        <button onClick={onClose} className="text-ody-text-muted hover:text-ody-text text-lg">×</button>
      </div>

      {/* From → To */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => onSelectDestination(route.fromDestinationId)}
          className="text-sm font-semibold text-blue-400 hover:underline truncate"
        >
          {route.fromDestination?.name ?? 'Unknown'}
        </button>
        <span className="text-ody-text-muted shrink-0">→</span>
        <button
          onClick={() => onSelectDestination(route.toDestinationId)}
          className="text-sm font-semibold text-blue-400 hover:underline truncate"
        >
          {route.toDestination?.name ?? 'Unknown'}
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {route.distanceKm != null && (
          <div className="bg-ody-bg/60 rounded-lg p-2.5 text-center">
            <div className="text-lg font-bold">{route.distanceKm}</div>
            <div className="text-xs text-ody-text-muted">km</div>
          </div>
        )}
        {route.distanceMiles != null && (
          <div className="bg-ody-bg/60 rounded-lg p-2.5 text-center">
            <div className="text-lg font-bold">{route.distanceMiles.toFixed(0)}</div>
            <div className="text-xs text-ody-text-muted">miles</div>
          </div>
        )}
        {route.durationMinutes != null && (
          <div className="bg-ody-bg/60 rounded-lg p-2.5 text-center">
            <div className="text-lg font-bold">{formatDuration(route.durationMinutes)}</div>
            <div className="text-xs text-ody-text-muted">drive time</div>
          </div>
        )}
        <div className="bg-ody-bg/60 rounded-lg p-2.5 text-center">
          <div className="flex justify-center gap-1.5 text-sm">
            {route.tolls && <span title="Tolls">💰</span>}
            {route.highway && <span title="Highway">🛣️</span>}
            {!route.tolls && !route.highway && <span>🏘️</span>}
          </div>
          <div className="text-xs text-ody-text-muted">
            {[route.tolls && 'Tolls', route.highway && 'Highway'].filter(Boolean).join(', ') || 'Local roads'}
          </div>
        </div>
      </div>

      {route.routeDescription && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-ody-text-muted mb-1">Route</p>
          <p className="text-sm">{route.routeDescription}</p>
        </div>
      )}

      {route.notes && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2.5">
          <p className="text-xs font-semibold text-yellow-400 mb-1">💡 Notes</p>
          <p className="text-xs text-ody-text-muted">{route.notes}</p>
        </div>
      )}
    </motion.div>
  );
}
