import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Trash2, Check, Package } from 'lucide-react';
import type { PackingItem } from '../../types/trips';

interface Props {
  tripId: string;
  items: PackingItem[];
}

const categoryEmoji: Record<string, string> = {
  clothing: '👕',
  toiletries: '🧴',
  electronics: '📱',
  documents: '📄',
  general: '📦',
};

export function PackingTab({ tripId, items }: Props) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'general', quantity: '1' });

  const addMutation = useMutation({
    mutationFn: (data: any) => fetch(`/api/trips/${tripId}/packing`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, quantity: Number(data.quantity) || 1 }),
    }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trip', tripId] }); setShowAdd(false); setForm({ name: '', category: 'general', quantity: '1' }); },
  });

  const toggleMutation = useMutation({
    mutationFn: (item: PackingItem) => fetch(`/api/trips/${tripId}/packing`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, packed: !item.packed }),
    }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/trips/${tripId}/packing`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
    }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const packed = items.filter(i => i.packed).length;
  const total = items.length;
  const progress = total > 0 ? (packed / total) * 100 : 0;

  // Group by category
  const grouped = items.reduce<Record<string, PackingItem[]>>((acc, item) => {
    (acc[item.category] ||= []).push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Progress */}
      {total > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-ody-text-muted flex items-center gap-2">
              <Package size={14} /> Packing Progress
            </span>
            <span className="text-sm font-medium">{packed}/{total} items packed</span>
          </div>
          <div className="w-full h-2 bg-ody-bg rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full bg-ody-accent"
              initial={{ width: 0 }} animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }} />
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Packing List</h3>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ody-accent/10 text-ody-accent text-sm hover:bg-ody-accent/20 transition-colors">
          <Plus size={14} /> Add Item
        </button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input placeholder="Item name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent">
              <option value="clothing">Clothing</option><option value="toiletries">Toiletries</option>
              <option value="electronics">Electronics</option><option value="documents">Documents</option>
              <option value="general">General</option>
            </select>
            <input type="number" min="1" placeholder="Qty" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
              className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => addMutation.mutate(form)} disabled={!form.name}
              className="px-4 py-2 rounded-lg bg-ody-accent text-white text-sm hover:bg-ody-accent-hover disabled:opacity-50 transition-colors">Save</button>
            <button onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-lg border border-ody-border text-sm hover:bg-ody-surface-hover transition-colors">Cancel</button>
          </div>
        </motion.div>
      )}

      {total === 0 ? (
        <p className="text-ody-text-muted text-center py-8">No packing items yet. Start your list!</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, catItems]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-ody-accent mb-2 flex items-center gap-2">
                {categoryEmoji[category] || '📦'} <span className="capitalize">{category}</span>
                <span className="text-ody-text-dim font-normal">({catItems.filter(i => i.packed).length}/{catItems.length})</span>
              </h4>
              <div className="space-y-1">
                {catItems.map(item => (
                  <motion.div key={item.id} layout
                    className={`glass-card p-3 flex items-center gap-3 ${item.packed ? 'opacity-60' : ''}`}>
                    <button onClick={() => toggleMutation.mutate(item)}
                      className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors
                        ${item.packed ? 'bg-ody-success border-ody-success' : 'border-ody-border hover:border-ody-accent'}`}>
                      {item.packed && <Check size={12} className="text-white" />}
                    </button>
                    <span className={`flex-1 text-sm ${item.packed ? 'line-through' : ''}`}>{item.name}</span>
                    {item.quantity > 1 && <span className="text-xs text-ody-text-dim">×{item.quantity}</span>}
                    <button onClick={() => deleteMutation.mutate(item.id)}
                      className="text-ody-text-dim hover:text-ody-danger transition-colors p-1">
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
