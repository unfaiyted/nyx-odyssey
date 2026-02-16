import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTripItemsForBulkImages, bulkUpdateImages } from '../server/bulk-images';
import type { BulkImageItem } from '../server/bulk-images';
import { findDestinationImages } from '../server/destination-image';
import { findHighlightImages } from '../server/highlight-detail';
import { findEventImages } from '../server/event-image';
import type { CandidateImage } from '../server/destination-image';
import { getTrip } from '../server/fns/trips';
import { ImagePickerModal } from '../components/ImagePickerModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useRef } from 'react';
import {
  ArrowLeft, Images, Check, X, SkipForward, Loader2,
  CheckCheck, ImageOff, Search, RotateCcw, Grid3X3,
} from 'lucide-react';

export const Route = createFileRoute('/trips/$tripId/bulk-images')({
  component: BulkImageReviewPage,
});

type ItemStatus = 'pending' | 'searching' | 'found' | 'no-results' | 'selected' | 'skipped' | 'has-image';

interface ItemState {
  status: ItemStatus;
  candidates: CandidateImage[];
  suggested: CandidateImage | null;
  selectedUrl: string | null;
}

function BulkImageReviewPage() {
  const { tripId } = Route.useParams();
  const queryClient = useQueryClient();

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => getTrip({ data: { tripId } }),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['bulk-images', tripId],
    queryFn: () => getTripItemsForBulkImages({ data: { tripId } }),
  });

  const [itemStates, setItemStates] = useState<Record<string, ItemState>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [pickerItem, setPickerItem] = useState<BulkImageItem | null>(null);
  const abortRef = useRef(false);

  const items = data?.items || [];

  // Group items by destination
  const grouped = items.reduce<Record<string, { destName: string; items: BulkImageItem[] }>>((acc, item) => {
    if (!acc[item.destinationId]) {
      acc[item.destinationId] = { destName: item.destinationName, items: [] };
    }
    acc[item.destinationId].items.push(item);
    return acc;
  }, {});

  const getState = (id: string): ItemState =>
    itemStates[id] || { status: 'pending', candidates: [], suggested: null, selectedUrl: null };

  const updateState = useCallback((id: string, patch: Partial<ItemState>) => {
    setItemStates(prev => ({
      ...prev,
      [id]: { ...prev[id] || { status: 'pending', candidates: [], suggested: null, selectedUrl: null }, ...patch },
    }));
  }, []);

  // Search images for a single item
  const searchItem = useCallback(async (item: BulkImageItem): Promise<CandidateImage[]> => {
    try {
      updateState(item.id, { status: 'searching' });

      let candidates: CandidateImage[];
      switch (item.type) {
        case 'destination':
          candidates = await findDestinationImages({
            data: { destinationName: item.name, websiteUrl: item.websiteUrl || undefined },
          });
          break;
        case 'highlight':
          candidates = await findHighlightImages({
            data: { highlightTitle: item.name, destinationName: item.destinationName, websiteUrl: item.websiteUrl || undefined },
          });
          break;
        case 'event':
          candidates = await findEventImages({
            data: { eventName: item.name, venue: item.searchContext, destinationName: item.destinationName, extractUrl: item.websiteUrl || undefined },
          });
          break;
        default:
          candidates = [];
      }

      const suggested = candidates[0] || null;
      updateState(item.id, {
        status: candidates.length > 0 ? 'found' : 'no-results',
        candidates,
        suggested,
        selectedUrl: suggested?.url || null,
      });
      return candidates;
    } catch (err) {
      console.error(`Search failed for ${item.name}:`, err);
      updateState(item.id, { status: 'no-results', candidates: [], suggested: null });
      return [];
    }
  }, [updateState]);

  // Process all items (rate-limited to 3 concurrent)
  const processAll = useCallback(async () => {
    abortRef.current = false;
    setIsProcessing(true);

    // Only process items without images
    const toProcess = items.filter(item => {
      const state = getState(item.id);
      return !item.currentImage && state.status === 'pending';
    });

    // Mark items with images
    for (const item of items) {
      if (item.currentImage && getState(item.id).status === 'pending') {
        updateState(item.id, { status: 'has-image' });
      }
    }

    // Process with concurrency limit of 3
    const concurrency = 3;
    let i = 0;
    const next = async (): Promise<void> => {
      while (i < toProcess.length && !abortRef.current) {
        const item = toProcess[i++];
        await searchItem(item);
      }
    };

    await Promise.all(Array.from({ length: Math.min(concurrency, toProcess.length) }, () => next()));
    setIsProcessing(false);
  }, [items, itemStates, searchItem, updateState]);

  // Accept all suggested images
  const saveMutation = useMutation({
    mutationFn: (updates: { type: 'destination' | 'highlight' | 'event'; id: string; imageUrl: string }[]) =>
      bulkUpdateImages({ data: { updates } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      queryClient.invalidateQueries({ queryKey: ['bulk-images', tripId] });
    },
  });

  const acceptItem = useCallback((id: string) => {
    updateState(id, { status: 'selected' });
  }, [updateState]);

  const skipItem = useCallback((id: string) => {
    updateState(id, { status: 'skipped' });
  }, [updateState]);

  const acceptAll = useCallback(() => {
    for (const item of items) {
      const state = getState(item.id);
      if (state.status === 'found' && state.selectedUrl) {
        updateState(item.id, { status: 'selected' });
      }
    }
  }, [items, itemStates, updateState]);

  const saveAll = useCallback(() => {
    const updates: { type: 'destination' | 'highlight' | 'event'; id: string; imageUrl: string }[] = [];
    for (const item of items) {
      const state = getState(item.id);
      if (state.status === 'selected' && state.selectedUrl) {
        updates.push({ type: item.type, id: item.id, imageUrl: state.selectedUrl });
      }
    }
    if (updates.length > 0) saveMutation.mutate(updates);
  }, [items, itemStates, saveMutation]);

  // Stats
  const stats = items.reduce(
    (acc, item) => {
      const s = getState(item.id).status;
      if (s === 'found' || s === 'selected') acc.found++;
      else if (s === 'skipped') acc.skipped++;
      else if (s === 'no-results') acc.noResults++;
      else if (s === 'has-image') acc.hasImage++;
      else if (s === 'searching') acc.searching++;
      else acc.pending++;
      return acc;
    },
    { found: 0, skipped: 0, noResults: 0, hasImage: 0, searching: 0, pending: 0 },
  );

  const totalToProcess = items.filter(i => !i.currentImage).length;
  const processed = stats.found + stats.noResults + stats.skipped;
  const progressPct = totalToProcess > 0 ? Math.round((processed / totalToProcess) * 100) : 0;
  const selectedCount = items.filter(i => getState(i.id).status === 'selected').length;

  return (
    <div className="min-h-screen bg-ody-bg text-ody-text">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-ody-surface border-b border-ody-border px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <Link
              to="/trips/$tripId"
              params={{ tripId }}
              search={{ tab: 'overview' }}
              className="p-2 rounded-lg hover:bg-ody-bg transition-colors text-ody-text-dim"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Images size={24} className="text-ody-accent" />
                Bulk Image Finder
              </h1>
              {trip && <p className="text-sm text-ody-text-dim">{trip.name}</p>}
            </div>
            <div className="flex items-center gap-2">
              {!isProcessing && processed === 0 && (
                <button
                  onClick={processAll}
                  disabled={isLoading || items.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ody-accent text-white font-medium hover:bg-ody-accent-hover transition-colors disabled:opacity-50"
                >
                  <Search size={16} /> Find All Images
                </button>
              )}
              {isProcessing && (
                <button
                  onClick={() => { abortRef.current = true; }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition-colors"
                >
                  <X size={16} /> Stop
                </button>
              )}
              {!isProcessing && stats.found > 0 && (
                <button
                  onClick={acceptAll}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 font-medium hover:bg-emerald-500/30 transition-colors"
                >
                  <CheckCheck size={16} /> Accept All ({stats.found})
                </button>
              )}
              {selectedCount > 0 && (
                <button
                  onClick={saveAll}
                  disabled={saveMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ody-accent text-white font-medium hover:bg-ody-accent-hover transition-colors disabled:opacity-50"
                >
                  {saveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Save {selectedCount} Image{selectedCount !== 1 ? 's' : ''}
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {(isProcessing || processed > 0) && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-ody-text-dim">
                <span>{processed} / {totalToProcess} processed</span>
                <span className="flex gap-3">
                  <span className="text-emerald-400">{stats.found} found</span>
                  <span className="text-amber-400">{stats.skipped} skipped</span>
                  <span className="text-red-400">{stats.noResults} no results</span>
                  <span className="text-ody-text-dim">{stats.hasImage} already have images</span>
                </span>
              </div>
              <div className="h-2 bg-ody-bg rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-ody-accent rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {saveMutation.isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
            >
              ✓ Images saved successfully!
            </motion.div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-ody-accent" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-ody-text-dim">
            <ImageOff size={48} className="mb-3" />
            <p>No destinations, highlights, or events found for this trip.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([destId, group]) => (
            <div key={destId}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Grid3X3 size={18} className="text-ody-accent" />
                {group.destName}
                <span className="text-sm text-ody-text-dim font-normal">({group.items.length} items)</span>
              </h2>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <BulkImageItemRow
                    key={item.id}
                    item={item}
                    state={getState(item.id)}
                    onAccept={() => acceptItem(item.id)}
                    onSkip={() => skipItem(item.id)}
                    onBrowse={() => setPickerItem(item)}
                    onRetry={() => searchItem(item)}
                    onSelectUrl={(url) => updateState(item.id, { selectedUrl: url, status: 'found' })}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Image Picker Modal for browsing alternatives */}
      {pickerItem && (
        <ImagePickerModal
          open={!!pickerItem}
          images={getState(pickerItem.id).candidates}
          loading={getState(pickerItem.id).status === 'searching'}
          onSelect={(url) => {
            updateState(pickerItem.id, { selectedUrl: url, status: 'found' });
            setPickerItem(null);
          }}
          onClose={() => setPickerItem(null)}
        />
      )}
    </div>
  );
}

// ── BulkImageItemRow ──────────────────────────────────

interface BulkImageItemRowProps {
  item: BulkImageItem;
  state: ItemState;
  onAccept: () => void;
  onSkip: () => void;
  onBrowse: () => void;
  onRetry: () => void;
  onSelectUrl: (url: string) => void;
}

const TYPE_BADGES: Record<string, { label: string; color: string }> = {
  destination: { label: 'Destination', color: 'bg-blue-500/20 text-blue-400' },
  highlight: { label: 'Highlight', color: 'bg-purple-500/20 text-purple-400' },
  event: { label: 'Event', color: 'bg-amber-500/20 text-amber-400' },
};

const STATUS_COLORS: Record<ItemStatus, string> = {
  pending: 'border-ody-border',
  searching: 'border-ody-accent/50',
  found: 'border-emerald-500/30',
  'no-results': 'border-red-500/30',
  selected: 'border-emerald-500/60 bg-emerald-500/5',
  skipped: 'border-ody-border opacity-50',
  'has-image': 'border-ody-border opacity-60',
};

function BulkImageItemRow({ item, state, onAccept, onSkip, onBrowse, onRetry, onSelectUrl }: BulkImageItemRowProps) {
  const badge = TYPE_BADGES[item.type];

  return (
    <motion.div
      layout
      className={`flex items-center gap-4 p-4 rounded-xl border ${STATUS_COLORS[state.status]} bg-ody-surface transition-colors`}
    >
      {/* Current image */}
      <div className="w-20 h-14 rounded-lg overflow-hidden bg-ody-bg flex-shrink-0">
        {item.currentImage ? (
          <img src={item.currentImage} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ody-text-dim">
            <ImageOff size={16} />
          </div>
        )}
      </div>

      {/* Arrow */}
      {state.suggested && (
        <span className="text-ody-text-dim text-lg">→</span>
      )}

      {/* Suggested image */}
      {state.suggested && (
        <div className="w-20 h-14 rounded-lg overflow-hidden bg-ody-bg flex-shrink-0 ring-2 ring-ody-accent/30">
          <img
            src={state.suggested.thumbnailUrl || state.suggested.url}
            alt="Suggested"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${badge.color}`}>
            {badge.label}
          </span>
          <span className="font-medium truncate">{item.name}</span>
        </div>
        <div className="text-xs text-ody-text-dim mt-0.5">
          {state.status === 'searching' && (
            <span className="flex items-center gap-1 text-ody-accent">
              <Loader2 size={12} className="animate-spin" /> Searching...
            </span>
          )}
          {state.status === 'found' && (
            <span className="text-emerald-400">{state.candidates.length} images found</span>
          )}
          {state.status === 'no-results' && (
            <span className="text-red-400">No images found</span>
          )}
          {state.status === 'selected' && (
            <span className="text-emerald-400 flex items-center gap-1">
              <Check size={12} /> Selected
            </span>
          )}
          {state.status === 'skipped' && (
            <span className="text-ody-text-dim">Skipped</span>
          )}
          {state.status === 'has-image' && (
            <span className="text-ody-text-dim">Already has image</span>
          )}
          {state.status === 'pending' && (
            <span className="text-ody-text-dim">Waiting...</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {(state.status === 'found') && (
          <>
            <button
              onClick={onAccept}
              className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              title="Accept"
            >
              <Check size={16} />
            </button>
            <button
              onClick={onSkip}
              className="p-2 rounded-lg bg-ody-bg text-ody-text-dim hover:bg-ody-border transition-colors"
              title="Skip"
            >
              <SkipForward size={16} />
            </button>
            <button
              onClick={onBrowse}
              className="p-2 rounded-lg bg-ody-bg text-ody-text-dim hover:bg-ody-border transition-colors"
              title="Browse alternatives"
            >
              <Images size={16} />
            </button>
          </>
        )}
        {state.status === 'selected' && (
          <button
            onClick={onBrowse}
            className="p-2 rounded-lg bg-ody-bg text-ody-text-dim hover:bg-ody-border transition-colors"
            title="Change selection"
          >
            <Images size={16} />
          </button>
        )}
        {state.status === 'no-results' && (
          <button
            onClick={onRetry}
            className="p-2 rounded-lg bg-ody-bg text-ody-text-dim hover:bg-ody-border transition-colors"
            title="Retry"
          >
            <RotateCcw size={16} />
          </button>
        )}
        {state.status === 'skipped' && (
          <button
            onClick={() => onSelectUrl(state.selectedUrl || '')}
            className="p-2 rounded-lg bg-ody-bg text-ody-text-dim hover:bg-ody-border transition-colors text-xs"
            title="Undo skip"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
