# Flowbites Marketplace Backend

Express + MongoDB API for the Flowbites marketplace.

This backend powers:
- template and service commerce
- real Stripe Checkout + webhook processing
- creator onboarding and earnings
- withdrawals, tickets, reports, notifications
- blog/content, reviews, coupons, follows, wishlists
- admin moderation, audit logs, and user management

## Tech Stack
- Runtime: Node.js (ES modules), Express
- Database: MongoDB + Mongoose
- Auth: JWT access/refresh, role-based access control
- Payments: Stripe Checkout + webhooks
- Storage: Cloudinary (fallback local uploads)
- Email: Resend (fallback console logging)
- Validation/Security: Zod, Helmet, CORS, rate limiting, NoSQL sanitize

## Directory Structure
```text
server/
├── README.md
├── package.json
├── .env.example
├── tests/
│   ├── setup.js
│   └── integration.test.js
├── uploads/
│   ├── images/
│   ├── shots/
│   └── templates/
└── src/
    ├── index.js
    ├── config/
    │   ├── cloudinary.js
    │   ├── db.js
    │   ├── stripe.js
    │   └── validateEnv.js
    ├── jobs/
    │   └── cleanup.js
    ├── lib/
    │   └── utils.js
    ├── middleware/
    │   ├── auth.js
    │   ├── cache.js
    │   ├── cloudinaryUpload.js
    │   ├── errorHandler.js
    │   ├── sanitize.js
    │   ├── upload.js
    │   ├── userRateLimit.js
    │   └── validate.js
    ├── modules/
    │   ├── admin/
    │   ├── analytics/
    │   ├── audit/
    │   ├── auth/
    │   ├── blog/
    │   ├── categories/
    │   ├── checkout/
    │   ├── coupons/
    │   ├── creators/
    │   ├── downloads/
    │   ├── followers/
    │   ├── notifications/
    │   ├── orders/
    │   ├── refunds/
    │   ├── reports/
    │   ├── reviews/
    │   ├── services/
    │   ├── sitemap/
    │   ├── templates/
    │   ├── tickets/
    │   ├── ui-shorts/
    │   ├── users/
    │   ├── wishlists/
    │   └── withdrawals/
    ├── scripts/
    │   ├── generate-placeholders.js
    │   ├── migrate-to-cloudinary.js
    │   ├── seed.js
    │   └── seed-extras.js
    └── services/
        ├── email.js
        └── stripeConnect.js
```

## Local Setup

### 1) Install dependencies
```bash
cd server
npm ci
```

### 2) Configure environment
```bash
cp .env.example .env
```

Fill required values:
- `MONGODB_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

Recommended integrations:
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Resend: `RESEND_API_KEY`, `FROM_EMAIL`, `FROM_NAME`

### 3) Run database seed
```bash
npm run seed
npm run seed:extras
```

### 4) Start API
```bash
npm run dev
```

API base: `http://localhost:5000/api`  
Health: `http://localhost:5000/health`

## Stripe Webhook Setup (Local)
Use Stripe CLI:
```bash
stripe listen --forward-to localhost:5000/api/webhooks/stripe
```

Copy the webhook signing secret (`whsec_...`) into `STRIPE_WEBHOOK_SECRET`.

## Scripts
- `npm run dev` - start dev server with nodemon
- `npm start` - start production server
- `npm run seed` - primary seed data
- `npm run seed:extras` - extra seed data
- `npm run seed:all` - run both seed scripts
- `npm run generate-placeholders` - placeholder assets
- `npm run migrate-cloudinary` - migrate local uploads to Cloudinary
- `npm run migrate` - run schema/data migrations from `scripts/migrations`
- `npm run test` - integration tests
- `npm run test:ci` - integration tests (CI mode)
- `npm run health` - environment/service health checks

## API Routes

Registered prefixes from `src/index.js` are shown below, with endpoints by module.

### Health
- `GET /health`

### Auth (`/api/auth`)
- `POST /register`
- `POST /login`
- `POST /refresh`
- `POST /logout`
- `GET /me`
- `PATCH /profile`
- `POST /change-password`
- `POST /forgot-password`
- `POST /reset-password`
- `GET /verify-email`
- `POST /resend-verification`

### Templates (`/api/templates`)
- `GET /`
- `GET /my-templates`
- `GET /:id`
- `POST /`
- `PATCH /:id`
- `DELETE /:id`
- `POST /:id/submit`

### Template Versions (`/api/templates`)
- `GET /:templateId/versions`
- `GET /:templateId/versions/latest`
- `GET /:templateId/versions/:version`
- `POST /:templateId/versions`
- `DELETE /:templateId/versions/:version`

### Orders (`/api/orders`)
- `POST /`
- `POST /mock-checkout`
- `GET /my-orders`
- `GET /:id`

### Checkout (`/api/checkout`)
- `POST /template`
- `POST /service`

### Webhooks (`/api/webhooks`)
- `POST /stripe`

### Downloads (`/api/downloads`)
- `POST /token`
- `GET /:token`
- `GET /licenses/my-licenses`

### Services (`/api/services`)
- `GET /packages/browse`
- `GET /packages/mine`
- `GET /packages/:slug`
- `GET /packages`
- `POST /packages`
- `POST /request-customization`
- `POST /orders`
- `GET /orders/my-orders`
- `GET /orders/:id`
- `POST /orders/:id/messages`
- `PATCH /orders/:id/status`
- `PATCH /orders/:id/buyer-status`
- `POST /orders/:id/cancel`
- `POST /orders/:id/dispute`
- `GET /admin/orders`
- `GET /admin/creators`
- `PATCH /admin/orders/:id/reassign`
- `PATCH /admin/orders/:id/resolve-dispute`

### UI Shorts (`/api/ui-shorts`)
- `GET /`
- `POST /`
- `POST /:id/like`
- `POST /:id/save`
- `GET /admin/all`
- `DELETE /admin/:id`
- `PATCH /admin/:id/toggle-published`

### Admin Core (`/api/admin`)
- `GET /dashboard-stats`
- `GET /templates/pending`
- `GET /templates/stats`
- `GET /templates/export`
- `POST /templates/bulk`
- `GET /templates`
- `GET /templates/:id`
- `PATCH /templates/:id`
- `DELETE /templates/:id`
- `POST /templates/:id/approve`
- `POST /templates/:id/reject`
- `GET /creators/pending`
- `GET /creators`
- `GET /creators/:id`
- `POST /creators/:id/approve`
- `POST /creators/:id/reject`
- `PATCH /categories/:id`
- `DELETE /categories/:id`
- `POST /categories/reorder`

### Admin User Management (`/api/admin/users`)
- `GET /stats`
- `GET /`
- `GET /:id`
- `POST /:id/ban`
- `POST /:id/unban`
- `PATCH /:id/role`

### Admin Audit (`/api/admin/audit`)
- `GET /`
- `GET /stats`
- `GET /:targetType/:targetId`

### Analytics (`/api/analytics`)
- `POST /event`
- `GET /metrics`

### Categories & Tags (`/api`)
- `GET /categories`
- `GET /tags`
- `POST /categories`

### Creators (`/api/creators`)
- `GET /onboarding/status`
- `POST /onboarding/personal-info`
- `POST /onboarding/government-id`
- `POST /onboarding/selfie`
- `POST /onboarding/bank-details`
- `POST /onboarding/creator-reference`
- `POST /onboarding/submit`
- `GET /onboarding/search`
- `POST /connect/onboard`
- `GET /connect/status`
- `GET /connect/dashboard`
- `GET /:identifier`
- `GET /:identifier/templates`
- `GET /:identifier/shots`

### Earnings (`/api/earnings`)
- `GET /summary`
- `GET /transactions`

### Search (`/api/search`)
- `GET /autocomplete`
- `GET /popular`

### Blog (`/api/blog`)
- `GET /`
- `GET /categories`
- `GET /tags`
- `GET /featured`
- `GET /:slug`
- `POST /`
- `PATCH /:id`
- `DELETE /:id`
- `GET /admin/all`
- `GET /admin/:id`

### Sitemap (`/api`)
- `GET /sitemap.xml`

### Reviews (`/api/reviews`)
- `GET /template/:templateId`
- `GET /check/:templateId`
- `POST /template/:templateId`
- `PATCH /:reviewId`
- `DELETE /:reviewId`
- `GET /admin/all`
- `PATCH /admin/:reviewId/moderate`

### Refunds (`/api/refunds`)
- `POST /request`
- `GET /order/:orderId`
- `GET /admin`
- `POST /admin/:refundId/approve`
- `POST /admin/:refundId/reject`

### Notifications (`/api/notifications`)
- `GET /`
- `GET /unread-count`
- `PATCH /read-all`
- `PATCH /:id/read`
- `DELETE /:id`

### Wishlists (`/api/wishlists`)
- `GET /count/:templateId`
- `GET /`
- `GET /check/:templateId`
- `POST /check-bulk`
- `POST /:templateId`
- `DELETE /:templateId`

### Coupons (`/api/coupons`)
- `POST /validate`
- `GET /admin`
- `POST /admin`
- `PATCH /admin/:couponId`
- `DELETE /admin/:couponId`

### Followers (`/api/followers`)
- `GET /count/:creatorId`
- `GET /following`
- `GET /check/:creatorId`
- `GET /creator/:creatorId`
- `POST /:creatorId`
- `DELETE /:creatorId`

### Reports (`/api/reports`)
- `POST /`
- `GET /admin`
- `GET /admin/stats`
- `GET /admin/:id`
- `POST /admin/:id/resolve`
- `POST /admin/:id/dismiss`

### Withdrawals (`/api/withdrawals`)
- `GET /balance`
- `GET /my`
- `POST /request`
- `GET /admin`
- `POST /admin/:id/approve`
- `POST /admin/:id/reject`
- `POST /admin/:id/complete`

### Tickets (`/api/tickets`)
- `POST /`
- `GET /my`
- `GET /:id`
- `POST /:id/reply`
- `POST /:id/close`
- `GET /admin/all`
- `GET /admin/stats`
- `POST /admin/:id/assign`
- `POST /admin/:id/resolve`

## Seed Test Accounts
From `src/scripts/seed.js`:

- Super Admin
  - `superadmin@flowbites.com` / `superadmin2024!`
- Flowbites Admin (also official creator)
  - `admin@flowbites.com` / `flowbites2024!`
- Community Creators
  - `creator1@example.com` / `password123`
  - `creator2@example.com` / `password123`
- Buyers
  - `buyer1@example.com` / `password123`
  - `buyer2@example.com` / `password123`

## Security Features
- JWT auth with access + refresh tokens
- Role-based and admin authorization guards
- Zod request validation on critical write endpoints
- Password hashing with bcrypt
- Cookie hardening (`httpOnly`, secure/sameSite behavior by env)
- NoSQL sanitization middleware
- Global + auth + targeted per-user rate limiting
- Stripe webhook signature verification
- Upload extension + MIME checks with SVG restrictions
- Audit logging for sensitive admin actions

## Notes
- API reference with request/response details: `docs/api-reference.md`
- Security audit: `docs/security-audit.md`
- Monitoring guide: `docs/monitoring-guide.md`
