import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import type { BudgetItem } from '../../types/trips';

interface Props {
  tripId: string;
  items: BudgetItem[];
  totalBudget: string | null;
  currency: string;
}

const categoryColors: Record<string, string> = {
  transport: '#3b82f6',
  accommodation: '#8b5cf6',
  food: '#22c55e',
  activities: '#f59e0b',
  shopping: '#ef4444',
  other: '#6b7280',
};

export function BudgetTab({ tripId, items, totalBudget, currency }: Props) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: 'food', description: '', estimatedCost: '', actualCost: '', date: '' });

  const addMutation = useMutation({
    mutationFn: (data: any) => fetch(`/api/trips/${tripId}/budget`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trip', tripId] }); setShowAdd(false); setForm({ category: 'food', description: '', estimatedCost: '', actualCost: '', date: '' }); },
  });

  const togglePaidMutation = useMutation({
    mutationFn: (item: BudgetItem) => fetch(`/api/trips/${tripId}/budget`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, paid: !item.paid }),
    }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/trips/${tripId}/budget`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
    }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const totalEstimated = items.reduce((sum, i) => sum + Number(i.estimatedCost || 0), 0);
  const totalActual = items.reduce((sum, i) => sum + Number(i.actualCost || 0), 0);
  const budget = Number(totalBudget || 0);

  // Pie chart data by category
  const byCategory = Object.entries(
    items.reduce<Record<string, number>>((acc, i) => {
      const cat = i.category;
      acc[cat] = (acc[cat] || 0) + Number(i.estimatedCost || i.actualCost || 0);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Bar chart: estimated vs actual by category
  const barData = Object.entries(
    items.reduce<Record<string, { estimated: number; actual: number }>>((acc, i) => {
      const cat = i.category;
      if (!acc[cat]) acc[cat] = { estimated: 0, actual: 0 };
      acc[cat].estimated += Number(i.estimatedCost || 0);
      acc[cat].actual += Number(i.actualCost || 0);
      return acc;
    }, {})
  ).map(([name, vals]) => ({ name, ...vals }));

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Budget', value: budget, color: 'text-ody-accent' },
          { label: 'Estimated', value: totalEstimated, color: 'text-ody-info' },
          { label: 'Actual Spent', value: totalActual, color: totalActual > budget && budget > 0 ? 'text-ody-danger' : 'text-ody-success' },
        ].map(card => (
          <div key={card.label} className="glass-card p-4 text-center">
            <p className="text-xs text-ody-text-dim uppercase">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.color}`}>
              ${card.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-ody-text-dim">{currency}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-4">
            <h4 className="text-sm font-semibold mb-3 text-ody-text-muted">By Category</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={byCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                  {byCategory.map((entry) => (
                    <Cell key={entry.name} fill={categoryColors[entry.name] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 8, color: '#e4e4ed' }}
                  formatter={(v: any) => `$${Number(v).toFixed(2)}`} />
                <Legend formatter={(value: string) => <span className="text-xs text-ody-text-muted capitalize">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card p-4">
            <h4 className="text-sm font-semibold mb-3 text-ody-text-muted">Estimated vs Actual</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fill: '#8888a0', fontSize: 11 }} />
                <YAxis tick={{ fill: '#8888a0', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 8, color: '#e4e4ed' }}
                  formatter={(v: any) => `$${Number(v).toFixed(2)}`} />
                <Bar dataKey="estimated" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Add + List */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Expenses</h3>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ody-accent/10 text-ody-accent text-sm hover:bg-ody-accent/20 transition-colors">
          <Plus size={14} /> Add Expense
        </button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent">
              <option value="transport">Transport</option><option value="accommodation">Accommodation</option>
              <option value="food">Food</option><option value="activities">Activities</option>
              <option value="shopping">Shopping</option><option value="other">Other</option>
            </select>
            <input placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
            <input placeholder="Estimated cost" value={form.estimatedCost} onChange={e => setForm(p => ({ ...p, estimatedCost: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
            <input placeholder="Actual cost" value={form.actualCost} onChange={e => setForm(p => ({ ...p, actualCost: e.target.value }))}
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
        </motion.div>
      )}

      {items.length === 0 ? (
        <p className="text-ody-text-muted text-center py-8">No budget items yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <motion.div key={item.id} layout className="glass-card p-3 flex items-center gap-3">
              <button onClick={() => togglePaidMutation.mutate(item)}
                className={`transition-colors ${item.paid ? 'text-ody-success' : 'text-ody-text-dim hover:text-ody-accent'}`}>
                {item.paid ? <CheckCircle size={16} /> : <Circle size={16} />}
              </button>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: categoryColors[item.category] || '#6b7280' }} />
              <span className="text-xs text-ody-text-dim capitalize w-24">{item.category}</span>
              <span className="flex-1 text-sm">{item.description}</span>
              {item.estimatedCost && <span className="text-xs text-ody-text-dim">Est: ${item.estimatedCost}</span>}
              {item.actualCost && <span className="text-xs text-ody-success font-medium">${item.actualCost}</span>}
              {item.date && <span className="text-xs text-ody-text-dim">{item.date}</span>}
              <button onClick={() => deleteMutation.mutate(item.id)}
                className="text-ody-text-dim hover:text-ody-danger transition-colors p-1">
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
