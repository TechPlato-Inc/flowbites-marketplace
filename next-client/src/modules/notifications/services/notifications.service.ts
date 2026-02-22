import { api } from "@/lib/api/client";
import type { Notification } from "@/types";

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    pages: number;
    total: number;
  };
}

export async function getNotifications(
  page: number = 1,
  limit: number = 10,
): Promise<NotificationsResponse> {
  const { data } = await api.get("/notifications", { params: { page, limit } });
  return data.data;
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await api.get("/notifications/unread-count");
  return data.data.unreadCount;
}

export async function markAsRead(
  notificationId: string,
): Promise<Notification> {
  const { data } = await api.patch(`/notifications/${notificationId}/read`);
  return data.data;
}

export async function markAllAsRead(): Promise<number> {
  const { data } = await api.patch("/notifications/read-all");
  return data.data.marked;
}

export async function deleteNotification(
  notificationId: string,
): Promise<void> {
  await api.delete(`/notifications/${notificationId}`);
}
