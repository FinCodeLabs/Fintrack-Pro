import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { Dialog } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Transaction, Category } from '../../types';
import { AIAssistantWidget } from '../AIAssistantWidget';

interface AppLayoutProps {
  currentTab: string;
  setTab: (tab: string) => void;
  categories: Category[];
  transactions: Transaction[];
  onAddTransaction: (tx: Partial<Transaction>) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentTab,
  setTab,
  categories,
  transactions,
  onAddTransaction,
  isQuickAddOpen,
  setIsQuickAddOpen,
  children,
}) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

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

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    const validCats = categories.filter((c) => c.type === newType);
    if (validCats.length > 0) {
      setCategoryId(validCats[0].id);
    }
  };

  React.useEffect(() => {
    if (isQuickAddOpen) {
      const validCats = categories.filter((c) => c.type === type);
      if (validCats.length > 0 && !validCats.some((c) => c.id === categoryId)) {
        setCategoryId(validCats[0].id);
      }
    }
  }, [isQuickAddOpen, type, categories, categoryId]);

  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    const lower = val.toLowerCase();
    if (lower.includes('infosys') || lower.includes('salary') || lower.includes('paycheck')) {
      if (type !== 'income') {
        setType('income');
        const salaryCat = categories.find((c) => c.type === 'income' && c.name.toLowerCase().includes('salary'));
        if (salaryCat) {
          setCategoryId(salaryCat.id);
        }
      }
    }
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountCents = Math.round(parseFloat(amountDollars) * 100);

    const validCats = categories.filter((c) => c.type === type);
    let cat = validCats.find((c) => c.id === categoryId);
    if (!cat && validCats.length > 0) {
      cat = validCats[0];
    }
    const finalCategoryId = cat ? cat.id : categoryId;

    onAddTransaction({
      description: description.trim() || 'New Transaction',
      amount_cents: amountCents,
      type,
      category_id: finalCategoryId,
      transaction_date: txDate,
      category_name: cat?.name || (type === 'income' ? 'Salary' : 'General'),
      category_icon: cat?.icon || (type === 'income' ? 'salary' : 'expense'),
      category_color: cat?.color || (type === 'income' ? '#10B981' : '#6B7280'),
    });

    setDescription('');
    setIsQuickAddOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#0b0e14] text-slate-100 relative selection:bg-emerald-500 selection:text-white">
      {/* Desktop / Tablet Navigation Sidebar */}
      <Sidebar currentTab={currentTab} setTab={setTab} />

      {/* Mobile Navigation Drawer & Bottom Bar */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        currentTab={currentTab}
        setTab={setTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title={titles[currentTab] || 'FinTrack Pro'}
          currentTab={currentTab}
          setTab={setTab}
          onQuickAdd={() => setIsQuickAddOpen(true)}
          onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
        />
        <main className="p-4 sm:p-6 flex-1 overflow-y-auto pb-24 md:pb-8">{children}</main>
      </div>

      {/* Interactive AI Assistant Widget */}
      <AIAssistantWidget
        currentTab={currentTab}
        setTab={setTab}
        transactions={transactions}
        onOpenAddTransaction={() => setIsQuickAddOpen(true)}
      />

      {/* Quick Add Transaction Dialog */}
      <Dialog isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} title="New Transaction">
        <form onSubmit={handleQuickAddSubmit} className="space-y-4">
          <div className="flex gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'expense' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'income' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Income
            </button>
          </div>

          <Input
            label="Description"
            placeholder="e.g. Infosys Salary or Starbucks"
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            required
          />
          <Input
            label="Amount ($)"
            type="number"
            step="0.01"
            value={amountDollars}
            onChange={(e) => setAmountDollars(e.target.value)}
            required
            min="0.01"
          />

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
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <Input label="Date" type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} required />

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsQuickAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Record
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
