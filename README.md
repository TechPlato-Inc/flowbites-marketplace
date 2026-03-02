# Flowbites Marketplace

A full-stack, multi-sided marketplace for premium **Webflow**, **Framer**, and **Wix** templates with built-in creator services, Stripe payments, and real-time notifications.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS, Zustand |
| Backend | Express, MongoDB, Mongoose, Zod validation |
| Auth | JWT access/refresh tokens, httpOnly cookies, bcrypt, RBAC |
| Payments | Stripe Checkout, Stripe Connect (creator payouts) |
| Real-time | WebSocket (Socket.IO) for notifications |
| Email | Resend (console fallback in dev) |
| Media | Cloudinary (local upload fallback) |
| Infra | Docker, Docker Compose, Nginx |

## Quick Start

### Prerequisites
- Node.js 20+
- MongoDB (local or Docker)

### Local Setup

```bash
# Install dependencies
cd server && npm install
cd ../next-client && npm install

# Configure environment
cp server/.env.example server/.env
cp next-client/.env.example next-client/.env.local

# Start backend
cd server && npm run dev

# Start frontend (new terminal)
cd next-client && npm run dev
```

### Docker Setup

```bash
docker compose -f docker-compose.dev.yml up --build
```

| Service | URL |
|---------|-----|
| Client | http://localhost:3000 |
| API | http://localhost:5000 |
| MongoDB | localhost:27017 |

### Seed Accounts (password: `Test1234!`)

| Email | Role |
|-------|------|
| `superadmin@flowbites.com` | Super Admin |
| `admin@flowbites.com` | Admin |
| `creator1@example.com` | Creator |
| `buyer1@example.com` | Buyer |

## System Architecture

```
Browser → Next.js (:3000) → Express API (:5001) → MongoDB
                    ↓
            Stripe / Cloudinary / Resend
```

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, data flows, database schema |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment, monitoring, security |
| [DEVELOPMENT.md](docs/DEVELOPMENT.md) | API reference, testing, contributing |
| [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Colors, typography, components, spacing |
| [LAUNCH.md](docs/LAUNCH.md) | Launch guide, marketing, email templates |

## Key Features

- **Template Marketplace** - Browse, filter, purchase templates
- **Creator Platform** - Upload, manage, earn from templates
- **Stripe Connect** - Automated creator payouts
- **Service Orders** - Custom work requests with messaging
- **Admin Dashboard** - Content moderation, user management
- **Real-time Notifications** - WebSocket-powered updates

## Scripts

```bash
# Backend
cd server && npm run dev        # Development
cd server && npm start          # Production
cd server && npm test           # Run tests
cd server && npm run seed:all   # Seed database

# Frontend
cd next-client && npm run dev   # Development
cd next-client && npm run build # Production build
cd next-client && npm test      # Run tests
```

## License

MIT
