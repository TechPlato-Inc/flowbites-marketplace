import { api } from "@/lib/api/client";

export interface Refund {
  _id: string;
  orderId: string;
  buyerId: string;
  amount: number;
  reason: string;
  status: "requested" | "approved" | "rejected" | "processed";
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export async function checkRefundStatus(
  orderId: string,
): Promise<Refund | null> {
  try {
    const { data } = await api.get(`/refunds/order/${orderId}`);
    return data.data;
  } catch {
    return null;
  }
}

export async function requestRefund(
  orderId: string,
  reason: string,
): Promise<Refund> {
  const { data } = await api.post("/refunds/request", { orderId, reason });
  return data.data;
}
