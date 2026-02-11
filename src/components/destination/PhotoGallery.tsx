import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Camera, X, ChevronLeft, ChevronRight, Plus, Star,
  Trash2, Link as LinkIcon, Loader2, ImageIcon
} from 'lucide-react';
import { addDestinationPhoto, updateDestinationPhoto, deleteDestinationPhoto } from '../../server/destination-photos';

interface Photo {
  id: string;
  destinationId: string;
  imageUrl: string;
  caption: string | null;
  source: string | null;
  isCover: boolean | null;
  orderIndex: number;
  createdAt: Date;
}

interface PhotoGalleryProps {
  destinationId: string;
  photos: Photo[];
}

function AddPhotoModal({ destinationId, onClose }: { destinationId: string; onClose: () => void }) {
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [source, setSource] = useState('');
  const [isCover, setIsCover] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (data: Parameters<typeof addDestinationPhoto>[0]) => addDestinationPhoto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destination-detail', destinationId] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;
    addMutation.mutate({
      data: {
        destinationId,
        imageUrl: imageUrl.trim(),
        caption: caption.trim() || undefined,
        source: source.trim() || undefined,
        isCover,
        orderIndex: 0,
      }
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      setImageUrl(url);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card p-6 w-full max-w-md space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Plus size={20} className="text-ody-accent" /> Add Photo
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-ody-surface-hover transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
              dragOver ? 'border-ody-accent bg-ody-accent/10' : 'border-ody-border-subtle'
            }`}
          >
            {imageUrl ? (
              <div className="space-y-2">
                <img src={imageUrl} alt="Preview" className="max-h-40 mx-auto rounded-lg object-cover" />
                <button type="button" onClick={() => setImageUrl('')} className="text-xs text-ody-text-dim hover:text-ody-error">
                  Clear
                </button>
              </div>
            ) : (
              <div className="space-y-2 text-ody-text-dim">
                <ImageIcon size={32} className="mx-auto opacity-40" />
                <p className="text-sm">Drop an image URL here</p>
                <p className="text-xs">or paste a URL below</p>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-ody-text-dim block mb-1">Image URL</label>
            <div className="flex items-center gap-2">
              <LinkIcon size={14} className="text-ody-text-dim shrink-0" />
              <input
                type="url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full bg-ody-bg border border-ody-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ody-accent"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-ody-text-dim block mb-1">Caption (optional)</label>
            <input
              type="text"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="A beautiful sunset over the city..."
              className="w-full bg-ody-bg border border-ody-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ody-accent"
            />
          </div>

          <div>
            <label className="text-xs text-ody-text-dim block mb-1">Source / Credit (optional)</label>
            <input
              type="text"
              value={source}
              onChange={e => setSource(e.target.value)}
              placeholder="Unsplash / @photographer"
              className="w-full bg-ody-bg border border-ody-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ody-accent"
            />
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={isCover} onChange={e => setIsCover(e.target.checked)} className="rounded border-ody-border-subtle" />
            <Star size={14} className="text-ody-warning" />
            Set as cover photo
          </label>

          <button
            type="submit"
            disabled={!imageUrl.trim() || addMutation.isPending}
            className="w-full py-2.5 rounded-lg bg-ody-accent text-white font-medium hover:bg-ody-accent-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {addMutation.isPending ? <><Loader2 size={16} className="animate-spin" /> Adding...</> : <><Plus size={16} /> Add Photo</>}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function Lightbox({ photos, initialIndex, onClose, destinationId }: {
  photos: Photo[]; initialIndex: number; onClose: () => void; destinationId: string;
}) {
  const [index, setIndex] = useState(initialIndex);
  const queryClient = useQueryClient();
  const photo = photos[index];

  const setCoverMutation = useMutation({
    mutationFn: (data: Parameters<typeof updateDestinationPhoto>[0]) => updateDestinationPhoto(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['destination-detail', destinationId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (data: Parameters<typeof deleteDestinationPhoto>[0]) => deleteDestinationPhoto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destination-detail', destinationId] });
      if (photos.length <= 1) onClose();
      else setIndex(i => Math.min(i, photos.length - 2));
    },
  });

  const prev = () => setIndex(i => (i - 1 + photos.length) % photos.length);
  const next = () => setIndex(i => (i + 1) % photos.length);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prev();
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'Escape') onClose();
  }, [photos.length]);

  if (!photo) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      autoFocus
    >
      <div className="flex items-center justify-between p-4" onClick={e => e.stopPropagation()}>
        <span className="text-white/60 text-sm">{index + 1} / {photos.length}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCoverMutation.mutate({ data: { id: photo.id, isCover: true } })}
            className={`p-2 rounded-lg transition-colors ${photo.isCover ? 'text-ody-warning bg-ody-warning/20' : 'text-white/60 hover:text-ody-warning hover:bg-white/10'}`}
            title="Set as cover"
          >
            <Star size={18} className={photo.isCover ? 'fill-ody-warning' : ''} />
          </button>
          <button
            onClick={() => { if (confirm('Delete this photo?')) deleteMutation.mutate({ data: { id: photo.id } }); }}
            className="p-2 rounded-lg text-white/60 hover:text-ody-error hover:bg-white/10 transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
          <button onClick={onClose} className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-16 min-h-0 relative" onClick={e => e.stopPropagation()}>
        {photos.length > 1 && (
          <button onClick={prev} className="absolute left-4 p-3 rounded-full bg-black/50 text-white/80 hover:bg-black/70 hover:text-white transition-colors">
            <ChevronLeft size={24} />
          </button>
        )}
        <AnimatePresence mode="wait">
          <motion.img
            key={photo.id}
            src={photo.imageUrl}
            alt={photo.caption || ''}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="max-h-full max-w-full object-contain rounded-lg"
          />
        </AnimatePresence>
        {photos.length > 1 && (
          <button onClick={next} className="absolute right-4 p-3 rounded-full bg-black/50 text-white/80 hover:bg-black/70 hover:text-white transition-colors">
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {(photo.caption || photo.source) && (
        <div className="p-4 text-center" onClick={e => e.stopPropagation()}>
          {photo.caption && <p className="text-white/90 text-sm">{photo.caption}</p>}
          {photo.source && <p className="text-white/50 text-xs mt-1">📷 {photo.source}</p>}
        </div>
      )}
    </motion.div>
  );
}

export default function PhotoGallery({ destinationId, photos }: PhotoGalleryProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 text-center space-y-3">
        <Camera size={40} className="mx-auto text-ody-text-dim opacity-40" />
        <p className="text-ody-text-muted">No photos yet</p>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-ody-accent text-white text-sm font-medium hover:bg-ody-accent-hover transition-colors"
        >
          <Plus size={16} /> Add First Photo
        </button>
        <AnimatePresence>
          {showAddModal && <AddPhotoModal destinationId={destinationId} onClose={() => setShowAddModal(false)} />}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Camera size={20} className="text-ody-accent" /> Photos
          <span className="text-sm text-ody-text-dim font-normal">({photos.length})</span>
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ody-accent/20 text-ody-accent text-sm hover:bg-ody-accent/30 transition-colors"
        >
          <Plus size={14} /> Add Photo
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {photos.map((photo, i) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="relative group cursor-pointer rounded-xl overflow-hidden aspect-[4/3] bg-ody-surface"
            onClick={() => setLightboxIndex(i)}
          >
            <img src={photo.imageUrl} alt={photo.caption || ''} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            {photo.isCover && (
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-ody-warning/90 text-black text-xs font-medium flex items-center gap-1">
                <Star size={10} className="fill-black" /> Cover
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
              <div>
                {photo.caption && <p className="text-white text-sm font-medium">{photo.caption}</p>}
                {photo.source && <p className="text-white/60 text-xs">📷 {photo.source}</p>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAddModal && <AddPhotoModal destinationId={destinationId} onClose={() => setShowAddModal(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox photos={photos} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} destinationId={destinationId} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
