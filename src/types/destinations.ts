export interface Destination {
  id: string;
  name: string;
  description: string | null;
  lat: number;
  lng: number;
  address: string | null;
  category: string | null;
  orderIndex: number;
  visited: boolean | null;
  plannedDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  id: string;
  fromDestinationId: string;
  toDestinationId: string;
  distanceMiles: number | null;
  durationMinutes: number | null;
  polyline: string | null;
  createdAt: string;
}
