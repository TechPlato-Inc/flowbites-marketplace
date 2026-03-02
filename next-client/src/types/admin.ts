export interface AdminUserInfo {
  _id: string;
  name: string;
  email: string;
  role: "buyer" | "creator" | "admin" | "super_admin";
  avatar?: string;
  isActive: boolean;
  isBanned: boolean;
  bannedAt?: string;
  bannedBy?: string;
  createdAt: string;
}

export interface AdminUserStats {
  total: number;
  byRole: Record<string, number>;
  banned: number;
  recentSignups: number;
}

export interface AdminDashboardStats {
  users: {
    total: number;
    creators: number;
    pendingCreatorApplications: number;
  };
  templates: {
    byStatus: Record<string, number>;
    total: number;
  };
  orders: {
    total: number;
    revenue: number;
  };
  refunds: {
    byStatus: Record<string, { count: number; total: number }>;
    pendingCount: number;
    totalRefunded: number;
  };
  reviews: {
    total: number;
    pendingModeration: number;
  };
  notifications: {
    totalSent: number;
  };
  followers: {
    totalFollows: number;
  };
  coupons: {
    active: number;
  };
}

export interface AuditLogEntry {
  _id: string;
  adminId: { _id: string; name: string; email: string };
  action: string;
  targetType: string;
  targetId?: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}
