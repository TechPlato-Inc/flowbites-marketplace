import type { CreatorProfile } from "./creators";

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
    changes: { field: string; oldValue: unknown; newValue: unknown }[];
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
