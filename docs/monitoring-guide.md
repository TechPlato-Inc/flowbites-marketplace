# Monitoring and Observability Guide

## Scope and Current State
- Health endpoint exists at `GET /health` and currently returns:
  - `{ success: true, message: 'Flowbites Marketplace API is running' }`
  - Source: `server/src/index.js`
- Cleanup scheduler runs hourly via `startCleanupScheduler()` with one startup run after 30s.
- Global + auth-specific rate limiting is enabled in `server/src/index.js`.
- Per-user in-memory limiter exists in `server/src/middleware/userRateLimit.js` for selected routes.
- Admin stats aggregation is available in `server/src/modules/admin/admin.service.js#getDashboardStats`.

## 1) Health Checks

### What `/health` currently verifies
- HTTP process is alive and routing.
- It does **not** currently verify DB connectivity, external providers (Stripe/Resend/Cloudinary), queue depth, or cleanup-job freshness.

### Recommended health model
1. Keep `/health` as liveness probe (cheap, always fast).
2. Add `/ready` readiness probe with checks:
   - Mongo connection state
   - required env flags loaded
   - recent cleanup scheduler heartbeat
3. Expose probe fields:
   - `uptimeSec`, `version`, `env`, `db.status`, `timestamp`

### Probe configuration
- Kubernetes / Docker health probe interval: 10-30s.
- Alert when:
  - liveness fails twice in a row, or
  - readiness fails for >60s.

## 2) Key Metrics to Track

### API traffic and latency
- Requests/sec by route + method.
- P50/P95/P99 latency by route.
- Throughput by status code class (`2xx`, `4xx`, `5xx`).

### Error quality metrics
- Error rate split by class:
  - `4xx` client-side
  - `5xx` server-side
- Top failing endpoints (count + error signature).

### Database health
- Mongo connection status and reconnect count.
- Query latency percentile for hot collections (`orders`, `templates`, `tickets`, `withdrawals`).
- Slow query count and lock time.

### Business KPIs
- Active users (daily/weekly).
- Orders per hour and paid conversion.
- Revenue per hour/day.
- Refund requested/approved/processed counts.
- Creator payout/withdrawal volume.

### Security/abuse signals
- Failed login attempts by email and by IP.
- Account lockout count.
- Rate limit hits (global/auth/per-user).
- Report submission spike and ticket spam spike.

### Integration reliability
- Stripe webhook receive/verify/success/failure counts.
- Email send success/failure counts (Resend).
- Cloudinary upload failures.

## 3) Logging Strategy

## Current logging behavior
- Request logs only in development (`morgan('dev')`).
- Cron job activity logs to stdout in `cleanup.js`.
- Background non-blocking failures are logged via `console.error(...)` across services.

## Recommended production logging model
1. Use structured JSON logging (`pino` preferred; `winston` acceptable).
2. Emit consistent fields:
   - `timestamp`, `level`, `service`, `env`, `requestId`, `userId`, `route`, `method`, `statusCode`, `latencyMs`, `errorCode`, `message`
3. Attach correlation ID:
   - generate on request entry and propagate to all downstream logs.
4. Keep logs centralized:
   - stdout -> collector (CloudWatch, Datadog, ELK, Loki).

## Log levels
- `error`: failures requiring action or investigation.
- `warn`: degraded behavior, retries, threshold breaches.
- `info`: lifecycle events, startup, deploy, cron summaries.
- `debug`: verbose per-request internals (non-production only).

## 4) Alerting Rules

Use paging for high-signal incidents and ticketing/chat for lower urgency.

### Critical alerts
1. Error rate > 5% for 5 minutes.
2. P95 response time > 2s for 1 minute on core routes (`/api/checkout/*`, `/api/orders/*`, `/api/auth/*`).
3. Mongo disconnection/reconnect loop detected.
4. Stripe webhook failure count above threshold (e.g., >10 failures in 5 minutes).
5. Excess failed login attempts from same IP/email pattern (possible credential stuffing).

### Warning alerts
1. Queue of pending withdrawals grows abnormally.
2. Cleanup jobs failing for >2 consecutive runs.
3. Email failure ratio > 10% over 10 minutes.

## 5) Cron Job Monitoring

Source: `server/src/jobs/cleanup.js`

Jobs run every hour:
1. `cleanupStaleOrders()`:
   - expires pending orders older than 24h.
2. `cleanupOldReadNotifications()`:
   - removes read notifications older than 30 days.
3. `cleanupOldAuditLogs()`:
   - deletes audit records older than 1 year.
4. `cleanupExpiredRefreshTokens()`:
   - removes expired refresh tokens from user documents.

Verification strategy:
1. Emit structured start/end log event with run duration + per-job counts.
2. Persist last successful run timestamp (metrics or heartbeat doc).
3. Alert if no successful run in >2 hours.

Failure behavior today:
- Exceptions are caught and logged, but there is no retry/backoff policy and no alert integration by default.

## 6) Production Dashboards

Recommended stack:
- Metrics: Prometheus
- Visualization: Grafana
- Logs: Loki/ELK/Datadog
- Optional tracing: OpenTelemetry + Tempo/Jaeger

Dashboard panels (minimum):
1. API overview:
   - request rate, error rate, latency percentiles.
2. Route performance:
   - top 20 routes by traffic and slowest P95.
3. Auth and abuse:
   - failed logins, lockouts, rate-limit hits.
4. Payments:
   - checkout success rate, webhook failures, refunds.
5. Creator economy:
   - orders/hour, creator revenue, withdrawals pending/completed.
6. Cron operations:
   - last run status, duration, processed/deleted counts.
7. Infrastructure:
   - CPU/memory, container restarts, DB connection health.

MongoDB Atlas integration:
- Enable Atlas metrics and alerting for CPU, memory, slow queries, and connection spikes.
- Link Atlas alerts into the same incident channel as API alerts to avoid split-brain monitoring.

## Implementation Checklist
1. Add structured logger and request ID middleware.
2. Add `/ready` endpoint and DB status probe.
3. Instrument metrics middleware (request duration/status code counters + histograms).
4. Add webhook/email/cron explicit success/failure counters.
5. Build Grafana dashboards and configure alert routing.
