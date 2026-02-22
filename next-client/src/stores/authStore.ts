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
    // Server sets httpOnly cookies (accessToken + refreshToken) automatically
    set({ user: data.data.user, isAuthenticated: true });
  },

  register: async (email, password, name, role) => {
    const { data } = await api.post("/auth/register", {
      email,
      password,
      name,
      role,
    });
    // Server sets httpOnly cookies automatically
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
    // Clear the non-httpOnly userRole cookie (JS can clear this one)
    document.cookie =
      "userRole=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    try {
      // httpOnly accessToken cookie is sent automatically via withCredentials
      const { data } = await api.get("/auth/me");
      set({ user: data.data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      // No valid session — clear stale non-httpOnly cookies
      document.cookie =
        "userRole=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;";
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
