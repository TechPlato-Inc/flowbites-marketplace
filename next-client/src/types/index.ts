export interface User {
  _id: string;
  email: string;
  name: string;
  role: "buyer" | "creator" | "admin";
  avatar?: string;
  createdAt: string;
}

export interface Template {
  _id: string;
  title: string;
  slug: string;
  description: string;
  platform: "webflow" | "framer" | "wix";
  deliveryType?: "clone_link" | "remix_link" | "file_download";
  deliveryUrl?: string;
  price: number;
  salePrice?: number | null;
  thumbnail: string;
  gallery: string[];
  category: Category;
  tags: Tag[];
  creatorId: string;
  creatorProfileId: CreatorProfile;
  status: "draft" | "pending" | "approved" | "rejected";
  madeByFlowbites: boolean;
  isFeatured: boolean;
  licenseType?: "personal" | "commercial" | "extended";
  version?: string;
  stats: {
    views: number;
    purchases: number;
    revenue: number;
    likes: number;
    downloads: number;
    averageRating?: number;
    totalReviews?: number;
  };
  templateFile?: string;
  demoUrl?: string;
  rejectionReason?: string;
  metaDescription?: string;
  keywords?: string[];
  moderatedBy?: string | { name: string };
  moderatedAt?: string;
  changeLog?: {
    editedAt: string;
    editedBy: string;
    changes: { field: string; oldValue: any; newValue: any }[];
    reason: string;
  }[];
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  templateCount?: number;
  isActive?: boolean;
  order?: number;
}

export interface Tag {
  _id: string;
  name: string;
  slug: string;
}

export interface CreatorProfile {
  _id: string;
  userId: string | User;
  displayName: string;
  username: string;
  bio?: string;
  avatar?: string;
  website?: string;
  twitter?: string;
  dribbble?: string;
  github?: string;
  portfolio?: string;
  coverImage?: string;
  isVerified: boolean;
  isFeatured: boolean;
  isOfficial?: boolean;
  onboarding?: {
    status: "pending" | "in_progress" | "submitted" | "approved" | "rejected";
    submittedAt?: string;
    reviewedAt?: string;
    rejectionReason?: string;
  };
  stats: {
    totalSales: number;
    totalRevenue: number;
    templateCount: number;
    averageRating: number;
    totalReviews: number;
    followers: number;
  };
}

export interface Order {
  _id: string;
  orderNumber: string;
  buyerId: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "paid" | "failed";
  createdAt: string;
  paidAt?: string;
}

export interface OrderItem {
  type: "template" | "service";
  templateId?: Template;
  title: string;
  price: number;
}

export interface License {
  _id: string;
  licenseKey: string;
  templateId: Template;
  orderId: string;
  accessCount: number;
  maxAccesses: number;
  /** @deprecated Use accessCount */
  downloadCount: number;
  /** @deprecated Use maxAccesses */
  maxDownloads: number;
  createdAt: string;
}

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

export interface UIShot {
  _id: string;
  title: string;
  description?: string;
  image: string;
  creatorId: User;
  templateId?: Template;
  tags: string[];
  stats: {
    views: number;
    likes: number;
    saves: number;
  };
  createdAt: string;
}

export interface Review {
  _id: string;
  templateId: string;
  buyerId: { _id: string; name: string; avatar?: string };
  orderId: string;
  rating: number;
  title: string;
  comment: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummary {
  average: number;
  total: number;
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
}

export interface Notification {
  _id: string;
  userId: string;
  type:
    | "order_paid"
    | "order_refunded"
    | "order_expired"
    | "template_approved"
    | "template_rejected"
    | "review_received"
    | "review_moderated"
    | "creator_approved"
    | "creator_rejected"
    | "refund_approved"
    | "refund_rejected"
    | "service_order_update"
    | "withdrawal_approved"
    | "withdrawal_rejected"
    | "withdrawal_completed"
    | "ticket_reply"
    | "ticket_resolved"
    | "report_resolved"
    | "new_follower"
    | "payment_failed"
    | "system";
  title: string;
  message: string;
  link?: string;
  read: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface WishlistItem {
  _id: string;
  userId: string;
  templateId: Template;
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  perUserLimit: number;
  applicableTo: "all" | "templates" | "services";
  specificTemplates?: string[];
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface CouponValidation {
  valid: boolean;
  discount: number;
  finalAmount: number;
  coupon: {
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
  };
}

export interface FollowerInfo {
  _id: string;
  followerId: string | User;
  creatorId: string | CreatorProfile;
  createdAt: string;
}

export interface TemplateVersion {
  _id: string;
  templateId: string;
  version: string;
  releaseNotes?: string;
  changes: string[];
  templateFile?: string;
  fileSize?: number;
  publishedBy: { _id: string; name: string };
  createdAt: string;
}

export interface EarningsSummary {
  totalEarnings: number;
  monthlyBreakdown: {
    month: string;
    earnings: number;
    orderCount: number;
  }[];
  topTemplates: {
    templateId: string;
    title: string;
    earnings: number;
    sales: number;
  }[];
}

export interface EarningsTransaction {
  _id: string;
  orderNumber: string;
  templateTitle: string;
  amount: number;
  platformFee: number;
  creatorPayout: number;
  status: string;
  createdAt: string;
}

export interface UserSettings {
  name: string;
  bio?: string;
  avatar?: string;
}

export interface EmailPreferences {
  orderConfirmation: boolean;
  reviewNotification: boolean;
  followerNotification: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;
}

export interface AdminUserInfo {
  _id: string;
  name: string;
  email: string;
  role: "buyer" | "creator" | "admin";
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

export interface ContentReport {
  _id: string;
  reporterId: { _id: string; name: string; email: string; avatar?: string };
  targetType: "template" | "review" | "creator" | "user";
  targetId: string;
  reason:
    | "spam"
    | "inappropriate_content"
    | "copyright_violation"
    | "fake_review"
    | "misleading"
    | "offensive"
    | "scam"
    | "other";
  description: string;
  status: "pending" | "reviewing" | "resolved" | "dismissed";
  priority: "low" | "medium" | "high";
  adminNote?: string;
  resolvedBy?: { _id: string; name: string };
  resolvedAt?: string;
  actionTaken?:
    | "none"
    | "content_removed"
    | "user_warned"
    | "user_banned"
    | "other";
  createdAt: string;
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

export interface Withdrawal {
  _id: string;
  creatorId:
    | string
    | { _id: string; name: string; email: string; avatar?: string };
  amount: number;
  currency: string;
  status: "pending" | "approved" | "processing" | "completed" | "rejected";
  payoutMethod: "stripe_connect" | "bank_transfer" | "paypal";
  note?: string;
  adminNote?: string;
  processedBy?: { _id: string; name: string };
  processedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface WithdrawalBalance {
  totalEarnings: number;
  totalWithdrawn: number;
  availableBalance: number;
  pendingWithdrawals: number;
}

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

export interface ReportStats {
  total: number;
  pending: number;
  byReason: Record<string, number>;
}

export interface TicketStats {
  total: number;
  open: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
}
