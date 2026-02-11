import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { getDestinationRoute } from '../../server/destination-route';
import { Navigation, Clock, MapPin, Utensils, Camera, TrainFront, Layers } from 'lucide-react';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const VICENZA_LAT = 45.5477;
const VICENZA_LNG = 11.5486;

const PIN_COLORS: Record<string, string> = {
  destination: '#ef4444',
  home: '#22c55e',
  food: '#f97316',
  attraction: '#8b5cf6',
  cultural: '#eab308',
  nature: '#10b981',
  activity: '#06b6d4',
  nightlife: '#a855f7',
  shopping: '#ec4899',
  parking: '#6b7280',
  train: '#3b82f6',
};

function createPinIcon(type: string) {
  const color = PIN_COLORS[type] || PIN_COLORS.attraction;
  const emoji = type === 'home' ? '🏠' :
    type === 'destination' ? '📍' :
    type === 'food' ? '🍽️' :
    type === 'attraction' ? '📸' :
    type === 'cultural' ? '🏛️' :
    type === 'nature' ? '🌿' :
    type === 'parking' ? '🅿️' :
    type === 'train' ? '🚂' :
    type === 'activity' ? '🎯' :
    type === 'nightlife' ? '🎵' :
    type === 'shopping' ? '🛍️' : '📌';

  return L.divIcon({
    className: 'custom-detail-marker',
    html: `<div style="
      width: 32px; height: 32px; border-radius: 50%;
      background: ${color}; border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px;
    ">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : (result >> 1);
    shift = 0; result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : (result >> 1);
    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

function FitToRoute({ routePoints, destLat, destLng }: { routePoints: [number, number][] | null; destLat: number; destLng: number }) {
  const map = useMap();
  useEffect(() => {
    if (routePoints && routePoints.length > 0) {
      map.fitBounds(L.latLngBounds(routePoints), { padding: [40, 40] });
    } else {
      map.setView([destLat, destLng], 10);
    }
  }, [routePoints, destLat, destLng, map]);
  return null;
}

interface Highlight {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  address?: string | null;
  websiteUrl?: string | null;
  rating?: number | null;
  priceLevel?: number | null;
  lat?: number | null;
  lng?: number | null;
}

interface DestinationDetailMapProps {
  destinationId: string;
  destinationName: string;
  destLat: number;
  destLng: number;
  highlights: Highlight[];
}

export function DestinationDetailMap({
  destinationId, destinationName, destLat, destLng, highlights,
}: DestinationDetailMapProps) {
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    restaurants: true, attractions: true, transport: true,
  });

  const { data: routeData } = useQuery({
    queryKey: ['destination-route', destinationId],
    queryFn: () => getDestinationRoute({ data: { destinationId, destLat, destLng } }),
  });

  const routePoints = useMemo(() => {
    if (!routeData?.polyline) return null;
    return decodePolyline(routeData.polyline);
  }, [routeData?.polyline]);

  const mappableHighlights = highlights.filter(h => h.lat && h.lng);
  const restaurants = mappableHighlights.filter(h => h.category === 'food');
  const attractions = mappableHighlights.filter(h =>
    ['attraction', 'cultural', 'nature', 'activity', 'nightlife', 'shopping'].includes(h.category || '')
  );
  const transport = mappableHighlights.filter(h =>
    ['parking', 'train'].includes(h.category || '')
  );

  const toggleLayer = (layer: string) => setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const renderPopup = (h: Highlight, typeLabel: string) => (
    <Popup>
      <div className="min-w-[160px]">
        <h3 className="font-bold text-sm">{h.title}</h3>
        <p className="text-xs text-gray-500">{typeLabel}</p>
        {h.description && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{h.description}</p>}
        {h.address && <p className="text-xs text-gray-500 mt-1">📍 {h.address}</p>}
        {h.rating && <p className="text-xs text-yellow-600">⭐ {h.rating}</p>}
        {h.websiteUrl && (
          <a href={h.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1 block">
            View details →
          </a>
        )}
      </div>
    </Popup>
  );

  return (
    <div className="relative rounded-xl overflow-hidden border border-ody-border-subtle">
      <div className="h-[400px]">
        <MapContainer center={[destLat, destLng]} zoom={10} className="h-full w-full" style={{ background: '#0a0a0f' }}>
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <FitToRoute routePoints={routePoints} destLat={destLat} destLng={destLng} />

          {routePoints && (
            <Polyline positions={routePoints} pathOptions={{ color: '#8b5cf6', weight: 4, opacity: 0.8 }} />
          )}

          <Marker position={[VICENZA_LAT, VICENZA_LNG]} icon={createPinIcon('home')}>
            <Popup>
              <div className="min-w-[160px]">
                <h3 className="font-bold text-sm">🏠 Home Base</h3>
                <p className="text-xs text-gray-600">Contrà S. Rocco 60, Vicenza</p>
              </div>
            </Popup>
          </Marker>

          <Marker position={[destLat, destLng]} icon={createPinIcon('destination')}>
            <Popup>
              <div className="min-w-[160px]">
                <h3 className="font-bold text-sm">📍 {destinationName}</h3>
                {routeData && (
                  <div className="text-xs text-gray-600 mt-1">
                    {routeData.distanceKm && <div>📏 {routeData.distanceKm.toFixed(1)} km</div>}
                    {routeData.durationMinutes && <div>⏱ {formatDuration(routeData.durationMinutes)}</div>}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>

          {activeLayers.restaurants && restaurants.map(h => (
            <Marker key={h.id} position={[h.lat!, h.lng!]} icon={createPinIcon('food')}>
              {renderPopup(h, 'Restaurant')}
            </Marker>
          ))}

          {activeLayers.attractions && attractions.map(h => (
            <Marker key={h.id} position={[h.lat!, h.lng!]} icon={createPinIcon(h.category || 'attraction')}>
              {renderPopup(h, h.category || 'Attraction')}
            </Marker>
          ))}

          {activeLayers.transport && transport.map(h => (
            <Marker key={h.id} position={[h.lat!, h.lng!]} icon={createPinIcon(h.category || 'train')}>
              {renderPopup(h, h.category === 'parking' ? 'Parking' : 'Train Station')}
            </Marker>
          ))}
        </MapContainer>
      </div>

      {routeData && (routeData.distanceKm || routeData.durationMinutes) && (
        <div className="absolute top-3 right-3 z-[1000] bg-ody-surface/90 backdrop-blur-sm rounded-lg border border-ody-border-subtle p-3 shadow-lg">
          <div className="text-xs text-ody-text-dim mb-1 flex items-center gap-1">
            <Navigation size={12} className="text-ody-accent" /> From Vicenza
          </div>
          <div className="flex items-center gap-3">
            {routeData.durationMinutes && (
              <div className="flex items-center gap-1">
                <Clock size={14} className="text-ody-accent" />
                <span className="text-sm font-semibold">{formatDuration(routeData.durationMinutes)}</span>
              </div>
            )}
            {routeData.distanceKm && (
              <div className="flex items-center gap-1">
                <MapPin size={14} className="text-ody-accent" />
                <span className="text-sm font-semibold">{routeData.distanceKm.toFixed(1)} km</span>
              </div>
            )}
          </div>
        </div>
      )}

      {mappableHighlights.length > 0 && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-ody-surface/90 backdrop-blur-sm rounded-lg border border-ody-border-subtle p-2 shadow-lg">
          <div className="flex items-center gap-1 text-xs text-ody-text-dim mb-1.5">
            <Layers size={12} /> Layers
          </div>
          <div className="flex flex-col gap-1">
            {restaurants.length > 0 && (
              <button onClick={() => toggleLayer('restaurants')}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${activeLayers.restaurants ? 'bg-orange-500/20 text-orange-400' : 'text-ody-text-dim hover:bg-ody-surface-hover'}`}>
                <Utensils size={12} /> Restaurants ({restaurants.length})
              </button>
            )}
            {attractions.length > 0 && (
              <button onClick={() => toggleLayer('attractions')}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${activeLayers.attractions ? 'bg-purple-500/20 text-purple-400' : 'text-ody-text-dim hover:bg-ody-surface-hover'}`}>
                <Camera size={12} /> Attractions ({attractions.length})
              </button>
            )}
            {transport.length > 0 && (
              <button onClick={() => toggleLayer('transport')}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${activeLayers.transport ? 'bg-blue-500/20 text-blue-400' : 'text-ody-text-dim hover:bg-ody-surface-hover'}`}>
                <TrainFront size={12} /> Transport ({transport.length})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
