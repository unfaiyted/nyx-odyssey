import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Pencil, Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TripKebabMenuProps {
  isArchived: boolean;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export function TripKebabMenu({ isArchived, onEdit, onArchive, onDelete }: TripKebabMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    fn();
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(o => !o); }}
        className="p-1.5 rounded-lg hover:bg-ody-surface-hover transition-colors text-ody-text-muted hover:text-ody-text"
      >
        <MoreVertical size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-full mt-1 z-50 w-44 py-1 rounded-lg border border-ody-border bg-ody-surface shadow-xl"
          >
            <button onClick={handleClick(onEdit)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-ody-surface-hover transition-colors">
              <Pencil size={14} /> Edit Trip
            </button>
            <button onClick={handleClick(onArchive)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-ody-surface-hover transition-colors">
              {isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
              {isArchived ? 'Unarchive' : 'Archive'}
            </button>
            <div className="border-t border-ody-border my-1" />
            <button onClick={handleClick(onDelete)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-ody-danger hover:bg-ody-danger/10 transition-colors">
              <Trash2 size={14} /> Delete Trip
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
