import React, { useState } from 'react';
import { Bell, Plus, Search, DollarSign, Euro, PoundSterling, IndianRupee } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuthStore } from '../../store/authStore';

interface TopbarProps {
  title: string;
  onQuickAdd: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ title, onQuickAdd }) => {
  const { currency, setCurrency } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);

  const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'INR', symbol: '₹' },
  ];

  return (
    <header className="h-20 border-b border-slate-800 bg-slate-950/40 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Currency Switcher */}
        <div className="flex items-center bg-slate-900/90 rounded-xl p-1 border border-slate-800">
          {currencies.map((c) => (
            <button
              key={c.code}
              onClick={() => setCurrency(c.code)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                currency === c.code
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {c.symbol} {c.code}
            </button>
          ))}
        </div>

        {/* Quick Add Button */}
        <Button variant="primary" size="md" onClick={onQuickAdd}>
          <Plus className="w-4 h-4" />
          <span>New Transaction</span>
        </Button>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-slate-400 hover:text-slate-100 bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 glass-card rounded-2xl p-4 border border-slate-700/80 shadow-2xl z-50">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                <span className="font-bold text-sm text-slate-100">Notifications</span>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase bg-emerald-500/10 px-2 py-0.5 rounded">2 New</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <p className="font-semibold text-slate-200">Budget Threshold Warning</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Dining & Cafes spending reached 68% of monthly limit.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <p className="font-semibold text-slate-200">Savings Goal Progress</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Emergency Fund reached 65% completion milestone.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
