import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Hotel, DollarSign, Luggage, Plane, Car, ClipboardList } from 'lucide-react';
import type { TripDetail, TripTab } from '../types/trips';
import { ItineraryTab } from '../components/trip/ItineraryTab';
import { DestinationsTab } from '../components/trip/DestinationsTab';
import { AccommodationsTab } from '../components/trip/AccommodationsTab';
import { BudgetTab } from '../components/trip/BudgetTab';
import { PackingTab } from '../components/trip/PackingTab';
import { RoutesTab } from '../components/trip/RoutesTab';
import { FlightsTab } from '../components/trip/FlightsTab';
import { ResearchBoard } from '../components/trip/ResearchBoard';

export const Route = createFileRoute('/trips/$tripId')({
  component: TripDetailPage,
});

const tabs: { id: TripTab; label: string; icon: typeof Calendar }[] = [
  { id: 'itinerary', label: 'Itinerary', icon: Calendar },
  { id: 'destinations', label: 'Destinations', icon: MapPin },
  { id: 'research', label: 'Research Board', icon: ClipboardList },
  { id: 'accommodations', label: 'Accommodations', icon: Hotel },
  { id: 'budget', label: 'Budget', icon: DollarSign },
  { id: 'packing', label: 'Packing List', icon: Luggage },
  { id: 'flights', label: 'Flights', icon: Plane },
  { id: 'routes', label: 'Driving Routes', icon: Car },
];

function TripDetailPage() {
  const { tripId } = Route.useParams();
  const [activeTab, setActiveTab] = useState<TripTab>('itinerary');

  const { data: trip, isLoading } = useQuery<TripDetail>({
    queryKey: ['trip', tripId],
    queryFn: () => fetch(`/api/trips/${tripId}`).then(r => r.json()),
  });

  if (isLoading) return <div className="text-center py-12 text-ody-text-muted">Loading trip...</div>;
  if (!trip) return <div className="text-center py-12 text-ody-text-muted">Trip not found</div>;

  const statusColors: Record<string, string> = {
    planning: 'bg-ody-info/20 text-ody-info',
    active: 'bg-ody-success/20 text-ody-success',
    completed: 'bg-ody-text-muted/20 text-ody-text-muted',
    cancelled: 'bg-ody-danger/20 text-ody-danger',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link to="/trips" className="mt-1 p-2 rounded-lg hover:bg-ody-surface-hover transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold">{trip.name}</h2>
            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[trip.status] || statusColors.planning}`}>
              {trip.status}
            </span>
          </div>
          {trip.description && <p className="text-ody-text-muted">{trip.description}</p>}
          <div className="flex items-center gap-4 mt-2 text-sm text-ody-text-dim">
            {trip.startDate && trip.endDate && (
              <span className="flex items-center gap-1">
                <Calendar size={14} /> {trip.startDate} → {trip.endDate}
              </span>
            )}
            {trip.totalBudget && (
              <span className="flex items-center gap-1">
                <DollarSign size={14} /> {trip.totalBudget} {trip.currency}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-ody-border">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap
                  ${isActive ? 'text-ody-accent' : 'text-ody-text-muted hover:text-ody-text'}`}>
                <Icon size={16} />
                {tab.label}
                {isActive && (
                  <motion.div layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-ody-accent rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}>
          {activeTab === 'itinerary' && <ItineraryTab tripId={tripId} items={trip.itineraryItems} />}
          {activeTab === 'destinations' && <DestinationsTab tripId={tripId} items={trip.destinations} />}
          {activeTab === 'research' && <ResearchBoard tripId={tripId} items={trip.destinations} />}
          {activeTab === 'accommodations' && <AccommodationsTab tripId={tripId} items={trip.accommodations} />}
          {activeTab === 'budget' && <BudgetTab tripId={tripId} items={trip.budgetItems} totalBudget={trip.totalBudget} currency={trip.currency} />}
          {activeTab === 'packing' && <PackingTab tripId={tripId} items={trip.packingItems} />}
          {activeTab === 'flights' && <FlightsTab tripId={tripId} items={trip.flights} />}
          {activeTab === 'routes' && <RoutesTab tripId={tripId} routes={trip.routes || []} destinations={trip.destinations} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
