import type { Metadata } from "next";
import { NotificationList } from "@/modules/notifications/components/NotificationList";

export const metadata: Metadata = {
  title: "Notifications — Flowbites",
  description:
    "View and manage your notifications. Stay updated on orders, template approvals, reviews, and more.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Notifications — Flowbites",
    description:
      "View and manage your notifications. Stay updated on orders, template approvals, reviews, and more.",
  },
};

export default function NotificationsPage() {
  return <NotificationList />;
}
