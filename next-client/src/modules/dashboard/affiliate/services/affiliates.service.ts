import { api } from "@/lib/api/client";
import type {
  Affiliate,
  AffiliateDashboard,
  ReferralConversion,
  AffiliatePayout,
} from "@/types";

// Affiliate Dashboard
export async function getAffiliateDashboard(): Promise<AffiliateDashboard> {
  const { data } = await api.get("/affiliates/dashboard");
  return data.data;
}

// Get current affiliate info
export async function getMyAffiliate(): Promise<Affiliate | null> {
  const { data } = await api.get("/affiliates/me");
  return data.data;
}

// Apply to become an affiliate
export async function applyForAffiliate(payload: {
  website?: string;
  promotionMethod?: string;
}): Promise<Affiliate> {
  const { data } = await api.post("/affiliates/apply", payload);
  return data.data;
}

// Get referral conversions
export async function getReferralConversions(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const { data } = await api.get(`/affiliates/conversions${query}`);
  return data.data as {
    conversions: ReferralConversion[];
    pagination: { page: number; pages: number; total: number };
  };
}

// Get referral history with filters
export async function getReferralHistory(filters?: {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);
  if (filters?.page) params.append("page", String(filters.page));
  if (filters?.limit) params.append("limit", String(filters.limit));

  const query = params.toString() ? `?${params.toString()}` : "";
  const { data } = await api.get(`/affiliates/referrals${query}`);
  return data.data as {
    referrals: ReferralConversion[];
    pagination: { page: number; pages: number; total: number };
    summary: {
      totalEarnings: number;
      pendingEarnings: number;
      paidEarnings: number;
      totalReferrals: number;
    };
  };
}

// Generate referral link
export async function generateReferralLink(payload?: {
  campaign?: string;
  source?: string;
}): Promise<{ referralCode: string; referralLink: string }> {
  const { data } = await api.post("/affiliates/generate-link", payload || {});
  return data.data;
}

// Get affiliate payouts
export async function getAffiliatePayouts(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const { data } = await api.get(`/affiliates/payouts${query}`);
  return data.data as {
    payouts: AffiliatePayout[];
    pagination: { page: number; pages: number; total: number };
  };
}

// Request payout
export async function requestPayout(payload: {
  amount: number;
  paymentMethod: string;
  notes?: string;
}): Promise<AffiliatePayout> {
  const { data } = await api.post("/affiliates/payouts/request", payload);
  return data.data;
}

// Get available payout methods
export async function getPayoutMethods(): Promise<
  { id: string; name: string; description: string; minAmount: number }[]
> {
  const { data } = await api.get("/affiliates/payout-methods");
  return data.data;
}

// Get affiliate stats
export async function getAffiliateStats(params?: {
  startDate?: string;
  endDate?: string;
  period?: "daily" | "weekly" | "monthly";
}) {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);
  if (params?.period) queryParams.append("period", params.period);

  const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
  const { data } = await api.get(`/affiliates/stats${query}`);
  return data.data as {
    clicks: { date: string; count: number }[];
    conversions: { date: string; count: number; earnings: number }[];
    summary: {
      totalClicks: number;
      totalConversions: number;
      totalEarnings: number;
      conversionRate: number;
    };
  };
}

// Track referral click (for frontend tracking)
export async function trackReferralClick(referralCode: string): Promise<void> {
  await api.post("/affiliates/track-click", { referralCode });
}
