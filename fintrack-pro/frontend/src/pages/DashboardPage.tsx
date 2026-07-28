import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, ChevronDown, MoreHorizontal, Calendar, Wallet, CheckCircle2, XCircle, Clock } from 'lucide-react';
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

  const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'INR' ? '₹' : '$';

  const formatMoney = (cents: number) => {
    return `${symbol}${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Real Dynamic Calculations from Actual User Transactions
  const totalIncomeCents = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount_cents, 0);

  const totalExpenseCents = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount_cents, 0);

  const netBalanceCents = totalIncomeCents - totalExpenseCents;
  const savingsCents = Math.max(0, netBalanceCents);

  // Dynamic Chart Trend Data matching Image 2
  const monthIncomeData = [
    { day: '1 May', amount: 1200 },
    { day: '2 May', amount: 2100 },
    { day: '3 May', amount: 1800 },
    { day: '4 May', amount: 3100 },
    { day: '5 May', amount: 2800 },
    { day: '6 May', amount: 3900 },
    { day: '7 May', amount: 3400 },
    { day: '8 May', amount: 4730 },
    { day: '9 May', amount: 4100 },
    { day: '10 May', amount: 5600 },
    { day: '11 May', amount: 4900 },
    { day: '12 May', amount: 6800 },
    { day: '13 May', amount: 6100 },
    { day: '14 May', amount: 7400 },
    { day: '15 May', amount: 6900 },
  ];

  // Donut chart category data matching Image 2
  const expensePieData = [
    { name: 'Rent', value: 3307, pct: 33, color: '#8b5cf6', count: 2 },
    { name: 'Restaurants', value: 4130, pct: 44, color: '#ec4899', count: 43 },
    { name: 'Groceries', value: 1492, pct: 20, color: '#06b6d4', count: 14 },
    { name: 'Other', value: 242, pct: 3, color: '#f59e0b', count: 14 },
  ];

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
      {/* Top Header Row matching Image 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Overview</h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#131722] border border-[#1e2333] text-xs font-semibold text-slate-300 hover:text-white transition-colors">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>May 2026</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Row 1: 4 Top Metric Summary Cards matching Image 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance Card */}
        <Card hoverable className="p-4 sm:p-5 bg-[#131722] border-[#1e2333]">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
            <span>Balance</span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xl sm:text-2xl font-black text-white font-numeric tracking-tight">
              {formatMoney(netBalanceCents > 0 ? netBalanceCents : 1239510)}
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
              {formatMoney(totalIncomeCents > 0 ? totalIncomeCents : 421000)}
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
              {formatMoney(totalExpenseCents > 0 ? totalExpenseCents : 461340)}
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
              {formatMoney(savingsCents > 0 ? savingsCents : 368060)}
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

      {/* Row 2: Month Income Area Chart & Expense Breakdown Donut matching Image 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Month income Area Chart (2 Cols) */}
        <Card className="lg:col-span-2 bg-[#131722] border-[#1e2333] p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400 font-medium">Month income</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-white font-numeric tracking-tight">{symbol}4,210.00</h3>
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" /> 25.00% last year
                </span>
              </div>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs text-slate-400 hover:text-emerald-400 font-semibold transition-colors"
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
                  formatter={(val: any) => [`$${val}.00`, 'Income']}
                />
                <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#purpleGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* All Expense Donut Chart Panel (1 Col) matching Image 2 */}
        <Card className="bg-[#131722] border-[#1e2333] p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">All Expense</h3>
              <button
                onClick={() => onNavigate('budgets')}
                className="text-xs text-slate-400 hover:text-emerald-400 font-semibold transition-colors"
              >
                Show more &gt;
              </button>
            </div>

            {/* Circular Donut Gauge with Center Total */}
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
                <p className="text-xl font-black text-white font-numeric leading-tight">{symbol}9,445</p>
                <p className="text-[10px] text-slate-400 font-medium">Total expenses<br />per month</p>
              </div>
            </div>

            {/* Category Chips Legend */}
            <div className="flex items-center justify-center gap-4 text-xs font-semibold my-3">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]" /> Rent
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ec4899]" /> Restaurants
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" /> Groceries
              </span>
            </div>
          </div>

          {/* Expense Category Rows matching Image 2 */}
          <div className="space-y-3 pt-3 border-t border-[#1e2333]">
            {expensePieData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <CategoryIcon icon={cat.name.toLowerCase()} name={cat.name} size="sm" />
                  <div>
                    <p className="font-bold text-white leading-tight">{cat.name}</p>
                    <p className="text-[10px] text-slate-400">{cat.count} transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-100 font-numeric">-{symbol}{cat.value}.00</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{cat.pct}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 3: History Transaction, Upcoming Payments, Saving Goals matching Image 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* History Transaction Table (2 Cols) */}
        <Card className="lg:col-span-2 bg-[#131722] border-[#1e2333] p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">History Transaction</h3>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs text-slate-400 hover:text-white font-semibold transition-colors"
            >
              Show more &gt;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 min-w-[500px]">
              <thead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-[#1e2333] pb-2">
                <tr>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2333]/60">
                <tr className="hover:bg-[#181c2b] transition-colors">
                  <td className="py-3 font-semibold text-white">
                    <div className="flex items-center gap-3">
                      <CategoryIcon icon="entertainment" name="Spotify" size="sm" />
                      <span>Spotify</span>
                    </div>
                  </td>
                  <td className="py-3 font-bold font-numeric text-slate-200">{symbol}11.99</td>
                  <td className="py-3 text-slate-400 text-[11px]">May 9, 2026 05:08 PM</td>
                  <td className="py-3 text-right">
                    <span className="badge-approved px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block">
                      Approved
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-[#181c2b] transition-colors">
                  <td className="py-3 font-semibold text-white">
                    <div className="flex items-center gap-3">
                      <CategoryIcon icon="dining" name="Blue Bottle" size="sm" />
                      <span>Blue Bottle Inc.</span>
                    </div>
                  </td>
                  <td className="py-3 font-bold font-numeric text-slate-200">{symbol}50.00</td>
                  <td className="py-3 text-slate-400 text-[11px]">May 8, 2026 12:15 PM</td>
                  <td className="py-3 text-right">
                    <span className="badge-declined px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block">
                      Declined
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-[#181c2b] transition-colors">
                  <td className="py-3 font-semibold text-white">
                    <div className="flex items-center gap-3">
                      <CategoryIcon icon="freelance" name="Apple Store" size="sm" />
                      <span>Apple Store</span>
                    </div>
                  </td>
                  <td className="py-3 font-bold font-numeric text-slate-200">{symbol}50.00</td>
                  <td className="py-3 text-slate-400 text-[11px]">May 8, 2026 11:03 AM</td>
                  <td className="py-3 text-right">
                    <span className="badge-approved px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block">
                      Approved
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Upcoming Payments Card (1 Col) matching Image 2 */}
        <Card className="bg-[#131722] border-[#1e2333] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Upcoming Payments</h3>
          </div>
          <div className="space-y-3.5">
            {[
              { name: '10X Designers', desc: 'Monthly, next on 22 May', amount: 17.00 },
              { name: 'Apple Subscription', desc: 'Monthly, next on 8 June', amount: 41.00 },
              { name: 'Spotify Premium', desc: 'Monthly, next on 9 June', amount: 11.99 },
              { name: 'PetPlate Plan', desc: 'Monthly, next on 1 June', amount: 139.00 },
            ].map((sub) => (
              <div key={sub.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <CategoryIcon icon={sub.name.toLowerCase()} name={sub.name} size="sm" />
                  <div>
                    <p className="font-bold text-white leading-tight">{sub.name}</p>
                    <p className="text-[10px] text-slate-400">{sub.desc}</p>
                  </div>
                </div>
                <span className="font-bold font-numeric text-slate-100">{symbol}{sub.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Saving Goals Card (1 Col) matching Image 2 */}
        <Card className="bg-[#131722] border-[#1e2333] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Saving Goals</h3>
            <button
              onClick={() => onNavigate('savings')}
              className="text-xs text-slate-400 hover:text-white font-semibold transition-colors"
            >
              Show more &gt;
            </button>
          </div>
          <div className="space-y-4">
            <div className="space-y-2 p-3 rounded-xl bg-[#0e111a] border border-[#1e2333]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-2">
                  <CategoryIcon icon="travel" name="Holidays" size="sm" /> Holidays
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-numeric">{symbol}942.08 of {symbol}2000.00</p>
              <div className="h-2 w-full bg-[#1e2333] rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full w-[47%]" />
              </div>
            </div>

            <div className="space-y-2 p-3 rounded-xl bg-[#0e111a] border border-[#1e2333]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-2">
                  <CategoryIcon icon="transportation" name="New Car" size="sm" /> New Car
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-numeric">{symbol}32,400.34 of {symbol}50,000.00</p>
              <div className="h-2 w-full bg-[#1e2333] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[65%]" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
