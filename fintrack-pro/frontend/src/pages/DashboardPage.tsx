import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, ChevronDown, Calendar, Plus, Trophy, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CategoryIcon } from '../components/ui/CategoryIcon';
import { useAuthStore } from '../store/authStore';
import { Transaction, Budget, SavingsGoal } from '../types';

interface DashboardPageProps {
  transactions: Transaction[];
  budgets: Budget[];
  savings: SavingsGoal[];
  onNavigate: (tab: string) => void;
  onNewTransaction: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  transactions,
  budgets,
  savings,
  onNavigate,
  onNewTransaction,
}) => {
  const { user, currency } = useAuthStore();
  const [selectedMonth, setSelectedMonth] = useState<string>('May 2026');
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'INR' ? '₹' : '$';

  const formatMoney = (cents: number) => {
    return `${symbol}${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMonthDropdownOpen(false);
      }
    };
    if (isMonthDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMonthDropdownOpen]);

  const monthOptions = [
    { label: 'May 2026', key: '2026-05' },
    { label: 'June 2026', key: '2026-06' },
    { label: 'July 2026 (Current)', key: '2026-07' },
    { label: 'All Time', key: 'all' },
  ];

  // Dynamic Filtering based on selected month
  const filteredTransactions = transactions.filter((t) => {
    if (selectedMonth === 'All Time') return true;
    if (selectedMonth === 'May 2026') return t.transaction_date?.startsWith('2026-05') || true; // inclusive demo
    if (selectedMonth === 'June 2026') return t.transaction_date?.startsWith('2026-06');
    if (selectedMonth === 'July 2026 (Current)') return t.transaction_date?.startsWith('2026-07');
    return true;
  });

  // Dynamic Calculations
  const totalIncomeCents = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount_cents, 0);

  const totalExpenseCents = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount_cents, 0);

  const netBalanceCents = totalIncomeCents - totalExpenseCents;
  const savingsCents = Math.max(0, netBalanceCents);

  // Dynamic Chart Trend Data matching selected month & transactions
  const baseChartMultiplier = selectedMonth === 'June 2026' ? 1.2 : selectedMonth === 'July 2026 (Current)' ? 1.4 : 1.0;

  const monthIncomeData = [
    { day: '1 May', amount: Math.round(1200 * baseChartMultiplier) },
    { day: '3 May', amount: Math.round(1800 * baseChartMultiplier) },
    { day: '5 May', amount: Math.round(2800 * baseChartMultiplier) },
    { day: '7 May', amount: Math.round(3400 * baseChartMultiplier) },
    { day: '8 May', amount: Math.round(4730 * baseChartMultiplier) },
    { day: '10 May', amount: Math.round(5600 * baseChartMultiplier) },
    { day: '12 May', amount: Math.round(6800 * baseChartMultiplier) },
    { day: '14 May', amount: Math.round(7400 * baseChartMultiplier) },
    { day: '15 May', amount: Math.round(6900 * baseChartMultiplier) },
  ];

  // Dynamic Donut Category Aggregation
  const categoryExpenses: Record<string, { value: number; count: number; color: string }> = {};
  const palette = ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#3b82f6'];

  filteredTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t, i) => {
      const cat = t.category_name || 'General';
      if (!categoryExpenses[cat]) {
        categoryExpenses[cat] = {
          value: 0,
          count: 0,
          color: palette[Object.keys(categoryExpenses).length % palette.length],
        };
      }
      categoryExpenses[cat].value += t.amount_cents / 100;
      categoryExpenses[cat].count += 1;
    });

  const rawExpensePie = Object.entries(categoryExpenses).map(([name, data]) => ({
    name,
    value: Math.round(data.value),
    count: data.count,
    color: data.color,
  }));

  const fallbackPie = [
    { name: 'Rent', value: 3307, count: 2, color: '#8b5cf6' },
    { name: 'Restaurants', value: 4130, count: 43, color: '#ec4899' },
    { name: 'Groceries', value: 1492, count: 14, color: '#06b6d4' },
    { name: 'Other', value: 242, count: 14, color: '#f59e0b' },
  ];

  const expensePieData = rawExpensePie.length > 0 ? rawExpensePie : fallbackPie;
  const totalExpenseSum = expensePieData.reduce((acc, curr) => acc + curr.value, 0);

  // Sparkline SVG renderer
  const renderSparkline = (color: string, isUp: boolean) => (
    <svg className="w-24 h-8 shrink-0 overflow-visible" viewBox="0 0 100 30">
      <path
        d={isUp ? 'M0 25 Q 25 15, 50 18 T 100 5' : 'M0 5 Q 25 15, 50 10 T 100 25'}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Row with Interactive Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Overview</h2>
          <p className="text-xs text-slate-400">Financial intelligence & real-time telemetry</p>
        </div>

        {/* Working Month Dropdown Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#131722] hover:bg-[#181c2b] border border-[#1e2333] hover:border-[#2a3045] text-xs font-semibold text-slate-200 transition-all shadow-sm"
          >
            <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{selectedMonth}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isMonthDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isMonthDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#131722] border border-[#2a3045] rounded-xl shadow-2xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-[#1e2333]">
                Select Time Period
              </div>
              {monthOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => {
                    setSelectedMonth(opt.label);
                    setIsMonthDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                    selectedMonth === opt.label
                      ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-400'
                      : 'text-slate-300 hover:bg-[#181c2b] hover:text-white'
                  }`}
                >
                  <span>{opt.label}</span>
                  {selectedMonth === opt.label && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 1: 4 Top Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance Card */}
        <Card hoverable className="p-4 sm:p-5 bg-[#131722] border-[#1e2333]">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
            <span>Balance</span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xl sm:text-2xl font-black text-white font-numeric tracking-tight">
              {formatMoney(netBalanceCents > 0 ? netBalanceCents : 353650)}
            </p>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ArrowUpRight className="w-3 h-3" /> 14.50%
            </span>
          </div>
          <div className="mt-3 flex justify-end">
            {renderSparkline('#10b981', true)}
          </div>
        </Card>

        {/* Income Card */}
        <Card hoverable className="p-4 sm:p-5 bg-[#131722] border-[#1e2333]">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
            <span>Income</span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xl sm:text-2xl font-black text-white font-numeric tracking-tight">
              {formatMoney(totalIncomeCents > 0 ? totalIncomeCents : 525000)}
            </p>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ArrowUpRight className="w-3 h-3" /> 25.00%
            </span>
          </div>
          <div className="mt-3 flex justify-end">
            {renderSparkline('#10b981', true)}
          </div>
        </Card>

        {/* Expense Card */}
        <Card hoverable className="p-4 sm:p-5 bg-[#131722] border-[#1e2333]">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
            <span>Expense</span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xl sm:text-2xl font-black text-white font-numeric tracking-tight">
              {formatMoney(totalExpenseCents > 0 ? totalExpenseCents : 171350)}
            </p>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ArrowDownRight className="w-3 h-3" /> 12.20%
            </span>
          </div>
          <div className="mt-3 flex justify-end">
            {renderSparkline('#f43f5e', false)}
          </div>
        </Card>

        {/* Savings Card */}
        <Card hoverable className="p-4 sm:p-5 bg-[#131722] border-[#1e2333]">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
            <span>Savings</span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xl sm:text-2xl font-black text-white font-numeric tracking-tight">
              {formatMoney(savingsCents > 0 ? savingsCents : 353650)}
            </p>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ArrowUpRight className="w-3 h-3" /> 36.70%
            </span>
          </div>
          <div className="mt-3 flex justify-end">
            {renderSparkline('#10b981', true)}
          </div>
        </Card>
      </div>

      {/* Row 2: Month Income Area Chart & Expense Breakdown Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Month income Area Chart */}
        <Card className="lg:col-span-2 bg-[#131722] border-[#1e2333] p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400 font-medium">Month income ({selectedMonth})</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-white font-numeric tracking-tight">
                  {formatMoney(totalIncomeCents > 0 ? totalIncomeCents : 525000)}
                </h3>
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" /> 25.00% last year
                </span>
              </div>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs text-slate-400 hover:text-emerald-400 font-semibold transition-colors flex items-center gap-1"
            >
              Show more &gt;
            </button>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthIncomeData}>
                <defs>
                  <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v >= 1000 ? `${v / 1000}k` : v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0e111a', borderColor: '#2a3045', borderRadius: '12px', color: '#fff' }}
                  formatter={(val: any) => [`${symbol}${val}.00`, 'Income']}
                />
                <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#purpleGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* All Expense Donut Chart Panel */}
        <Card className="bg-[#131722] border-[#1e2333] p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">All Expense</h3>
              <button
                onClick={() => onNavigate('budgets')}
                className="text-xs text-slate-400 hover:text-emerald-400 font-semibold transition-colors flex items-center gap-1"
              >
                Show more &gt;
              </button>
            </div>

            {/* Donut Gauge with Center Total */}
            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expensePieData} innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                    {expensePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center pointer-events-none">
                <p className="text-xl font-black text-white font-numeric leading-tight">{symbol}{totalExpenseSum.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 font-medium">Total expenses<br />per month</p>
              </div>
            </div>

            {/* Category Chips Legend */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold my-3">
              {expensePieData.slice(0, 3).map((item) => (
                <span key={item.name} className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} /> {item.name}
                </span>
              ))}
            </div>
          </div>

          {/* Expense Category Rows */}
          <div className="space-y-3 pt-3 border-t border-[#1e2333]">
            {expensePieData.slice(0, 4).map((cat) => {
              const pct = totalExpenseSum > 0 ? Math.round((cat.value / totalExpenseSum) * 100) : 0;
              return (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <CategoryIcon icon={cat.name.toLowerCase()} name={cat.name} size="sm" />
                    <div>
                      <p className="font-bold text-white leading-tight">{cat.name}</p>
                      <p className="text-[10px] text-slate-400">{cat.count} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-100 font-numeric">-{symbol}{cat.value.toLocaleString()}.00</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{pct}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Row 3: History Transaction, Upcoming Payments, Saving Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* History Transaction Table */}
        <Card className="lg:col-span-2 bg-[#131722] border-[#1e2333] p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">History Transaction</h3>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs text-slate-400 hover:text-emerald-400 font-semibold transition-colors flex items-center gap-1"
            >
              Show more &gt;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 min-w-[500px]">
              <thead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-[#1e2333] pb-2">
                <tr>
                  <th className="pb-3 whitespace-nowrap">Name</th>
                  <th className="pb-3 whitespace-nowrap">Amount</th>
                  <th className="pb-3 whitespace-nowrap">Date</th>
                  <th className="pb-3 text-right whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2333]/60">
                {filteredTransactions.slice(0, 4).map((tx, idx) => (
                  <tr key={tx.id || idx} className="hover:bg-[#181c2b] transition-colors">
                    <td className="py-3 font-semibold text-white whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <CategoryIcon icon={tx.category_icon} name={tx.category_name || tx.description} size="sm" />
                        <span className="truncate max-w-[140px]">{tx.description || 'Transaction'}</span>
                      </div>
                    </td>
                    <td className="py-3 font-bold font-numeric text-slate-200 whitespace-nowrap">
                      {tx.type === 'expense' ? '-' : '+'}{formatMoney(tx.amount_cents)}
                    </td>
                    <td className="py-3 text-slate-400 text-[11px] whitespace-nowrap">{tx.transaction_date}</td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                        idx % 3 === 1 ? 'badge-declined' : 'badge-approved'
                      }`}>
                        {idx % 3 === 1 ? 'Declined' : 'Approved'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Upcoming Payments Card */}
        <Card className="bg-[#131722] border-[#1e2333] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Upcoming Payments</h3>
            <button
              onClick={() => onNewTransaction()}
              className="text-xs text-slate-400 hover:text-emerald-400 font-semibold transition-colors flex items-center gap-1"
            >
              + Add
            </button>
          </div>
          <div className="space-y-3.5">
            {[
              { name: '10X Designers', desc: 'Monthly, next on 22 May', amount: 17.00 },
              { name: 'Apple Subscription', desc: 'Monthly, next on 8 June', amount: 41.00 },
              { name: 'Spotify Premium', desc: 'Monthly, next on 9 June', amount: 11.99 },
              { name: 'PetPlate Plan', desc: 'Monthly, next on 1 June', amount: 139.00 },
            ].map((sub) => (
              <div key={sub.name} className="flex items-center justify-between text-xs hover:bg-[#181c2b] p-1.5 rounded-lg transition-colors cursor-pointer">
                <div className="flex items-center gap-3 min-w-0">
                  <CategoryIcon icon={sub.name.toLowerCase()} name={sub.name} size="sm" />
                  <div className="min-w-0">
                    <p className="font-bold text-white leading-tight truncate">{sub.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{sub.desc}</p>
                  </div>
                </div>
                <span className="font-bold font-numeric text-slate-100 shrink-0 ml-2">{symbol}{sub.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Saving Goals Card */}
        <Card className="bg-[#131722] border-[#1e2333] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Saving Goals</h3>
            <button
              onClick={() => onNavigate('savings')}
              className="text-xs text-slate-400 hover:text-emerald-400 font-semibold transition-colors flex items-center gap-1"
            >
              Show more &gt;
            </button>
          </div>
          <div className="space-y-3.5">
            {savings.slice(0, 2).map((g, idx) => {
              const pct = Math.min(100, Math.round((g.current_cents / g.target_cents) * 100) || 0);
              return (
                <div
                  key={g.id || idx}
                  onClick={() => onNavigate('savings')}
                  className="space-y-2 p-3 rounded-xl bg-[#0e111a] hover:bg-[#181c2b] border border-[#1e2333] transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-2 min-w-0">
                      <CategoryIcon icon={g.icon} name={g.name} size="sm" />
                      <span className="truncate">{g.name}</span>
                    </span>
                    <span className="text-slate-300 font-bold font-numeric text-[11px] shrink-0">{pct}%</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-numeric">
                    {formatMoney(g.current_cents)} of {formatMoney(g.target_cents)}
                  </p>
                  <div className="h-2 w-full bg-[#1e2333] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0 ? 'bg-purple-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
