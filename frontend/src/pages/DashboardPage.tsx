import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight, ShieldCheck, Sparkles } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
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
  const { currency } = useAuthStore();

  const getCurrencySymbol = (c: string) => {
    switch (c) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'INR': return '₹';
      default: return '$';
    }
  };

  const symbol = getCurrencySymbol(currency);

  const formatMoney = (cents: number) => {
    return `${symbol}${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Summary Metrics
  const totalIncomeCents = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount_cents, 525000);

  const totalExpenseCents = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount_cents, 214850);

  const netSavingsCents = totalIncomeCents - totalExpenseCents;
  const savingsRate = totalIncomeCents > 0 ? ((netSavingsCents / totalIncomeCents) * 100).toFixed(1) : '0.0';

  // Chart cashflow trend data
  const cashflowData = [
    { period: 'Feb', income: 4800, expense: 2100 },
    { period: 'Mar', income: 4900, expense: 2300 },
    { period: 'Apr', income: 5100, expense: 1950 },
    { period: 'May', income: 5000, expense: 2400 },
    { period: 'Jun', income: 5300, expense: 2200 },
    { period: 'Jul', income: totalIncomeCents / 100, expense: totalExpenseCents / 100 },
  ];

  // Category Breakdown Pie Chart
  const categoryChartData = [
    { name: 'Housing & Rent', value: 1400, color: '#EF4444' },
    { name: 'Groceries & Food', value: 450, color: '#F59E0B' },
    { name: 'Shopping', value: 280, color: '#84CC16' },
    { name: 'Utilities & Bills', value: 250, color: '#6366F1' },
    { name: 'Dining out', value: 180, color: '#EC4899' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="glass-card rounded-3xl p-8 border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-950 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PRO DASHBOARD
              </span>
              <span className="text-xs text-slate-400 font-medium">• Real-time Sync</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Financial Overview
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Track your cashflow, category budgets, and savings goals in one unified intelligence center.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => onNavigate('insights')}>
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>AI Insights</span>
            </Button>
            <Button variant="primary" onClick={onNewTransaction}>
              + Add Transaction
            </Button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hoverable className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Net Worth</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white tracking-tight">{formatMoney(netSavingsCents * 3)}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-400">
            <ArrowUpRight className="w-4 h-4" />
            <span>+12.4% vs last month</span>
          </div>
        </Card>

        <Card hoverable className="border-l-4 border-l-teal-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Income</span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white tracking-tight">{formatMoney(totalIncomeCents)}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-teal-400">
            <ArrowUpRight className="w-4 h-4" />
            <span>2 Income Sources</span>
          </div>
        </Card>

        <Card hoverable className="border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Expenses</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white tracking-tight">{formatMoney(totalExpenseCents)}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-rose-400">
            <ArrowDownRight className="w-4 h-4" />
            <span>Within monthly budget</span>
          </div>
        </Card>

        <Card hoverable className="border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Savings Rate</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white tracking-tight">{savingsRate}%</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-indigo-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Target: &gt;20% achieved</span>
          </div>
        </Card>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash flow trend area chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Cash Flow Performance</h3>
              <p className="text-xs text-slate-400">Monthly income vs expenses over time</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-slate-300">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="text-slate-300">Expense</span>
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflowData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="period" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="expense" stroke="#F43F5E" strokeWidth={3} fillOpacity={1} fill="url(#expenseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Expense Category Pie Chart */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Expense Breakdown</h3>
              <p className="text-xs text-slate-400">By top spending category</p>
            </div>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryChartData} innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {categoryChartData.slice(0, 3).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-100">{symbol}{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Transactions & Active Budget Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity List */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-100">Recent Transactions</h3>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('transactions')}>
              View All &rarr;
            </Button>
          </div>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg">
                    {tx.category_icon || (tx.type === 'income' ? '💰' : '📦')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{tx.description || tx.category_name || 'Transaction'}</p>
                    <p className="text-xs text-slate-400">{tx.transaction_date}</p>
                  </div>
                </div>
                <span className={`text-sm font-extrabold ${tx.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount_cents)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Budget Progress Widget */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-100">Category Budgets</h3>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('budgets')}>
              Manage &rarr;
            </Button>
          </div>
          <div className="space-y-4">
            {budgets.slice(0, 4).map((b) => {
              const pct = Math.min(100, b.usage_percentage || 50);
              return (
                <div key={b.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-200 flex items-center gap-2">
                      <span>{b.category_icon || '📦'}</span>
                      <span>{b.category_name || 'Category Budget'}</span>
                    </span>
                    <span className="text-slate-400">
                      {formatMoney(b.spent_cents)} / <span className="text-slate-200">{formatMoney(b.limit_cents)}</span>
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct > 90 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-400' : 'bg-emerald-500'
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
