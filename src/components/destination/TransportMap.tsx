import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

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

// Default home base fallback
const DEFAULT_HOME_BASE = {
  lat: 45.5485,
  lng: 11.5479,
  name: 'Vicenza (Home)',
  address: 'Contrà S. Rocco #60',
};

interface HomeBase {
  lat: number;
  lng: number;
  name: string;
  address?: string;
}

// Custom icons
const homeIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 32px; height: 32px; border-radius: 50%;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  ">🏠</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const destinationIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 32px; height: 32px; border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  ">📍</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Decode Google polyline
function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

function FitBounds({ 
  homeBase, 
  destination 
}: { 
  homeBase: HomeBase; 
  destination: { lat: number; lng: number }; 
}) {
  const map = useMap();
  
  useEffect(() => {
    const bounds = L.latLngBounds([
      [homeBase.lat, homeBase.lng],
      [destination.lat, destination.lng],
    ]);
    map.fitBounds(bounds, { padding: [80, 80], maxZoom: 12 });
  }, [homeBase, destination, map]);

  return null;
}

function DistanceLabel({ 
  from, 
  to, 
  distanceKm 
}: { 
  from: { lat: number; lng: number }; 
  to: { lat: number; lng: number }; 
  distanceKm: number | null;
}) {
  const map = useMap();
  
  useEffect(() => {
    if (!distanceKm) return;
    
    const midLat = (from.lat + to.lat) / 2;
    const midLng = (from.lng + to.lng) / 2;
    
    const label = L.divIcon({
      className: 'distance-label',
      html: `<div style="
        background: rgba(139, 92, 246, 0.9);
        color: white;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.2);
      ">${distanceKm.toFixed(1)} km</div>`,
      iconSize: [80, 24],
      iconAnchor: [40, 12],
    });
    
    const marker = L.marker([midLat, midLng], { icon: label, interactive: false }).addTo(map);
    
    return () => {
      map.removeLayer(marker);
    };
  }, [from, to, distanceKm, map]);

  return null;
}

interface TransportMapProps {
  destinationLat: number;
  destinationLng: number;
  destinationName: string;
  polyline?: string | null;
  distanceKm?: number | null;
  homeBase?: HomeBase | null;
  className?: string;
}

export function TransportMap({
  destinationLat,
  destinationLng,
  destinationName,
  polyline,
  distanceKm,
  homeBase: homeBaseProp,
  className = '',
}: TransportMapProps) {
  const homeBase = homeBaseProp || DEFAULT_HOME_BASE;

  const routePoints = useMemo(() => {
    if (polyline) {
      return decodePolyline(polyline);
    }
    return [[homeBase.lat, homeBase.lng], [destinationLat, destinationLng]] as [number, number][];
  }, [polyline, homeBase.lat, homeBase.lng, destinationLat, destinationLng]);

  const center: [number, number] = [
    (homeBase.lat + destinationLat) / 2,
    (homeBase.lng + destinationLng) / 2,
  ];

  return (
    <div className={`relative rounded-xl overflow-hidden border border-ody-border ${className}`}>
      <MapContainer
        center={center}
        zoom={8}
        className="h-full w-full"
        style={{ background: '#0a0a0f', minHeight: '300px' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <FitBounds 
          homeBase={homeBase} 
          destination={{ lat: destinationLat, lng: destinationLng }} 
        />

        {/* Route line */}
        <Polyline
          positions={routePoints}
          pathOptions={{
            color: '#8b5cf6',
            weight: 4,
            opacity: 0.8,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />

        {/* Distance label */}
        <DistanceLabel
          from={{ lat: homeBase.lat, lng: homeBase.lng }}
          to={{ lat: destinationLat, lng: destinationLng }}
          distanceKm={distanceKm}
        />

        {/* Home base marker */}
        <Marker position={[homeBase.lat, homeBase.lng]} icon={homeIcon}>
          <Popup>
            <div className="min-w-[160px]">
              <h3 className="font-bold text-sm">{homeBase.name}</h3>
              {homeBase.address && <p className="text-xs text-gray-500">{homeBase.address}</p>}
              <p className="text-xs text-green-600 mt-1">🏠 Home Base</p>
            </div>
          </Popup>
        </Marker>

        {/* Destination marker */}
        <Marker position={[destinationLat, destinationLng]} icon={destinationIcon}>
          <Popup>
            <div className="min-w-[160px]">
              <h3 className="font-bold text-sm">{destinationName}</h3>
              <p className="text-xs text-gray-500">📍 Destination</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Legend overlay */}
      <div className="absolute bottom-3 left-3 bg-ody-surface/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs border border-ody-border-subtle">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-ody-text-muted">{homeBase.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-ody-accent"></span>
          <span className="text-ody-text-muted">{destinationName}</span>
        </div>
      </div>
    </div>
  );
}
