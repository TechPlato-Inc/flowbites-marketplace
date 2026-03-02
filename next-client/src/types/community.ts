import type { User } from "./auth";
import type { Template } from "./templates";

export interface UIShot {
  _id: string;
  title: string;
  description?: string;
  image: string;
  creatorId: User;
  templateId?: Template;
  tags: string[];
  stats: {
    views: number;
    likes: number;
    saves: number;
  };
  createdAt: string;
}

export interface Review {
  _id: string;
  templateId: string;
  buyerId: { _id: string; name: string; avatar?: string };
  orderId: string;
  rating: number;
  title: string;
  comment: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummary {
  average: number;
  total: number;
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
}

export interface ContentReport {
  _id: string;
  reporterId: { _id: string; name: string; email: string; avatar?: string };
  targetType: "template" | "review" | "creator" | "user";
  targetId: string;
  reason:
    | "spam"
    | "inappropriate_content"
    | "copyright_violation"
    | "fake_review"
    | "misleading"
    | "offensive"
    | "scam"
    | "other";
  description: string;
  status: "pending" | "reviewing" | "resolved" | "dismissed";
  priority: "low" | "medium" | "high";
  adminNote?: string;
  resolvedBy?: { _id: string; name: string };
  resolvedAt?: string;
  actionTaken?:
    | "none"
    | "content_removed"
    | "user_warned"
    | "user_banned"
    | "other";
  createdAt: string;
}

export interface ReportStats {
  total: number;
  pending: number;
  byReason: Record<string, number>;
}
