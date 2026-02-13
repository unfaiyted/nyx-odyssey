import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import {
  Clock, Check, AlertCircle, Loader2, Search, Filter,
  ArrowUpDown, MapPin, Calendar, X, ChevronRight, Info
} from 'lucide-react';
import { getResearchRequests, getAttractionsResearchQueue, getRecentlyCompletedAttractions } from '../server/attractions';

interface Props {
  tripId?: string;
}

type Tab = 'queue' | 'completed' | 'requests';
type FilterStatus = 'all' | 'pending' | 'in_progress' | 'completed' | 'needs_review';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'text-ody-warning', bg: 'bg-ody-warning/10', icon: Clock },
  in_progress: { label: 'In Progress', color: 'text-ody-accent', bg: 'bg-ody-accent/10', icon: Loader2 },
  completed: { label: 'Completed', color: 'text-ody-success', bg: 'bg-ody-success/10', icon: Check },
  needs_review: { label: 'Needs Review', color: 'text-ody-error', bg: 'bg-ody-error/10', icon: AlertCircle },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-ody-text-dim' },
  medium: { label: 'Medium', color: 'text-ody-warning' },
  high: { label: 'High', color: 'text-ody-error' },
};

export function AttractionsQueueDashboard({ tripId }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('queue');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: queueData, isLoading: queueLoading } = useQuery({
    queryKey: ['attractions-queue', tripId, statusFilter],
    queryFn: () => getAttractionsResearchQueue({
      data: {
        tripId,
        status: statusFilter === 'all' ? undefined : statusFilter,
      },
    }),
  });

  const { data: completedData, isLoading: completedLoading } = useQuery({
    queryKey: ['attractions-completed', tripId],
    queryFn: () => getRecentlyCompletedAttractions({
      data: { tripId, limit: 20 },
    }),
  });

  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ['research-requests', tripId],
    queryFn: () => getResearchRequests({
      data: { tripId, limit: 50 },
    }),
  });

  const isLoading = queueLoading || completedLoading || requestsLoading;

  const filterBySearch = (items: any[]) => {
    if (!searchQuery) return items;
    return items.filter(item => 
      item.attraction?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.attraction?.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.destination?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredQueue = filterBySearch(queueData || []);
  const filteredCompleted = filterBySearch(completedData || []);
  const filteredRequests = filterBySearch(requestsData || []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Info size={20} className="text-ody-accent" />
          Attractions Research
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-ody-border/50">
        {[
          { key: 'queue', label: 'Research Queue', count: filteredQueue.length },
          { key: 'completed', label: 'Recently Completed', count: filteredCompleted.length },
          { key: 'requests', label: 'My Requests', count: filteredRequests.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as Tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-ody-accent text-ody-accent'
                : 'border-transparent text-ody-text-dim hover:text-ody-text'
            }`}
          >
            {tab.label}
            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-ody-surface text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ody-text-dim" />
          <input
            type="text"
            placeholder="Search attractions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-ody-surface border border-ody-border/50 text-sm focus:border-ody-accent outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ody-text-dim hover:text-ody-text"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {activeTab === 'queue' && (
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as FilterStatus)}
            className="px-3 py-2 rounded-lg bg-ody-surface border border-ody-border/50 text-sm focus:border-ody-accent outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="needs_review">Needs Review</option>
          </select>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-ody-accent" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {/* Queue Tab */}
          {activeTab === 'queue' && (
            <motion.div
              key="queue"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {filteredQueue.length === 0 ? (
                <div className="text-center py-12 text-ody-text-dim">
                  <Check size={48} className="mx-auto mb-4 opacity-30" />
                  <p>All attractions are up to date!</p>
                </div>
              ) : (
                filteredQueue.map(({ attraction, destination }, i) => {
                  const status = STATUS_CONFIG[attraction.researchStatus || 'pending'];
                  const Icon = status.icon;
                  const priority = PRIORITY_CONFIG[attraction.researchPriority || 'low'];

                  return (
                    <motion.div
                      key={attraction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card p-4 flex items-center gap-4 hover:border-ody-accent/30 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-full ${status.bg} flex items-center justify-center shrink-0`}>
                        <Icon size={20} className={status.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{attraction.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                          <span className={`text-xs ${priority.color}`}>
                            {priority.label} Priority
                          </span>
                        </div>
                        <p className="text-sm text-ody-text-dim flex items-center gap-2 mt-1">
                          <MapPin size={12} /> {destination?.name}
                          {attraction.researchRequestedAt && (
                            <>
                              <span className="mx-1">•</span>
                              <Calendar size={12} />
                              Requested {new Date(attraction.researchRequestedAt).toLocaleDateString()}
                            </>
                          )}
                        </p>
                      </div>
                      <Link
                        to="/attractions/$attractionId"
                        params={{ attractionId: attraction.id }}
                        className="p-2 rounded-lg hover:bg-ody-surface transition-colors"
                      >
                        <ChevronRight size={20} className="text-ody-text-dim" />
                      </Link>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {/* Completed Tab */}
          {activeTab === 'completed' && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {filteredCompleted.length === 0 ? (
                <div className="text-center py-12 text-ody-text-dim">
                  <Clock size={48} className="mx-auto mb-4 opacity-30" />
                  <p>No completed research yet</p>
                </div>
              ) : (
                filteredCompleted.map(({ attraction, destination }, i) => (
                  <motion.div
                    key={attraction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-4 flex items-center gap-4 hover:border-ody-success/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-ody-success/10 flex items-center justify-center shrink-0">
                      <Check size={20} className="text-ody-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{attraction.name}</h3>
                      <p className="text-sm text-ody-text-dim flex items-center gap-2 mt-1">
                        <MapPin size={12} /> {destination?.name}
                        {attraction.researchCompletedAt && (
                          <>
                            <span className="mx-1">•</span>
                            <Calendar size={12} />
                            Completed {new Date(attraction.researchCompletedAt).toLocaleDateString()}
                          </>
                        )}
                      </p>
                    </div>
                    <Link
                      to="/attractions/$attractionId"
                      params={{ attractionId: attraction.id }}
                      className="p-2 rounded-lg hover:bg-ody-surface transition-colors"
                    >
                      <ChevronRight size={20} className="text-ody-text-dim" />
                    </Link>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12 text-ody-text-dim">
                  <Info size={48} className="mx-auto mb-4 opacity-30" />
                  <p>No research requests yet</p>
                </div>
              ) : (
                filteredRequests.map(({ request, attraction, destination }, i) => {
                  const missingItems = [
                    request.missingHours && 'Hours',
                    request.missingTickets && 'Tickets',
                    request.missingPhotos && 'Photos',
                    request.missingHistory && 'History',
                    request.missingTips && 'Tips',
                    request.missingBookingLinks && 'Booking',
                  ].filter(Boolean);

                  return (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">
                            {attraction?.name || 'Unknown Attraction'}
                          </h3>
                          <p className="text-sm text-ody-text-dim flex items-center gap-2 mt-1">
                            <MapPin size={12} /> {destination?.name}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${STATUS_CONFIG[request.status]?.bg || 'bg-ody-surface'} ${STATUS_CONFIG[request.status]?.color || 'text-ody-text-dim'}`}>
                          {STATUS_CONFIG[request.status]?.label || request.status}
                        </span>
                      </div>
                      
                      {missingItems.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {missingItems.map(item => (
                            <span key={item} className="text-xs px-2 py-0.5 rounded bg-ody-accent/10 text-ody-accent">
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {request.notes && (
                        <p className="text-sm text-ody-text-dim italic">
                          "{request.notes}"
                        </p>
                      )}
                      
                      <p className="text-xs text-ody-text-muted">
                        Submitted {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
