import { motion } from 'framer-motion';
import { Clock, Calendar, CheckCircle, XCircle, Loader2, Timer, Zap, AlertCircle } from 'lucide-react';
import type { TripCronJob } from '../../types/trips';

interface Props {
  tripId: string;
  cronJobs: TripCronJob[];
}

function parseCronSchedule(expr: string): string {
  // Parse common cron expressions into human-readable text
  const parts = expr.split(' ');
  if (parts.length !== 5) return expr;

  const [min, hour, _dom, _month, dow] = parts;

  const dayNames: Record<string, string> = {
    '0': 'Sunday', '1': 'Monday', '2': 'Tuesday', '3': 'Wednesday',
    '4': 'Thursday', '5': 'Friday', '6': 'Saturday', '7': 'Sunday',
  };

  const days = dow === '*' ? 'Every day' :
    dow.split(',').map(d => dayNames[d] || d).join(', ');

  const time = `${hour.padStart(2, '0')}:${min.padStart(2, '0')} UTC`;

  return `${days} at ${time}`;
}

function getNextOccurrences(expr: string, count: number = 5): Date[] {
  const parts = expr.split(' ');
  if (parts.length !== 5) return [];

  const [min, hour, _dom, _month, dow] = parts;
  const minute = parseInt(min);
  const hourNum = parseInt(hour);
  const allowedDays = dow === '*' ? [0,1,2,3,4,5,6] : dow.split(',').map(Number);

  const dates: Date[] = [];
  const now = new Date();
  const cursor = new Date(now);
  cursor.setUTCMinutes(minute);
  cursor.setUTCHours(hourNum);
  cursor.setUTCSeconds(0);
  cursor.setUTCMilliseconds(0);

  if (cursor <= now) cursor.setUTCDate(cursor.getUTCDate() + 1);

  let safety = 0;
  while (dates.length < count && safety < 30) {
    if (allowedDays.includes(cursor.getUTCDay())) {
      dates.push(new Date(cursor));
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    safety++;
  }

  return dates;
}

function formatRelativeTime(date: string | null): string {
  if (!date) return 'Never';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(Math.abs(diffMs) / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  const isFuture = diffMs < 0;
  const prefix = isFuture ? 'in ' : '';
  const suffix = isFuture ? '' : ' ago';

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${prefix}${diffMins}m${suffix}`;
  if (diffHours < 24) return `${prefix}${diffHours}h${suffix}`;
  return `${prefix}${diffDays}d${suffix}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  });
}

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
  success: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Success' },
  failure: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Failed' },
  running: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Running' },
};

export function ScheduleTab({ cronJobs }: Props) {
  if (cronJobs.length === 0) {
    return (
      <div className="text-center py-16">
        <Clock className="w-12 h-12 text-ody-text-dim mx-auto mb-4" />
        <h3 className="text-lg font-medium text-ody-text-muted">No Scheduled Jobs</h3>
        <p className="text-sm text-ody-text-dim mt-1">
          No automated research or tasks are scheduled for this trip yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg">Research Schedule</h3>
        <p className="text-sm text-ody-text-muted mt-0.5">
          Automated research jobs linked to this trip
        </p>
      </div>

      {cronJobs.map((job, idx) => {
        const status = job.lastStatus ? statusConfig[job.lastStatus] : null;
        const StatusIcon = status?.icon || AlertCircle;
        const nextOccurrences = getNextOccurrences(job.schedule);
        const humanSchedule = parseCronSchedule(job.schedule);

        return (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.3 }}
            className="glass-card overflow-hidden"
          >
            {/* Job Header */}
            <div className="p-5 border-b border-ody-border/50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl ${job.enabled ? 'bg-ody-accent/10 text-ody-accent' : 'bg-ody-text-dim/10 text-ody-text-dim'}`}>
                    <Zap size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base">{job.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Timer size={12} className="text-ody-text-dim" />
                      <span className="text-sm text-ody-text-muted">{humanSchedule}</span>
                    </div>
                    <code className="text-xs text-ody-text-dim mt-1 block font-mono">{job.schedule}</code>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  job.enabled
                    ? 'bg-emerald-400/10 text-emerald-400'
                    : 'bg-ody-text-dim/10 text-ody-text-dim'
                }`}>
                  {job.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>

              {job.description && (
                <p className="text-sm text-ody-text-muted mt-3 leading-relaxed line-clamp-3">
                  {job.description.replace(/\*\*/g, '').replace(/🇮🇹/g, '').trim()}
                </p>
              )}
            </div>

            {/* Status Row */}
            <div className="px-5 py-3 bg-ody-bg/30 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-ody-text-dim">Last run:</span>
                {status ? (
                  <span className={`flex items-center gap-1 ${status.color}`}>
                    <StatusIcon size={14} className={job.lastStatus === 'running' ? 'animate-spin' : ''} />
                    {formatRelativeTime(job.lastRun)}
                  </span>
                ) : (
                  <span className="text-ody-text-dim">Never</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-ody-text-dim">Next run:</span>
                <span className="text-ody-text-muted">
                  {job.nextRun ? formatRelativeTime(job.nextRun) : (nextOccurrences[0] ? formatRelativeTime(nextOccurrences[0].toISOString()) : 'Unknown')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-ody-text-dim">ID:</span>
                <code className="text-xs text-ody-text-dim font-mono">{job.cronJobId.slice(0, 8)}…</code>
              </div>
            </div>

            {/* Upcoming Schedule */}
            {nextOccurrences.length > 0 && (
              <div className="p-5">
                <h5 className="text-xs font-medium text-ody-text-dim uppercase tracking-wider mb-3">
                  Upcoming Runs
                </h5>
                <div className="space-y-2">
                  {nextOccurrences.map((date, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      className="flex items-center gap-3 text-sm"
                    >
                      <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-ody-accent' : 'bg-ody-border'}`} />
                      <Calendar size={12} className="text-ody-text-dim" />
                      <span className={i === 0 ? 'text-ody-text font-medium' : 'text-ody-text-muted'}>
                        {formatDate(date)}
                      </span>
                      <span className="text-ody-text-dim">
                        {formatTime(date)}
                      </span>
                      {i === 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-ody-accent/10 text-ody-accent">
                          Next
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
