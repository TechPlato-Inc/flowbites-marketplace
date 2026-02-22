# Security Audit - Flowbites Backend

Date: 2026-02-21
Scope: `server/src/**`
Method: Static code review of auth, validation, authorization, upload handling, payments, rate limiting, headers/CORS, and newly added modules (reports/audit/withdrawals/tickets/earnings/search/settings/user management).

## Summary
- Open findings: `0 Critical`, `0 High`, `7 Medium`, `2 Low`
- Resolved since prior audit: `4` (all previously flagged cookie/token/upload/coupon issues)
- Overall posture: improved materially; primary remaining risk is abuse and availability (rate-limiting gaps, unvalidated write payloads, and concurrency safety in withdrawals).

---

## Resolved Findings (✅)

### ✅ RESOLVED (High): access token cookie was readable by JavaScript
- Fix verified:
  - `server/src/modules/auth/auth.controller.js:20`
  - `server/src/modules/auth/auth.controller.js:51`
  - `server/src/modules/auth/auth.controller.js:83`
- Status: `httpOnly: true` is now set for access token cookie on register/login/refresh.

### ✅ RESOLVED (High): refresh tokens stored in plaintext
- Fix verified:
  - Hash helper: `server/src/modules/auth/auth.service.js:18`
  - Store hashed token: `server/src/modules/auth/auth.service.js:77`
  - Compare hashed token: `server/src/modules/auth/auth.service.js:167`
  - Logout hash match: `server/src/modules/auth/auth.service.js:193`
- Status: refresh tokens are SHA-256 hashed before persistence.

### ✅ RESOLVED (High): upload checks were extension-only with risky SVG handling
- Fix verified:
  - MIME map: `server/src/middleware/upload.js:43`
  - MIME/extension validation: `server/src/middleware/upload.js:63`
  - SVG blocked for sensitive fields: `server/src/middleware/upload.js:70`
- Status: extension + MIME pairing enforced, with field-level SVG restrictions.

### ✅ RESOLVED (Medium): coupon usage race condition
- Fix verified:
  - Atomic conditional increment in `recordUsage()`: `server/src/modules/coupons/coupon.service.js:141`
- Status: `findOneAndUpdate` with `$expr` guard prevents over-increment past usage limits.

---

## Open Findings (By Severity)

## Medium

### 1) Inconsistent input validation on mutating endpoints
- Risk: malformed/unbounded payloads increase abuse and logic risk.
- Evidence:
  - Tickets write routes have no schema validation middleware: `server/src/modules/tickets/ticket.routes.js:9`
  - Withdrawals write routes have no schema validation middleware: `server/src/modules/withdrawals/withdrawal.routes.js:10`
  - Settings write routes have no schema validation middleware: `server/src/modules/users/settings.routes.js:10`
- Recommendation:
  - Add Zod validators for all write routes in tickets/withdrawals/settings/reports/user-management.

### 2) Withdrawal request path is vulnerable to concurrent overdraw
- Risk: simultaneous withdrawal requests can pass balance/pending checks before either write commits.
- Evidence:
  - Balance check then create in separate steps: `server/src/modules/withdrawals/withdrawal.service.js:57`, `server/src/modules/withdrawals/withdrawal.service.js:68`
  - Pending-count check is also separate and non-atomic: `server/src/modules/withdrawals/withdrawal.service.js:63`
- Recommendation:
  - Use transaction or atomic reservation strategy (single conditional write keyed by creator/status/balance snapshot).

### 3) Ticket system lacks abuse controls (no route-level throttles)
- Risk: authenticated users can spam ticket creation/replies and increase support load.
- Evidence:
  - Create/reply routes have no per-user limiter: `server/src/modules/tickets/ticket.routes.js:9`, `server/src/modules/tickets/ticket.routes.js:12`
- Recommendation:
  - Add per-user limits (example: create 3/hour, reply 20/hour) and optional cooldown for repeated identical content.

### 4) Public search endpoints are unthrottled and can be used for expensive query spray
- Risk: high-rate autocomplete calls can create DB pressure (regex scans on title).
- Evidence:
  - Public endpoints without dedicated rate limit: `server/src/modules/templates/search.routes.js:9`
  - Regex search on user input (escaped, but still potentially heavy at scale): `server/src/modules/templates/search.controller.js:15`
- Recommendation:
  - Add endpoint-specific throttling + max query length (e.g., 64 chars) + optional prefix index strategy.

### 5) CSP remains disabled globally
- Risk: XSS blast radius is larger without CSP policy enforcement.
- Evidence:
  - `contentSecurityPolicy: false`: `server/src/index.js:66`
- Recommendation:
  - Enable CSP in report-only mode first, then enforce production policy.

### 6) Login lockout remains susceptible to targeted account DoS
- Risk: attacker can repeatedly fail a victim’s email and force temporary lockouts.
- Evidence:
  - lockout keyed by email failure count: `server/src/modules/auth/auth.service.js:104`
- Recommendation:
  - Blend account + IP/device heuristics; add CAPTCHA/challenge after threshold.

### 7) Stripe webhook endpoint still shares global `/api` limiter
- Risk: webhook bursts may be throttled, delaying payment/refund state transitions.
- Evidence:
  - global limiter on `/api`: `server/src/index.js:85`
  - webhook under `/api/webhooks`: `server/src/index.js:100`
- Recommendation:
  - Exempt webhook route from generic limiter or apply dedicated higher-limit rule for Stripe source.

## Low

### 8) CORS allowlist includes localhost origins in all environments
- Risk: unnecessary local origins in production trust list.
- Evidence:
  - hardcoded localhost origins: `server/src/index.js:71`
- Recommendation:
  - conditionally include localhost only in non-production.

### 9) No startup guard for missing `STRIPE_WEBHOOK_SECRET`
- Risk: deploy-time misconfig can silently break webhook processing.
- Evidence:
  - webhook secret consumed at runtime without strict startup assertion (enforced only by request failures).
- Recommendation:
  - enforce env validation rule when Stripe mode is enabled.

---

## New Module Security Assessment

### Reports (`server/src/modules/reports`)
- Status: mostly good.
- Positive controls:
  - per-user anti-spam limiter for report submission: `server/src/modules/reports/report.routes.js:10`
  - duplicate report prevention per user/target in service/model.
- Residual risk:
  - no schema validation middleware for payload shape and enum bounds at route layer.

### Withdrawals (`server/src/modules/withdrawals`)
- Status: functional authorization is good, concurrency safety needs hardening.
- Positive controls:
  - creator/admin role check on creator endpoints; admin-only processing endpoints.
- Residual risk:
  - concurrent overdraw/pending-request race (see Medium finding #2).

### Tickets (`server/src/modules/tickets`)
- Status: authorization boundary is correct; abuse controls are weak.
- Positive controls:
  - owner/admin ticket visibility checks: `server/src/modules/tickets/ticket.service.js:61`
- Residual risk:
  - no per-user limiter for create/reply (Medium finding #3).

### Audit Log (`server/src/modules/audit`)
- Status: good.
- Positive controls:
  - all audit endpoints are admin-only at router level: `server/src/modules/audit/audit.routes.js:9`
- Residual risk:
  - none critical observed in current route/service implementation.

### Admin User Management (`server/src/modules/admin/userManagement*`)
- Status: good guardrails.
- Positive controls:
  - admin-only router: `server/src/modules/admin/userManagement.routes.js:9`
  - cannot ban admin/super_admin: `server/src/modules/admin/userManagement.service.js:58`
  - cannot modify super_admin role: `server/src/modules/admin/userManagement.service.js:120`
- Residual risk:
  - no route schema validation for role change body.

### Search (`server/src/modules/templates/search*`, mounted at `/api/search`)
- Status: injection-resistant for regex construction.
- Positive controls:
  - regex escaping before query build: `server/src/modules/templates/search.controller.js:15`
- Residual risk:
  - no dedicated throttling and no max query length limit (Medium finding #4).

---

## Priority Remediation Plan
1. Add route-level Zod validation for all new module mutating endpoints.
2. Make withdrawal request flow atomic (transaction/conditional write).
3. Add per-route abuse controls for tickets and public search endpoints.
4. Carve out webhook limiter behavior and add strict webhook-secret startup guard.
5. Enable CSP and tighten production CORS allowlist.
