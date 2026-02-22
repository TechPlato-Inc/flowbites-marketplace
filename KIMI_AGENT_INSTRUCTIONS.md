# Kimi Agent Instructions — Flowbites Marketplace Frontend

**Lead Agent:** Claude Code (handles all backend + architecture decisions)
**Your Role:** Frontend UI development only
**Last Updated:** 2026-02-20

## !! PHASE 2 — INTEGRATION & WIRING !!

Tasks A-G are DONE. Great work. Now you need to **verify and fix all wiring** — make sure every component you built is actually reachable by users.

---

## YOUR WORK QUEUE — PHASE 2 (do in this exact order)

### Task H: Verify Dashboard Wiring (CRITICAL)

Check and fix ALL of these integrations. If any are missing, add them:

1. **Admin Dashboard** (`next-client/src/modules/dashboard/admin/`)
   - Verify "Refunds" nav item exists and renders `<RefundManagement />`
   - Verify "Reviews" nav item exists and renders `<ReviewModeration />`
   - If the admin dashboard has a sidebar/tab navigation, make sure both items appear there
   - Import paths must be correct

2. **Buyer Dashboard** (`next-client/src/modules/dashboard/buyer/`)
   - Verify "Wishlist" nav item exists and renders `<WishlistView />`
   - Verify "Request Refund" button appears on paid orders (using `<RefundRequestModal />`)
   - Verify refund status badge shows on orders that have refund requests

3. **Creator Dashboard** (`next-client/src/modules/dashboard/creator/`)
   - Verify "Analytics" nav item renders `<AnalyticsView />`
   - The analytics view type should be in the View union type

4. **Header** (`next-client/src/components/Header.tsx` or `Navbar.tsx` or wherever top nav lives)
   - Verify `<NotificationBell />` is rendered next to user avatar/menu (only when logged in)
   - Make sure the import path is correct

5. **Template Listing Page** (`next-client/src/modules/templates/components/TemplateListingContent.tsx`)
   - Verify `<SearchBar />` is integrated into the template browse page
   - Should appear at the top of the filter/listing area

### Task I: Create Missing Page Routes

Make sure these pages exist in the Next.js App Router:

1. **`next-client/app/(dashboard)/dashboard/notifications/page.tsx`** (or wherever dashboard routes are)
   - Renders `<NotificationList />` as a full page
   - The "View all" link in NotificationBell should navigate here

2. **`next-client/app/(dashboard)/dashboard/buyer/wishlist/page.tsx`** (if wishlist is a separate page)
   - OR integrate it as a tab within BuyerDashboardView — whichever fits the existing pattern
   - Check how other buyer dashboard sections are routed and follow that pattern

### Task J: Toast/Feedback System

Add user feedback for key actions (if not already done):

1. When a review is submitted → show success toast/message
2. When a wishlist item is added/removed → show brief confirmation
3. When a refund is requested → show success message
4. When admin approves/rejects a refund → show confirmation
5. When "Mark all as read" is clicked → show brief confirmation

Use whatever toast/notification pattern already exists in the project. If none exists, create a simple one:
- `next-client/src/design-system/Toast.tsx` — a simple toast component
- Auto-dismiss after 3 seconds
- Success (green) and error (red) variants
- Position: bottom-right

### Task K: Polish & Edge Cases

1. **Loading skeletons** — Replace plain spinners with skeleton loaders in:
   - ReviewList (skeleton review cards)
   - WishlistView (skeleton template cards)
   - NotificationList (skeleton notification rows)

2. **Error states** — Add error UI (retry button + message) when API calls fail in:
   - ReviewList
   - WishlistView
   - NotificationList
   - AnalyticsView

3. **Responsive check** — Make sure all new components look good on mobile (375px width):
   - NotificationBell dropdown shouldn't overflow on mobile
   - RefundManagement table should be horizontally scrollable on mobile
   - ReviewModeration cards should stack on mobile

**DO ALL TASKS (H → S → T → W) without stopping.**

---

## PHASE 4 — NEW FEATURE UIs (4 new tasks)

### Task P: Coupon/Discount Code UI

Build the UI for applying coupons at checkout and managing them in admin.

**Files to create:**

1. **`next-client/src/modules/checkout/components/CouponInput.tsx`** (new)
   - Text input + "Apply" button
   - On submit: `POST /api/coupons/validate` with `{ code, orderAmount, itemType }`
   - Shows success state with discount info (original price, discount, final price)
   - Shows error state if invalid
   - "Remove" button to clear applied coupon
   - Props: `orderAmount: number`, `itemType: 'templates' | 'services'`, `onApply: (discount) => void`, `onRemove: () => void`

2. **`next-client/src/modules/dashboard/admin/components/CouponManagement.tsx`** (new)
   - Table listing all coupons: `GET /api/coupons/admin`
   - Columns: code, type (% / $), value, usage count/limit, status, dates
   - Create coupon modal: `POST /api/coupons/admin`
   - Edit coupon: `PATCH /api/coupons/admin/:couponId`
   - Delete coupon: `DELETE /api/coupons/admin/:couponId`
   - Toggle active/inactive

3. **Modify Checkout page** — Integrate `<CouponInput />` before the payment summary
4. **Modify `AdminDashboardView.tsx`** — Add "Coupons" nav item + render CouponManagement

**Coupon API endpoints:**
```
POST   /api/coupons/validate           → { valid, discount, finalAmount, coupon }
GET    /api/coupons/admin              → { coupons[], pagination }
POST   /api/coupons/admin              → Coupon
PATCH  /api/coupons/admin/:couponId   → Coupon
DELETE /api/coupons/admin/:couponId   → { deleted: true }
```

**Types (in `types/index.ts`):**
```typescript
interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  perUserLimit: number;
  applicableTo: 'all' | 'templates' | 'services';
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

interface CouponValidation {
  valid: boolean;
  discount: number;
  finalAmount: number;
  coupon: { code: string; discountType: string; discountValue: number };
}
```

### Task Q: Creator Follow/Unfollow UI

**Files to create:**

1. **`next-client/src/modules/creators/components/FollowButton.tsx`** (new)
   - Button toggles between "Follow" and "Following"
   - Follow: `POST /api/followers/:creatorId`
   - Unfollow: `DELETE /api/followers/:creatorId`
   - Check initial state: `GET /api/followers/check/:creatorId`
   - Shows follower count next to button
   - Optimistic UI — toggle immediately, revert on error

2. **`next-client/src/modules/dashboard/buyer/components/FollowingList.tsx`** (new)
   - List of creators the user follows: `GET /api/followers/following`
   - Shows creator avatar, name, template count, unfollow button
   - Empty state: "You're not following any creators yet" + "Browse Creators" CTA

3. **Modify `next-client/src/modules/creators/components/CreatorProfileView.tsx`**
   - Add `<FollowButton />` next to the creator name/bio
   - Show follower count: `GET /api/followers/count/:creatorId`

4. **Modify Buyer Dashboard** — Add "Following" nav item or tab that renders `<FollowingList />`

**Follower API endpoints:**
```
GET    /api/followers/count/:creatorId → { count }       (public)
GET    /api/followers/check/:creatorId → { following: boolean } (auth)
GET    /api/followers/following        → { following[], pagination }  (auth)
POST   /api/followers/:creatorId       → Follower         (auth)
DELETE /api/followers/:creatorId       → { unfollowed: true } (auth)
```

### Task R: Template Version History UI

**Files to create:**

1. **`next-client/src/modules/templates/components/VersionHistory.tsx`** (new)
   - Accordion or timeline showing all versions for a template
   - Each version: version number, date, release notes, list of changes
   - Latest version highlighted at top
   - Fetch: `GET /api/templates/:templateId/versions`

2. **`next-client/src/modules/dashboard/creator/components/PublishVersionModal.tsx`** (new)
   - Modal to publish a new version
   - Fields: version number (Input), release notes (textarea), changes (dynamic list of text inputs)
   - Submit: `POST /api/templates/:templateId/versions`

3. **Modify `TemplateDetailView.tsx`** — Add a "Version History" section/tab using `<VersionHistory />`
4. **Modify Creator Dashboard template edit view** — Add "Publish New Version" button that opens `<PublishVersionModal />`

**Version API endpoints:**
```
GET    /api/templates/:templateId/versions        → { versions[], pagination }
GET    /api/templates/:templateId/versions/latest → TemplateVersion
POST   /api/templates/:templateId/versions        → TemplateVersion (auth, creator)
DELETE /api/templates/:templateId/versions/:ver   → { deleted: true } (auth, creator)
```

**Type (in `types/index.ts`):**
```typescript
interface TemplateVersion {
  _id: string;
  templateId: string;
  version: string;
  releaseNotes?: string;
  changes: string[];
  publishedBy: { _id: string; name: string };
  createdAt: string;
}
```

### Task S: Admin Dashboard Stats Overview

**Files to create:**

1. **`next-client/src/modules/dashboard/admin/components/DashboardOverview.tsx`** (new)
   - Stat cards grid showing key metrics: `GET /api/admin/dashboard-stats`
   - Cards: Total Users, Verified Creators, Pending Applications, Total Orders, Revenue, Pending Refunds, Reviews to Moderate, Active Coupons, Total Followers
   - Use number formatting (1234 → 1,234) and currency formatting ($12,345.00)
   - Color-coded cards (success for revenue, warning for pending items, etc.)
   - Make it the default view when admin opens dashboard

2. **Modify `AdminDashboardView.tsx`** — Add "Overview" as the first/default nav item, render `<DashboardOverview />`

**Stats API endpoint:**
```
GET /api/admin/dashboard-stats → AdminDashboardStats (see types/index.ts)
```

---

## PHASE 3 — UI POLISH & UX IMPROVEMENTS (4 new tasks)

### Task L: Empty State Illustrations

Create consistent empty states across all new pages. Each should have:
- A large lucide icon (size 48, `text-neutral-300`)
- A headline (`text-lg font-semibold text-neutral-700`)
- A description (`text-sm text-neutral-500`)
- An optional CTA button

Apply these to:
1. **WishlistView** — empty wishlist: Heart icon + "Your wishlist is empty" + "Browse Templates" button
2. **NotificationList** — no notifications: Bell icon + "You're all caught up!" + no button needed
3. **ReviewList** — no reviews: MessageSquare icon + "No reviews yet" + "Be the first to review" button (only if buyer owns template)
4. **RefundManagement** — no refunds: Shield icon + "No refund requests"
5. **ReviewModeration** — no reviews to moderate: CheckCircle icon + "All reviews moderated"
6. **AnalyticsView** — no data: BarChart3 icon + "No analytics data yet" + "Publish your first template to see stats"

### Task M: Keyboard Accessibility

Make all interactive components keyboard-accessible:

1. **NotificationBell** dropdown:
   - Open with Enter/Space
   - Navigate items with arrow keys
   - Close with Escape
   - Focus trap inside dropdown when open

2. **StarRating** interactive mode:
   - Arrow Left/Right to change rating
   - Enter to confirm

3. **WishlistButton**:
   - Enter/Space to toggle
   - aria-label="Add to wishlist" / "Remove from wishlist"

4. **SearchBar**:
   - Already has keyboard nav — verify it works correctly
   - Escape should close the dropdown AND clear focus

5. **All modals** (RefundRequestModal, etc.):
   - Focus trap when open
   - Close on Escape
   - Focus returns to trigger element on close

### Task N: Optimistic UI Updates

Make these interactions feel instant:

1. **WishlistButton** — toggle heart immediately on click, revert if API fails
2. **NotificationBell** mark as read — mark item as read in UI immediately, revert on API failure
3. **ReviewForm** — disable submit button and show spinner only (don't clear form until API confirms success)

Pattern:
```tsx
const handleToggle = async () => {
  const prev = wishlisted;
  setWishlisted(!prev); // Optimistic
  try {
    await api[wishlisted ? 'delete' : 'post'](`/wishlists/${templateId}`);
  } catch {
    setWishlisted(prev); // Revert
  }
};
```

### Task O: SEO Meta Tags

Add proper meta tags to new pages:

1. **Template Detail page** — already exists, but verify it has:
   - `<title>` with template name
   - Open Graph tags (og:title, og:description, og:image using template thumbnail)
   - Twitter card tags

2. **Notifications page** — add metadata:
   ```tsx
   export const metadata: Metadata = {
     title: 'Notifications — Flowbites',
     description: 'View your notifications and updates.',
   };
   ```

3. **Wishlist page** — add metadata:
   ```tsx
   export const metadata: Metadata = {
     title: 'My Wishlist — Flowbites',
     description: 'Templates you\'ve saved for later.',
   };
   ```

4. Check all new pages have proper `<title>` tags via Next.js metadata exports.

### NOW → Task A: Reviews Frontend (highest priority)
Create these files:
1. `next-client/src/modules/reviews/components/StarRating.tsx`
2. `next-client/src/modules/reviews/components/ReviewCard.tsx`
3. `next-client/src/modules/reviews/components/ReviewForm.tsx`
4. `next-client/src/modules/reviews/components/ReviewList.tsx`
5. `next-client/src/modules/reviews/services/reviews.service.ts`
6. Modify `next-client/src/modules/templates/components/TemplateDetailView.tsx` — add ReviewList + ReviewForm sections

### NEXT → Task C: Analytics Dashboard
1. Create `next-client/src/modules/dashboard/creator/components/AnalyticsView.tsx`
2. Modify `CreatorDashboardView.tsx` — add `'analytics'` to View type and render AnalyticsView

### LAST → Task B: Search Improvements
1. Create `next-client/src/modules/templates/components/SearchBar.tsx`
2. Modify `TemplateListingContent.tsx` — integrate SearchBar

**DO NOT WAIT. DO NOT ASK QUESTIONS. Just build using the API contracts and patterns below.**

---

## CRITICAL RULES

1. **NEVER edit any file inside `server/`** — Claude owns all backend code
2. **NEVER create new API endpoints** — Claude builds those
3. **NEVER modify `next-client/src/types/index.ts`** — Claude will add types, you import them
4. **DO NOT modify files Claude is actively working on** (see ownership table below)
5. **Follow existing patterns exactly** — don't introduce new libraries, state management, or patterns
6. **Use the design system components** — don't build custom buttons, badges, modals, etc.

---

## Project Overview

**Flowbites Marketplace** — A template marketplace where creators sell Webflow/Framer/Wix templates and services.

- **Frontend:** Next.js (App Router) — `next-client/`
- **Backend:** Express.js + MongoDB — `server/` (DO NOT TOUCH)
- **Styling:** Tailwind CSS with custom design tokens
- **State:** Zustand for auth, local state for everything else
- **Icons:** Lucide React (always import from `lucide-react`)
- **API Client:** Axios with auto-auth — import from `@/lib/api/client`

---

## Architecture & File Structure

```
next-client/
├── app/                          # Next.js App Router pages
│   ├── (public)/                 # Public routes (templates, services, creators)
│   ├── (auth)/                   # Auth routes (login, register, forgot-password)
│   ├── (dashboard)/              # Dashboard routes (admin, creator, buyer)
│   ├── (static)/                 # Static content pages
│   └── layout.tsx                # Root layout
├── src/
│   ├── design-system/            # Reusable UI components (Button, Badge, Card, etc.)
│   ├── components/               # Shared layout components (Header, Footer, Sidebar)
│   ├── lib/
│   │   ├── api/client.ts         # Axios API client (auto-auth, token refresh)
│   │   └── constants.ts          # All business constants (statuses, categories, etc.)
│   ├── modules/                  # Feature modules
│   │   ├── auth/components/      # Auth UI (LoginForm, RegisterForm, etc.)
│   │   ├── templates/
│   │   │   ├── components/       # Template UI (TemplateCard, TemplateDetailView, etc.)
│   │   │   └── services/         # API calls (templates.service.ts)
│   │   ├── services/components/  # Service marketplace UI
│   │   ├── creators/components/  # Creator profile UI
│   │   ├── dashboard/
│   │   │   ├── admin/            # Admin dashboard views
│   │   │   ├── buyer/            # Buyer dashboard view
│   │   │   └── creator/          # Creator dashboard view
│   │   ├── home/components/      # Homepage sections
│   │   └── blog/components/      # Blog UI
│   ├── stores/                   # Zustand stores (auth, cart)
│   └── types/index.ts            # All TypeScript interfaces (DO NOT MODIFY)
└── tailwind.config.ts            # Tailwind theme configuration
```

---

## Design System Components

Import from `@/design-system`:

### Button
```tsx
import { Button } from '@/design-system';

<Button variant="primary" size="sm" leftIcon={<Icon size={14} />} isLoading={loading}>
  Label
</Button>
```
- `variant`: `primary` | `secondary` | `outline` | `ghost` | `danger`
- `size`: `sm` | `md` | `lg`
- `leftIcon` / `rightIcon`: React node
- `isLoading`: boolean

### Badge
```tsx
import { Badge } from '@/design-system';

<Badge variant="success" size="sm">Approved</Badge>
```
- `variant`: `success` | `warning` | `error` | `info` | `neutral`
- `size`: `sm` | `md`

### Card
```tsx
import { Card } from '@/design-system';

<Card hover={true}>
  <Card.Image src={url} alt="title" badge={<Badge>Status</Badge>} />
  <Card.Content>
    <Card.Title>Title</Card.Title>
    <Card.Description>Description</Card.Description>
  </Card.Content>
</Card>
```

### Input
```tsx
import { Input } from '@/design-system';

<Input label="Email" error="Required" leftIcon={<Mail size={16} />} />
```

### Modal
```tsx
import { Modal } from '@/design-system';

<Modal isOpen={open} onClose={() => setOpen(false)} title="Title" size="md">
  Content
</Modal>
```
- `size`: `sm` | `md` | `lg` | `xl`

---

## API Client Usage

```tsx
import { api } from '@/lib/api/client';

// GET request
const { data } = await api.get('/reviews/template/123');

// POST request
const { data } = await api.post('/reviews/template/123', { rating: 5, comment: 'Great!' });

// PATCH request
const { data } = await api.patch('/reviews/456', { comment: 'Updated' });

// DELETE request
await api.delete('/reviews/456');
```

**Response shape** (all endpoints return):
```json
{
  "success": true,
  "data": { ... }
}
```

Always access data as `response.data.data` (axios wraps in `.data`, server wraps in `.data`).

---

## Color Theme (Tailwind Classes)

| Token | Example Classes | Use For |
|-------|----------------|---------|
| Primary (sky blue) | `text-primary-500`, `bg-primary-50`, `border-primary-200` | Actions, links, active states |
| Secondary (purple) | `text-secondary-500`, `bg-secondary-50` | Accents, highlights |
| Neutral (gray) | `text-neutral-500`, `bg-neutral-100`, `border-neutral-200` | Text, borders, backgrounds |
| Success (green) | `text-success`, `bg-success-light` | Positive states |
| Warning (amber) | `text-warning`, `bg-warning-light` | Caution states |
| Error (red) | `text-error`, `bg-error-light` | Error states |
| Info (blue) | `text-info`, `bg-info-light` | Information states |

**Typography:** `font-display` for headings (Manrope), default sans for body (Inter)

---

## Component Patterns to Follow

### View Component Template
```tsx
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { Button, Badge } from '@/design-system';
import { SomeIcon } from 'lucide-react';

export const MyFeatureView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/endpoint');
      setData(data.data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Content */}
    </div>
  );
};
```

### Page Component Template (App Router)
```tsx
import type { Metadata } from 'next';
import { MyFeatureView } from '@/modules/myfeature/components/MyFeatureView';

export const metadata: Metadata = {
  title: 'Page Title',
};

export default function MyPage() {
  return <MyFeatureView />;
}
```

### Service File Template
```tsx
import { api } from '@/lib/api/client';

export async function getReviews(templateId: string) {
  const { data } = await api.get(`/reviews/template/${templateId}`);
  return data.data;
}

export async function submitReview(templateId: string, payload: { rating: number; title: string; comment: string }) {
  const { data } = await api.post(`/reviews/template/${templateId}`, payload);
  return data.data;
}
```

---

## YOUR ASSIGNED TASKS

### Task A: Reviews & Ratings — Frontend

**Wait for Claude to finish the backend first.** Claude will add a `Review` type to `types/index.ts` and build all API endpoints. Once done, build:

**New files to create:**

1. **`next-client/src/modules/reviews/components/StarRating.tsx`**
   - Reusable star rating component (1-5 stars)
   - Two modes: display (read-only) and interactive (clickable)
   - Use `Star` icon from `lucide-react`
   - Display mode: filled/empty stars with rating number
   - Interactive mode: hover preview, click to select

2. **`next-client/src/modules/reviews/components/ReviewCard.tsx`**
   - Single review display card
   - Shows: buyer name, avatar, rating (StarRating), title, comment, date
   - Matches existing card styling (white bg, neutral-200 border, rounded-xl)

3. **`next-client/src/modules/reviews/components/ReviewForm.tsx`**
   - Form for submitting a review
   - Fields: StarRating (interactive), title (Input), comment (textarea)
   - Submit button (Button component)
   - Only visible to buyers who purchased the template
   - Shows success state after submission

4. **`next-client/src/modules/reviews/components/ReviewList.tsx`**
   - Lists all reviews for a template
   - Pagination or "load more" button
   - Average rating summary at top
   - Rating distribution bar chart (5 star: ##%, 4 star: ##%, etc.)
   - Empty state when no reviews

5. **`next-client/src/modules/reviews/services/reviews.service.ts`**
   - API service functions for all review endpoints (see API contract below)

**File to modify:**

6. **`next-client/src/modules/templates/components/TemplateDetailView.tsx`**
   - Add `<ReviewList />` section below the template description
   - Add `<ReviewForm />` for buyers who own the template
   - Import and use the review components

**API Endpoints (Claude will build these):**
```
GET  /api/reviews/template/:templateId         → { reviews: Review[], summary: { average, total, distribution } }
POST /api/reviews/template/:templateId         → Review (body: { rating, title, comment })
PATCH /api/reviews/:reviewId                   → Review (body: { rating?, title?, comment? })
DELETE /api/reviews/:reviewId                  → { message: 'Deleted' }
```

**Review type (will be added to types/index.ts by Claude):**
```typescript
interface Review {
  _id: string;
  templateId: string;
  buyerId: { _id: string; name: string; avatar?: string };
  rating: number;          // 1-5
  title: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface ReviewSummary {
  average: number;
  total: number;
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
}
```

---

### Task B: Search Improvements — Frontend

**Files to create/modify:**

1. **`next-client/src/modules/templates/components/SearchBar.tsx`** (new)
   - Full-text search input with debounced API call
   - Dropdown with search suggestions (template titles)
   - Uses existing `Input` component with `Search` icon
   - Keyboard navigation (arrow keys, enter to select)

2. **`next-client/src/modules/templates/components/TemplateListingContent.tsx`** (modify)
   - Integrate the new SearchBar
   - Enhance existing filters

---

### Task C: Analytics Dashboard — Frontend

**Files to create:**

1. **`next-client/src/modules/dashboard/creator/components/AnalyticsView.tsx`** (new)
   - Revenue chart (simple bar/line chart — use CSS/SVG, no chart library needed)
   - Top performing templates table
   - Sales over time summary
   - View/conversion metrics

2. **Modify `CreatorDashboardView.tsx`** — Wire the Analytics nav item to show AnalyticsView
   - The "Analytics" nav item already exists but does nothing
   - Add `'analytics'` to the View type
   - Render `<AnalyticsView />` when activeView is 'analytics'

---

### Task D: Refund Request UI (NEW — Claude just built the backend)

**Files to create:**

1. **`next-client/src/modules/dashboard/buyer/components/RefundRequestModal.tsx`** (new)
   - Modal with textarea for refund reason
   - Shows order details (order number, total, items)
   - Submit calls `POST /api/refunds/request` with `{ orderId, reason }`
   - Shows success/error state

2. **Modify `next-client/src/modules/dashboard/buyer/BuyerDashboardView.tsx`**
   - Add a "Request Refund" button on each paid order (only if no refund exists and within 14 days)
   - Check refund status: `GET /api/refunds/order/:orderId`
   - Show refund status badge if refund exists (requested/approved/rejected/processed)

3. **`next-client/src/modules/dashboard/admin/components/RefundManagement.tsx`** (new)
   - Table listing all refund requests: `GET /api/refunds/admin?status=requested`
   - Each row shows: order number, buyer, amount, reason, date
   - Approve button: `POST /api/refunds/admin/:refundId/approve`
   - Reject button (with optional note): `POST /api/refunds/admin/:refundId/reject`

4. **Modify `AdminDashboardView.tsx`** — Add "Refunds" nav item + render RefundManagement

**Refund API endpoints:**
```
POST /api/refunds/request              → { orderId, reason } — buyer requests refund
GET  /api/refunds/order/:orderId       → Refund | null — check refund status
GET  /api/refunds/admin                → { refunds[], pagination } — admin list
POST /api/refunds/admin/:id/approve    → Refund — admin approves
POST /api/refunds/admin/:id/reject     → { adminNote? } — admin rejects
```

**Refund statuses:** `requested` | `approved` | `rejected` | `processed`

---

### Task E: Admin Review Moderation UI (NEW)

**Files to create:**

1. **`next-client/src/modules/dashboard/admin/components/ReviewModeration.tsx`** (new)
   - Table listing reviews: `GET /api/reviews/admin/all?status=pending`
   - Filter by status tabs (all, pending, approved, rejected)
   - Each row: template name, buyer name, rating (stars), title, comment preview
   - Approve button: `PATCH /api/reviews/admin/:reviewId/moderate` with `{ status: 'approved' }`
   - Reject button: `PATCH /api/reviews/admin/:reviewId/moderate` with `{ status: 'rejected', rejectionReason: '...' }`

2. **Modify `AdminDashboardView.tsx`** — Add "Reviews" nav item + render ReviewModeration

---

### Task F: Notification Bell UI (NEW — Claude just built the backend)

**Files to create:**

1. **`next-client/src/modules/notifications/components/NotificationBell.tsx`** (new)
   - Bell icon in the header with unread count badge
   - Clicking opens a dropdown showing recent notifications
   - Each notification shows: icon (based on type), title, message, time ago, read/unread state
   - "Mark all as read" button at top
   - "View all" link at bottom → goes to notifications page
   - Poll unread count every 30 seconds: `GET /api/notifications/unread-count`
   - Fetch notifications: `GET /api/notifications?limit=10`

2. **`next-client/src/modules/notifications/components/NotificationList.tsx`** (new)
   - Full notification page/view with all notifications
   - Filter tabs: All, Unread
   - Each row: icon, title, message, timestamp, read/unread dot
   - Click notification → mark as read + navigate to link
   - Mark as read: `PATCH /api/notifications/:id/read`
   - Mark all as read: `PATCH /api/notifications/read-all`
   - Delete: `DELETE /api/notifications/:id`
   - Pagination with "Load more" button

3. **Modify `next-client/src/components/Header.tsx`** (or wherever the top nav is)
   - Add `<NotificationBell />` next to the user avatar (only when logged in)

**Notification API endpoints:**
```
GET    /api/notifications              → { notifications[], unreadCount, pagination }
GET    /api/notifications/unread-count → { unreadCount }
PATCH  /api/notifications/:id/read    → notification
PATCH  /api/notifications/read-all    → { marked: number }
DELETE /api/notifications/:id         → { deleted: true }
```

**Notification type (in `types/index.ts`):**
```typescript
interface Notification {
  _id: string;
  type: 'order_paid' | 'order_refunded' | 'template_approved' | 'template_rejected'
    | 'review_received' | 'review_moderated' | 'creator_approved' | 'creator_rejected'
    | 'refund_approved' | 'refund_rejected' | 'service_order_update'
    | 'withdrawal_approved' | 'withdrawal_rejected' | 'withdrawal_completed'
    | 'ticket_reply' | 'ticket_resolved' | 'report_resolved'
    | 'new_follower' | 'order_expired' | 'payment_failed' | 'system';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}
```

**Type icons mapping:**
- `order_paid` → ShoppingBag (green)
- `template_approved` → CheckCircle (green)
- `template_rejected` → XCircle (red)
- `review_received` → Star (yellow)
- `refund_approved` → DollarSign (green)
- `refund_rejected` → DollarSign (red)
- `service_order_update` → Briefcase (blue)
- `system` → Bell (neutral)

---

### Task G: Wishlist / Favorites UI (NEW — Claude just built the backend)

**Files to create:**

1. **`next-client/src/modules/wishlists/components/WishlistButton.tsx`** (new)
   - Heart icon button (toggle)
   - Filled heart = wishlisted, outline = not wishlisted
   - Click to toggle: `POST /api/wishlists/:templateId` (add) or `DELETE /api/wishlists/:templateId` (remove)
   - Use `Heart` icon from lucide-react
   - Props: `templateId: string`, `initialWishlisted?: boolean`

2. **`next-client/src/modules/wishlists/components/WishlistView.tsx`** (new)
   - Full page view for buyer's wishlist
   - Grid of template cards (same TemplateCard component used elsewhere)
   - Each card has a remove button (WishlistButton in wishlisted state)
   - Empty state: "Your wishlist is empty" with CTA to browse templates
   - Fetch: `GET /api/wishlists`

3. **Modify `next-client/src/modules/templates/components/TemplateCard.tsx`**
   - Add `<WishlistButton />` in the top-right corner of the card (absolute positioned)
   - Only show when user is logged in

4. **Modify `next-client/src/modules/templates/components/TemplateDetailView.tsx`**
   - Add `<WishlistButton />` next to the "Buy" button
   - Show wishlist count: `GET /api/wishlists/count/:templateId`

5. **Modify Buyer Dashboard** — Add "Wishlist" nav item that renders `<WishlistView />`

**Wishlist API endpoints:**
```
GET    /api/wishlists                   → { items: WishlistItem[], pagination }
GET    /api/wishlists/check/:templateId → { wishlisted: boolean }
POST   /api/wishlists/check-bulk        → { wishlistedIds: string[] } (body: { templateIds })
POST   /api/wishlists/:templateId       → WishlistItem (add)
DELETE /api/wishlists/:templateId       → { removed: true }
GET    /api/wishlists/count/:templateId → { count: number } (public)
```

**WishlistItem type (in `types/index.ts`):**
```typescript
interface WishlistItem {
  _id: string;
  templateId: Template;
  createdAt: string;
}
```

---

## PHASE 5 — FINAL FEATURE UIs (4 new tasks)

### Task T: Creator Earnings Dashboard UI

Build the UI for creators to view their earnings, monthly revenue breakdown, and transaction history.

**Files to create:**

1. **`next-client/src/modules/dashboard/creator/components/EarningsDashboard.tsx`** (new)
   - Summary cards at top: Total Earnings ($), This Month ($), Top Template (name + $)
   - Monthly earnings bar chart (last 12 months) — use CSS/SVG bars, no chart library
   - Top performing templates table: template name, earnings, sales count
   - Fetch: `GET /api/earnings/summary`

2. **`next-client/src/modules/dashboard/creator/components/TransactionHistory.tsx`** (new)
   - Table of all transactions: order number, template title, amount, platform fee, creator payout, date
   - Pagination (page/limit query params): `GET /api/earnings/transactions?page=1&limit=20`
   - Filter by date range (optional)
   - Export-style layout (clean table)

3. **Modify `CreatorDashboardView.tsx`** — Add "Earnings" nav item that renders `<EarningsDashboard />` with `<TransactionHistory />` below it

**Earnings API endpoints:**
```
GET /api/earnings/summary        → { totalEarnings, monthlyBreakdown[], topTemplates[] }
GET /api/earnings/transactions   → { transactions[], pagination }
```

**Types (in `types/index.ts`):**
```typescript
interface EarningsSummary {
  totalEarnings: number;
  monthlyBreakdown: { month: string; earnings: number; orderCount: number }[];
  topTemplates: { templateId: string; title: string; earnings: number; sales: number }[];
}

interface EarningsTransaction {
  _id: string;
  orderNumber: string;
  templateTitle: string;
  amount: number;
  platformFee: number;
  creatorPayout: number;
  status: string;
  createdAt: string;
}
```

### Task U: User Settings & Preferences Page

Build a settings page for all users to manage their profile, password, and email preferences.

**Files to create:**

1. **`next-client/src/modules/settings/components/SettingsPage.tsx`** (new)
   - Tab navigation: Profile, Security, Email Preferences
   - Clean layout with card sections

2. **`next-client/src/modules/settings/components/ProfileSettings.tsx`** (new)
   - Edit name, bio, avatar
   - Avatar upload preview
   - Submit: `PATCH /api/settings/profile` with `{ name, bio, avatar }`
   - Success toast on save

3. **`next-client/src/modules/settings/components/SecuritySettings.tsx`** (new)
   - Change password form: current password, new password, confirm new password
   - Client-side validation (min 8 chars, passwords match)
   - Submit: `POST /api/settings/change-password` with `{ currentPassword, newPassword }`
   - Account deactivation section (danger zone) with confirmation modal
   - Deactivate: `POST /api/settings/deactivate` with `{ password }`

4. **`next-client/src/modules/settings/components/EmailPreferences.tsx`** (new)
   - Toggle switches for each preference:
     - Order confirmation emails
     - Review notification emails
     - New follower emails
     - Marketing emails
     - Weekly digest
   - Fetch: `GET /api/settings/email-preferences`
   - Save: `PATCH /api/settings/email-preferences` with preferences object
   - Auto-save on toggle (debounced)

5. **Create page route: `next-client/app/(dashboard)/dashboard/settings/page.tsx`**
   - Renders `<SettingsPage />`
   - Add "Settings" link to dashboard sidebar/nav (all user roles)

**Settings API endpoints:**
```
PATCH /api/settings/profile            → { user }
POST  /api/settings/change-password    → { message }
GET   /api/settings/email-preferences  → { preferences }
PATCH /api/settings/email-preferences  → { preferences }
POST  /api/settings/deactivate         → { message }
```

**Types (in `types/index.ts`):**
```typescript
interface UserSettings {
  name: string;
  bio?: string;
  avatar?: string;
}

interface EmailPreferences {
  orderConfirmation: boolean;
  reviewNotification: boolean;
  followerNotification: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;
}
```

### Task V: Admin User Management UI

Build the admin interface for managing all users — view, search, ban/unban, and change roles.

**Files to create:**

1. **`next-client/src/modules/dashboard/admin/components/UserManagement.tsx`** (new)
   - Stats cards at top: Total Users, By Role breakdown, Banned count, Recent Signups
   - Fetch stats: `GET /api/admin/users/stats`
   - User table with columns: avatar, name, email, role (badge), status (active/banned), joined date, actions
   - Fetch users: `GET /api/admin/users?page=1&limit=20&search=&role=&isActive=`
   - Search input (filter by name/email)
   - Role filter dropdown (all, buyer, creator, admin)
   - Status filter (all, active, banned)
   - Pagination

2. **`next-client/src/modules/dashboard/admin/components/UserDetailModal.tsx`** (new)
   - Modal showing full user details when clicking a row
   - User info: name, email, role, joined date, status
   - Actions:
     - Ban user: `POST /api/admin/users/:id/ban` — with confirmation dialog
     - Unban user: `POST /api/admin/users/:id/unban`
     - Change role: `PATCH /api/admin/users/:id/role` with `{ role }` — dropdown select
   - Shows ban status and who banned them

3. **Modify `AdminDashboardView.tsx`** — Add "Users" nav item that renders `<UserManagement />`

**User Management API endpoints:**
```
GET   /api/admin/users            → { users[], pagination }
GET   /api/admin/users/stats      → { total, byRole, banned, recentSignups }
GET   /api/admin/users/:id        → { user }
POST  /api/admin/users/:id/ban    → { user }
POST  /api/admin/users/:id/unban  → { user }
PATCH /api/admin/users/:id/role   → { user }
```

**Types (in `types/index.ts`):**
```typescript
interface AdminUserInfo {
  _id: string;
  name: string;
  email: string;
  role: 'buyer' | 'creator' | 'admin';
  avatar?: string;
  isActive: boolean;
  isBanned: boolean;
  bannedAt?: string;
  bannedBy?: string;
  createdAt: string;
}

interface AdminUserStats {
  total: number;
  byRole: Record<string, number>;
  banned: number;
  recentSignups: number;
}
```

### Task W: Search Autocomplete Integration

Upgrade the existing search to show live autocomplete suggestions as users type.

**Files to modify:**

1. **Modify `next-client/src/modules/templates/components/SearchBar.tsx`** (existing)
   - Add debounced autocomplete as user types (min 2 characters)
   - Fetch suggestions: `GET /api/search/autocomplete?q=<query>`
   - Show dropdown with up to 8 matching template titles
   - Keyboard navigation: arrow keys to select, Enter to go, Escape to close
   - Click suggestion → navigate to template detail page
   - Show "Popular Templates" when input is focused but empty: `GET /api/search/popular`

2. **`next-client/src/modules/templates/services/search.service.ts`** (new)
   - `getAutocomplete(query: string)` → calls `/api/search/autocomplete?q=`
   - `getPopularTemplates()` → calls `/api/search/popular`

**Search API endpoints:**
```
GET /api/search/autocomplete?q=<query>  → { suggestions: { _id, title, slug, thumbnail }[] }
GET /api/search/popular                  → { templates: { _id, title, slug, thumbnail, stats }[] }
```

---

## FILE OWNERSHIP TABLE

| File/Directory | Owner | Rule |
|----------------|-------|------|
| `server/` (everything) | Claude | Kimi: DO NOT TOUCH |
| `next-client/src/types/index.ts` | Claude | Kimi: READ ONLY, import types |
| `next-client/src/modules/reviews/` | Kimi | Claude: will not touch |
| `next-client/src/modules/notifications/` | Kimi | New notification components |
| `next-client/src/modules/wishlists/` | Kimi | New wishlist components |
| `next-client/src/modules/checkout/components/CouponInput.tsx` | Kimi | New coupon UI |
| `next-client/src/modules/creators/components/FollowButton.tsx` | Kimi | New follow button |
| `next-client/src/modules/dashboard/buyer/components/FollowingList.tsx` | Kimi | New following list |
| `next-client/src/modules/templates/components/VersionHistory.tsx` | Kimi | New version history |
| `next-client/src/modules/dashboard/creator/components/PublishVersionModal.tsx` | Kimi | New version publish |
| `next-client/src/modules/dashboard/admin/components/CouponManagement.tsx` | Kimi | New coupon admin |
| `next-client/src/modules/dashboard/admin/components/DashboardOverview.tsx` | Kimi | New admin overview |
| `next-client/src/modules/dashboard/admin/components/UserManagement.tsx` | Kimi | New user management |
| `next-client/src/modules/dashboard/admin/components/UserDetailModal.tsx` | Kimi | New user detail modal |
| `next-client/src/modules/dashboard/creator/components/EarningsDashboard.tsx` | Kimi | New earnings dashboard |
| `next-client/src/modules/dashboard/creator/components/TransactionHistory.tsx` | Kimi | New transaction history |
| `next-client/src/modules/settings/` | Kimi | New settings module |
| `next-client/src/modules/templates/services/search.service.ts` | Kimi | New search service |
| `next-client/src/modules/templates/components/SearchBar.tsx` | Kimi | Modify for autocomplete |
| `next-client/src/modules/templates/components/TemplateDetailView.tsx` | Kimi | Add reviews + report button |
| `next-client/src/modules/templates/components/TemplateListingContent.tsx` | Kimi | Enhance search |
| `next-client/src/modules/tickets/` | Kimi | New ticket module (Phase 6) |
| `next-client/src/modules/reports/` | Kimi | New report module (Phase 6) |
| `next-client/src/modules/dashboard/creator/components/WithdrawalPanel.tsx` | Kimi | New withdrawal panel |
| `next-client/src/modules/dashboard/creator/components/WithdrawalRequestModal.tsx` | Kimi | New withdrawal modal |
| `next-client/src/modules/dashboard/admin/components/TicketManagement.tsx` | Kimi | New admin tickets |
| `next-client/src/modules/dashboard/admin/components/ReportManagement.tsx` | Kimi | New admin reports |
| `next-client/src/modules/dashboard/admin/components/WithdrawalManagement.tsx` | Kimi | New admin withdrawals |
| `next-client/src/modules/dashboard/creator/CreatorDashboardView.tsx` | SHARED | Kimi: only add analytics view toggle |
| `next-client/src/modules/dashboard/creator/components/` | Kimi | New analytics components |
| `next-client/src/design-system/` | SHARED | Ask before modifying |
| `next-client/src/lib/constants.ts` | SHARED | Kimi: can add review-related constants only |

---

## EXECUTION ORDER (19 tasks total)

**Phase 1 (DONE):** A → B → C → D → E → F → G ✅
**Phase 2 (DONE):** H → I → J → K ✅
**Phase 3 (DONE):** L → M → N → O ✅
**Phase 4 (DONE):** P → Q → R → S ✅
**Phase 5 (DONE):** T → U → V → W ✅
**Phase 6 (DO NOW):** X → Y → Z → AA ← **YOUR CURRENT PRIORITY**

## !! PHASE 6 — NEW FEATURE UIs (4 tasks) — DO NOW !!

Claude just built 4 more backend systems. Build the frontend for them.

### Task X: Support Ticket System UI

Build the UI for users to submit support tickets and admins to manage them.

**Files to create:**

1. **`next-client/src/modules/tickets/components/TicketList.tsx`** (new)
   - User's ticket list with status badges (open, in_progress, waiting_on_user, resolved, closed)
   - Fetch: `GET /api/tickets/my?page=1&limit=20`
   - Each row: subject, category badge, status badge, last updated, message count
   - Click row → navigate to ticket detail

2. **`next-client/src/modules/tickets/components/CreateTicketModal.tsx`** (new)
   - Modal with form: subject (input), category (select), message (textarea), priority (select, optional)
   - Categories: general, billing, technical, account, report, other
   - Submit: `POST /api/tickets` with `{ subject, category, message, priority }`
   - Success → close modal and refresh list

3. **`next-client/src/modules/tickets/components/TicketDetail.tsx`** (new)
   - Threaded message view (chat-like layout)
   - User messages on left, staff messages on right (different bg colors)
   - Reply input at bottom: `POST /api/tickets/:id/reply` with `{ message }`
   - Close ticket button: `POST /api/tickets/:id/close`
   - Show ticket status, category, priority at top

4. **`next-client/src/modules/dashboard/admin/components/TicketManagement.tsx`** (new)
   - Admin view: all tickets with filters (status, category, priority)
   - Fetch: `GET /api/tickets/admin/all?status=&category=&priority=`
   - Stats cards: `GET /api/tickets/admin/stats`
   - Assign ticket: `POST /api/tickets/admin/:id/assign` with `{ assignToId }`
   - Resolve ticket: `POST /api/tickets/admin/:id/resolve`

5. **Create page route: `next-client/app/(dashboard)/dashboard/tickets/page.tsx`**
   - Renders `<TicketList />`
6. **Create page route: `next-client/app/(dashboard)/dashboard/tickets/[id]/page.tsx`**
   - Renders `<TicketDetail />`
7. **Modify dashboard sidebar** — Add "Support Tickets" link for all users
8. **Modify `AdminDashboardView.tsx`** — Add "Tickets" nav item + render TicketManagement

**Ticket API endpoints:**
```
POST   /api/tickets              → Ticket (body: { subject, category, message, priority? })
GET    /api/tickets/my           → { tickets[], pagination }
GET    /api/tickets/:id          → Ticket (with messages populated)
POST   /api/tickets/:id/reply    → Ticket (body: { message })
POST   /api/tickets/:id/close    → Ticket
GET    /api/tickets/admin/all    → { tickets[], pagination }
GET    /api/tickets/admin/stats  → { total, open, byStatus, byCategory }
POST   /api/tickets/admin/:id/assign  → Ticket (body: { assignToId })
POST   /api/tickets/admin/:id/resolve → Ticket
```

---

### Task Y: Content Reporting UI

Build the UI for users to report inappropriate content and admins to manage reports.

**Files to create:**

1. **`next-client/src/modules/reports/components/ReportButton.tsx`** (new)
   - Small button/icon (Flag icon from lucide-react) placed on templates, reviews, creator profiles
   - On click: opens ReportModal
   - Props: `targetType: 'template' | 'review' | 'creator' | 'user'`, `targetId: string`

2. **`next-client/src/modules/reports/components/ReportModal.tsx`** (new)
   - Modal with: reason (select), description (textarea)
   - Reasons: spam, inappropriate_content, copyright_violation, misleading, scam, harassment, other
   - Submit: `POST /api/reports` with `{ targetType, targetId, reason, description }`
   - Show success message after submit

3. **`next-client/src/modules/dashboard/admin/components/ReportManagement.tsx`** (new)
   - Admin report queue with filters (status, targetType, priority)
   - Fetch: `GET /api/reports/admin?status=pending&priority=`
   - Stats: `GET /api/reports/admin/stats`
   - Each row: target type, reason, reporter, priority badge, date
   - Resolve: `POST /api/reports/admin/:id/resolve` with `{ adminNote, actionTaken }`
   - Dismiss: `POST /api/reports/admin/:id/dismiss` with `{ adminNote }`

4. **Integrate ReportButton into:**
   - `TemplateDetailView.tsx` — near template title/actions area
   - `ReviewCard.tsx` — small flag icon on each review
   - `CreatorProfileView.tsx` — on creator profile page

5. **Modify `AdminDashboardView.tsx`** — Add "Reports" nav item + render ReportManagement

**Report API endpoints:**
```
POST   /api/reports                   → Report (body: { targetType, targetId, reason, description })
GET    /api/reports/admin             → { reports[], pagination }
GET    /api/reports/admin/stats       → { total, pending, byReason }
GET    /api/reports/admin/:id         → Report
POST   /api/reports/admin/:id/resolve → Report (body: { adminNote?, actionTaken? })
POST   /api/reports/admin/:id/dismiss → Report (body: { adminNote? })
```

---

### Task Z: Creator Withdrawal/Payout UI

Build the UI for creators to view their balance and request withdrawals, and admins to manage them.

**Files to create:**

1. **`next-client/src/modules/dashboard/creator/components/WithdrawalPanel.tsx`** (new)
   - Balance card: available balance, total earnings, total withdrawn, pending withdrawals
   - Fetch: `GET /api/withdrawals/balance`
   - "Request Withdrawal" button → opens modal
   - Withdrawal history table below: `GET /api/withdrawals/my?page=1&limit=20`
   - Columns: amount, status badge, payout method, requested date, processed date

2. **`next-client/src/modules/dashboard/creator/components/WithdrawalRequestModal.tsx`** (new)
   - Modal: amount (number input, min $10), payout method (select: stripe_connect, bank_transfer), note (optional textarea)
   - Show available balance in modal
   - Validate: amount <= available balance, amount >= $10
   - Submit: `POST /api/withdrawals/request` with `{ amount, payoutMethod, note }`
   - Disable button if already has pending withdrawal

3. **`next-client/src/modules/dashboard/admin/components/WithdrawalManagement.tsx`** (new)
   - Admin table: all withdrawal requests with status filter
   - Fetch: `GET /api/withdrawals/admin?status=pending`
   - Columns: creator name, amount, method, status badge, requested date
   - Approve: `POST /api/withdrawals/admin/:id/approve`
   - Reject (with note): `POST /api/withdrawals/admin/:id/reject` with `{ adminNote }`
   - Complete: `POST /api/withdrawals/admin/:id/complete` with `{ stripeTransferId? }`

4. **Modify `CreatorDashboardView.tsx`** — Add "Withdrawals" or integrate into "Earnings" view
5. **Modify `AdminDashboardView.tsx`** — Add "Withdrawals" nav item + render WithdrawalManagement

**Withdrawal API endpoints:**
```
GET    /api/withdrawals/balance           → { totalEarnings, totalWithdrawn, availableBalance, pendingWithdrawals }
GET    /api/withdrawals/my               → { withdrawals[], pagination }
POST   /api/withdrawals/request          → Withdrawal (body: { amount, payoutMethod?, note? })
GET    /api/withdrawals/admin            → { withdrawals[], pagination }
POST   /api/withdrawals/admin/:id/approve  → Withdrawal
POST   /api/withdrawals/admin/:id/reject   → Withdrawal (body: { adminNote })
POST   /api/withdrawals/admin/:id/complete → Withdrawal (body: { stripeTransferId? })
```

---

### Task AA: Updated Notification Types

The notification system now supports more types. Update the notification components to handle them.

**Modify `next-client/src/modules/notifications/components/NotificationBell.tsx` and `NotificationList.tsx`:**

Add icon mapping for new notification types:
- `withdrawal_approved` → Wallet (green)
- `withdrawal_rejected` → Wallet (red)
- `withdrawal_completed` → CircleDollarSign (green)
- `ticket_reply` → MessageCircle (blue)
- `ticket_resolved` → CheckCircle2 (green)
- `report_resolved` → Flag (green)
- `new_follower` → UserPlus (purple)
- `order_expired` → Clock (orange)
- `payment_failed` → AlertTriangle (red)

Update the Notification type in your components to match:
```typescript
type NotificationType =
  | 'order_paid' | 'order_refunded' | 'template_approved' | 'template_rejected'
  | 'review_received' | 'review_moderated' | 'creator_approved' | 'creator_rejected'
  | 'refund_approved' | 'refund_rejected' | 'service_order_update'
  | 'withdrawal_approved' | 'withdrawal_rejected' | 'withdrawal_completed'
  | 'ticket_reply' | 'ticket_resolved' | 'report_resolved'
  | 'new_follower' | 'order_expired' | 'payment_failed'
  | 'system';
```

---

Tasks X, Y, Z are DONE. Task AA still needs to be completed.

---

---

## !! PHASE 7 — FINAL WIRING & POLISH !! <<<< START HERE >>>>

Phase 6 Tasks X (Tickets), Y (Reports), Z (Withdrawals) are DONE. Task AA (Notification types) is NOT DONE — finish it first, then do the new tasks below.

---

### Task AA: Updated Notification Types (STILL NOT DONE — DO THIS FIRST)

The notification components still only have 8 original type mappings. Add the 9 new ones.

**Modify `next-client/src/modules/notifications/components/NotificationBell.tsx`:**

Add to the `typeIcons` object:
```typescript
order_expired: { icon: Clock, color: 'text-orange-500' },
withdrawal_approved: { icon: Wallet, color: 'text-green-500' },
withdrawal_rejected: { icon: Wallet, color: 'text-red-500' },
withdrawal_completed: { icon: CircleDollarSign, color: 'text-green-500' },
ticket_reply: { icon: MessageCircle, color: 'text-blue-500' },
ticket_resolved: { icon: CheckCircle2, color: 'text-green-500' },
report_resolved: { icon: Flag, color: 'text-green-500' },
new_follower: { icon: UserPlus, color: 'text-purple-500' },
payment_failed: { icon: AlertTriangle, color: 'text-red-500' },
```

Add the matching lucide-react imports: `Clock, Wallet, CircleDollarSign, MessageCircle, CheckCircle2, Flag, UserPlus, AlertTriangle`

**Modify `next-client/src/modules/notifications/components/NotificationList.tsx`:**

Same new types but with `bg` property too:
```typescript
order_expired: { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
withdrawal_approved: { icon: Wallet, color: 'text-green-500', bg: 'bg-green-50' },
withdrawal_rejected: { icon: Wallet, color: 'text-red-500', bg: 'bg-red-50' },
withdrawal_completed: { icon: CircleDollarSign, color: 'text-green-500', bg: 'bg-green-50' },
ticket_reply: { icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
ticket_resolved: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
report_resolved: { icon: Flag, color: 'text-green-500', bg: 'bg-green-50' },
new_follower: { icon: UserPlus, color: 'text-purple-500', bg: 'bg-purple-50' },
payment_failed: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
```

---

### Task BB: Fix Admin Dashboard Render Blocks (CRITICAL BUG)

**Problem:** `AdminDashboardView.tsx` has "Tickets", "Reports", and "Withdrawals" in the sidebar navItems, but the **JSX render conditionals are missing**. Clicking these nav items shows nothing.

**File:** `next-client/src/modules/dashboard/admin/AdminDashboardView.tsx`

**Fix:** Find the section where `activeView` conditionally renders components (near the bottom where you see `activeView === 'refunds'`, `'reviews'`, `'coupons'`, `'users'`). Add the missing render blocks:

```tsx
{activeView === 'tickets' && <TicketManagement />}
{activeView === 'reports' && <ReportManagement />}
{activeView === 'withdrawals' && <WithdrawalManagement />}
```

Make sure all three components are imported at the top of the file:
```tsx
import TicketManagement from './TicketManagement';  // or correct relative path
import ReportManagement from './ReportManagement';
import WithdrawalManagement from './WithdrawalManagement';
```

If they're already imported but just missing the render blocks, only add the JSX.

---

### Task CC: Admin UI Shots Management Panel

The admin can manage UI Shots via the backend API, but there's no admin UI for it.

**Create `next-client/src/modules/dashboard/admin/components/ShotManagement.tsx`**

- Fetch all shots: `GET /api/ui-shots/admin/all?page=1&limit=20`
- Display as grid or table showing: thumbnail, title, creator name, likes/saves counts, published status
- Toggle published: `PATCH /api/ui-shots/admin/:id/toggle-published` — button to publish/unpublish
- Delete: `DELETE /api/ui-shots/admin/:id` — with confirmation modal, requires reason text
- Filter: published/unpublished toggle
- Pagination

**Then wire it into `AdminDashboardView.tsx`:**
- Add "UI Shots" to sidebar navItems (icon: `Image` from lucide-react)
- Add `{activeView === 'shots' && <ShotManagement />}` render block

---

### Task DD: Global Search Results Page

There's no dedicated search results page. Users should be able to search across templates, services, and creators.

**Create `next-client/app/(public)/search/page.tsx`**

- Takes `?q=searchterm` query parameter
- Calls `GET /api/search?q=searchterm` (backend search endpoint)
- Displays results grouped by type: Templates, Services, Creators
- Each result type shows top 5 matches with "View all" link
- Templates: thumbnail + title + price + creator
- Services: name + price + creator
- Creators: avatar + name + template count
- Empty state if no results: "No results found for 'searchterm'"
- Loading skeleton while fetching
- Use the existing SearchBar component — make sure pressing Enter or clicking search navigates to `/search?q=...`

**Modify the SearchBar component** (wherever it lives) to navigate to `/search?q=...` on submit instead of just filtering in-place.

---

### Task EE: Polish & Responsive Fixes

1. **Mobile sidebar** — Check if the admin/creator/buyer dashboard sidebars collapse properly on mobile. If not, add a hamburger menu toggle with slide-in drawer.

2. **Blog detail page** — Verify `next-client/app/(public)/blog/[slug]/page.tsx` renders properly:
   - Author avatar + name
   - Published date
   - Category badge
   - Full content
   - Related posts at bottom
   - Share buttons (copy link)

3. **UI Shots detail modal** — When clicking a UI Shot card, show a modal/lightbox with:
   - Full-size image
   - Title, description
   - Creator info
   - Like/Save buttons
   - Link to template (if linked)
   - Close on backdrop click or Escape key

4. **404 page** — Create `next-client/app/not-found.tsx` if it doesn't exist:
   - Clean design with illustration or icon
   - "Page not found" message
   - "Go back home" button

---

## EXECUTION ORDER (updated)

**Phase 1-5 (DONE):** Tasks A-K complete
**Phase 6 (MOSTLY DONE):** Tasks X, Y, Z complete. Task AA NOT DONE.

**Phase 7 (DO NOW — in this exact order):**
1. **Task AA** — Notification type mappings (FINISH THIS FIRST)
2. **Task BB** — Fix admin dashboard render blocks (CRITICAL BUG)
3. **Task CC** — Admin UI Shots management panel
4. **Task DD** — Global search results page
5. **Task EE** — Polish & responsive fixes

---

## STYLE GUIDE

- Card containers: `bg-white border border-neutral-200 rounded-xl p-5`
- Section spacing: `space-y-6` or `space-y-8`
- Section headers: `text-lg font-semibold text-neutral-900` or `text-xl font-display font-bold`
- Subtle text: `text-sm text-neutral-500` or `text-xs text-neutral-400`
- Hover effects: `hover:shadow-md transition-shadow`
- Loading spinner: `<div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />`
- Empty states: Icon (size 40, text-neutral-300) + message (text-neutral-600) + optional CTA button
- Responsive grid: `grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4`
- Never use custom CSS files — Tailwind only
- Never add new npm packages without asking the user first
