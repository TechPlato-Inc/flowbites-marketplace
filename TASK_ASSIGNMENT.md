# Task Assignment — Claude Code (Lead) + Kimi Code

**Created:** 2026-02-20
**Status:** Active

---

## Completed (by Claude Code)

All Phase 1 critical items are DONE:
- [x] Email Service (Resend)
- [x] Password Reset Flow
- [x] Email Verification
- [x] Stripe Connect (Backend + Frontend)

---

## Remaining Work — Task Split

### CLAUDE CODE (Lead) — Backend + Architecture

**Task 1: Account Security (Phase 2.2)**
- Files: `server/src/modules/auth/` (new loginAttempt model + auth.service.js changes)
- Login attempt rate limiting per account
- Account lockout after N failed attempts
- Login notification emails

**Task 2: Reviews & Ratings — Backend**
- Files: `server/src/modules/reviews/` (ALL NEW — no conflict risk)
  - `review.model.js`
  - `review.service.js`
  - `review.controller.js`
  - `review.routes.js`
  - `review.validator.js`
- Review submission endpoints
- Review moderation (admin)
- Rating aggregation on templates
- Update `server/src/app.js` to register review routes

**Task 3: Refund System — Backend**
- Files: `server/src/modules/refunds/` (ALL NEW)
- Stripe refund API integration
- Refund request workflow
- Refund notification emails

---

### KIMI CODE — Frontend + UI

**Task A: Reviews & Ratings — Frontend**
- Files: `next-client/src/modules/reviews/` (ALL NEW — no conflict risk)
  - `ReviewCard.tsx`
  - `ReviewForm.tsx`
  - `ReviewList.tsx`
  - `StarRating.tsx`
- Add review section to template detail page: `next-client/src/modules/templates/TemplateDetailView.tsx`
- Add review moderation to admin dashboard: `next-client/src/modules/dashboard/admin/`

**Task B: Search Improvements — Frontend**
- Files: `next-client/src/modules/templates/` (search components only)
- Full-text search UI with suggestions
- Search filters enhancement

**Task C: Analytics Dashboard — Frontend**
- Files: `next-client/src/modules/dashboard/creator/` (new analytics view/components)
- Creator revenue charts
- Template performance metrics UI

---

## DO NOT TOUCH Rules

| Agent | Must NOT edit these files |
|-------|--------------------------|
| **Kimi** | `server/` (anything) — Claude owns all backend |
| **Claude** | Files Kimi is actively editing (listed above in Kimi tasks) |
| **Both** | Coordinate before touching any shared file |

## Shared Files (Require Coordination)

These files may need edits from BOTH agents. **Claude edits first, Kimi edits after:**
- `next-client/src/types/index.ts` — Adding Review types (Claude adds type, Kimi uses it)
- `server/src/app.js` — Registering new routes (Claude only)

---

## Order of Execution

1. **Claude** builds Reviews backend + types → pushes
2. **Kimi** builds Reviews frontend using those types/endpoints
3. **Claude** builds Account Security (parallel, no overlap)
4. **Claude** builds Refund backend
5. **Kimi** builds Analytics UI + Search UI (parallel, no overlap)

---

## API Contract for Reviews (Kimi reference)

```
GET    /api/reviews/template/:templateId    — List reviews for a template
POST   /api/reviews/template/:templateId    — Submit a review (buyer only)
PATCH  /api/reviews/:reviewId               — Edit own review
DELETE /api/reviews/:reviewId               — Delete own review
GET    /api/admin/reviews                   — List all reviews (admin)
PATCH  /api/admin/reviews/:reviewId/moderate — Approve/reject review (admin)
```

**Review object shape:**
```json
{
  "_id": "string",
  "templateId": "string",
  "buyerId": { "_id": "string", "name": "string", "avatar": "string" },
  "rating": 1-5,
  "title": "string",
  "comment": "string",
  "status": "pending | approved | rejected",
  "createdAt": "date",
  "updatedAt": "date"
}
```
