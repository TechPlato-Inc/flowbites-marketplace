"use client";

import { create } from "zustand";
import { api } from "@/lib/api/client";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role: "buyer" | "creator",
  ) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    // Server sets httpOnly cookies cross-origin; set marker cookies on this domain for middleware
    document.cookie = `accessToken=1; path=/; max-age=900; secure; samesite=lax`;
    document.cookie = `userRole=${data.data.user.role}; path=/; max-age=900; secure; samesite=lax`;
    set({ user: data.data.user, isAuthenticated: true });
  },

  register: async (email, password, name, role) => {
    const { data } = await api.post("/auth/register", {
      email,
      password,
      name,
      role,
    });
    // Server sets httpOnly cookies cross-origin; set marker cookies on this domain for middleware
    document.cookie = `accessToken=1; path=/; max-age=900; secure; samesite=lax`;
    document.cookie = `userRole=${data.data.user.role}; path=/; max-age=900; secure; samesite=lax`;
    set({ user: data.data.user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Logout endpoint clears cookies; if it fails, clear-session will handle it
    }
    try {
      await api.post("/auth/clear-session");
    } catch (e) {
      // ignore
    }
    // Clear marker cookies on this domain
    document.cookie =
      "accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie =
      "userRole=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    try {
      // httpOnly accessToken cookie is sent automatically via withCredentials
      const { data } = await api.get("/auth/me");
      // Refresh marker cookies on this domain
      document.cookie = `accessToken=1; path=/; max-age=900; secure; samesite=lax`;
      document.cookie = `userRole=${data.data.user.role}; path=/; max-age=900; secure; samesite=lax`;
      set({ user: data.data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      // No valid session — clear stale marker cookies
      document.cookie =
        "accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;";
      document.cookie =
        "userRole=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;";
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
