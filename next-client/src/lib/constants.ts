/* ==========================================================================
   Flowbites Marketplace — Centralized Constants
   Consolidates magic strings previously duplicated across 10+ files
   ========================================================================== */

// ─── Platforms ───────────────────────────────────────────────────────────────

export const PLATFORMS = ['webflow', 'framer', 'wix'] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_LABELS: Record<Platform, string> = {
  webflow: 'Webflow',
  framer: 'Framer',
  wix: 'Wix Studio',
};

export const PLATFORM_COLORS: Record<Platform, string> = {
  webflow: 'bg-blue-600',
  framer: 'bg-purple-600',
  wix: 'bg-violet-600',
};

export const PLATFORM_BADGE_COLORS: Record<Platform, string> = {
  webflow: 'bg-blue-100 text-blue-700',
  framer: 'bg-purple-100 text-purple-700',
  wix: 'bg-amber-100 text-amber-700',
};

export const PLATFORM_ACCENTS: Record<string, {
  bg: string;
  border: string;
  activeBorder: string;
  text: string;
  ring: string;
}> = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   activeBorder: 'border-blue-500',   text: 'text-blue-600',   ring: 'ring-blue-500/20' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', activeBorder: 'border-purple-500', text: 'text-purple-600', ring: 'ring-purple-500/20' },
  amber:  { bg: 'bg-amber-50',  border: 'border-amber-200',  activeBorder: 'border-amber-500',  text: 'text-amber-600',  ring: 'ring-amber-500/20' },
};

// ─── User Roles ──────────────────────────────────────────────────────────────

export const USER_ROLES = ['buyer', 'creator', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

// ─── Template Statuses ───────────────────────────────────────────────────────

export const TEMPLATE_STATUSES = ['draft', 'pending', 'approved', 'rejected'] as const;
export type TemplateStatus = (typeof TEMPLATE_STATUSES)[number];

export const TEMPLATE_STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
] as const;

export const TEMPLATE_STATUS_BADGE: Record<string, 'success' | 'warning' | 'error' | 'neutral' | 'info'> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'error',
  draft: 'neutral',
};

// ─── Order Statuses ──────────────────────────────────────────────────────────

export const ORDER_STATUSES = ['pending', 'paid', 'failed'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_BADGE: Record<string, 'success' | 'warning' | 'error' | 'neutral' | 'info'> = {
  paid: 'success',
  pending: 'warning',
  failed: 'error',
};

// ─── Service Order Statuses ──────────────────────────────────────────────────

export const SERVICE_ORDER_STATUSES = [
  'requested', 'accepted', 'rejected', 'in_progress', 'delivered',
  'revision_requested', 'completed', 'cancelled', 'disputed',
] as const;
export type ServiceOrderStatus = (typeof SERVICE_ORDER_STATUSES)[number];

export const SERVICE_ORDER_STATUS_CONFIG: Record<string, {
  label: string;
  variant: 'info' | 'warning' | 'success' | 'error' | 'neutral';
}> = {
  requested:          { label: 'Requested',          variant: 'info' },
  accepted:           { label: 'Accepted',           variant: 'info' },
  rejected:           { label: 'Rejected',           variant: 'error' },
  in_progress:        { label: 'In Progress',        variant: 'warning' },
  delivered:          { label: 'Delivered',           variant: 'success' },
  revision_requested: { label: 'Revision Requested', variant: 'warning' },
  completed:          { label: 'Completed',          variant: 'success' },
  cancelled:          { label: 'Cancelled',          variant: 'neutral' },
  disputed:           { label: 'Disputed',           variant: 'error' },
};

// ─── Combined Status Badge (for dashboards) ─────────────────────────────────

export const COMBINED_STATUS_BADGE: Record<string, 'success' | 'warning' | 'error' | 'neutral' | 'info'> = {
  approved: 'success',
  pending: 'warning',
  draft: 'neutral',
  rejected: 'error',
  completed: 'success',
  delivered: 'success',
  in_progress: 'info',
  accepted: 'info',
  requested: 'warning',
  revision_requested: 'warning',
  cancelled: 'neutral',
  disputed: 'error',
  paid: 'success',
  failed: 'error',
};

// ─── Activity Log Icons ──────────────────────────────────────────────────────

export const ACTIVITY_ICONS: Record<string, string> = {
  order_created: '\u{1F4DD}',
  status_accepted: '\u2705',
  status_in_progress: '\u{1F528}',
  status_delivered: '\u{1F4E6}',
  status_completed: '\u{1F389}',
  status_rejected: '\u274C',
  revision_requested: '\u{1F504}',
  order_cancelled: '\u{1F6AB}',
  dispute_opened: '\u26A0\uFE0F',
  dispute_resolved: '\u2696\uFE0F',
  creator_assigned: '\u{1F464}',
  price_set: '\u{1F4B0}',
};

// ─── License Types ───────────────────────────────────────────────────────────

export const LICENSE_TYPES = [
  { value: 'personal' as const, label: 'Personal', description: 'For personal, non-commercial projects' },
  { value: 'commercial' as const, label: 'Commercial', description: 'For client work and commercial use' },
  { value: 'extended' as const, label: 'Extended', description: 'Unlimited usage including resale' },
] as const;

// ─── Service Categories ──────────────────────────────────────────────────────

export const SERVICE_CATEGORIES = [
  'webflow-development',
  'framer-development',
  'wix-development',
  'custom-design',
  'migration',
  'other',
] as const;
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  'webflow-development': 'Webflow Development',
  'framer-development': 'Framer Development',
  'wix-development': 'Wix Development',
  'custom-design': 'Custom Design',
  'migration': 'Migration',
  'other': 'Other',
};

// ─── Onboarding Statuses ─────────────────────────────────────────────────────

export const ONBOARDING_STATUSES = ['pending', 'in_progress', 'submitted', 'approved', 'rejected'] as const;
export type OnboardingStatus = (typeof ONBOARDING_STATUSES)[number];

// ─── Sort Options ────────────────────────────────────────────────────────────

export const TEMPLATE_SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Popular', value: 'popular' },
  { label: 'Price: Low', value: 'price_low' },
  { label: 'Price: High', value: 'price_high' },
] as const;

export const ADMIN_SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Most Views', value: 'most_views' },
  { label: 'Most Purchases', value: 'most_purchases' },
  { label: 'Price High', value: 'price_high' },
  { label: 'Price Low', value: 'price_low' },
  { label: 'Most Revenue', value: 'most_revenue' },
] as const;

// ─── Delivery Helpers ────────────────────────────────────────────────────────

export function getDeliveryType(platform: Platform): 'clone_link' | 'remix_link' | 'file_download' {
  if (platform === 'webflow') return 'clone_link';
  if (platform === 'framer') return 'remix_link';
  return 'file_download';
}

export function getDeliveryLabel(platform: Platform, deliveryType?: string, hasFile?: boolean): string {
  if (platform === 'webflow' || deliveryType === 'clone_link') return 'Clone to Webflow';
  if (platform === 'framer' || deliveryType === 'remix_link') return 'Remix in Framer';
  if (platform === 'wix') return hasFile ? 'Download Files' : 'Request Files';
  return 'Access Template';
}

export function getAccessLabel(platform: Platform): string {
  if (platform === 'webflow') return 'clones';
  if (platform === 'framer') return 'remixes';
  return 'accesses';
}
