# Copilot Agent Instructions — Flowbites Marketplace Frontend Infrastructure

**Lead Agent:** Claude Code (backend + architecture decisions)
**Frontend UI Agent:** Kimi Code (builds UI components)
**CTO Agent:** Codex (docs, DevOps, CI/CD)
**Your Role:** Frontend API services, custom hooks, form validation, and utility infrastructure
**Last Updated:** 2026-02-20

---

## YOUR ROLE

You build the **frontend infrastructure layer** that connects Kimi's UI components to Claude's backend API. You create typed API service functions, custom React hooks, client-side Zod form validation schemas, and shared utilities. You do NOT build UI components — Kimi does that. You do NOT modify backend code — Claude does that.

---

## CRITICAL RULES

1. **NEVER modify files inside `server/`** — Claude owns ALL backend code
2. **NEVER modify UI component files** in `next-client/src/modules/*/components/` — Kimi owns all UI components
3. **NEVER modify `next-client/src/types/index.ts`** — Claude owns the type definitions
4. **NEVER modify `next-client/src/stores/`** — Kimi owns Zustand stores
5. **NEVER modify `next-client/src/design-system/`** — Kimi owns design system components
6. **You CAN create and modify** files in:
   - `next-client/src/modules/*/services/` — API service functions (YOUR PRIMARY WORK)
   - `next-client/src/hooks/` — Custom React hooks
   - `next-client/src/lib/validations/` — Client-side Zod form schemas
   - `next-client/src/lib/utils/` — Shared utility functions
   - `next-client/src/lib/api/` — API client enhancements (DO NOT break existing `client.ts` or `server.ts`)
7. Follow existing code patterns and style
8. Import types from `@/types` (alias for `next-client/src/types/index.ts`)
9. Import the API client from `@/lib/api/client` (use the `api` axios instance)
10. Import server-side fetchers from `@/lib/api/server` (use `serverFetch`)

---

## EXISTING PATTERNS — FOLLOW THESE EXACTLY

### API Service Pattern (Client-Side)

Look at `next-client/src/modules/reviews/services/reviews.service.ts` for the pattern:

```typescript
import { api } from '@/lib/api/client';
import { Review, ReviewSummary } from '@/types';

export const reviewsService = {
  async getByTemplate(templateId: string): Promise<{ reviews: Review[]; summary: ReviewSummary }> {
    const { data } = await api.get(`/reviews/template/${templateId}`);
    return data.data;
  },
  async create(payload: { templateId: string; rating: number; title: string; comment: string }) {
    const { data } = await api.post('/reviews', payload);
    return data.data;
  },
};
```

### API Service Pattern (Server-Side — for SSR/ISR pages)

Look at `next-client/src/modules/templates/services/templates.service.server.ts`:

```typescript
import { serverFetch } from '@/lib/api/server';
import { Template } from '@/types';

export const templatesServerService = {
  async getAll(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return serverFetch<{ templates: Template[]; pagination: any }>(`/templates${query}`, {
      revalidate: 60,
      tags: ['templates'],
    });
  },
};
```

### Key Conventions

- Service objects use `const xxxService = { ... }` (plain object, not class)
- Server services use `const xxxServerService = { ... }`
- All methods are `async` and return typed responses
- Client services use `api.get/post/patch/delete` from `@/lib/api/client`
- Server services use `serverFetch/serverPost` from `@/lib/api/server`
- Backend always wraps responses in `{ success: true, data: <payload> }`
- Client-side: extract via `const { data } = await api.get(...)` then `return data.data`
- Server-side: `serverFetch` already extracts `.data` for you

---

## PHASE 1 — API SERVICE LAYER (DO NOW)

Build all missing API service files. Each module needs typed functions covering every backend endpoint.

### Task 1: Blog API Services

**Create `next-client/src/modules/blog/services/blog.service.ts`**

Read `server/src/modules/blog/blog.routes.js` to discover all endpoints. Build client-side service functions for:

| Method | Endpoint | Function Name | Notes |
|--------|----------|---------------|-------|
| GET | `/blog` | `getAll(filters)` | Query: page, limit, category, tag, search, sort |
| GET | `/blog/slug/:slug` | `getBySlug(slug)` | Returns full post with content |
| GET | `/blog/categories` | `getCategories()` | Returns category list with counts |
| GET | `/blog/tags` | `getTags()` | Returns tag list with counts |
| GET | `/blog/featured` | `getFeatured()` | Returns featured posts |
| GET | `/blog/:id/related` | `getRelated(postId)` | Returns related posts |

Types to import: None existing for Blog — define inline interfaces or add to the service file:
```typescript
interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: { _id: string; name: string; avatar?: string };
  coverImage?: string;
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  stats: { views: number; likes: number };
  publishedAt?: string;
  createdAt: string;
}
```

**Create `next-client/src/modules/blog/services/blog.service.server.ts`**

Server-side versions of `getAll`, `getBySlug`, `getFeatured`, `getRelated` for SSR blog pages. Use `revalidate: 300` (5 min cache) for blog listings, `revalidate: 600` for individual posts. Tag with `['blog']`.

---

### Task 2: Ticket API Services

**Create `next-client/src/modules/tickets/services/tickets.service.ts`**

Read `server/src/modules/tickets/ticket.routes.js` for endpoints:

| Method | Endpoint | Function Name |
|--------|----------|---------------|
| POST | `/tickets` | `create(data)` |
| GET | `/tickets/my` | `getMyTickets(filters)` |
| GET | `/tickets/:id` | `getById(id)` |
| POST | `/tickets/:id/reply` | `addReply(id, message)` |
| POST | `/tickets/:id/close` | `close(id)` |

Types to import from `@/types`: `SupportTicket`, `TicketMessage`, `TicketStats`

Admin endpoints (prefix with `admin`):
| Method | Endpoint | Function Name |
|--------|----------|---------------|
| GET | `/tickets/admin/all` | `adminGetAll(filters)` |
| GET | `/tickets/admin/stats` | `adminGetStats()` |
| PATCH | `/tickets/admin/:id/assign` | `adminAssign(id, assignToId)` |
| PATCH | `/tickets/admin/:id/status` | `adminUpdateStatus(id, status)` |
| PATCH | `/tickets/admin/:id/resolve` | `adminResolve(id)` |

---

### Task 3: Report API Services

**Create `next-client/src/modules/reports/services/reports.service.ts`**

Read `server/src/modules/reports/report.routes.js` for endpoints:

| Method | Endpoint | Function Name |
|--------|----------|---------------|
| POST | `/reports` | `create(data)` |
| GET | `/reports/my` | `getMyReports()` |

Types to import from `@/types`: `ContentReport`, `ReportStats`

Admin endpoints:
| Method | Endpoint | Function Name |
|--------|----------|---------------|
| GET | `/reports/admin/all` | `adminGetAll(filters)` |
| GET | `/reports/admin/stats` | `adminGetStats()` |
| GET | `/reports/admin/:id` | `adminGetById(id)` |
| PATCH | `/reports/admin/:id/resolve` | `adminResolve(id, data)` |
| PATCH | `/reports/admin/:id/dismiss` | `adminDismiss(id, data)` |

---

### Task 4: Settings API Services

**Create `next-client/src/modules/settings/services/settings.service.ts`**

Read `server/src/modules/users/settings.routes.js` for endpoints:

| Method | Endpoint | Function Name |
|--------|----------|---------------|
| GET | `/settings/profile` | `getProfile()` |
| PATCH | `/settings/profile` | `updateProfile(data)` |
| PATCH | `/settings/password` | `changePassword(data)` |
| PATCH | `/settings/avatar` | `updateAvatar(file)` — NOTE: use FormData |
| GET | `/settings/email-preferences` | `getEmailPreferences()` |
| PATCH | `/settings/email-preferences` | `updateEmailPreferences(data)` |

Types to import from `@/types`: `UserSettings`, `EmailPreferences`

**Important:** The avatar upload must use FormData, not JSON:
```typescript
async updateAvatar(file: File) {
  const formData = new FormData();
  formData.append('avatar', file);
  const { data } = await api.patch('/settings/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
},
```

---

### Task 5: UI Shots API Services

**Create `next-client/src/modules/ui-shorts/services/uiShots.service.ts`**

Read `server/src/modules/ui-shorts/uiShort.routes.js` for endpoints:

| Method | Endpoint | Function Name |
|--------|----------|---------------|
| GET | `/ui-shots` | `getAll(filters)` |
| POST | `/ui-shots` | `create(data)` — FormData upload |
| POST | `/ui-shots/:id/like` | `toggleLike(id)` |
| POST | `/ui-shots/:id/save` | `toggleSave(id)` |

Types to import from `@/types`: `UIShot`

Admin endpoints:
| Method | Endpoint | Function Name |
|--------|----------|---------------|
| GET | `/ui-shots/admin/all` | `adminGetAll(filters)` |
| DELETE | `/ui-shots/admin/:id` | `adminDelete(id, reason)` |
| PATCH | `/ui-shots/admin/:id/toggle-published` | `adminTogglePublished(id)` |

---

### Task 6: Checkout API Service

**Create `next-client/src/modules/checkout/services/checkout.service.ts`**

Read `server/src/modules/checkout/checkout.routes.js` for endpoints:

| Method | Endpoint | Function Name |
|--------|----------|---------------|
| POST | `/checkout/template` | `createTemplateCheckout(data)` |
| POST | `/checkout/service` | `createServiceCheckout(data)` |

Returns `{ sessionId: string; url: string }` — Stripe checkout session.

---

### Task 7: Admin Dashboard API Services

**Create `next-client/src/modules/dashboard/admin/services/admin.service.ts`**

Read `server/src/modules/admin/admin.routes.js` for all admin endpoints. Group them logically:

```typescript
export const adminService = {
  // Dashboard
  async getDashboardStats() { ... },

  // Users
  async getUsers(filters) { ... },
  async getUserById(id) { ... },
  async banUser(id, reason) { ... },
  async unbanUser(id) { ... },
  async changeUserRole(id, role) { ... },

  // Templates
  async getTemplates(filters) { ... },
  async moderateTemplate(id, action, reason?) { ... },

  // Creator applications
  async getCreatorApplications(filters) { ... },
  async reviewApplication(profileId, action, reason?) { ... },

  // Blog management
  async getAllBlogPosts(filters) { ... },
  async deleteBlogPost(id) { ... },
};
```

Types to import from `@/types`: `AdminDashboardStats`, `AdminUserInfo`, `AdminUserStats`, `AuditLogEntry`

---

### Task 8: Creator Dashboard API Services

**Create `next-client/src/modules/dashboard/creator/services/creator.service.ts`**

Read `server/src/modules/creators/creator.routes.js` for creator-specific endpoints:

| Method | Endpoint | Function Name |
|--------|----------|---------------|
| GET | `/creators/me/earnings` | `getEarnings()` |
| GET | `/creators/me/templates` | `getMyTemplates(filters)` |
| POST | `/creators/templates` | `createTemplate(formData)` |
| PATCH | `/creators/templates/:id` | `updateTemplate(id, formData)` |

Also wire in withdrawal endpoints from `server/src/modules/withdrawals/withdrawal.routes.js`:

| Method | Endpoint | Function Name |
|--------|----------|---------------|
| GET | `/withdrawals/balance` | `getWithdrawalBalance()` |
| GET | `/withdrawals/my` | `getMyWithdrawals(filters)` |
| POST | `/withdrawals/request` | `requestWithdrawal(data)` |

Types to import from `@/types`: `EarningsSummary`, `EarningsTransaction`, `Withdrawal`, `WithdrawalBalance`

---

## PHASE 2 — CUSTOM HOOKS

After Phase 1 is complete, build these reusable hooks.

### Task 9: Core Custom Hooks

**Create these files in `next-client/src/hooks/`:**

**`useApi.ts`** — Generic hook for API calls with loading/error state:
```typescript
'use client';
import { useState, useCallback } from 'react';

export function useApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Something went wrong';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { data, isLoading, error, execute, reset };
}
```

**`usePagination.ts`** — Hook for paginated API calls:
```typescript
'use client';
export function usePagination<T>(
  fetchFn: (page: number, limit: number) => Promise<{ items: T[]; pagination: { page: number; pages: number; total: number } }>
) {
  // Returns: items, pagination, isLoading, error, goToPage, nextPage, prevPage
}
```

**`useDebounce.ts`** — Debounce a value (useful for search inputs):
```typescript
'use client';
export function useDebounce<T>(value: T, delay: number = 300): T { ... }
```

**`useInfiniteScroll.ts`** — Intersection Observer for infinite scroll (UI Shots feed):
```typescript
'use client';
export function useInfiniteScroll(callback: () => void, options?: { threshold?: number }) {
  // Returns: sentinelRef (attach to a div at the bottom of the list)
}
```

**`useMediaQuery.ts`** — Responsive breakpoint detection:
```typescript
'use client';
export function useMediaQuery(query: string): boolean { ... }
```

**`useClickOutside.ts`** — Detect clicks outside a ref (for dropdowns/modals):
```typescript
'use client';
export function useClickOutside<T extends HTMLElement>(callback: () => void): React.RefObject<T> { ... }
```

---

## PHASE 3 — CLIENT-SIDE FORM VALIDATION

### Task 10: Zod Form Schemas

**Create `next-client/src/lib/validations/` directory with these files:**

These schemas mirror the backend validators but are for **client-side form validation** with `react-hook-form` + `@hookform/resolvers/zod`. They provide instant feedback before the form is submitted.

**`auth.schema.ts`:**
```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['buyer', 'creator']),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
```

**`ticket.schema.ts`:**
- `createTicketSchema` — subject (3-200 chars), category enum, message (10-2000 chars), priority optional
- `ticketReplySchema` — message (1-2000 chars)

**`report.schema.ts`:**
- `createReportSchema` — targetType enum, targetId, reason enum (7 values), description (10-1000 chars)

**`settings.schema.ts`:**
- `updateProfileSchema` — name (2-100 chars) optional, bio (max 500 chars) optional
- `changePasswordSchema` — currentPassword required, newPassword min 6 chars
- `emailPreferencesSchema` — 5 boolean toggles

**`blog.schema.ts`:**
- `createBlogSchema` — title (3-200 chars), content (min 50 chars), excerpt, category, tags (max 10)

**`withdrawal.schema.ts`:**
- `requestWithdrawalSchema` — amount (min $10, max $100k), payoutMethod enum, note optional

**`checkout.schema.ts`:**
- `templateCheckoutSchema` — items array (1-10), couponCode optional
- `serviceCheckoutSchema` — packageId required, requirements (10-5000 chars) optional

---

## FILE OWNERSHIP TABLE

| Path Pattern | Owner | Can Copilot Modify? |
|---|---|---|
| `server/` (all) | Claude | NO |
| `next-client/src/modules/*/components/` | Kimi | NO |
| `next-client/src/modules/*/services/` | **Copilot** | YES — your primary work |
| `next-client/src/hooks/` | **Copilot** | YES |
| `next-client/src/lib/validations/` | **Copilot** | YES — you create this dir |
| `next-client/src/lib/utils/` | Shared (Copilot can add new files) | YES (new files only) |
| `next-client/src/lib/api/client.ts` | Shared | NO — do not modify |
| `next-client/src/lib/api/server.ts` | Shared | NO — do not modify |
| `next-client/src/types/index.ts` | Claude | NO |
| `next-client/src/stores/` | Kimi | NO |
| `next-client/src/design-system/` | Kimi | NO |
| `next-client/src/app/` | Kimi | NO |
| `docs/` | Codex | NO |
| `COPILOT_AGENT_INSTRUCTIONS.md` | Claude | Do not modify |

---

## EXECUTION ORDER

| Phase | Status | Tasks |
|-------|--------|-------|
| Phase 1: API Services | **DO NOW** | Tasks 1-8 |
| Phase 2: Custom Hooks | DO AFTER Phase 1 | Task 9 |
| Phase 3: Form Validation | DO AFTER Phase 2 | Task 10 |

---

## REFERENCE: BACKEND API BASE ROUTES

From `server/src/index.js`, all API routes are prefixed with `/api`:

```
/api/auth          → Auth (login, register, refresh, logout)
/api/templates     → Templates (CRUD, search, browse)
/api/categories    → Categories
/api/creators      → Creator profiles
/api/orders        → Orders
/api/checkout      → Stripe checkout
/api/downloads     → License/download management
/api/reviews       → Reviews
/api/services      → Service packages & orders
/api/notifications → Notifications
/api/followers     → Follow/unfollow
/api/wishlist      → Wishlist
/api/coupons       → Coupon validation
/api/refunds       → Refund requests
/api/settings      → User settings
/api/withdrawals   → Creator withdrawals
/api/tickets       → Support tickets
/api/reports       → Content reports
/api/ui-shots      → UI shots/inspiration
/api/blog          → Blog posts
/api/admin         → Admin dashboard & management
/api/analytics     → Analytics
/api/audit         → Audit logs (admin only)
```

---

## REFERENCE: EXISTING SERVICE FILES (DO NOT RECREATE)

These service files already exist — do NOT recreate them, but you may improve/extend them if needed:

- `next-client/src/modules/templates/services/templates.service.ts` — EXISTS
- `next-client/src/modules/templates/services/templates.service.server.ts` — EXISTS
- `next-client/src/modules/templates/services/search.service.ts` — EXISTS
- `next-client/src/modules/creators/services/creators.service.server.ts` — EXISTS
- `next-client/src/modules/services/services/services.service.ts` — EXISTS
- `next-client/src/modules/services/services/services.service.server.ts` — EXISTS
- `next-client/src/modules/reviews/services/reviews.service.ts` — EXISTS
- `next-client/src/modules/notifications/services/notifications.service.ts` — EXISTS
- `next-client/src/modules/wishlists/services/wishlists.service.ts` — EXISTS
- `next-client/src/modules/dashboard/buyer/services/refunds.service.ts` — EXISTS

---

## IMPORTANT NOTES

1. **Read the backend route files** before building each service — they are the source of truth for endpoints, HTTP methods, and auth requirements
2. **Read existing service files** to match the exact code style and patterns
3. The backend response format is always: `{ success: boolean, data: <payload>, error?: string }`
4. For paginated endpoints, the backend returns: `{ items/posts/shots/...: T[], pagination: { page, limit, total, pages } }`
5. All `admin` endpoints require `authenticate` + `authorize('admin')` middleware — the service functions don't need to handle this (the API client's interceptor adds the Bearer token automatically)
6. Use TypeScript strict mode — no `any` types unless absolutely necessary
7. Export types inferred from Zod schemas using `z.infer<typeof schema>`
