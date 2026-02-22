# Codex Agent Instructions — Flowbites Marketplace CTO

**Role:** CTO — Architecture, Documentation, DevOps, Code Quality, Security
**Lead Agent:** Claude Code (backend) | **Frontend Agent:** Kimi Code
**Last Updated:** 2026-02-20

---

## YOUR ROLE

You handle everything that makes the project **production-ready, maintainable, and professional**. You build documentation, DevOps tooling, monitoring, and developer experience.

---

## CRITICAL RULES

1. **NEVER modify files inside `server/src/modules/`** — Claude owns all backend business logic
2. **NEVER modify files inside `next-client/src/modules/`** — Kimi owns all frontend components
3. **NEVER modify `next-client/src/types/index.ts`** — Claude owns this file
4. **You CAN create new files** in: `docs/`, root-level config, `server/src/middleware/`, `scripts/`
5. **You CAN modify**: root README.md, docker files, .env files, CI/CD workflows
6. **Ask before modifying** shared files like `server/src/index.js`
7. Follow existing code style and patterns

---

## PHASE 1 — COMPLETED (all 6 tasks done)

### Task 1: API Documentation — DONE

Create `docs/api-reference.md` — a complete API reference for all endpoints.

**Read every `*.routes.js` file** in `server/src/modules/` to discover all endpoints. For each endpoint document:
- HTTP method + URL path
- Auth required? Which roles?
- Request body / query params (read the validators and controllers)
- Response shape (read the service return values)
- Rate limits (if any)

Group by module. Include example request/response for the 5 most important endpoints:
1. `POST /api/auth/register`
2. `POST /api/auth/login`
3. `POST /api/checkout/template`
4. `GET /api/templates`
5. `GET /api/templates/:id`

**Tip:** Read `server/src/index.js` to see all registered route prefixes, then read each routes file.

---

### Task 2: Project README & Onboarding Docs

**2a. Update root `README.md`** (read it first, then enhance):
- Project description and features list
- Tech stack table
- Architecture overview (ASCII diagram showing: Browser → Next.js → Express API → MongoDB, plus Stripe/Cloudinary/Resend integrations)
- Quick start guide (both Docker and manual)
- Environment variables reference (read `server/.env.example` and `server/src/config/validateEnv.js`)
- Available npm scripts for both server/ and next-client/
- Project structure overview
- Link to API docs

**2b. Create `next-client/.env.example`:**
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Stripe (publishable key only — secret stays on server)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# Cloudinary (for image display)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

Read `next-client/src/lib/` and `next-client/next.config.ts` to find any other env vars used.

**2c. Create `CONTRIBUTING.md`:**
- How to set up the dev environment
- Branch naming: `feature/`, `fix/`, `docs/`
- Commit message format: `type(scope): message` (feat, fix, docs, refactor, test)
- PR checklist template
- Code style guide (ES modules, Mongoose patterns, Zod validators)
- Testing instructions

---

### Task 3: Database Index Audit

Read ALL `*.model.js` files in `server/src/modules/`. Create `docs/database-indexes.md`:

For each model:
- List existing indexes
- Identify missing indexes needed for common queries
- Check for missing unique constraints
- Flag potential performance issues

**Do NOT modify model files.** Just produce the audit report. Claude will apply fixes.

**Models to check:**
```
server/src/modules/users/user.model.js
server/src/modules/templates/template.model.js
server/src/modules/templates/templateVersion.model.js
server/src/modules/orders/order.model.js
server/src/modules/downloads/license.model.js
server/src/modules/reviews/review.model.js
server/src/modules/refunds/refund.model.js
server/src/modules/notifications/notification.model.js
server/src/modules/wishlists/wishlist.model.js
server/src/modules/coupons/coupon.model.js
server/src/modules/followers/follower.model.js
server/src/modules/creators/creator.model.js
server/src/modules/services/service.model.js
server/src/modules/blog/blog.model.js
server/src/modules/auth/token.model.js
server/src/modules/auth/loginAttempt.model.js
server/src/modules/categories/category.model.js
```

---

### Task 4: Security Audit

Read the entire backend codebase and create `docs/security-audit.md`.

**Check these areas:**

1. **Authentication** — Read `server/src/middleware/auth.js` and `server/src/modules/auth/`
   - JWT implementation, token expiry, refresh flow
   - Password hashing strength
   - Email verification flow

2. **Input Validation** — Read all `*.validator.js` files
   - Are all user inputs validated?
   - Is `server/src/middleware/sanitize.js` catching NoSQL injection?

3. **Authorization** — Read all route files
   - Are admin routes properly protected?
   - Can users access other users' data?

4. **File Uploads** — Read `server/src/middleware/upload.js` and `server/src/middleware/cloudinaryUpload.js`
   - File size limits
   - File type validation
   - Path traversal protection

5. **Payment** — Read `server/src/modules/checkout/` and `server/src/config/stripe.js`
   - Webhook signature verification
   - Price tampering prevention
   - Refund amount validation

6. **Rate Limiting** — Read `server/src/index.js` and rate limit middleware
   - General API limits
   - Auth brute force protection
   - Per-user abuse prevention

7. **Headers & CORS** — Read helmet and CORS config in index.js

**Report format:** Categorize findings as Critical / High / Medium / Low with file:line references.

---

### Task 5: Deployment & Architecture Docs

**5a. Create `docs/architecture.md`:**
- System architecture diagram (ASCII)
- Module dependency graph
- Data flow diagrams for: checkout flow, refund flow, creator onboarding
- Database schema relationships (which models reference which)
- Auth flow diagram (register → verify → login → refresh → logout)

**5b. Create `docs/deployment-guide.md`:**
- Production environment setup checklist
- MongoDB Atlas setup
- Stripe production configuration
- Cloudinary setup
- Resend email setup
- Domain, SSL, reverse proxy (nginx)
- Docker production deployment
- PM2 process manager setup
- Health check monitoring
- Backup strategy
- Scaling considerations

---

### Task 6: Update .env.example & Docker Review

**6a. Update `server/.env.example`** — Read the entire codebase to find ALL environment variables used. Make sure every `process.env.SOMETHING` has a corresponding entry in .env.example with a comment explaining what it does.

**6b. Review `docker-compose.yml`** — Read it and verify:
- MongoDB service with volume persistence
- Server service with correct env vars
- Health checks
- Network configuration
- Suggest improvements if needed in a `docs/docker-review.md` file

**6c. Review `.github/workflows/ci.yml`** — Read it and suggest improvements in the same docker-review.md:
- Test coverage
- Linting steps
- Build caching
- Deploy stages

---

## FILE OWNERSHIP TABLE

| File/Directory | Owner | Rule |
|----------------|-------|------|
| `server/src/modules/` | Claude | Codex: READ ONLY — **EXCEPTION: Task 9 allows adding `.index()` calls to model files** |
| `next-client/src/modules/*/components/` | Kimi | Codex: READ ONLY — do NOT touch UI components |
| `next-client/src/modules/*/services/` | **Codex** | Phase 3 Task 14 — CREATE new service files here |
| `next-client/src/hooks/` | **Codex** | Phase 3 Task 15 — CREATE new hook files here |
| `next-client/src/lib/validations/` | **Codex** | Phase 3 Task 16 — CREATE new validation files here |
| `next-client/src/types/index.ts` | Claude | Codex: READ ONLY |
| `next-client/src/stores/` | Kimi | Codex: READ ONLY |
| `next-client/src/design-system/` | Kimi | Codex: READ ONLY |
| `docs/` | **Codex** | Create all docs here |
| `scripts/migrations/` | **Codex** | New directory for Task 12 |
| `CONTRIBUTING.md` | **Codex** | Created in Phase 1 |
| `README.md` (root) | **Codex** | Can update |
| `server/README.md` | **Codex** | Task 13 — Rewrite completely |
| `server/.env.example` | **Codex** | Can update |
| `next-client/.env.example` | **Codex** | Created in Phase 1 |
| `.github/workflows/ci.yml` | **Codex** | Can modify for Task 11 |
| `Dockerfile`, `docker-compose.yml` | **Codex** | Can modify for Task 11 |
| `.dockerignore` | **Codex** | New file for Task 11 |

---

---

## PHASE 2 — NEW TASKS (do in order) <<<< START HERE >>>>

Phase 1 is DONE. All 6 tasks complete. Now do these 6 new tasks.

---

### Task 7: Update API Documentation for New Modules

The backend has grown significantly since Task 1. Update `docs/api-reference.md` to cover ALL new endpoints.

**New modules to document (read their routes files):**

```
server/src/modules/reports/report.routes.js          — Content reporting system
server/src/modules/audit/audit.routes.js              — Admin audit log
server/src/modules/withdrawals/withdrawal.routes.js   — Creator withdrawals/payouts
server/src/modules/tickets/ticket.routes.js           — Support ticket system
server/src/modules/users/earnings.routes.js           — Creator earnings dashboard
server/src/modules/users/search.routes.js             — Global search + autocomplete
server/src/modules/users/settings.routes.js           — User settings & preferences
server/src/modules/admin/userManagement.routes.js     — Admin user management
```

For EACH new endpoint document:
- HTTP method + URL path
- Auth required? Which roles?
- Request body / query params (read the controllers and services)
- Response shape (read the service return values)
- Rate limits (read `server/src/middleware/rateLimiter.js` usage in route files)

Add example request/response for these key new endpoints:
1. `POST /api/reports` — submit a content report
2. `POST /api/withdrawals/request` — creator requests withdrawal
3. `GET /api/earnings/summary` — creator earnings dashboard
4. `POST /api/tickets` — create support ticket
5. `GET /api/admin/audit` — view audit logs

---

### Task 8: Update Security Audit

The security audit (`docs/security-audit.md`) was written BEFORE 4 critical fixes were applied. Update it.

**Fixes already applied (mark these as RESOLVED):**

1. **HIGH — Access token cookie not httpOnly** → FIXED in `server/src/modules/auth/auth.controller.js`
   - `httpOnly: true` now set on accessToken cookie in register, login, and refresh

2. **HIGH — Refresh tokens stored in plaintext** → FIXED in `server/src/modules/auth/auth.service.js`
   - Now hashed with SHA-256 via `_hashToken()` method before storage
   - Comparison uses hash matching

3. **HIGH — No MIME type validation on uploads** → FIXED in `server/src/middleware/upload.js`
   - `ALLOWED_MIME_MAP` validates MIME matches extension
   - SVG restricted from templateFile and document upload fields

4. **MEDIUM — Coupon race condition** → FIXED in `server/src/modules/coupons/coupon.service.js`
   - `recordUsage()` uses atomic `findOneAndUpdate` with `$expr` condition

**New security areas to audit (added since original audit):**

- Content reporting system: Can users spam reports? (Check rate limiting)
- Withdrawal system: Can creators overdraw? (Check balance calculation in `withdrawal.service.js`)
- Support tickets: Can users view other users' tickets? (Check userId filtering)
- Audit log: Is it admin-only? (Check route middleware)
- User management: Can admin ban super_admin? (Check role hierarchy)
- Search: Any injection risks in search queries? (Check `search.service.js`)

Update the security audit document with:
- Mark the 4 fixed issues as RESOLVED with ✅
- Add audit findings for the 6 new modules
- Update the summary counts

---

### Task 9: Apply Database Indexes from Audit

The database index audit (`docs/database-indexes.md`) produced many recommendations. Now **apply them**.

**IMPORTANT: For this task, you ARE allowed to modify `server/src/modules/` model files — ONLY to add indexes.**

Read `docs/database-indexes.md` for the full list. Apply the recommended indexes to these model files:

```
server/src/modules/templates/template.model.js
server/src/modules/orders/order.model.js
server/src/modules/downloads/license.model.js
server/src/modules/reviews/review.model.js
server/src/modules/refunds/refund.model.js
server/src/modules/notifications/notification.model.js
server/src/modules/coupons/coupon.model.js
server/src/modules/services/service.model.js
server/src/modules/blog/blog.model.js
server/src/modules/auth/token.model.js
server/src/modules/auth/loginAttempt.model.js
```

Also add indexes to the NEW models:
```
server/src/modules/reports/report.model.js
server/src/modules/audit/auditLog.model.js
server/src/modules/withdrawals/withdrawal.model.js
server/src/modules/tickets/ticket.model.js
```

**Rules:**
- Only add `.index()` calls on the schema — do NOT change any field definitions
- Add compound indexes for common query patterns (read the corresponding service files to understand what queries are run)
- Add text indexes for searchable fields (templates, services, blog)
- Prioritize: unique constraints > query performance > sort optimization
- After applying, update `docs/database-indexes.md` to mark each recommendation as APPLIED

---

### Task 10: Create Monitoring & Observability Guide

Create `docs/monitoring-guide.md`:

**Read these files first:**
- `server/src/index.js` — health check endpoint
- `server/src/jobs/cleanup.js` — cron jobs
- `server/src/middleware/rateLimiter.js` — rate limiting
- `server/src/modules/admin/admin.service.js` — admin stats

**Document:**
1. **Health Checks** — what the `/health` endpoint returns, how to monitor it
2. **Key Metrics to Track:**
   - Request rate and latency (per endpoint)
   - Error rate (4xx vs 5xx)
   - MongoDB connection pool status
   - Active users, orders per hour, revenue
   - Failed login attempts (lockout detection)
   - Stripe webhook failures
   - Email delivery failures
3. **Logging Strategy:**
   - What's currently logged and where
   - Recommended structured logging format
   - Log levels: error, warn, info, debug
   - Recommend using `pino` or `winston` for production
4. **Alerting Rules:**
   - Error rate > 5% for 5 minutes
   - Response time > 2s for 1 minute
   - MongoDB disconnection
   - Stripe webhook failures
   - Too many failed login attempts from same IP
5. **Cron Job Monitoring:**
   - List all cleanup jobs from `cleanup.js`
   - How to verify they're running
   - What happens if they fail
6. **Production Dashboards:**
   - Recommend Grafana + Prometheus setup
   - Key dashboard panels
   - MongoDB Atlas monitoring integration

---

### Task 11: Docker & CI/CD Improvements

Apply the recommendations from `docs/docker-review.md`. Read it first.

**11a. Improve `docker-compose.yml`:**
- Add healthcheck for MongoDB service
- Add healthcheck for server service (use `/health` endpoint)
- Add restart policies
- Add resource limits (memory, CPU)
- Add proper networking (named network)
- Ensure volume persistence is correct

**11b. Improve `Dockerfile` (if one exists):**
- Multi-stage build (build stage + production stage)
- Non-root user
- `.dockerignore` file (exclude node_modules, .git, docs, tests)
- Production NODE_ENV

**11c. Improve `.github/workflows/ci.yml`:**
- Add linting step (ESLint)
- Add MongoDB service for integration tests
- Add build caching for node_modules
- Add test coverage reporting
- Add separate jobs for: lint, test, build
- Add branch protection rules recommendation

**Rules:** You CAN modify docker files, CI workflows, and create `.dockerignore`. Do NOT modify application code.

---

### Task 12: Data Migration & Schema Change Guide

Create `docs/data-migration-guide.md`:

**Context:** The User model recently had schema changes. Document a migration strategy.

**Read these files:**
- `server/src/modules/users/user.model.js` — current schema with new fields
- `server/src/modules/admin/userManagement.service.js` — uses isBanned, bannedAt, etc.
- `server/src/modules/users/settings.service.js` — uses emailPreferences

**Document:**
1. **Schema Changes Summary:**
   - New fields: `isBanned`, `bannedAt`, `bannedBy`, `banReason`, `emailPreferences`
   - Refresh tokens now stored as SHA-256 hashes (not plaintext)

2. **Migration Script Template:**
   - Create `scripts/migrations/` directory
   - Create `scripts/migrations/001-add-user-ban-fields.js` — sets defaults for existing users
   - Create `scripts/migrations/002-hash-refresh-tokens.js` — rehashes any plaintext tokens (or invalidates them, forcing re-login)
   - Create `scripts/migrations/003-add-email-preferences.js` — sets default preferences

3. **Migration Best Practices:**
   - Always backup before migrating
   - Run migrations in maintenance mode
   - Test on staging first
   - Rollback strategy for each migration
   - How to verify migration success

4. **Running Migrations:**
   - Add `npm run migrate` script
   - Document the migration runner pattern

---

## EXECUTION ORDER

**Phase 1 (DONE):**
1. ~~Task 1~~ — API Documentation ✅
2. ~~Task 2~~ — README + Onboarding ✅
3. ~~Task 3~~ — Database Index Audit ✅
4. ~~Task 4~~ — Security Audit ✅
5. ~~Task 5~~ — Architecture + Deployment docs ✅
6. ~~Task 6~~ — Env vars + Docker review ✅

**Phase 2 (DO NOW):**
7. **Task 7** — Update API docs for new modules (HIGHEST PRIORITY)
8. **Task 8** — Update security audit with fixes + new modules
9. **Task 9** — Apply database indexes from audit
10. **Task 10** — Monitoring & observability guide
11. **Task 11** — Docker & CI/CD improvements
12. **Task 12** — Data migration scripts & guide

**DO NOT WAIT. DO NOT ASK QUESTIONS. Read the codebase and produce the deliverables.**

---

## PHASE 3 — CLEANUP + TESTING (do in order) <<<< START HERE >>>>

Phase 2 is DONE. Tasks 14-16 (frontend services, hooks, validations) were completed by Claude directly. You still need to do Task 13 + new tasks below.

---

### Task 13: Update `server/README.md` (OUTDATED)

The `server/README.md` is heavily outdated — it still references "mock checkout", lists only ~20 endpoints, and the file structure is incomplete. **Rewrite it completely.**

Read `server/src/index.js` to see ALL registered route prefixes, then read each `*.routes.js` file.

**Include:**
- Updated project description (real Stripe payments, Cloudinary, Resend emails)
- Complete file structure tree (all 25+ modules under `modules/`)
- ALL API endpoints grouped by module (we now have 80+ endpoints)
- Updated setup instructions (mention Stripe webhook setup, Cloudinary config)
- Updated test credentials (read `server/src/scripts/seed.js` for current seed data)
- Updated features list (remove "Mock checkout", add: real Stripe, webhooks, withdrawals, tickets, reports, blog, etc.)
- Updated security features list
- Remove the "Next Steps (Post-MVP)" section — most are already done

---

### Task 14: Build Missing Frontend API Service Files

Copilot was assigned this but errored. Build typed API service functions for modules that don't have them.

**Read existing service files first to match the pattern exactly:**
- `next-client/src/modules/reviews/services/reviews.service.ts` — client-side pattern
- `next-client/src/modules/templates/services/templates.service.server.ts` — server-side pattern

**Pattern to follow:**
```typescript
import { api } from '@/lib/api/client';
import { SomeType } from '@/types';

export const someService = {
  async getAll(params?: { page?: number; limit?: number }) {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    const { data } = await api.get(`/endpoint${query}`);
    return data.data;
  },
};
```

**Services to create (read each backend routes file for endpoints):**

1. **`next-client/src/modules/blog/services/blog.service.ts`**
   - Read `server/src/modules/blog/blog.routes.js`
   - Methods: getAll, getBySlug, getCategories, getTags, getFeatured, getRelated

2. **`next-client/src/modules/blog/services/blog.service.server.ts`**
   - Server-side versions: getAll, getBySlug, getFeatured (use `serverFetch` from `@/lib/api/server`)
   - Use `revalidate: 300` for listings, `revalidate: 600` for posts

3. **`next-client/src/modules/tickets/services/tickets.service.ts`**
   - Read `server/src/modules/tickets/ticket.routes.js`
   - Methods: create, getMyTickets, getById, addReply, close
   - Admin methods: adminGetAll, adminGetStats, adminAssign, adminUpdateStatus, adminResolve

4. **`next-client/src/modules/reports/services/reports.service.ts`**
   - Read `server/src/modules/reports/report.routes.js`
   - Methods: create, getMyReports
   - Admin: adminGetAll, adminGetStats, adminGetById, adminResolve, adminDismiss

5. **`next-client/src/modules/settings/services/settings.service.ts`**
   - Read `server/src/modules/users/settings.routes.js`
   - Methods: getProfile, updateProfile, changePassword, updateAvatar (FormData!), getEmailPreferences, updateEmailPreferences

6. **`next-client/src/modules/ui-shorts/services/uiShots.service.ts`**
   - Read `server/src/modules/ui-shorts/uiShort.routes.js`
   - Methods: getAll, create (FormData!), toggleLike, toggleSave
   - Admin: adminGetAll, adminDelete, adminTogglePublished

7. **`next-client/src/modules/checkout/services/checkout.service.ts`**
   - Read `server/src/modules/checkout/checkout.routes.js`
   - Methods: createTemplateCheckout, createServiceCheckout

8. **`next-client/src/modules/dashboard/admin/services/admin.service.ts`**
   - Read `server/src/modules/admin/admin.routes.js` and `server/src/modules/admin/userManagement.routes.js`
   - Methods: getDashboardStats, getUsers, getUserById, banUser, unbanUser, changeUserRole, getTemplates, moderateTemplate, getCreatorApplications, reviewApplication

9. **`next-client/src/modules/dashboard/creator/services/creator.service.ts`**
   - Read `server/src/modules/creators/creator.routes.js` and `server/src/modules/withdrawals/withdrawal.routes.js`
   - Methods: getEarnings, getMyTemplates, createTemplate, updateTemplate, getWithdrawalBalance, getMyWithdrawals, requestWithdrawal

---

### Task 15: Build Custom React Hooks

Create reusable hooks in `next-client/src/hooks/`:

**`useApi.ts`** — Generic hook for API calls with loading/error/data state:
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

**`useDebounce.ts`** — Debounce a value (for search inputs):
```typescript
'use client';
import { useState, useEffect } from 'react';
export function useDebounce<T>(value: T, delay = 300): T { ... }
```

**`useInfiniteScroll.ts`** — IntersectionObserver for infinite scroll (UI Shots):
```typescript
'use client';
export function useInfiniteScroll(callback: () => void, options?: { threshold?: number }) {
  // Returns: sentinelRef
}
```

**`useMediaQuery.ts`** — Responsive breakpoint detection:
```typescript
'use client';
export function useMediaQuery(query: string): boolean { ... }
```

**`useClickOutside.ts`** — Detect clicks outside a ref (dropdowns/modals):
```typescript
'use client';
export function useClickOutside<T extends HTMLElement>(callback: () => void): React.RefObject<T> { ... }
```

**`usePagination.ts`** — Hook for paginated API calls:
```typescript
'use client';
export function usePagination<T>(fetchFn: (page: number) => Promise<{ items: T[]; pagination: { page: number; pages: number; total: number } }>) {
  // Returns: items, pagination, isLoading, error, goToPage, nextPage, prevPage
}
```

---

### Task 16: Client-Side Zod Form Validation Schemas

Create `next-client/src/lib/validations/` directory with these schema files. These are used with `react-hook-form` + `@hookform/resolvers/zod` for instant client-side form validation.

**`auth.schema.ts`:**
- loginSchema: email + password required
- registerSchema: name (min 2), email, password (min 6), role enum

**`ticket.schema.ts`:**
- createTicketSchema: subject (3-200 chars), category enum, message (10-2000 chars), priority optional
- ticketReplySchema: message (1-2000 chars)

**`report.schema.ts`:**
- createReportSchema: targetType, targetId, reason enum (7 values), description (10-1000 chars)

**`settings.schema.ts`:**
- updateProfileSchema: name (2-100) optional, bio (max 500) optional
- changePasswordSchema: currentPassword required, newPassword min 6
- emailPreferencesSchema: 5 boolean toggles

**`blog.schema.ts`:**
- createBlogSchema: title (3-200), content (min 50), excerpt, category, tags (max 10)

**`withdrawal.schema.ts`:**
- requestWithdrawalSchema: amount (min 10, max 100000), payoutMethod enum, note optional

**`checkout.schema.ts`:**
- templateCheckoutSchema: items array (1-10) with templateId, couponCode optional
- serviceCheckoutSchema: packageId required, requirements (10-5000) optional

**Pattern:**
```typescript
import { z } from 'zod';
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof loginSchema>;
```

---

## EXECUTION ORDER (updated)

**Phase 1 (DONE):**
1. ~~Task 1~~ — API Documentation ✅
2. ~~Task 2~~ — README + Onboarding ✅
3. ~~Task 3~~ — Database Index Audit ✅
4. ~~Task 4~~ — Security Audit ✅
5. ~~Task 5~~ — Architecture + Deployment docs ✅
6. ~~Task 6~~ — Env vars + Docker review ✅

**Phase 2 (DONE):**
7. ~~Task 7~~ — Update API docs ✅
8. ~~Task 8~~ — Update security audit ✅
9. ~~Task 9~~ — Apply database indexes ✅
10. ~~Task 10~~ — Monitoring guide ✅
11. ~~Task 11~~ — Docker & CI/CD improvements ✅
12. ~~Task 12~~ — Data migration scripts ✅

**Phase 3 (DO NOW):**
13. **Task 13** — Rewrite `server/README.md` (START HERE — quick win)
14. ~~Task 14~~ — ✅ Done by Claude
15. ~~Task 15~~ — ✅ Done by Claude
16. ~~Task 16~~ — ✅ Done by Claude
17. **Task 17** — Integration test expansion (see below)
18. **Task 18** — Frontend `next-client/README.md` (see below)
19. **Task 19** — Environment health check script (see below)

---

### Task 17: Expand Integration Tests

The existing test file `server/tests/integration.test.js` only covers auth, reviews, refunds, coupons, followers, wishlists. Expand it to cover the new modules.

**Read `server/tests/integration.test.js` and `server/tests/setup.js` first** to understand the custom test runner pattern.

**Add test cases for:**

1. **Support Tickets** — Create ticket, get my tickets, add reply, close ticket
2. **Content Reports** — Create report, admin get reports, admin resolve report
3. **Withdrawals** — Get balance, request withdrawal (should fail if balance = 0)
4. **Blog** — Get all posts, get by slug, get categories, get tags
5. **UI Shots** — Get all shots, admin toggle published
6. **Settings** — Update profile, change password, email preferences
7. **Notifications** — Get notifications, mark as read, mark all as read

Follow the existing test pattern in the file. Each test should:
- Make an API call
- Assert the response status code
- Assert the response body shape
- Use the test users from `setup.js`

---

### Task 18: Create `next-client/README.md`

The frontend has no README. Create one with:

- Project description (Next.js 16 App Router marketplace frontend)
- Tech stack (Next.js, TypeScript, Tailwind CSS, Zustand, Axios, Zod, react-hook-form)
- File structure overview (app/, modules/, lib/, hooks/, stores/, types/, design-system/)
- Module architecture explanation (each module has: components/, services/)
- Available npm scripts (dev, build, lint, start)
- Environment variables (read `next-client/.env.example`)
- Design system overview (mention the design-system/ directory)
- Routing structure (public pages, auth pages, dashboard pages, admin pages)

---

### Task 19: Create Environment Health Check Script

Create `scripts/health-check.js` that verifies all required services are running:

```javascript
// Check: MongoDB connection
// Check: Server API responds at /health
// Check: Required environment variables are set
// Check: Cloudinary config is valid (optional)
// Check: Stripe keys format (starts with sk_)
// Check: Resend API key format
// Print: Summary table with pass/fail for each check
```

Add `"health": "node scripts/health-check.js"` to root `package.json` (or server/package.json).

This helps developers quickly diagnose setup issues.

---

**DO NOT WAIT. DO NOT ASK QUESTIONS. Read the codebase and produce the deliverables.**

---

## TECH STACK

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), Tailwind CSS, Zustand, Axios |
| Backend | Express.js, MongoDB/Mongoose, Zod validation |
| Auth | JWT (access + refresh tokens), bcrypt |
| Payments | Stripe Checkout + Connect Express |
| Email | Resend API (fallback: console logging) |
| Storage | Cloudinary (fallback: local uploads/) |
| DevOps | Docker, GitHub Actions CI/CD |
| Security | Helmet, CORS, rate limiting, NoSQL injection prevention |
