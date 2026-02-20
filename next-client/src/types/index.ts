export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'buyer' | 'creator' | 'admin';
  avatar?: string;
  createdAt: string;
}

export interface Template {
  _id: string;
  title: string;
  slug: string;
  description: string;
  platform: 'webflow' | 'framer' | 'wix';
  deliveryType?: 'clone_link' | 'remix_link' | 'file_download';
  deliveryUrl?: string;
  price: number;
  thumbnail: string;
  gallery: string[];
  category: Category;
  tags: Tag[];
  creatorId: string;
  creatorProfileId: CreatorProfile;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  madeByFlowbites: boolean;
  isFeatured: boolean;
  licenseType?: 'personal' | 'commercial' | 'extended';
  version?: string;
  stats: {
    views: number;
    purchases: number;
    revenue: number;
    likes: number;
    downloads: number;
  };
  templateFile?: string;
  demoUrl?: string;
  rejectionReason?: string;
  metaDescription?: string;
  keywords?: string[];
  moderatedBy?: string | { name: string };
  moderatedAt?: string;
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
  onboarding?: {
    status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
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
  status: 'pending' | 'paid' | 'failed';
  createdAt: string;
  paidAt?: string;
}

export interface OrderItem {
  type: 'template' | 'service';
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
  status: 'requested' | 'accepted' | 'rejected' | 'in_progress' | 'delivered' | 'revision_requested' | 'completed' | 'cancelled' | 'disputed';
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
    outcome?: 'refund' | 'release_payment' | 'partial_refund' | 'redo' | null;
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
