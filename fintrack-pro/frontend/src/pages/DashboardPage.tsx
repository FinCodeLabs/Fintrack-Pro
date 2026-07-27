import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight, ShieldCheck, Sparkles, PlusCircle, Wallet } from 'lucide-react';
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
  const { user, currency } = useAuthStore();

  const getCurrencySymbol = (c: string) => {
    switch (c) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'INR': return '₹';
      case 'CAD': return '$';
      case 'AUD': return '$';
      default: return '$';
    }
  };

  const symbol = getCurrencySymbol(currency);

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

  const netSavingsCents = totalIncomeCents - totalExpenseCents;
  const savingsRate = totalIncomeCents > 0 ? Math.max(0, ((netSavingsCents / totalIncomeCents) * 100)).toFixed(1) : '0.0';

  // Dynamic Category Breakdown for Pie Chart
  const categoryMap: Record<string, { value: number; color: string }> = {};
  const defaultColors = ['#EF4444', '#F59E0B', '#84CC16', '#6366F1', '#EC4899', '#3B82F6', '#06B6D4'];

  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t, i) => {
      const catName = t.category_name || 'General Expense';
      if (!categoryMap[catName]) {
        categoryMap[catName] = {
          value: 0,
          color: t.category_color || defaultColors[i % defaultColors.length],
        };
      }
      categoryMap[catName].value += t.amount_cents / 100;
    });

  const categoryChartData = Object.entries(categoryMap).map(([name, data]) => ({
    name,
    value: Math.round(data.value),
    color: data.color,
  }));

  if (categoryChartData.length === 0) {
    categoryChartData.push({ name: 'No Expenses Logged', value: 100, color: '#334155' });
  }

  // Dynamic Monthly Cash Flow Trend Data
  const monthlyMap: Record<string, { income: number; expense: number }> = {};
  transactions.forEach((t) => {
    const month = t.transaction_date ? t.transaction_date.substring(0, 7) : 'Current';
    if (!monthlyMap[month]) {
      monthlyMap[month] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      monthlyMap[month].income += t.amount_cents / 100;
    } else {
      monthlyMap[month].expense += t.amount_cents / 100;
    }
  });

  const cashflowData = Object.entries(monthlyMap)
    .sort()
    .slice(-6)
    .map(([period, val]) => ({
      period,
      income: val.income,
      expense: val.expense,
    }));

  if (cashflowData.length === 0) {
    cashflowData.push(
      { period: 'Period 1', income: 0, expense: 0 },
      { period: 'Current', income: totalIncomeCents / 100, expense: totalExpenseCents / 100 }
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="glass-card rounded-3xl p-8 border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-950 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                FINANCE WORKSPACE
              </span>
              <span className="text-xs text-slate-400 font-medium">• {user?.full_name || 'Personal Account'}</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.full_name?.split(' ')[0] || 'User'}!
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Track your cashflow, manage category budgets, and save towards your goals in your live financial dashboard.
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
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Net Balance</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white tracking-tight">{formatMoney(netSavingsCents)}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-400">
            <ArrowUpRight className="w-4 h-4" />
            <span>Net savings buffer</span>
          </div>
        </Card>

        <Card hoverable className="border-l-4 border-l-teal-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Income</span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white tracking-tight">{formatMoney(totalIncomeCents)}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-teal-400">
            <ArrowUpRight className="w-4 h-4" />
            <span>{transactions.filter((t) => t.type === 'income').length} Income Entries</span>
          </div>
        </Card>

        <Card hoverable className="border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Expenses</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white tracking-tight">{formatMoney(totalExpenseCents)}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-rose-400">
            <ArrowDownRight className="w-4 h-4" />
            <span>{transactions.filter((t) => t.type === 'expense').length} Expense Entries</span>
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
            <span>{Number(savingsRate) >= 20 ? 'Target achieved!' : 'Target: > 20%'}</span>
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
              <p className="text-xs text-slate-400">Monthly income vs expenses trend</p>
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
              <p className="text-xs text-slate-400">By category distribution</p>
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
          {transactions.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 mx-auto flex items-center justify-center text-slate-500">
                <Wallet className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-300 font-medium">No transactions recorded yet</p>
              <Button variant="primary" size="sm" onClick={onNewTransaction}>
                + Add First Transaction
              </Button>
            </div>
          ) : (
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
          )}
        </Card>

        {/* Budget Progress Widget */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-100">Category Budgets</h3>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('budgets')}>
              Manage &rarr;
            </Button>
          </div>
          {budgets.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-sm text-slate-400">No category budgets created yet.</p>
              <Button variant="outline" size="sm" onClick={() => onNavigate('budgets')}>
                + Create Budget Limit
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.slice(0, 4).map((b) => {
                const pct = Math.min(100, b.usage_percentage || 0);
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
          )}
        </Card>
      </div>
    </div>
  );
};
