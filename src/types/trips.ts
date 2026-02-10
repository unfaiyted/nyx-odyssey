export interface Trip {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  totalBudget: string | null;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItineraryItem {
  id: string;
  tripId: string;
  title: string;
  description: string | null;
  date: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  category: string;
  orderIndex: number;
  completed: boolean;
  createdAt: string;
}

export interface TripDestination {
  id: string;
  tripId: string;
  name: string;
  description: string | null;
  lat: number | null;
  lng: number | null;
  arrivalDate: string | null;
  departureDate: string | null;
  photoUrl: string | null;
  status: string;
  researchStatus: string;
  orderIndex: number;
  createdAt: string;
}

export type ResearchStatus = 'pending' | 'researched' | 'approved' | 'booked';

export interface Accommodation {
  id: string;
  tripId: string;
  destinationId: string | null;
  name: string;
  type: string;
  status: string;
  address: string | null;
  checkIn: string | null;
  checkOut: string | null;
  confirmationCode: string | null;
  costPerNight: string | null;
  totalCost: string | null;
  currency: string;
  bookingUrl: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  rating: number | null;
  notes: string | null;
  booked: boolean;
  createdAt: string;
}

export interface BudgetItem {
  id: string;
  tripId: string;
  category: string;
  description: string;
  estimatedCost: string | null;
  actualCost: string | null;
  paid: boolean;
  date: string | null;
  createdAt: string;
}

export interface PackingItem {
  id: string;
  tripId: string;
  name: string;
  category: string;
  quantity: number;
  packed: boolean;
  createdAt: string;
}

export interface Flight {
  id: string;
  tripId: string;
  airline: string;
  flightNumber: string;
  confirmationCode: string | null;
  departureAirport: string;
  departureCity: string | null;
  arrivalAirport: string;
  arrivalCity: string | null;
  departureDate: string;
  departureTime: string | null;
  arrivalDate: string;
  arrivalTime: string | null;
  duration: string | null;
  seatNumber: string | null;
  class: string;
  status: string;
  notes: string | null;
  orderIndex: number;
  createdAt: string;
}

export interface TripRoute {
  id: string;
  tripId: string;
  fromDestinationId: string;
  toDestinationId: string;
  distanceKm: number | null;
  distanceMiles: number | null;
  durationMinutes: number | null;
  routeDescription: string | null;
  tolls: boolean;
  highway: boolean;
  notes: string | null;
  createdAt: string;
  fromDestination?: TripDestination;
  toDestination?: TripDestination;
}

export interface RentalCar {
  id: string;
  tripId: string;
  company: string;
  vehicleType: string;
  vehicleName: string | null;
  status: string;
  pickupLocation: string | null;
  dropoffLocation: string | null;
  pickupDate: string | null;
  pickupTime: string | null;
  dropoffDate: string | null;
  dropoffTime: string | null;
  dailyRate: string | null;
  totalCost: string | null;
  currency: string;
  confirmationCode: string | null;
  bookingUrl: string | null;
  insuranceIncluded: boolean;
  mileagePolicy: string | null;
  fuelPolicy: string | null;
  transmission: string;
  notes: string | null;
  rating: number | null;
  createdAt: string;
}

export interface TripCronJob {
  id: string;
  tripId: string;
  cronJobId: string;
  name: string;
  schedule: string;
  description: string | null;
  enabled: boolean;
  lastRun: string | null;
  lastStatus: string | null;
  nextRun: string | null;
  createdAt: string;
}

export interface TripDetail extends Trip {
  itineraryItems: ItineraryItem[];
  destinations: TripDestination[];
  accommodations: Accommodation[];
  budgetItems: BudgetItem[];
  budgetCategories: BudgetCategory[];
  packingItems: PackingItem[];
  flights: Flight[];
  rentalCars: RentalCar[];
  routes: TripRoute[];
  cronJobs: TripCronJob[];
}

export interface BudgetCategory {
  id: string;
  tripId: string;
  category: string;
  allocatedBudget: string;
  color: string | null;
  icon: string | null;
  createdAt: string;
}

export type TripTab = 'itinerary' | 'destinations' | 'research' | 'accommodations' | 'budget' | 'packing' | 'flights' | 'rental-cars' | 'routes' | 'schedule';
