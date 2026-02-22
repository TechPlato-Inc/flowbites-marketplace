# Flowbites Architecture

## System Architecture

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

## Backend Module Dependency Map

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

## Checkout Flow (Template Purchase)

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

## Refund Flow

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

## Creator Onboarding Flow

```text
Creator -> /api/creators/onboarding/* steps
  personal-info
  government-id (files)
  selfie (file)
  bank-details
  creator-reference

Each step -> updates CreatorProfile.onboarding + completedSteps

Creator -> POST /api/creators/onboarding/submit
       -> requires all required steps
       -> onboarding.status=submitted

Admin reviews -> /api/admin/creators/:id/approve|reject
       -> onboarding.status=approved|rejected
```

## Authentication Flow

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
        -> verify refresh token signature + token presence in user.refreshTokens
        -> issue new access token

Logout -> POST /api/auth/logout
       -> remove refresh token + clear cookies
```

## Database Schema Relationships

Core references:
- `User`
  - 1:1 `CreatorProfile` via `CreatorProfile.userId`
  - 1:N `Order.buyerId`, `ServiceOrder.buyerId`, `ServiceOrder.creatorId`
  - 1:N `Notification.userId`
- `Template`
  - N:1 `Template.creatorId -> User`
  - N:1 `Template.creatorProfileId -> CreatorProfile`
  - N:1 `Template.category -> Category`
  - 1:N `TemplateVersion.templateId`
  - 1:N `Review.templateId`
  - 1:N `License.templateId`
  - 1:N `Wishlist.templateId`
- `Order`
  - N:1 `Order.buyerId -> User`
  - 1:N `License.orderId`
  - 1:1 `Refund.orderId` (unique)
- `ServicePackage`
  - N:1 `ServicePackage.creatorId -> User`
  - N:1 `ServicePackage.templateId -> Template`
- `ServiceOrder`
  - N:1 `ServiceOrder.packageId -> ServicePackage`
  - N:1 `ServiceOrder.buyerId/creatorId/assignedCreatorId -> User`
- `Review`
  - N:1 `Review.orderId -> Order`
  - N:1 `Review.buyerId -> User`
- `Follower`
  - unique edge `(followerId -> creatorId)` between users
- `CouponUsage`
  - N:1 `couponId -> Coupon`, `userId -> User`, `orderId -> Order`

## Frontend-Backend Boundaries
- Frontend modules call backend through Axios client (`next-client/src/lib/api/client.ts`).
- Next config rewrites `/api/*` and `/uploads/*` to API origin.
- Auth state is held in client store; API enforces auth/role server-side.

## Background / Scheduled Work
- Cleanup scheduler starts from `server/src/jobs/cleanup.js` on boot.
- Token/notification data retention also uses Mongo TTL indexes.
