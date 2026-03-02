import type { User } from "./auth";

export interface CreatorProfile {
  _id: string;
  userId: string | User;
  displayName: string;
  username: string;
  bio?: string;
  avatar?: string;
  website?: string;
  twitter?: string;
  dribbble?: string;
  github?: string;
  portfolio?: string;
  coverImage?: string;
  isVerified: boolean;
  isFeatured: boolean;
  isOfficial?: boolean;
  onboarding?: {
    status: "pending" | "in_progress" | "submitted" | "approved" | "rejected";
    submittedAt?: string;
    reviewedAt?: string;
    rejectionReason?: string;
  };
  stats: {
    totalSales: number;
    totalRevenue: number;
    templateCount: number;
    averageRating: number;
    totalReviews: number;
    followers: number;
  };
}

export interface FollowerInfo {
  _id: string;
  followerId: string | User;
  creatorId: string | CreatorProfile;
  createdAt: string;
}

export interface EarningsSummary {
  totalEarnings: number;
  monthlyBreakdown: {
    month: string;
    earnings: number;
    orderCount: number;
  }[];
  topTemplates: {
    templateId: string;
    title: string;
    earnings: number;
    sales: number;
  }[];
}

export interface EarningsTransaction {
  _id: string;
  orderNumber: string;
  templateTitle: string;
  amount: number;
  platformFee: number;
  creatorPayout: number;
  status: string;
  createdAt: string;
}

export interface Withdrawal {
  _id: string;
  creatorId:
    | string
    | { _id: string; name: string; email: string; avatar?: string };
  amount: number;
  currency: string;
  status: "pending" | "approved" | "processing" | "completed" | "rejected";
  payoutMethod: "stripe_connect" | "bank_transfer" | "paypal";
  note?: string;
  adminNote?: string;
  processedBy?: { _id: string; name: string };
  processedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface WithdrawalBalance {
  totalEarnings: number;
  totalWithdrawn: number;
  availableBalance: number;
  pendingWithdrawals: number;
}
