import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, CheckCircle, Circle, TrendingUp, TrendingDown,
  Plane, Home, Utensils, Compass, ShoppingBag, Car, MoreHorizontal,
  Edit2, X, ChevronDown, ChevronUp, Filter,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, Legend, AreaChart, Area, CartesianGrid, LineChart, Line,
} from 'recharts';
import type { BudgetItem, BudgetCategory } from '../../types/trips';
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

export function BudgetTab({ tripId, items, budgetCategories: catAllocations, totalBudget, currency }: Props) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [showCategorySetup, setShowCategorySetup] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BudgetItem>>({});
  const [form, setForm] = useState({
    category: 'food', description: '', estimatedCost: '', actualCost: '', date: '',
  });

  // ── Mutations ──────────────────────────────────
  const addMutation = useMutation({
    mutationFn: (data: any) => fetch(`/api/trips/${tripId}/budget`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      setShowAdd(false);
      setForm({ category: 'food', description: '', estimatedCost: '', actualCost: '', date: '' });
    },
  });

  const togglePaidMutation = useMutation({
    mutationFn: (item: BudgetItem) => fetch(`/api/trips/${tripId}/budget`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, paid: !item.paid }),
    }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const updateItemMutation = useMutation({
    mutationFn: (data: Partial<BudgetItem> & { id: string }) => fetch(`/api/trips/${tripId}/budget`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      setEditingItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/trips/${tripId}/budget`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
    }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const saveCategoryBudget = useMutation({
    mutationFn: (data: { category: string; allocatedBudget: string; id?: string }) => {
      const existing = catAllocations.find(c => c.category === data.category);
      const method = existing ? 'PUT' : 'POST';
      const body = existing ? { id: existing.id, allocatedBudget: data.allocatedBudget } : data;
      return fetch(`/api/trips/${tripId}/budget-categories`, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      }).then(r => r.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  // ── Computed data ──────────────────────────────
  const budget = Number(totalBudget || 0);
  const totalEstimated = items.reduce((s, i) => s + Number(i.estimatedCost || 0), 0);
  const totalActual = items.reduce((s, i) => s + Number(i.actualCost || 0), 0);
  const totalPaid = items.filter(i => i.paid).reduce((s, i) => s + Number(i.actualCost || i.estimatedCost || 0), 0);
  const remaining = budget - totalActual;

  const allocationMap = useMemo(() =>
    Object.fromEntries(catAllocations.map(c => [c.category, Number(c.allocatedBudget)])),
  [catAllocations]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, { estimated: number; actual: number; count: number; items: BudgetItem[] }> = {};
    for (const item of items) {
      if (!stats[item.category]) stats[item.category] = { estimated: 0, actual: 0, count: 0, items: [] };
      stats[item.category].estimated += Number(item.estimatedCost || 0);
      stats[item.category].actual += Number(item.actualCost || 0);
      stats[item.category].count++;
      stats[item.category].items.push(item);
    }
    return stats;
  }, [items]);

  // Pie chart data
  const pieData = CATEGORIES
    .map(c => ({
      name: c.label,
      value: (categoryStats[c.key]?.actual || categoryStats[c.key]?.estimated || 0),
      color: c.color,
    }))
    .filter(d => d.value > 0);

  // Bar chart: budget vs estimated vs actual per category
  const barData = CATEGORIES
    .map(c => ({
      name: c.label.split(' ')[0],
      budget: allocationMap[c.key] || 0,
      estimated: categoryStats[c.key]?.estimated || 0,
      actual: categoryStats[c.key]?.actual || 0,
    }))
    .filter(d => d.budget > 0 || d.estimated > 0 || d.actual > 0);

  // Spending timeline (cumulative by date)
  const timelineData = useMemo(() => {
    const dated = items
      .filter(i => i.date)
      .sort((a, b) => (a.date! > b.date! ? 1 : -1));
    if (dated.length === 0) return [];
    let cumulative = 0;
    let cumEstimated = 0;
    const points: { date: string; actual: number; estimated: number; budget: number }[] = [];
    for (const item of dated) {
      cumulative += Number(item.actualCost || 0);
      cumEstimated += Number(item.estimatedCost || 0);
      points.push({ date: item.date!, actual: cumulative, estimated: cumEstimated, budget });
    }
    return points;
  }, [items, budget]);

  const filteredItems = filterCategory ? items.filter(i => i.category === filterCategory) : items;

  const budgetPercent = budget > 0 ? Math.min((totalActual / budget) * 100, 100) : 0;
  const isOverBudget = totalActual > budget && budget > 0;

  return (
    <div className="space-y-6">
      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Total Budget" value={formatMoney(budget, currency)} sub={currency} accent="text-ody-accent" />
        <SummaryCard label="Estimated" value={formatMoney(totalEstimated, currency)} sub={`${items.length} items`} accent="text-ody-info" />
        <SummaryCard
          label="Actual Spent"
          value={formatMoney(totalActual, currency)}
          sub={`${items.filter(i => i.paid).length} paid`}
          accent={isOverBudget ? 'text-ody-danger' : 'text-ody-success'}
        />
        <SummaryCard
          label="Remaining"
          value={formatMoney(remaining, currency)}
          sub={budget > 0 ? `${(100 - budgetPercent).toFixed(0)}% left` : 'No budget set'}
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
              {formatMoney(totalActual, currency)} / {formatMoney(budget, currency)}
            </span>
          </div>
          <div className="h-3 bg-ody-surface rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(budgetPercent, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                isOverBudget ? 'bg-gradient-to-r from-ody-danger/80 to-ody-danger' :
                budgetPercent > 80 ? 'bg-gradient-to-r from-amber-500/80 to-amber-500' :
                'bg-gradient-to-r from-ody-accent/80 to-ody-accent'
              }`}
            />
          </div>
        </div>
      )}

      {/* ── Category Breakdown ── */}
      <div className="glass-card p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-semibold text-ody-text-muted">Category Breakdown</h4>
          <button
            onClick={() => setShowCategorySetup(!showCategorySetup)}
            className="text-xs text-ody-accent hover:text-ody-accent-hover transition-colors flex items-center gap-1"
          >
            <Edit2 size={12} /> Set Budgets
          </button>
        </div>

        {/* Category budget setup */}
        <AnimatePresence>
          {showCategorySetup && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-ody-surface/50 rounded-lg">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <div key={cat.key} className="flex items-center gap-2">
                      <Icon size={14} style={{ color: cat.color }} />
                      <span className="text-xs text-ody-text-muted w-28">{cat.label}</span>
                      <input
                        type="number"
                        placeholder="0"
                        defaultValue={allocationMap[cat.key] || ''}
                        onBlur={e => {
                          const val = e.target.value;
                          if (val) saveCategoryBudget.mutate({ category: cat.key, allocatedBudget: val });
                        }}
                        className="bg-ody-bg border border-ody-border rounded px-2 py-1 text-xs w-24 outline-none focus:border-ody-accent"
                      />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category progress bars */}
        <div className="space-y-3">
          {CATEGORIES.map(cat => {
            const stats = categoryStats[cat.key];
            if (!stats && !allocationMap[cat.key]) return null;
            const allocated = allocationMap[cat.key] || 0;
            const actual = stats?.actual || 0;
            const estimated = stats?.estimated || 0;
            const displayValue = actual || estimated;
            const percent = allocated > 0 ? Math.min((displayValue / allocated) * 100, 100) : 0;
            const isOver = allocated > 0 && displayValue > allocated;
            const Icon = cat.icon;
            const isExpanded = expandedCategory === cat.key;

            return (
              <div key={cat.key}>
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : cat.key)}
                  className="w-full text-left"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={14} style={{ color: cat.color }} />
                    <span className="text-xs font-medium flex-1">{cat.label}</span>
                    <span className="text-xs text-ody-text-dim">
                      {formatMoney(displayValue, currency)}
                      {allocated > 0 && <span className="text-ody-text-dim"> / {formatMoney(allocated, currency)}</span>}
                    </span>
                    <span className="text-xs text-ody-text-dim">({stats?.count || 0})</span>
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </div>
                  {allocated > 0 && (
                    <div className="h-1.5 bg-ody-surface rounded-full overflow-hidden ml-5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percent, 100)}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: isOver ? '#f87171' : cat.color }}
                      />
                    </div>
                  )}
                </button>

                {/* Expanded items for this category */}
                <AnimatePresence>
                  {isExpanded && stats && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="ml-5 mt-2 space-y-1 overflow-hidden"
                    >
                      {stats.items.map(item => (
                        <div key={item.id} className="flex items-center gap-2 py-1.5 px-2 bg-ody-surface/30 rounded text-xs">
                          <button onClick={() => togglePaidMutation.mutate(item)}
                            className={item.paid ? 'text-ody-success' : 'text-ody-text-dim hover:text-ody-accent'}>
                            {item.paid ? <CheckCircle size={12} /> : <Circle size={12} />}
                          </button>
                          <span className="flex-1 truncate">{item.description}</span>
                          {item.estimatedCost && <span className="text-ody-text-dim">Est: {formatMoneyFull(Number(item.estimatedCost), currency)}</span>}
                          {item.actualCost && <span className="text-ody-success font-medium">{formatMoneyFull(Number(item.actualCost), currency)}</span>}
                          <button onClick={() => deleteMutation.mutate(item.id)} className="text-ody-text-dim hover:text-ody-danger">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Charts ── */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pie: spending distribution */}
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

          {/* Bar: budget vs estimated vs actual */}
          <div className="glass-card p-4">
            <h4 className="text-sm font-semibold mb-3 text-ody-text-muted">Budget vs Actual</h4>
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
                <Bar dataKey="actual" fill="#34d399" radius={[3, 3, 0, 0]} name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Spending timeline */}
          {timelineData.length > 1 && (
            <div className="glass-card p-4 lg:col-span-2">
              <h4 className="text-sm font-semibold mb-3 text-ody-text-muted">Spending Over Time</h4>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                  <XAxis dataKey="date" tick={{ fill: '#8888a0', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#8888a0', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 8, color: '#e4e4ed', fontSize: 12 }}
                    formatter={(v: any) => formatMoneyFull(Number(v), currency)}
                  />
                  {budget > 0 && <Line type="monotone" dataKey="budget" stroke="#6366f1" strokeDasharray="5 5" dot={false} name="Budget" />}
                  <Area type="monotone" dataKey="estimated" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.1} name="Estimated" />
                  <Area type="monotone" dataKey="actual" stroke="#34d399" fill="#34d399" fillOpacity={0.2} name="Actual" />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── Expense List ── */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-lg">Expenses</h3>
          {/* Category filter */}
          <div className="flex items-center gap-1">
            <Filter size={12} className="text-ody-text-dim" />
            <select
              value={filterCategory || ''}
              onChange={e => setFilterCategory(e.target.value || null)}
              className="bg-transparent text-xs text-ody-text-muted outline-none cursor-pointer"
            >
              <option value="">All</option>
              {CATEGORIES.map(c => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
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

      {filteredItems.length === 0 ? (
        <p className="text-ody-text-muted text-center py-8">
          {filterCategory ? `No ${getCategoryMeta(filterCategory).label.toLowerCase()} expenses yet.` : 'No expenses yet. Add one to get started!'}
        </p>
      ) : (
        <div className="space-y-2">
          {filteredItems
            .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
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
