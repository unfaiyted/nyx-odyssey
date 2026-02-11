import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Trash2, Navigation, CheckCircle, Bookmark, Search, Camera, ExternalLink, Eye } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import type { TripDestination, ResearchStatus } from '../../types/trips';

interface Props {
  destination: TripDestination;
  index: number;
  baseLat?: number | null;
  baseLng?: number | null;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
  onResearchStatusChange?: (id: string, researchStatus: ResearchStatus) => void;
  onPhotoChange?: (id: string, photoUrl: string) => void;
  research?: { description?: boolean; highlights?: number; weather?: boolean; accommodations?: number; transport?: boolean; photos?: boolean } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Search; bg: string }> = {
  researched: { label: 'Researched', color: 'text-ody-info', icon: Search, bg: 'bg-ody-info/15' },
  booked: { label: 'Booked', color: 'text-ody-warning', icon: Bookmark, bg: 'bg-ody-warning/15' },
  visited: { label: 'Visited', color: 'text-ody-success', icon: CheckCircle, bg: 'bg-ody-success/15' },
};

const RESEARCH_STATUS_CONFIG: Record<ResearchStatus, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  not_started: { label: 'Not Started', emoji: '⬜', color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/30' },
  basic: { label: 'Basic', emoji: '🟡', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
  fully_researched: { label: 'Fully Researched', emoji: '🟢', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' },
  booked: { label: 'Booked', emoji: '✅', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
};

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(miles: number): string {
  if (miles < 1) return `${Math.round(miles * 5280)} ft`;
  if (miles < 100) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles).toLocaleString()} mi`;
}

/** Calculate research completeness based on available data sections */
export function calcResearchProgress(dest: TripDestination, research?: Props['research'] | null): { filled: number; total: number } {
  const total = 6;
  let filled = 0;
  if (dest.description) filled++;
  if (research) {
    if (research.highlights && research.highlights > 0) filled++;
    if (research.weather) filled++;
    if (research.accommodations && research.accommodations > 0) filled++;
    if (research.transport) filled++;
    if (research.photos) filled++;
  }
  return { filled, total };
}

const PLACEHOLDER_PHOTOS = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&h=400&fit=crop',
];

export function DestinationCard({ destination, index, baseLat, baseLng, onDelete, onStatusChange, onResearchStatusChange, onPhotoChange, research }: Props) {
  const [showPhotoEdit, setShowPhotoEdit] = useState(false);
  const [photoInput, setPhotoInput] = useState('');
  const status = destination.status || 'researched';
  const researchStatus = (destination.researchStatus || 'not_started') as ResearchStatus;
  const researchConfig = RESEARCH_STATUS_CONFIG[researchStatus] || RESEARCH_STATUS_CONFIG.not_started;
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.researched;
  const StatusIcon = config.icon;

  const distance =
    destination.lat && destination.lng && baseLat && baseLng
      ? haversineDistance(baseLat, baseLng, destination.lat, destination.lng)
      : null;

  const photoUrl = destination.photoUrl || PLACEHOLDER_PHOTOS[index % PLACEHOLDER_PHOTOS.length];
  const statusOptions = ['researched', 'booked', 'visited'];
  const progress = calcResearchProgress(destination, research);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 300, damping: 30 }}
      className="group relative overflow-hidden rounded-xl border border-ody-border bg-ody-surface hover:border-ody-accent/40 transition-all duration-300"
    >
      {/* Photo section */}
      <div className="relative h-44 overflow-hidden">
        <img src={photoUrl} alt={destination.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-ody-bg/90 via-ody-bg/30 to-transparent" />

        {/* Research status badge */}
        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${researchConfig.bg} ${researchConfig.color} backdrop-blur-sm border ${researchConfig.border}`}>
          <span>{researchConfig.emoji}</span>
          {researchConfig.label}
        </div>

        {/* Order badge */}
        <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-ody-accent/90 text-white flex items-center justify-center text-xs font-bold backdrop-blur-sm">
          {index + 1}
        </div>

        {onPhotoChange && (
          <button onClick={() => { setPhotoInput(destination.photoUrl || ''); setShowPhotoEdit(true); }}
            className="absolute top-3 right-12 w-7 h-7 rounded-full bg-black/50 text-white/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:text-white" title="Change photo">
            <Camera size={12} />
          </button>
        )}

        <Link to="/destination/$destinationId" params={{ destinationId: destination.id }}
          className="absolute top-3 right-20 w-7 h-7 rounded-full bg-black/50 text-white/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:text-white" title="View details">
          <Eye size={12} />
        </Link>

        <div className="absolute bottom-3 left-3 right-3">
          <Link to="/destination/$destinationId" params={{ destinationId: destination.id }}
            className="font-semibold text-white text-lg leading-tight drop-shadow-lg hover:text-ody-accent transition-colors">
            {destination.name}
          </Link>
        </div>
      </div>

      {/* Photo URL editor */}
      <AnimatePresence>
        {showPhotoEdit && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-4 pt-3 overflow-hidden">
            <div className="flex gap-2">
              <input value={photoInput} onChange={(e) => setPhotoInput(e.target.value)} placeholder="Photo URL..."
                className="flex-1 bg-ody-bg border border-ody-border rounded-md px-2 py-1 text-xs outline-none focus:border-ody-accent" />
              <button onClick={() => { onPhotoChange?.(destination.id, photoInput); setShowPhotoEdit(false); }}
                className="px-2 py-1 rounded-md bg-ody-accent text-white text-xs hover:bg-ody-accent-hover">Save</button>
              <button onClick={() => setShowPhotoEdit(false)}
                className="px-2 py-1 rounded-md border border-ody-border text-xs hover:bg-ody-surface-hover">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info section */}
      <div className="p-4 space-y-3">
        {destination.description && (
          <p className="text-sm text-ody-text-muted line-clamp-2">{destination.description}</p>
        )}

        {/* Research progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-ody-text-dim">
            <span>{progress.filled}/{progress.total} sections filled</span>
            {destination.lastResearchedAt && (
              <span>Last: {new Date(destination.lastResearchedAt).toLocaleDateString()}</span>
            )}
          </div>
          <div className="h-1.5 bg-ody-bg rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                progress.filled === progress.total ? 'bg-emerald-400' :
                progress.filled >= progress.total / 2 ? 'bg-amber-400' : 'bg-gray-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${(progress.filled / progress.total) * 100}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-ody-text-dim">
          <div className="flex items-center gap-3">
            {distance !== null && (
              <span className="flex items-center gap-1">
                <Navigation size={11} className="text-ody-accent" />
                {formatDistance(distance)}
              </span>
            )}
            {destination.lat && destination.lng && (
              <a href={`https://www.google.com/maps/search/?api=1&query=${destination.lat},${destination.lng}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-ody-accent transition-colors" title="Open in Google Maps">
                <MapPin size={11} />
                {destination.lat.toFixed(2)}, {destination.lng.toFixed(2)}
                <ExternalLink size={9} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            )}
          </div>
          {destination.arrivalDate && (
            <span className="text-ody-text-muted">
              {destination.arrivalDate}{destination.departureDate ? ` → ${destination.departureDate}` : ''}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-ody-border-subtle">
          <div className="flex items-center gap-1">
            {statusOptions.map((s) => {
              const c = STATUS_CONFIG[s];
              const Icon = c.icon;
              const isActive = status === s;
              return (
                <button key={s} onClick={() => onStatusChange?.(destination.id, s)} title={c.label}
                  className={`p-1.5 rounded-md transition-colors ${isActive ? `${c.bg} ${c.color}` : 'text-ody-text-dim hover:text-ody-text-muted hover:bg-ody-surface-hover'}`}>
                  <Icon size={14} />
                </button>
              );
            })}
          </div>
          {onDelete && (
            <button onClick={() => onDelete(destination.id)}
              className="p-1.5 rounded-md text-ody-text-dim hover:text-ody-danger hover:bg-ody-danger/10 transition-colors">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
