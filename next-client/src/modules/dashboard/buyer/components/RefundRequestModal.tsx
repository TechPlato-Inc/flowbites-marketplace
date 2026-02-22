"use client";

import { useState } from "react";
import { Modal, Button } from "@/design-system";
import { api } from "@/lib/api/client";
import type { Order } from "@/types";
import { CheckCircle, AlertCircle } from "lucide-react";
import { showToast } from "@/design-system/Toast";

interface RefundRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSuccess?: () => void;
}

export function RefundRequestModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: RefundRequestModalProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!order || !reason.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      await api.post("/refunds/request", {
        orderId: order._id,
        reason: reason.trim(),
      });
      setSuccess(true);
      showToast("Refund request submitted successfully!", "success");
      onSuccess?.();
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          "Failed to submit refund request. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason("");
    setError("");
    setSuccess(false);
    onClose();
  };

  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={success ? "Refund Requested" : "Request Refund"}
      size="md"
      footer={
        success ? (
          <Button onClick={handleClose}>Close</Button>
        ) : (
          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              isLoading={submitting}
              disabled={!reason.trim()}
            >
              Submit Request
            </Button>
          </div>
        )
      }
    >
      {success ? (
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle size={24} className="text-success" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Request Received!
          </h3>
          <p className="text-neutral-600">
            Your refund request for order <strong>{order.orderNumber}</strong>{" "}
            has been submitted. We&apos;ll review it within 24-48 hours.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Order Details */}
          <div className="bg-neutral-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-500">Order Number</span>
              <span className="text-sm font-medium text-neutral-900 font-mono">
                {order.orderNumber}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">Total Amount</span>
              <span className="text-lg font-bold text-neutral-900">
                ${order.total.toFixed(2)}
              </span>
            </div>
            {order.items.length > 0 && (
              <div className="mt-3 pt-3 border-t border-neutral-200">
                <p className="text-xs text-neutral-500 mb-1">Items:</p>
                <ul className="text-sm text-neutral-700">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="truncate">
                      {item.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-error-light border border-error/20 text-error-dark rounded-lg px-3 py-2 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Reason for Refund *
            </label>
            <textarea
              rows={4}
              placeholder="Please explain why you're requesting a refund..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none text-sm"
              required
            />
            <p className="text-xs text-neutral-400 mt-1">
              Refund requests must be submitted within 14 days of purchase.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
