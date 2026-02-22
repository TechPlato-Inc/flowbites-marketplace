import { api } from "@/lib/api/client";
import type { ContentReport, ReportStats } from "@/types";

interface ReportListResponse {
  reports: ContentReport[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

// User routes
export async function createReport(payload: {
  targetType: "template" | "review" | "creator" | "user";
  targetId: string;
  reason: string;
  description: string;
}): Promise<ContentReport> {
  const { data } = await api.post("/reports", payload);
  return data.data;
}

// Admin routes
export async function adminGetReports(
  params?: Record<string, string>,
): Promise<ReportListResponse> {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const { data } = await api.get(`/reports/admin${query}`);
  return data.data;
}

export async function adminGetReportStats(): Promise<ReportStats> {
  const { data } = await api.get("/reports/admin/stats");
  return data.data;
}

export async function adminGetReportById(id: string): Promise<ContentReport> {
  const { data } = await api.get(`/reports/admin/${id}`);
  return data.data;
}

export async function adminResolveReport(
  id: string,
  payload: { actionTaken: string; adminNote?: string },
): Promise<ContentReport> {
  const { data } = await api.post(`/reports/admin/${id}/resolve`, payload);
  return data.data;
}

export async function adminDismissReport(
  id: string,
  payload?: { adminNote?: string },
): Promise<ContentReport> {
  const { data } = await api.post(
    `/reports/admin/${id}/dismiss`,
    payload || {},
  );
  return data.data;
}
