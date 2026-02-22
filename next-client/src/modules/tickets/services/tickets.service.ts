import { api } from "@/lib/api/client";
import type { SupportTicket, TicketStats } from "@/types";

interface TicketListResponse {
  tickets: SupportTicket[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

// User routes
export async function createTicket(payload: {
  subject: string;
  category: string;
  message: string;
  priority?: string;
}): Promise<SupportTicket> {
  const { data } = await api.post("/tickets", payload);
  return data.data;
}

export async function getMyTickets(
  params?: Record<string, string>,
): Promise<TicketListResponse> {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const { data } = await api.get(`/tickets/my${query}`);
  return data.data;
}

export async function getTicketById(id: string): Promise<SupportTicket> {
  const { data } = await api.get(`/tickets/${id}`);
  return data.data;
}

export async function addReply(
  id: string,
  message: string,
): Promise<SupportTicket> {
  const { data } = await api.post(`/tickets/${id}/reply`, { message });
  return data.data;
}

export async function closeTicket(id: string): Promise<SupportTicket> {
  const { data } = await api.post(`/tickets/${id}/close`);
  return data.data;
}

// Admin routes
export async function adminGetAllTickets(
  params?: Record<string, string>,
): Promise<TicketListResponse> {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const { data } = await api.get(`/tickets/admin/all${query}`);
  return data.data;
}

export async function adminGetTicketStats(): Promise<TicketStats> {
  const { data } = await api.get("/tickets/admin/stats");
  return data.data;
}

export async function adminAssignTicket(
  id: string,
  assignToId: string,
): Promise<SupportTicket> {
  const { data } = await api.post(`/tickets/admin/${id}/assign`, {
    assignToId,
  });
  return data.data;
}

export async function adminResolveTicket(id: string): Promise<SupportTicket> {
  const { data } = await api.post(`/tickets/admin/${id}/resolve`);
  return data.data;
}
