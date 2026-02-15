import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHighlightDetail, updateHighlightNotes } from '../server/highlight-detail';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  ArrowLeft, MapPin, Calendar, Globe, Clock, Star, ExternalLink,
  Phone, Bookmark, Camera, DollarSign, Navigation, Edit3, Save,
  X, ChevronRight, CalendarPlus, Lightbulb, MessageSquare, Link as LinkIcon,
  Mountain, Utensils, Music, ShoppingBag, TreePine, Landmark,
} from 'lucide-react';
import { AddToItineraryModal } from '../components/destination/AddToItineraryModal';

const HIGHLIGHT_CATEGORIES: Record<string, { label: string; icon: typeof Camera; color: string; bg: string }> = {
  attraction: { label: 'Attraction', icon: Camera, color: 'text-blue-400', bg: 'bg-blue-400/15' },
  food: { label: 'Food & Drink', icon: Utensils, color: 'text-orange-400', bg: 'bg-orange-400/15' },
  activity: { label: 'Activity', icon: Mountain, color: 'text-green-400', bg: 'bg-green-400/15' },
  nightlife: { label: 'Nightlife', icon: Music, color: 'text-purple-400', bg: 'bg-purple-400/15' },
  shopping: { label: 'Shopping', icon: ShoppingBag, color: 'text-pink-400', bg: 'bg-pink-400/15' },
  nature: { label: 'Nature', icon: TreePine, color: 'text-emerald-400', bg: 'bg-emerald-400/15' },
  cultural: { label: 'Cultural', icon: Landmark, color: 'text-amber-400', bg: 'bg-amber-400/15' },
};

function PriceLevel({ level }: { level: number }) {
  return (
    <span className="text-sm font-medium">
      {[1, 2, 3, 4].map(i => (
        <span key={i} className={i <= level ? 'text-ody-warning' : 'text-ody-text-dim/30'}>$</span>
      ))}
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={16}
          className={i <= Math.round(rating) ? 'text-ody-warning fill-ody-warning' : 'text-ody-text-dim/30'}
        />
      ))}
      <span className="text-sm text-ody-text-muted ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export const Route = createFileRoute('/highlight/$highlightId')({
  component: HighlightDetailPage,
});

function HighlightDetailPage() {
  const { highlightId } = Route.useParams();
  const queryClient = useQueryClient();
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['highlight-detail', highlightId],
    queryFn: () => getHighlightDetail({ data: { highlightId } }),
  });

  const notesMutation = useMutation({
    mutationFn: (notes: string) => updateHighlightNotes({ data: { highlightId, notes } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['highlight-detail', highlightId] });
      setEditingNotes(false);
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-80 bg-ody-surface rounded-xl" />
          <div className="h-8 bg-ody-surface rounded w-1/2" />
          <div className="h-24 bg-ody-surface rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-center py-12 text-ody-text-muted">Highlight not found</div>;

  const { highlight, destination, photos, relatedHighlights, trip, research } = data;
  const cat = HIGHLIGHT_CATEGORIES[highlight.category || 'attraction'] || HIGHLIGHT_CATEGORIES.attraction;
  const CatIcon = cat.icon;
  const tips: string[] = highlight.tips ? JSON.parse(highlight.tips) : [];
  const heroImage = highlight.imageUrl || destination?.photoUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=600&fit=crop';

  // Calculate travel time from home base
  let travelTimeFromHome: string | null = null;
  if (trip?.homeBaseLat && trip?.homeBaseLng && highlight.lat && highlight.lng) {
    // Use research drive time as approximation for this destination area
    if (research?.driveTimeMinutes) {
      const mins = research.driveTimeMinutes;
      travelTimeFromHome = mins >= 60 ? `~${Math.round(mins / 60)}h ${mins % 60}m` : `~${mins}m`;
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Hero Image */}
      <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden">
        <img src={heroImage} alt={highlight.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ody-bg via-ody-bg/30 to-transparent" />

        {/* Back button */}
        <div className="absolute top-4 left-4">
          {destination ? (
            <Link
              to="/destination/$destinationId"
              params={{ destinationId: destination.id }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/90 text-sm hover:bg-black/60 transition-colors"
            >
              <ArrowLeft size={16} /> Back to {destination.name}
            </Link>
          ) : (
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/90 text-sm hover:bg-black/60 transition-colors"
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}
        </div>

        {/* Category badge */}
        <div className="absolute top-4 right-4">
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur-sm text-sm font-medium ${cat.bg} ${cat.color}`}>
            <CatIcon size={14} /> {cat.label}
          </span>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">{highlight.title}</h1>
          {highlight.address && (
            <p className="text-white/70 mt-1 flex items-center gap-1">
              <MapPin size={14} /> {highlight.address}
            </p>
          )}
        </div>
      </div>

      {/* Quick info bar */}
      <div className="flex flex-wrap items-center gap-4">
        {highlight.rating && <StarRating rating={highlight.rating} />}
        {highlight.priceLevel && <PriceLevel level={highlight.priceLevel} />}
        {highlight.duration && (
          <span className="flex items-center gap-1.5 text-sm text-ody-text-muted">
            <Clock size={14} /> {highlight.duration}
          </span>
        )}
        {highlight.estimatedVisitMinutes && (
          <span className="flex items-center gap-1.5 text-sm text-ody-text-muted">
            <Clock size={14} /> ~{highlight.estimatedVisitMinutes}min visit
          </span>
        )}
        {travelTimeFromHome && (
          <span className="flex items-center gap-1.5 text-sm text-ody-text-muted">
            <Navigation size={14} /> {travelTimeFromHome} from home base
          </span>
        )}
        <button
          onClick={() => setShowItineraryModal(true)}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-lg bg-ody-accent text-white text-sm font-medium hover:bg-ody-accent-hover transition-colors"
        >
          <CalendarPlus size={16} /> Add to Itinerary
        </button>
      </div>

      {/* Description & Why Visit */}
      <div className="space-y-4">
        {highlight.description && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <p className="text-ody-text-muted leading-relaxed">{highlight.description}</p>
          </motion.div>
        )}

        {highlight.whyVisit && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card p-6 border-l-4 border-ody-accent"
          >
            <h2 className="text-sm font-semibold text-ody-accent uppercase tracking-wide mb-2">Why Visit</h2>
            <p className="text-ody-text-muted leading-relaxed">{highlight.whyVisit}</p>
          </motion.div>
        )}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Opening Hours */}
        {highlight.openingHours && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-ody-text-dim">
              <Clock size={16} /> Opening Hours
            </h3>
            <p className="text-sm text-ody-text-muted whitespace-pre-line">{highlight.openingHours}</p>
          </motion.div>
        )}

        {/* Contact & Links */}
        {(highlight.phone || highlight.websiteUrl || highlight.bookingUrl) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-ody-text-dim">
              <LinkIcon size={16} /> Links & Contact
            </h3>
            <div className="space-y-2">
              {highlight.phone && (
                <a href={`tel:${highlight.phone}`} className="flex items-center gap-2 text-sm text-ody-text-muted hover:text-ody-accent transition-colors">
                  <Phone size={14} /> {highlight.phone}
                </a>
              )}
              {highlight.websiteUrl && (
                <a href={highlight.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-ody-accent hover:underline">
                  <Globe size={14} /> Website
                  <ExternalLink size={12} />
                </a>
              )}
              {highlight.bookingUrl && (
                <a href={highlight.bookingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-ody-accent hover:underline">
                  <Bookmark size={14} /> Book Now
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Map embed */}
      {highlight.lat && highlight.lng && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin size={20} className="text-ody-accent" /> Location
          </h2>
          {highlight.address && (
            <p className="text-sm text-ody-text-muted">{highlight.address}</p>
          )}
          <div className="rounded-xl overflow-hidden h-64">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${highlight.lng - 0.01},${highlight.lat - 0.007},${highlight.lng + 0.01},${highlight.lat + 0.007}&layer=mapnik&marker=${highlight.lat},${highlight.lng}`}
            />
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${highlight.lat},${highlight.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-ody-accent hover:underline"
          >
            <Navigation size={14} /> Open in Google Maps <ExternalLink size={12} />
          </a>
        </motion.div>
      )}

      {/* Photo Gallery */}
      {photos.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Camera size={20} className="text-ody-accent" /> Photos
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="rounded-xl overflow-hidden aspect-[4/3]">
                <img src={photo.url} alt={photo.caption || highlight.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                {photo.caption && (
                  <p className="text-xs text-ody-text-dim mt-1 px-1">{photo.caption}</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tips */}
      {tips.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb size={20} className="text-ody-warning" /> Tips
          </h2>
          <div className="space-y-2">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-ody-bg border border-ody-border-subtle">
                <div className="w-6 h-6 rounded-full bg-ody-warning/20 text-ody-warning flex items-center justify-center shrink-0 text-xs font-bold">
                  {i + 1}
                </div>
                <p className="text-sm text-ody-text-muted">{tip}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Notes / Comments */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare size={20} className="text-ody-accent" /> Notes
          </h2>
          {!editingNotes && (
            <button
              onClick={() => { setNotesText(highlight.notes || ''); setEditingNotes(true); }}
              className="flex items-center gap-1 text-xs text-ody-accent hover:underline"
            >
              <Edit3 size={12} /> {highlight.notes ? 'Edit' : 'Add notes'}
            </button>
          )}
        </div>
        {editingNotes ? (
          <div className="space-y-3">
            <textarea
              value={notesText}
              onChange={e => setNotesText(e.target.value)}
              className="w-full h-32 p-3 rounded-lg bg-ody-bg border border-ody-border text-sm text-ody-text resize-none focus:outline-none focus:border-ody-accent"
              placeholder="Add your notes about this place..."
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => notesMutation.mutate(notesText)}
                disabled={notesMutation.isPending}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-ody-accent text-white text-sm hover:bg-ody-accent-hover transition-colors"
              >
                <Save size={14} /> Save
              </button>
              <button
                onClick={() => setEditingNotes(false)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-ody-surface text-ody-text-muted text-sm hover:bg-ody-surface-hover transition-colors"
              >
                <X size={14} /> Cancel
              </button>
            </div>
          </div>
        ) : highlight.notes ? (
          <p className="text-sm text-ody-text-muted whitespace-pre-line">{highlight.notes}</p>
        ) : (
          <p className="text-sm text-ody-text-dim italic">No notes yet. Click "Add notes" to start.</p>
        )}
      </motion.div>

      {/* Related Highlights */}
      {relatedHighlights.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Star size={20} className="text-ody-accent" /> More in {destination?.name || 'This Area'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedHighlights.map((h) => {
              const rCat = HIGHLIGHT_CATEGORIES[h.category || 'attraction'] || HIGHLIGHT_CATEGORIES.attraction;
              const RCatIcon = rCat.icon;
              return (
                <Link
                  key={h.id}
                  to="/highlight/$highlightId"
                  params={{ highlightId: h.id }}
                  className="glass-card overflow-hidden group hover:border-ody-accent/30 transition-colors"
                >
                  {h.imageUrl && (
                    <div className="h-28 overflow-hidden">
                      <img src={h.imageUrl} alt={h.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </div>
                  )}
                  <div className="p-3 space-y-1">
                    <h3 className="font-medium text-sm">{h.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-ody-text-dim">
                      <span className={`flex items-center gap-1 ${rCat.color}`}>
                        <RCatIcon size={10} /> {rCat.label}
                      </span>
                      {h.rating && (
                        <span className="flex items-center gap-0.5 text-ody-warning">
                          <Star size={10} className="fill-ody-warning" /> {h.rating}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Add to Itinerary Modal */}
      {showItineraryModal && trip && (
        <AddToItineraryModal
          highlight={highlight}
          tripId={trip.id}
          startDate={destination?.arrivalDate}
          endDate={destination?.departureDate}
          open={showItineraryModal}
          onClose={() => setShowItineraryModal(false)}
          destinationPhotoUrl={destination?.photoUrl}
        />
      )}
    </div>
  );
}
