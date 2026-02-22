# Flowbites Marketplace Frontend

Next.js App Router frontend for Flowbites Marketplace.

## Overview

This app is the user-facing marketplace UI for:

- browsing and purchasing templates
- requesting services and managing orders
- creator onboarding, earnings, withdrawals
- support tickets, reports, notifications, wishlists
- admin moderation and marketplace operations

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Zustand
- Axios
- Zod
- react-hook-form + `@hookform/resolvers/zod`

## Directory Structure

```text
next-client/
├── app/                    # App Router routes (public, auth, dashboard, admin)
├── public/                 # Static assets
├── src/
│   ├── components/         # Shared UI/layout components
│   ├── design-system/      # Design-system primitives and shared UI contracts
│   ├── hooks/              # Reusable React hooks
│   ├── lib/
│   │   ├── api/            # HTTP clients (browser/server)
│   │   └── validations/    # Zod form schemas
│   ├── modules/            # Feature modules
│   │   └── <module>/
│   │       ├── components/ # Feature UI
│   │       └── services/   # API service layer
│   ├── stores/             # Zustand stores
│   └── types/              # Shared types
├── middleware.ts
├── next.config.js
└── package.json
```

## Module Architecture

Each feature module follows a consistent split:

- `components/`: presentational and container UI
- `services/`: API functions (client and/or server fetch variants)

This keeps UI and data-access concerns separate and easier to test.

## Routing Layout

- Public pages: marketplace, template detail, services, blog, static pages
- Auth pages: login/register/forgot/reset/verification
- Dashboard pages: buyer and creator workflows
- Admin pages: moderation, analytics, user management, reports/tickets/withdrawals

## Environment Variables

Copy and edit:

```bash
cp .env.example .env.local
```

Current `.env.example` values:

- `NEXT_PUBLIC_API_URL` - browser API base URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name for media URLs

## Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - run lint checks

## Local Development

1. Install dependencies:

```bash
npm ci
```

2. Configure `.env.local`.
3. Run:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Design System

Shared design primitives live in `src/design-system/` and are consumed by module components for consistency in spacing, typography, state handling, and interactive patterns.
