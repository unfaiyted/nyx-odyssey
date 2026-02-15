import { createFileRoute, Link, useNavigate, useSearch } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTrip, updateTrip, deleteTrip } from '../server/fns/trips';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Hotel, DollarSign, Luggage, Plane, Car, CarFront, ClipboardList, Clock, Settings,  Users, Ticket, LayoutDashboard } from 'lucide-react';
import { z } from 'zod';
import { useState } from 'react';
import type { Trip, TripDetail, TripTab } from '../types/trips';
import { ItineraryTab } from '../components/trip/ItineraryTab';
import { DestinationsTab } from '../components/trip/DestinationsTab';
import { AccommodationsTab } from '../components/trip/AccommodationsTab';
import { BudgetTab } from '../components/trip/BudgetTab';
import { PackingTab } from '../components/trip/PackingTab';
import { RoutesTab } from '../components/trip/RoutesTab';
import { FlightsTab } from '../components/trip/FlightsTab';
import { ResearchBoard } from '../components/trip/ResearchBoard';
import { RentalCarsTab } from '../components/trip/RentalCarsTab';
import { ScheduleTab } from '../components/trip/ScheduleTab';
import { TravelersTab } from '../components/trip/TravelersTab';
import { EventsTab } from '../components/trip/EventsTab';
import { TripKebabMenu } from '../components/trip/TripKebabMenu';
import { EditTripModal } from '../components/trip/EditTripModal';
import { DeleteTripModal } from '../components/trip/DeleteTripModal';
import { OverviewTab } from '../components/trip/OverviewTab';

// Define valid tabs
const validTabs: TripTab[] = [
  'overview', 'itinerary', 'destinations', 'research', 'accommodations', 'budget', 
  'packing', 'flights', 'rental-cars', 'routes', 'schedule', 'travelers', 'events'
];

// Search params schema with tab validation
const searchSchema = z.object({
  tab: z.enum(validTabs as [string, ...string[]]).optional().catch('overview'),
});

export const Route = createFileRoute('/trips/$tripId')({
  component: TripDetailPage,
  validateSearch: searchSchema,
});

const tabs: { id: TripTab; label: string; icon: typeof Calendar }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'itinerary', label: 'Itinerary', icon: Calendar },
  { id: 'destinations', label: 'Destinations', icon: MapPin },
  { id: 'research', label: 'Research Board', icon: ClipboardList },
  { id: 'accommodations', label: 'Accommodations', icon: Hotel },
  { id: 'budget', label: 'Budget', icon: DollarSign },
  { id: 'packing', label: 'Packing List', icon: Luggage },
  { id: 'flights', label: 'Flights', icon: Plane },
  { id: 'rental-cars', label: 'Rental Cars', icon: CarFront },
  { id: 'routes', label: 'Driving Routes', icon: Car },
  { id: 'schedule', label: 'Schedule', icon: Clock },
  { id: 'travelers', label: 'Travelers', icon: Users },
  { id: 'events', label: 'Events', icon: Ticket },
];

function TripDetailPage() {
  const { tripId } = Route.useParams();
  const navigate = useNavigate({ from: Route.fullPath });
  const search = useSearch({ from: Route.fullPath });
  const queryClient = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  
  // Get active tab from URL or default to 'itinerary'
  const activeTab = search.tab || 'overview';

  const { data: trip, isLoading } = useQuery<TripDetail>({
    queryKey: ['trip', tripId],
    queryFn: () => getTrip({ data: { tripId } }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Trip>) => updateTrip({ data: { tripId, data } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      setShowEdit(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTrip({ data: { tripId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      navigate({ to: '/trips' });
    },
  });

  const handleArchiveToggle = () => {
    if (!trip) return;
    const newStatus = trip.status === 'archived' ? 'planning' : 'archived';
    updateMutation.mutate({ status: newStatus } as Partial<Trip>);
  };

  // Handle tab change - updates URL with replaceState
  const handleTabChange = (tabId: TripTab) => {
    navigate({
      search: (prev) => ({ ...prev, tab: tabId }),
      replace: true, // Use replaceState so back button doesn't cycle through tabs
    });
  };

  if (isLoading) return <div className="text-center py-12 text-ody-text-muted">Loading trip...</div>;
  if (!trip) return <div className="text-center py-12 text-ody-text-muted">Trip not found</div>;

  const statusColors: Record<string, string> = {
    planning: 'bg-ody-info/20 text-ody-info',
    active: 'bg-ody-success/20 text-ody-success',
    completed: 'bg-ody-text-muted/20 text-ody-text-muted',
    cancelled: 'bg-ody-danger/20 text-ody-danger',
    archived: 'bg-ody-text-dim/20 text-ody-text-dim',
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
            {(trip.travelers?.length || 0) > 0 && (
              <span className="flex items-center gap-1">
                <Users size={14} /> {trip.travelers.length} {trip.travelers.length === 1 ? 'traveler' : 'travelers'}
              </span>
            )}
          </div>
        </div>
        <TripKebabMenu
          isArchived={trip.status === 'archived'}
          onEdit={() => setShowEdit(true)}
          onArchive={handleArchiveToggle}
          onDelete={() => setShowDelete(true)}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-ody-border">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)}
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
          {activeTab === 'overview' && <OverviewTab trip={trip} onNavigate={handleTabChange} />}
          {activeTab === 'itinerary' && <ItineraryTab tripId={tripId} items={trip.itineraryItems} startDate={trip.startDate} endDate={trip.endDate} destinations={trip.destinations} />}
          {activeTab === 'destinations' && <DestinationsTab tripId={tripId} items={trip.destinations} activeTab={activeTab} />}
          {activeTab === 'research' && <ResearchBoard tripId={tripId} items={trip.destinations} activeTab={activeTab} />}
          {activeTab === 'accommodations' && <AccommodationsTab tripId={tripId} items={trip.accommodations} destinations={trip.destinations} />}
          {activeTab === 'budget' && <BudgetTab tripId={tripId} items={trip.budgetItems} budgetCategories={trip.budgetCategories || []} totalBudget={trip.totalBudget} currency={trip.currency} startDate={trip.startDate} endDate={trip.endDate} />}
          {activeTab === 'packing' && <PackingTab tripId={tripId} items={trip.packingItems} />}
          {activeTab === 'flights' && <FlightsTab tripId={tripId} items={trip.flights} />}
          {activeTab === 'rental-cars' && <RentalCarsTab tripId={tripId} items={trip.rentalCars || []} />}
          {activeTab === 'routes' && <RoutesTab tripId={tripId} routes={trip.routes || []} destinations={trip.destinations} homeBaseName={trip.homeBaseName} />}
          {activeTab === 'schedule' && <ScheduleTab tripId={tripId} cronJobs={trip.cronJobs || []} />}
          {activeTab === 'travelers' && <TravelersTab tripId={tripId} items={trip.travelers || []} />}
          {activeTab === 'events' && <EventsTab tripId={tripId} items={trip.events || []} destinations={trip.destinations} />}
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      <EditTripModal
        trip={trip}
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSave={(data) => updateMutation.mutate(data)}
        saving={updateMutation.isPending}
      />
      <DeleteTripModal
        tripName={trip.name}
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
        deleting={deleteMutation.isPending}
      />
    </div>
  );
}
