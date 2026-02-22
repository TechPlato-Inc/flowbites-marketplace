"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Star,
  DollarSign,
  Briefcase,
  Check,
  Wallet,
  CircleDollarSign,
  MessageCircle,
  CheckCircle2,
  Flag,
  UserPlus,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from "../services/notifications.service";
import type { Notification } from "@/types";
import { formatRelativeDate } from "@/lib/utils/format";
import { showToast } from "@/design-system/Toast";
import Link from "next/link";

const typeIcons: Record<string, { icon: React.ElementType; color: string }> = {
  order_paid: { icon: ShoppingBag, color: "text-green-500" },
  order_refunded: { icon: DollarSign, color: "text-green-500" },
  template_approved: { icon: CheckCircle, color: "text-green-500" },
  template_rejected: { icon: XCircle, color: "text-red-500" },
  review_received: { icon: Star, color: "text-amber-500" },
  review_moderated: { icon: Star, color: "text-blue-500" },
  creator_approved: { icon: CheckCircle, color: "text-green-500" },
  creator_rejected: { icon: XCircle, color: "text-red-500" },
  refund_approved: { icon: DollarSign, color: "text-green-500" },
  refund_rejected: { icon: DollarSign, color: "text-red-500" },
  service_order_update: { icon: Briefcase, color: "text-blue-500" },
  withdrawal_approved: { icon: Wallet, color: "text-green-500" },
  withdrawal_rejected: { icon: Wallet, color: "text-red-500" },
  withdrawal_completed: { icon: CircleDollarSign, color: "text-green-500" },
  ticket_reply: { icon: MessageCircle, color: "text-blue-500" },
  ticket_resolved: { icon: CheckCircle2, color: "text-green-500" },
  report_resolved: { icon: Flag, color: "text-green-500" },
  new_follower: { icon: UserPlus, color: "text-purple-500" },
  order_expired: { icon: Clock, color: "text-orange-500" },
  payment_failed: { icon: AlertTriangle, color: "text-red-500" },
  system: { icon: Bell, color: "text-neutral-500" },
};

export function NotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bellButtonRef = useRef<HTMLButtonElement>(null);
  const notificationRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Fetch unread count every 30 seconds
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          bellButtonRef.current?.focus();
          break;
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) => {
            const next = prev < notifications.length - 1 ? prev + 1 : prev;
            notificationRefs.current[next]?.focus();
            return next;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => {
            if (prev > 0) {
              const next = prev - 1;
              notificationRefs.current[next]?.focus();
              return next;
            }
            return prev;
          });
          break;
        case "Home":
          e.preventDefault();
          setHighlightedIndex(0);
          notificationRefs.current[0]?.focus();
          break;
        case "End":
          e.preventDefault();
          const lastIndex = notifications.length - 1;
          setHighlightedIndex(lastIndex);
          notificationRefs.current[lastIndex]?.focus();
          break;
      }
    },
    [isOpen, notifications.length],
  );

  // Handle document keydown for Escape when dropdown is open
  useEffect(() => {
    if (!isOpen) return;

    const handleDocumentKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        bellButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleDocumentKeyDown);
    return () => document.removeEventListener("keydown", handleDocumentKeyDown);
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications(1, 10);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      showToast("All notifications marked as read", "success");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleNotificationClick = async (
    notification: Notification,
    index: number,
  ) => {
    const wasRead = notification.read;

    // Optimistic update - mark as read immediately
    if (!wasRead) {
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notification._id ? { ...n, read: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    if (notification.link) {
      router.push(notification.link);
    }
    setIsOpen(false);

    // API call in background
    if (!wasRead) {
      try {
        await markAsRead(notification._id);
      } catch (error) {
        // Revert on failure
        console.error("Failed to mark as read:", error);
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, read: false } : n,
          ),
        );
        setUnreadCount((prev) => prev + 1);
        showToast("Failed to mark notification as read", "error");
      }
    }
  };

  const getIconConfig = (type: string) => {
    return typeIcons[type] || typeIcons.system;
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Button */}
      <button
        ref={bellButtonRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden z-50"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="notification-bell"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
            <h3 className="font-semibold text-neutral-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                <Check size={12} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={48} className="text-neutral-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-neutral-700 mb-1">
                  No notifications
                </h3>
                <p className="text-sm text-neutral-500">
                  Check back later for updates
                </p>
              </div>
            ) : (
              notifications.map((notification, index) => {
                const { icon: Icon, color } = getIconConfig(notification.type);
                return (
                  <button
                    key={notification._id}
                    ref={(el) => {
                      notificationRefs.current[index] = el;
                    }}
                    onClick={() => handleNotificationClick(notification, index)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleNotificationClick(notification, index);
                      }
                    }}
                    role="menuitem"
                    tabIndex={index === highlightedIndex ? 0 : -1}
                    className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-left ${
                      !notification.read ? "bg-primary-50/50" : ""
                    } ${index === highlightedIndex ? "ring-2 ring-primary-500 ring-inset" : ""}`}
                  >
                    <div className={`mt-0.5 ${color}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-neutral-600 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-neutral-400 mt-1">
                        {formatRelativeDate(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <span
                        className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 shrink-0"
                        aria-label="Unread"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-100 px-4 py-2">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium py-1"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
