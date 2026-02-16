import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEventDetail } from '../server/event-detail';
import { updateEventImage, findEventImages } from '../server/event-image';
import { AddEventToItineraryModal } from '../components/destination/AddEventToItineraryModal';
import { ImagePickerModal } from '../components/ImagePickerModal';
import type { CandidateImage } from '../server/destination-image';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  ArrowLeft, MapPin, Calendar, Globe, Clock, Star, ExternalLink,
  DollarSign, Ticket, Music, Trophy, Compass, CalendarPlus,
  CheckCircle, Users, Eye, ShoppingBag, ImagePlus,
} from 'lucide-react';

const typeConfig: Record<string, { icon: typeof Music; label: string; emoji: string; color: string; bg: string }> = {
  performance: { icon: Music, label: 'Performance', emoji: '🎭', color: 'text-purple-400', bg: 'bg-purple-400/15' },
  concert: { icon: Music, label: 'Concert', emoji: '🎵', color: 'text-pink-400', bg: 'bg-pink-400/15' },
  sports: { icon: Trophy, label: 'Sports', emoji: '⚽', color: 'text-green-400', bg: 'bg-green-400/15' },
  tour: { icon: Compass, label: 'Tour', emoji: '🗺️', color: 'text-blue-400', bg: 'bg-blue-400/15' },
  festival: { icon: Star, label: 'Festival', emoji: '🎪', color: 'text-amber-400', bg: 'bg-amber-400/15' },
  exhibition: { icon: Eye, label: 'Exhibition', emoji: '🖼️', color: 'text-teal-400', bg: 'bg-teal-400/15' },
  market: { icon: ShoppingBag, label: 'Market', emoji: '🛍️', color: 'text-orange-400', bg: 'bg-orange-400/15' },
  other: { icon: Calendar, label: 'Other', emoji: '📅', color: 'text-gray-400', bg: 'bg-gray-400/15' },
};

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  researched: { color: 'text-ody-text-muted', bg: 'bg-ody-text-muted/15', label: 'Researched' },
  interested: { color: 'text-ody-info', bg: 'bg-ody-info/15', label: 'Interested' },
  booked: { color: 'text-ody-success', bg: 'bg-ody-success/15', label: 'Booked' },
  attended: { color: 'text-ody-accent', bg: 'bg-ody-accent/15', label: 'Attended' },
};

// Fallback images by event type
const fallbackImages: Record<string, string> = {
  concert: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=600&fit=crop',
  performance: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=600&fit=crop',
  sports: 'https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=1200&h=600&fit=crop',
  tour: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=600&fit=crop',
  festival: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&h=600&fit=crop',
  exhibition: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1200&h=600&fit=crop',
  market: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=600&fit=crop',
  other: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=600&fit=crop',
};

export const Route = createFileRoute('/event/$eventId')({
  component: EventDetailPage,
});

function formatDate(d: string | null): string {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatTime(t: string | null): string {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

function EventDetailPage() {
  const { eventId } = Route.useParams();
  const queryClient = useQueryClient();
  const [showAddToItinerary, setShowAddToItinerary] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [candidateImages, setCandidateImages] = useState<CandidateImage[]>([]);
  const [imageSearchLoading, setImageSearchLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEventDetail({ data: { eventId } }),
  });

  const imageMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      await updateEventImage({ data: { eventId, imageUrl } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
  });

  const handleFindImage = async () => {
    if (!data) return;
    setShowImagePicker(true);
    setImageSearchLoading(true);
    setCandidateImages([]);
    try {
      const { event, destination } = data;
      const extractUrl = event.ticketUrl || event.bookingUrl || undefined;
      const images = await findEventImages({
        data: {
          eventName: event.name,
          venue: event.venue || undefined,
          destinationName: destination?.name || undefined,
          extractUrl,
        },
      });
      setCandidateImages(images);
    } catch (err) {
      console.error('Failed to find images:', err);
    } finally {
      setImageSearchLoading(false);
    }
  };

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

  if (!data) return <div className="p-6 text-center text-ody-text-muted">Event not found</div>;

  const { event, destination, trip, relatedEvents, isInItinerary } = data;
  const type = typeConfig[event.eventType || 'other'] || typeConfig.other;
  const status = statusConfig[event.status || 'researched'] || statusConfig.researched;
  const TypeIcon = type.icon;
  const heroImage = event.imageUrl || fallbackImages[event.eventType || 'other'] || fallbackImages.other;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Hero Image */}
      <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden mb-8">
        <img src={heroImage} alt={event.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ody-bg via-ody-bg/30 to-transparent" />

        {/* Back button */}
        <div className="absolute top-4 left-4">
          {destination ? (
            <Link
              to="/destination/$destinationId"
              params={{ destinationId: destination.id }}
              search={{ fromTab: 'destinations' }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/90 text-sm hover:bg-black/60 transition-colors"
            >
              <ArrowLeft size={16} /> Back to {destination.name}
            </Link>
          ) : (
            <Link
              to="/trips"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/90 text-sm hover:bg-black/60 transition-colors"
            >
              <ArrowLeft size={16} /> Back to Trips
            </Link>
          )}
        </div>

        {/* Find Image button */}
        <div className="absolute top-4 right-4">
          <button
            onClick={handleFindImage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/90 text-sm hover:bg-black/60 transition-colors"
          >
            <ImagePlus size={16} /> Find Image
          </button>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end gap-4">
            <div className={`w-14 h-14 rounded-2xl ${type.bg} backdrop-blur-sm flex items-center justify-center text-2xl flex-shrink-0`}>
              {type.emoji}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{event.name}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${type.color} ${type.bg} backdrop-blur-sm`}>
                  {type.label}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.color} ${status.bg} backdrop-blur-sm`}>
                  {status.label}
                </span>
                {isInItinerary && (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold text-emerald-400 bg-emerald-400/15 backdrop-blur-sm flex items-center gap-1">
                    <CheckCircle size={12} /> In Itinerary
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6">
        {/* Description */}
        {event.description && (
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-ody-text-muted leading-relaxed mb-8"
          >
            {event.description}
          </motion.p>
        )}

        {/* Details grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        >
          {/* Date & Time */}
          {(event.startDate || event.startTime) && (
            <div className="p-4 rounded-xl bg-ody-surface border border-ody-border">
              <h3 className="text-sm font-semibold text-ody-text-muted mb-2 flex items-center gap-2">
                <Calendar size={14} /> Date & Time
              </h3>
              <div className="space-y-1">
                {event.startDate && <p className="text-ody-text font-medium">{formatDate(event.startDate)}</p>}
                {event.endDate && event.endDate !== event.startDate && (
                  <p className="text-ody-text-muted text-sm">to {formatDate(event.endDate)}</p>
                )}
                {event.startTime && (
                  <p className="text-ody-text-muted text-sm flex items-center gap-1">
                    <Clock size={12} />
                    {formatTime(event.startTime)}{event.endTime && ` – ${formatTime(event.endTime)}`}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Venue */}
          {(event.venue || event.venueAddress) && (
            <div className="p-4 rounded-xl bg-ody-surface border border-ody-border">
              <h3 className="text-sm font-semibold text-ody-text-muted mb-2 flex items-center gap-2">
                <MapPin size={14} /> Venue
              </h3>
              {event.venue && <p className="text-ody-text font-medium">{event.venue}</p>}
              {event.venueAddress && <p className="text-ody-text-muted text-sm">{event.venueAddress}</p>}
            </div>
          )}

          {/* Pricing */}
          {(event.ticketPriceFrom || event.ticketPriceTo) && (
            <div className="p-4 rounded-xl bg-ody-surface border border-ody-border">
              <h3 className="text-sm font-semibold text-ody-text-muted mb-2 flex items-center gap-2">
                <DollarSign size={14} /> Pricing
              </h3>
              <p className="text-ody-text font-medium text-lg">
                {event.currency || '$'}{event.ticketPriceFrom}
                {event.ticketPriceTo && event.ticketPriceTo !== event.ticketPriceFrom && (
                  <span> – {event.currency || '$'}{event.ticketPriceTo}</span>
                )}
              </p>
              {event.totalCost && (
                <p className="text-ody-text-muted text-sm">
                  Total: {event.currency || '$'}{event.totalCost} ({event.groupSize || 1} {(event.groupSize || 1) > 1 ? 'people' : 'person'})
                </p>
              )}
            </div>
          )}

          {/* Group & Booking */}
          <div className="p-4 rounded-xl bg-ody-surface border border-ody-border">
            <h3 className="text-sm font-semibold text-ody-text-muted mb-2 flex items-center gap-2">
              <Ticket size={14} /> Booking
            </h3>
            <div className="space-y-2">
              {event.groupSize && (
                <p className="text-ody-text-muted text-sm flex items-center gap-1">
                  <Users size={12} /> {event.groupSize} {event.groupSize > 1 ? 'people' : 'person'}
                </p>
              )}
              {event.confirmationCode && (
                <p className="text-ody-text text-sm font-mono">
                  Confirmation: {event.confirmationCode}
                </p>
              )}
              {event.bookingUrl && (
                <a href={event.bookingUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-ody-accent hover:underline">
                  <Globe size={12} /> Book tickets <ExternalLink size={10} />
                </a>
              )}
              {event.ticketUrl && event.ticketUrl !== event.bookingUrl && (
                <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-ody-accent hover:underline">
                  <Ticket size={12} /> Ticket link <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* Notes */}
        {event.notes && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-4 rounded-xl bg-ody-surface border border-ody-border mb-8"
          >
            <h3 className="text-sm font-semibold text-ody-text-muted mb-2">Notes</h3>
            <p className="text-ody-text-muted text-sm whitespace-pre-line">{event.notes}</p>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="flex flex-wrap gap-3 mb-8"
        >
          {!isInItinerary ? (
            <button
              onClick={() => setShowAddToItinerary(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ody-accent text-white text-sm font-medium hover:bg-ody-accent-hover transition-colors"
            >
              <CalendarPlus size={16} /> Add to Itinerary
            </button>
          ) : (
            <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium border border-emerald-500/20">
              <CheckCircle size={16} /> Already in Itinerary
            </span>
          )}

          {event.bookingUrl && (
            <a href={event.bookingUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ody-surface border border-ody-border text-sm text-ody-text hover:border-ody-accent transition-colors"
            >
              <Globe size={16} /> Book Tickets <ExternalLink size={12} />
            </a>
          )}
        </motion.div>

        {/* Destination context */}
        {destination && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="p-4 rounded-xl bg-ody-surface border border-ody-border mb-8"
          >
            <h3 className="text-sm font-semibold text-ody-text-muted mb-2 flex items-center gap-2">
              <MapPin size={14} /> Destination
            </h3>
            <Link
              to="/destination/$destinationId"
              params={{ destinationId: destination.id }}
              className="text-ody-accent hover:underline font-medium"
            >
              {destination.name} →
            </Link>
            {trip && <p className="text-xs text-ody-text-dim mt-1">{trip.name}</p>}
          </motion.div>
        )}

        {/* Add to Itinerary Modal */}
        <AddEventToItineraryModal
          event={event}
          tripId={trip?.id || ''}
          startDate={trip?.startDate}
          endDate={trip?.endDate}
          open={showAddToItinerary}
          onClose={() => setShowAddToItinerary(false)}
        />

        {/* Image Picker Modal */}
        <ImagePickerModal
          open={showImagePicker}
          images={candidateImages}
          loading={imageSearchLoading}
          onSelect={(url) => imageMutation.mutate(url)}
          onClose={() => setShowImagePicker(false)}
        />

        {/* Related Events */}
        {relatedEvents.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <h2 className="text-lg font-semibold text-ody-text mb-4">More Events at {destination?.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedEvents.map(re => {
                const rt = typeConfig[re.eventType || 'other'] || typeConfig.other;
                const rs = statusConfig[re.status || 'researched'] || statusConfig.researched;
                return (
                  <Link key={re.id} to="/event/$eventId" params={{ eventId: re.id }}
                    className="p-3 rounded-xl bg-ody-surface border border-ody-border hover:border-ody-accent/40 transition-all group"
                  >
                    {re.imageUrl && (
                      <div className="h-24 -mx-3 -mt-3 mb-3 rounded-t-xl overflow-hidden">
                        <img src={re.imageUrl} alt={re.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-1">
                      <span>{rt.emoji}</span>
                      <span className="font-medium text-sm text-ody-text">{re.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-ody-text-muted">
                      {re.startDate && <span>{formatDate(re.startDate)}</span>}
                      <span className={`px-1.5 py-0.5 rounded-full ${rs.color} ${rs.bg}`}>{rs.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
