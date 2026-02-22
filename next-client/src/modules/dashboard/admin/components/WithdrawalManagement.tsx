"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { Button, Badge, Modal, Input } from "@/design-system";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Wallet,
  DollarSign,
  ArrowRight,
} from "lucide-react";

interface Withdrawal {
  _id: string;
  creatorId: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  status: "pending" | "approved" | "rejected" | "completed";
  payoutMethod: "stripe_connect" | "bank_transfer";
  note?: string;
  adminNote?: string;
  stripeTransferId?: string;
  requestedAt: string;
  processedAt?: string;
}

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "success" | "warning" | "error" | "info" | "neutral";
  }
> = {
  pending: { label: "Pending", variant: "warning" },
  approved: { label: "Approved", variant: "info" },
  rejected: { label: "Rejected", variant: "error" },
  completed: { label: "Completed", variant: "success" },
};

const methodLabels: Record<string, string> = {
  stripe_connect: "Stripe Connect",
  bank_transfer: "Bank Transfer",
};

export function WithdrawalManagement() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Action modal state
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<Withdrawal | null>(null);
  const [actionType, setActionType] = useState<
    "approve" | "reject" | "complete" | null
  >(null);
  const [adminNote, setAdminNote] = useState("");
  const [stripeTransferId, setStripeTransferId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchWithdrawals = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", pageNum.toString());
      params.append("limit", "20");
      if (statusFilter) params.append("status", statusFilter);

      const { data } = await api.get(`/withdrawals/admin?${params.toString()}`);
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
    fetchWithdrawals(1);
  }, [statusFilter]);

  const handleAction = async () => {
    if (!selectedWithdrawal || !actionType) return;

    try {
      setActionLoading(true);
      let endpoint = "";
      let body: Record<string, any> = {};

      switch (actionType) {
        case "approve":
          endpoint = `/withdrawals/admin/${selectedWithdrawal._id}/approve`;
          break;
        case "reject":
          endpoint = `/withdrawals/admin/${selectedWithdrawal._id}/reject`;
          body = { adminNote: adminNote.trim() || undefined };
          break;
        case "complete":
          endpoint = `/withdrawals/admin/${selectedWithdrawal._id}/complete`;
          body = { stripeTransferId: stripeTransferId.trim() || undefined };
          break;
      }

      await api.post(endpoint, body);
      fetchWithdrawals(1);
      setActionModalOpen(false);
      setSelectedWithdrawal(null);
      setActionType(null);
      setAdminNote("");
      setStripeTransferId("");
    } catch (err: any) {
      setError(
        err.response?.data?.message || `Failed to ${actionType} withdrawal`,
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (
    withdrawal: Withdrawal,
    action: "approve" | "reject" | "complete",
  ) => {
    setSelectedWithdrawal(withdrawal);
    setActionType(action);
    setAdminNote("");
    setStripeTransferId("");
    setActionModalOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading && withdrawals.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-light border border-error/20 rounded-xl p-8 text-center">
        <AlertCircle size={48} className="text-error mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-700 mb-1">
          Failed to load withdrawals
        </h3>
        <p className="text-sm text-neutral-500 mb-4">{error}</p>
        <Button onClick={() => fetchWithdrawals(1)}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Withdrawals Table */}
      {withdrawals.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
          <Wallet size={48} className="text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-1">
            No withdrawals found
          </h3>
          <p className="text-sm text-neutral-500">All caught up!</p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-5 py-3 bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            <div className="col-span-2">Creator</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-2">Method</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Requested</div>
            <div className="col-span-3">Actions</div>
          </div>

          <div className="divide-y divide-neutral-100">
            {withdrawals.map((withdrawal) => {
              const status = statusConfig[withdrawal.status];
              return (
                <div
                  key={withdrawal._id}
                  className="p-4 md:py-4 md:px-5 hover:bg-neutral-50 transition-colors"
                >
                  <div className="md:grid md:grid-cols-12 md:gap-4 md:items-center">
                    {/* Creator */}
                    <div className="md:col-span-2 mb-2 md:mb-0">
                      <p className="text-sm font-medium text-neutral-900">
                        {withdrawal.creatorId.name}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {withdrawal.creatorId.email}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="md:col-span-2 mb-2 md:mb-0">
                      <p className="text-lg font-bold text-neutral-900">
                        {formatCurrency(withdrawal.amount)}
                      </p>
                      {withdrawal.note && (
                        <p className="text-xs text-neutral-400 truncate">
                          {withdrawal.note}
                        </p>
                      )}
                    </div>

                    {/* Method */}
                    <div className="md:col-span-2 mb-2 md:mb-0">
                      <p className="text-sm text-neutral-700">
                        {methodLabels[withdrawal.payoutMethod]}
                      </p>
                      {withdrawal.stripeTransferId && (
                        <p className="text-xs text-neutral-400 truncate">
                          ID: {withdrawal.stripeTransferId.slice(-8)}
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    <div className="md:col-span-1 mb-2 md:mb-0">
                      <Badge variant={status.variant} size="sm">
                        {status.label}
                      </Badge>
                    </div>

                    {/* Date */}
                    <div className="md:col-span-2 mb-2 md:mb-0">
                      <p className="text-sm text-neutral-500">
                        {formatDate(withdrawal.requestedAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-3 flex gap-2 flex-wrap">
                      {withdrawal.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<CheckCircle size={14} />}
                            onClick={() =>
                              openActionModal(withdrawal, "approve")
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={<XCircle size={14} />}
                            onClick={() =>
                              openActionModal(withdrawal, "reject")
                            }
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {withdrawal.status === "approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<DollarSign size={14} />}
                          onClick={() =>
                            openActionModal(withdrawal, "complete")
                          }
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => fetchWithdrawals(page + 1)}
            isLoading={loading}
          >
            Load More
          </Button>
        </div>
      )}

      {/* Action Modal */}
      <Modal
        isOpen={actionModalOpen}
        onClose={() => {
          if (!actionLoading) {
            setActionModalOpen(false);
            setSelectedWithdrawal(null);
            setActionType(null);
            setAdminNote("");
            setStripeTransferId("");
          }
        }}
        title={
          actionType === "approve"
            ? "Approve Withdrawal"
            : actionType === "reject"
              ? "Reject Withdrawal"
              : "Complete Withdrawal"
        }
        size="md"
      >
        <div className="space-y-4">
          {selectedWithdrawal && (
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-neutral-500">Creator</span>
                <span className="font-medium">
                  {selectedWithdrawal.creatorId.name}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-neutral-500">Amount</span>
                <span className="font-bold text-neutral-900">
                  {formatCurrency(selectedWithdrawal.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Method</span>
                <span className="font-medium">
                  {methodLabels[selectedWithdrawal.payoutMethod]}
                </span>
              </div>
            </div>
          )}

          {actionType === "reject" && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Reason for Rejection{" "}
                <span className="text-neutral-400">(optional)</span>
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Explain why this withdrawal is being rejected..."
                rows={3}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none"
              />
            </div>
          )}

          {actionType === "complete" && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Stripe Transfer ID{" "}
                <span className="text-neutral-400">(optional)</span>
              </label>
              <Input
                value={stripeTransferId}
                onChange={(e) => setStripeTransferId(e.target.value)}
                placeholder="e.g., tr_1234567890"
              />
              <p className="text-xs text-neutral-400 mt-1">
                Enter the Stripe transfer ID for reference
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setActionModalOpen(false);
                setSelectedWithdrawal(null);
                setActionType(null);
                setAdminNote("");
                setStripeTransferId("");
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              isLoading={actionLoading}
              variant={actionType === "reject" ? "ghost" : "primary"}
            >
              {actionType === "approve"
                ? "Approve"
                : actionType === "reject"
                  ? "Reject"
                  : "Complete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
