import { useState, useMemo, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addBudgetItem, updateBudgetItem } from '../../server/fns/trip-details';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils, Car, Compass, ShoppingBag, Plus,
  ChevronLeft, ChevronRight, Calendar, TrendingUp,
} from 'lucide-react';
import type { BudgetItem } from '../../types/trips';

interface Props {
  tripId: string;
  items: BudgetItem[];
  startDate: string | null;
  endDate: string | null;
  currency: string;
}

const DAILY_CATEGORIES = [
  { key: 'food', label: 'Food & Dining', icon: Utensils, color: '#34d399', defaultEstimate: 50 },
  { key: 'transport', label: 'Transport', icon: Car, color: '#60a5fa', defaultEstimate: 20 },
  { key: 'activities', label: 'Activities', icon: Compass, color: '#fbbf24', defaultEstimate: 30 },
  { key: 'shopping', label: 'Souvenirs', icon: ShoppingBag, color: '#f87171', defaultEstimate: 15 },
] as const;

type DailyCategoryKey = typeof DAILY_CATEGORIES[number]['key'];

interface CellEdit {
  date: string;
  category: DailyCategoryKey;
  field: 'estimated' | 'actual';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatMoney(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(value);
}

function getDaysBetween(start: string, end: string): string[] {
  const days: string[] = [];
  const current = new Date(start + 'T00:00:00');
  const last = new Date(end + 'T00:00:00');
  while (current <= last) {
    days.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return days;
}

export function DailyBudgetSpreadsheet({ tripId, items, startDate, endDate, currency }: Props) {
  const queryClient = useQueryClient();
  const [editingCell, setEditingCell] = useState<CellEdit | null>(null);
  const [editValue, setEditValue] = useState('');
  const [currentWeekStart, setCurrentWeekStart] = useState(0);

  // Generate all trip days
  const allDays = useMemo(() => {
    if (!startDate || !endDate) return [];
    return getDaysBetween(startDate, endDate);
  }, [startDate, endDate]);

  const DAYS_PER_PAGE = 7;
  const visibleDays = useMemo(
    () => allDays.slice(currentWeekStart, currentWeekStart + DAYS_PER_PAGE),
    [allDays, currentWeekStart],
  );

  // Build a lookup: { "2026-03-15": { food: { estimated, actual, items }, ... } }
  const dailyData = useMemo(() => {
    const data: Record<string, Record<string, { estimated: number; actual: number; items: BudgetItem[] }>> = {};
    for (const day of allDays) {
      data[day] = {};
      for (const cat of DAILY_CATEGORIES) {
        data[day][cat.key] = { estimated: 0, actual: 0, items: [] };
      }
    }
    for (const item of items) {
      if (!item.date || !data[item.date]) continue;
      const catKey = DAILY_CATEGORIES.find(c => c.key === item.category)?.key;
      if (!catKey) continue;
      data[item.date][catKey].estimated += Number(item.estimatedCost || 0);
      data[item.date][catKey].actual += Number(item.actualCost || 0);
      data[item.date][catKey].items.push(item);
    }
    return data;
  }, [allDays, items]);

  // Mutations
  const addMutation = useMutation({
    mutationFn: (data: any) => addBudgetItem({ data: { tripId, ...data } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateBudgetItem({ data: { tripId, ...data } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const handleCellClick = useCallback((date: string, category: DailyCategoryKey, field: 'estimated' | 'actual') => {
    const cellData = dailyData[date]?.[category];
    const currentValue = field === 'estimated' ? cellData?.estimated : cellData?.actual;
    setEditingCell({ date, category, field });
    setEditValue(currentValue ? String(currentValue) : '');
  }, [dailyData]);

  const handleCellSave = useCallback(() => {
    if (!editingCell) return;
    const { date, category, field } = editingCell;
    const value = parseFloat(editValue) || 0;
    const cellData = dailyData[date]?.[category];

    if (cellData && cellData.items.length > 0) {
      // Update existing item
      const item = cellData.items[0];
      updateMutation.mutate({
        id: item.id,
        [field === 'estimated' ? 'estimatedCost' : 'actualCost']: String(value),
      });
    } else if (value > 0) {
      // Create new item
      const catMeta = DAILY_CATEGORIES.find(c => c.key === category)!;
      addMutation.mutate({
        category,
        description: `Daily ${catMeta.label}`,
        [field === 'estimated' ? 'estimatedCost' : 'actualCost']: String(value),
        date,
      });
    }
    setEditingCell(null);
    setEditValue('');
  }, [editingCell, editValue, dailyData, updateMutation, addMutation]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCellSave();
    if (e.key === 'Escape') { setEditingCell(null); setEditValue(''); }
  }, [handleCellSave]);

  // Populate default estimates for all days
  const populateDefaults = useCallback(() => {
    for (const day of allDays) {
      for (const cat of DAILY_CATEGORIES) {
        const cellData = dailyData[day]?.[cat.key];
        if (!cellData || cellData.items.length > 0) continue;
        addMutation.mutate({
          category: cat.key,
          description: `Daily ${cat.label}`,
          estimatedCost: String(cat.defaultEstimate),
          date: day,
        });
      }
    }
  }, [allDays, dailyData, addMutation]);

  // Summary calculations
  const totals = useMemo(() => {
    const result: Record<string, { estimated: number; actual: number }> = {};
    for (const cat of DAILY_CATEGORIES) {
      result[cat.key] = { estimated: 0, actual: 0 };
    }
    for (const day of allDays) {
      for (const cat of DAILY_CATEGORIES) {
        const cell = dailyData[day]?.[cat.key];
        if (cell) {
          result[cat.key].estimated += cell.estimated;
          result[cat.key].actual += cell.actual;
        }
      }
    }
    return result;
  }, [allDays, dailyData]);

  const grandTotalEstimated = Object.values(totals).reduce((s, t) => s + t.estimated, 0);
  const grandTotalActual = Object.values(totals).reduce((s, t) => s + t.actual, 0);

  // Daily totals for visible days
  const dayTotals = useMemo(() => {
    const result: Record<string, { estimated: number; actual: number }> = {};
    for (const day of visibleDays) {
      result[day] = { estimated: 0, actual: 0 };
      for (const cat of DAILY_CATEGORIES) {
        const cell = dailyData[day]?.[cat.key];
        if (cell) {
          result[day].estimated += cell.estimated;
          result[day].actual += cell.actual;
        }
      }
    }
    return result;
  }, [visibleDays, dailyData]);

  // Average daily spend
  const daysWithData = allDays.filter(d =>
    DAILY_CATEGORIES.some(c => (dailyData[d]?.[c.key]?.estimated || 0) > 0 || (dailyData[d]?.[c.key]?.actual || 0) > 0)
  ).length;
  const avgDaily = daysWithData > 0 ? (grandTotalEstimated || grandTotalActual) / daysWithData : 0;

  if (!startDate || !endDate) {
    return (
      <div className="glass-card p-6 text-center text-ody-text-muted">
        <Calendar size={24} className="mx-auto mb-2 opacity-50" />
        <p>Set trip start and end dates to use the daily budget spreadsheet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with summary */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-ody-text-muted flex items-center gap-2">
            <Calendar size={14} /> Daily Budget Spreadsheet
          </h4>
          <p className="text-xs text-ody-text-dim mt-0.5">
            {allDays.length} days · Avg {formatMoney(avgDaily, currency)}/day
          </p>
        </div>
        <div className="flex items-center gap-2">
          {allDays.length > 0 && items.filter(i => DAILY_CATEGORIES.some(c => c.key === i.category) && i.date).length === 0 && (
            <button
              onClick={populateDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ody-accent/10 text-ody-accent text-xs hover:bg-ody-accent/20 transition-colors"
            >
              <Plus size={12} /> Auto-fill Estimates
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {DAILY_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const t = totals[cat.key];
          return (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: `${cat.color}20` }}>
                  <Icon size={12} style={{ color: cat.color }} />
                </div>
                <span className="text-xs text-ody-text-dim">{cat.label}</span>
              </div>
              <p className="text-sm font-semibold" style={{ color: cat.color }}>
                {formatMoney(t.actual || t.estimated, currency)}
              </p>
              {t.actual > 0 && t.estimated > 0 && (
                <p className="text-xs text-ody-text-dim">Est: {formatMoney(t.estimated, currency)}</p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Grand total row */}
      <div className="glass-card p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-ody-accent" />
          <span className="text-sm font-medium">Trip Daily Total</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-ody-accent">
            {formatMoney(grandTotalActual || grandTotalEstimated, currency)}
          </span>
          {grandTotalActual > 0 && grandTotalEstimated > 0 && (
            <span className="text-xs text-ody-text-dim ml-2">Est: {formatMoney(grandTotalEstimated, currency)}</span>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentWeekStart(Math.max(0, currentWeekStart - DAYS_PER_PAGE))}
          disabled={currentWeekStart === 0}
          className="flex items-center gap-1 px-2 py-1 text-xs text-ody-text-muted hover:text-ody-accent disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={14} /> Previous
        </button>
        <span className="text-xs text-ody-text-dim">
          Days {currentWeekStart + 1}–{Math.min(currentWeekStart + DAYS_PER_PAGE, allDays.length)} of {allDays.length}
        </span>
        <button
          onClick={() => setCurrentWeekStart(Math.min(allDays.length - DAYS_PER_PAGE, currentWeekStart + DAYS_PER_PAGE))}
          disabled={currentWeekStart + DAYS_PER_PAGE >= allDays.length}
          className="flex items-center gap-1 px-2 py-1 text-xs text-ody-text-muted hover:text-ody-accent disabled:opacity-30 transition-colors"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>

      {/* Spreadsheet table */}
      <div className="glass-card overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-ody-border">
              <th className="text-left p-2 text-ody-text-dim font-medium sticky left-0 bg-ody-bg z-10 min-w-[100px]">
                Category
              </th>
              {visibleDays.map(day => {
                const isToday = day === new Date().toISOString().split('T')[0];
                return (
                  <th
                    key={day}
                    className={`text-center p-2 font-medium min-w-[90px] ${isToday ? 'text-ody-accent' : 'text-ody-text-dim'}`}
                  >
                    <div>{formatDate(day)}</div>
                  </th>
                );
              })}
              <th className="text-center p-2 text-ody-text-dim font-medium min-w-[80px]">Total</th>
            </tr>
          </thead>
          <tbody>
            {DAILY_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <tr key={cat.key} className="border-b border-ody-border/50 hover:bg-ody-surface/30 transition-colors">
                  <td className="p-2 sticky left-0 bg-ody-bg z-10">
                    <div className="flex items-center gap-2">
                      <Icon size={12} style={{ color: cat.color }} />
                      <span className="font-medium text-ody-text-muted">{cat.label}</span>
                    </div>
                  </td>
                  {visibleDays.map(day => {
                    const cell = dailyData[day]?.[cat.key];
                    const isEditing = editingCell?.date === day && editingCell?.category === cat.key;
                    const estimated = cell?.estimated || 0;
                    const actual = cell?.actual || 0;
                    const displayValue = actual || estimated;
                    const hasData = displayValue > 0;

                    return (
                      <td key={day} className="p-1 text-center">
                        {isEditing ? (
                          <div className="flex items-center gap-0.5">
                            <input
                              type="number"
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              onBlur={handleCellSave}
                              autoFocus
                              className="w-full bg-ody-bg border border-ody-accent rounded px-1 py-0.5 text-xs text-center outline-none"
                              step="0.01"
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCellClick(day, cat.key as DailyCategoryKey, 'estimated')}
                            className={`w-full py-1 px-1.5 rounded transition-colors ${
                              hasData
                                ? 'hover:bg-ody-surface-hover'
                                : 'hover:bg-ody-surface/50 text-ody-text-dim/30'
                            }`}
                          >
                            {hasData ? (
                              <div>
                                <span style={{ color: actual > 0 ? cat.color : undefined }}>
                                  {formatMoney(displayValue, currency)}
                                </span>
                                {actual > 0 && estimated > 0 && actual !== estimated && (
                                  <div className="text-[10px] text-ody-text-dim">
                                    est: {formatMoney(estimated, currency)}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px]">—</span>
                            )}
                          </button>
                        )}
                      </td>
                    );
                  })}
                  <td className="p-2 text-center font-medium" style={{ color: cat.color }}>
                    {formatMoney(totals[cat.key].actual || totals[cat.key].estimated, currency)}
                  </td>
                </tr>
              );
            })}
            {/* Daily totals row */}
            <tr className="border-t border-ody-border bg-ody-surface/20">
              <td className="p-2 sticky left-0 bg-ody-bg z-10 font-semibold text-ody-text-muted">
                Daily Total
              </td>
              {visibleDays.map(day => {
                const dt = dayTotals[day];
                const val = (dt?.actual || dt?.estimated || 0);
                return (
                  <td key={day} className="p-2 text-center font-semibold text-ody-accent">
                    {val > 0 ? formatMoney(val, currency) : '—'}
                  </td>
                );
              })}
              <td className="p-2 text-center font-bold text-ody-accent">
                {formatMoney(grandTotalActual || grandTotalEstimated, currency)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Help text */}
      <p className="text-[10px] text-ody-text-dim text-center">
        Click any cell to edit · Estimates shown for food, transport, activities & souvenirs
      </p>
    </div>
  );
}
