"use client";

import { useState } from "react";
import { api } from "@/lib/api/client";
import { Modal, Button, Input } from "@/design-system";
import { AlertCircle } from "lucide-react";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const categories = [
  { value: "billing", label: "Billing & Payments" },
  { value: "technical", label: "Technical Support" },
  { value: "account", label: "Account Issues" },
  { value: "template", label: "Template Issue" },
  { value: "refund", label: "Refund Request" },
  { value: "other", label: "Other" },
];

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const MIN_SUBJECT = 3;
const MAX_SUBJECT = 200;
const MIN_MESSAGE = 10;
const MAX_MESSAGE = 2000;

export function CreateTicketModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTicketModalProps) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("other");
  const [priority, setPriority] = useState("medium");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subjectLen = subject.trim().length;
  const messageLen = message.trim().length;
  const isSubjectValid = subjectLen >= MIN_SUBJECT && subjectLen <= MAX_SUBJECT;
  const isMessageValid = messageLen >= MIN_MESSAGE && messageLen <= MAX_MESSAGE;
  const canSubmit = isSubjectValid && isMessageValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) {
      if (!isSubjectValid) {
        setError(`Subject must be at least ${MIN_SUBJECT} characters`);
      } else {
        setError(`Message must be at least ${MIN_MESSAGE} characters`);
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.post("/tickets", {
        subject: subject.trim(),
        category,
        priority,
        message: message.trim(),
      });
      onSuccess();
      resetForm();
    } catch (err: any) {
      const errData = err.response?.data;
      const detail = errData?.details?.[0];
      setError(
        detail ||
          errData?.error ||
          errData?.message ||
          "Failed to create ticket",
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubject("");
    setCategory("other");
    setPriority("medium");
    setMessage("");
    setError(null);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Support Ticket"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-error-light border border-error/20 rounded-lg p-3 flex items-center gap-2 text-error text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-neutral-700">
              Subject
            </label>
            <span
              className={`text-xs ${subjectLen > 0 && !isSubjectValid ? "text-error" : "text-neutral-400"}`}
            >
              {subjectLen}/{MAX_SUBJECT}
            </span>
          </div>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief description of your issue (min 3 characters)"
            className={`w-full px-3 py-2 border rounded-lg bg-white focus:ring-1 focus:outline-none transition-colors ${
              subjectLen > 0 && !isSubjectValid
                ? "border-error focus:border-error focus:ring-error/30"
                : "border-neutral-200 focus:border-primary-500 focus:ring-primary-500"
            }`}
            required
            maxLength={MAX_SUBJECT}
          />
          {subjectLen > 0 && subjectLen < MIN_SUBJECT && (
            <p className="text-xs text-error mt-1">
              {MIN_SUBJECT - subjectLen} more character
              {MIN_SUBJECT - subjectLen > 1 ? "s" : ""} needed
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            >
              {priorities.map((pri) => (
                <option key={pri.value} value={pri.value}>
                  {pri.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-neutral-700">
              Message
            </label>
            <span
              className={`text-xs ${messageLen > 0 && !isMessageValid ? "text-error" : "text-neutral-400"}`}
            >
              {messageLen}/{MAX_MESSAGE}
            </span>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue in detail (min 10 characters)..."
            rows={5}
            className={`w-full px-3 py-2 border rounded-lg bg-white focus:ring-1 focus:outline-none resize-none transition-colors ${
              messageLen > 0 && !isMessageValid
                ? "border-error focus:border-error focus:ring-error/30"
                : "border-neutral-200 focus:border-primary-500 focus:ring-primary-500"
            }`}
            required
            maxLength={MAX_MESSAGE}
          />
          {messageLen > 0 && messageLen < MIN_MESSAGE && (
            <p className="text-xs text-error mt-1">
              {MIN_MESSAGE - messageLen} more character
              {MIN_MESSAGE - messageLen > 1 ? "s" : ""} needed
            </p>
          )}
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
          <Button type="submit" isLoading={loading} disabled={!canSubmit}>
            Create Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
}
