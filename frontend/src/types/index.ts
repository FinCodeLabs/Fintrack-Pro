export type TransactionType = 'income' | 'expense';

export interface User {
  id: number;
  email: string;
  full_name: string;
  avatar_url?: string;
  default_currency: string;
  is_onboarding_completed: boolean;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  is_system: boolean;
  sort_order: number;
}

export interface Transaction {
  id: number;
  user_id: number;
  category_id?: number;
  amount_cents: number;
  type: TransactionType;
  description?: string;
  note?: string;
  receipt_url?: string;
  transaction_date: string;
  is_recurring: boolean;
  recurring_interval: string;
  location?: string;
  created_at: string;
  updated_at: string;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
}

export interface Budget {
  id: number;
  user_id: number;
  category_id: number;
  month: number;
  year: number;
  limit_cents: number;
  spent_cents: number;
  remaining_cents: number;
  usage_percentage: number;
  is_exceeded: boolean;
  alert_threshold: number;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
}

export interface SavingsGoal {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  icon: string;
  target_cents: number;
  current_cents: number;
  remaining_cents: number;
  progress_percentage: number;
  deadline?: string;
  status: string;
  monthly_contribution_cents?: number;
  auto_save: boolean;
}

export interface FinancialInsight {
  id: number;
  user_id: number;
  category: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  is_read: boolean;
  generated_at: string;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardSummary {
  total_balance_cents: number;
  total_income_cents: number;
  total_expense_cents: number;
  net_savings_cents: number;
  savings_rate: number;
  recent_transactions: Transaction[];
  top_spending_categories: {
    category_id: number;
    name: string;
    icon: string;
    color: string;
    total_cents: number;
    percentage: number;
  }[];
  monthly_cash_flow: {
    period: string;
    income_cents: number;
    expense_cents: number;
    net_cents: number;
  }[];
  active_budgets: Budget[];
  savings_goals: SavingsGoal[];
}
