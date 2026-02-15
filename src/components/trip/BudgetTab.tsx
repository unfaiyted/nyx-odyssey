import { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addBudgetItem, updateBudgetItem, deleteBudgetItem, addBudgetCategory, updateBudgetCategory } from '../../server/fns/trip-details';
import { getBudgetSummary } from '../../server/fns/budget-summary';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, CheckCircle, Circle, TrendingUp, TrendingDown,
  Plane, Home, Utensils, Compass, ShoppingBag, Car, MoreHorizontal,
  Edit2, X, ChevronDown, ChevronUp, Filter, ExternalLink, Hotel, Ticket, Fuel,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, Legend, CartesianGrid,
} from 'recharts';
import type { BudgetItem, BudgetCategory, BudgetSummary, BudgetSummaryItem } from '../../types/trips';
import { DailyBudgetSpreadsheet } from './DailyBudgetSpreadsheet';

interface Props {
  tripId: string;
  items: BudgetItem[];
  budgetCategories: BudgetCategory[];
  totalBudget: string | null;
  currency: string;
  startDate?: string | null;
  endDate?: string | null;
}

const CATEGORIES = [
  { key: 'flights', label: 'Flights', icon: Plane, color: '#818cf8' },
  { key: 'accommodations', label: 'Accommodations', icon: Home, color: '#a78bfa' },
  { key: 'food', label: 'Food & Dining', icon: Utensils, color: '#34d399' },
  { key: 'activities', label: 'Activities', icon: Compass, color: '#fbbf24' },
  { key: 'entertainment', label: 'Entertainment', icon: Ticket, color: '#f472b6' },
  { key: 'transport', label: 'Transport', icon: Car, color: '#60a5fa' },
  { key: 'shopping', label: 'Shopping', icon: ShoppingBag, color: '#f87171' },
  { key: 'other', label: 'Other', icon: MoreHorizontal, color: '#9ca3af' },
] as const;

const categoryMap = Object.fromEntries(CATEGORIES.map(c => [c.key, c]));

function getCategoryMeta(key: string) {
  return categoryMap[key] || { key, label: key, icon: MoreHorizontal, color: '#9ca3af' };
}

function formatMoney(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

function formatMoneyFull(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    booked: 'bg-emerald-500/20 text-emerald-400',
    shortlisted: 'bg-amber-500/20 text-amber-400',
    interested: 'bg-blue-500/20 text-blue-400',
    researched: 'bg-gray-500/20 text-gray-400',
  };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${colors[status] || colors.researched}`}>
      {status}
    </span>
  );
}

export function BudgetTab({ tripId, items: manualItems, budgetCategories: catAllocations, totalBudget, currency, startDate, endDate }: Props) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [showDailySpreadsheet, setShowDailySpreadsheet] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('computed');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BudgetItem>>({});
  const [form, setForm] = useState({
    category: 'food', description: '', estimatedCost: '', actualCost: '', date: '',
  });

  // Fetch budget summary
  const { data: summary } = useQuery<BudgetSummary>({
    queryKey: ['budget-summary', tripId],
    queryFn: () => getBudgetSummary({ data: { tripId } }),
  });

  // ── Mutations ──────────────────────────────────
  const addMutation = useMutation({
    mutationFn: (data: any) => addBudgetItem({ data: { tripId, ...data } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      queryClient.invalidateQueries({ queryKey: ['budget-summary', tripId] });
      setShowAdd(false);
      setForm({ category: 'food', description: '', estimatedCost: '', actualCost: '', date: '' });
    },
  });

  const togglePaidMutation = useMutation({
    mutationFn: (item: BudgetItem) => updateBudgetItem({ data: { tripId, id: item.id, paid: !item.paid } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      queryClient.invalidateQueries({ queryKey: ['budget-summary', tripId] });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: (data: Partial<BudgetItem> & { id: string }) => updateBudgetItem({ data: { tripId, ...data } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      queryClient.invalidateQueries({ queryKey: ['budget-summary', tripId] });
      setEditingItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBudgetItem({ data: { tripId, id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      queryClient.invalidateQueries({ queryKey: ['budget-summary', tripId] });
    },
  });

  // ── Computed data ──────────────────────────────
  const budget = Number(totalBudget || 0);
  const grandEstimated = summary?.grandTotal.estimated || 0;
  const grandActual = summary?.grandTotal.actual || 0;
  const remaining = budget - grandEstimated;

  // Trip duration for per-day calc
  const tripDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  }, [startDate, endDate]);

  // Pie chart data from byCategory
  const pieData = useMemo(() => {
    if (!summary) return [];
    return Object.entries(summary.byCategory)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({
        name: getCategoryMeta(key).label,
        value,
        color: getCategoryMeta(key).color,
      }))
      .sort((a, b) => b.value - a.value);
  }, [summary]);

  // Bar data
  const allocationMap = useMemo(() =>
    Object.fromEntries(catAllocations.map(c => [c.category, Number(c.allocatedBudget)])),
  [catAllocations]);

  const barData = useMemo(() => {
    if (!summary) return [];
    return CATEGORIES
      .map(c => ({
        name: c.label.split(' ')[0],
        budget: allocationMap[c.key] || 0,
        estimated: summary.byCategory[c.key] || 0,
      }))
      .filter(d => d.budget > 0 || d.estimated > 0);
  }, [summary, allocationMap]);

  const budgetPercent = budget > 0 ? Math.min((grandEstimated / budget) * 100, 100) : 0;
  const isOverBudget = grandEstimated > budget && budget > 0;

  return (
    <div className="space-y-6">
      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Total Budget" value={formatMoney(budget, currency)} sub={currency} accent="text-ody-accent" />
        <SummaryCard
          label="Total Estimated"
          value={formatMoney(grandEstimated, currency)}
          sub={`From all sources`}
          accent="text-ody-info"
        />
        <SummaryCard
          label="Booked / Actual"
          value={formatMoney(grandActual, currency)}
          sub={grandEstimated > 0 ? `${Math.round((grandActual / grandEstimated) * 100)}% confirmed` : '—'}
          accent={isOverBudget ? 'text-ody-danger' : 'text-ody-success'}
        />
        <SummaryCard
          label={remaining >= 0 ? 'Remaining' : 'Over Budget'}
          value={formatMoney(Math.abs(remaining), currency)}
          sub={tripDays > 0 ? `~${formatMoney(grandEstimated / tripDays, currency)}/day` : budget > 0 ? `${(100 - budgetPercent).toFixed(0)}% left` : 'No budget set'}
          accent={remaining < 0 ? 'text-ody-danger' : 'text-ody-success'}
          icon={remaining < 0 ? TrendingDown : TrendingUp}
        />
      </div>

      {/* ── Overall Budget Progress ── */}
      {budget > 0 && (
        <div className="glass-card p-4">
          <div className="flex justify-between text-xs text-ody-text-dim mb-2">
            <span>Overall Budget Usage</span>
            <span className={isOverBudget ? 'text-ody-danger font-medium' : ''}>
              {formatMoney(grandEstimated, currency)} / {formatMoney(budget, currency)}
            </span>
          </div>
          <div className="h-3 bg-ody-surface rounded-full overflow-hidden relative">
            {/* Actual/booked portion */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((grandActual / budget) * 100, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 absolute left-0 top-0"
            />
            {/* Estimated portion */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(budgetPercent, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full absolute left-0 top-0 ${
                isOverBudget ? 'bg-gradient-to-r from-ody-danger/40 to-ody-danger/60' :
                budgetPercent > 80 ? 'bg-gradient-to-r from-amber-500/40 to-amber-500/60' :
                'bg-gradient-to-r from-ody-accent/30 to-ody-accent/50'
              }`}
            />
          </div>
          <div className="flex gap-4 mt-1.5 text-[10px] text-ody-text-dim">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Booked</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-ody-accent/50 inline-block" /> Estimated</span>
          </div>
        </div>
      )}

      {/* ── Computed Costs ── */}
      {summary && (
        <div className="space-y-3">
          {/* Accommodations */}
          {summary.computed.accommodations.items.length > 0 && (
            <ComputedSection
              icon="🏨"
              title="Accommodations"
              total={summary.computed.accommodations.total}
              items={summary.computed.accommodations.items}
              currency={currency}
            />
          )}

          {/* Events & Shows */}
          {summary.computed.events.items.length > 0 && (
            <ComputedSection
              icon="🎫"
              title="Events & Shows"
              total={summary.computed.events.total}
              items={summary.computed.events.items}
              currency={currency}
            />
          )}

          {/* Flights */}
          {summary.computed.flights.items.length > 0 && (
            <ComputedSection
              icon="✈️"
              title="Flights"
              total={summary.computed.flights.total}
              items={summary.computed.flights.items}
              currency={currency}
            />
          )}
        </div>
      )}

      {/* ── Charts ── */}
      {pieData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card p-4">
            <h4 className="text-sm font-semibold mb-3 text-ody-text-muted">Spending Distribution</h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={2} strokeWidth={0}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 8, color: '#e4e4ed', fontSize: 12 }}
                  formatter={(v: any) => formatMoneyFull(Number(v), currency)}
                />
                <Legend formatter={(value: string) => <span className="text-xs text-ody-text-muted">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {barData.length > 0 && (
            <div className="glass-card p-4">
              <h4 className="text-sm font-semibold mb-3 text-ody-text-muted">Budget vs Estimated</h4>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                  <XAxis dataKey="name" tick={{ fill: '#8888a0', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#8888a0', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 8, color: '#e4e4ed', fontSize: 12 }}
                    formatter={(v: any) => formatMoneyFull(Number(v), currency)}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="budget" fill="#6366f1" radius={[3, 3, 0, 0]} name="Budget" />
                  <Bar dataKey="estimated" fill="#60a5fa" radius={[3, 3, 0, 0]} name="Estimated" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── Daily Budget Spreadsheet ── */}
      <div className="glass-card p-4">
        <button
          onClick={() => setShowDailySpreadsheet(!showDailySpreadsheet)}
          className="flex items-center justify-between w-full mb-2"
        >
          <h4 className="text-sm font-semibold text-ody-text-muted flex items-center gap-2">
            📊 Daily Budget Spreadsheet
          </h4>
          {showDailySpreadsheet ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <AnimatePresence>
          {showDailySpreadsheet && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <DailyBudgetSpreadsheet
                tripId={tripId}
                items={manualItems}
                startDate={startDate || null}
                endDate={endDate || null}
                currency={currency}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Manual Extras ── */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          📝 Manual Extras
          <span className="text-xs text-ody-text-dim font-normal">({manualItems.length} items • {formatMoney(summary?.manual.total || 0, currency)})</span>
        </h3>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ody-accent/10 text-ody-accent text-sm hover:bg-ody-accent/20 transition-colors">
          <Plus size={14} /> Add Expense
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="glass-card p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent">
                  {CATEGORIES.map(c => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
                <input placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
                <input type="number" step="0.01" placeholder="Estimated cost" value={form.estimatedCost} onChange={e => setForm(p => ({ ...p, estimatedCost: e.target.value }))}
                  className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
                <input type="number" step="0.01" placeholder="Actual cost" value={form.actualCost} onChange={e => setForm(p => ({ ...p, actualCost: e.target.value }))}
                  className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => addMutation.mutate(form)} disabled={!form.description}
                  className="px-4 py-2 rounded-lg bg-ody-accent text-white text-sm hover:bg-ody-accent-hover disabled:opacity-50 transition-colors">Save</button>
                <button onClick={() => setShowAdd(false)}
                  className="px-4 py-2 rounded-lg border border-ody-border text-sm hover:bg-ody-surface-hover transition-colors">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {manualItems.length === 0 ? (
        <p className="text-ody-text-muted text-center py-4 text-sm">No manual expenses. Costs are computed from events, accommodations & flights.</p>
      ) : (
        <div className="space-y-2">
          {manualItems
            .sort((a, b) => {
              // Sort by category then description
              if (a.category !== b.category) return a.category.localeCompare(b.category);
              return a.description.localeCompare(b.description);
            })
            .map((item, i) => {
              const meta = getCategoryMeta(item.category);
              const Icon = meta.icon;
              const isEditing = editingItem === item.id;

              if (isEditing) {
                return (
                  <motion.div key={item.id} layout className="glass-card p-3 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <select value={editForm.category || item.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}
                        className="bg-ody-bg border border-ody-border rounded px-2 py-1.5 text-sm outline-none focus:border-ody-accent">
                        {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                      </select>
                      <input value={editForm.description ?? item.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                        className="bg-ody-bg border border-ody-border rounded px-2 py-1.5 text-sm outline-none focus:border-ody-accent" placeholder="Description" />
                      <input type="number" step="0.01" value={editForm.estimatedCost ?? item.estimatedCost ?? ''} onChange={e => setEditForm(p => ({ ...p, estimatedCost: e.target.value }))}
                        className="bg-ody-bg border border-ody-border rounded px-2 py-1.5 text-sm outline-none focus:border-ody-accent" placeholder="Estimated cost" />
                      <input type="number" step="0.01" value={editForm.actualCost ?? item.actualCost ?? ''} onChange={e => setEditForm(p => ({ ...p, actualCost: e.target.value }))}
                        className="bg-ody-bg border border-ody-border rounded px-2 py-1.5 text-sm outline-none focus:border-ody-accent" placeholder="Actual cost" />
                      <input type="date" value={editForm.date ?? item.date ?? ''} onChange={e => setEditForm(p => ({ ...p, date: e.target.value }))}
                        className="bg-ody-bg border border-ody-border rounded px-2 py-1.5 text-sm outline-none focus:border-ody-accent" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => updateItemMutation.mutate({ id: item.id, ...editForm })}
                        className="px-3 py-1 rounded bg-ody-accent text-white text-xs hover:bg-ody-accent-hover transition-colors">Save</button>
                      <button onClick={() => { setEditingItem(null); setEditForm({}); }}
                        className="px-3 py-1 rounded border border-ody-border text-xs hover:bg-ody-surface-hover transition-colors">Cancel</button>
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="glass-card p-3 flex items-center gap-3 group"
                >
                  <button onClick={() => togglePaidMutation.mutate(item)}
                    className={`transition-colors ${item.paid ? 'text-ody-success' : 'text-ody-text-dim hover:text-ody-accent'}`}>
                    {item.paid ? <CheckCircle size={16} /> : <Circle size={16} />}
                  </button>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${meta.color}20` }}>
                    <Icon size={14} style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.description}</p>
                    <p className="text-xs text-ody-text-dim capitalize">{meta.label}</p>
                  </div>
                  <div className="text-right">
                    {item.actualCost && (
                      <p className="text-sm font-medium text-ody-success">{formatMoneyFull(Number(item.actualCost), currency)}</p>
                    )}
                    {item.estimatedCost && !item.actualCost && (
                      <p className="text-sm text-ody-text-dim">~{formatMoneyFull(Number(item.estimatedCost), currency)}</p>
                    )}
                    {item.estimatedCost && item.actualCost && (
                      <p className="text-xs text-ody-text-dim">Est: {formatMoneyFull(Number(item.estimatedCost), currency)}</p>
                    )}
                  </div>
                  {item.date && <span className="text-xs text-ody-text-dim hidden sm:block">{item.date}</span>}
                  <button onClick={() => { setEditingItem(item.id); setEditForm({}); }}
                    className="text-ody-text-dim hover:text-ody-accent transition-colors p-1 opacity-0 group-hover:opacity-100">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => deleteMutation.mutate(item.id)}
                    className="text-ody-text-dim hover:text-ody-danger transition-colors p-1 opacity-0 group-hover:opacity-100">
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              );
            })}
        </div>
      )}
    </div>
  );
}

// ── Computed Section Component ──
function ComputedSection({ icon, title, total, items, currency }: {
  icon: string; title: string; total: number; items: BudgetSummaryItem[]; currency: string;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="glass-card p-4">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between">
        <h4 className="text-sm font-semibold text-ody-text-muted flex items-center gap-2">
          <span>{icon}</span> {title}
          <span className="text-xs font-normal text-ody-text-dim">({items.length})</span>
        </h4>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-ody-accent">{formatMoney(total, currency)}</span>
          {expanded ? <ChevronUp size={14} className="text-ody-text-dim" /> : <ChevronDown size={14} className="text-ody-text-dim" />}
        </div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-1.5 overflow-hidden"
          >
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-2 py-1.5 px-2 bg-ody-surface/30 rounded text-xs">
                <span className="flex-1 min-w-0">
                  <span className="truncate block">{item.name}</span>
                  {item.detail && (
                    <span className="text-[10px] text-ody-text-dim block">{item.detail}</span>
                  )}
                </span>
                {item.onItinerary && (
                  <span className="shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-400/15 text-emerald-400 border border-emerald-400/20">
                    📋 Itinerary
                  </span>
                )}
                {statusBadge(item.status)}
                <span className={`font-medium shrink-0 ${item.actualCost > 0 ? 'text-ody-success' : 'text-ody-text-dim'}`}>
                  {item.actualCost > 0 ? formatMoneyFull(item.actualCost, currency) : `~${formatMoneyFull(item.estimatedCost, currency)}`}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SummaryCard({ label, value, sub, accent, icon: Icon }: {
  label: string; value: string; sub: string; accent: string; icon?: any;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 text-center"
    >
      <p className="text-xs text-ody-text-dim uppercase tracking-wide">{label}</p>
      <div className="flex items-center justify-center gap-1.5 mt-1">
        {Icon && <Icon size={16} className={accent} />}
        <p className={`text-xl font-bold ${accent}`}>{value}</p>
      </div>
      <p className="text-xs text-ody-text-dim mt-0.5">{sub}</p>
    </motion.div>
  );
}
