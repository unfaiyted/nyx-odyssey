import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Calendar, AlertTriangle, Utensils, Plane, Package,
  X, ChevronRight,
} from 'lucide-react';
import type { Notification } from '../routes/api/notifications';

interface NotificationsResponse {
  notifications: Notification[];
  counts: {
    total: number;
    urgent: number;
    warning: number;
    info: number;
  };
}

const typeIcons: Record<string, typeof Bell> = {
  event: Calendar,
  task: AlertTriangle,
  nutrition: Utensils,
  flight: Plane,
  packing: Package,
};

const severityColors: Record<string, string> = {
  urgent: 'text-red-400',
  warning: 'text-amber-400',
  info: 'text-blue-400',
};

const severityBg: Record<string, string> = {
  urgent: 'bg-red-500/10 border-red-500/20',
  warning: 'bg-amber-500/10 border-amber-500/20',
  info: 'bg-blue-500/10 border-blue-500/20',
};

function NotificationItem({ notification }: { notification: Notification }) {
  const Icon = typeIcons[notification.type] || Bell;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={`flex items-start gap-3 p-3 rounded-lg border ${severityBg[notification.severity]} transition-colors hover:brightness-110`}
    >
      <div className={`mt-0.5 ${severityColors[notification.severity]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ody-text truncate">{notification.title}</p>
        <p className="text-xs text-ody-text-muted mt-0.5">{notification.description}</p>
      </div>
      {notification.tripId && (
        <a
          href={`/trips/${notification.tripId}`}
          className="text-ody-text-dim hover:text-ody-accent transition-colors shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </a>
      )}
    </motion.div>
  );
}

export function NotificationBadge() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery<NotificationsResponse>({
    queryKey: ['notifications'],
    queryFn: () => fetch('/api/notifications').then(r => r.json()),
    refetchInterval: 120_000, // every 2 min
  });

  const count = data?.counts.total ?? 0;
  const urgentCount = data?.counts.urgent ?? 0;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1.5 rounded-lg hover:bg-ody-surface-hover transition-colors"
        aria-label={`Notifications (${count})`}
      >
        <Bell className="w-5 h-5 text-ody-text-muted" />

        {/* Badge */}
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className={`absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full ${
                urgentCount > 0
                  ? 'bg-red-500 text-white'
                  : 'bg-amber-500 text-black'
              }`}
            >
              {count > 99 ? '99+' : count}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-ody-surface border border-ody-border rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-ody-border">
              <h3 className="text-sm font-semibold">Notifications</h3>
              <div className="flex items-center gap-2">
                {urgentCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">
                    {urgentCount} urgent
                  </span>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded hover:bg-ody-surface-hover transition-colors"
                >
                  <X className="w-4 h-4 text-ody-text-dim" />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-96 overflow-y-auto p-2 space-y-1.5">
              {data?.notifications && data.notifications.length > 0 ? (
                data.notifications.map((n) => (
                  <NotificationItem key={n.id} notification={n} />
                ))
              ) : (
                <div className="py-8 text-center text-ody-text-dim text-sm">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  All clear — nothing to worry about
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
