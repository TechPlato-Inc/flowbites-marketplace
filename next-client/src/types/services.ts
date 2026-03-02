import type { User } from "./auth";
import type { Template } from "./templates";

export interface ServicePackage {
  _id: string;
  creatorId: User;
  templateId?: Template;
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number;
  deliveryDays: number;
  revisions: number;
  features: string[];
  requirements: string;
  thumbnail?: string;
  gallery?: string[];
  tags?: string[];
  isActive: boolean;
  stats: {
    orders: number;
    completed: number;
    revenue: number;
  };
  createdAt: string;
}

export interface ServiceOrder {
  _id: string;
  orderNumber: string;
  packageId: ServicePackage;
  buyerId: User;
  creatorId: User;
  assignedCreatorId?: User;
  templateId?: Template;
  packageName: string;
  price: number;
  deliveryDays: number;
  revisions: number;
  revisionsUsed: number;
  requirements: string;
  attachments: string[];
  isGenericRequest: boolean;
  status:
    | "requested"
    | "accepted"
    | "rejected"
    | "in_progress"
    | "delivered"
    | "revision_requested"
    | "completed"
    | "cancelled"
    | "disputed";
  deliveryFiles: string[];
  deliveryNote?: string;
  deliveredAt?: string;
  acceptedAt?: string;
  completedAt?: string;
  dueDate?: string;
  platformFee: number;
  creatorPayout: number;
  messages: ServiceMessage[];
  activityLog: ActivityLogEntry[];
  dispute?: {
    reason: string;
    openedBy: string | User;
    openedAt: string;
    resolution?: string;
    resolvedBy?: string | User;
    resolvedAt?: string;
    outcome?: "refund" | "release_payment" | "partial_refund" | "redo" | null;
  };
  createdAt: string;
}

export interface ActivityLogEntry {
  _id: string;
  action: string;
  performedBy: string | User;
  details: string;
  createdAt: string;
}

export interface ServiceMessage {
  _id: string;
  senderId: string | User;
  message: string;
  attachments?: string[];
  createdAt: string;
}
