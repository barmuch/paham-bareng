'use client';

import { create } from 'zustand';
import { authAPI } from './api';

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isPremium: boolean;
  avatar: string;
  bio?: string;
  skills?: string[];
}

type LoginRegisterResponse = {
  success?: boolean;
  data?: {
    user?: any;
    token?: string;
  };
  user?: any;
  token?: string;
};

function unwrapAuthPayload(resData: LoginRegisterResponse) {
  const token = resData?.data?.token ?? resData?.token ?? null;
  const user = resData?.data?.user ?? resData?.user ?? null;
  return { token, user };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isLoading: true,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,

  login: async (email: string, password: string) => {
    const { data: resData } = await authAPI.login({ email, password });
    const { token, user } = unwrapAuthPayload(resData);

    if (!token || !user) {
      throw new Error('Invalid login response');
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  register: async (name: string, email: string, password: string) => {
    const { data: resData } = await authAPI.register({ name, email, password });
    const { token, user } = unwrapAuthPayload(resData);

    if (!token || !user) {
      throw new Error('Invalid register response');
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  loadUser: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      // First hydrate quickly from localStorage (better UX while awaiting network)
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        try {
          set({
            user: JSON.parse(cachedUser),
            token,
            isAuthenticated: true,
          });
        } catch {
          // ignore JSON parse errors
        }
      }

      const { data: resData } = await authAPI.getMe();
      const user = resData?.data?.user ?? resData?.user;
      if (!user) {
        throw new Error('Invalid me response');
      }
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user: User) => set({ user }),
}));
