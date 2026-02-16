import { motion } from 'framer-motion';
import { Calendar, MapPin, Hotel, DollarSign, Luggage, Plane, CarFront, Clock, Users, Ticket, ClipboardList, Activity, Car, ArrowRight, CheckCircle2, Circle, Images } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import type { TripDetail, TripTab } from '../../types/trips';

interface OverviewTabProps {
  trip: TripDetail;
  onNavigate: (tab: TripTab) => void;
}

export function OverviewTab({ trip, onNavigate }: OverviewTabProps) {
  const now = new Date();
  const startDate = trip.startDate ? new Date(trip.startDate + 'T00:00:00') : null;
  const endDate = trip.endDate ? new Date(trip.endDate + 'T00:00:00') : null;

  // Countdown
  let countdownText = '';
  let countdownSubtext = '';
  if (startDate && endDate) {
    const diffMs = startDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      countdownText = `${diffDays}`;
      countdownSubtext = diffDays === 1 ? 'day to go' : 'days to go';
    } else if (diffDays === 0) {
      countdownText = '🎉';
      countdownSubtext = 'Trip starts today!';
    } else {
      const endDiff = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (endDiff >= 0) {
        countdownText = '✈️';
        countdownSubtext = 'Trip in progress!';
      } else {
        countdownText = '✅';
        countdownSubtext = 'Trip completed';
      }
    }
  }

  // Trip duration
  const tripDays = startDate && endDate
    ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  // Research progress
  const flightsTotal = trip.flights?.length || 0;
  const flightsConfirmed = trip.flights?.filter(f => f.status === 'confirmed').length || 0;
  const hotelsTotal = trip.accommodations?.length || 0;
  const hotelsBooked = trip.accommodations?.filter(a => a.booked).length || 0;
  const eventsTotal = trip.events?.length || 0;
  const eventsBooked = trip.events?.filter(e => e.status === 'booked' || e.status === 'confirmed').length || 0;
  const destinationsTotal = trip.destinations?.length || 0;
  const rentalCarsTotal = trip.rentalCars?.length || 0;
  const rentalCarsBooked = trip.rentalCars?.filter(r => r.status === 'booked').length || 0;

  // Budget
  const totalBudget = parseFloat(trip.totalBudget || '0');
  const budgetCategories = trip.budgetCategories || [];
  const budgetItems = trip.budgetItems || [];

  const categorySpending = budgetCategories.map(cat => {
    const items = budgetItems.filter(b => b.category === cat.category);
    const spent = items.reduce((s, b) => s + parseFloat(b.actualCost || '0'), 0);
    const estimated = items.reduce((s, b) => s + parseFloat(b.estimatedCost || '0'), 0);
    const allocated = parseFloat(cat.allocatedBudget || '0');
    return { ...cat, spent, estimated, allocated };
  });

  const totalSpent = budgetItems.reduce((s, b) => s + parseFloat(b.actualCost || '0'), 0);
  const totalEstimated = budgetItems.reduce((s, b) => s + parseFloat(b.estimatedCost || '0'), 0);
  const budgetUsedPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  // Packing
  const packingTotal = trip.packingItems?.length || 0;
  const packingPacked = trip.packingItems?.filter(p => p.packed).length || 0;

  // Destinations summary
  const destinationNames = (trip.destinations || [])
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(d => d.name);

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  const quickLinks: { id: TripTab; label: string; icon: typeof Calendar; count?: string }[] = [
    { id: 'itinerary', label: 'Itinerary', icon: Calendar, count: `${trip.itineraryItems?.length || 0} items` },
    { id: 'destinations', label: 'Destinations', icon: MapPin, count: `${destinationsTotal}` },
    { id: 'flights', label: 'Flights', icon: Plane, count: `${flightsConfirmed}/${flightsTotal}` },
    { id: 'accommodations', label: 'Hotels', icon: Hotel, count: `${hotelsBooked}/${hotelsTotal}` },
    { id: 'events', label: 'Events', icon: Ticket, count: `${eventsTotal}` },
    { id: 'budget', label: 'Budget', icon: DollarSign, count: totalBudget ? `${Math.round(budgetUsedPct)}%` : '—' },
    { id: 'packing', label: 'Packing', icon: Luggage, count: `${packingPacked}/${packingTotal}` },
    { id: 'rental-cars', label: 'Rental Cars', icon: CarFront, count: `${rentalCarsBooked}/${rentalCarsTotal}` },
    { id: 'research', label: 'Research', icon: ClipboardList },
    { id: 'price-tracking', label: 'Prices', icon: Activity },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Top row: Countdown + Trip Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Countdown */}
        {startDate && (
          <motion.div variants={item}
            className="bg-ody-surface border border-ody-border rounded-xl p-6 flex flex-col items-center justify-center text-center">
            <div className="text-5xl font-bold text-ody-accent mb-1">{countdownText}</div>
            <div className="text-ody-text-muted text-sm">{countdownSubtext}</div>
            {trip.startDate && trip.endDate && (
              <div className="mt-3 text-xs text-ody-text-dim">
                {trip.startDate} → {trip.endDate} · {tripDays} days
              </div>
            )}
          </motion.div>
        )}

        {/* Travelers & Destinations */}
        <motion.div variants={item}
          className="bg-ody-surface border border-ody-border rounded-xl p-6 md:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            {/* Travelers */}
            <div>
              <div className="flex items-center gap-2 text-ody-text-muted text-sm mb-2">
                <Users size={14} /> Travelers
              </div>
              {(trip.travelers?.length || 0) > 0 ? (
                <div className="space-y-1">
                  {trip.travelers.map(t => (
                    <div key={t.id} className="text-sm flex items-center gap-1.5">
                      {t.isPrimary && <span className="text-ody-accent text-xs">★</span>}
                      <span>{t.firstName} {t.lastName}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <button onClick={() => onNavigate('travelers')}
                  className="text-sm text-ody-accent hover:underline">+ Add travelers</button>
              )}
            </div>

            {/* Destinations */}
            <div>
              <div className="flex items-center gap-2 text-ody-text-muted text-sm mb-2">
                <MapPin size={14} /> Destinations
              </div>
              {destinationNames.length > 0 ? (
                <div className="text-sm text-ody-text space-y-0.5">
                  {destinationNames.slice(0, 5).map((name, i) => (
                    <div key={i}>{name}</div>
                  ))}
                  {destinationNames.length > 5 && (
                    <div className="text-ody-text-dim">+{destinationNames.length - 5} more</div>
                  )}
                </div>
              ) : (
                <button onClick={() => onNavigate('destinations')}
                  className="text-sm text-ody-accent hover:underline">+ Add destinations</button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Research Progress */}
      <motion.div variants={item}
        className="bg-ody-surface border border-ody-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-ody-text-muted uppercase tracking-wider mb-4">Research Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ProgressCard icon={Plane} label="Flights" done={flightsConfirmed} total={flightsTotal}
            onClick={() => onNavigate('flights')} />
          <ProgressCard icon={Hotel} label="Hotels" done={hotelsBooked} total={hotelsTotal}
            onClick={() => onNavigate('accommodations')} />
          <ProgressCard icon={Ticket} label="Events" done={eventsBooked} total={eventsTotal}
            onClick={() => onNavigate('events' as TripTab)} />
          <ProgressCard icon={CarFront} label="Rental Cars" done={rentalCarsBooked} total={rentalCarsTotal}
            onClick={() => onNavigate('rental-cars')} />
        </div>
      </motion.div>

      {/* Budget Summary */}
      {(totalBudget > 0 || budgetItems.length > 0) && (
        <motion.div variants={item}
          className="bg-ody-surface border border-ody-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ody-text-muted uppercase tracking-wider">Budget</h3>
            <button onClick={() => onNavigate('budget')}
              className="text-xs text-ody-accent hover:underline flex items-center gap-1">
              View details <ArrowRight size={12} />
            </button>
          </div>

          {/* Overall bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-ody-text">{trip.currency} {totalSpent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} spent</span>
              {totalBudget > 0 && (
                <span className="text-ody-text-dim">of {trip.currency} {totalBudget.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              )}
            </div>
            <div className="h-2 rounded-full bg-ody-surface-hover overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${budgetUsedPct > 90 ? 'bg-ody-danger' : budgetUsedPct > 70 ? 'bg-ody-warning' : 'bg-ody-accent'}`}
                initial={{ width: 0 }}
                animate={{ width: `${budgetUsedPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            {totalEstimated > 0 && totalEstimated !== totalSpent && (
              <div className="text-xs text-ody-text-dim mt-1">
                Estimated: {trip.currency} {totalEstimated.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
            )}
          </div>

          {/* Category breakdown */}
          {categorySpending.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categorySpending.map(cat => {
                const pct = cat.allocated > 0 ? Math.min((cat.spent / cat.allocated) * 100, 100) : 0;
                return (
                  <div key={cat.id} className="text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-ody-text capitalize">{cat.category}</span>
                      <span className="text-xs text-ody-text-dim">
                        {cat.spent > 0 ? `${trip.currency} ${cat.spent.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—'}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-ody-surface-hover overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: cat.color || 'var(--ody-accent)',
                        }}
                      />
                    </div>
                    {cat.allocated > 0 && (
                      <div className="text-[10px] text-ody-text-dim mt-0.5">
                        of {trip.currency} {cat.allocated.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Packing Progress */}
      {packingTotal > 0 && (
        <motion.div variants={item}
          className="bg-ody-surface border border-ody-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-ody-text-muted uppercase tracking-wider">Packing</h3>
            <button onClick={() => onNavigate('packing')}
              className="text-xs text-ody-accent hover:underline flex items-center gap-1">
              View list <ArrowRight size={12} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-ody-surface-hover overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-ody-success"
                initial={{ width: 0 }}
                animate={{ width: `${packingTotal > 0 ? (packingPacked / packingTotal) * 100 : 0}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <span className="text-sm text-ody-text-muted whitespace-nowrap">{packingPacked}/{packingTotal} packed</span>
          </div>
        </motion.div>
      )}

      {/* Quick Links */}
      <motion.div variants={item}>
        <h3 className="text-sm font-semibold text-ody-text-muted uppercase tracking-wider mb-3">Quick Links</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {quickLinks.map(link => {
            const Icon = link.icon;
            return (
              <button key={link.id} onClick={() => onNavigate(link.id)}
                className="flex items-center gap-2 p-3 rounded-lg bg-ody-surface border border-ody-border hover:border-ody-accent/50 hover:bg-ody-surface-hover transition-all text-left group">
                <Icon size={16} className="text-ody-text-dim group-hover:text-ody-accent transition-colors" />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{link.label}</div>
                  {link.count && <div className="text-[10px] text-ody-text-dim">{link.count}</div>}
                </div>
              </button>
            );
          })}
          <Link
            to="/trips/$tripId/bulk-images"
            params={{ tripId: trip.id }}
            className="flex items-center gap-2 p-3 rounded-lg bg-ody-accent/10 border border-ody-accent/30 hover:border-ody-accent/60 hover:bg-ody-accent/20 transition-all text-left group"
          >
            <Images size={16} className="text-ody-accent" />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">Find All Images</div>
              <div className="text-[10px] text-ody-text-dim">Bulk search</div>
            </div>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProgressCard({ icon: Icon, label, done, total, onClick }: {
  icon: typeof Plane; label: string; done: number; total: number; onClick: () => void;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const isComplete = total > 0 && done === total;

  return (
    <button onClick={onClick}
      className="flex flex-col p-3 rounded-lg bg-ody-bg border border-ody-border hover:border-ody-accent/50 transition-all text-left group">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className="text-ody-text-dim group-hover:text-ody-accent transition-colors" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {total > 0 ? (
          <>
            <div className="flex-1 h-1.5 rounded-full bg-ody-surface-hover overflow-hidden">
              <div className={`h-full rounded-full transition-all ${isComplete ? 'bg-ody-success' : 'bg-ody-accent'}`}
                style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-ody-text-dim whitespace-nowrap">
              {done}/{total}
            </span>
          </>
        ) : (
          <span className="text-xs text-ody-text-dim">None yet</span>
        )}
      </div>
    </button>
  );
}
