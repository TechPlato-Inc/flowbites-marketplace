"use client";

import { Review } from "@/types";
import { StarRating } from "./StarRating";
import { formatDate } from "@/lib/utils/format";
import { ReportButton } from "@/modules/reports/components/ReportButton";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const buyer = review.buyerId;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {buyer.avatar ? (
            <img
              src={buyer.avatar}
              alt={buyer.name}
              className="w-10 h-10 rounded-full object-cover bg-neutral-100"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
              {buyer.name.charAt(0)}
            </div>
          )}
          <div>
            <div className="font-medium text-neutral-900 text-sm">
              {buyer.name}
            </div>
            <div className="text-xs text-neutral-400">
              {formatDate(review.createdAt)}
            </div>
          </div>
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>

      <h4 className="font-semibold text-neutral-900 mb-2">{review.title}</h4>
      <p className="text-neutral-600 text-sm leading-relaxed">
        {review.comment}
      </p>

      <div className="mt-3 pt-3 border-t border-neutral-100 flex justify-end">
        <ReportButton
          targetType="review"
          targetId={review._id}
          variant="icon"
        />
      </div>
    </div>
  );
}
