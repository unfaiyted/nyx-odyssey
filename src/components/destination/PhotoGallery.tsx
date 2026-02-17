import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, ChevronLeft, ChevronRight, Grid, Rows3 } from 'lucide-react';

export interface GalleryPhoto {
  id: string;
  url: string;
  caption?: string | null;
  source?: string; // 'destination' | 'highlight' | 'highlight-photo'
  highlightTitle?: string;
}

interface PhotoGalleryProps {
  photos: GalleryPhoto[];
}

function LightboxModal({
  photos,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: {
  photos: GalleryPhoto[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const photo = photos[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X size={20} />
      </button>

      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      <motion.div
        key={photo.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="max-w-[90vw] max-h-[85vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.url}
          alt={photo.caption || photo.highlightTitle || 'Photo'}
          className="max-w-full max-h-[75vh] object-contain rounded-lg"
        />
        <div className="mt-3 text-center">
          {photo.caption && (
            <p className="text-white/90 text-sm">{photo.caption}</p>
          )}
          {photo.highlightTitle && (
            <p className="text-white/50 text-xs mt-1">{photo.highlightTitle}</p>
          )}
          <p className="text-white/30 text-xs mt-1">
            {currentIndex + 1} / {photos.length}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [layout, setLayout] = useState<'masonry' | 'grid'>('masonry');
  const [showAll, setShowAll] = useState(false);

  const INITIAL_COUNT = 8;
  const displayPhotos = showAll ? photos : photos.slice(0, INITIAL_COUNT);
  const hasMore = photos.length > INITIAL_COUNT;

  // Assign masonry column spans for visual variety
  const masonryHeights = useMemo(() => {
    return displayPhotos.map((_, i) => {
      // Create a repeating pattern of varied heights
      const patterns = ['h-48', 'h-64', 'h-52', 'h-72', 'h-56', 'h-44', 'h-60', 'h-48'];
      return patterns[i % patterns.length];
    });
  }, [displayPhotos.length]);

  if (photos.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Camera size={20} className="text-ody-accent" /> Photo Gallery
          <span className="text-sm font-normal text-ody-text-dim">({photos.length})</span>
        </h2>
        <div className="flex items-center gap-1 bg-ody-surface rounded-lg p-0.5">
          <button
            onClick={() => setLayout('masonry')}
            className={`p-1.5 rounded-md transition-colors ${layout === 'masonry' ? 'bg-ody-accent/20 text-ody-accent' : 'text-ody-text-dim hover:text-ody-text'}`}
            title="Masonry layout"
          >
            <Rows3 size={16} />
          </button>
          <button
            onClick={() => setLayout('grid')}
            className={`p-1.5 rounded-md transition-colors ${layout === 'grid' ? 'bg-ody-accent/20 text-ody-accent' : 'text-ody-text-dim hover:text-ody-text'}`}
            title="Grid layout"
          >
            <Grid size={16} />
          </button>
        </div>
      </div>

      {layout === 'masonry' ? (
        <div className="columns-2 sm:columns-3 gap-3 space-y-3">
          {displayPhotos.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="break-inside-avoid cursor-pointer group"
              onClick={() => setLightboxIndex(i)}
            >
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.caption || photo.highlightTitle || 'Photo'}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {(photo.caption || photo.highlightTitle) && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    {photo.caption && (
                      <p className="text-white text-xs font-medium">{photo.caption}</p>
                    )}
                    {photo.highlightTitle && (
                      <p className="text-white/60 text-xs">{photo.highlightTitle}</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {displayPhotos.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => setLightboxIndex(i)}
            >
              <img
                src={photo.url}
                alt={photo.caption || photo.highlightTitle || 'Photo'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {(photo.caption || photo.highlightTitle) && (
                <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-xs font-medium truncate">
                    {photo.caption || photo.highlightTitle}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-4 py-2 rounded-lg bg-ody-surface hover:bg-ody-surface-hover text-sm text-ody-text-muted transition-colors"
          >
            {showAll ? 'Show Less' : `Show All ${photos.length} Photos`}
          </button>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <LightboxModal
            photos={displayPhotos}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNext={() => setLightboxIndex((lightboxIndex + 1) % displayPhotos.length)}
            onPrev={() => setLightboxIndex((lightboxIndex - 1 + displayPhotos.length) % displayPhotos.length)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
