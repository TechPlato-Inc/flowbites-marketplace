import type { Template } from "./templates";

export interface Order {
  _id: string;
  orderNumber: string;
  buyerId: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  discount: number;
  couponCode?: string;
  status: "pending" | "paid" | "failed" | "refunded" | "expired";
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
  licenseType: "personal" | "commercial" | "extended";
  downloadCount: number;
  maxDownloads: number;
  isActive: boolean;
  lastDownloadedAt?: string;
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
