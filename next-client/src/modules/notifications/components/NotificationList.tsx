"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Star,
  DollarSign,
  Briefcase,
  Trash2,
  Check,
  AlertCircle,
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
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../services/notifications.service";
import type { Notification } from "@/types";
import { formatDate, formatRelativeDate } from "@/lib/utils/format";
import { Button } from "@/design-system";

const typeIcons: Record<
  string,
  { icon: React.ElementType; color: string; bg: string }
> = {
  order_paid: { icon: ShoppingBag, color: "text-green-500", bg: "bg-green-50" },
  order_refunded: {
    icon: DollarSign,
    color: "text-green-500",
    bg: "bg-green-50",
  },
  template_approved: {
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-50",
  },
  template_rejected: { icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
  review_received: { icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
  review_moderated: { icon: Star, color: "text-blue-500", bg: "bg-blue-50" },
  creator_approved: {
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-50",
  },
  creator_rejected: { icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
  refund_approved: {
    icon: DollarSign,
    color: "text-green-500",
    bg: "bg-green-50",
  },
  refund_rejected: { icon: DollarSign, color: "text-red-500", bg: "bg-red-50" },
  service_order_update: {
    icon: Briefcase,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  withdrawal_approved: {
    icon: Wallet,
    color: "text-green-500",
    bg: "bg-green-50",
  },
  withdrawal_rejected: { icon: Wallet, color: "text-red-500", bg: "bg-red-50" },
  withdrawal_completed: {
    icon: CircleDollarSign,
    color: "text-green-500",
    bg: "bg-green-50",
  },
  ticket_reply: {
    icon: MessageCircle,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  ticket_resolved: {
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-50",
  },
  report_resolved: { icon: Flag, color: "text-green-500", bg: "bg-green-50" },
  new_follower: {
    icon: UserPlus,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  order_expired: { icon: Clock, color: "text-orange-500", bg: "bg-orange-50" },
  payment_failed: {
    icon: AlertTriangle,
    color: "text-red-500",
    bg: "bg-red-50",
  },
  system: { icon: Bell, color: "text-neutral-500", bg: "bg-neutral-100" },
};

type FilterTab = "all" | "unread";

export function NotificationList() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async (
    pageNum: number = 1,
    append: boolean = false,
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotifications(pageNum, 20);

      if (append) {
        setNotifications((prev) => [...prev, ...data.notifications]);
      } else {
        setNotifications(data.notifications);
      }

      setUnreadCount(data.unreadCount);
      setHasMore(pageNum < data.pagination.pages);
    } catch (err: any) {
      console.error("Failed to fetch notifications:", err);
      setError(err?.response?.data?.error || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1, false);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, true);
  };

  const handleMarkAsRead = async (
    e: React.MouseEvent,
    notification: Notification,
  ) => {
    e.stopPropagation();
    if (notification.read) return;

    try {
      await markAsRead(notification._id);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notification._id ? { ...n, read: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
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
  };

  const getIconConfig = (type: string) => {
    return typeIcons[type] || typeIcons.system;
  };

  const filteredNotifications =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-900">
            Notifications
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Check size={16} />}
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg w-fit mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            filter === "all"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            filter === "unread"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {/* Skeleton Loading State */}
        {loading && notifications.length === 0 && (
          <>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-neutral-200 rounded-xl p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-neutral-200 animate-pulse shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="h-5 w-48 bg-neutral-200 rounded animate-pulse" />
                      <div className="h-3 w-16 bg-neutral-200 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-full bg-neutral-200 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-neutral-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Error State */}
        {error && notifications.length === 0 && (
          <div className="bg-error-light border border-error/20 rounded-xl p-12 text-center">
            <AlertCircle size={48} className="text-error mx-auto mb-4" />
            <h3 className="font-medium text-neutral-900 mb-1">
              Failed to load notifications
            </h3>
            <p className="text-sm text-neutral-500 mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={() => fetchNotifications(1, false)}
            >
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && filteredNotifications.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
            <Bell size={48} className="text-neutral-300 mx-auto mb-4" />
            <h3 className="font-medium text-neutral-900 mb-1">
              {filter === "unread"
                ? "No unread notifications"
                : "No notifications yet"}
            </h3>
            <p className="text-sm text-neutral-500">
              {filter === "unread"
                ? "All caught up!"
                : "We'll notify you when something important happens."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const { icon: Icon, color, bg } = getIconConfig(notification.type);
            return (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`group bg-white border border-neutral-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer ${
                  !notification.read ? "border-l-4 border-l-primary-500" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}
                  >
                    <Icon className={color} size={20} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4
                          className={`font-semibold text-neutral-900 ${!notification.read ? "text-neutral-900" : ""}`}
                        >
                          {notification.title}
                        </h4>
                        <p className="text-sm text-neutral-600 mt-0.5">
                          {notification.message}
                        </p>
                      </div>
                      <span className="text-xs text-neutral-400 whitespace-nowrap">
                        {formatRelativeDate(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-2">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.read && (
                      <button
                        onClick={(e) => handleMarkAsRead(e, notification)}
                        className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(e, notification._id)}
                      className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Unread dot */}
                  {!notification.read && (
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 shrink-0" />
                  )}
                </div>
              </div>
            );
          })
        )}

        {loading && (
          <div className="text-center py-4">
            <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && filter === "all" && (
          <div className="text-center pt-4">
            <Button variant="outline" onClick={handleLoadMore}>
              Load more
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
