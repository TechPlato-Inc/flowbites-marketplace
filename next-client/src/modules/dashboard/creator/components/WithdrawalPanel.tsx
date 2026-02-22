"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { Button, Badge } from "@/design-system";
import {
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { WithdrawalRequestModal } from "./WithdrawalRequestModal";

interface Withdrawal {
  _id: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "completed";
  payoutMethod: "stripe_connect" | "bank_transfer";
  note?: string;
  adminNote?: string;
  requestedAt: string;
  processedAt?: string;
}

interface Balance {
  totalEarnings: number;
  totalWithdrawn: number;
  availableBalance: number;
  pendingWithdrawals: number;
}

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "success" | "warning" | "error" | "info" | "neutral";
    icon: React.ReactNode;
  }
> = {
  pending: { label: "Pending", variant: "warning", icon: <Clock size={14} /> },
  approved: {
    label: "Approved",
    variant: "info",
    icon: <CheckCircle size={14} />,
  },
  rejected: {
    label: "Rejected",
    variant: "error",
    icon: <XCircle size={14} />,
  },
  completed: {
    label: "Completed",
    variant: "success",
    icon: <CheckCircle size={14} />,
  },
};

const methodLabels: Record<string, string> = {
  stripe_connect: "Stripe Connect",
  bank_transfer: "Bank Transfer",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function WithdrawalPanel() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchBalance = async () => {
    try {
      const { data } = await api.get("/withdrawals/balance");
      setBalance(data.data);
    } catch (err) {
      console.error("Failed to load balance");
    }
  };

  const fetchWithdrawals = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const { data } = await api.get(
        `/withdrawals/my?page=${pageNum}&limit=20`,
      );
      if (pageNum === 1) {
        setWithdrawals(data.data.withdrawals);
      } else {
        setWithdrawals((prev) => [...prev, ...data.data.withdrawals]);
      }
      setHasMore(data.data.pagination?.hasMore || false);
      setError(null);
    } catch (err) {
      setError("Failed to load withdrawals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchWithdrawals();
  }, []);

  const handleRequestSuccess = () => {
    setIsRequestModalOpen(false);
    fetchBalance();
    fetchWithdrawals(1);
  };

  const hasPendingWithdrawal = withdrawals.some((w) => w.status === "pending");

  if (loading && !balance) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-light border border-error/20 rounded-xl p-8 text-center">
        <AlertCircle size={48} className="text-error mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-700 mb-1">
          Failed to load data
        </h3>
        <p className="text-sm text-neutral-500 mb-4">{error}</p>
        <Button
          onClick={() => {
            fetchBalance();
            fetchWithdrawals(1);
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Balance Cards */}
      {balance && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={18} className="text-primary-500" />
              <span className="text-sm text-neutral-500">
                Available Balance
              </span>
            </div>
            <p className="text-2xl font-bold text-neutral-900">
              {formatCurrency(balance.availableBalance)}
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Available for withdrawal
            </p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={18} className="text-success" />
              <span className="text-sm text-neutral-500">Total Earnings</span>
            </div>
            <p className="text-2xl font-bold text-neutral-900">
              {formatCurrency(balance.totalEarnings)}
            </p>
            <p className="text-xs text-neutral-400 mt-1">Lifetime earnings</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight size={18} className="text-info" />
              <span className="text-sm text-neutral-500">Total Withdrawn</span>
            </div>
            <p className="text-2xl font-bold text-neutral-900">
              {formatCurrency(balance.totalWithdrawn)}
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Successfully withdrawn
            </p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} className="text-warning" />
              <span className="text-sm text-neutral-500">Pending</span>
            </div>
            <p className="text-2xl font-bold text-neutral-900">
              {formatCurrency(balance.pendingWithdrawals)}
            </p>
            <p className="text-xs text-neutral-400 mt-1">In processing</p>
          </div>
        </div>
      )}

      {/* Request Withdrawal */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              Request Withdrawal
            </h3>
            <p className="text-sm text-neutral-500 mt-1">
              Minimum withdrawal amount is $10.00
            </p>
            {hasPendingWithdrawal && (
              <p className="text-sm text-warning mt-1">
                You already have a pending withdrawal request.
              </p>
            )}
          </div>
          <Button
            leftIcon={<Wallet size={16} />}
            onClick={() => setIsRequestModalOpen(true)}
            disabled={
              !balance || balance.availableBalance < 10 || hasPendingWithdrawal
            }
          >
            Request Withdrawal
          </Button>
        </div>
      </div>

      {/* Withdrawal History */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">
            Withdrawal History
          </h3>
        </div>

        {withdrawals.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet size={48} className="text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-700 mb-1">
              No withdrawals yet
            </h3>
            <p className="text-sm text-neutral-500">
              Your withdrawal history will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {withdrawals.map((withdrawal) => {
              const status = statusConfig[withdrawal.status];
              return (
                <div
                  key={withdrawal._id}
                  className="px-5 py-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                        <Wallet size={18} className="text-neutral-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">
                          {formatCurrency(withdrawal.amount)}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {methodLabels[withdrawal.payoutMethod]}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={status.variant}
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        {status.icon}
                        {status.label}
                      </Badge>
                      <p className="text-xs text-neutral-400 mt-1">
                        Requested {formatDate(withdrawal.requestedAt)}
                      </p>
                      {withdrawal.processedAt && (
                        <p className="text-xs text-neutral-400">
                          Processed {formatDate(withdrawal.processedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  {withdrawal.adminNote && (
                    <div className="mt-3 p-3 bg-neutral-50 rounded-lg text-sm text-neutral-600">
                      <span className="font-medium">Note:</span>{" "}
                      {withdrawal.adminNote}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="p-4 text-center border-t border-neutral-100">
            <Button
              variant="outline"
              onClick={() => fetchWithdrawals(page + 1)}
              isLoading={loading}
            >
              Load More
            </Button>
          </div>
        )}
      </div>

      {/* Request Modal */}
      {balance && (
        <WithdrawalRequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          availableBalance={balance.availableBalance}
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  );
}
