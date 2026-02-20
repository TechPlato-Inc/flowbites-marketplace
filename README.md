# Flowbites Marketplace

A modern template marketplace where designers sell premium Webflow, Framer, and Wix templates. Built with Next.js 14 + Express + MongoDB.

## Architecture

```
flowbites-marketplace/
├── next-client/            Next.js 14 App Router (SSR + static)
├── server/                 Express API + MongoDB
├── Dockerfile              Multi-stage (API + Next.js)
├── docker-compose.yml      Production (API + Next.js + Nginx + MongoDB)
├── docker-compose.dev.yml  Development
├── nginx.conf              Reverse proxy (/api -> Express, /* -> Next.js)
├── deploy.sh               One-command production deploy
└── DESIGN_SYSTEM.md        Design tokens, typography, colors, components
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Zustand |
| Backend | Express, MongoDB, Mongoose, Zod |
| Auth | JWT (access + refresh tokens), httpOnly cookies |
| Payments | Stripe (scaffolded, demo mode) |
| Images | Cloudinary (CDN + auto-optimization) |
| Files | Local disk (template ZIPs, signed download tokens) |
| Deploy | Docker, Nginx, SSL via Let's Encrypt |

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally

### 1. Install

```bash
cd server && npm install
cd ../next-client && npm install
```

### 2. Environment

```bash
# server/.env — copy from .env.example, set:
#   MONGODB_URI, JWT secrets, Cloudinary keys (optional)

# next-client/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_UPLOADS_URL=http://localhost:5001/uploads
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Seed & Run

```bash
cd server && npm run seed    # Creates demo users, templates, categories
npm run dev                  # Express API on :5001

# New terminal
cd next-client && npm run dev  # Next.js on :3000
```

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@flowbites.com | admin123456 |
| Creator | creator1@example.com | creator123456 |
| Buyer | buyer1@example.com | buyer123456 |

## Pages (45 total)

**Public:** Home, Templates, Template Detail, Services, Service Detail, Creators, UI Shorts, Blog, Blog Post

**Auth:** Login, Register

**Dashboard:** Buyer, Creator, Admin, Upload Template, Create Service, Onboarding, Admin Templates, Admin Creators, Admin Blog

**Static (22):** About, Pricing, How It Works, Become Creator, Licenses, Help, Privacy, Terms, Cookies, Careers, Enterprise, Education, Community, Affiliate, AI, Campus Ambassadors, Creator Guidelines, Trust & Safety, Success Stories, Updates, Sitemap

## API Endpoints

### Public
- `GET /api/templates` — Browse with filters, search, pagination
- `GET /api/templates/:id` — Template detail
- `GET /api/categories` — All categories
- `GET /api/ui-shorts` — UI Shots feed
- `GET /api/services/packages/browse` — Service packages
- `GET /api/blog` — Blog posts

### Auth
- `POST /api/auth/register` / `login` / `refresh` / `logout`
- `GET /api/auth/me` — Current user

### Creator (authenticated)
- `POST /api/templates` — Upload template (thumbnail + gallery + ZIP)
- `POST /api/ui-shorts` — Post UI shot
- `POST /api/services/packages` — Create service package
- `POST /api/creators/onboarding/*` — Verification docs

### Buyer (authenticated)
- `POST /api/orders` — Create order
- `POST /api/downloads/token` — Generate download token
- `GET /api/downloads/:token` — Download template file

### Admin (authenticated)
- `GET /api/admin/templates/pending` — Moderation queue
- `POST /api/admin/templates/:id/approve` / `reject`

## Image Storage (Cloudinary)

Images are stored on Cloudinary with auto-optimization. Template ZIP files remain on local disk with signed download tokens.

```bash
# Migrate existing local images to Cloudinary
cd server && npm run migrate-cloudinary
```

Set in `server/.env`:
```
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Without these vars, uploads fall back to local storage.

## Production Deploy

```bash
# One-command deploy with Docker + SSL
./deploy.sh
```

Or manually:
```bash
docker compose --env-file .env.production up -d --build
```

## Security

- Helmet.js HTTP headers
- CORS, rate limiting
- JWT with httpOnly cookies + refresh tokens
- Bcrypt password hashing
- Zod input validation
- File type/size validation
- Signed, expiring download tokens
- Path traversal prevention

## License

MIT
