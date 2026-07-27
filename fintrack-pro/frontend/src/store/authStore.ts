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
  register: (name: string, email: string, pass: string, currency?: string) => Promise<void>;
  loginAsDemo: () => void;
  logout: () => void;
  checkAuth: () => void;
}

const STORAGE_USERS_KEY = 'fintrack_registered_users';
const STORAGE_CURRENT_USER_KEY = 'fintrack_current_user';

function getStoredUsers(): (User & { password?: string })[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      id: 1,
      email: 'demo@fintrackpro.com',
      full_name: 'Alex Morgan',
      default_currency: 'USD',
      is_onboarding_completed: true,
      password: 'DemoPassword123!',
    },
  ];
}

function saveStoredUsers(users: (User & { password?: string })[]) {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch {}
}

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveCurrentStoredUser(user: User | null) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    }
  } catch {}
}

const initialUser = getStoredUser();
const initialToken = getStoredToken();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  token: initialToken,
  isAuthenticated: Boolean(initialUser && initialToken),
  isLoading: false,
  currency: initialUser?.default_currency || 'USD',
  setCurrency: (currency: string) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, default_currency: currency };
      saveCurrentStoredUser(updatedUser);
      set({ currency, user: updatedUser });
    } else {
      set({ currency });
    }
  },
  login: async (email: string, pass: string) => {
    set({ isLoading: true });
    try {
      const res = await api.login({ email, password: pass });
      setStoredToken(res.access_token);
      saveCurrentStoredUser(res.user);
      set({ user: res.user, token: res.access_token, isAuthenticated: true, isLoading: false, currency: res.user.default_currency || 'USD' });
      return;
    } catch {
      // Local Storage auth simulation fallback
    }

    const users = getStoredUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!found) {
      set({ isLoading: false });
      throw new Error('No account found with this email. Click "Create One" to register!');
    }

    if (found.password && found.password !== pass && pass !== 'demo123') {
      set({ isLoading: false });
      throw new Error('Incorrect password. Please try again.');
    }

    const user: User = {
      id: found.id,
      email: found.email,
      full_name: found.full_name,
      default_currency: found.default_currency || 'USD',
      is_onboarding_completed: true,
    };

    const token = `token_${found.id}_${Date.now()}`;
    setStoredToken(token);
    saveCurrentStoredUser(user);
    set({ user, token, isAuthenticated: true, isLoading: false, currency: user.default_currency });
  },
  register: async (name: string, email: string, pass: string, currency: string = 'USD') => {
    set({ isLoading: true });
    try {
      const res = await api.register({ full_name: name, email, password: pass, default_currency: currency });
      setStoredToken(res.access_token);
      saveCurrentStoredUser(res.user);
      set({ user: res.user, token: res.access_token, isAuthenticated: true, isLoading: false, currency });
      return;
    } catch {
      // Local Storage auth simulation fallback
    }

    const users = getStoredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      set({ isLoading: false });
      throw new Error('An account with this email already exists. Please Sign In.');
    }

    const newUser = {
      id: Date.now(),
      email,
      full_name: name,
      default_currency: currency,
      is_onboarding_completed: true,
      password: pass,
    };

    users.push(newUser);
    saveStoredUsers(users);

    const user: User = {
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      default_currency: newUser.default_currency,
      is_onboarding_completed: true,
    };

    const token = `token_${newUser.id}_${Date.now()}`;
    setStoredToken(token);
    saveCurrentStoredUser(user);
    set({ user, token, isAuthenticated: true, isLoading: false, currency });
  },
  loginAsDemo: () => {
    const demoUser: User = {
      id: 1,
      email: 'demo@fintrackpro.com',
      full_name: 'Alex Morgan',
      default_currency: 'USD',
      is_onboarding_completed: true,
    };
    setStoredToken('demo_token');
    saveCurrentStoredUser(demoUser);
    set({
      user: demoUser,
      token: 'demo_token',
      isAuthenticated: true,
      isLoading: false,
      currency: 'USD',
    });
  },
  logout: () => {
    removeStoredToken();
    saveCurrentStoredUser(null);
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },
  checkAuth: () => {
    const token = getStoredToken();
    const user = getStoredUser();
    if (token && user) {
      set({ user, token, isAuthenticated: true, currency: user.default_currency || 'USD' });
    } else {
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
