import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, MapPin, Calendar, DollarSign } from 'lucide-react';
import { useState } from 'react';
import type { Trip } from '../types/trips';

export const Route = createFileRoute('/trips/')({
  component: TripsListPage,
});

function TripsListPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newTrip, setNewTrip] = useState({ name: '', description: '', startDate: '', endDate: '' });

  const { data: trips = [], isLoading } = useQuery<Trip[]>({
    queryKey: ['trips'],
    queryFn: () => fetch('/api/trips').then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof newTrip) => fetch('/api/trips', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      setShowCreate(false);
      setNewTrip({ name: '', description: '', startDate: '', endDate: '' });
    },
  });

  const statusColors: Record<string, string> = {
    planning: 'bg-ody-info/20 text-ody-info',
    active: 'bg-ody-success/20 text-ody-success',
    completed: 'bg-ody-text-muted/20 text-ody-text-muted',
    cancelled: 'bg-ody-danger/20 text-ody-danger',
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trips</h2>
          <p className="text-ody-text-muted mt-1">Plan and track your adventures</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ody-accent text-white hover:bg-ody-accent-hover transition-colors"
        >
          <Plus size={16} /> New Trip
        </button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 space-y-4">
          <h3 className="font-semibold text-lg">Create New Trip</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Trip name" value={newTrip.name}
              onChange={e => setNewTrip(p => ({ ...p, name: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm focus:border-ody-accent outline-none" />
            <input placeholder="Description" value={newTrip.description}
              onChange={e => setNewTrip(p => ({ ...p, description: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm focus:border-ody-accent outline-none" />
            <input type="date" value={newTrip.startDate}
              onChange={e => setNewTrip(p => ({ ...p, startDate: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm focus:border-ody-accent outline-none" />
            <input type="date" value={newTrip.endDate}
              onChange={e => setNewTrip(p => ({ ...p, endDate: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm focus:border-ody-accent outline-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => createMutation.mutate(newTrip)}
              disabled={!newTrip.name}
              className="px-4 py-2 rounded-lg bg-ody-accent text-white hover:bg-ody-accent-hover transition-colors disabled:opacity-50">
              Create
            </button>
            <button onClick={() => setShowCreate(false)}
              className="px-4 py-2 rounded-lg border border-ody-border hover:bg-ody-surface-hover transition-colors">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-ody-text-muted">Loading trips...</div>
      ) : trips.length === 0 ? (
        <div className="text-center py-12 text-ody-text-muted">No trips yet. Create your first adventure!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((trip, i) => (
            <motion.div key={trip.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}>
              <Link to="/trips/$tripId" params={{ tripId: trip.id }}
                className="block glass-card p-5 hover:border-ody-accent/50 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg group-hover:text-ody-accent transition-colors">{trip.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[trip.status] || statusColors.planning}`}>
                    {trip.status}
                  </span>
                </div>
                {trip.description && <p className="text-sm text-ody-text-muted mb-3 line-clamp-2">{trip.description}</p>}
                <div className="flex items-center gap-4 text-xs text-ody-text-dim">
                  {trip.startDate && (
                    <span className="flex items-center gap-1"><Calendar size={12} />{trip.startDate}</span>
                  )}
                  {trip.totalBudget && (
                    <span className="flex items-center gap-1"><DollarSign size={12} />{trip.totalBudget} {trip.currency}</span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
