# Contributing Guide

## Development Setup

1. Clone repository and install dependencies:

```bash
cd server && npm install
cd ../next-client && npm install
```

2. Configure environment:

```bash
cp server/.env.example server/.env
cp next-client/.env.example next-client/.env.local
```

3. Start services:

```bash
cd server && npm run dev
cd next-client && npm run dev
```

## Branch Naming
Use one of the following prefixes:
- `feature/<short-description>`
- `fix/<short-description>`
- `docs/<short-description>`

Examples:
- `feature/refund-admin-filters`
- `fix/checkout-coupon-validation`
- `docs/api-reference-update`

## Commit Message Format
Use conventional format:
- `type(scope): message`

Allowed `type` values:
- `feat`
- `fix`
- `docs`
- `refactor`
- `test`

Examples:
- `feat(auth): add resend verification endpoint`
- `fix(checkout): handle missing coupon safely`
- `docs(readme): add docker quick start`

## Pull Request Checklist
Before opening a PR, confirm:
- [ ] Branch name follows convention
- [ ] Commit messages follow `type(scope): message`
- [ ] Relevant docs updated (`README.md`, `docs/`, or API docs)
- [ ] Local tests run and pass (or reason documented)
- [ ] No secrets/keys committed
- [ ] Screenshots attached for UI changes
- [ ] API behavior changes reflected in `docs/api-reference.md`

## Code Style Expectations

### Backend
- Use ES modules (`import`/`export`)
- Keep route/controller/service separation
- Keep business logic in services, not routes/controllers
- Use Zod validators for input validation where applicable
- Use existing error pattern (`AppError`, error middleware)
- Follow existing Mongoose model conventions

### Frontend
- Follow Next.js App Router patterns
- Reuse design-system components where available
- Keep feature code in module folders
- Use existing API client (`@/lib/api/client`)

## Testing

### Backend
Run integration tests:

```bash
cd server
npm test
# CI mode
npm run test:ci
```

### Frontend
Build validation:

```bash
cd next-client
npm run build
```

If linting is part of your workflow:

```bash
cd next-client
npm run lint
```

## Security and Secrets
- Never commit `.env` files
- Never commit production API keys/secrets
- Redact tokens/secrets from logs and PR screenshots

## Ownership Rules
- Coordinate changes to shared files (`README.md`, Docker files, CI workflows)
- Respect module ownership conventions documented in agent instruction files
