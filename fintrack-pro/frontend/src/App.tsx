import React, { useState, useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { SavingsPage } from './pages/SavingsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { InsightsPage } from './pages/InsightsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Transaction, Budget, SavingsGoal, Category, FinancialInsight } from './types';
import { api } from './lib/api';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: 'Salary', icon: '💰', color: '#10B981', type: 'income', is_system: true, sort_order: 1 },
  { id: 2, name: 'Freelance', icon: '💻', color: '#3B82F6', type: 'income', is_system: true, sort_order: 2 },
  { id: 3, name: 'Housing & Rent', icon: '🏠', color: '#EF4444', type: 'expense', is_system: true, sort_order: 3 },
  { id: 4, name: 'Groceries & Food', icon: '🛒', color: '#F59E0B', type: 'expense', is_system: true, sort_order: 4 },
  { id: 5, name: 'Dining & Cafes', icon: '🍔', color: '#EC4899', type: 'expense', is_system: true, sort_order: 5 },
  { id: 6, name: 'Transportation', icon: '🚗', color: '#06B6D4', type: 'expense', is_system: true, sort_order: 6 },
  { id: 7, name: 'Utilities & Bills', icon: '⚡', color: '#6366F1', type: 'expense', is_system: true, sort_order: 7 },
  { id: 8, name: 'Shopping', icon: '🛍️', color: '#84CC16', type: 'expense', is_system: true, sort_order: 8 },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    user_id: 1,
    category_id: 1,
    amount_cents: 450000,
    type: 'income',
    description: 'Monthly Salary Paycheck',
    transaction_date: new Date().toISOString().split('T')[0],
    is_recurring: true,
    recurring_interval: 'monthly',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category_name: 'Salary',
    category_icon: '💰',
    category_color: '#10B981',
  },
  {
    id: 2,
    user_id: 1,
    category_id: 2,
    amount_cents: 75000,
    type: 'income',
    description: 'UI Design Consultancy',
    transaction_date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    recurring_interval: 'none',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category_name: 'Freelance',
    category_icon: '💻',
    category_color: '#3B82F6',
  },
  {
    id: 3,
    user_id: 1,
    category_id: 3,
    amount_cents: 140000,
    type: 'expense',
    description: 'Apartment Monthly Rent',
    transaction_date: new Date().toISOString().split('T')[0],
    is_recurring: true,
    recurring_interval: 'monthly',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category_name: 'Housing & Rent',
    category_icon: '🏠',
    category_color: '#EF4444',
  },
  {
    id: 4,
    user_id: 1,
    category_id: 4,
    amount_cents: 24550,
    type: 'expense',
    description: 'Whole Foods Organic Groceries',
    transaction_date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    recurring_interval: 'none',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category_name: 'Groceries & Food',
    category_icon: '🛒',
    category_color: '#F59E0B',
  },
  {
    id: 5,
    user_id: 1,
    category_id: 5,
    amount_cents: 6800,
    type: 'expense',
    description: 'Dinner at Italian Bistro',
    transaction_date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    recurring_interval: 'none',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category_name: 'Dining & Cafes',
    category_icon: '🍔',
    category_color: '#EC4899',
  },
];

const INITIAL_BUDGETS: Budget[] = [
  {
    id: 1,
    user_id: 1,
    category_id: 4,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    limit_cents: 60000,
    spent_cents: 24550,
    remaining_cents: 35450,
    usage_percentage: 40.9,
    is_exceeded: false,
    alert_threshold: 80,
    category_name: 'Groceries & Food',
    category_icon: '🛒',
    category_color: '#F59E0B',
  },
  {
    id: 2,
    user_id: 1,
    category_id: 5,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    limit_cents: 30000,
    spent_cents: 20400,
    remaining_cents: 9600,
    usage_percentage: 68.0,
    is_exceeded: false,
    alert_threshold: 80,
    category_name: 'Dining & Cafes',
    category_icon: '🍔',
    category_color: '#EC4899',
  },
  {
    id: 3,
    user_id: 1,
    category_id: 6,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    limit_cents: 20000,
    spent_cents: 8500,
    remaining_cents: 11500,
    usage_percentage: 42.5,
    is_exceeded: false,
    alert_threshold: 80,
    category_name: 'Transportation',
    category_icon: '🚗',
    category_color: '#06B6D4',
  },
];

const INITIAL_SAVINGS: SavingsGoal[] = [
  {
    id: 1,
    user_id: 1,
    name: 'Emergency Fund',
    description: '6 months buffer',
    icon: '🛡️',
    target_cents: 1000000,
    current_cents: 650000,
    remaining_cents: 350000,
    progress_percentage: 65,
    status: 'active',
    auto_save: true,
  },
  {
    id: 2,
    user_id: 1,
    name: 'Japan Autumn Vacation',
    description: 'Kyoto & Tokyo trip',
    icon: '🏯',
    target_cents: 350000,
    current_cents: 180000,
    remaining_cents: 170000,
    progress_percentage: 51.4,
    status: 'active',
    auto_save: false,
  },
];

const INITIAL_INSIGHTS: FinancialInsight[] = [
  {
    id: 1,
    user_id: 1,
    category: 'savings',
    title: 'Strong Savings Rate!',
    message: 'You saved 32% of total earnings this month! Your emergency fund is 65% complete.',
    severity: 'info',
    is_read: false,
    generated_at: new Date().toISOString(),
  },
  {
    id: 2,
    user_id: 1,
    category: 'budget',
    title: 'Dining & Cafes Threshold Alert',
    message: 'Dining & Cafes spending is at 68% of monthly limit with 18 days remaining.',
    severity: 'warning',
    is_read: false,
    generated_at: new Date().toISOString(),
  },
];

export function App() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentTab, setTab] = useState<string>('dashboard');

  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [savings, setSavings] = useState<SavingsGoal[]>(INITIAL_SAVINGS);
  const [insights, setInsights] = useState<FinancialInsight[]>(INITIAL_INSIGHTS);

  useEffect(() => {
    checkAuth();
  }, []);

  const handleAddTransaction = (newTx: Partial<Transaction>) => {
    const tx: Transaction = {
      id: Date.now(),
      user_id: 1,
      category_id: newTx.category_id,
      amount_cents: newTx.amount_cents || 0,
      type: newTx.type || 'expense',
      description: newTx.description || 'New Transaction',
      transaction_date: newTx.transaction_date || new Date().toISOString().split('T')[0],
      is_recurring: false,
      recurring_interval: 'none',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category_name: newTx.category_name,
      category_icon: newTx.category_icon,
      category_color: newTx.category_color,
    };
    setTransactions((prev) => [tx, ...prev]);

    // Also send to backend API asynchronously if available
    api.createTransaction(tx).catch(() => {});
  };

  const handleDeleteTransaction = (id: number) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    api.deleteTransaction(id).catch(() => {});
  };

  const handleAddBudget = (b: Partial<Budget>) => {
    const budget: Budget = {
      id: Date.now(),
      user_id: 1,
      category_id: b.category_id || 1,
      month: b.month || new Date().getMonth() + 1,
      year: b.year || new Date().getFullYear(),
      limit_cents: b.limit_cents || 10000,
      spent_cents: b.spent_cents || 0,
      remaining_cents: b.remaining_cents || b.limit_cents || 10000,
      usage_percentage: b.usage_percentage || 0,
      is_exceeded: false,
      alert_threshold: 80,
      category_name: b.category_name,
      category_icon: b.category_icon,
      category_color: b.category_color,
    };
    setBudgets((prev) => [...prev, budget]);
  };

  const handleAddSavingsGoal = (g: Partial<SavingsGoal>) => {
    const goal: SavingsGoal = {
      id: Date.now(),
      user_id: 1,
      name: g.name || 'New Goal',
      icon: g.icon || '🎯',
      target_cents: g.target_cents || 100000,
      current_cents: g.current_cents || 0,
      remaining_cents: g.target_cents || 100000,
      progress_percentage: 0,
      status: 'active',
      auto_save: false,
    };
    setSavings((prev) => [...prev, goal]);
  };

  const handleDepositSavings = (id: number, amountCents: number) => {
    setSavings((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const newCurrent = g.current_cents + amountCents;
          return {
            ...g,
            current_cents: newCurrent,
            remaining_cents: Math.max(0, g.target_cents - newCurrent),
            progress_percentage: Math.min(100, Math.round((newCurrent / g.target_cents) * 100)),
          };
        }
        return g;
      })
    );
  };

  if (!isAuthenticated) {
    if (authView === 'login') {
      return <LoginPage onSwitchToRegister={() => setAuthView('register')} />;
    }
    return <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
  }

  return (
    <AppLayout
      currentTab={currentTab}
      setTab={setTab}
      categories={categories}
      onAddTransaction={handleAddTransaction}
    >
      {currentTab === 'dashboard' && (
        <DashboardPage
          transactions={transactions}
          budgets={budgets}
          savings={savings}
          onNavigate={setTab}
          onNewTransaction={() => {
            const btn = document.querySelector('header button') as HTMLButtonElement;
            if (btn) btn.click();
          }}
        />
      )}
      {currentTab === 'transactions' && (
        <TransactionsPage
          transactions={transactions}
          onNewTransaction={() => {
            const btn = document.querySelector('header button') as HTMLButtonElement;
            if (btn) btn.click();
          }}
          onDeleteTransaction={handleDeleteTransaction}
        />
      )}
      {currentTab === 'budgets' && (
        <BudgetsPage budgets={budgets} categories={categories} onAddBudget={handleAddBudget} />
      )}
      {currentTab === 'savings' && (
        <SavingsPage savings={savings} onAddGoal={handleAddSavingsGoal} onDeposit={handleDepositSavings} />
      )}
      {currentTab === 'analytics' && <AnalyticsPage />}
      {currentTab === 'insights' && <InsightsPage insights={insights} />}
      {currentTab === 'settings' && <SettingsPage />}
    </AppLayout>
  );
}

export default App;
