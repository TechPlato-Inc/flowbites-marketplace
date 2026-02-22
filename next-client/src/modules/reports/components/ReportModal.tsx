"use client";

import { useState } from "react";
import { api } from "@/lib/api/client";
import { Modal, Button } from "@/design-system";
import { AlertCircle, CheckCircle, Flag } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "template" | "review" | "creator" | "user";
  targetId: string;
}

const reportReasons = [
  { value: "spam", label: "Spam" },
  { value: "inappropriate_content", label: "Inappropriate Content" },
  { value: "copyright_violation", label: "Copyright Violation" },
  { value: "misleading", label: "Misleading Information" },
  { value: "scam", label: "Scam or Fraud" },
  { value: "harassment", label: "Harassment" },
  { value: "other", label: "Other" },
];

export function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
}: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      setError("Please select a reason");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.post("/reports", {
        targetType,
        targetId,
        reason,
        description: description.trim() || undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setReason("");
      setDescription("");
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  const getTargetLabel = () => {
    switch (targetType) {
      case "template":
        return "Template";
      case "review":
        return "Review";
      case "creator":
        return "Creator Profile";
      case "user":
        return "User";
      default:
        return "Content";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Report Content"
      size="md"
    >
      {success ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-success" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Report Submitted
          </h3>
          <p className="text-neutral-500 mb-6">
            Thank you for your report. Our team will review it and take
            appropriate action.
          </p>
          <Button onClick={handleClose}>Close</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 text-neutral-600 mb-4">
            <Flag size={18} />
            <span>Reporting {getTargetLabel()}</span>
          </div>

          {error && (
            <div className="bg-error-light border border-error/20 rounded-lg p-3 flex items-center gap-2 text-error text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Reason for reporting <span className="text-error">*</span>
            </label>
            <div className="space-y-2">
              {reportReasons.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    reason === r.value
                      ? "border-primary-500 bg-primary-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-4 h-4 text-primary-500 border-neutral-300 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-700">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Additional Details{" "}
              <span className="text-neutral-400">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more context about your report..."
              rows={4}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Submit Report
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
