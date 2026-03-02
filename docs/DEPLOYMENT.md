# Deployment & Operations

## Deployment Options

### Option A: Vercel + Railway (Recommended for Speed)

**Stack:** Vercel (Next.js frontend) + Railway (Express API) + MongoDB Atlas

#### Step 1: MongoDB Atlas

1. Create free M0 cluster at mongodb.com/atlas
2. Create database user with read/write privileges
3. Network access: Allow from anywhere (`0.0.0.0/0`) for Railway
4. Copy connection string:
   ```
   mongodb+srv://user:password@cluster.mongodb.net/flowbites?retryWrites=true&w=majority
   ```

#### Step 2: Railway (Backend)

1. Sign in at railway.app with GitHub
2. New Project → Deploy from GitHub repo
3. Configure:
   - **Root Directory:** `server`
   - **Build:** `npm install`
   - **Start:** `npm start`

4. Set environment variables:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Atlas connection string |
| `JWT_ACCESS_SECRET` | `openssl rand -hex 64` |
| `JWT_REFRESH_SECRET` | `openssl rand -hex 64` |
| `JWT_ACCESS_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | `https://yourdomain.com` |
| `SITE_URL` | `https://yourdomain.com` |
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `STRIPE_PLATFORM_FEE_PERCENT` | `20` |
| `RESEND_API_KEY` | `re_...` |
| `FROM_EMAIL` | `noreply@yourdomain.com` |
| `CLOUDINARY_CLOUD_NAME` | your cloud name |
| `CLOUDINARY_API_KEY` | your API key |
| `CLOUDINARY_API_SECRET` | your API secret |

5. Generate domain: Settings → Networking → Generate Domain
6. Save Railway URL (e.g., `flowbites-api.up.railway.app`)

#### Step 3: Vercel (Frontend)

1. Sign in at vercel.com with GitHub
2. Add New → Project → Import repo
3. Configure:
   - **Framework:** Next.js
   - **Root Directory:** `next-client`
   - **Build:** `npm run build`

4. Set environment variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `/api` |
| `NEXT_PUBLIC_API_BASE_URL` | `https://your-railway-url.railway.app` |
| `API_INTERNAL_URL` | `https://your-railway-url.railway.app/api` |
| `NEXT_PUBLIC_UPLOADS_URL` | `/uploads` |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | your cloud name |

5. Add custom domain: Project Settings → Domains
6. Update Railway env vars with final domain

#### Step 4: Stripe Webhooks

1. Stripe Dashboard → Webhooks → Add endpoint
2. URL: `https://your-railway-url.railway.app/api/webhooks/stripe`
3. Events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy signing secret to Railway

---

### Option B: Docker + Nginx (Full Control)

#### Prerequisites
- Docker and Docker Compose
- Domain with DNS pointing to server

#### Production Readiness Checklist

- [ ] Domain DNS configured (`A`/`AAAA` records)
- [ ] `.env.production` created from `.env.production.example`
- [ ] Strong JWT secrets generated
- [ ] MongoDB Atlas configured
- [ ] Stripe live keys and webhook secret set
- [ ] Cloudinary configured
- [ ] Resend configured with verified domain

#### Deploy

```bash
# Configure environment
cp .env.production.example .env.production
# Fill in all values

# Deploy
./deploy.sh

# Or manually
docker compose --env-file .env.production up -d --build

# Verify
docker compose --env-file .env.production ps
docker compose --env-file .env.production logs -f api
curl -I https://<your-domain>/health
```

#### Post-Deployment Validation

- [ ] Register/login/refresh/logout flows pass
- [ ] Email verification and password reset work
- [ ] Template checkout + webhook fulfillment pass
- [ ] Creator Stripe Connect onboarding works
- [ ] Admin moderation pages load

---

### Option C: PM2 Deployment (Non-Docker)

```bash
# Install PM2
npm i -g pm2

# Backend
cd server
npm ci
pm2 start src/index.js --name flowbites-api

# Frontend
cd ../next-client
npm ci
npm run build
pm2 start "npm run start" --name flowbites-client

# Persist
pm2 save
pm2 startup
```

> Requires Nginx/Caddy as reverse proxy with TLS.

---

## Security

### Security Audit Summary (2026-02-21)

**Status:** 0 Critical, 0 High, 7 Medium, 2 Low

**Resolved:**
- ✅ Access token cookie now httpOnly
- ✅ Refresh tokens hashed before storage
- ✅ Upload validation (MIME + extension)
- ✅ Coupon race condition fixed

**Medium Priority:**
1. Add Zod validation to tickets/withdrawals/settings routes
2. Make withdrawal request atomic (transaction/conditional write)
3. Add per-user rate limits for ticket creation
4. Add throttling to public search endpoints
5. Enable CSP (currently disabled)
6. Login lockout DoS protection (blend IP/device heuristics)
7. Separate Stripe webhook rate limiter

**Low Priority:**
1. Remove localhost from CORS in production
2. Add startup guard for `STRIPE_WEBHOOK_SECRET`

### Security Best Practices

#### Before Going Live
1. **Change all default passwords**
2. **Generate new JWT secrets** (32+ characters)
3. **Enable 2FA on Stripe account**
4. **Set up Cloudinary restricted folders**
5. **Configure rate limiting** (already enabled)
6. **Enable HTTPS only**
7. **Set up monitoring/logging**

#### Environment Security
```bash
# Generate secure secrets
openssl rand -hex 64

# Never commit .env files
# Redact tokens from logs and screenshots
```

---

## Monitoring & Observability

### Health Checks

**Endpoint:** `GET /health`

**Recommended Setup:**
1. `/health` - Liveness probe (cheap, always fast)
2. `/ready` - Readiness probe with MongoDB + env checks

**Probe Configuration:**
- Interval: 10-30s
- Alert when: liveness fails twice, or readiness fails >60s

### Key Metrics to Track

| Category | Metrics |
|----------|---------|
| **API Traffic** | Requests/sec, P50/P95/P99 latency, status codes |
| **Errors** | 4xx/5xx rates, top failing endpoints |
| **Database** | Connection status, query latency, slow queries |
| **Business** | Active users, orders/hour, revenue, conversion |
| **Security** | Failed logins, lockouts, rate limit hits |
| **Integrations** | Stripe webhook success/failure, email delivery |

### Cron Job Monitoring

Jobs run hourly from `server/src/jobs/cleanup.js`:
1. `cleanupStaleOrders()` - expires pending orders >24h
2. `cleanupOldReadNotifications()` - removes read notifications >30d
3. `cleanupOldAuditLogs()` - deletes audit records >1y
4. `cleanupExpiredRefreshTokens()` - removes expired tokens

**Alert if:** No successful run in >2 hours

### Logging Strategy

**Recommended:** Structured JSON logging (pino/winston)

**Fields to include:**
- `timestamp`, `level`, `service`, `env`
- `requestId`, `userId`, `route`, `method`
- `statusCode`, `latencyMs`, `errorCode`

**Log Levels:**
- `error` - failures requiring action
- `warn` - degraded behavior, retries
- `info` - lifecycle events
- `debug` - verbose internals (dev only)

### Critical Alerts

1. Error rate > 5% for 5 minutes
2. P95 response time > 2s on core routes
3. MongoDB disconnection/reconnect loop
4. Stripe webhook failures >10 in 5 minutes
5. Excess failed logins from same IP

### Backup Strategy

**MongoDB:**
- Daily snapshots + PITR (Atlas)
- Retention: 7/30 days minimum
- Regular restore drills

**Uploads:**
- Back up `uploads` volume daily if using local storage
- Store encrypted backups off-server

**Config:**
- Store `.env.production` in vault/secret manager
- Keep IaC/config in git (without secrets)

---

## Troubleshooting

### "CSRF validation failed"
Ensure `CLIENT_URL` matches exact domain (including `https://`).

### "CORS error" in browser
Ensure `CLIENT_URL` has no trailing slash.

### API calls return 404
Ensure `NEXT_PUBLIC_API_BASE_URL` points to Railway URL (no `/api` suffix).

### Images not loading
Ensure Cloudinary configured, or `NEXT_PUBLIC_UPLOADS_URL` set to `/uploads`.

### Database connection fails
Ensure MongoDB Atlas allows `0.0.0.0/0` (Railway's dynamic IPs).

### Stripe webhook not working
- Verify webhook URL is directly to Railway (not through Vercel proxy)
- Check webhook secret is correct
- Verify subscribed to correct events
