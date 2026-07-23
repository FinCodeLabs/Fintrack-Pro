import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Dialog } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Transaction, Category } from '../../types';

interface AppLayoutProps {
  currentTab: string;
  setTab: (tab: string) => void;
  categories: Category[];
  onAddTransaction: (tx: Partial<Transaction>) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentTab,
  setTab,
  categories,
  onAddTransaction,
  children,
}) => {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const [description, setDescription] = useState('');
  const [amountDollars, setAmountDollars] = useState('45.00');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id || 4);
  const [txDate, setTxDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    budgets: 'Budgets',
    savings: 'Savings Goals',
    analytics: 'Analytics',
    insights: 'AI Financial Insights',
    settings: 'Settings',
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountCents = Math.round(parseFloat(amountDollars) * 100);
    const cat = categories.find((c) => c.id === categoryId);

    onAddTransaction({
      description,
      amount_cents: amountCents,
      type,
      category_id: categoryId,
      transaction_date: txDate,
      category_name: cat?.name || 'General',
      category_icon: cat?.icon || (type === 'income' ? '💰' : '📦'),
      category_color: cat?.color || '#6B7280',
    });

    setDescription('');
    setIsQuickAddOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar currentTab={currentTab} setTab={setTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={titles[currentTab] || 'FinTrack Pro'} onQuickAdd={() => setIsQuickAddOpen(true)} />
        <main className="p-8 flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Quick Add Transaction Dialog */}
      <Dialog isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} title="New Transaction">
        <form onSubmit={handleQuickAddSubmit} className="space-y-4">
          <div className="flex gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'expense' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'income' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Income
            </button>
          </div>

          <Input label="Description" placeholder="e.g. Starbucks Coffee" value={description} onChange={(e) => setDescription(e.target.value)} required />
          <Input label="Amount ($)" type="number" step="0.01" value={amountDollars} onChange={(e) => setAmountDollars(e.target.value)} required min="0.01" />

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/70 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {categories
                .filter((c) => c.type === type)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
            </select>
          </div>

          <Input label="Date" type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} required />

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsQuickAddOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Add Record</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
