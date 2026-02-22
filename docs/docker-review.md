# Docker and CI Review

## Scope
- Reviewed `docker-compose.yml` for production-readiness, security, and operability.
- Reviewed `.github/workflows/ci.yml` for test coverage, build correctness, and release safety.

## docker-compose.yml

### High-priority issues
1. Weak secret defaults are present in Compose (`MONGO_ROOT_PASSWORD`, JWT secrets).
2. `CLIENT_URL` defaults to `https://localhost`, which can break checkout/email links if not overridden.
3. `api` and `client` services do not define healthchecks, so runtime failures are not detected early.

### Medium-priority issues
1. No container hardening settings (`read_only`, `tmpfs`, `cap_drop`, `no-new-privileges`) on internet-facing services.
2. Secrets are passed as plain environment variables instead of managed secrets files.
3. Logging and retention are not configured; noisy logs can consume disk over time.

### Recommended changes
1. Remove insecure defaults for production secrets and fail fast if missing.
2. Require explicit `CLIENT_URL` and add startup validation for external URLs.
3. Add healthchecks:
   - `api`: `GET /health`
   - `client`: HTTP probe on port 3000
   - `nginx`: HTTP probe on `/`
4. Add `restart` strategy plus conservative resource limits for `api`, `client`, and `nginx`.
5. Add security options where compatible:
   - `read_only: true` for `nginx` and `client`
   - `tmpfs` for writable temp paths
   - `cap_drop: ["ALL"]` and `security_opt: ["no-new-privileges:true"]`
6. Add logging controls (e.g., `json-file` with `max-size` and `max-file`).
7. Move sensitive values to Docker secrets or an external secret manager for production.

## .github/workflows/ci.yml

### High-priority issues
1. Job is named "Server — Lint & Test" but runs neither lint nor test commands.
2. Docker build step uses `docker build ./server`, while production Compose builds from root `Dockerfile` targets; this can drift from real deploy artifacts.
3. Docker runtime check uses `host.docker.internal` for MongoDB on Ubuntu runner; this is fragile and environment-dependent.

### Medium-priority issues
1. Client job runs `tsc` and build, but no lint step.
2. No artifact or cache strategy for Docker layers in CI main-branch builds.
3. No smoke test against the actual production-like `docker compose` stack.

### Recommended changes
1. Add explicit lint and test commands:
   - Server: `npm run lint` and `npm test`
   - Client: `npm run lint`
2. Build the same production images used in deployment:
   - `docker build --target api ...` and `--target client ...` from root `Dockerfile`, or use `docker compose build`.
3. Replace `host.docker.internal` with a deterministic test setup:
   - Run MongoDB as a CI service and run tests outside container, or
   - Run integration checks via `docker compose up` with service DNS names.
4. Add Docker buildx cache (`type=gha`) to reduce CI time and improve reliability.
5. Add a post-build smoke test:
   - Start stack with required env vars
   - Probe `/health` through API (and optionally through nginx route)
   - Tear down and collect logs on failure.

## Suggested execution order
1. Fix CI to run real lint/tests and align Docker build target.
2. Add healthchecks and remove weak secret defaults from Compose.
3. Add hardening/logging controls and production smoke tests.
