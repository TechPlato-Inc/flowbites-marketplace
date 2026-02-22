# Deployment Guide

This guide covers production setup for Flowbites using Docker + Nginx (primary) and PM2 (optional non-Docker path).

## 1) Production Readiness Checklist

- [ ] Domain DNS points to server IP (`A`/`AAAA` records)
- [ ] `.env.production` created from `.env.production.example`
- [ ] Strong JWT secrets generated
- [ ] MongoDB credentials set (or Atlas URI configured)
- [ ] Stripe live keys and webhook secret set
- [ ] Cloudinary configured
- [ ] Resend configured with verified sending domain
- [ ] HTTPS certificate issuance tested
- [ ] Health check endpoint reachable (`/health`)
- [ ] Backups scheduled and restore tested

## 2) MongoDB Atlas Setup

1. Create Atlas project and cluster.
2. Create DB user with strong password and least privilege.
3. Network access:
   - allow your server IP (preferred)
   - avoid `0.0.0.0/0` unless temporarily needed
4. Use Atlas connection string as `MONGODB_URI` in `server/.env` or production env.
5. Enable automated backups and choose retention.

## 3) Stripe Production Configuration

1. In Stripe Dashboard, switch to Live mode.
2. Set:
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `STRIPE_WEBHOOK_SECRET=whsec_...`
   - `STRIPE_PLATFORM_FEE_PERCENT=<number>`
   - `STRIPE_CONNECT_CLIENT_ID=ca_...`
3. Create webhook endpoint:
   - `https://<your-domain>/api/webhooks/stripe`
4. Subscribe to at least:
   - `checkout.session.completed`
   - `charge.refunded`
5. Validate end-to-end on test environment before production rollout.

## 4) Cloudinary Setup

1. Create Cloudinary account.
2. Set env vars:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. Optional migration for legacy local images:

```bash
cd server
npm run migrate-cloudinary
```

## 5) Resend Email Setup

1. Verify sender domain in Resend.
2. Set env vars:
   - `RESEND_API_KEY`
   - `FROM_EMAIL`
   - `FROM_NAME`
3. Validate transactional flows:
   - register welcome/verify
   - forgot password
   - purchase confirmation
   - refund status

## 6) Domain, SSL, Reverse Proxy (Nginx)

Current stack routes:
- `/api/*`, `/uploads/*` -> Express API
- everything else -> Next.js app

TLS path in repo:
- `nginx.conf` includes HTTP and SSL sections
- `deploy.sh` obtains Let’s Encrypt cert via Certbot and enables HTTPS block

Minimum DNS records:
- `A @ -> <server-ip>`
- `A www -> <server-ip>` (if needed)

## 7) Docker Production Deployment (Primary)

### 7.1 Configure env

```bash
cp .env.production.example .env.production
# fill values
```

### 7.2 Deploy

```bash
./deploy.sh
```

Manual alternative:

```bash
docker compose --env-file .env.production up -d --build
```

### 7.3 Verify

```bash
docker compose --env-file .env.production ps
docker compose --env-file .env.production logs -f api
curl -I https://<your-domain>/health
```

## 8) PM2 Deployment (Optional, Non-Docker)

Use this only if you are not running Docker services.

1. Install PM2:

```bash
npm i -g pm2
```

2. Backend:

```bash
cd server
npm ci
pm2 start src/index.js --name flowbites-api
```

3. Frontend:

```bash
cd next-client
npm ci
npm run build
pm2 start "npm run start" --name flowbites-client
```

4. Persist PM2 on reboot:

```bash
pm2 save
pm2 startup
```

You still need a reverse proxy (Nginx/Caddy) and TLS in front.

## 9) Health Check Monitoring

Endpoint:
- `GET /health`

Recommended checks:
- API uptime every 30-60s
- SSL expiry monitoring
- container restart alerts
- Stripe webhook failure rate / HTTP 4xx/5xx alerts

Suggested tools:
- Uptime Kuma / Better Stack / Pingdom
- Grafana + Prometheus + Loki (if centralized observability is desired)

## 10) Backup Strategy

## MongoDB
- Daily snapshots + PITR (Atlas preferred)
- Retention: 7/30 days minimum by plan
- Regular restore drills to staging

## Uploads (if local fallback used)
- Back up `uploads` volume daily
- Store encrypted backups off-server

## App Config
- Store `.env.production` secrets in vault/secret manager
- Keep IaC/config in git (without secrets)

## 11) Scaling Considerations

## Application
- Run multiple API replicas behind load balancer
- Ensure sticky sessions are not required (JWT stateless auth helps)
- Move in-memory per-user rate limit to Redis for multi-node consistency

## Database
- Add indexes from `docs/database-indexes.md`
- Separate read-heavy analytics/reporting workloads
- Monitor slow query logs and lock contention

## Storage/CDN
- Prefer Cloudinary CDN for public media
- Keep heavy file downloads behind CDN or dedicated download service if traffic grows

## Queues/Async
- Move email and payout side effects to job queue (BullMQ/SQS) as throughput increases

## 12) Post-Deployment Validation

- [ ] Register/login/refresh/logout flows pass
- [ ] Email verification and reset password pass
- [ ] Template checkout + webhook fulfillment pass
- [ ] Service checkout pass
- [ ] Refund approve/reject pass
- [ ] Creator Stripe Connect onboarding pass
- [ ] Admin moderation pages load and mutate data
- [ ] `docs/api-reference.md` matches deployed behavior

