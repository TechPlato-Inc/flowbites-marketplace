# Flowbites Marketplace - Backend API

Node.js + Express + MongoDB backend for the Flowbites template marketplace.

## Architecture

**Modular feature-based structure:**
- Each module has: `model.js`, `service.js`, `controller.js`, `routes.js`, `validator.js`
- Clean separation of concerns
- Easy to test and maintain

## File Structure

```
server/
├── src/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js                  # JWT authentication & RBAC
│   │   ├── errorHandler.js          # Global error handling
│   │   ├── upload.js                # File upload (multer)
│   │   └── validate.js              # Request validation (zod)
│   ├── modules/
│   │   ├── auth/                    # Authentication (register, login, refresh)
│   │   ├── users/                   # User management
│   │   ├── creators/                # Creator profiles
│   │   ├── templates/               # Template CRUD + search
│   │   ├── categories/              # Categories & tags
│   │   ├── orders/                  # Order creation + mock checkout
│   │   ├── downloads/               # License + secure downloads
│   │   ├── services/                # Service packages & orders
│   │   ├── ui-shorts/               # UI Shots feed
│   │   ├── admin/                   # Template moderation
│   │   └── analytics/               # Event tracking
│   ├── scripts/
│   │   └── seed.js                  # Database seeding
│   └── index.js                     # Server entry point
├── uploads/                         # File storage (templates, images, shots)
├── .env.example                     # Environment variables template
└── package.json
```

## Setup & Installation

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your MongoDB URI and secrets.

### 3. Start MongoDB

Ensure MongoDB is running locally or use MongoDB Atlas.

### 4. Seed Database

```bash
npm run seed
```

This creates:
- 1 admin user
- 2 creators with profiles
- 2 buyers
- 6 categories
- 6 tags
- 2 templates (1 approved, 1 pending)
- 1 UI shot

### 5. Start Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server runs on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Templates
- `GET /api/templates` - List templates (with filters)
- `GET /api/templates/:id` - Get template details
- `POST /api/templates` - Create template (creator only)
- `PATCH /api/templates/:id` - Update template (creator only)
- `DELETE /api/templates/:id` - Delete template (creator only)
- `POST /api/templates/:id/submit` - Submit for review

### Orders
- `POST /api/orders` - Create order
- `POST /api/orders/mock-checkout` - Complete order (MVP mock)
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:id` - Get order details

### Downloads
- `POST /api/downloads/token` - Generate download token
- `GET /api/downloads/:token` - Download file
- `GET /api/downloads/licenses/my-licenses` - Get user's licenses

### Services
- `POST /api/services/packages` - Create service package (creator)
- `GET /api/services/packages?templateId=X` - Get packages for template
- `POST /api/services/orders` - Request service
- `PATCH /api/services/orders/:id/status` - Update service status
- `GET /api/services/orders/my-orders` - Get user's service orders

### UI Shorts
- `GET /api/ui-shorts` - List shots
- `POST /api/ui-shorts` - Post shot (creator)
- `POST /api/ui-shorts/:id/like` - Toggle like
- `POST /api/ui-shorts/:id/save` - Toggle save

### Admin
- `GET /api/admin/templates/pending` - Get pending templates
- `GET /api/admin/templates` - Get all templates (any status)
- `POST /api/admin/templates/:id/approve` - Approve template
- `POST /api/admin/templates/:id/reject` - Reject template

### Categories & Tags
- `GET /api/categories` - Get all categories
- `GET /api/tags` - Get popular tags
- `POST /api/categories` - Create category (admin only)

### Analytics
- `POST /api/analytics/event` - Track event
- `GET /api/analytics/metrics` - Get funnel metrics (admin)

## Test Credentials

After seeding, use these credentials:

**Admin:**
```
Email: admin@flowbites.com
Password: admin123456
```

**Creator 1:**
```
Email: creator1@example.com
Password: creator123456
```

**Creator 2:**
```
Email: creator2@example.com
Password: creator123456
```

**Buyer 1:**
```
Email: buyer1@example.com
Password: buyer123456
```

## Features Implemented

✅ JWT authentication with refresh tokens
✅ Role-based access control (buyer, creator, admin)
✅ Template CRUD with file uploads
✅ Search & filter templates
✅ Template moderation workflow
✅ Secure downloads with expiring tokens
✅ Service packages & service orders
✅ UI Shots feed with likes/saves
✅ Mock checkout flow (Stripe scaffolding ready)
✅ Analytics event tracking
✅ Rate limiting & security headers

## Security Features

- Helmet.js for HTTP headers
- CORS configured
- Rate limiting on all routes
- JWT with httpOnly cookies
- File upload validation
- Input validation with Zod
- Password hashing with bcrypt

## Next Steps (Post-MVP)

- [ ] Integrate real Stripe payments
- [ ] Upload to S3 instead of local storage
- [ ] Email notifications (welcome, purchase, service)
- [ ] Reviews & ratings
- [ ] Creator payouts
- [ ] Advanced analytics dashboard
- [ ] Template versioning
- [ ] Automated testing suite

## Support

For issues, check the error logs and ensure:
1. MongoDB is running
2. Environment variables are set
3. Dependencies are installed
4. Database is seeded
