import { api } from "@/lib/api/client";
import type {
  EarningsSummary,
  EarningsTransaction,
  Withdrawal,
  WithdrawalBalance,
} from "@/types";

// Earnings
export async function getEarningsSummary(): Promise<EarningsSummary> {
  const { data } = await api.get("/earnings/summary");
  return data.data;
}

export async function getEarningsTransactions(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const { data } = await api.get(`/earnings/transactions${query}`);
  return data.data as {
    transactions: EarningsTransaction[];
    pagination: { page: number; pages: number; total: number };
  };
}

// Withdrawals
export async function getWithdrawalBalance(): Promise<WithdrawalBalance> {
  const { data } = await api.get("/withdrawals/balance");
  return data.data;
}

export async function getMyWithdrawals(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const { data } = await api.get(`/withdrawals/my${query}`);
  return data.data as {
    withdrawals: Withdrawal[];
    pagination: { page: number; pages: number; total: number };
  };
}

export async function requestWithdrawal(payload: {
  amount: number;
  payoutMethod?: string;
  note?: string;
}): Promise<Withdrawal> {
  const { data } = await api.post("/withdrawals/request", payload);
  return data.data;
}

// Admin withdrawal management
export async function adminGetAllWithdrawals(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const { data } = await api.get(`/withdrawals/admin${query}`);
  return data.data;
}

export async function adminApproveWithdrawal(id: string): Promise<Withdrawal> {
  const { data } = await api.post(`/withdrawals/admin/${id}/approve`);
  return data.data;
}

export async function adminRejectWithdrawal(
  id: string,
  adminNote: string,
): Promise<Withdrawal> {
  const { data } = await api.post(`/withdrawals/admin/${id}/reject`, {
    adminNote,
  });
  return data.data;
}

export async function adminCompleteWithdrawal(
  id: string,
  stripeTransferId?: string,
): Promise<Withdrawal> {
  const { data } = await api.post(`/withdrawals/admin/${id}/complete`, {
    stripeTransferId,
  });
  return data.data;
}

// Onboarding
export async function getOnboardingStatus() {
  const { data } = await api.get("/creators/onboarding/status");
  return data.data;
}

export async function submitOnboarding(): Promise<void> {
  await api.post("/creators/onboarding/submit");
}

// Stripe Connect
export async function connectStripe() {
  const { data } = await api.post("/creators/connect/onboard");
  return data.data;
}

export async function getConnectStatus() {
  const { data } = await api.get("/creators/connect/status");
  return data.data;
}
