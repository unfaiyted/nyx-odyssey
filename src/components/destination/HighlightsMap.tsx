import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from '@tanstack/react-router';
import { Star, Clock, MapPin, Hotel, Calendar } from 'lucide-react';

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

// Category color mapping
const CATEGORY_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  attraction: { bg: '#6366f1', border: '#4f46e5', label: 'Attractions' },
  food: { bg: '#f97316', border: '#ea580c', label: 'Food & Drink' },
  activity: { bg: '#22c55e', border: '#16a34a', label: 'Activities' },
  nightlife: { bg: '#a855f7', border: '#9333ea', label: 'Nightlife' },
  shopping: { bg: '#ec4899', border: '#db2777', label: 'Shopping' },
  nature: { bg: '#10b981', border: '#059669', label: 'Nature' },
  cultural: { bg: '#f59e0b', border: '#d97706', label: 'Cultural' },
  accommodation: { bg: '#06b6d4', border: '#0891b2', label: 'Accommodations' },
  event: { bg: '#e11d48', border: '#be123c', label: 'Events' },
};

function createColoredIcon(color: string, borderColor: string): L.DivIcon {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50% 50% 50% 0;
      background: ${color}; border: 2px solid ${borderColor};
      transform: rotate(-45deg); position: relative; top: -14px; left: -4px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    "><div style="
      width: 10px; height: 10px; border-radius: 50%;
      background: white; position: absolute;
      top: 50%; left: 50%; transform: translate(-50%, -50%);
    "></div></div>`,
    iconSize: [20, 28],
    iconAnchor: [10, 28],
    popupAnchor: [0, -28],
  });
}

interface Highlight {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  rating?: number | null;
  priceLevel?: number | null;
  lat?: number | null;
  lng?: number | null;
  address?: string | null;
  duration?: string | null;
  imageUrl?: string | null;
}

interface Accommodation {
  id: string;
  name: string;
  type?: string | null;
  status?: string | null;
  address?: string | null;
  rating?: number | null;
  checkIn?: string | null;
  checkOut?: string | null;
  lat?: number | null;
  lng?: number | null;
}

interface EventItem {
  id: string;
  name: string;
  eventType?: string | null;
  venue?: string | null;
  venueAddress?: string | null;
  startDate?: string | null;
  lat?: number | null;
  lng?: number | null;
}

interface HighlightsMapProps {
  highlights: Highlight[];
  accommodations?: Accommodation[];
  events?: EventItem[];
  destinationLat?: number | null;
  destinationLng?: number | null;
  destinationName?: string; // reserved for future tooltip
  className?: string;
}

function FitBounds({ markers }: { markers: Array<{ lat: number; lng: number }> }) {
  const map = useMap();
  useMemo(() => {
    if (markers.length === 0) return;
    const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [markers, map]);
  return null;
}

export function HighlightsMap({
  highlights,
  accommodations = [],
  events = [],
  destinationLat,
  destinationLng,
  destinationName: _destinationName,
  className = '',
}: HighlightsMapProps) {
  // Collect all markers with coordinates
  const allMarkers = useMemo(() => {
    const markers: Array<{ lat: number; lng: number; type: string; category: string; data: any }> = [];

    for (const h of highlights) {
      if (h.lat && h.lng) {
        markers.push({
          lat: h.lat,
          lng: h.lng,
          type: 'highlight',
          category: h.category || 'attraction',
          data: h,
        });
      }
    }

    for (const a of accommodations) {
      if ((a as any).lat && (a as any).lng) {
        markers.push({
          lat: (a as any).lat,
          lng: (a as any).lng,
          type: 'accommodation',
          category: 'accommodation',
          data: a,
        });
      }
    }

    for (const e of events) {
      if ((e as any).lat && (e as any).lng) {
        markers.push({
          lat: (e as any).lat,
          lng: (e as any).lng,
          type: 'event',
          category: 'event',
          data: e,
        });
      }
    }

    return markers;
  }, [highlights, accommodations, events]);

  // If no markers at all, use destination center
  const center: [number, number] = useMemo(() => {
    if (allMarkers.length > 0) {
      const avgLat = allMarkers.reduce((s, m) => s + m.lat, 0) / allMarkers.length;
      const avgLng = allMarkers.reduce((s, m) => s + m.lng, 0) / allMarkers.length;
      return [avgLat, avgLng];
    }
    if (destinationLat && destinationLng) return [destinationLat, destinationLng];
    return [41.9028, 12.4964]; // Rome fallback
  }, [allMarkers, destinationLat, destinationLng]);

  // Get active categories for legend
  const activeCategories = useMemo(() => {
    const cats = new Set(allMarkers.map(m => m.category));
    return Array.from(cats);
  }, [allMarkers]);

  if (allMarkers.length === 0) {
    return (
      <div className={`glass-card p-8 text-center text-ody-text-muted ${className}`}>
        <MapPin size={32} className="mx-auto mb-2 opacity-50" />
        <p>No locations with coordinates to display on the map.</p>
      </div>
    );
  }

  return (
    <div className={`glass-card overflow-hidden ${className}`}>
      {/* Legend */}
      <div className="flex flex-wrap gap-2 p-3 border-b border-ody-border-subtle bg-ody-surface/50">
        {activeCategories.map(cat => {
          const config = CATEGORY_COLORS[cat] || CATEGORY_COLORS.attraction;
          const count = allMarkers.filter(m => m.category === cat).length;
          return (
            <span key={cat} className="flex items-center gap-1.5 text-xs text-ody-text-muted">
              <span
                className="w-3 h-3 rounded-full border"
                style={{ backgroundColor: config.bg, borderColor: config.border }}
              />
              {config.label} ({count})
            </span>
          );
        })}
      </div>

      {/* Map */}
      <div className="h-[400px]">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <FitBounds markers={allMarkers} />

          {allMarkers.map((marker, i) => {
            const catConfig = CATEGORY_COLORS[marker.category] || CATEGORY_COLORS.attraction;
            const icon = createColoredIcon(catConfig.bg, catConfig.border);

            return (
              <Marker key={`${marker.type}-${marker.data.id}-${i}`} position={[marker.lat, marker.lng]} icon={icon}>
                <Popup>
                  <MarkerPopup marker={marker} />
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

function MarkerPopup({ marker }: { marker: { type: string; category: string; data: any } }) {
  const { type, data } = marker;

  if (type === 'highlight') {
    return (
      <div className="min-w-[200px] max-w-[280px]">
        {data.imageUrl && (
          <img src={data.imageUrl} alt={data.title} className="w-full h-24 object-cover rounded-t-lg -mt-[14px] -mx-[14px] mb-2" style={{ width: 'calc(100% + 28px)' }} />
        )}
        <Link to="/highlight/$highlightId" params={{ highlightId: data.id }} className="font-semibold text-sm text-blue-600 hover:underline block">
          {data.title}
        </Link>
        {data.description && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{data.description}</p>}
        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
          {data.rating && (
            <span className="flex items-center gap-0.5">
              <Star size={10} className="text-amber-500" /> {data.rating}
            </span>
          )}
          {data.duration && (
            <span className="flex items-center gap-0.5">
              <Clock size={10} /> {data.duration}
            </span>
          )}
        </div>
        {data.address && <p className="text-xs text-gray-400 mt-1 flex items-center gap-0.5"><MapPin size={10} /> {data.address}</p>}
      </div>
    );
  }

  if (type === 'accommodation') {
    return (
      <div className="min-w-[180px]">
        <Link to="/accommodation/$accommodationId" params={{ accommodationId: data.id }} className="font-semibold text-sm text-blue-600 hover:underline flex items-center gap-1">
          <Hotel size={12} /> {data.name}
        </Link>
        <div className="text-xs text-gray-500 mt-1">
          {data.type && <span className="capitalize">{data.type}</span>}
          {data.checkIn && <span className="ml-2">{data.checkIn} → {data.checkOut}</span>}
        </div>
        {data.address && <p className="text-xs text-gray-400 mt-1"><MapPin size={10} className="inline" /> {data.address}</p>}
      </div>
    );
  }

  if (type === 'event') {
    return (
      <div className="min-w-[180px]">
        <Link to="/event/$eventId" params={{ eventId: data.id }} className="font-semibold text-sm text-blue-600 hover:underline flex items-center gap-1">
          <Calendar size={12} /> {data.name}
        </Link>
        <div className="text-xs text-gray-500 mt-1">
          {data.eventType && <span className="capitalize">{data.eventType}</span>}
          {data.startDate && <span className="ml-2">{data.startDate}</span>}
        </div>
        {data.venue && <p className="text-xs text-gray-400 mt-1">{data.venue}</p>}
      </div>
    );
  }

  return null;
}
