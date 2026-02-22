# Database Index Audit

Scope: `server/src/modules/**/*.model.js` models listed in Task 3.

Method:
- Read existing schema indexes (including `unique: true` fields that create unique indexes).
- Read service/controller query patterns.
- Identify missing indexes and possible unique constraints.
- No model code changes made in this task.

## Executive Summary

### Highest-impact recommended additions
1. `Order`: add index for webhook/refund lookups on `stripeChargeId` (and optionally `stripePaymentIntentId`). ✅ APPLIED
2. `Template`: add `status + createdAt` and `status + price` indexes for hot listing/sort paths. ✅ APPLIED
3. `CreatorProfile`: add `onboarding.status + onboarding.submittedAt` for admin review queue.
4. `ServiceOrder`: add `buyerId + createdAt` and creator-assignment timeline indexes. ✅ APPLIED
5. `Notification`: add `userId + read + createdAt` to optimize unread feed sorting. ✅ APPLIED

### Residual risks
- Several list/search paths use regex/text + sorting that can still degrade at scale.
- Some “business uniqueness” is enforced in service logic only (not DB constraints), which can race under concurrency.

### Phase 2 Application Status (Task 9)
- Applied in model files: `template`, `order`, `license`, `review`, `notification`, `coupon`, `service`, `blog`, `loginAttempt`.
- Added indexes for new models: `report`, `auditLog`, `withdrawal`, `ticket`.
- Not applied by design:
  - `DownloadToken` TTL conversion (behavioral lifecycle change)
  - `CreatorProfile` recommendations (not included in Task 9 target file list)
  - `Category` recommendations (not included in Task 9 target file list)

---

## Model-by-Model Audit

## 1) `server/src/modules/users/user.model.js`

Existing indexes:
- `email` unique (from schema field)
- `{ role: 1 }`
- `{ createdAt: -1 }`

Query patterns observed:
- Login/registration by `email`
- User listing/sorting by `createdAt`
- Role-based filtering

Assessment:
- Current indexes are acceptable.

Recommended additions:
- Optional: `{ role: 1, createdAt: -1 }` if admin user list frequently filters by role and sorts by newest.

Unique constraint check:
- `email` uniqueness exists and is correct.

---

## 2) `server/src/modules/templates/template.model.js`

Existing indexes:
- `slug` unique (from schema field)
- `{ creatorId: 1, status: 1 }`
- `{ status: 1, madeByFlowbites: 1, createdAt: -1 }`
- `{ category: 1, status: 1 }`
- `{ status: 1, 'stats.purchases': -1 }`
- `{ platform: 1, status: 1 }`
- text index on `title`, `description`

Query patterns observed:
- Public listing: filter by `status`, `category`, `platform`, `madeByFlowbites`, `featured`; sort by `createdAt`, `stats.purchases`, `price`.
- Admin pending queue: `status = pending` sorted by `createdAt`.
- Creator listing: `creatorId` (+status) sorted by `createdAt`.

Assessment:
- Good baseline, but high-traffic list/sort combinations are partially uncovered.

Recommended additions:
- `{ status: 1, createdAt: -1 }` (critical for pending/newest queues) ✅ APPLIED
- `{ status: 1, price: 1 }` (covers `price_low` and reverse scan for `price_high`) ✅ APPLIED
- `{ creatorId: 1, status: 1, createdAt: -1 }` (creator dashboards) ✅ APPLIED
- Optional: `{ status: 1, isFeatured: 1, createdAt: -1 }` for featured filtering ✅ APPLIED

Unique constraint check:
- `slug` uniqueness exists and is correct.

Potential performance note:
- Text search + additional filters may still require heavier plans; consider compound text strategy only if search traffic grows significantly.

---

## 3) `server/src/modules/templates/templateVersion.model.js`

Existing indexes:
- `{ templateId: 1, createdAt: -1 }`
- `{ templateId: 1, version: 1 }` unique

Query patterns observed:
- Version history by template with newest first
- Lookup by template + version

Assessment:
- Indexing is solid.

Recommended additions:
- None.

Unique constraint check:
- One version string per template is enforced correctly.

---

## 4) `server/src/modules/orders/order.model.js`

Existing indexes:
- `orderNumber` unique (from schema field)
- `{ buyerId: 1, createdAt: -1 }`
- `{ status: 1 }`
- `{ createdAt: -1 }`

Query patterns observed:
- Buyer order history by `buyerId`, sorted by `createdAt`
- Admin status aggregates/lists
- Webhook refund sync by `stripeChargeId`

Assessment:
- Buyer/history paths are covered.
- Webhook path is missing a direct index and becomes expensive as order volume grows.

Recommended additions:
- `{ stripeChargeId: 1 }` (high priority) ✅ APPLIED
- Optional: `{ stripePaymentIntentId: 1 }` ✅ APPLIED
- Optional: `{ status: 1, createdAt: -1 }` to replace/augment separate single-field indexes for list screens ✅ APPLIED

Unique constraint check:
- `orderNumber` uniqueness exists and is correct.

---

## 5) `server/src/modules/downloads/license.model.js`

Models in file: `License`, `DownloadToken`

### License
Existing indexes:
- `licenseKey` unique (from schema field)
- `{ buyerId: 1, templateId: 1 }`
- `{ orderId: 1 }`

Query patterns observed:
- License check by `{ buyerId, templateId, isActive }`
- User licenses by `{ buyerId, isActive }` sorted by `createdAt`

Recommended additions:
- `{ buyerId: 1, isActive: 1, createdAt: -1 }` ✅ APPLIED
- Consider unique business constraint: partial unique on active ownership, e.g. `(buyerId, templateId, isActive=true)` if multiple active licenses should never exist.

### DownloadToken
Existing indexes:
- `token` unique (from schema field)
- `{ expiresAt: 1 }`
- `{ used: 1, expiresAt: 1 }`

Query patterns observed:
- Lookup by `token`

Recommended additions:
- Consider TTL on `expiresAt` (`expireAfterSeconds: 0`) if automatic cleanup is desired (currently not TTL).

Unique constraint check:
- `licenseKey` and `token` uniqueness exist and are correct.

---

## 6) `server/src/modules/reviews/review.model.js`

Existing indexes:
- `{ templateId: 1, buyerId: 1 }` unique
- `{ templateId: 1, status: 1, createdAt: -1 }`
- `{ buyerId: 1 }`

Query patterns observed:
- Public template reviews by template/status/date
- Admin moderation list by status/date
- Existence checks by buyer/template

Assessment:
- Public paths are covered well.
- Admin status-only feed lacks a dedicated status/date index.

Recommended additions:
- `{ status: 1, createdAt: -1 }` (admin moderation queue) ✅ APPLIED

Unique constraint check:
- One review per buyer per template is enforced.

---

## 7) `server/src/modules/refunds/refund.model.js`

Existing indexes:
- `{ orderId: 1 }` unique
- `{ buyerId: 1, createdAt: -1 }`
- `{ status: 1, createdAt: -1 }`

Query patterns observed:
- Buyer by `orderId + buyerId`
- Admin by status/date

Assessment:
- Good coverage.

Recommended additions:
- None required.

Unique constraint check:
- One refund per order enforced and aligns with service behavior.

---

## 8) `server/src/modules/notifications/notification.model.js`

Existing indexes:
- `{ userId: 1, createdAt: -1 }`
- `{ userId: 1, read: 1 }`
- TTL index: `{ createdAt: 1 }` expire after 90 days

Query patterns observed:
- User feed by `userId`, optional `read=false`, sorted by newest
- unread count by `userId + read=false`

Assessment:
- Good foundation; unread feed + sort can be improved.

Recommended additions:
- `{ userId: 1, read: 1, createdAt: -1 }`

Unique constraint check:
- No unique constraints needed.

---

## 9) `server/src/modules/wishlists/wishlist.model.js`

Existing indexes:
- `{ userId: 1, templateId: 1 }` unique
- `{ userId: 1, createdAt: -1 }`
- `{ templateId: 1 }`

Query patterns observed:
- User wishlist pages, existence checks, bulk checks, template wishlist counts

Assessment:
- Well indexed.

Recommended additions:
- None.

Unique constraint check:
- Duplicate wishlist entries are prevented correctly.

---

## 10) `server/src/modules/coupons/coupon.model.js`

Models in file: `Coupon`, `CouponUsage`

### Coupon
Existing indexes:
- `code` unique (field + explicit index)
- `{ isActive: 1, expiresAt: 1 }`

Query patterns observed:
- Validate by `code`
- Admin list with `isActive` filter and sort `createdAt`

Recommended additions:
- `{ isActive: 1, createdAt: -1 }` for admin listing path ✅ APPLIED

### CouponUsage
Existing indexes:
- `{ couponId: 1, userId: 1 }`

Query patterns observed:
- Per-user usage count for coupon validation

Recommended additions:
- Optional: `{ userId: 1, createdAt: -1 }` for user-centric coupon history screens (if introduced) ✅ APPLIED

Unique constraint check:
- Coupon `code` uniqueness is correct.
- Consider whether `CouponUsage` should enforce uniqueness per `(couponId, userId, orderId)` depending on business policy.

---

## 11) `server/src/modules/followers/follower.model.js`

Existing indexes:
- `{ followerId: 1, creatorId: 1 }` unique
- `{ creatorId: 1, createdAt: -1 }`
- `{ followerId: 1, createdAt: -1 }`

Query patterns observed:
- Follow checks, following list, followers list, counts

Assessment:
- Well indexed.

Recommended additions:
- None.

Unique constraint check:
- Duplicate follow edges prevented.

---

## 12) `server/src/modules/creators/creator.model.js`

Existing indexes:
- `userId` unique (field)
- `username` unique (field)
- `{ 'stats.totalSales': -1 }`
- `{ createdAt: -1 }`

Query patterns observed:
- Frequent lookups by `userId`, `username`
- Admin queue by `onboarding.status`, sorted by `onboarding.submittedAt`
- Public/sitemap filters by `isVerified`

Assessment:
- Core unique keys are good.
- Onboarding/admin queue path needs dedicated index.

Recommended additions:
- `{ 'onboarding.status': 1, 'onboarding.submittedAt': 1 }` (high priority)
- `{ isVerified: 1, updatedAt: -1 }` (sitemap/public verified creator scans)

Unique constraint check:
- `userId` and `username` uniqueness are correct.

---

## 13) `server/src/modules/services/service.model.js`

Models in file: `ServicePackage`, `ServiceOrder`

### ServicePackage
Existing indexes:
- `slug` unique (field)
- `{ creatorId: 1, templateId: 1 }`
- `{ templateId: 1, isActive: 1 }`
- `{ isActive: 1, category: 1 }`

Query patterns observed:
- Public browse by `isActive`, category, search, sort by completed/createdAt
- Creator package list by `creatorId` sorted by `createdAt`

Recommended additions:
- `{ creatorId: 1, createdAt: -1 }` (creator package screens) ✅ APPLIED
- Optional: text index on `name`/`description` if regex search becomes bottleneck

### ServiceOrder
Existing indexes:
- `orderNumber` unique (field)
- `{ buyerId: 1, status: 1 }`
- `{ creatorId: 1, status: 1 }`
- `{ assignedCreatorId: 1, status: 1 }`
- `{ isGenericRequest: 1, status: 1 }`
- `{ status: 1, dueDate: 1 }`

Query patterns observed:
- Buyer history sorted by `createdAt`
- Creator/assigned queues sorted by `createdAt`
- Admin global lists with optional status

Recommended additions:
- `{ buyerId: 1, createdAt: -1 }` ✅ APPLIED
- `{ creatorId: 1, createdAt: -1 }` ✅ APPLIED
- `{ assignedCreatorId: 1, createdAt: -1 }` ✅ APPLIED
- Optional: `{ status: 1, createdAt: -1 }` for admin lists ✅ APPLIED

Unique constraint check:
- `orderNumber` uniqueness exists and is correct.

---

## 14) `server/src/modules/blog/blog.model.js`

Existing indexes:
- `slug` unique (field)
- `{ category: 1, status: 1 }`
- `{ tags: 1 }`
- `{ publishedAt: -1 }`
- `{ 'stats.views': -1 }`
- `{ status: 1, publishedAt: -1 }`

Query patterns observed:
- Public published list with category/tag/search and sort by published/views
- Featured posts (`status=published, isFeatured=true`) sorted by publishedAt
- Admin list sorted by `createdAt`, optional status

Recommended additions:
- `{ status: 1, isFeatured: 1, publishedAt: -1 }` (featured widgets) ✅ APPLIED
- `{ status: 1, createdAt: -1 }` (admin list) ✅ APPLIED

Performance note:
- Regex-based search across `title/excerpt/tags/authorName` can degrade on large datasets; consider text search strategy if growth continues.

---

## 15) `server/src/modules/auth/token.model.js`

Existing indexes:
- `token` unique (field)
- TTL: `{ expiresAt: 1 }` with `expireAfterSeconds: 0`
- `{ userId: 1, type: 1 }`

Query patterns observed:
- Lookup by token+type+expiry
- Delete prior tokens by user+type

Assessment:
- Good index coverage.

Recommended additions:
- None.

Unique constraint check:
- Token uniqueness is correct.

---

## 16) `server/src/modules/auth/loginAttempt.model.js`

Existing indexes:
- TTL via `createdAt` field (`expires: 86400`)
- `{ email: 1, createdAt: -1 }`
- `{ ip: 1, createdAt: -1 }`

Query patterns observed:
- Count recent failed attempts by `email`, `success=false`, date window
- Clear failures by `email`, `success=false`

Recommended additions:
- `{ email: 1, success: 1, createdAt: -1 }` (more selective lockout queries) ✅ APPLIED

Unique constraint check:
- Not applicable.

---

## 17) `server/src/modules/categories/category.model.js`

Models in file: `Category`, `Tag`

### Category
Existing indexes:
- `name` unique (field)
- `slug` unique (field)
- `{ order: 1 }`

Query patterns observed:
- Active categories sorted by `order`, then `name`

Recommended additions:
- `{ isActive: 1, order: 1, name: 1 }`

### Tag
Existing indexes:
- `name` unique (field)
- `slug` unique (field)
- `{ usageCount: -1 }`

Query patterns observed:
- Top tags sorted by usage count

Assessment:
- Adequate.

---

## 18) `server/src/modules/reports/report.model.js`

Applied indexes in Task 9:
- `{ status: 1, priority: -1, createdAt: -1 }` ✅ APPLIED

Rationale:
- Admin list path sorts by priority + newest while filtering by status.

---

## 19) `server/src/modules/audit/auditLog.model.js`

Applied indexes in Task 9:
- `{ targetType: 1, targetId: 1, createdAt: -1 }` ✅ APPLIED

Rationale:
- Target-specific audit timeline queries sort by newest and filter by target tuple.

---

## 20) `server/src/modules/withdrawals/withdrawal.model.js`

Applied indexes in Task 9:
- `{ creatorId: 1, status: 1, createdAt: -1 }` ✅ APPLIED

Rationale:
- Supports creator/status queue views and pending-withdrawal checks efficiently.

---

## 21) `server/src/modules/tickets/ticket.model.js`

Applied indexes in Task 9:
- `{ userId: 1, status: 1, updatedAt: -1 }` ✅ APPLIED
- `{ assignedTo: 1, status: 1, updatedAt: -1 }` ✅ APPLIED

Rationale:
- Improves "my tickets" and assigned-admin queues sorted by most recently updated.

---

## Suggested Implementation Order (for Claude)

1. `Order`: `stripeChargeId` (and optionally `stripePaymentIntentId`)
2. `Template`: `status+createdAt`, `status+price`, `creatorId+status+createdAt`
3. `CreatorProfile`: onboarding queue index
4. `ServiceOrder`: timeline/list indexes with `createdAt`
5. `Notification`: unread feed compound index
6. Remaining medium-priority optimizations (`Blog`, `Category`, `LoginAttempt`, etc.)
