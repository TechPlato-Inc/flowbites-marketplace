# Data Migration and Schema Change Guide

## Context
This guide covers user-related schema updates and safe rollout for existing production data.

Reviewed sources:
- `server/src/modules/users/user.model.js`
- `server/src/modules/admin/userManagement.service.js`
- `server/src/modules/users/settings.service.js`
- `server/src/modules/auth/auth.service.js`

## 1) Schema Changes Summary

### User model changes
New user fields now used by runtime logic:
- `isBanned` (boolean)
- `bannedAt` (date)
- `bannedBy` (ObjectId -> User)
- `banReason` (string)
- `emailPreferences` (nested object)

### Auth token storage change
- Refresh tokens in `user.refreshTokens[].token` are now stored as SHA-256 hashes (not plaintext).
- Runtime hash/compare logic is in `auth.service.js` (`_hashToken()`).

## 2) Migration Scripts (Template + Implementation)

Created migration directory:
- `scripts/migrations/`

Created migrations:
1. `scripts/migrations/001-add-user-ban-fields.js`
   - Backfills `isBanned`, `bannedAt`, `bannedBy`, `banReason` for existing users.
2. `scripts/migrations/002-hash-refresh-tokens.js`
   - Detects non-hashed refresh tokens and hashes them with SHA-256.
   - Leaves already-hashed tokens untouched.
3. `scripts/migrations/003-add-email-preferences.js`
   - Backfills `emailPreferences` object and missing nested keys with defaults.

Migration runner:
- `scripts/migrations/run-migrations.js`
- Tracks applied migrations in Mongo collection: `schema_migrations`.

## 3) Migration Best Practices

1. Backup before every migration:
   - Use MongoDB Atlas snapshot or `mongodump`.
2. Use maintenance mode for schema/data migrations:
   - Pause writes or route API to read-only/maintenance response.
3. Run on staging first with production-like volume:
   - Validate runtime behavior and timings.
4. Make migrations idempotent:
   - Runner skips already applied IDs.
5. Keep rollback plan per migration:
   - `001` and `003`: optional field rollback via `$unset`.
   - `002`: hash conversion is one-way; rollback means invalidating sessions and forcing re-login.
6. Verify after migration:
   - Counts of affected docs
   - Spot-check random documents
   - Auth/login and settings flows in smoke test

## 4) Running Migrations

Added script:
- `server/package.json` -> `"migrate": "node ../scripts/migrations/run-migrations.js"`

Run command:
```bash
cd server
npm run migrate
```

Environment requirements:
- `MONGODB_URI` must be set (or available in `server/.env`).

Runner behavior:
1. Connects to MongoDB.
2. Loads migrations in order (001 -> 003).
3. Executes only unapplied migrations.
4. Persists execution record into `schema_migrations`.
5. Exits non-zero on first failure.

## 5) Rollback Strategy

### 001-add-user-ban-fields
- Rollback (optional):
  - `$unset: { isBanned: 1, bannedAt: 1, bannedBy: 1, banReason: 1 }`
- Risk: low; additive defaults only.

### 002-hash-refresh-tokens
- Rollback:
  - Cannot reconstruct plaintext from SHA-256.
  - Operational rollback approach: clear refresh tokens and force re-authentication.
- Risk: medium; impacts active sessions.

### 003-add-email-preferences
- Rollback (optional):
  - `$unset: { emailPreferences: 1 }` or specific nested keys.
- Risk: low; additive defaults only.

## 6) Verification Checklist

1. `schema_migrations` contains all three IDs with timestamps.
2. `users` collection checks:
   - no missing `isBanned`
   - no missing `emailPreferences` keys
   - refresh tokens are 64-char hex hashes
3. API smoke tests:
   - login/refresh/logout
   - admin ban/unban flow
   - settings email preference read/update flow
