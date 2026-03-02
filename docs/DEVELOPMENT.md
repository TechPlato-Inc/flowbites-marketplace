# Development Guide

## API Reference

**Base URL:** `http://localhost:5000/api`

**Response Format:**
- Success: `{ "success": true, "data": ... }`
- Error: `{ "success": false, "error": "..." }`

**Authentication:** `Authorization: Bearer <token>` or `accessToken` cookie

### Rate Limits

| Route | Limit |
|-------|-------|
| Global API | 100 requests / 15 min |
| Login/Register | 15 requests / 15 min |
| Coupon validation | 10 requests / min |
| Wishlist | 30 requests / min |

### Core Endpoints

#### Auth (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | Public | Create account |
| POST | `/login` | Public | Authenticate |
| POST | `/refresh` | Public | Refresh token |
| POST | `/logout` | User | Logout |
| GET | `/me` | User | Current user |
| PATCH | `/profile` | User | Update profile |
| POST | `/change-password` | User | Change password |
| POST | `/forgot-password` | Public | Request reset |
| POST | `/reset-password` | Public | Reset password |
| GET | `/verify-email` | Public | Verify email |

#### Templates (`/api/templates`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | List templates |
| GET | `/:id` | Public | Template detail |
| GET | `/my-templates` | Creator | My templates |
| POST | `/` | Creator | Create template |
| PATCH | `/:id` | Creator | Update template |
| DELETE | `/:id` | Creator | Delete template |
| POST | `/:id/submit` | Creator | Submit for review |

**Query params for list:** `q`, `category`, `platform`, `sort`, `page`, `limit`

#### Orders & Checkout (`/api/orders`, `/api/checkout`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/orders/my-orders` | User | My orders |
| GET | `/orders/:id` | User | Order detail |
| POST | `/checkout/template` | User | Checkout templates |
| POST | `/checkout/service` | User | Checkout services |
| POST | `/webhooks/stripe` | Stripe | Webhook handler |

#### Reviews (`/api/reviews`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/template/:id` | Public | Template reviews |
| POST | `/` | User | Submit review |
| PATCH | `/:id` | User | Edit review |
| DELETE | `/:id` | User | Delete review |

#### Admin (`/api/admin`) - Admin only

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard-stats` | Platform stats |
| GET | `/templates/pending` | Pending templates |
| POST | `/templates/:id/approve` | Approve template |
| POST | `/templates/:id/reject` | Reject template |
| GET | `/creators/pending` | Pending creators |
| POST | `/creators/:id/approve` | Approve creator |

### Full API Reference

For complete endpoint documentation, see the OpenAPI spec in `server/src/routes/` or inspect route files directly.

---

## Testing

### Test Coverage Targets

| Level | Target | Framework |
|-------|--------|-----------|
| Unit Tests | 70%+ | Vitest + React Testing Library |
| API Tests | All endpoints | Node.js test runner |
| E2E Tests | Core flows | Playwright |

### Running Tests

```bash
# All tests
npm test

# Backend only
cd server && npm test

# Frontend only
cd next-client && npm test

# E2E tests
cd next-client && npx playwright test
```

### Test Factories

```typescript
import { 
  createMockUser, 
  createMockTemplate, 
  createMockReview 
} from '@/test/factories';

const user = createMockUser({ role: 'creator' });
const template = createMockTemplate({ price: 99 });
```

### Critical Test Areas

- **Authentication:** Login, register, password reset, email verification
- **Payments:** Stripe checkout, webhooks, refunds
- **Templates:** CRUD, approval workflow
- **Creator Dashboard:** Analytics, earnings, withdrawals

---

## Contributing

### Development Setup

```bash
# Install dependencies
cd server && npm install
cd ../next-client && npm install

# Configure environment
cp server/.env.example server/.env
cp next-client/.env.example next-client/.env.local

# Start services
cd server && npm run dev
cd next-client && npm run dev
```

### Branch Naming

- `feature/<description>` - New features
- `fix/<description>` - Bug fixes
- `docs/<description>` - Documentation

Examples: `feature/refund-admin-filters`, `fix/checkout-coupon-validation`

### Commit Format

```
type(scope): message

Types: feat, fix, docs, refactor, test

Examples:
- feat(auth): add resend verification endpoint
- fix(checkout): handle missing coupon safely
- docs(readme): add docker quick start
```

### PR Checklist

- [ ] Branch name follows convention
- [ ] Commit messages follow format
- [ ] Tests pass
- [ ] No secrets committed
- [ ] Screenshots for UI changes

### Code Style

**Backend:**
- ES modules (`import`/`export`)
- Business logic in services, not controllers
- Use Zod for validation
- Follow existing Mongoose patterns

**Frontend:**
- Next.js App Router patterns
- Reuse design-system components
- Keep feature code in module folders

---

## Design System

See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for complete design specifications including:
- Typography (Inter, Manrope fonts)
- Color palette (Primary, Secondary, Semantic)
- Spacing and layout
- Component styles
- Shadows and animations

---

## File Structure

```
next-client/
├── app/                    # App Router pages
├── src/
│   ├── modules/           # Feature modules
│   ├── stores/            # Zustand stores
│   ├── design-system/     # Reusable UI
│   └── lib/               # Utils, API client

tserver/
├── src/
│   ├── modules/           # Feature modules
│   ├── middleware/        # Auth, RBAC, rate limiting
│   ├── services/          # Email, Stripe, Cloudinary
│   ├── websocket/         # Socket.IO events
│   └── scripts/           # Seeds, migrations
```

---

## Environment Variables

### Server (`server/.env`)

**Required:**
- `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`

**Optional:**
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PLATFORM_FEE_PERCENT`
- Email: `RESEND_API_KEY`, `FROM_EMAIL`, `FROM_NAME`
- Media: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### Client (`next-client/.env.local`)

- `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
