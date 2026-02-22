# Flowbites Marketplace API Reference

Base URL: `http://localhost:5000/api`

## Conventions
- Success response envelope: `{ "success": true, "data": ... }`
- Error response envelope: `{ "success": false, "error": "..." }`
- Auth token: `Authorization: Bearer <accessToken>` (or `accessToken` cookie)
- Role rules:
  - `authorize('admin')` allows `admin` and `super_admin`
  - `requireAdmin` allows `admin` and `super_admin`

## Rate Limits
- Global: all `/api/*` -> `100 requests / 15 minutes`
- Auth hard limits:
  - `POST /api/auth/login` -> `15 requests / 15 minutes`
  - `POST /api/auth/register` -> `15 requests / 15 minutes`
  - `POST /api/auth/forgot-password` -> `15 requests / 15 minutes`
- Per-user limits:
  - `POST /api/coupons/validate` -> `10 requests / minute`
  - `POST /api/wishlists/:templateId` and `DELETE /api/wishlists/:templateId` -> `30 requests / minute`

---

## Auth (`/api/auth`)

### `POST /api/auth/register`
- Auth: Public
- Body (validated):
  - `email` (email, required)
  - `password` (string, min 6, required)
  - `name` (string, 1-100, required)
  - `role` (`buyer | creator`, optional, default `buyer`)
- Response: `{ user, accessToken }` (refresh token is set in cookie)

### `POST /api/auth/login`
- Auth: Public
- Body (validated):
  - `email` (email, required)
  - `password` (string, required)
- Response: `{ user, accessToken }` (refresh token is set in cookie)

### `POST /api/auth/refresh`
- Auth: Public (requires refresh token in body or cookie)
- Body: `refreshToken` optional if cookie is present
- Response: `{ accessToken, user }`

### `POST /api/auth/logout`
- Auth: Any authenticated user
- Body: optional `refreshToken`
- Response: `{ message: "Logged out successfully" }`

### `GET /api/auth/me`
- Auth: Any authenticated user
- Response: `{ user }`

### `PATCH /api/auth/profile`
- Auth: Any authenticated user
- Body: supports `name`, `bio`
- Response: `{ user }`

### `POST /api/auth/change-password`
- Auth: Any authenticated user
- Body:
  - `currentPassword` (required)
  - `newPassword` (required, min 6)
- Response: `{ message: "Password changed successfully" }`

### `POST /api/auth/forgot-password`
- Auth: Public
- Body (validated): `email`
- Response: generic success message (does not reveal account existence)

### `POST /api/auth/reset-password`
- Auth: Public
- Body (validated):
  - `token` (required)
  - `newPassword` (required, min 6)
- Response: `{ message: "Password has been reset successfully" }`

### `GET /api/auth/verify-email`
- Auth: Public
- Query: `token` (required)
- Response: `{ message: "Email verified successfully" }`

### `POST /api/auth/resend-verification`
- Auth: Any authenticated user
- Response: `{ message: "Verification email sent" }`

---

## Templates (`/api/templates`)

### `GET /api/templates`
- Auth: Public
- Cache: 60s
- Query:
  - `q`, `category` (id or slug), `platform` (`webflow|framer|wix`), `madeBy` (`flowbites|community`), `featured`, `sort` (`newest|popular|price_low|price_high`), `page`, `limit`, `status`
- Response: `{ templates: [...], pagination: { page, limit, total, pages } }`

### `GET /api/templates/:id`
- Auth: Public
- Cache: 30s
- Notes: `:id` accepts Mongo ObjectId or slug
- Response: template document

### `GET /api/templates/my-templates`
- Auth: `creator`, `admin`, `super_admin`
- Query: same paging/filter model as list
- Response: `{ templates: [...], pagination: ... }`

### `POST /api/templates`
- Auth: `creator`, `admin`, `super_admin`
- Content-Type: `multipart/form-data`
- Files:
  - `thumbnail` (required, 1)
  - `gallery` (optional, up to 5)
  - `templateFile` (required for file-based delivery)
- Body (validated):
  - `title`, `description`, `platform`, `category`, `price`
  - optional: `tags[]`, `licenseType`, `deliveryType`, `deliveryUrl`, `demoUrl`, `metaDescription`
- Response: created template

### `PATCH /api/templates/:id`
- Auth: `creator`, `admin`, `super_admin` (owner checks in service)
- Content-Type: `multipart/form-data` (optional files)
- Body (validated optional fields): `title`, `description`, `platform`, `category`, `tags[]`, `price`, `licenseType`, `deliveryType`, `deliveryUrl`, `demoUrl`, `status`
- Response: updated template

### `DELETE /api/templates/:id`
- Auth: `creator`, `admin`, `super_admin` (owner checks in service)
- Response: `{ message: "Template deleted successfully" }`

### `POST /api/templates/:id/submit`
- Auth: `creator`, `admin`, `super_admin`
- Response: submitted template

---

## Template Versions (`/api/templates/:templateId/versions`)

### `GET /api/templates/:templateId/versions`
- Auth: Public
- Query: `page`, `limit`
- Response: paginated version history

### `GET /api/templates/:templateId/versions/latest`
- Auth: Public
- Response: latest version

### `GET /api/templates/:templateId/versions/:version`
- Auth: Public
- Response: specific version

### `POST /api/templates/:templateId/versions`
- Auth: `creator`, `admin`, `super_admin`
- Body: `version`, optional `releaseNotes`, optional `changes[]`
- Response: created version

### `DELETE /api/templates/:templateId/versions/:version`
- Auth: `creator`, `admin`, `super_admin`
- Response: deletion result

---

## Orders (`/api/orders`)

### `POST /api/orders`
- Auth: Any authenticated user
- Body: `items` (array)
- Response: created order

### `POST /api/orders/mock-checkout`
- Auth: Any authenticated user
- Body: `orderId`
- Response: updated order

### `GET /api/orders/my-orders`
- Auth: Any authenticated user
- Response: current user's orders

### `GET /api/orders/:id`
- Auth: Any authenticated user (ownership/visibility checks in service)
- Response: order details

---

## Checkout (`/api/checkout`)

### `POST /api/checkout/template`
- Auth: Any authenticated user
- Body:
  - `items` (required): array of `{ templateId, price? }`
  - `couponCode` (optional)
- Response:
  - Stripe mode: `{ sessionUrl, orderId }`
  - Demo mode: `{ sessionUrl, orderId, demoMode: true }`

### `POST /api/checkout/service`
- Auth: Any authenticated user
- Body:
  - `packageId` (required)
  - `requirements` (optional)
- Response:
  - Stripe mode: `{ sessionUrl, serviceOrderId }`
  - Demo mode: `{ sessionUrl, serviceOrderId, demoMode: true }`

---

## Stripe Webhook (`/api/webhooks`)

### `POST /api/webhooks/stripe`
- Auth: Stripe signature validation (`stripe-signature`)
- Content-Type: `application/json` raw body
- Events handled:
  - `checkout.session.completed`
  - `charge.refunded`
- Response: `{ received: true }` (or `{ received: true, demoMode: true }` in demo mode)

---

## Downloads (`/api/downloads`)

### `POST /api/downloads/token`
- Auth: Any authenticated user
- Body: `templateId`
- Response: download token payload

### `GET /api/downloads/:token`
- Auth: Public token-based access
- Response: binary file download (`res.download`)

### `GET /api/downloads/licenses/my-licenses`
- Auth: Any authenticated user
- Response: user's license list

---

## Services (`/api/services`)

### Packages
- `GET /api/services/packages/browse` (Public) -> paginated/filterable package listing
- `GET /api/services/packages/:slug` (Public) -> package detail
- `GET /api/services/packages?templateId=...` (Public) -> packages for one template
- `GET /api/services/packages/mine` (Auth: `creator|admin|super_admin`) -> creator's packages
- `POST /api/services/packages` (Auth: `creator|admin|super_admin`) -> create package

### Generic Customization
- `POST /api/services/request-customization`
  - Auth: any authenticated user
  - Body: `templateId`, `requirements`, optional `attachments`
  - Response: created service order

### Service Orders
- `POST /api/services/orders`
  - Auth: any authenticated user
  - Body: `packageId`, `requirements`, optional `attachments`
- `GET /api/services/orders/my-orders` (Auth required)
- `GET /api/services/orders/:id` (Auth required)
- `POST /api/services/orders/:id/messages`
  - Auth required
  - Body: `message`
- `PATCH /api/services/orders/:id/status`
  - Auth: `creator|admin|super_admin`
  - Body: `{ status, ...extraFields }`
- `PATCH /api/services/orders/:id/buyer-status`
  - Auth required
  - Body: `{ status }`
- `POST /api/services/orders/:id/cancel`
  - Auth required
  - Body: `{ reason }`
- `POST /api/services/orders/:id/dispute`
  - Auth required
  - Body: `{ reason }`

### Admin Service Ops
- `GET /api/services/admin/orders` (Auth: `admin|super_admin`)
- `GET /api/services/admin/creators` (Auth: `admin|super_admin`)
- `PATCH /api/services/admin/orders/:id/reassign`
  - Auth: `admin|super_admin`
  - Body: `{ assignedCreatorId, price? }`
- `PATCH /api/services/admin/orders/:id/resolve-dispute`
  - Auth: `admin|super_admin`
  - Body: `{ resolution, outcome }`

---

## UI Shorts (`/api/ui-shorts`)

- `GET /api/ui-shorts` (Public) -> shots feed
- `POST /api/ui-shorts` (Auth: `creator|admin|super_admin`, multipart `shotImage`) -> create shot
- `POST /api/ui-shorts/:id/like` (Auth required) -> toggle like
- `POST /api/ui-shorts/:id/save` (Auth required) -> toggle save

---

## Admin (`/api/admin`)
All routes in this section require `authenticate + authorize('admin')` (`admin` or `super_admin`).

### Dashboard
- `GET /api/admin/dashboard-stats`

### Templates
- `GET /api/admin/templates/pending`
- `GET /api/admin/templates/stats`
- `GET /api/admin/templates/export` (CSV download)
- `POST /api/admin/templates/bulk`
  - Body: `{ action, templateIds[], reason? }`
- `GET /api/admin/templates`
- `GET /api/admin/templates/:id`
- `PATCH /api/admin/templates/:id`
- `DELETE /api/admin/templates/:id`
- `POST /api/admin/templates/:id/approve`
- `POST /api/admin/templates/:id/reject`
  - Body: `{ reason }`

### Creators
- `GET /api/admin/creators/pending`
- `GET /api/admin/creators`
- `GET /api/admin/creators/:id`
- `POST /api/admin/creators/:id/approve`
- `POST /api/admin/creators/:id/reject`
  - Body: `{ reason }`

### Categories (admin)
- `PATCH /api/admin/categories/:id`
- `DELETE /api/admin/categories/:id`
- `POST /api/admin/categories/reorder`
  - Body: `{ categories: [...] }`

---

## Analytics (`/api/analytics`)

### `POST /api/analytics/event`
- Auth: Optional (works anonymous or authenticated)
- Body:
  - `eventName` (required)
  - `metadata` (optional object)
  - `anonymousId` (optional)
- Response: created analytics event

### `GET /api/analytics/metrics`
- Auth: `admin`, `super_admin`
- Query: `startDate`, `endDate`
- Response: funnel metrics payload

---

## Categories (`/api`)

### `GET /api/categories`
- Auth: Public
- Response: category list

### `GET /api/tags`
- Auth: Public
- Query: `limit` (optional)
- Response: tag list

### `POST /api/categories`
- Auth: `admin`, `super_admin`
- Body: category payload
- Response: created category

---

## Creators (`/api/creators`)

### Onboarding & Connect (auth required, `creator|admin|super_admin`)
- `GET /api/creators/onboarding/status`
- `POST /api/creators/onboarding/personal-info`
- `POST /api/creators/onboarding/government-id` (multipart: `govIdFront`, `govIdBack`)
- `POST /api/creators/onboarding/selfie` (multipart: `selfieWithId`)
- `POST /api/creators/onboarding/bank-details`
- `POST /api/creators/onboarding/creator-reference`
- `POST /api/creators/onboarding/submit`
- `GET /api/creators/onboarding/search?q=...`

### Stripe Connect
- `POST /api/creators/connect/onboard`
- `GET /api/creators/connect/status`
- `GET /api/creators/connect/dashboard`

### Public creator pages
- `GET /api/creators/:identifier`
  - Query: `templatesPage`, `templatesLimit`, `shotsPage`, `shotsLimit`
- `GET /api/creators/:identifier/templates`
  - Query: `page`, `limit`
- `GET /api/creators/:identifier/shots`
  - Query: `page`, `limit`

---

## Blog (`/api/blog`)

### Public
- `GET /api/blog`
  - Query: `page`, `limit`, `category`, `tag`, `search|q`, `sort`
- `GET /api/blog/categories`
- `GET /api/blog/tags`
- `GET /api/blog/featured`
- `GET /api/blog/:slug`

### Authenticated (`admin|creator|super_admin`)
- `POST /api/blog` (multipart optional `coverImage`)
- `PATCH /api/blog/:id`
- `DELETE /api/blog/:id`

### Admin-only
- `GET /api/blog/admin/all`
  - Query: `page`, `limit`, `status`, `search`
- `GET /api/blog/admin/:id`

---

## Sitemap (`/api`)

### `GET /api/sitemap.xml`
- Auth: Public
- Response: dynamic XML sitemap
- Cache-Control: public, max-age=3600

---

## Reviews (`/api/reviews`)

### Public
- `GET /api/reviews/template/:templateId`
  - Query: `page`, `limit`
  - Response: `{ reviews, total, summary, pagination }`

### Authenticated
- `GET /api/reviews/check/:templateId` -> `{ reviewed: boolean }`
- `POST /api/reviews/template/:templateId`
  - Body (validated): `rating` (1-5), `title` (1-150), `comment` (1-2000)
- `PATCH /api/reviews/:reviewId`
  - Body (validated): optional `rating`, `title`, `comment`
- `DELETE /api/reviews/:reviewId`
  - Response: `{ success: true, message: "Review deleted" }`

### Admin
- `GET /api/reviews/admin/all`
  - Query: `page`, `limit`, `status`
- `PATCH /api/reviews/admin/:reviewId/moderate`
  - Body (validated):
    - `status`: `approved | rejected`
    - `rejectionReason?` (max 500)

---

## Refunds (`/api/refunds`)

### Buyer
- `POST /api/refunds/request`
  - Body (validated): `orderId`, `reason`
- `GET /api/refunds/order/:orderId`

### Admin
- `GET /api/refunds/admin`
  - Query: `page`, `limit`, `status`
- `POST /api/refunds/admin/:refundId/approve`
- `POST /api/refunds/admin/:refundId/reject`
  - Body (validated): `adminNote?` (max 500)

---

## Notifications (`/api/notifications`)
All routes require authentication.

- `GET /api/notifications`
  - Query: `page`, `limit`, `unreadOnly=true|false`
- `GET /api/notifications/unread-count`
- `PATCH /api/notifications/read-all`
- `PATCH /api/notifications/:id/read`
- `DELETE /api/notifications/:id`

---

## Wishlists (`/api/wishlists`)

### Public
- `GET /api/wishlists/count/:templateId`

### Authenticated
- `GET /api/wishlists`
  - Query: `page`, `limit`
- `GET /api/wishlists/check/:templateId`
- `POST /api/wishlists/check-bulk`
  - Body: `{ templateIds: string[] }`
- `POST /api/wishlists/:templateId` (rate limited)
- `DELETE /api/wishlists/:templateId` (rate limited)

---

## Coupons (`/api/coupons`)

### Buyer
- `POST /api/coupons/validate` (auth + rate limited)
- Body (validated):
  - `code` (required)
  - `orderAmount` (positive number)
  - `itemType` (`templates|services`, optional)
- Response: `{ valid, discount, finalAmount, couponId, code, discountType, discountValue }`

### Admin
- `GET /api/coupons/admin`
  - Query: `page`, `limit`, `active`
- `POST /api/coupons/admin`
  - Body (validated): `code`, `discountType`, `discountValue`, `expiresAt`, plus optional coupon rules
- `PATCH /api/coupons/admin/:couponId`
- `DELETE /api/coupons/admin/:couponId`

---

## Followers (`/api/followers`)

### Public
- `GET /api/followers/count/:creatorId`

### Authenticated
- `GET /api/followers/following`
  - Query: `page`, `limit`
- `GET /api/followers/check/:creatorId`
- `GET /api/followers/creator/:creatorId`
  - Query: `page`, `limit`
- `POST /api/followers/:creatorId`
- `DELETE /api/followers/:creatorId`

---

## Earnings (`/api/earnings`)
All routes require `authenticate + authorize('creator')` (also allows `admin`/`super_admin` via middleware behavior).

### `GET /api/earnings/summary`
- Auth: `creator`, `admin`, `super_admin`
- Query: none
- Response:
  - `totalEarnings`, `totalPlatformFees`, `totalSales`, `availableBalance`
  - `monthlyEarnings[]` (`month`, `earnings`, `sales`) for last 12 months
  - `topTemplates[]` (`templateId`, `title`, `earnings`, `sales`)
- Rate limits: global `/api` limit only

### `GET /api/earnings/transactions`
- Auth: `creator`, `admin`, `super_admin`
- Query: `page` (default `1`), `limit` (default `20`)
- Response: `{ transactions: [...], pagination: { page, limit, total, pages } }`
- Rate limits: global `/api` limit only

---

## Search (`/api/search`)

### `GET /api/search/autocomplete`
- Auth: Public
- Cache: 15 seconds
- Query:
  - `q` (string, minimum 2 chars; returns empty array if too short)
- Response: array of template suggestions (`title`, `slug`, `platform`, `price`, `thumbnail`)
- Rate limits: global `/api` limit only

### `GET /api/search/popular`
- Auth: Public
- Cache: 120 seconds
- Query: none
- Response: top 10 approved templates sorted by `stats.views`
- Rate limits: global `/api` limit only

---

## Settings (`/api/settings`)
All routes require authentication.

### `PATCH /api/settings/profile`
- Auth: Any authenticated user
- Body: any subset of `name`, `bio`, `avatar` (other fields ignored)
- Response: updated user object
- Rate limits: global `/api` limit only

### `POST /api/settings/change-password`
- Auth: Any authenticated user
- Body:
  - `currentPassword` (required)
  - `newPassword` (required, minimum 6)
- Response: `{ message: "Password changed successfully" }`
- Notes: clears all refresh tokens after password change
- Rate limits: global `/api` limit only

### `GET /api/settings/email-preferences`
- Auth: Any authenticated user
- Response: email preference object
- Rate limits: global `/api` limit only

### `PATCH /api/settings/email-preferences`
- Auth: Any authenticated user
- Body (all optional booleans):
  - `orderConfirmations`, `reviewNotifications`, `promotionalEmails`, `weeklyDigest`, `newFollowerAlert`
- Response: updated email preference object
- Rate limits: global `/api` limit only

### `POST /api/settings/deactivate`
- Auth: Any authenticated user
- Body: `password` (required)
- Response: `{ message: "Account deactivated" }`
- Notes: sets `isActive=false` and clears refresh tokens
- Rate limits: global `/api` limit only

---

## Reports (`/api/reports`)

### `POST /api/reports`
- Auth: Any authenticated user
- Body:
  - `targetType` (`template|review|creator|user`, required)
  - `targetId` (ObjectId, required)
  - `reason` (`spam|inappropriate_content|copyright_violation|fake_review|misleading|offensive|scam|other`, required)
  - `description` (required, max 1000)
- Response: created report document
- Rate limits:
  - per-user: `5 requests / hour` on this endpoint
  - plus global `/api` limit

### `GET /api/reports/admin`
- Auth: `admin`, `super_admin`
- Query: `page`, `limit`, `status`, `targetType`, `priority`
- Response: `{ reports: [...], pagination: { page, limit, total, pages } }`
- Rate limits: global `/api` limit only

### `GET /api/reports/admin/stats`
- Auth: `admin`, `super_admin`
- Response: `{ total, pending, byReason }`
- Rate limits: global `/api` limit only

### `GET /api/reports/admin/:id`
- Auth: `admin`, `super_admin`
- Response: report with populated reporter and resolver metadata
- Rate limits: global `/api` limit only

### `POST /api/reports/admin/:id/resolve`
- Auth: `admin`, `super_admin`
- Body:
  - `adminNote` (optional)
  - `actionTaken` (`none|content_removed|user_warned|user_banned|other`, optional)
- Response: updated report (`status=resolved`)
- Rate limits: global `/api` limit only

### `POST /api/reports/admin/:id/dismiss`
- Auth: `admin`, `super_admin`
- Body: `adminNote` (optional)
- Response: updated report (`status=dismissed`)
- Rate limits: global `/api` limit only

---

## Admin Audit Logs (`/api/admin/audit`)
All routes require `authenticate + authorize('admin')`.

### `GET /api/admin/audit`
- Auth: `admin`, `super_admin`
- Query: `page`, `limit`, `action`, `adminId`, `targetType`, `startDate`, `endDate`
- Response: `{ logs: [...], pagination: { page, limit, total, pages } }`
- Rate limits: global `/api` limit only

### `GET /api/admin/audit/stats`
- Auth: `admin`, `super_admin`
- Response: `{ total, last24h, recentActions }`
- Rate limits: global `/api` limit only

### `GET /api/admin/audit/:targetType/:targetId`
- Auth: `admin`, `super_admin`
- Response: recent audit entries (up to 100) for target
- Rate limits: global `/api` limit only

---

## Withdrawals (`/api/withdrawals`)

### Creator/Admin Access (`creator|admin|super_admin`)
- `GET /api/withdrawals/balance`
  - Response: `{ totalEarnings, totalWithdrawn, availableBalance, pendingWithdrawals }`
- `GET /api/withdrawals/my`
  - Query: `page`, `limit`
  - Response: `{ withdrawals: [...], pagination }`
- `POST /api/withdrawals/request`
  - Body: `amount` (min 10), `payoutMethod?` (`stripe_connect|bank_transfer|paypal`), `note?`
  - Response: created withdrawal request (`status=pending`)
  - Validation behavior from service:
    - amount must be >= 10
    - cannot exceed available balance
    - only one pending request allowed
- Rate limits: global `/api` limit only

### Admin-only
- `GET /api/withdrawals/admin`
  - Query: `page`, `limit`, `status`
  - Response: paginated withdrawals with creator/admin population
- `POST /api/withdrawals/admin/:id/approve`
  - Response: withdrawal updated to `approved`
- `POST /api/withdrawals/admin/:id/reject`
  - Body: `adminNote?`
  - Response: withdrawal updated to `rejected`
- `POST /api/withdrawals/admin/:id/complete`
  - Body: `stripeTransferId?`
  - Response: withdrawal updated to `completed`
- Rate limits: global `/api` limit only

---

## Tickets (`/api/tickets`)
All routes require authentication unless noted otherwise.

### User routes
- `POST /api/tickets`
  - Body: `subject`, `category`, `message`, `priority?`
  - Response: created ticket with first message
- `GET /api/tickets/my`
  - Query: `page`, `limit`, `status`
  - Response: `{ tickets: [...], pagination }`
- `GET /api/tickets/:id`
  - Response: full ticket detail with messages
  - Access: owner or admin only (enforced in service)
- `POST /api/tickets/:id/reply`
  - Body: `message`
  - Response: updated ticket
- `POST /api/tickets/:id/close`
  - Response: updated ticket (`status=closed`)
- Rate limits: global `/api` limit only

### Admin routes
- `GET /api/tickets/admin/all`
  - Query: `page`, `limit`, `status`, `category`, `priority`, `assignedTo`
  - Response: `{ tickets: [...], pagination }`
- `GET /api/tickets/admin/stats`
  - Response: `{ total, open, byStatus, byCategory }`
- `POST /api/tickets/admin/:id/assign`
  - Body: `assignToId`
  - Response: updated ticket
- `POST /api/tickets/admin/:id/resolve`
  - Response: updated ticket (`status=resolved`)
- Rate limits: global `/api` limit only

---

## Admin User Management (`/api/admin/users`)
All routes require `authenticate + authorize('admin')`.

### `GET /api/admin/users/stats`
- Auth: `admin`, `super_admin`
- Response: `{ total, active, banned, byRole, recentSignups }`
- Rate limits: global `/api` limit only

### `GET /api/admin/users`
- Auth: `admin`, `super_admin`
- Query: `page`, `limit`, `role`, `search`, `active`
- Response: `{ users: [...], pagination: { page, limit, total, pages } }`
- Rate limits: global `/api` limit only

### `GET /api/admin/users/:id`
- Auth: `admin`, `super_admin`
- Response: single user details (without refresh tokens)
- Rate limits: global `/api` limit only

### `POST /api/admin/users/:id/ban`
- Auth: `admin`, `super_admin`
- Body: none
- Response: `{ message }`
- Guardrails:
  - cannot ban self
  - cannot ban `admin` or `super_admin`
- Rate limits: global `/api` limit only

### `POST /api/admin/users/:id/unban`
- Auth: `admin`, `super_admin`
- Body: none
- Response: `{ message }`
- Rate limits: global `/api` limit only

### `PATCH /api/admin/users/:id/role`
- Auth: `admin`, `super_admin`
- Body: `role` (`buyer|creator|admin`)
- Response: `{ message, user }`
- Guardrails:
  - cannot change own role
  - cannot modify `super_admin`
- Rate limits: global `/api` limit only

---

## Health Check

### `GET /health`
- Auth: Public
- Response: `{ success: true, message: "Flowbites Marketplace API is running" }`

---

## Example Requests & Responses (Top 5)

### 1) Register - `POST /api/auth/register`
Request:
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Alex Buyer",
  "email": "alex@example.com",
  "password": "secret123",
  "role": "buyer"
}
```

Response (201):
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "65f1...",
      "name": "Alex Buyer",
      "email": "alex@example.com",
      "role": "buyer",
      "emailVerified": false
    },
    "accessToken": "eyJhbGci..."
  }
}
```

### 2) Login - `POST /api/auth/login`
Request:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "alex@example.com",
  "password": "secret123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "65f1...",
      "name": "Alex Buyer",
      "email": "alex@example.com",
      "role": "buyer"
    },
    "accessToken": "eyJhbGci..."
  }
}
```

### 3) Template Checkout - `POST /api/checkout/template`
Request:
```http
POST /api/checkout/template
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    { "templateId": "65fa..." }
  ],
  "couponCode": "SAVE20"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "sessionUrl": "https://checkout.stripe.com/c/pay/cs_test_...",
    "orderId": "6601..."
  }
}
```

### 4) List Templates - `GET /api/templates`
Request:
```http
GET /api/templates?q=saas&platform=webflow&sort=popular&page=1&limit=12
```

Response:
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "_id": "65fa...",
        "title": "SaaSly",
        "platform": "webflow",
        "price": 79,
        "stats": { "views": 1200, "purchases": 84 }
      }
    ],
    "pagination": { "page": 1, "limit": 12, "total": 43, "pages": 4 }
  }
}
```

### 5) Template Detail - `GET /api/templates/:id`
Request:
```http
GET /api/templates/saasly-pro
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "65fa...",
    "slug": "saasly-pro",
    "title": "SaaSly Pro",
    "description": "A conversion-focused SaaS template",
    "platform": "webflow",
    "price": 79,
    "status": "approved",
    "category": { "_id": "65c...", "name": "SaaS", "slug": "saas" },
    "creatorProfileId": { "displayName": "Flow Designer", "username": "flowdesigner" },
    "stats": { "views": 1201, "purchases": 84, "rating": 4.8 }
  }
}
```

## Example Requests & Responses (New Modules)

### 6) Submit Report - `POST /api/reports`
Request:
```http
POST /api/reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetType": "template",
  "targetId": "67a1...",
  "reason": "copyright_violation",
  "description": "This template appears copied from another marketplace listing."
}
```

Response (201):
```json
{
  "success": true,
  "data": {
    "_id": "67b2...",
    "reporterId": "66f0...",
    "targetType": "template",
    "targetId": "67a1...",
    "reason": "copyright_violation",
    "priority": "high",
    "status": "pending"
  }
}
```

### 7) Request Withdrawal - `POST /api/withdrawals/request`
Request:
```http
POST /api/withdrawals/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 125.5,
  "payoutMethod": "stripe_connect",
  "note": "Weekly payout"
}
```

Response (201):
```json
{
  "success": true,
  "data": {
    "_id": "67c3...",
    "creatorId": "66f0...",
    "amount": 125.5,
    "currency": "usd",
    "status": "pending",
    "payoutMethod": "stripe_connect"
  }
}
```

### 8) Earnings Summary - `GET /api/earnings/summary`
Request:
```http
GET /api/earnings/summary
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "totalEarnings": 3421.75,
    "totalPlatformFees": 604.42,
    "totalSales": 89,
    "availableBalance": 3421.75,
    "monthlyEarnings": [
      { "month": "2026-01", "earnings": 480.25, "sales": 12 }
    ],
    "topTemplates": [
      { "templateId": "67a1...", "title": "SaaS Plus", "earnings": 1210, "sales": 24 }
    ]
  }
}
```

### 9) Create Ticket - `POST /api/tickets`
Request:
```http
POST /api/tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Checkout charged but no download",
  "category": "billing",
  "priority": "high",
  "message": "My card was charged but the order still shows pending."
}
```

Response (201):
```json
{
  "success": true,
  "data": {
    "_id": "67d4...",
    "userId": "66f0...",
    "subject": "Checkout charged but no download",
    "category": "billing",
    "status": "open",
    "messages": [
      { "message": "My card was charged but the order still shows pending.", "isStaffReply": false }
    ]
  }
}
```

### 10) Audit Log List - `GET /api/admin/audit`
Request:
```http
GET /api/admin/audit?page=1&limit=20&action=user_banned
Authorization: Bearer <admin-token>
```

Response:
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "67e5...",
        "action": "user_banned",
        "targetType": "user",
        "targetId": "66aa...",
        "adminId": { "_id": "6601...", "name": "Admin User", "email": "admin@flowbites.com" },
        "createdAt": "2026-02-20T14:22:31.000Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 13, "pages": 1 }
  }
}
```
