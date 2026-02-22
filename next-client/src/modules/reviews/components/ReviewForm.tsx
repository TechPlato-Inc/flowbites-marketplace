"use client";

import { useState } from "react";
import { Button, Input } from "@/design-system";
import { StarRating } from "./StarRating";
import { submitReview } from "../services/reviews.service";
import { CheckCircle } from "lucide-react";
import { showToast } from "@/design-system/Toast";

interface ReviewFormProps {
  templateId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ templateId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }
    if (!comment.trim()) {
      setError("Please enter a comment");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await submitReview(templateId, {
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });
      setSuccess(true);
      showToast("Review submitted successfully!", "success");
      onSuccess?.();
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          "Failed to submit review. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-success-light border border-success/20 rounded-xl p-6 text-center">
        <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle size={24} className="text-success" />
        </div>
        <h4 className="font-semibold text-neutral-900 mb-1">
          Review Submitted!
        </h4>
        <p className="text-sm text-neutral-600">
          Thank you for your feedback. Your review is pending approval.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-neutral-200 rounded-xl p-5"
    >
      <h4 className="font-semibold text-neutral-900 mb-4">Write a Review</h4>

      {error && (
        <div className="bg-error-light border border-error/20 text-error-dark rounded-lg px-3 py-2 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Your Rating *
          </label>
          <StarRating
            rating={rating}
            interactive
            onChange={setRating}
            size="lg"
          />
        </div>

        <Input
          label="Review Title *"
          placeholder="Summarize your experience"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Your Review *
          </label>
          <textarea
            rows={4}
            placeholder="What did you like or dislike about this template?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none text-sm"
            required
          />
        </div>

        <Button type="submit" isLoading={submitting} className="w-full">
          Submit Review
        </Button>
      </div>
    </form>
  );
}
