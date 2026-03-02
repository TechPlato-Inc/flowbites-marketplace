export interface SupportTicket {
  _id: string;
  userId: { _id: string; name: string; email: string; avatar?: string };
  subject: string;
  category:
    | "billing"
    | "technical"
    | "account"
    | "template"
    | "refund"
    | "other";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "waiting_on_user" | "resolved" | "closed";
  messages: TicketMessage[];
  assignedTo?: { _id: string; name: string };
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  _id: string;
  senderId: { _id: string; name: string; avatar?: string };
  message: string;
  isStaffReply: boolean;
  createdAt: string;
}

export interface TicketStats {
  total: number;
  open: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
}
