import { api } from "@/lib/api/client";
import { Review, ReviewSummary } from "@/types";

interface ReviewsResponse {
  reviews: Review[];
  summary: ReviewSummary;
}

export async function getReviews(
  templateId: string,
  page: number = 1,
  limit: number = 10,
): Promise<ReviewsResponse> {
  const { data } = await api.get(
    `/reviews/template/${templateId}?page=${page}&limit=${limit}`,
  );
  return data.data;
}

export async function submitReview(
  templateId: string,
  payload: { rating: number; title: string; comment: string },
): Promise<Review> {
  const { data } = await api.post(`/reviews/template/${templateId}`, payload);
  return data.data;
}

export async function updateReview(
  reviewId: string,
  payload: { rating?: number; title?: string; comment?: string },
): Promise<Review> {
  const { data } = await api.patch(`/reviews/${reviewId}`, payload);
  return data.data;
}

export async function deleteReview(
  reviewId: string,
): Promise<{ message: string }> {
  const { data } = await api.delete(`/reviews/${reviewId}`);
  return data.data;
}
