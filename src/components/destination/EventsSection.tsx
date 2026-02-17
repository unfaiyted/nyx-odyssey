import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Ticket, ExternalLink, ChevronDown, ChevronUp, CalendarPlus, Tag } from 'lucide-react';
import { Link } from '@tanstack/react-router';

const EVENT_TYPE_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  performance: { label: 'Performance', emoji: '🎭', color: 'bg-purple-500/20 text-purple-400' },
  concert: { label: 'Concert', emoji: '🎵', color: 'bg-pink-500/20 text-pink-400' },
  sports: { label: 'Sports', emoji: '⚽', color: 'bg-green-500/20 text-green-400' },
  tour: { label: 'Tour', emoji: '🗺️', color: 'bg-blue-500/20 text-blue-400' },
  festival: { label: 'Festival', emoji: '🎉', color: 'bg-amber-500/20 text-amber-400' },
  exhibition: { label: 'Exhibition', emoji: '🖼️', color: 'bg-cyan-500/20 text-cyan-400' },
  market: { label: 'Market', emoji: '🛍️', color: 'bg-orange-500/20 text-orange-400' },
  other: { label: 'Event', emoji: '📅', color: 'bg-slate-500/20 text-slate-400' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  researched: { label: 'Researched', color: 'bg-ody-info/20 text-ody-info' },
  interested: { label: 'Interested', color: 'bg-ody-warning/20 text-ody-warning' },
  booked: { label: 'Booked', color: 'bg-ody-success/20 text-ody-success' },
  attended: { label: 'Attended', color: 'bg-purple-500/20 text-purple-400' },
};

interface EventData {
  id: string;
  destinationId: string;
  name: string;
  description: string | null;
  eventType: string | null;
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  venue: string | null;
  venueAddress: string | null;
  status: string | null;
  ticketUrl: string | null;
  bookingUrl: string | null;
  ticketPriceFrom: string | null;
  ticketPriceTo: string | null;
  totalCost: string | null;
  currency: string | null;
  imageUrl: string | null;
  notes: string | null;
}

interface Props {
  events: EventData[];
  tripId: string;
  startDate?: string | null;
  endDate?: string | null;
  onAddToItinerary?: (event: EventData) => void;
}

const INITIAL_COUNT = 4;

function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate) return '';
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const start = new Date(startDate + 'T00:00:00');
  if (!endDate || endDate === startDate) return start.toLocaleDateString('en-US', opts);
  const end = new Date(endDate + 'T00:00:00');
  if (start.getMonth() === end.getMonth()) {
    return `${start.toLocaleDateString('en-US', opts)}–${end.getDate()}`;
  }
  return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}`;
}

function formatTime(time: string | null): string {
  if (!time) return '';
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function formatPrice(from: string | null, to: string | null, currency: string | null): string | null {
  const cur = currency || 'EUR';
  const sym = cur === 'EUR' ? '€' : cur === 'GBP' ? '£' : '$';
  if (from && to && from !== to) return `${sym}${from}–${sym}${to}`;
  if (from) return `${sym}${from}`;
  if (to) return `${sym}${to}`;
  return null;
}

export function EventsSection({ events, tripId, startDate, endDate, onAddToItinerary }: Props) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? events : events.slice(0, INITIAL_COUNT);
  const hasMore = events.length > INITIAL_COUNT;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Ticket size={20} className="text-ody-accent" /> Events
        </h2>
        <span className="text-xs text-ody-text-dim">{events.length} event{events.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {displayed.map((event, i) => {
            const typeConfig = EVENT_TYPE_CONFIG[event.eventType || 'other'] || EVENT_TYPE_CONFIG.other;
            const statusConfig = STATUS_CONFIG[event.status || 'researched'] || STATUS_CONFIG.researched;
            const price = formatPrice(event.ticketPriceFrom, event.ticketPriceTo, event.currency);
            const dateStr = formatDateRange(event.startDate, event.endDate);
            const timeStr = event.startTime ? formatTime(event.startTime) : null;

            return (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-4 p-4 rounded-xl bg-ody-bg border border-ody-border-subtle hover:border-ody-accent/30 transition-colors group"
              >
                {/* Image */}
                {event.imageUrl && (
                  <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden">
                    <img
                      src={event.imageUrl}
                      alt={event.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate">{event.name}</h3>
                      {event.description && (
                        <p className="text-xs text-ody-text-muted line-clamp-2 mt-0.5">{event.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ody-text-dim">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${typeConfig.color}`}>
                      {typeConfig.emoji} {typeConfig.label}
                    </span>
                    {dateStr && (
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> {dateStr}
                      </span>
                    )}
                    {timeStr && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {timeStr}
                      </span>
                    )}
                    {event.venue && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin size={11} /> {event.venue}
                      </span>
                    )}
                    {price && (
                      <span className="flex items-center gap-1 text-ody-warning">
                        <Tag size={11} /> {price}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    {(event.ticketUrl || event.bookingUrl) && (
                      <a
                        href={event.ticketUrl || event.bookingUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-ody-accent hover:underline"
                      >
                        <ExternalLink size={11} /> Tickets
                      </a>
                    )}
                    {onAddToItinerary && (
                      <button
                        onClick={() => onAddToItinerary(event)}
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg bg-ody-accent/10 text-ody-accent hover:bg-ody-accent/20 transition-colors ml-auto"
                      >
                        <CalendarPlus size={11} /> Add to Itinerary
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Show More / Show Less */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-1.5 mx-auto text-sm text-ody-accent hover:text-ody-accent-hover transition-colors"
        >
          {showAll ? (
            <>Show Less <ChevronUp size={16} /></>
          ) : (
            <>Show All {events.length} Events <ChevronDown size={16} /></>
          )}
        </button>
      )}
    </motion.div>
  );
}
