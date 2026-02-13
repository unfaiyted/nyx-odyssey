import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getAttractionDetail } from '../server/attractions';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  ArrowLeft, MapPin, Clock, Ticket, ExternalLink, Star, DollarSign,
  Phone, Mail, CalendarPlus, Lightbulb, History, Image, Info,
  AlertCircle, Check, Map, ChevronDown, ChevronUp
} from 'lucide-react';
import { ResearchRequestModal } from '../components/attractions/ResearchRequestModal';
import { parseHours, parsePhotos, parseVisitorTips, formatTicketPrice } from '../server/attractions';

export const Route = createFileRoute('/attractions/$attractionId')({
  component: AttractionDetailPage,
});

const TYPE_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  museum: { label: 'Museum', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  landmark: { label: 'Landmark', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  restaurant: { label: 'Restaurant', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  nature: { label: 'Nature', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  cultural: { label: 'Cultural', color: 'text-pink-400', bg: 'bg-pink-400/10' },
  entertainment: { label: 'Entertainment', color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  shopping: { label: 'Shopping', color: 'text-rose-400', bg: 'bg-rose-400/10' },
  attraction: { label: 'Attraction', color: 'text-ody-accent', bg: 'bg-ody-accent/10' },
};

function PriceLevel({ level }: { level: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4].map(i => (
        <DollarSign
          key={i}
          size={14}
          className={i <= level ? 'text-ody-warning' : 'text-ody-text-dim opacity-30'}
        />
      ))}
    </span>
  );
}

function ExpandableText({ text, maxLength = 300 }: { text: string; maxLength?: number }) {
  const [expanded, setExpanded] = useState(false);
  
  if (!text) return null;
  if (text.length <= maxLength) return <p className="text-ody-text-muted leading-relaxed">{text}</p>;
  
  return (
    <div className="space-y-2">
      <p className="text-ody-text-muted leading-relaxed">
        {expanded ? text : `${text.slice(0, maxLength)}...`}
      </p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-ody-accent hover:text-ody-accent-hover flex items-center gap-1"
      >
        {expanded ? (
          <>Show less <ChevronUp size={14} /></>
        ) : (
          <>Read more <ChevronDown size={14} /></>
        )}
      </button>
    </div>
  );
}

function HoursTable({ hours }: { hours: Record<string, any> | null }) {
  if (!hours) return null;
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels: Record<string, string> = {
    monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
    friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
  };
  
  return (
    <div className="space-y-1">
      {days.map(day => {
        const hoursForDay = hours[day];
        if (!hoursForDay) return null;
        
        return (
          <div key={day} className="flex justify-between text-sm">
            <span className="text-ody-text-dim">{dayLabels[day]}</span>
            <span className="text-ody-text-muted">
              {hoursForDay.closed ? 'Closed' : `${hoursForDay.open || '?'} - ${hoursForDay.close || '?'}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function PhotoGallery({ photos }: { photos: string[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  
  if (!photos.length) return null;
  
  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {photos.slice(0, 8).map((photo, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setSelected(photo)}
          >
            <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </div>
      
      {/* Lightbox */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <img src={selected} alt="Full size" className="max-w-full max-h-full object-contain rounded-lg" />
        </motion.div>
      )}
    </>
  );
}

function AttractionDetailPage() {
  const { attractionId } = Route.useParams();
  const [showResearchModal, setShowResearchModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['attraction', attractionId],
    queryFn: () => getAttractionDetail({ data: { attractionId } }),
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-72 bg-ody-surface rounded-xl" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-ody-surface rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-center py-12 text-ody-text-muted">Attraction not found</div>;

  const { attraction, destination, trip } = data;
  const typeBadge = TYPE_BADGES[attraction.type || 'attraction'] || TYPE_BADGES.attraction;
  
  const hours = parseHours(attraction.hoursJson);
  const photos = parsePhotos(attraction.photosJson);
  const tips = parseVisitorTips(attraction.visitorTips);
  
  const formattedPrice = formatTicketPrice(attraction.ticketInfo);
  
  // Check what info is missing
  const hasMissingInfo = !attraction.hoursJson || !attraction.ticketInfo || !photos.length || 
                         !attraction.history || !tips.length || !attraction.bookingUrl;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Hero */}
      <div className="relative h-80 rounded-2xl overflow-hidden">
        <img 
          src={attraction.heroImageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=600&fit=crop'} 
          alt={attraction.name} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ody-bg via-ody-bg/40 to-transparent" />

        {/* Back link */}
        <div className="absolute top-4 left-4">
          <Link
            to="/destination/$destinationId"
            params={{ destinationId: attraction.destinationId }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/90 text-sm hover:bg-black/60 transition-colors"
          >
            <ArrowLeft size={16} /> Back to {destination?.name || 'Destination'}
          </Link>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${typeBadge.bg} ${typeBadge.color}`}>
                {typeBadge.label}
              </span>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">{attraction.name}</h1>
              {destination && (
                <p className="text-white/70 flex items-center gap-1">
                  <MapPin size={14} /> {destination.name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {attraction.rating && (
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/90 text-sm">
                  <Star size={14} className="text-ody-warning fill-ody-warning" /> {attraction.rating}
                </span>
              )}
              {attraction.priceLevel && (
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/90 text-sm">
                  <PriceLevel level={attraction.priceLevel} />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Research Status Banner */}
      {attraction.researchStatus !== 'completed' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass-card p-4 flex items-center justify-between ${
            attraction.researchStatus === 'in_progress' ? 'border-ody-accent/30' : 'border-ody-warning/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              attraction.researchStatus === 'in_progress' ? 'bg-ody-accent/20' : 'bg-ody-warning/20'
            }`}>
              {attraction.researchStatus === 'in_progress' ? (
                <Clock size={20} className="text-ody-accent" />
              ) : (
                <Info size={20} className="text-ody-warning" />
              )}
            </div>
            <div>
              <p className="font-medium">
                {attraction.researchStatus === 'in_progress' ? 'Research in Progress' : 'Research Pending'}
              </p>
              <p className="text-sm text-ody-text-dim">
                {attraction.researchStatus === 'in_progress' 
                  ? 'We\'re gathering information about this attraction'
                  : 'Help us improve by requesting research on this attraction'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowResearchModal(true)}
            className="px-4 py-2 rounded-lg bg-ody-accent/10 text-ody-accent text-sm font-medium hover:bg-ody-accent/20 transition-colors"
          >
            Request Research
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {attraction.description && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold mb-3">About</h2>
              <ExpandableText text={attraction.description} />
            </motion.div>
          )}

          {/* History */}
          {attraction.history && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <History size={20} className="text-ody-accent" /> History
              </h2>
              <ExpandableText text={attraction.history} />
            </motion.div>
          )}

          {/* Visitor Tips */}
          {tips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lightbulb size={20} className="text-ody-warning" /> Visitor Tips
              </h2>
              <div className="space-y-3">
                {tips.map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-ody-bg border border-ody-border-subtle"
                  >
                    <div className="w-6 h-6 rounded-full bg-ody-accent/20 text-ody-accent flex items-center justify-center shrink-0 text-xs font-bold">
                      {i + 1}
                    </div>
                    <p className="text-sm text-ody-text-muted">{tip}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Photo Gallery */}
          {photos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Image size={20} className="text-ody-accent" /> Photos
              </h2>
              <PhotoGallery photos={photos} />
            </motion.div>
          )}
        </div>

        {/* Sidebar - Practical Info */}
        <div className="space-y-6">
          {/* Practical Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 space-y-5"
          >
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Info size={20} className="text-ody-accent" /> Practical Info
            </h2>

            {/* Hours */}
            {hours ? (
              <div className="space-y-2">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Clock size={14} className="text-ody-text-dim" /> Opening Hours
                </h3>
                <HoursTable hours={hours} />
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-ody-text-dim">
                <AlertCircle size={14} />
                <span>Hours not available</span>
              </div>
            )}

            {/* Tickets */}
            {formattedPrice ? (
              <div className="space-y-1">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Ticket size={14} className="text-ody-text-dim" /> Tickets
                </h3>
                <p className="text-lg font-semibold text-ody-accent">{formattedPrice}</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-ody-text-dim">
                <AlertCircle size={14} />
                <span>Ticket info not available</span>
              </div>
            )}

            {/* Address */}
            {attraction.address && (
              <div className="space-y-1">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <MapPin size={14} className="text-ody-text-dim" /> Address
                </h3>
                <p className="text-sm text-ody-text-muted">{attraction.address}</p>
              </div>
            )}

            {/* Contact */}
            {(attraction.phone || attraction.email) && (
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Contact</h3>
                {attraction.phone && (
                  <p className="text-sm text-ody-text-muted flex items-center gap-1">
                    <Phone size={12} /> {attraction.phone}
                  </p>
                )}
                {attraction.email && (
                  <p className="text-sm text-ody-text-muted flex items-center gap-1">
                    <Mail size={12} /> {attraction.email}
                  </p>
                )}
              </div>
            )}

            {/* Links */}
            <div className="space-y-2 pt-2 border-t border-ody-border/50">
              {attraction.bookingUrl && (
                <a
                  href={attraction.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-ody-accent text-white text-sm font-medium hover:bg-ody-accent-hover transition-colors"
                >
                  <Ticket size={14} /> Book Tickets
                </a>
              )}
              {attraction.officialUrl && (
                <a
                  href={attraction.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-ody-border text-sm hover:bg-ody-surface-hover transition-colors"
                >
                  <ExternalLink size={14} /> Official Website
                </a>
              )}
            </div>
          </motion.div>

          {/* Map */}
          {attraction.lat && attraction.lng && destination?.lat && destination?.lng && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Map size={20} className="text-ody-accent" /> Location
              </h2>
              <div className="h-48 rounded-lg overflow-hidden bg-ody-surface">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${Math.min(attraction.lng, destination.lng) - 0.01},${Math.min(attraction.lat, destination.lat) - 0.01},${Math.max(attraction.lng, destination.lng) + 0.01},${Math.max(attraction.lat, destination.lat) + 0.01}&layer=mapnik&marker=${attraction.lat},${attraction.lng}`}
                />
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${attraction.lat},${attraction.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-sm text-ody-accent hover:text-ody-accent-hover flex items-center gap-1"
              >
                <ExternalLink size={12} /> Open in Google Maps
              </a>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 space-y-3"
          >
            <h2 className="text-lg font-semibold mb-3">Actions</h2>
            {trip && (
              <button
                onClick={() => {/* TODO: Add to itinerary */}}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-ody-success/10 text-ody-success text-sm font-medium hover:bg-ody-success/20 transition-colors"
              >
                <CalendarPlus size={14} /> Add to Itinerary
              </button>
            )}
            {hasMissingInfo && (
              <button
                onClick={() => setShowResearchModal(true)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-ody-border text-sm hover:bg-ody-surface-hover transition-colors"
              >
                <AlertCircle size={14} /> Request More Research
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Research Request Modal */}
      <ResearchRequestModal
        attractionId={attraction.id}
        attractionName={attraction.name}
        destinationId={attraction.destinationId}
        tripId={trip?.id || ''}
        open={showResearchModal}
        onClose={() => setShowResearchModal(false)}
      />
    </div>
  );
}
