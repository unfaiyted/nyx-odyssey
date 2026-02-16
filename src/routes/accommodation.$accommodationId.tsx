import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAccommodationDetail } from '../server/accommodation-detail';
import { updateAccommodationImage, findAccommodationImages } from '../server/accommodation-image';
import { AddAccommodationToItineraryModal } from '../components/destination/AddAccommodationToItineraryModal';
import { ImagePickerModal } from '../components/ImagePickerModal';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  ArrowLeft, MapPin, Calendar, Globe, Star, ExternalLink,
  DollarSign, CalendarPlus, CheckCircle, Phone, Mail, Moon,
  Copy, Check, Building, Home, Tent, BedDouble, Hotel as HotelIcon,
  ClipboardCopy, StickyNote, ImageIcon, Loader2,
} from 'lucide-react';

const typeConfig: Record<string, { icon: typeof HotelIcon; label: string; emoji: string; color: string; bg: string }> = {
  hotel: { icon: HotelIcon, label: 'Hotel', emoji: '🏨', color: 'text-blue-400', bg: 'bg-blue-400/15' },
  hostel: { icon: BedDouble, label: 'Hostel', emoji: '🛏️', color: 'text-purple-400', bg: 'bg-purple-400/15' },
  airbnb: { icon: Home, label: 'Airbnb', emoji: '🏠', color: 'text-pink-400', bg: 'bg-pink-400/15' },
  villa: { icon: Building, label: 'Villa', emoji: '🏡', color: 'text-emerald-400', bg: 'bg-emerald-400/15' },
  resort: { icon: Star, label: 'Resort', emoji: '🏖️', color: 'text-amber-400', bg: 'bg-amber-400/15' },
  camping: { icon: Tent, label: 'Camping', emoji: '⛺', color: 'text-green-400', bg: 'bg-green-400/15' },
  other: { icon: MapPin, label: 'Other', emoji: '📍', color: 'text-gray-400', bg: 'bg-gray-400/15' },
};

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  researched: { color: 'text-ody-text-muted', bg: 'bg-ody-text-muted/15', label: 'Researched' },
  shortlisted: { color: 'text-ody-warning', bg: 'bg-ody-warning/15', label: 'Shortlisted' },
  booked: { color: 'text-ody-success', bg: 'bg-ody-success/15', label: 'Booked' },
  cancelled: { color: 'text-ody-danger', bg: 'bg-ody-danger/15', label: 'Cancelled' },
};

export const Route = createFileRoute('/accommodation/$accommodationId')({
  component: AccommodationDetailPage,
});

function formatDate(d: string | null): string {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
}

function nightCount(checkIn: string | null, checkOut: string | null): number | null {
  if (!checkIn || !checkOut) return null;
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function AccommodationDetailPage() {
  const { accommodationId } = Route.useParams();
  const queryClient = useQueryClient();
  const [showAddToItinerary, setShowAddToItinerary] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [candidateImages, setCandidateImages] = useState<any[]>([]);
  const [findingImages, setFindingImages] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['accommodation', accommodationId],
    queryFn: () => getAccommodationDetail({ data: { accommodationId } }),
  });

  const handleFindImages = async () => {
    if (!data) return;
    setFindingImages(true);
    setShowImagePicker(true);
    try {
      const images = await findAccommodationImages({
        data: {
          name: data.accommodation.name,
          address: data.accommodation.address || undefined,
          destinationName: data.destination?.name,
          bookingUrl: data.accommodation.bookingUrl || undefined,
          type: data.accommodation.type || undefined,
        },
      });
      setCandidateImages(images);
    } catch (err) {
      console.error('Failed to find images:', err);
    } finally {
      setFindingImages(false);
    }
  };

  const handleSelectImage = async (imageUrl: string) => {
    await updateAccommodationImage({ data: { accommodationId, imageUrl } });
    queryClient.invalidateQueries({ queryKey: ['accommodation', accommodationId] });
    queryClient.invalidateQueries({ queryKey: ['trip'] });
    setShowImagePicker(false);
  };

  if (isLoading) return <div className="p-6 text-center text-ody-text-muted">Loading accommodation...</div>;
  if (!data) return <div className="p-6 text-center text-ody-text-muted">Accommodation not found</div>;

  const { accommodation, destination, trip, relatedAccommodations, isInItinerary } = data;
  const type = typeConfig[accommodation.type || 'hotel'] || typeConfig.other;
  const status = statusConfig[accommodation.status || 'researched'] || statusConfig.researched;
  const nights = nightCount(accommodation.checkIn, accommodation.checkOut);

  const handleCopyCode = () => {
    if (accommodation.confirmationCode) {
      navigator.clipboard.writeText(accommodation.confirmationCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back navigation */}
      <Link
        to={destination ? "/destination/$destinationId" : "/trips"}
        params={destination ? { destinationId: destination.id } : undefined}
        search={destination ? { fromTab: 'destinations' } : undefined}
        className="inline-flex items-center gap-2 text-sm text-ody-text-muted hover:text-ody-text mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        {destination ? `Back to ${destination.name}` : 'Back to Trips'}
      </Link>

      {/* Hero Image */}
      {accommodation.imageUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-6 -mx-2"
        >
          <img src={accommodation.imageUrl} alt={accommodation.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
          <button
            onClick={handleFindImages}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors text-white"
            title="Change image"
          >
            <ImageIcon size={16} />
          </button>
        </motion.div>
      )}

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-14 h-14 rounded-2xl ${type.bg} flex items-center justify-center text-2xl flex-shrink-0`}>
            {type.emoji}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-ody-text mb-2">{accommodation.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${type.color} ${type.bg}`}>
                {type.label}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.color} ${status.bg}`}>
                {status.label}
              </span>
              {accommodation.isHomeBase && (
                <span className="px-2 py-1 rounded-full text-xs font-semibold text-ody-accent bg-ody-accent/15 flex items-center gap-1">
                  <Home size={12} /> Home Base
                </span>
              )}
              {isInItinerary && (
                <span className="px-2 py-1 rounded-full text-xs font-semibold text-emerald-400 bg-emerald-400/15 flex items-center gap-1">
                  <CheckCircle size={12} /> In Itinerary
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Details grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
      >
        {/* Address */}
        {accommodation.address && (
          <div className="p-4 rounded-xl bg-ody-surface border border-ody-border">
            <h3 className="text-sm font-semibold text-ody-text-muted mb-2 flex items-center gap-2">
              <MapPin size={14} /> Address
            </h3>
            <p className="text-ody-text">{accommodation.address}</p>
          </div>
        )}

        {/* Check-in / Check-out */}
        {(accommodation.checkIn || accommodation.checkOut) && (
          <div className="p-4 rounded-xl bg-ody-surface border border-ody-border">
            <h3 className="text-sm font-semibold text-ody-text-muted mb-2 flex items-center gap-2">
              <Calendar size={14} /> Stay Dates
            </h3>
            <div className="space-y-1">
              {accommodation.checkIn && (
                <p className="text-ody-text">
                  <span className="text-ody-text-dim text-sm">Check-in:</span>{' '}
                  <span className="font-medium">{formatDate(accommodation.checkIn)}</span>
                </p>
              )}
              {accommodation.checkOut && (
                <p className="text-ody-text">
                  <span className="text-ody-text-dim text-sm">Check-out:</span>{' '}
                  <span className="font-medium">{formatDate(accommodation.checkOut)}</span>
                </p>
              )}
              {nights !== null && (
                <p className="text-ody-accent text-sm font-medium flex items-center gap-1 mt-1">
                  <Moon size={12} /> {nights} night{nights !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Cost Breakdown */}
        {(accommodation.costPerNight || accommodation.totalCost) && (
          <div className="p-4 rounded-xl bg-ody-surface border border-ody-border">
            <h3 className="text-sm font-semibold text-ody-text-muted mb-2 flex items-center gap-2">
              <DollarSign size={14} /> Cost
            </h3>
            <div className="space-y-1">
              {accommodation.costPerNight && (
                <p className="text-ody-text">
                  <span className="text-lg font-semibold">
                    {accommodation.currency || '$'}{parseFloat(accommodation.costPerNight).toFixed(2)}
                  </span>
                  <span className="text-ody-text-dim text-sm"> / night</span>
                </p>
              )}
              {accommodation.totalCost && (
                <p className="text-ody-text-muted text-sm">
                  Total: <span className="font-medium text-ody-text">
                    {accommodation.currency || '$'}{parseFloat(accommodation.totalCost).toFixed(2)}
                  </span>
                  {nights && accommodation.costPerNight && (
                    <span className="text-ody-text-dim"> ({nights} nights)</span>
                  )}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Confirmation Code */}
        {accommodation.confirmationCode && (
          <div className="p-4 rounded-xl bg-ody-surface border border-ody-border">
            <h3 className="text-sm font-semibold text-ody-text-muted mb-2 flex items-center gap-2">
              <ClipboardCopy size={14} /> Confirmation Code
            </h3>
            <div className="flex items-center gap-2">
              <code className="text-lg font-mono font-semibold text-ody-text bg-ody-bg px-3 py-1.5 rounded-lg flex-1">
                {accommodation.confirmationCode}
              </code>
              <button
                onClick={handleCopyCode}
                className="p-2 rounded-lg border border-ody-border hover:bg-ody-surface-hover transition-colors"
                title="Copy confirmation code"
              >
                {copiedCode ? <Check size={16} className="text-ody-success" /> : <Copy size={16} className="text-ody-text-dim" />}
              </button>
            </div>
          </div>
        )}

        {/* Rating */}
        {accommodation.rating && (
          <div className="p-4 rounded-xl bg-ody-surface border border-ody-border">
            <h3 className="text-sm font-semibold text-ody-text-muted mb-2 flex items-center gap-2">
              <Star size={14} /> Rating
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-ody-warning">{accommodation.rating}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    size={16}
                    className={i <= Math.round(accommodation.rating!) ? 'text-ody-warning fill-current' : 'text-ody-text-dim'}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contact & Links */}
        {(accommodation.bookingUrl || accommodation.contactPhone || accommodation.contactEmail) && (
          <div className="p-4 rounded-xl bg-ody-surface border border-ody-border">
            <h3 className="text-sm font-semibold text-ody-text-muted mb-2 flex items-center gap-2">
              <Globe size={14} /> Contact & Links
            </h3>
            <div className="space-y-2">
              {accommodation.bookingUrl && (
                <a href={accommodation.bookingUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-ody-accent hover:underline">
                  <Globe size={12} /> Booking page <ExternalLink size={10} />
                </a>
              )}
              {accommodation.contactPhone && (
                <a href={`tel:${accommodation.contactPhone}`}
                  className="flex items-center gap-1 text-sm text-ody-text-muted hover:text-ody-text">
                  <Phone size={12} /> {accommodation.contactPhone}
                </a>
              )}
              {accommodation.contactEmail && (
                <a href={`mailto:${accommodation.contactEmail}`}
                  className="flex items-center gap-1 text-sm text-ody-text-muted hover:text-ody-text">
                  <Mail size={12} /> {accommodation.contactEmail}
                </a>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Notes */}
      {accommodation.notes && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-ody-surface border border-ody-border mb-8"
        >
          <h3 className="text-sm font-semibold text-ody-text-muted mb-2 flex items-center gap-2">
            <StickyNote size={14} /> Notes
          </h3>
          <p className="text-ody-text-muted text-sm whitespace-pre-line">{accommodation.notes}</p>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="flex flex-wrap gap-3 mb-8"
      >
        {!isInItinerary ? (
          <button
            onClick={() => setShowAddToItinerary(true)}
            disabled={!accommodation.checkIn || !accommodation.checkOut}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ody-accent text-white text-sm font-medium hover:bg-ody-accent-hover disabled:opacity-50 transition-colors"
          >
            <CalendarPlus size={16} /> Add to Itinerary
          </button>
        ) : (
          <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium border border-emerald-500/20">
            <CheckCircle size={16} /> Already in Itinerary
          </span>
        )}

        {accommodation.bookingUrl && (
          <a href={accommodation.bookingUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ody-surface border border-ody-border text-sm text-ody-text hover:border-ody-accent transition-colors"
          >
            <Globe size={16} /> View Booking <ExternalLink size={12} />
          </a>
        )}

        <button
          onClick={handleFindImages}
          disabled={findingImages}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ody-surface border border-ody-border text-sm text-ody-text hover:border-ody-accent transition-colors disabled:opacity-50"
        >
          {findingImages ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
          {accommodation.imageUrl ? 'Change Image' : 'Find Image'}
        </button>
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
      <AddAccommodationToItineraryModal
        accommodation={accommodation}
        tripId={trip?.id || accommodation.tripId}
        open={showAddToItinerary}
        onClose={() => setShowAddToItinerary(false)}
      />

      {/* Image Picker Modal */}
      <ImagePickerModal
        open={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        images={candidateImages}
        loading={findingImages}
        onSelect={handleSelectImage}
      />

      {/* Related Accommodations */}
      {relatedAccommodations.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h2 className="text-lg font-semibold text-ody-text mb-4">More Accommodations at {destination?.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedAccommodations.map(ra => {
              const rt = typeConfig[ra.type || 'hotel'] || typeConfig.other;
              const rs = statusConfig[ra.status || 'researched'] || statusConfig.researched;
              const rNights = nightCount(ra.checkIn, ra.checkOut);
              return (
                <Link key={ra.id} to="/accommodation/$accommodationId" params={{ accommodationId: ra.id }}
                  className="p-3 rounded-xl bg-ody-surface border border-ody-border hover:border-ody-accent/40 transition-all"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{rt.emoji}</span>
                    <span className="font-medium text-sm text-ody-text">{ra.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-ody-text-muted">
                    {ra.checkIn && <span>{formatDate(ra.checkIn)}</span>}
                    {rNights !== null && <span className="flex items-center gap-0.5"><Moon size={10} />{rNights}n</span>}
                    <span className={`px-1.5 py-0.5 rounded-full ${rs.color} ${rs.bg}`}>{rs.label}</span>
                  </div>
                  {ra.totalCost && (
                    <p className="text-xs text-ody-text-dim mt-1">
                      {ra.currency || '$'}{parseFloat(ra.totalCost).toFixed(0)} total
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
