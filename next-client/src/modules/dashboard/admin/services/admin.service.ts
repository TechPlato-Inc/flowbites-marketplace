import { api } from "@/lib/api/client";
import type {
  AdminDashboardStats,
  AdminUserInfo,
  AdminUserStats,
  AuditLogEntry,
  Template,
  ContentReport,
} from "@/types";

// Dashboard
export async function getDashboardStats(): Promise<AdminDashboardStats> {
  const { data } = await api.get("/admin/dashboard-stats");
  return data.data;
}

// Templates
export async function getTemplates(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const { data } = await api.get(`/admin/templates${query}`);
  return data.data;
}

export async function getPendingTemplates() {
  const { data } = await api.get("/admin/templates/pending");
  return data.data;
}

export async function getTemplateById(id: string): Promise<Template> {
  const { data } = await api.get(`/admin/templates/${id}`);
  return data.data;
}

export async function approveTemplate(id: string): Promise<Template> {
  const { data } = await api.post(`/admin/templates/${id}/approve`);
  return data.data;
}

export async function rejectTemplate(
  id: string,
  reason: string,
): Promise<Template> {
  const { data } = await api.post(`/admin/templates/${id}/reject`, { reason });
  return data.data;
}

export async function updateTemplate(
  id: string,
  payload: Partial<Template>,
): Promise<Template> {
  const { data } = await api.patch(`/admin/templates/${id}`, payload);
  return data.data;
}

export async function deleteTemplate(id: string): Promise<void> {
  await api.delete(`/admin/templates/${id}`);
}

export async function bulkAction(payload: {
  ids: string[];
  action: string;
}): Promise<void> {
  await api.post("/admin/templates/bulk", payload);
}

export async function exportTemplates(): Promise<Blob> {
  const { data } = await api.get("/admin/templates/export", {
    responseType: "blob",
  });
  return data;
}

// Creators
export async function getPendingCreators() {
  const { data } = await api.get("/admin/creators/pending");
  return data.data;
}

export async function getAllCreators(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const { data } = await api.get(`/admin/creators${query}`);
  return data.data;
}

export async function approveCreator(id: string): Promise<void> {
  await api.post(`/admin/creators/${id}/approve`);
}

export async function rejectCreator(id: string, reason: string): Promise<void> {
  await api.post(`/admin/creators/${id}/reject`, { reason });
}

// User Management
export async function getUserStats(): Promise<AdminUserStats> {
  const { data } = await api.get("/admin/users/stats");
  return data.data;
}

export async function getUsers(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const { data } = await api.get(`/admin/users${query}`);
  return data.data;
}

export async function getUserById(id: string): Promise<AdminUserInfo> {
  const { data } = await api.get(`/admin/users/${id}`);
  return data.data;
}

export async function banUser(id: string, reason: string): Promise<void> {
  await api.post(`/admin/users/${id}/ban`, { reason });
}

export async function unbanUser(id: string): Promise<void> {
  await api.post(`/admin/users/${id}/unban`);
}

export async function changeUserRole(id: string, role: string): Promise<void> {
  await api.patch(`/admin/users/${id}/role`, { role });
}

// Categories
export async function updateCategory(
  id: string,
  payload: Record<string, unknown>,
) {
  const { data } = await api.patch(`/admin/categories/${id}`, payload);
  return data.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/admin/categories/${id}`);
}

export async function reorderCategories(order: string[]): Promise<void> {
  await api.post("/admin/categories/reorder", { order });
}
