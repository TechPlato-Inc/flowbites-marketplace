"use client";

import { useState, useEffect } from "react";
import { Review, ReviewSummary } from "@/types";
import { Button } from "@/design-system";
import { StarRating } from "./StarRating";
import { ReviewCard } from "./ReviewCard";
import { getReviews } from "../services/reviews.service";
import { Star, MessageSquare, AlertCircle } from "lucide-react";

interface ReviewListProps {
  templateId: string;
}

export function ReviewList({ templateId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const limit = 5;

  const fetchReviews = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReviews(templateId, pageNum, limit);
      if (pageNum === 1) {
        setReviews(data.reviews);
      } else {
        setReviews((prev) => [...prev, ...data.reviews]);
      }
      setSummary(data.summary);
      setHasMore(data.reviews.length === limit);
    } catch (err: any) {
      console.error("Failed to fetch reviews:", err);
      setError(err?.response?.data?.error || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, [templateId]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage);
  };

  const distributionPercentages = summary
    ? Object.entries(summary.distribution)
        .map(([star, count]) => ({
          star: Number(star),
          count,
          percentage: summary.total > 0 ? (count / summary.total) * 100 : 0,
        }))
        .sort((a, b) => b.star - a.star)
    : [];

  // Skeleton Loading State
  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-6">
        {/* Summary Skeleton */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <div className="h-10 w-16 bg-neutral-200 rounded animate-pulse" />
                <div className="w-8 h-8 bg-neutral-200 rounded animate-pulse" />
              </div>
              <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse mt-2 mx-auto sm:mx-0" />
            </div>
            <div className="flex-1 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-4 w-6 bg-neutral-200 rounded animate-pulse" />
                  <div className="flex-1 h-2 bg-neutral-200 rounded animate-pulse" />
                  <div className="h-4 w-8 bg-neutral-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Review Cards Skeleton */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-neutral-200 rounded-xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-200 animate-pulse" />
                <div className="space-y-1">
                  <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-neutral-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse" />
            </div>
            <div className="h-5 w-48 bg-neutral-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-full bg-neutral-200 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-neutral-200 rounded animate-pulse mt-1" />
          </div>
        ))}
      </div>
    );
  }

  // Error State
  if (error && reviews.length === 0) {
    return (
      <div className="bg-error-light border border-error/20 rounded-xl p-8 text-center">
        <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertCircle size={24} className="text-error" />
        </div>
        <h4 className="font-medium text-neutral-900 mb-1">
          Failed to load reviews
        </h4>
        <p className="text-sm text-neutral-500 mb-4">{error}</p>
        <Button variant="outline" size="sm" onClick={() => fetchReviews(1)}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!loading && reviews.length === 0) {
    return (
      <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-xl p-8 text-center">
        <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <MessageSquare size={24} className="text-neutral-400" />
        </div>
        <h4 className="font-medium text-neutral-900 mb-1">No reviews yet</h4>
        <p className="text-sm text-neutral-500">
          Be the first to share your thoughts on this template.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      {summary && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Average Rating */}
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-4xl font-display font-bold text-neutral-900">
                  {summary.average.toFixed(1)}
                </span>
                <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
              </div>
              <p className="text-sm text-neutral-500 mt-1">
                {summary.total} review{summary.total !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Distribution Bars */}
            <div className="flex-1 space-y-1.5">
              {distributionPercentages.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm text-neutral-600 w-8 text-right">
                    {star}★
                  </span>
                  <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-neutral-500 w-10">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review._id} review={review} />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            isLoading={loading}
          >
            Load More Reviews
          </Button>
        </div>
      )}
    </div>
  );
}
