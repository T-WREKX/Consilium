// apps/web/src/store/authStore.ts
import { create } from 'zustand';
import type { User } from '../types/index';

interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const STORAGE_KEY = 'consilium_token';
const USER_KEY = 'consilium_user';

function loadFromStorage(): Pick<AuthState, 'token' | 'user'> {
  try {
    const token = localStorage.getItem(STORAGE_KEY);
    const raw = localStorage.getItem(USER_KEY);
    const user = raw ? (JSON.parse(raw) as User) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...loadFromStorage(),
  login: (token, user) => {
    localStorage.setItem(STORAGE_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_KEY);
    set({ token: null, user: null });
  },
}));
