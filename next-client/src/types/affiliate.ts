import type { User } from "./auth";

export interface Affiliate {
  _id: string;
  userId: string | User;
  referralCode: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  commissionRate: number;
  cookieDurationDays: number;
  website?: string;
  promotionMethod?: string;
  rejectionReason?: string;
  stats: {
    totalClicks: number;
    totalReferrals: number;
    totalEarnings: number;
    pendingEarnings: number;
    paidEarnings: number;
  };
  createdAt: string;
}

export interface ReferralConversion {
  _id: string;
  affiliateId: string;
  orderId: string;
  buyerId: { _id: string; name: string; avatar?: string };
  orderTotal: number;
  commissionRate: number;
  commissionAmount: number;
  status: "pending" | "approved" | "paid" | "refunded";
  paidAt?: string;
  createdAt: string;
}

export interface AffiliateDashboard {
  affiliate: Affiliate;
  monthly: {
    clicks: number;
    conversions: number;
    earnings: number;
    conversionRate: number;
  };
  recentConversions: ReferralConversion[];
}

export interface AffiliatePayout {
  _id: string;
  affiliateId: string | Affiliate;
  amount: number;
  status: "requested" | "approved" | "paid" | "rejected";
  paymentMethod: string;
  rejectionReason?: string;
  notes?: string;
  processedAt?: string;
  createdAt: string;
}
