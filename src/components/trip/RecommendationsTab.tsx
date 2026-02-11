import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ThumbsUp, ThumbsDown, HelpCircle, MapPin, Info, ChevronDown, ChevronUp,
  Filter, CheckSquare, Square, ExternalLink, Eye, Navigation, Calendar
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import type { TripRecommendation, TripDestination, RecommendationStatus } from '../../types/trips';
import { 
  updateRecommendationStatus, 
  addRecommendationToItinerary,
  linkRecommendationToDestination 
} from '../../server/trip-recommendations';

interface Props {
  tripId: string;
  items: TripRecommendation[];
  destinations: TripDestination[];
  homeBaseLat?: number | null;
  homeBaseLng?: number | null;
}

// Vicenza home base coordinates (default)
const VICENZA_LAT = 45.5455;
const VICENZA_LNG = 11.5354;

const STATUS_CONFIG: Record<RecommendationStatus, { 
  label: string; 
  emoji: string;
  color: string; 
  bg: string;
  border: string;
}> = {
  pending: { 
    label: 'Pending', 
    emoji: '⏳',
    color: 'text-ody-text-muted', 
    bg: 'bg-ody-text-muted/10',
    border: 'border-ody-text-muted/30'
  },
  maybe: { 
    label: 'Maybe', 
    emoji: '🤔',
    color: 'text-ody-warning', 
    bg: 'bg-ody-warning/10',
    border: 'border-ody-warning/30'
  },
  approved: { 
    label: 'Approved', 
    emoji: '✅',
    color: 'text-ody-success', 
    bg: 'bg-ody-success/10',
    border: 'border-ody-success/30'
  },
  booked: { 
    label: 'Booked', 
    emoji: '📅',
    color: 'text-ody-accent', 
    bg: 'bg-ody-accent/10',
    border: 'border-ody-accent/30'
  },
  'no-go': { 
    label: 'No-Go', 
    emoji: '❌',
    color: 'text-ody-danger', 
    bg: 'bg-ody-danger/10',
    border: 'border-ody-danger/30'
  },
};

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // miles
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

function parseDistanceFromLogistics(logistics: string | null): string | null {
  if (!logistics) return null;
  try {
    const parsed = JSON.parse(logistics);
    if (parsed.distance) return parsed.distance;
    if (parsed.driving) return parsed.driving;
    if (parsed.duration) return parsed.duration;
  } catch {
    // Try regex matching for distance patterns
    const distanceMatch = logistics.match(/(\d+\s*(?:min|hr|hour|km|mi|miles?))/i);
    if (distanceMatch) return distanceMatch[1];
  }
  return null;
}

export function RecommendationsTab({ tripId, items, destinations, homeBaseLat, homeBaseLng }: Props) {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<RecommendationStatus | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showAddToItineraryModal, setShowAddToItineraryModal] = useState<string | null>(null);
  const [itineraryDates, setItineraryDates] = useState({ arrivalDate: '', departureDate: '' });

  const baseLat = homeBaseLat ?? VICENZA_LAT;
  const baseLng = homeBaseLng ?? VICENZA_LNG;

  const filteredItems = useMemo(() => {
    if (filterStatus === 'all') return items;
    return items.filter(item => item.status === filterStatus);
  }, [items, filterStatus]);

  const statusCount = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    items.forEach(item => {
      counts[item.status] = (counts[item.status] || 0) + 1;
    });
    return counts;
  }, [items]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RecommendationStatus }) => 
      updateRecommendationStatus({ data: { id, tripId, status } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const approveAndAddMutation = useMutation({
    mutationFn: ({ id, arrivalDate, departureDate }: { id: string; arrivalDate?: string; departureDate?: string }) => 
      addRecommendationToItinerary({ data: { id, tripId, arrivalDate, departureDate } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      setShowAddToItineraryModal(null);
      setItineraryDates({ arrivalDate: '', departureDate: '' });
    },
  });

  const bulkUpdateStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: RecommendationStatus }) => {
      await Promise.all(ids.map(id => updateRecommendationStatus({ data: { id, tripId, status } })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      setSelectedIds(new Set());
    },
  });

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleApprove = (rec: TripRecommendation) => {
    if (rec.destinationId) {
      // Already linked to destination, just update status
      updateStatusMutation.mutate({ id: rec.id, status: 'approved' });
    } else {
      // Show modal to add to itinerary
      setShowAddToItineraryModal(rec.id);
    }
  };

  const handleConfirmAddToItinerary = () => {
    if (showAddToItineraryModal) {
      approveAndAddMutation.mutate({
        id: showAddToItineraryModal,
        arrivalDate: itineraryDates.arrivalDate || undefined,
        departureDate: itineraryDates.departureDate || undefined,
      });
    }
  };

  const selectAllFiltered = () => {
    const newSelected = new Set(selectedIds);
    filteredItems.forEach(item => newSelected.add(item.id));
    setSelectedIds(newSelected);
  };

  const clearSelection = () => setSelectedIds(new Set());

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">Recommendations</h3>
          <span className="text-sm text-ody-text-dim">({items.length})</span>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 flex-wrap">
          <Filter size={14} className="text-ody-text-dim mr-1" />
          {(['all', 'pending', 'maybe', 'approved', 'booked', 'no-go'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-ody-accent/20 text-ody-accent'
                  : 'text-ody-text-dim hover:text-ody-text-muted hover:bg-ody-surface-hover'
              }`}
            >
              {status === 'all' ? 'All' : STATUS_CONFIG[status].emoji} {statusCount[status] || 0}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-ody-accent/10 border border-ody-accent/30"
        >
          <span className="text-sm font-medium text-ody-accent">
            {selectedIds.size} selected
          </span>
          <div className="flex-1" />
          <button
            onClick={() => bulkUpdateStatusMutation.mutate({ ids: Array.from(selectedIds), status: 'approved' })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-ody-success/20 text-ody-success text-sm hover:bg-ody-success/30 transition-colors"
          >
            <ThumbsUp size={14} /> Approve
          </button>
          <button
            onClick={() => bulkUpdateStatusMutation.mutate({ ids: Array.from(selectedIds), status: 'no-go' })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-ody-danger/20 text-ody-danger text-sm hover:bg-ody-danger/30 transition-colors"
          >
            <ThumbsDown size={14} /> Decline
          </button>
          <button
            onClick={() => bulkUpdateStatusMutation.mutate({ ids: Array.from(selectedIds), status: 'maybe' })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-ody-warning/20 text-ody-warning text-sm hover:bg-ody-warning/30 transition-colors"
          >
            <HelpCircle size={14} /> Maybe
          </button>
          <button
            onClick={clearSelection}
            className="px-3 py-1.5 rounded-md text-ody-text-dim text-sm hover:text-ody-text-muted transition-colors"
          >
            Clear
          </button>
        </motion.div>
      )}

      {/* Select all / bulk controls */}
      {filteredItems.length > 0 && (
        <div className="flex items-center gap-3">
          <button
            onClick={selectAllFiltered}
            className="flex items-center gap-1.5 text-xs text-ody-text-dim hover:text-ody-text-muted transition-colors"
          >
            <CheckSquare size={14} /> Select all filtered
          </button>
          {selectedIds.size > 0 && (
            <button
              onClick={clearSelection}
              className="flex items-center gap-1.5 text-xs text-ody-text-dim hover:text-ody-text-muted transition-colors"
            >
              <Square size={14} /> Deselect all
            </button>
          )}
        </div>
      )}

      {/* Recommendations grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 text-ody-text-muted">
          <p>No recommendations found.</p>
          {filterStatus !== 'all' && (
            <button
              onClick={() => setFilterStatus('all')}
              className="text-ody-accent hover:underline mt-2 text-sm"
            >
              Clear filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredItems.map((rec, index) => (
            <RecommendationCard
              key={rec.id}
              rec={rec}
              index={index}
              baseLat={baseLat}
              baseLng={baseLng}
              isSelected={selectedIds.has(rec.id)}
              isExpanded={expandedIds.has(rec.id)}
              onToggleSelect={() => toggleSelection(rec.id)}
              onToggleExpand={() => toggleExpanded(rec.id)}
              onApprove={() => handleApprove(rec)}
              onDecline={() => updateStatusMutation.mutate({ id: rec.id, status: 'no-go' })}
              onMaybe={() => updateStatusMutation.mutate({ id: rec.id, status: 'maybe' })}
              updateStatusMutation={updateStatusMutation}
            />
          ))}
        </div>
      )}

      {/* Add to Itinerary Modal */}
      <AnimatePresence>
        {showAddToItineraryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddToItineraryModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-ody-surface rounded-xl border border-ody-border p-6 max-w-md w-full space-y-4"
            >
              <h3 className="text-lg font-semibold">Add to Itinerary</h3>
              <p className="text-sm text-ody-text-muted">
                This will create a destination from this recommendation and add it to your itinerary.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-ody-text-dim mb-1">Arrival Date (optional)</label>
                  <input
                    type="date"
                    value={itineraryDates.arrivalDate}
                    onChange={(e) => setItineraryDates(p => ({ ...p, arrivalDate: e.target.value }))}
                    className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-ody-text-dim mb-1">Departure Date (optional)</label>
                  <input
                    type="date"
                    value={itineraryDates.departureDate}
                    onChange={(e) => setItineraryDates(p => ({ ...p, departureDate: e.target.value }))}
                    className="w-full bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleConfirmAddToItinerary}
                  disabled={approveAndAddMutation.isPending}
                  className="flex-1 px-4 py-2 rounded-lg bg-ody-accent text-white text-sm hover:bg-ody-accent-hover disabled:opacity-50 transition-colors"
                >
                  {approveAndAddMutation.isPending ? 'Adding...' : 'Add to Itinerary'}
                </button>
                <button
                  onClick={() => setShowAddToItineraryModal(null)}
                  className="px-4 py-2 rounded-lg border border-ody-border text-sm hover:bg-ody-surface-hover transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Individual recommendation card component
interface RecommendationCardProps {
  rec: TripRecommendation;
  index: number;
  baseLat: number;
  baseLng: number;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelect: () => void;
  onToggleExpand: () => void;
  onApprove: () => void;
  onDecline: () => void;
  onMaybe: () => void;
  updateStatusMutation: ReturnType<typeof useMutation>;
}

function RecommendationCard({
  rec, index, baseLat, baseLng, isSelected, isExpanded,
  onToggleSelect, onToggleExpand, onApprove, onDecline, onMaybe, updateStatusMutation
}: RecommendationCardProps) {
  const status = rec.status || 'pending';
  const config = STATUS_CONFIG[status];

  // Calculate or parse distance
  const distance = useMemo(() => {
    if (rec.homeBaseLat && rec.homeBaseLng) {
      return haversineDistance(baseLat, baseLng, rec.homeBaseLat, rec.homeBaseLng);
    }
    const parsedDist = parseDistanceFromLogistics(rec.logistics);
    if (parsedDist) return parsedDist;
    return null;
  }, [rec.homeBaseLat, rec.homeBaseLng, rec.logistics, baseLat, baseLng]);

  // Parse highlights from whySpecial
  const highlights = useMemo(() => {
    if (!rec.whySpecial) return [];
    try {
      const parsed = JSON.parse(rec.whySpecial);
      return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
    } catch {
      return [];
    }
  }, [rec.whySpecial]);

  // Parse pro tips
  const proTips = useMemo(() => {
    if (!rec.proTips) return [];
    try {
      const parsed = JSON.parse(rec.proTips);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [rec.proTips]);

  // Parse events
  const events = useMemo(() => {
    if (!rec.events) return [];
    try {
      const parsed = JSON.parse(rec.events);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [rec.events]);

  // Screenshot URL
  const screenshotUrl = rec.screenshotPath 
    ? `/recommendations/${rec.screenshotPath.split('/').pop()}` 
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 30 }}
      className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${
        isSelected 
          ? 'border-ody-accent bg-ody-accent/5' 
          : `border-ody-border bg-ody-surface hover:border-ody-accent/40`
      }`}
    >
      {/* Selection checkbox */}
      <button
        onClick={onToggleSelect}
        className="absolute top-3 left-3 z-10 w-6 h-6 rounded-md border border-ody-border bg-ody-bg/80 backdrop-blur-sm flex items-center justify-center transition-colors hover:border-ody-accent"
      >
        {isSelected && <CheckSquare size={14} className="text-ody-accent" />}
      </button>

      <div className="flex flex-col sm:flex-row">
        {/* Screenshot thumbnail */}
        {screenshotUrl && (
          <div className="sm:w-48 h-32 sm:h-auto flex-shrink-0 overflow-hidden bg-ody-bg">
            <img
              src={screenshotUrl}
              alt={rec.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex-1 p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-ody-text truncate">{rec.title}</h4>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color} border ${config.border}`}>
                  {config.emoji} {config.label}
                </span>
              </div>
              
              {/* What summary */}
              {rec.what && (
                <p className="text-sm text-ody-text-muted mt-1 line-clamp-2">{rec.what}</p>
              )}
            </div>
          </div>

          {/* Distance badge */}
          {distance && (
            <div className="flex items-center gap-1.5 text-xs text-ody-text-dim">
              <Navigation size={12} className="text-ody-accent" />
              <span>
                {typeof distance === 'number' 
                  ? `${formatDistance(distance)} from Vicenza`
                  : `${distance} from Vicenza`
                }
              </span>
            </div>
          )}

          {/* Quick highlights preview */}
          {highlights.length > 0 && !isExpanded && (
            <div className="flex flex-wrap gap-1.5">
              {highlights.map((highlight: string, i: number) => (
                <span 
                  key={i} 
                  className="px-2 py-0.5 rounded-md bg-ody-accent/10 text-ody-accent text-xs truncate max-w-[200px]"
                >
                  {highlight}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-ody-border-subtle">
            {/* Approve button - disabled if already approved or booked */}
            {status !== 'approved' && status !== 'booked' && (
              <button
                onClick={onApprove}
                disabled={updateStatusMutation.isPending}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-ody-success/10 text-ody-success text-xs font-medium hover:bg-ody-success/20 transition-colors"
              >
                <ThumbsUp size={12} /> Approve
              </button>
            )}

            {/* Maybe button */}
            {status !== 'maybe' && (
              <button
                onClick={onMaybe}
                disabled={updateStatusMutation.isPending}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-ody-warning/10 text-ody-warning text-xs font-medium hover:bg-ody-warning/20 transition-colors"
              >
                <HelpCircle size={12} /> Maybe
              </button>
            )}

            {/* Decline button */}
            {status !== 'no-go' && (
              <button
                onClick={onDecline}
                disabled={updateStatusMutation.isPending}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-ody-danger/10 text-ody-danger text-xs font-medium hover:bg-ody-danger/20 transition-colors"
              >
                <ThumbsDown size={12} /> Decline
              </button>
            )}

            {/* View Destination link */}
            {rec.destinationId && (
              <Link
                to="/destination/$destinationId"
                params={{ destinationId: rec.destinationId }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-ody-accent/10 text-ody-accent text-xs font-medium hover:bg-ody-accent/20 transition-colors"
              >
                <MapPin size={12} /> View Destination
              </Link>
            )}

            {/* Details toggle */}
            <button
              onClick={onToggleExpand}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-ody-text-dim text-xs hover:text-ody-text-muted hover:bg-ody-surface-hover transition-colors ml-auto"
            >
              <Info size={12} />
              {isExpanded ? 'Less' : 'Details'}
              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>

          {/* Expanded details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-4 text-sm border-t border-ody-border-subtle">
                  {/* Full description */}
                  {rec.description && (
                    <div>
                      <h5 className="font-medium text-ody-text mb-1">About</h5>
                      <p className="text-ody-text-muted">{rec.description}</p>
                    </div>
                  )}

                  {/* All highlights */}
                  {highlights.length > 0 && (
                    <div>
                      <h5 className="font-medium text-ody-text mb-2">Why it's special</h5>
                      <ul className="space-y-1">
                        {highlights.map((highlight: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-ody-text-muted">
                            <span className="text-ody-accent mt-1">•</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Logistics */}
                  {rec.logistics && (
                    <div>
                      <h5 className="font-medium text-ody-text mb-1">Logistics</h5>
                      <div className="text-ody-text-muted whitespace-pre-wrap">{rec.logistics}</div>
                    </div>
                  )}

                  {/* Pro tips */}
                  {proTips.length > 0 && (
                    <div>
                      <h5 className="font-medium text-ody-text mb-2">Pro Tips</h5>
                      <ul className="space-y-1">
                        {proTips.map((tip: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-ody-text-muted">
                            <span className="text-ody-warning mt-1">💡</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Events */}
                  {events.length > 0 && (
                    <div>
                      <h5 className="font-medium text-ody-text mb-2">Events</h5>
                      <ul className="space-y-1">
                        {events.map((event: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-ody-text-muted">
                            <Calendar size={12} className="text-ody-accent mt-0.5 flex-shrink-0" />
                            <span>{event}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Notes */}
                  {rec.notes && (
                    <div>
                      <h5 className="font-medium text-ody-text mb-1">Notes</h5>
                      <p className="text-ody-text-muted whitespace-pre-wrap">{rec.notes}</p>
                    </div>
                  )}

                  {/* Added date */}
                  {rec.addedDate && (
                    <div className="text-xs text-ody-text-dim pt-2">
                      Added: {rec.addedDate}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
