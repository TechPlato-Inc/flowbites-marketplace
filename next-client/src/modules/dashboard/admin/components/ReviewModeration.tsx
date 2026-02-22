"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { Button, Badge, Modal, Input } from "@/design-system";
import { StarRating } from "@/modules/reviews/components/StarRating";
import type { Review } from "@/types";
import { formatDate } from "@/lib/utils/format";
import { CheckCircle, XCircle, AlertCircle, Star } from "lucide-react";
import { showToast } from "@/design-system/Toast";

export function ReviewModeration() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("pending");

  // Moderation modal states
  const [moderateModalOpen, setModerateModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [moderationAction, setModerationAction] = useState<
    "approved" | "rejected" | null
  >(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/reviews/admin/all", {
        params: { status: statusFilter !== "all" ? statusFilter : undefined },
      });
      setReviews(data.data || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  const openModerateModal = (
    review: Review,
    action: "approved" | "rejected",
  ) => {
    setSelectedReview(review);
    setModerationAction(action);
    setRejectionReason("");
    setModerateModalOpen(true);
  };

  const closeModerateModal = () => {
    setModerateModalOpen(false);
    setSelectedReview(null);
    setModerationAction(null);
    setRejectionReason("");
  };

  const handleModerate = async () => {
    if (!selectedReview || !moderationAction) return;

    setProcessing(true);
    try {
      await api.patch(`/reviews/admin/${selectedReview._id}/moderate`, {
        status: moderationAction,
        rejectionReason:
          moderationAction === "rejected" ? rejectionReason : undefined,
      });

      // Refresh the list
      fetchReviews();
      closeModerateModal();
    } catch (error) {
      console.error("Failed to moderate review:", error);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "warning" | "success" | "error" | "neutral"
    > = {
      pending: "warning",
      approved: "success",
      rejected: "error",
    };
    return (
      <Badge variant={variants[status] || "neutral"} size="sm">
        {status}
      </Badge>
    );
  };

  const statusTabs = [
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "all", label: "All" },
  ];

  if (loading && reviews.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-neutral-900">
            Review Moderation
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Approve or reject customer reviews before they appear publicly
          </p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg w-fit">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              statusFilter === tab.key
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
          <CheckCircle size={48} className="text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-1">
            All reviews moderated
          </h3>
          <p className="text-sm text-neutral-500">
            There are no reviews with status &quot;{statusFilter}&quot; at this
            time.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white border border-neutral-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Review Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <StarRating rating={review.rating} size="sm" />
                    {getStatusBadge(review.status)}
                  </div>

                  <h4 className="font-semibold text-neutral-900 mb-1">
                    {review.title}
                  </h4>
                  <p className="text-neutral-600 text-sm mb-3">
                    {review.comment}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                    <span>
                      By:{" "}
                      <strong className="text-neutral-700">
                        {review.buyerId.name}
                      </strong>
                    </span>
                    <span>
                      Template ID:{" "}
                      <code className="font-mono bg-neutral-100 px-1 py-0.5 rounded">
                        {review.templateId.slice(-8)}
                      </code>
                    </span>
                    <span>{formatDate(review.createdAt)}</span>
                  </div>

                  {review.rejectionReason && (
                    <div className="mt-3 p-2 bg-error-light border border-error/20 rounded-lg text-sm text-error-dark">
                      <strong>Rejection reason:</strong>{" "}
                      {review.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {review.status === "pending" && (
                  <div className="flex lg:flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<CheckCircle size={14} />}
                      onClick={() => openModerateModal(review, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<XCircle size={14} />}
                      onClick={() => openModerateModal(review, "rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Moderation Modal */}
      <Modal
        isOpen={moderateModalOpen}
        onClose={closeModerateModal}
        title={
          moderationAction === "approved" ? "Approve Review" : "Reject Review"
        }
        size="sm"
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={closeModerateModal}>
              Cancel
            </Button>
            <Button
              onClick={handleModerate}
              isLoading={processing}
              variant={moderationAction === "rejected" ? "danger" : "primary"}
            >
              {moderationAction === "approved"
                ? "Approve Review"
                : "Reject Review"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-neutral-50 rounded-lg p-3">
            <p className="text-sm font-medium text-neutral-900">
              {selectedReview?.title}
            </p>
            <p className="text-sm text-neutral-600 mt-1">
              {selectedReview?.comment}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <StarRating rating={selectedReview?.rating || 0} size="sm" />
            </div>
          </div>

          {moderationAction === "rejected" && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Rejection Reason *
              </label>
              <Input
                placeholder="Why is this review being rejected?"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <p className="text-xs text-neutral-400 mt-1">
                This reason will not be shown to the reviewer.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
