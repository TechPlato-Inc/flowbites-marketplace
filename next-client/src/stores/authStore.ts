'use client';

import { create } from 'zustand';
import { api } from '@/lib/api/client';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: 'buyer' | 'creator') => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.data.accessToken);
    set({ user: data.data.user, isAuthenticated: true });
  },

  register: async (email, password, name, role) => {
    const { data } = await api.post('/auth/register', { email, password, name, role });
    localStorage.setItem('accessToken', data.data.accessToken);
    set({ user: data.data.user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('accessToken');
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      const { data } = await api.get('/auth/me');
      set({ user: data.data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
