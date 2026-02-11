import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Clock, Calendar, CheckCircle, XCircle, Loader2, Timer, Zap,
  AlertCircle, Trash2, Edit3, Plus, Save, X, Pause,
} from 'lucide-react';
import { toggleCronJob, updateCronJob, deleteCronJob, addCronJob } from '../../server/fns/trip-details';
import type { TripCronJob } from '../../types/trips';

interface Props {
  tripId: string;
  cronJobs: TripCronJob[];
}

function parseCronSchedule(expr: string): string {
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

// ── Add/Edit Form ──────────────────────────────────────
interface CronJobForm {
  name: string;
  cronJobId: string;
  schedule: string;
  description: string;
}

function CronJobFormPanel({ initial, onSave, onCancel, saving }: {
  initial?: CronJobForm;
  onSave: (form: CronJobForm) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<CronJobForm>(initial || {
    name: '', cronJobId: '', schedule: '0 10 * * 1,3,5', description: '',
  });

  const presets = [
    { label: 'MWF 10am', value: '0 10 * * 1,3,5' },
    { label: 'Daily 9am', value: '0 9 * * *' },
    { label: 'Weekdays 8am', value: '0 8 * * 1-5' },
    { label: 'Weekly Mon', value: '0 10 * * 1' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="glass-card p-5 space-y-4 overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-ody-text-muted mb-1">Job Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Italy Trip Ideas"
            className="w-full bg-ody-bg/60 border border-ody-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ody-accent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ody-text-muted mb-1">External Cron Job ID</label>
          <input
            type="text"
            value={form.cronJobId}
            onChange={e => setForm(f => ({ ...f, cronJobId: e.target.value }))}
            placeholder="UUID from nyx-console"
            className="w-full bg-ody-bg/60 border border-ody-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-ody-accent"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-ody-text-muted mb-1">Schedule (cron expression)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={form.schedule}
            onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))}
            placeholder="0 10 * * 1,3,5"
            className="flex-1 bg-ody-bg/60 border border-ody-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-ody-accent"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {presets.map(p => (
            <button
              key={p.value}
              onClick={() => setForm(f => ({ ...f, schedule: p.value }))}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                form.schedule === p.value
                  ? 'border-ody-accent bg-ody-accent/10 text-ody-accent'
                  : 'border-ody-border text-ody-text-dim hover:border-ody-text-muted'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {form.schedule && (
          <p className="text-xs text-ody-text-dim mt-1.5">
            → {parseCronSchedule(form.schedule)}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-ody-text-muted mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={2}
          placeholder="What does this job do?"
          className="w-full bg-ody-bg/60 border border-ody-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ody-accent resize-none"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-sm text-ody-text-muted hover:text-ody-text transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.name || !form.schedule}
          className="px-4 py-1.5 text-sm bg-ody-accent text-white rounded-lg hover:bg-ody-accent-hover transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {initial ? 'Update' : 'Add Job'}
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────
export function ScheduleTab({ tripId, cronJobs }: Props) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] });

  const toggleMutation = useMutation({
    mutationFn: (job: TripCronJob) => toggleCronJob({ data: { tripId, id: job.id, enabled: !job.enabled } }),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCronJob({ data: { tripId, id } }),
    onSuccess: () => { invalidate(); setConfirmDelete(null); },
  });

  const addMutation = useMutation({
    mutationFn: (form: CronJobForm) => addCronJob({ data: { tripId, ...form, enabled: true } }),
    onSuccess: () => { invalidate(); setShowAdd(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, form }: { id: string; form: CronJobForm }) =>
      updateCronJob({ data: { tripId, id, name: form.name, schedule: form.schedule, description: form.description, cronJobId: form.cronJobId } }),
    onSuccess: () => { invalidate(); setEditingId(null); },
  });

  if (cronJobs.length === 0 && !showAdd) {
    return (
      <div className="space-y-6">
        <div className="text-center py-16">
          <Clock className="w-12 h-12 text-ody-text-dim mx-auto mb-4" />
          <h3 className="text-lg font-medium text-ody-text-muted">No Scheduled Jobs</h3>
          <p className="text-sm text-ody-text-dim mt-1 mb-6">
            No automated research or tasks are scheduled for this trip yet.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-ody-accent text-white rounded-lg hover:bg-ody-accent-hover transition-colors text-sm font-medium"
          >
            <Plus size={16} /> Add Cron Job
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Cron Job Manager</h3>
          <p className="text-sm text-ody-text-muted mt-0.5">
            {cronJobs.length} job{cronJobs.length !== 1 ? 's' : ''} · {cronJobs.filter(j => j.enabled).length} active
          </p>
        </div>
        <button
          onClick={() => { setShowAdd(!showAdd); setEditingId(null); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-ody-accent text-white rounded-lg hover:bg-ody-accent-hover transition-colors"
        >
          {showAdd ? <X size={14} /> : <Plus size={14} />}
          {showAdd ? 'Cancel' : 'Add Job'}
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAdd && (
          <CronJobFormPanel
            onSave={form => addMutation.mutate(form)}
            onCancel={() => setShowAdd(false)}
            saving={addMutation.isPending}
          />
        )}
      </AnimatePresence>

      {cronJobs.map((job, idx) => {
        const status = job.lastStatus ? statusConfig[job.lastStatus] : null;
        const StatusIcon = status?.icon || AlertCircle;
        const nextOccurrences = getNextOccurrences(job.schedule);
        const humanSchedule = parseCronSchedule(job.schedule);
        const isEditing = editingId === job.id;

        return (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.3 }}
            className="glass-card overflow-hidden"
          >
            {/* Edit Form */}
            <AnimatePresence>
              {isEditing && (
                <div className="p-5 border-b border-ody-border/50">
                  <CronJobFormPanel
                    initial={{
                      name: job.name,
                      cronJobId: job.cronJobId,
                      schedule: job.schedule,
                      description: job.description || '',
                    }}
                    onSave={form => updateMutation.mutate({ id: job.id, form })}
                    onCancel={() => setEditingId(null)}
                    saving={updateMutation.isPending}
                  />
                </div>
              )}
            </AnimatePresence>

            {/* Job Header */}
            {!isEditing && (
              <>
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

                    <div className="flex items-center gap-2">
                      {/* Toggle Button */}
                      <button
                        onClick={() => toggleMutation.mutate(job)}
                        disabled={toggleMutation.isPending}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          job.enabled ? 'bg-emerald-500' : 'bg-ody-surface-hover'
                        }`}
                        title={job.enabled ? 'Disable job' : 'Enable job'}
                      >
                        <motion.span
                          layout
                          className="inline-block h-4 w-4 rounded-full bg-white shadow-sm"
                          animate={{ x: job.enabled ? 22 : 4 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => { setEditingId(job.id); setShowAdd(false); }}
                        className="p-1.5 rounded-lg text-ody-text-dim hover:text-ody-text hover:bg-ody-surface-hover transition-colors"
                        title="Edit job"
                      >
                        <Edit3 size={14} />
                      </button>

                      {/* Delete */}
                      {confirmDelete === job.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteMutation.mutate(job.id)}
                            disabled={deleteMutation.isPending}
                            className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                          >
                            {deleteMutation.isPending ? 'Deleting…' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-2 py-1 text-xs text-ody-text-dim hover:text-ody-text transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(job.id)}
                          className="p-1.5 rounded-lg text-ody-text-dim hover:text-red-400 hover:bg-red-400/10 transition-colors"
                          title="Delete job"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {job.description && (
                    <p className="text-sm text-ody-text-muted mt-3 leading-relaxed line-clamp-3">
                      {job.description.replace(/\*\*/g, '').replace(/🇮🇹/g, '').trim()}
                    </p>
                  )}
                </div>

                {/* Status Row */}
                <div className="px-5 py-3 bg-ody-bg/30 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
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
                {job.enabled && nextOccurrences.length > 0 && (
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

                {/* Disabled overlay message */}
                {!job.enabled && (
                  <div className="px-5 py-4 flex items-center gap-2 text-sm text-ody-text-dim">
                    <Pause size={14} />
                    <span>Job is paused — upcoming runs are suspended</span>
                  </div>
                )}
              </>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
