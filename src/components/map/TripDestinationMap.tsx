import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { TripDestination, TripRoute } from '../../types/trips';

// Fix default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const statusColors: Record<string, string> = {
  researched: '#3b82f6',
  booked: '#22c55e',
  visited: '#a855f7',
};

const statusIcons: Record<string, string> = {
  researched: '🔍',
  booked: '✅',
  visited: '🏁',
};

function createDestIcon(dest: TripDestination, isSelected: boolean) {
  const color = statusColors[dest.status] || '#8b5cf6';
  const size = isSelected ? 36 : 28;
  const border = isSelected ? '4px solid #f59e0b' : '3px solid white';
  const icon = statusIcons[dest.status] || '📍';

  return L.divIcon({
    className: 'trip-marker',
    html: `<div style="
      width: ${size}px; height: ${size}px; border-radius: 50%;
      background: ${color}; border: ${border};
      box-shadow: 0 2px 12px rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      font-size: ${isSelected ? 16 : 12}px;
      transition: all 0.2s ease;
      cursor: pointer;
    ">${isSelected ? icon : ''}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function FitBounds({ destinations }: { destinations: TripDestination[] }) {
  const map = useMap();
  useEffect(() => {
    const validDests = destinations.filter((d) => d.lat && d.lng);
    if (validDests.length === 0) return;
    const bounds = L.latLngBounds(validDests.map((d) => [d.lat!, d.lng!]));
    map.fitBounds(bounds, { padding: [60, 60] });
  }, [destinations, map]);
  return null;
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

interface TripDestinationMapProps {
  destinations: TripDestination[];
  routes: TripRoute[];
  selectedId?: string | null;
  selectedRouteId?: string | null;
  onDestinationClick?: (dest: TripDestination) => void;
  onRouteClick?: (route: TripRoute) => void;
}

export function TripDestinationMap({
  destinations,
  routes,
  selectedId,
  selectedRouteId,
  onDestinationClick,
  onRouteClick,
}: TripDestinationMapProps) {
  const destMap = new Map(destinations.map((d) => [d.id, d]));

  const center: [number, number] = destinations.length > 0
    ? [destinations[0].lat!, destinations[0].lng!]
    : [45.5, 11.5]; // Italy center

  return (
    <MapContainer
      center={center}
      zoom={7}
      className="h-full w-full"
      style={{ background: '#0a0a0f' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <FitBounds destinations={destinations} />

      {/* Route lines */}
      {routes.map((route) => {
        const from = destMap.get(route.fromDestinationId) ?? route.fromDestination;
        const to = destMap.get(route.toDestinationId) ?? route.toDestination;
        if (!from?.lat || !from?.lng || !to?.lat || !to?.lng) return null;

        const isSelected = route.id === selectedRouteId;
        const isFromHub = routes.filter((r) => r.fromDestinationId === route.fromDestinationId).length > 3;

        return (
          <Polyline
            key={route.id}
            positions={[[from.lat, from.lng], [to.lat, to.lng]]}
            pathOptions={{
              color: isSelected ? '#f59e0b' : isFromHub ? '#6366f1' : '#8b5cf6',
              weight: isSelected ? 4 : 2,
              opacity: isSelected ? 1 : 0.5,
              dashArray: route.highway ? undefined : '6 6',
            }}
            eventHandlers={{
              click: () => onRouteClick?.(route),
            }}
          >
            <Popup>
              <div className="text-sm min-w-[200px]">
                <strong>{from.name} → {to.name}</strong>
                {route.distanceKm && (
                  <div className="mt-1">📏 {route.distanceKm} km ({route.distanceMiles?.toFixed(0)} mi)</div>
                )}
                {route.durationMinutes && <div>⏱ {formatDuration(route.durationMinutes)}</div>}
                {route.routeDescription && <div className="text-gray-500 mt-1">🛣️ {route.routeDescription}</div>}
                <div className="flex gap-2 mt-1">
                  {route.tolls && <span className="text-yellow-600">💰 Tolls</span>}
                  {route.highway && <span className="text-blue-600">🛣️ Highway</span>}
                </div>
                {route.notes && <div className="text-gray-400 mt-1 text-xs italic">{route.notes}</div>}
              </div>
            </Popup>
          </Polyline>
        );
      })}

      {/* Destination markers */}
      {destinations.map((dest) => {
        if (!dest.lat || !dest.lng) return null;
        const isSelected = dest.id === selectedId;

        return (
          <Marker
            key={dest.id}
            position={[dest.lat, dest.lng]}
            icon={createDestIcon(dest, isSelected)}
            eventHandlers={{
              click: () => onDestinationClick?.(dest),
            }}
          >
            <Tooltip
              direction="top"
              offset={[0, -16]}
              className="custom-tooltip"
            >
              <span className="font-semibold">{dest.name}</span>
            </Tooltip>
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-base">{dest.name}</h3>
                {dest.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{dest.description}</p>}
                <div className="flex flex-wrap gap-1 mt-2">
                  {dest.arrivalDate && (
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">📅 {dest.arrivalDate}{dest.departureDate ? ` — ${dest.departureDate}` : ''}</span>
                  )}
                  <span
                    className="text-xs px-2 py-0.5 rounded text-white"
                    style={{ background: statusColors[dest.status] || '#8b5cf6' }}
                  >
                    {dest.status}
                  </span>
                </div>
                {/* Outgoing routes */}
                {(() => {
                  const outRoutes = routes.filter((r) => r.fromDestinationId === dest.id);
                  if (outRoutes.length === 0) return null;
                  return (
                    <div className="mt-2 border-t pt-1.5 text-xs text-gray-500">
                      <strong>Routes from here:</strong>
                      {outRoutes.slice(0, 4).map((r) => {
                        const toDest = destMap.get(r.toDestinationId) ?? r.toDestination;
                        return (
                          <div key={r.id}>
                            → {toDest?.name} {r.distanceKm && `(${r.distanceKm}km, ${formatDuration(r.durationMinutes || 0)})`}
                          </div>
                        );
                      })}
                      {outRoutes.length > 4 && <div>...and {outRoutes.length - 4} more</div>}
                    </div>
                  );
                })()}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
