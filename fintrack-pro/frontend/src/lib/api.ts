import { Category, Transaction, Budget, SavingsGoal, FinancialInsight, NotificationItem, DashboardSummary, User } from '../types';

const API_BASE = '/api/v1';

// Token handling helper
export function getStoredToken(): string | null {
  return localStorage.getItem('fintrack_token');
}

export function setStoredToken(token: string) {
  localStorage.setItem('fintrack_token', token);
}

export function removeStoredToken() {
  localStorage.removeItem('fintrack_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `API Error: ${res.status}`);
    }

    const json = await res.json();
    return json.data as T;
  } catch (error) {
    console.warn(`Fetch error for ${endpoint}, returning fallback data if available:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  login: (data: any) => request<{ access_token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => request<{ access_token: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<User>('/auth/me'),

  // Dashboard
  getDashboardSummary: () => request<DashboardSummary>('/dashboard/summary'),

  // Transactions
  getTransactions: (params?: { page?: number; size?: number; type?: string; category_id?: number; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<Transaction[]>(`/transactions${query ? `?${query}` : ''}`);
  },
  createTransaction: (data: Partial<Transaction>) => request<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  deleteTransaction: (id: number) => request<any>(`/transactions/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request<Category[]>('/categories'),
  createCategory: (data: Partial<Category>) => request<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),

  // Budgets
  getBudgets: (month?: number, year?: number) => {
    const q = new URLSearchParams({ month: String(month || new Date().getMonth() + 1), year: String(year || new Date().getFullYear()) }).toString();
    return request<Budget[]>(`/budgets?${q}`);
  },
  createBudget: (data: Partial<Budget>) => request<Budget>('/budgets', { method: 'POST', body: JSON.stringify(data) }),

  // Savings Goals
  getSavingsGoals: () => request<SavingsGoal[]>('/savings'),
  createSavingsGoal: (data: Partial<SavingsGoal>) => request<SavingsGoal>('/savings', { method: 'POST', body: JSON.stringify(data) }),
  depositSavings: (id: number, amount_cents: number) => request<SavingsGoal>(`/savings/${id}/deposit`, { method: 'POST', body: JSON.stringify({ amount_cents }) }),

  // Insights
  getInsights: () => request<FinancialInsight[]>('/insights'),

  // Notifications
  getNotifications: () => request<NotificationItem[]>('/notifications'),
};
