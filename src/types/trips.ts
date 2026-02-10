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
  orderIndex: number;
  createdAt: string;
}

export interface Accommodation {
  id: string;
  tripId: string;
  name: string;
  type: string;
  address: string | null;
  checkIn: string | null;
  checkOut: string | null;
  confirmationCode: string | null;
  costPerNight: string | null;
  totalCost: string | null;
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

export interface TripDetail extends Trip {
  itineraryItems: ItineraryItem[];
  destinations: TripDestination[];
  accommodations: Accommodation[];
  budgetItems: BudgetItem[];
  packingItems: PackingItem[];
  flights: Flight[];
}

export type TripTab = 'itinerary' | 'destinations' | 'accommodations' | 'budget' | 'packing' | 'flights';
