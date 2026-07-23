import { create } from 'zustand';
import { User } from '../types';
import { getStoredToken, setStoredToken, removeStoredToken, api } from '../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currency: string;
  setCurrency: (currency: string) => void;
  login: (email: string, pass: string) => Promise<void>;
  loginAsDemo: () => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: 1,
    email: 'demo@fintrackpro.com',
    full_name: 'Alex Morgan',
    default_currency: 'USD',
    is_onboarding_completed: true,
  },
  token: getStoredToken() || 'demo_token',
  isAuthenticated: true,
  isLoading: false,
  currency: 'USD',
  setCurrency: (currency: string) => set({ currency }),
  login: async (email: string, pass: string) => {
    set({ isLoading: true });
    try {
      const res = await api.login({ email, password: pass });
      setStoredToken(res.access_token);
      set({ user: res.user, token: res.access_token, isAuthenticated: true, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },
  loginAsDemo: () => {
    setStoredToken('demo_token');
    set({
      user: {
        id: 1,
        email: 'demo@fintrackpro.com',
        full_name: 'Alex Morgan',
        default_currency: 'USD',
        is_onboarding_completed: true,
      },
      token: 'demo_token',
      isAuthenticated: true,
      isLoading: false,
    });
  },
  logout: () => {
    removeStoredToken();
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },
  checkAuth: async () => {
    const token = getStoredToken();
    if (!token) {
      // Stay in demo mode for instant app exploration
      return;
    }
    try {
      const user = await api.getMe();
      set({ user, token, isAuthenticated: true });
    } catch {
      // demo fallback
    }
  },
}));
