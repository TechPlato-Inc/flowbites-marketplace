"use client";

import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import type { Notification } from "@/types";

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  /** Unread count kept in sync via WebSocket events */
  unreadCount: number;
  /** Latest notification received in real-time (for toast display) */
  latestNotification: Notification | null;

  connect: () => void;
  disconnect: () => void;
  setUnreadCount: (count: number) => void;
  decrementUnreadCount: () => void;
  clearLatestNotification: () => void;
}

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
  "";

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  unreadCount: 0,
  latestNotification: null,

  connect: () => {
    // Don't create duplicate connections
    if (get().socket) return;

    const socket = io(SOCKET_URL, {
      withCredentials: true, // Sends httpOnly cookies for auth
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 30000,
    });

    socket.on("connect", () => {
      set({ isConnected: true });
    });

    socket.on("disconnect", () => {
      set({ isConnected: false });
    });

    // Real-time notification received
    socket.on("notification:new", (notification: Notification) => {
      set((state) => ({
        unreadCount: state.unreadCount + 1,
        latestNotification: notification,
      }));
    });

    // Synced across tabs: single notification marked as read
    socket.on("notification:marked_read", () => {
      set((state) => ({
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    });

    // Synced across tabs: all notifications marked as read
    socket.on("notification:all_marked_read", () => {
      set({ unreadCount: 0 });
    });

    // Synced across tabs: notification deleted (might have been unread)
    socket.on("notification:deleted", () => {
      // We conservatively leave unreadCount as-is since we don't know
      // if the deleted notification was unread. The next poll or fetch
      // will correct it.
    });

    socket.on("connect_error", (err) => {
      console.warn("WebSocket connection error:", err.message);
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  setUnreadCount: (count: number) => set({ unreadCount: count }),

  decrementUnreadCount: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),

  clearLatestNotification: () => set({ latestNotification: null }),
}));
