# Flowbites Marketplace

Flowbites is a multi-sided marketplace for premium Webflow, Framer, and Wix templates plus creator services.

## Features
- User auth with JWT access/refresh flow
- Buyer, creator, admin, and super admin roles
- Template upload, moderation, publishing, and version history
- Stripe checkout for templates/services and Stripe Connect creator payouts
- Coupon validation, refunds, reviews, wishlists, follows, notifications
- Creator onboarding + verification workflow
- Blog, UI shots, categories/tags, and sitemap endpoint

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS, Zustand, Axios |
| Backend | Express, MongoDB, Mongoose, Zod |
| Auth | JWT access/refresh tokens, cookie support, bcrypt |
| Payments | Stripe Checkout + Stripe Connect |
| Email | Resend (console fallback in dev) |
| Media | Cloudinary (with local upload fallback) |
| Infra | Docker, Docker Compose, Nginx, GitHub Actions |

## Architecture

```text
Browser
  |
  v
Next.js Client (next-client, :3000)
  |  HTTP /api + /uploads (rewrites/proxy)
  v
Express API (server, :5000/:5001)
  |\
  | \--> Stripe (checkout, webhooks, connect payouts)
  | \--> Resend (transactional emails)
  | \--> Cloudinary (image/media storage)
  |
  v
MongoDB (users, templates, orders, reviews, etc.)
```

## Repository Layout

```text
.
├── next-client/                 # Next.js app
├── server/                      # Express API
├── docs/                        # Project docs (API, audits, architecture)
├── docker-compose.dev.yml       # Local dev stack
├── docker-compose.yml           # Production stack
├── Dockerfile                   # Multi-stage build
├── nginx.conf                   # Reverse proxy config
├── deploy.sh                    # Production deploy helper
└── DESIGN_SYSTEM.md             # UI system reference
```

## Quick Start

### Prerequisites
- Node.js 20+
- npm 10+
- MongoDB (local) OR Docker

### Option A: Manual Local Setup

1. Install dependencies

```bash
cd server && npm install
cd ../next-client && npm install
```

2. Configure environment

```bash
cp server/.env.example server/.env
cp next-client/.env.example next-client/.env.local
```

3. Start backend

```bash
cd server
npm run dev
```

4. Start frontend (new terminal)

```bash
cd next-client
npm run dev
```

5. Optional seed data

```bash
cd server
npm run seed
npm run seed:extras
```

### Option B: Docker Development Stack

```bash
docker compose -f docker-compose.dev.yml up --build
```

Services:
- Client: `http://localhost:3000`
- API: `http://localhost:5000`
- MongoDB: `localhost:27017`
- Mongo Express: `http://localhost:8081`

## Environment Variables

### Server (`server/.env`)
Key required variables (full list in `server/.env.example`):
- `MONGODB_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

Common optional/production variables:
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PLATFORM_FEE_PERCENT`, `STRIPE_CONNECT_CLIENT_ID`
- Email: `RESEND_API_KEY`, `FROM_EMAIL`, `FROM_NAME`
- Media: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Upload/rate-limit: `UPLOAD_DIR`, `MAX_FILE_SIZE`, `ALLOWED_FILE_TYPES`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`
- URLs: `CLIENT_URL`, `SITE_URL`

### Client (`next-client/.env.local`)
- `NEXT_PUBLIC_API_URL` (default API base for browser requests)
- `NEXT_PUBLIC_API_BASE_URL` (used by Next rewrites)
- `NEXT_PUBLIC_UPLOADS_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `API_INTERNAL_URL` (server-side internal API URL)

## Scripts

### Backend (`server/package.json`)

| Script | Description |
|-------|-------------|
| `npm run dev` | Start API with nodemon |
| `npm start` | Start API (production mode) |
| `npm run seed` | Seed core data |
| `npm run seed:extras` | Seed additional marketplace data |
| `npm run seed:all` | Run both seed scripts |
| `npm run generate-placeholders` | Generate placeholder assets |
| `npm run migrate-cloudinary` | Migrate uploaded images to Cloudinary |
| `npm test` | Integration test runner |
| `npm run test:ci` | CI-mode integration tests |

### Frontend (`next-client/package.json`)

| Script | Description |
|-------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Run production server |
| `npm run lint` | Lint command |

## Production Deployment

1. Create prod env file:

```bash
cp .env.production.example .env.production
# Fill in all secrets
```

2. Deploy:

```bash
./deploy.sh
# or

docker compose --env-file .env.production up -d --build
```

3. Health checks:
- API: `GET /health`
- Nginx/client reachable on configured domain

## API Documentation
- Full API reference: [`docs/api-reference.md`](docs/api-reference.md)

## Contribution
- See [`CONTRIBUTING.md`](CONTRIBUTING.md) for branch naming, commit style, PR checklist, and testing requirements.

## License
MIT
