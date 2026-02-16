import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Check, Loader2, ImageOff, ExternalLink, ZoomIn } from 'lucide-react';
import type { CandidateImage } from '../server/destination-image';

interface ImagePickerModalProps {
  open: boolean;
  images: CandidateImage[];
  loading: boolean;
  onSelect: (url: string) => void;
  onClose: () => void;
}

const SOURCE_BADGES: Record<string, { label: string; color: string }> = {
  opengraph: { label: 'OG', color: 'bg-blue-500/20 text-blue-400' },
  search: { label: 'Search', color: 'bg-purple-500/20 text-purple-400' },
  html: { label: 'HTML', color: 'bg-green-500/20 text-green-400' },
  extract: { label: 'Extract', color: 'bg-amber-500/20 text-amber-400' },
};

export function ImagePickerModal({ open, images, loading, onSelect, onClose }: ImagePickerModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 sm:inset-8 md:inset-16 z-50 flex flex-col bg-ody-surface border border-ody-border rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-ody-border">
              <h2 className="text-lg font-semibold">Choose an Image</h2>
              <div className="flex items-center gap-3">
                {selectedUrl && (
                  <button
                    onClick={() => { onSelect(selectedUrl); onClose(); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ody-accent text-white text-sm font-medium hover:bg-ody-accent-hover transition-colors"
                  >
                    <Check size={16} /> Select Image
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-ody-bg transition-colors text-ody-text-dim"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading && images.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-ody-text-dim">
                  <Loader2 size={32} className="animate-spin text-ody-accent" />
                  <p>Searching for images...</p>
                </div>
              ) : images.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-ody-text-dim">
                  <ImageOff size={48} />
                  <p>No images found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((img, i) => {
                    const badge = SOURCE_BADGES[img.source] || SOURCE_BADGES.extract;
                    const isSelected = selectedUrl === img.url;
                    return (
                      <motion.div
                        key={img.url}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-colors ${
                          isSelected
                            ? 'border-ody-accent shadow-lg shadow-ody-accent/20'
                            : 'border-transparent hover:border-ody-border'
                        }`}
                        onClick={() => setSelectedUrl(img.url)}
                      >
                        <div className="aspect-[4/3] bg-ody-bg">
                          <img
                            src={img.thumbnailUrl || img.url}
                            alt={img.alt || 'Candidate image'}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>

                        {/* Source badge */}
                        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-medium ${badge.color}`}>
                          {badge.label}
                        </div>

                        {/* Score */}
                        {img.score > 0 && (
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px]">
                            {Math.round(img.score * 100)}%
                          </div>
                        )}

                        {/* Preview button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setPreviewUrl(img.url); }}
                          className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ZoomIn size={14} />
                        </button>

                        {/* Selected check */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-ody-accent/10 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-ody-accent flex items-center justify-center">
                              <Check size={18} className="text-white" />
                            </div>
                          </div>
                        )}

                        {/* Dimensions */}
                        {img.width > 0 && img.height > 0 && (
                          <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                            {img.width}×{img.height}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* Full-size Preview Overlay */}
          <AnimatePresence>
            {previewUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-8"
                onClick={() => setPreviewUrl(null)}
              >
                <motion.img
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="absolute top-6 right-6 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
                >
                  <X size={24} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
