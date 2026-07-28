import React, { useState } from 'react';
import { Plus, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { CategoryIcon } from '../components/ui/CategoryIcon';
import { useAuthStore } from '../store/authStore';
import { Budget, Category, Transaction } from '../types';

interface BudgetsPageProps {
  budgets: Budget[];
  transactions: Transaction[];
  categories: Category[];
  onAddBudget: (b: Partial<Budget>) => void;
  onDeleteBudget?: (id: number) => void;
}

export const BudgetsPage: React.FC<BudgetsPageProps> = ({
  budgets,
  transactions,
  categories,
  onAddBudget,
  onDeleteBudget,
}) => {
  const { currency } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isExpenseCategory = (c: Category) => {
    const typeLower = (c.type || '').toLowerCase();
    const nameLower = (c.name || '').toLowerCase();
    const isIncomeName = nameLower === 'salary' || nameLower === 'freelance' || nameLower === 'investments';
    return typeLower !== 'income' && !isIncomeName;
  };

  const expenseCategories = categories.filter(isExpenseCategory);

  const [categoryId, setCategoryId] = useState<number>(() => {
    const firstExpense = categories.find(isExpenseCategory);
    return firstExpense ? firstExpense.id : 3;
  });
  const [limitDollars, setLimitDollars] = useState<string>('500');

  const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'INR' ? '₹' : '$';

  const formatMoney = (cents: number) => {
    return `${symbol}${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const limitCents = Math.round(parseFloat(limitDollars) * 100);
    const cat = categories.find((c) => c.id === categoryId);

    onAddBudget({
      category_id: categoryId,
      limit_cents: limitCents,
      spent_cents: 0,
      remaining_cents: limitCents,
      usage_percentage: 0,
      is_exceeded: false,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      category_name: cat?.name || 'Category',
      category_icon: cat?.icon || 'groceries',
      category_color: cat?.color || '#6B7280',
    });

    setIsModalOpen(false);
  };

  const displayBudgets = budgets.filter((b) => {
    const cat = categories.find((c) => c.id === b.category_id);
    if (cat) return isExpenseCategory(cat);
    const bNameLower = (b.category_name || '').toLowerCase();
    return bNameLower !== 'salary' && bNameLower !== 'freelance' && bNameLower !== 'investments';
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Monthly Category Budgets</h2>
          <p className="text-xs text-slate-400">Set spending limits and prevent budget overruns with active alerts.</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            const firstExpense = categories.find(isExpenseCategory);
            if (firstExpense) {
              setCategoryId(firstExpense.id);
            }
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Set Category Budget</span>
        </Button>
      </div>

      {/* Budget Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {displayBudgets.map((b) => {
          // Dynamic Spending calculation from actual transactions
          const spentCents = (transactions || [])
            .filter((t) => t.type === 'expense' && (
              t.category_id === b.category_id ||
              t.category_name?.toLowerCase() === b.category_name?.toLowerCase() ||
              t.category_icon?.toLowerCase() === b.category_icon?.toLowerCase()
            ))
            .reduce((sum, t) => sum + t.amount_cents, 0);

          const remainingCents = Math.max(0, b.limit_cents - spentCents);
          const rawPct = b.limit_cents > 0 ? Math.round((spentCents / b.limit_cents) * 100) : 0;
          const pct = Math.min(100, rawPct);
          const isWarning = rawPct >= 80 && rawPct < 100;
          const isExceeded = spentCents >= b.limit_cents;

          return (
            <Card key={b.id} hoverable className="space-y-4 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-1">
                  <CategoryIcon icon={b.category_icon} name={b.category_name} size="md" />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-100 text-sm sm:text-base leading-tight truncate">{b.category_name || 'Category'}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-numeric">Limit: {formatMoney(b.limit_cents)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isExceeded ? (
                    <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 shrink-0">
                      <AlertCircle className="w-3 h-3" /> Exceeded
                    </span>
                  ) : isWarning ? (
                    <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shrink-0">
                      <AlertCircle className="w-3 h-3" /> Warning
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> On Track
                    </span>
                  )}

                  {onDeleteBudget && (
                    <button
                      onClick={() => onDeleteBudget(b.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                      title="Delete Budget"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Spent: {formatMoney(spentCents)}</span>
                  <span className="text-slate-100">{rawPct}%</span>
                </div>
                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Remaining:</span>
                <span className={`font-bold font-numeric ${remainingCents > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatMoney(remainingCents)}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Set Budget Modal */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Set Category Budget">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/70 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label={`Monthly Limit (${symbol})`}
            type="number"
            value={limitDollars}
            onChange={(e) => setLimitDollars(e.target.value)}
            required
            min="1"
          />

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Budget
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
