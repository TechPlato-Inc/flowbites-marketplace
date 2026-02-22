import { api } from "@/lib/api/client";
import type { UIShot } from "@/types";

interface ShotListResponse {
  shots: UIShot[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

// Public routes
export async function getShots(
  params?: Record<string, string>,
): Promise<ShotListResponse> {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const { data } = await api.get(`/ui-shots${query}`);
  return data.data;
}

export async function createShot(formData: FormData): Promise<UIShot> {
  const { data } = await api.post("/ui-shots", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function toggleLike(id: string): Promise<{ liked: boolean }> {
  const { data } = await api.post(`/ui-shots/${id}/like`);
  return data.data;
}

export async function toggleSave(id: string): Promise<{ saved: boolean }> {
  const { data } = await api.post(`/ui-shots/${id}/save`);
  return data.data;
}

// Admin routes
export async function adminGetAllShots(
  params?: Record<string, string>,
): Promise<ShotListResponse> {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const { data } = await api.get(`/ui-shots/admin/all${query}`);
  return data.data;
}

export async function adminDeleteShot(
  id: string,
  reason: string,
): Promise<{ deleted: boolean }> {
  const { data } = await api.delete(`/ui-shots/admin/${id}`, {
    data: { reason },
  });
  return data.data;
}

export async function adminTogglePublished(id: string): Promise<UIShot> {
  const { data } = await api.patch(`/ui-shots/admin/${id}/toggle-published`);
  return data.data;
}
