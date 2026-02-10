import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Destination, Route as RouteType } from '../../types/destinations';

// Fix default marker icons for bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const categoryColors: Record<string, string> = {
  start: '#22c55e',
  stop: '#8b5cf6',
  end: '#ef4444',
  poi: '#f59e0b',
};

function createCategoryIcon(category: string, visited: boolean) {
  const color = categoryColors[category] || categoryColors.stop;
  const opacity = visited ? 0.5 : 1;
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50%;
      background: ${color}; border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      opacity: ${opacity};
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: bold; color: white;
    ">${visited ? '✓' : ''}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

function FitBounds({ destinations }: { destinations: Destination[] }) {
  const map = useMap();
  useEffect(() => {
    if (destinations.length === 0) return;
    const bounds = L.latLngBounds(destinations.map((d) => [d.lat, d.lng]));
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [destinations, map]);
  return null;
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

interface DestinationMapProps {
  destinations: Destination[];
  routes: RouteType[];
  onDestinationClick?: (dest: Destination) => void;
  selectedId?: string | null;
}

export function DestinationMap({ destinations, routes, onDestinationClick, selectedId }: DestinationMapProps) {
  // Build route lines from ordered destinations
  const orderedDests = [...destinations].sort((a, b) => a.orderIndex - b.orderIndex);
  const routeMap = new Map(routes.map((r) => [`${r.fromDestinationId}-${r.toDestinationId}`, r]));

  const routeLines: { from: Destination; to: Destination; route?: RouteType }[] = [];
  for (let i = 0; i < orderedDests.length - 1; i++) {
    const from = orderedDests[i];
    const to = orderedDests[i + 1];
    const route = routeMap.get(`${from.id}-${to.id}`);
    routeLines.push({ from, to, route });
  }

  const center: [number, number] = destinations.length > 0
    ? [destinations[0].lat, destinations[0].lng]
    : [39.8283, -98.5795]; // US center

  return (
    <MapContainer
      center={center}
      zoom={5}
      className="h-full w-full rounded-lg"
      style={{ background: '#0a0a0f' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <FitBounds destinations={destinations} />

      {/* Route lines */}
      {routeLines.map(({ from, to, route }, i) => (
        <Polyline
          key={`route-${i}`}
          positions={[[from.lat, from.lng], [to.lat, to.lng]]}
          pathOptions={{
            color: '#8b5cf6',
            weight: 3,
            opacity: 0.7,
            dashArray: route ? undefined : '8 8',
          }}
        >
          {route && (
            <Popup>
              <div className="text-sm">
                <strong>{from.name} → {to.name}</strong>
                {route.distanceMiles && <div>📏 {route.distanceMiles.toFixed(1)} miles</div>}
                {route.durationMinutes && <div>⏱ {formatDuration(route.durationMinutes)}</div>}
              </div>
            </Popup>
          )}
        </Polyline>
      ))}

      {/* Destination markers */}
      {destinations.map((dest) => (
        <Marker
          key={dest.id}
          position={[dest.lat, dest.lng]}
          icon={createCategoryIcon(dest.category || 'stop', dest.visited || false)}
          eventHandlers={{
            click: () => onDestinationClick?.(dest),
          }}
        >
          <Popup>
            <div className="min-w-[180px]">
              <h3 className="font-bold text-base">{dest.name}</h3>
              {dest.description && <p className="text-sm text-gray-600 mt-1">{dest.description}</p>}
              {dest.address && <p className="text-xs text-gray-500 mt-1">📍 {dest.address}</p>}
              {dest.plannedDate && <p className="text-xs text-gray-500">📅 {dest.plannedDate}</p>}
              {dest.notes && <p className="text-xs text-gray-400 mt-1 italic">{dest.notes}</p>}
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="inline-block px-2 py-0.5 rounded-full text-xs text-white"
                  style={{ background: categoryColors[dest.category || 'stop'] }}
                >
                  {dest.category || 'stop'}
                </span>
                {dest.visited && <span className="text-xs text-green-600">✓ Visited</span>}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
