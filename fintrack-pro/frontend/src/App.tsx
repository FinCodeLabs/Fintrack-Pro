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
  { id: 1, name: 'Salary', icon: 'salary', color: '#10B981', type: 'income', is_system: true, sort_order: 1 },
  { id: 2, name: 'Freelance', icon: 'freelance', color: '#3B82F6', type: 'income', is_system: true, sort_order: 2 },
  { id: 99, name: 'Other', icon: 'other', color: '#8B5CF6', type: 'income', is_system: true, sort_order: 3 },
  { id: 3, name: 'Housing & Rent', icon: 'housing', color: '#EF4444', type: 'expense', is_system: true, sort_order: 4 },
  { id: 4, name: 'Groceries & Food', icon: 'groceries', color: '#F59E0B', type: 'expense', is_system: true, sort_order: 5 },
  { id: 5, name: 'Dining & Cafes', icon: 'dining', color: '#EC4899', type: 'expense', is_system: true, sort_order: 6 },
  { id: 6, name: 'Transportation', icon: 'transportation', color: '#06B6D4', type: 'expense', is_system: true, sort_order: 7 },
  { id: 7, name: 'Utilities & Bills', icon: 'utilities', color: '#6366F1', type: 'expense', is_system: true, sort_order: 8 },
  { id: 8, name: 'Shopping', icon: 'shopping', color: '#84CC16', type: 'expense', is_system: true, sort_order: 9 },
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
    category_icon: 'salary',
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
    category_icon: 'freelance',
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
    category_icon: 'housing',
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
    category_icon: 'groceries',
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
    category_icon: 'dining',
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
    category_icon: 'groceries',
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
    category_icon: 'dining',
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
    category_icon: 'transportation',
    category_color: '#06B6D4',
  },
  {
    id: 4,
    user_id: 1,
    category_id: 8,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    limit_cents: 49000,
    spent_cents: 0,
    remaining_cents: 49000,
    usage_percentage: 0,
    is_exceeded: false,
    alert_threshold: 80,
    category_name: 'Shopping',
    category_icon: 'shopping',
    category_color: '#84CC16',
  },
];

const INITIAL_SAVINGS: SavingsGoal[] = [
  {
    id: 1,
    user_id: 1,
    name: 'Emergency Fund',
    description: '6 months buffer',
    icon: 'emergency',
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
    icon: 'travel',
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
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentTab, setTab] = useState<string>('dashboard');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);

  const userId = user?.id || 1;
  const isDemo = userId === 1;

  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  const sanitizeTransactions = (txList: Transaction[]): Transaction[] => {
    return txList.map((t) => {
      const descLower = (t.description || '').toLowerCase();
      const isInfosysOrSalary = descLower.includes('infosys') || descLower.includes('salary') || descLower.includes('paycheck');
      if (isInfosysOrSalary || (t.type === 'income' && (t.category_name === 'Dining & Cafes' || t.category_id === 5))) {
        return {
          ...t,
          category_id: 1,
          category_name: 'Salary',
          category_icon: 'salary',
          category_color: '#10B981',
          type: 'income',
        };
      }
      return t;
    });
  };

  const sanitizeBudgets = (bgtList: Budget[]): Budget[] => {
    return bgtList.filter((b) => {
      const cName = (b.category_name || '').toLowerCase();
      return b.category_id !== 1 && b.category_id !== 2 && cName !== 'salary' && cName !== 'freelance' && cName !== 'investments';
    });
  };

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(`fintrack_transactions_${userId}`);
      if (saved) return sanitizeTransactions(JSON.parse(saved));
    } catch {}
    return isDemo ? INITIAL_TRANSACTIONS : [];
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const saved = localStorage.getItem(`fintrack_budgets_${userId}`);
      if (saved) return sanitizeBudgets(JSON.parse(saved));
    } catch {}
    return isDemo ? INITIAL_BUDGETS : [];
  });

  const [savings, setSavings] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem(`fintrack_savings_${userId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return isDemo ? INITIAL_SAVINGS : [];
  });

  const [insights, setInsights] = useState<FinancialInsight[]>(() => {
    try {
      const saved = localStorage.getItem(`fintrack_insights_${userId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return isDemo ? INITIAL_INSIGHTS : [];
  });

  useEffect(() => {
    checkAuth();
    // Auto migration check to purge stale cache and sync dynamic budgets
    const CURRENT_VERSION = 'v5_expense_budgets_only';
    const savedVer = localStorage.getItem('fintrack_app_version');
    if (savedVer !== CURRENT_VERSION) {
      localStorage.removeItem('fintrack_transactions_1');
      localStorage.removeItem('fintrack_budgets_1');
      localStorage.removeItem('fintrack_savings_1');
      localStorage.removeItem('fintrack_insights_1');
      localStorage.setItem('fintrack_app_version', CURRENT_VERSION);
      setTransactions(INITIAL_TRANSACTIONS);
      setBudgets(INITIAL_BUDGETS);
      setSavings(INITIAL_SAVINGS);
      setInsights(INITIAL_INSIGHTS);
    }
  }, []);

  // Sync state when active user changes
  useEffect(() => {
    if (user) {
      try {
        const isUserDemo = user.id === 1;
        const txs = localStorage.getItem(`fintrack_transactions_${user.id}`);
        setTransactions(txs ? sanitizeTransactions(JSON.parse(txs)) : isUserDemo ? INITIAL_TRANSACTIONS : []);

        const bgt = localStorage.getItem(`fintrack_budgets_${user.id}`);
        setBudgets(bgt ? sanitizeBudgets(JSON.parse(bgt)) : isUserDemo ? INITIAL_BUDGETS : []);

        const svg = localStorage.getItem(`fintrack_savings_${user.id}`);
        setSavings(svg ? JSON.parse(svg) : isUserDemo ? INITIAL_SAVINGS : []);

        const ins = localStorage.getItem(`fintrack_insights_${user.id}`);
        setInsights(ins ? JSON.parse(ins) : isUserDemo ? INITIAL_INSIGHTS : []);
      } catch {}
    }
  }, [user?.id]);

  // Persist transactions
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(`fintrack_transactions_${user.id}`, JSON.stringify(transactions));
      } catch {}
    }
  }, [transactions, user?.id]);

  // Persist budgets
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(`fintrack_budgets_${user.id}`, JSON.stringify(budgets));
      } catch {}
    }
  }, [budgets, user?.id]);

  // Persist savings
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(`fintrack_savings_${user.id}`, JSON.stringify(savings));
      } catch {}
    }
  }, [savings, user?.id]);

  const handleAddTransaction = (newTx: Partial<Transaction>) => {
    const tx: Transaction = {
      id: Date.now(),
      user_id: userId,
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

    api.createTransaction(tx).catch(() => {});
  };

  const handleDeleteTransaction = (id: number) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    api.deleteTransaction(id).catch(() => {});
  };

  const handleAddBudget = (b: Partial<Budget>) => {
    const budget: Budget = {
      id: Date.now(),
      user_id: userId,
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

  const handleDeleteBudget = (id: number) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    api.deleteBudget(id).catch(() => {});
  };

  const handleAddSavingsGoal = (g: Partial<SavingsGoal>) => {
    const goal: SavingsGoal = {
      id: Date.now(),
      user_id: userId,
      name: g.name || 'New Goal',
      icon: g.icon || 'target',
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
      transactions={transactions}
      onAddTransaction={handleAddTransaction}
      isQuickAddOpen={isQuickAddOpen}
      setIsQuickAddOpen={setIsQuickAddOpen}
    >
      {currentTab === 'dashboard' && (
        <DashboardPage
          transactions={transactions}
          budgets={budgets}
          savings={savings}
          onNavigate={setTab}
          onNewTransaction={() => setIsQuickAddOpen(true)}
        />
      )}
      {currentTab === 'transactions' && (
        <TransactionsPage
          transactions={transactions}
          onNewTransaction={() => setIsQuickAddOpen(true)}
          onDeleteTransaction={handleDeleteTransaction}
        />
      )}
      {currentTab === 'budgets' && (
        <BudgetsPage
          budgets={budgets}
          transactions={transactions}
          categories={categories}
          onAddBudget={handleAddBudget}
          onDeleteBudget={handleDeleteBudget}
        />
      )}
      {currentTab === 'savings' && (
        <SavingsPage savings={savings} onAddGoal={handleAddSavingsGoal} onDeposit={handleDepositSavings} />
      )}
      {currentTab === 'analytics' && <AnalyticsPage />}
      {currentTab === 'insights' && (
        <InsightsPage
          insights={insights}
          transactions={transactions}
          budgets={budgets}
          savings={savings}
          onNewTransaction={() => setIsQuickAddOpen(true)}
        />
      )}
      {currentTab === 'settings' && <SettingsPage />}
    </AppLayout>
  );
}

export default App;
