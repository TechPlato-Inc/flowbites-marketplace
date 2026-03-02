"use client";

import { useState, useEffect } from "react";
import { Button, Input, Modal } from "@/design-system";
import {
  getAffiliatePayouts,
  requestPayout,
  getPayoutMethods,
} from "../services/affiliates.service";
import type { AffiliatePayout } from "@/types";
import {
  DollarSign,
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Building2,
  CreditCard,
} from "lucide-react";
import { getErrorMessage } from "@/lib/utils/getErrorMessage";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: typeof Clock }
> = {
  requested: { label: "Requested", color: "text-amber-600", icon: Clock },
  approved: { label: "Approved", color: "text-blue-600", icon: CheckCircle },
  paid: { label: "Paid", color: "text-green-600", icon: CheckCircle },
  rejected: { label: "Rejected", color: "text-red-600", icon: XCircle },
};

export function PayoutRequest() {
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([]);
  const [payoutMethods, setPayoutMethods] = useState<
    { id: string; name: string; description: string; minAmount: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [availableBalance, setAvailableBalance] = useState(0);

  // Request modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [requestNotes, setRequestNotes] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);

  const loadPayouts = async () => {
    try {
      setLoading(true);
      setError("");

      const [payoutsData, methodsData] = await Promise.all([
        getAffiliatePayouts({ page: String(page), limit: "10" }),
        getPayoutMethods(),
      ]);

      setPayouts(payoutsData.payouts);
      setTotalPages(payoutsData.pagination.pages);
      setPayoutMethods(methodsData);

      // Calculate available balance from pending earnings
      // This would typically come from the affiliate API
      setAvailableBalance(0); // Will be populated from parent component
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load payouts"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayouts();
  }, [page]);

  const handleRequestPayout = async () => {
    const amount = parseFloat(requestAmount);

    if (!amount || amount <= 0) {
      setRequestError("Please enter a valid amount");
      return;
    }

    if (amount > availableBalance) {
      setRequestError("Amount exceeds available balance");
      return;
    }

    if (!selectedMethod) {
      setRequestError("Please select a payment method");
      return;
    }

    const method = payoutMethods.find((m) => m.id === selectedMethod);
    if (method && amount < method.minAmount) {
      setRequestError(
        `Minimum payout for ${method.name} is ${formatCurrency(method.minAmount)}`,
      );
      return;
    }

    try {
      setRequesting(true);
      setRequestError("");

      await requestPayout({
        amount,
        paymentMethod: selectedMethod,
        notes: requestNotes,
      });

      setRequestSuccess(true);
      setTimeout(() => {
        setShowRequestModal(false);
        setRequestSuccess(false);
        setRequestAmount("");
        setSelectedMethod("");
        setRequestNotes("");
        loadPayouts();
      }, 2000);
    } catch (err: unknown) {
      setRequestError(getErrorMessage(err, "Failed to request payout"));
    } finally {
      setRequesting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getMethodIcon = (methodId: string) => {
    if (methodId.includes("stripe")) return CreditCard;
    if (methodId.includes("bank")) return Building2;
    if (methodId.includes("paypal")) return DollarSign;
    return Wallet;
  };

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-primary-100 text-sm mb-1">Available Balance</p>
            <p className="text-3xl font-bold">
              {formatCurrency(availableBalance)}
            </p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Wallet size={24} className="text-white" />
          </div>
        </div>
        <Button
          onClick={() => setShowRequestModal(true)}
          disabled={availableBalance <= 0}
          className="mt-4 !bg-white !text-primary-600 hover:!bg-primary-50"
          size="sm"
        >
          Request Payout
        </Button>
      </div>

      {/* Payout Methods Info */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5">
        <h3 className="font-semibold text-neutral-900 mb-4">
          Available Payout Methods
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {payoutMethods.map((method) => {
            const Icon = getMethodIcon(method.id);
            return (
              <div
                key={method.id}
                className="border border-neutral-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Icon size={20} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">
                      {method.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Min: {formatCurrency(method.minAmount)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-neutral-600">{method.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payout History */}
      <div>
        <h3 className="font-semibold text-neutral-900 mb-4">Payout History</h3>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-neutral-200 rounded-lg p-4 animate-pulse"
              >
                <div className="h-4 bg-neutral-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-error-light border border-error/20 rounded-lg p-4 text-error-dark">
            {error}
            <button
              onClick={loadPayouts}
              className="ml-2 text-sm underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        ) : payouts.length > 0 ? (
          <>
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">
                      Date
                    </th>
                    <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">
                      Method
                    </th>
                    <th className="text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">
                      Amount
                    </th>
                    <th className="text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {payouts.map((payout) => {
                    const statusConfig = STATUS_CONFIG[payout.status];
                    const StatusIcon = statusConfig?.icon || Clock;

                    return (
                      <tr
                        key={payout._id}
                        className="hover:bg-neutral-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-neutral-600">
                          {formatDate(payout.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-900">
                          <div className="flex items-center gap-2">
                            {(() => {
                              const Icon = getMethodIcon(payout.paymentMethod);
                              return (
                                <Icon size={16} className="text-neutral-400" />
                              );
                            })()}
                            {payout.paymentMethod.replace(/_/g, " ")}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-neutral-900 text-right">
                          {formatCurrency(payout.amount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 text-sm font-medium ${statusConfig?.color || "text-neutral-600"}`}
                          >
                            <StatusIcon size={14} />
                            {statusConfig?.label || payout.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-neutral-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
            <Wallet size={48} className="text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">
              No payouts yet
            </h3>
            <p className="text-sm text-neutral-500">
              Request your first payout when you have available balance
            </p>
          </div>
        )}
      </div>

      {/* Request Payout Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => {
          if (!requesting) {
            setShowRequestModal(false);
            setRequestError("");
            setRequestAmount("");
            setSelectedMethod("");
            setRequestNotes("");
          }
        }}
        title="Request Payout"
        size="md"
        footer={
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowRequestModal(false)}
              disabled={requesting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequestPayout}
              isLoading={requesting}
              disabled={!requestAmount || !selectedMethod}
            >
              Request Payout
            </Button>
          </div>
        }
      >
        {requestSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Payout Requested!
            </h3>
            <p className="text-neutral-600">
              Your payout request has been submitted and is pending review.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Available Balance */}
            <div className="bg-primary-50 rounded-lg p-4">
              <p className="text-sm text-primary-600 mb-1">Available Balance</p>
              <p className="text-2xl font-bold text-primary-700">
                {formatCurrency(availableBalance)}
              </p>
            </div>

            {requestError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle size={16} />
                {requestError}
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type="number"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  max={availableBalance}
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {payoutMethods.map((method) => {
                  const Icon = getMethodIcon(method.id);
                  return (
                    <label
                      key={method.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedMethod === method.id
                          ? "border-primary-500 bg-primary-50"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payoutMethod"
                        value={method.id}
                        checked={selectedMethod === method.id}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                        className="w-4 h-4 text-primary-600"
                      />
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-neutral-200">
                        <Icon size={20} className="text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900">
                          {method.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Min: {formatCurrency(method.minAmount)}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Notes (Optional)
              </label>
              <textarea
                value={requestNotes}
                onChange={(e) => setRequestNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none resize-none"
                placeholder="Any additional information..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
