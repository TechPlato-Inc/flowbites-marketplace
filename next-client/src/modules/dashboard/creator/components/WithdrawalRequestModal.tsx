"use client";

import { useState } from "react";
import { api } from "@/lib/api/client";
import { Modal, Button } from "@/design-system";
import { AlertCircle, Wallet } from "lucide-react";

interface WithdrawalRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onSuccess: () => void;
}

const MIN_WITHDRAWAL = 10;

const payoutMethods = [
  { value: "stripe_connect", label: "Stripe Connect" },
  { value: "bank_transfer", label: "Bank Transfer" },
];

export function WithdrawalRequestModal({
  isOpen,
  onClose,
  availableBalance,
  onSuccess,
}: WithdrawalRequestModalProps) {
  const [amount, setAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("stripe_connect");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountNum = parseFloat(amount) || 0;
  const isValid = amountNum >= MIN_WITHDRAWAL && amountNum <= availableBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      setError(
        `Amount must be between $${MIN_WITHDRAWAL} and $${availableBalance.toFixed(2)}`,
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.post("/withdrawals/request", {
        amount: amountNum,
        payoutMethod,
        note: note.trim() || undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to request withdrawal");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setAmount("");
      setPayoutMethod("stripe_connect");
      setNote("");
      setError(null);
      onClose();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Request Withdrawal"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-error-light border border-error/20 rounded-lg p-3 flex items-center gap-2 text-error text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Available Balance */}
        <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
          <p className="text-sm text-primary-700 mb-1">Available Balance</p>
          <p className="text-2xl font-bold text-primary-900">
            {formatCurrency(availableBalance)}
          </p>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Amount <span className="text-error">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
              $
            </span>
            <input
              type="number"
              min={MIN_WITHDRAWAL}
              max={availableBalance}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Min $${MIN_WITHDRAWAL}`}
              className="w-full pl-8 pr-4 py-2 border border-neutral-200 rounded-lg bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
              required
            />
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Minimum: ${MIN_WITHDRAWAL} · Maximum:{" "}
            {formatCurrency(availableBalance)}
          </p>
        </div>

        {/* Payout Method */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Payout Method <span className="text-error">*</span>
          </label>
          <select
            value={payoutMethod}
            onChange={(e) => setPayoutMethod(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          >
            {payoutMethods.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Note <span className="text-neutral-400">(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any additional information..."
            rows={3}
            className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none"
          />
        </div>

        {/* Summary */}
        {isValid && (
          <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Amount</span>
              <span className="font-medium">{formatCurrency(amountNum)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Platform Fee (0%)</span>
              <span className="font-medium">{formatCurrency(0)}</span>
            </div>
            <div className="border-t border-neutral-200 pt-2 flex justify-between">
              <span className="font-medium text-neutral-900">You Receive</span>
              <span className="font-bold text-neutral-900">
                {formatCurrency(amountNum)}
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={loading}
            disabled={!isValid}
            leftIcon={<Wallet size={16} />}
          >
            Request Withdrawal
          </Button>
        </div>
      </form>
    </Modal>
  );
}
