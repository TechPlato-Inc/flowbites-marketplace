"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useSocketStore } from "@/stores/socketStore";

/**
 * Connects / disconnects the WebSocket based on auth state.
 * Mount this inside AuthProvider so `user` is available.
 */
export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { connect, disconnect } = useSocketStore();

  useEffect(() => {
    if (isLoading) return; // Wait for auth to resolve

    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, isLoading, connect, disconnect]);

  return <>{children}</>;
}
