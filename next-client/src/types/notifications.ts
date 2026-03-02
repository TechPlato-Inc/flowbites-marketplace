import type { Template } from "./templates";

export interface Notification {
  _id: string;
  userId: string;
  type:
    | "order_paid"
    | "order_refunded"
    | "order_expired"
    | "template_approved"
    | "template_rejected"
    | "review_received"
    | "review_moderated"
    | "creator_approved"
    | "creator_rejected"
    | "refund_approved"
    | "refund_rejected"
    | "service_order_update"
    | "withdrawal_approved"
    | "withdrawal_rejected"
    | "withdrawal_completed"
    | "ticket_reply"
    | "ticket_resolved"
    | "report_resolved"
    | "new_follower"
    | "payment_failed"
    | "system";
  title: string;
  message: string;
  link?: string;
  read: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface WishlistItem {
  _id: string;
  userId: string;
  templateId: Template;
  createdAt: string;
}
