import { api } from "@/lib/api/client";
import type { WishlistItem } from "@/types";

export interface WishlistResponse {
  items: WishlistItem[];
  pagination: {
    page: number;
    pages: number;
    total: number;
  };
}

export async function getWishlist(
  page: number = 1,
  limit: number = 20,
): Promise<WishlistResponse> {
  const { data } = await api.get("/wishlists", { params: { page, limit } });
  return data.data;
}

export async function checkWishlistStatus(
  templateId: string,
): Promise<boolean> {
  try {
    const { data } = await api.get(`/wishlists/check/${templateId}`);
    return data.data.wishlisted;
  } catch {
    return false;
  }
}

export async function checkBulkWishlistStatus(
  templateIds: string[],
): Promise<string[]> {
  try {
    const { data } = await api.post("/wishlists/check-bulk", { templateIds });
    return data.data.wishlistedIds;
  } catch {
    return [];
  }
}

export async function addToWishlist(templateId: string): Promise<WishlistItem> {
  const { data } = await api.post(`/wishlists/${templateId}`);
  return data.data;
}

export async function removeFromWishlist(templateId: string): Promise<void> {
  await api.delete(`/wishlists/${templateId}`);
}

export async function getWishlistCount(templateId: string): Promise<number> {
  try {
    const { data } = await api.get(`/wishlists/count/${templateId}`);
    return data.data.count;
  } catch {
    return 0;
  }
}
