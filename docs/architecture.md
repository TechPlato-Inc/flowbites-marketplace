# Architecture

## System Overview

```text
[ Browser / Mobile Web ]
          |
          v
[ Next.js 16 App Router ]  (next-client)
          |
          |  /api/* and /uploads/*
          v
[ Express API ]            (server)
    |         |         |
    |         |         +--> [ Resend ] (transactional email)
    |         +------------> [ Cloudinary ] (image storage/CDN)
    +----------------------> [ Stripe ] (checkout, connect, webhooks)
              |
              v
          [ MongoDB ]
```

## Runtime Topology (Docker Production)

```text
internet
   |
   v
[ Nginx :80/:443 ]
   |---- /api/*, /uploads/* ----> [ api container :5000 ]
   |---- everything else --------> [ client container :3000 ]

[ api ] <----> [ mongodb ]
[ certbot ] manages TLS certificates for nginx
```

## Backend Module Dependencies

```text
auth -> users, creators, token, loginAttempt, email service
checkout -> orders, templates, licenses, creators, services, coupons, notifications, stripe
refunds -> refunds, orders, licenses, notifications, email, stripe
templates -> templates, categories, creators
template versions -> templateVersion, templates, notifications
services -> servicePackage, serviceOrder, templates, users
admin -> templates, creators, users, orders, refunds, reviews, categories, notifications
downloads -> licenses, templates
reviews -> reviews, templates, orders, creators, notifications
wishlists -> wishlist, templates
followers -> follower, creators, notifications
blog -> blog posts
analytics -> analytics events/metrics
```

## Data Flows

### Checkout Flow (Template Purchase)

```text
Buyer -> POST /api/checkout/template
      -> CheckoutService:
         1) load templates, verify approved + not already licensed
         2) compute subtotal/platform fee
         3) optionally validate coupon
         4) create Order(status=pending)
         5) create Stripe Checkout session (or demo auto-fulfill)

Stripe webhook checkout.session.completed -> /api/webhooks/stripe
      -> fulfillTemplateOrder:
         1) set Order(status=paid)
         2) create License records
         3) increment Template stats
         4) transfer payout via Stripe Connect (async)
         5) send notifications + purchase email
```

### Refund Flow

```text
Buyer -> POST /api/refunds/request
      -> validate ownership + paid status + 14-day window
      -> create Refund(status=requested)

Admin -> POST /api/refunds/admin/:id/approve
      -> Stripe refund call (or demo)
      -> Refund(status=processed)
      -> Order(status=refunded)
      -> deactivate licenses
      -> notify + email buyer
```

### Creator Onboarding Flow

```text
Creator -> /api/creators/onboarding/* steps
  personal-info -> government-id -> selfie -> bank-details -> creator-reference

Each step -> updates CreatorProfile.onboarding + completedSteps

Creator -> POST /api/creators/onboarding/submit
       -> requires all required steps
       -> onboarding.status=submitted

Admin reviews -> /api/admin/creators/:id/approve|reject
       -> onboarding.status=approved|rejected
```

### Authentication Flow

```text
Register -> POST /api/auth/register
         -> create User (+ CreatorProfile if role=creator)
         -> issue access + refresh tokens
         -> send welcome + verification email

Verify Email -> GET /api/auth/verify-email?token=...

Login -> POST /api/auth/login
      -> check lockout window + password
      -> issue tokens + persist refresh token

Refresh -> POST /api/auth/refresh
        -> verify refresh token signature + token presence
        -> issue new access token

Logout -> POST /api/auth/logout
       -> remove refresh token + clear cookies
```

## Database Schema Relationships

### Core Entities

**User**
- 1:1 `CreatorProfile` via `CreatorProfile.userId`
- 1:N `Order.buyerId`, `ServiceOrder.buyerId`, `ServiceOrder.creatorId`
- 1:N `Notification.userId`

**Template**
- N:1 `Template.creatorId -> User`
- N:1 `Template.creatorProfileId -> CreatorProfile`
- N:1 `Template.category -> Category`
- 1:N `TemplateVersion.templateId`
- 1:N `Review.templateId`
- 1:N `License.templateId`
- 1:N `Wishlist.templateId`

**Order**
- N:1 `Order.buyerId -> User`
- 1:N `License.orderId`
- 1:1 `Refund.orderId` (unique)

**ServicePackage**
- N:1 `ServicePackage.creatorId -> User`
- N:1 `ServicePackage.templateId -> Template`

**ServiceOrder**
- N:1 `ServiceOrder.packageId -> ServicePackage`
- N:1 `ServiceOrder.buyerId/creatorId -> User`

**Review**
- N:1 `Review.orderId -> Order`
- N:1 `Review.buyerId -> User`

**Follower**
- Unique edge `(followerId -> creatorId)` between users

## Database Indexes

### Critical Indexes (Applied)

| Collection | Index | Purpose |
|------------|-------|---------|
| `users` | `email` unique | Authentication |
| `users` | `{ role: 1 }` | Role filtering |
| `templates` | `slug` unique | URL lookup |
| `templates` | `{ status: 1, createdAt: -1 }` | Newest listings |
| `templates` | `{ status: 1, price: 1 }` | Price sorting |
| `templates` | `{ creatorId: 1, status: 1, createdAt: -1 }` | Creator dashboards |
| `templates` | `{ status: 1, isFeatured: 1, createdAt: -1 }` | Featured filtering |
| `templates` | Text index on `title`, `description` | Search |
| `orders` | `{ buyerId: 1, createdAt: -1 }` | Order history |
| `orders` | `{ stripeChargeId: 1 }` | Webhook lookups |
| `orders` | `{ stripePaymentIntentId: 1 }` | Payment tracking |
| `licenses` | `{ userId: 1, templateId: 1 }` | License checks |
| `reviews` | `{ templateId: 1, createdAt: -1 }` | Template reviews |
| `reviews` | `{ buyerId: 1, templateId: 1 }` | Duplicate prevention |
| `notifications` | `{ userId: 1, read: 1, createdAt: -1 }` | Unread feed |
| `loginAttempts` | `{ email: 1, createdAt: -1 }` | Brute force detection |
| `coupons` | `code` unique | Coupon lookup |

### Residual Index Recommendations

- `CreatorProfile`: `{ 'onboarding.status': 1, 'onboarding.submittedAt': 1 }` for admin review queue
- `ServiceOrder`: `{ buyerId: 1, createdAt: -1 }` for buyer order history
- `AuditLog`: TTL index for automatic cleanup after 1 year

## Architecture Principles

### 1. API-First
- Define API contracts before building UI
- Validate all request/response shapes
- Treat API responses as stable products

### 2. Modular by Domain
Modules map to business capabilities:
- catalog, search, pricing, checkout, licensing
- creators, reviews, analytics, notifications
- RBAC, admin operations

### 3. Thin Controllers, Strong Services
Controllers only:
- Parse request
- Call service
- Map result to HTTP response

### 4. Read/Write Separation
- Public listing/search vs admin moderation
- Write workflows separated from read workflows

### 5. Explicit Contracts
Use DTOs instead of raw Mongoose documents:
- `TemplateCardDto`
- `TemplateDetailDto`
- `CreatorSummaryDto`
- `ReviewSummaryDto`
- `OrderSummaryDto`

### 6. Event-Driven Side Effects
Cross-cutting features consume events:
- notifications, analytics, audit logs
- search indexing, denormalized stat updates

## Target Module Structure

```text
server/src/modules/<domain>/
  <domain>.routes.js
  <domain>.controller.js
  <domain>.service.js
  <domain>.repository.js
  <domain>.validator.js
  <domain>.contract.js
  <domain>.events.js
  <domain>.model.js
  __tests__/
```

## Data Migration

### Cloudinary Migration (for legacy local images)

```bash
cd server
npm run migrate-cloudinary
```

### Database Migrations

Place migration scripts in `server/src/scripts/migrations/`:

```javascript
// Example: Add new field to existing documents
async function migrate() {
  await Template.updateMany(
    { newField: { $exists: false } },
    { $set: { newField: defaultValue } }
  );
}
```
