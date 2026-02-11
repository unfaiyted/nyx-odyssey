import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addPackingItem, updatePackingItem, deletePackingItem } from '../../server/fns/trip-details';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Check, Package, Search, ChevronRight,
  CheckCircle2, Circle, PackageCheck, Filter, X, Sparkles,
  ShoppingCart, ExternalLink, AlertTriangle,
} from 'lucide-react';
import type { PackingItem } from '../../types/trips';

interface Props {
  tripId: string;
  items: PackingItem[];
}

const CATEGORIES = [
  { value: 'clothing', label: 'Clothing', emoji: '👕' },
  { value: 'toiletries', label: 'Toiletries', emoji: '🧴' },
  { value: 'electronics', label: 'Electronics', emoji: '📱' },
  { value: 'documents', label: 'Documents', emoji: '📄' },
  { value: 'medications', label: 'Medications', emoji: '💊' },
  { value: 'accessories', label: 'Accessories', emoji: '🎒' },
  { value: 'snacks', label: 'Snacks & Drinks', emoji: '🍫' },
  { value: 'general', label: 'General', emoji: '📦' },
];

type FilterMode = 'all' | 'packed' | 'unpacked' | 'to-purchase';

export function PackingTab({ tripId, items }: Props) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'general', quantity: '1' });
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', category: '', quantity: '' });

  // Mutations
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] });

  const addMutation = useMutation({
    mutationFn: (data: typeof form) => addPackingItem({ data: { tripId, ...data, quantity: Number(data.quantity) || 1 } }),
    onSuccess: () => { invalidate(); setShowAdd(false); setForm({ name: '', category: 'general', quantity: '1' }); },
  });

  const toggleMutation = useMutation({
    mutationFn: (item: PackingItem) => updatePackingItem({ data: { tripId, id: item.id, packed: !item.packed } }),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; name: string; category: string; quantity: number }) =>
      updatePackingItem({ data: { tripId, ...data } }),
    onSuccess: () => { invalidate(); setEditingId(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePackingItem({ data: { tripId, id } }),
    onSuccess: invalidate,
  });

  const bulkToggleMutation = useMutation({
    mutationFn: async ({ ids, packed }: { ids: string[]; packed: boolean }) => {
      await Promise.all(ids.map(id => updatePackingItem({ data: { tripId, id, packed } })));
    },
    onSuccess: invalidate,
  });

  // Computed
  const packed = items.filter(i => i.packed).length;
  const total = items.length;
  const progress = total > 0 ? (packed / total) * 100 : 0;

  const filtered = useMemo(() => {
    let result = items;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    }
    if (filterMode === 'packed') result = result.filter(i => i.packed);
    if (filterMode === 'unpacked') result = result.filter(i => !i.packed);
    if (filterMode === 'to-purchase') result = result.filter(i => !i.purchased && i.purchaseUrl);
    return result;
  }, [items, search, filterMode]);

  const grouped = useMemo(() => {
    const g = filtered.reduce<Record<string, PackingItem[]>>((acc, item) => {
      (acc[item.category] ||= []).push(item);
      return acc;
    }, {});
    // Sort categories by CATEGORIES order
    return CATEGORIES
      .filter(c => g[c.value])
      .map(c => ({ ...c, items: g[c.value] }));
  }, [filtered]);

  const toggleCollapse = (cat: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const startEdit = (item: PackingItem) => {
    setEditingId(item.id);
    setEditForm({ name: item.name, category: item.category, quantity: String(item.quantity) });
  };

  const saveEdit = (id: string) => {
    updateMutation.mutate({ id, name: editForm.name, category: editForm.category, quantity: Number(editForm.quantity) || 1 });
  };

  const allDone = total > 0 && packed === total;

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      {total > 0 && (
        <motion.div
          className={`glass-card p-5 relative overflow-hidden ${allDone ? 'ring-2 ring-ody-success/50' : ''}`}
          animate={allDone ? { scale: [1, 1.01, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          {allDone && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-ody-success/5 to-ody-success/10"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            />
          )}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-ody-text-muted flex items-center gap-2">
                {allDone ? <PackageCheck size={16} className="text-ody-success" /> : <Package size={16} />}
                {allDone ? 'All packed! Ready to go! ✨' : 'Packing Progress'}
              </span>
              <span className="text-sm font-semibold">
                {packed}/{total} items
                <span className="text-ody-text-dim ml-1">({Math.round(progress)}%)</span>
              </span>
            </div>
            <div className="w-full h-3 bg-ody-bg rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${allDone ? 'bg-ody-success' : 'bg-ody-accent'}`}
                initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            {/* Category mini-breakdown */}
            {!allDone && (
              <div className="flex flex-wrap gap-3 mt-3">
                {CATEGORIES.filter(c => items.some(i => i.category === c.value)).map(cat => {
                  const catItems = items.filter(i => i.category === cat.value);
                  const catPacked = catItems.filter(i => i.packed).length;
                  const catDone = catPacked === catItems.length;
                  return (
                    <span key={cat.value} className={`text-xs flex items-center gap-1 ${catDone ? 'text-ody-success' : 'text-ody-text-dim'}`}>
                      {catDone ? <CheckCircle2 size={10} /> : <Circle size={10} />}
                      {cat.emoji} {catPacked}/{catItems.length}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ody-text-dim" />
          <input
            placeholder="Search items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-ody-bg border border-ody-border rounded-lg pl-9 pr-8 py-2 text-sm outline-none focus:border-ody-accent transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ody-text-dim hover:text-ody-text">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <div className="flex bg-ody-bg border border-ody-border rounded-lg overflow-hidden">
            {(['all', 'unpacked', 'packed', 'to-purchase'] as FilterMode[]).map(mode => {
              const toBuyCount = items.filter(i => !i.purchased && i.purchaseUrl).length;
              return (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={`px-3 py-2 text-xs font-medium capitalize transition-colors
                    ${filterMode === mode ? 'bg-ody-accent text-white' : 'text-ody-text-muted hover:bg-ody-surface-hover'}`}
                >
                  {mode === 'all' ? `All (${total})` : mode === 'packed' ? `Packed (${packed})` : mode === 'unpacked' ? `To Pack (${total - packed})` : `Buy (${toBuyCount})`}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ody-accent text-white text-sm hover:bg-ody-accent-hover transition-colors"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  placeholder="Item name"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && form.name && addMutation.mutate(form)}
                  className="md:col-span-2 bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent"
                  autoFocus
                />
                <select
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                  ))}
                </select>
                <input
                  type="number" min="1" placeholder="Qty"
                  value={form.quantity}
                  onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
                  className="bg-ody-bg border border-ody-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ody-accent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => addMutation.mutate(form)}
                  disabled={!form.name || addMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-ody-accent text-white text-sm hover:bg-ody-accent-hover disabled:opacity-50 transition-colors"
                >
                  {addMutation.isPending ? 'Adding...' : 'Add Item'}
                </button>
                <button onClick={() => setShowAdd(false)}
                  className="px-4 py-2 rounded-lg border border-ody-border text-sm hover:bg-ody-surface-hover transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Groups */}
      {total === 0 ? (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-ody-text-dim mb-3 opacity-40" />
          <p className="text-ody-text-muted mb-1">No packing items yet</p>
          <p className="text-ody-text-dim text-sm">Start building your list!</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8">
          <Filter size={32} className="mx-auto text-ody-text-dim mb-2 opacity-40" />
          <p className="text-ody-text-muted text-sm">No items match your filter</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ value: category, label, emoji, items: catItems }) => {
            const collapsed = collapsedCategories.has(category);
            const catPacked = catItems.filter(i => i.packed).length;
            const catTotal = catItems.length;
            const catDone = catPacked === catTotal;
            const catProgress = (catPacked / catTotal) * 100;

            return (
              <motion.div key={category} layout className="glass-card overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => toggleCollapse(category)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-ody-surface-hover transition-colors"
                >
                  <motion.div animate={{ rotate: collapsed ? 0 : 90 }} transition={{ duration: 0.2 }}>
                    <ChevronRight size={16} className="text-ody-text-dim" />
                  </motion.div>
                  <span className="text-lg">{emoji}</span>
                  <span className="font-semibold text-sm flex-1 text-left">{label}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${catDone ? 'bg-ody-success/15 text-ody-success' : 'bg-ody-accent/10 text-ody-accent'}`}>
                    {catPacked}/{catTotal}
                  </span>
                  {/* Mini progress bar */}
                  <div className="w-16 h-1.5 bg-ody-bg rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${catDone ? 'bg-ody-success' : 'bg-ody-accent'}`}
                      animate={{ width: `${catProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  {/* Bulk action */}
                  {!collapsed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const unpackedIds = catItems.filter(i => !i.packed).map(i => i.id);
                        const packedIds = catItems.filter(i => i.packed).map(i => i.id);
                        if (catDone) {
                          bulkToggleMutation.mutate({ ids: packedIds, packed: false });
                        } else {
                          bulkToggleMutation.mutate({ ids: unpackedIds, packed: true });
                        }
                      }}
                      className="text-xs text-ody-text-dim hover:text-ody-accent transition-colors ml-1"
                      title={catDone ? 'Unpack all' : 'Pack all'}
                    >
                      {catDone ? 'Unpack' : 'Pack all'}
                    </button>
                  )}
                </button>

                {/* Items */}
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3 space-y-1">
                        {catItems.map(item => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors
                              ${item.packed ? 'bg-ody-success/5 opacity-60' : 'hover:bg-ody-surface-hover'}`}
                          >
                            {/* Checkbox */}
                            <button
                              onClick={() => toggleMutation.mutate(item)}
                              className="flex-shrink-0"
                            >
                              <motion.div
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors
                                  ${item.packed ? 'bg-ody-success border-ody-success' : 'border-ody-border hover:border-ody-accent'}`}
                                whileTap={{ scale: 0.85 }}
                              >
                                <AnimatePresence>
                                  {item.packed && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                      <Check size={12} className="text-white" />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            </button>

                            {/* Item content */}
                            {editingId === item.id ? (
                              <div className="flex-1 flex gap-2 items-center">
                                <input
                                  value={editForm.name}
                                  onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                                  onKeyDown={e => e.key === 'Enter' && saveEdit(item.id)}
                                  className="flex-1 bg-ody-bg border border-ody-accent rounded px-2 py-1 text-sm outline-none"
                                  autoFocus
                                />
                                <select
                                  value={editForm.category}
                                  onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}
                                  className="bg-ody-bg border border-ody-border rounded px-2 py-1 text-xs outline-none"
                                >
                                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                                </select>
                                <input
                                  type="number" min="1" value={editForm.quantity}
                                  onChange={e => setEditForm(p => ({ ...p, quantity: e.target.value }))}
                                  className="w-14 bg-ody-bg border border-ody-border rounded px-2 py-1 text-xs outline-none"
                                />
                                <button onClick={() => saveEdit(item.id)} className="text-ody-success p-1"><Check size={14} /></button>
                                <button onClick={() => setEditingId(null)} className="text-ody-text-dim p-1"><X size={14} /></button>
                              </div>
                            ) : (
                              <>
                                <span
                                  className={`flex-1 text-sm cursor-pointer ${item.packed ? 'line-through text-ody-text-dim' : ''}`}
                                  onDoubleClick={() => startEdit(item)}
                                  title="Double-click to edit"
                                >
                                  {item.name}
                                </span>
                                {item.quantity > 1 && (
                                  <span className="text-xs text-ody-text-dim bg-ody-bg px-1.5 py-0.5 rounded">×{item.quantity}</span>
                                )}
                                {item.priority === 'essential' && (
                                  <span className="text-xs bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded font-medium">Essential</span>
                                )}
                                {item.purchaseUrl && (
                                  <a
                                    href={item.purchaseUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded transition-colors ${
                                      item.purchased
                                        ? 'bg-ody-success/15 text-ody-success'
                                        : 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25'
                                    }`}
                                    onClick={e => e.stopPropagation()}
                                  >
                                    {item.purchased ? <CheckCircle2 size={10} /> : <ShoppingCart size={10} />}
                                    {item.purchased ? 'Bought' : 'Buy'}
                                    <ExternalLink size={8} />
                                  </a>
                                )}
                                {item.estimatedPrice && (
                                  <span className="text-xs text-ody-text-dim">${item.estimatedPrice}</span>
                                )}
                                <button
                                  onClick={() => deleteMutation.mutate(item.id)}
                                  className="text-ody-text-dim hover:text-ody-danger transition-colors p-1 opacity-0 group-hover:opacity-100"
                                  style={{ opacity: undefined }}
                                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                  onMouseLeave={e => (e.currentTarget.style.opacity = '0.3')}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Celebration overlay when all packed */}
      <AnimatePresence>
        {allDone && total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-6 text-center"
          >
            <Sparkles size={32} className="mx-auto text-ody-success mb-2" />
            <p className="font-semibold text-lg">You're all packed!</p>
            <p className="text-ody-text-muted text-sm mt-1">
              {total} items across {grouped.length} categories — ready for adventure 🎉
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
