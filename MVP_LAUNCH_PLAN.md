# Flowbites Marketplace — MVP Launch Plan

**Created:** 2026-02-20
**Last Updated:** 2026-02-20
**Status:** In Progress

---

## Overview

The platform is ~75-80% MVP complete. Core marketplace functionality works (browsing, purchasing, admin moderation). Four critical gaps must be closed before launch.

---

## Phase 1: Critical — Blocks Launch

### 1.1 Email Service Integration
- **Status:** [x] DONE
- **Priority:** CRITICAL
- **Files Created/Modified:**
  - `server/src/services/email.js` — Resend-based email service with HTML templates
  - `server/.env.example` — Added `RESEND_API_KEY` config
- **Templates Implemented:**
  - [x] Welcome email (on registration)
  - [x] Email verification
  - [x] Password reset
  - [x] Purchase confirmation / receipt
  - [x] Template approved notification (to creator)
  - [x] Template rejected notification (to creator)
  - [x] Creator onboarding approved/rejected
  - [x] Service order status updates
- **Email Triggers Integrated Into:**
  - [x] `auth.service.js` — Welcome + verification on register
  - [x] `checkout.service.js` — Purchase confirmation on order fulfillment
  - [x] `admin.service.js` — Template approve/reject + creator approve/reject

### 1.2 Password Reset Flow
- **Status:** [x] DONE
- **Priority:** CRITICAL
- **Files Created/Modified:**
  - `server/src/modules/auth/token.model.js` — Token model (password_reset + email_verification)
  - `server/src/modules/auth/auth.service.js` — forgotPassword, resetPassword methods
  - `server/src/modules/auth/auth.controller.js` — forgotPassword, resetPassword endpoints
  - `server/src/modules/auth/auth.validator.js` — Zod schemas for forgot/reset
  - `server/src/modules/auth/auth.routes.js` — POST /forgot-password, POST /reset-password
  - `next-client/app/(auth)/forgot-password/page.tsx` — Forgot password page
  - `next-client/app/(auth)/reset-password/page.tsx` — Reset password page
  - `next-client/src/modules/auth/components/ForgotPasswordForm.tsx` — Forgot password form
  - `next-client/src/modules/auth/components/ResetPasswordForm.tsx` — Reset password form
  - `next-client/src/modules/auth/components/LoginForm.tsx` — Added "Forgot password?" link

### 1.3 Email Verification
- **Status:** [x] DONE
- **Priority:** HIGH
- **Files Created/Modified:**
  - Token model shared with password reset (`token.model.js`)
  - `server/src/modules/auth/auth.service.js` — verifyEmail, resendVerificationEmail methods
  - `server/src/modules/auth/auth.controller.js` — verifyEmail, resendVerification endpoints
  - `server/src/modules/auth/auth.routes.js` — GET /verify-email, POST /resend-verification
  - `next-client/app/(auth)/verify-email/page.tsx` — Verify email page
  - `next-client/src/modules/auth/components/VerifyEmail.tsx` — Auto-verify on load

### 1.4 Stripe Connect (Creator Payouts)
- **Status:** [x] DONE (Backend + Frontend)
- **Priority:** CRITICAL
- **Files Created/Modified:**
  - `server/src/services/stripeConnect.js` — Stripe Connect Express integration
    - `createConnectAccount()` — Creates Express account + onboarding link
    - `getStripeDashboardLink()` — Hosted dashboard login link
    - `getConnectStatus()` — Account status check
    - `transferToCreator()` — Create transfer after payment
  - `server/src/modules/creators/creator.controller.js` — Connect endpoints
  - `server/src/modules/creators/creator.routes.js` — 3 new routes:
    - `POST /connect/onboard` — Start Stripe onboarding
    - `GET /connect/status` — Check connection status
    - `GET /connect/dashboard` — Get Stripe dashboard link
  - `server/src/modules/checkout/checkout.service.js` — Updated to:
    - Pass chargeId from webhook to fulfillment
    - Create Stripe transfers to creators on order fulfillment
    - Update creator revenue stats (totalSales, totalRevenue)
    - Service orders hold payout until delivery confirmed
- **Frontend (DONE):**
  - [x] Add Stripe Connect card to creator dashboard overview
  - [x] Show connection status (not_connected / pending / active / demo_mode)
  - [x] "Connect Stripe Account" button → redirects to Stripe onboarding
  - [x] "Complete Stripe Setup" button for pending accounts
  - [x] "View Stripe Dashboard" button for connected accounts
  - [x] Handle Stripe return/refresh URLs (auto-refresh status + clean URL params)
  - `next-client/src/modules/dashboard/creator/CreatorDashboardView.tsx` — Added Stripe Connect UI section

---

## Phase 2: High Priority — Should Have for Launch

### 2.1 Service Order Checkout
- **Status:** [x] Already Implemented
- Service orders already go through Stripe checkout in `checkout.service.js`

### 2.2 Account Security
- **Status:** [x] DONE
- **Files Created/Modified:**
  - `server/src/modules/auth/loginAttempt.model.js` — Login attempt tracking with TTL auto-cleanup
  - `server/src/modules/auth/auth.service.js` — 5 failed attempts = 15min lockout, remaining attempts warning
  - `server/src/modules/auth/auth.controller.js` — Passes IP to login service
- **Tasks:**
  - [x] Login attempt rate limiting (per account, 5 attempts / 15min window)
  - [x] Account lockout after 5 failed attempts (auto-unlocks after 15min)
  - [x] Warning messages at 2 remaining attempts

---

## Phase 3: Post-Launch Enhancements

### 3.1 Reviews & Ratings
- **Status:** [x] DONE (Backend) — Frontend assigned to Kimi
- [x] Review submission endpoints (`POST /api/reviews/template/:id`)
- [x] Review moderation (`PATCH /api/reviews/admin/:id/moderate`)
- [x] Rating aggregation on templates (MongoDB pipeline, stored on template stats)
- [x] Review/ReviewSummary types added to frontend
- [ ] Review UI components (Kimi — Task A)

### 3.2 Refund Automation
- **Status:** [x] DONE (Backend)
- [x] Stripe refund API integration (`server/src/modules/refunds/`)
- [x] Refund request workflow (buyer requests, admin approves/rejects)
- [x] 14-day refund window enforcement
- [x] License deactivation on refund
- [x] Demo mode support
- [ ] Refund notification emails (can add later)

### 3.3 Advanced Analytics
- [ ] Creator revenue dashboard
- [ ] Conversion funnel tracking
- [ ] Template performance metrics

### 3.4 Real-time Notifications
- [ ] WebSocket or SSE for live updates
- [ ] Notification bell in header
- [ ] Push notifications (optional)

### 3.5 Affiliate Program
- [ ] Referral link generation
- [ ] Commission tracking
- [ ] Affiliate dashboard

---

## Timeline

| Week | Focus | Deliverable |
|------|-------|-------------|
| **Week 1** | Email service + password reset + email verification | DONE |
| **Week 2** | Stripe Connect backend + creator dashboard UI | DONE |
| **Week 3** | End-to-end testing + polish | |
| **Week 4** | Staging deploy + launch | |

---

## Tech Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Email provider | Resend | Modern API, great DX, generous free tier, graceful fallback to console logging |
| Email templates | Inline HTML | Simple, no extra dependencies, consistent rendering |
| Stripe Connect type | Express | Fastest onboarding for creators, Stripe handles compliance/KYC |
| Token storage | MongoDB with TTL index | Auto-cleanup of expired tokens, shared model for reset + verification |

---

## Setup Instructions

### Email (Resend)
1. Sign up at https://resend.com
2. Add your domain and verify DNS records
3. Create an API key
4. Add `RESEND_API_KEY=re_xxx` to `server/.env`
5. Without the key, all emails are logged to console (dev-friendly)

### Stripe Connect
1. Enable Connect in your Stripe dashboard
2. Ensure `STRIPE_SECRET_KEY` is set (test or live)
3. Creators visit `/dashboard/creator` and click "Connect Stripe"
4. They complete Stripe's hosted onboarding
5. After connection, payouts happen automatically on each sale

---

## Notes

- Demo mode (mock checkout) remains for development/testing
- All email sending is async (non-blocking) — failures don't break the flow
- Email templates match the Flowbites design system (sky blue primary color)
- Stripe Connect requires platform verification before going live
- Creator payouts for services are held until delivery is confirmed
- If a creator hasn't connected Stripe, their payout is logged as "held"
