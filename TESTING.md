# 🧪 Flowbites Testing Strategy

> **AI-Age Testing Philosophy**: Since AI writes code fast, we must test even faster. Every feature must have comprehensive test coverage.

---

## 📊 Test Coverage Requirements

| Level | Target | Framework |
|-------|--------|-----------|
| Unit Tests | 70%+ | Vitest + React Testing Library |
| API Tests | All endpoints | Custom Node.js test runner |
| E2E Tests | Core flows | Playwright |
| CI/CD | 100% automated | GitHub Actions |

---

## 🏗️ Testing Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     E2E Tests (Playwright)                   │
│         Authentication → Purchase → Review Flow              │
└─────────────────────────────────────────────────────────────┘
                              ▲
┌─────────────────────────────────────────────────────────────┐
│                   Integration Tests                          │
│    API endpoints, Database operations, Service layer         │
└─────────────────────────────────────────────────────────────┘
                              ▲
┌─────────────────────────────────────────────────────────────┐
│                    Unit Tests (Vitest)                       │
│  Components, Hooks, Utilities, Stores                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Run All Tests
```bash
# Root directory - runs everything
npm test

# Or individually:
npm run test:backend   # Backend integration tests
npm run test:frontend  # Frontend unit tests
npm run test:e2e       # E2E tests with Playwright
```

### Frontend Testing

```bash
cd next-client

# Run tests in watch mode (development)
npm test

# Run tests once with coverage
npm run test:coverage

# Run specific test file
npx vitest src/modules/reviews/components/ReviewCard.test.tsx

# Run E2E tests
npx playwright test

# Run E2E tests with UI
npx playwright test --ui
```

### Backend Testing

```bash
cd server

# Run integration tests
npm test

# Run in CI mode
npm run test:ci
```

---

## 📁 Test File Structure

```
next-client/
├── src/
│   ├── test/
│   │   ├── setup.ts           # Test configuration
│   │   ├── factories.ts       # Mock data factories
│   │   └── utils.tsx          # Test utilities
│   ├── modules/
│   │   └── reviews/
│   │       ├── components/
│   │       │   ├── StarRating.tsx
│   │       │   ├── StarRating.test.tsx      ← Component test
│   │       │   ├── ReviewCard.test.tsx
│   │       │   └── ReviewForm.test.tsx
│   │       └── services/
│   │           └── reviews.service.test.ts   ← Service test
├── e2e/
│   ├── auth.spec.ts           # Auth E2E tests
│   ├── template-browsing.spec.ts
│   └── review-flow.spec.ts
├── vitest.config.ts
└── playwright.config.ts

server/
├── tests/
│   ├── integration.test.js    # Main integration tests
│   └── setup.js               # Test utilities
```

---

## 📝 Writing Tests

### Component Tests (Vitest)

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '@/test/utils';
import { ReviewCard } from './ReviewCard';
import { createMockReview } from '@/test/factories';

describe('ReviewCard', () => {
  it('renders review with buyer info', () => {
    const review = createMockReview({
      buyerId: { _id: '1', name: 'John Doe' },
    });

    render(<ReviewCard review={review} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)

```ts
import { test, expect } from '@playwright/test';

test('user can submit a review', async ({ page }) => {
  await page.goto('/templates/test-template');
  
  // Fill review form
  await page.getByLabel(/review title/i).fill('Great template!');
  await page.getByPlaceholder(/what did you like/i).fill('Awesome!');
  await page.getByRole('button', { name: /submit review/i }).click();
  
  // Assert success
  await expect(page.getByText(/review submitted/i)).toBeVisible();
});
```

---

## 🎯 Critical Test Coverage Areas

### Must Test (Core Business Logic)
- [x] **Authentication**: Login, Register, Password Reset, Email Verification
- [x] **Reviews**: Submit, Edit, Delete, Moderation, Aggregation
- [x] **Payments**: Stripe Checkout, Connect, Webhooks, Refunds
- [x] **Templates**: CRUD, Approval Workflow, Versioning
- [x] **Creator Dashboard**: Analytics, Earnings, Withdrawals

### Should Test (User Experience)
- [ ] Search and filtering
- [ ] Wishlist functionality
- [ ] Follow/unfollow creators
- [ ] Notifications
- [ ] Admin moderation

### Nice to Test (Edge Cases)
- [ ] File uploads (Cloudinary)
- [ ] Rate limiting
- [ ] Error boundaries
- [ ] Loading states
- [ ] Responsive design

---

## 🔧 Test Factories (Mock Data)

Use factories to create consistent test data:

```ts
import { 
  createMockUser, 
  createMockTemplate, 
  createMockReview,
  createMockOrder 
} from '@/test/factories';

const user = createMockUser({ role: 'creator' });
const template = createMockTemplate({ price: 99 });
const review = createMockReview({ rating: 5 });
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

1. **Push/PR triggers:**
   - Backend integration tests
   - Frontend unit tests + coverage
   - Build verification
   - E2E tests (on PR to main)

2. **Pre-commit hooks:**
   - ESLint auto-fix
   - Staged unit tests
   - Type checking

3. **Main branch:**
   - Full test suite
   - Deployment

---

## 📈 Coverage Reports

### View Coverage
```bash
# Frontend coverage
npm run test:coverage
# Open: coverage/index.html

# Backend coverage (if configured)
cd server && npm run test:coverage
```

### Coverage Thresholds
- **Lines**: 70%
- **Functions**: 70%
- **Branches**: 60%
- **Statements**: 70%

---

## 🐛 Debugging Tests

### Frontend
```bash
# Run with UI
npx vitest --ui

# Debug specific file
npx vitest src/modules/reviews/components/ReviewForm.test.tsx

# Verbose output
npx vitest --reporter=verbose
```

### E2E
```bash
# Run in headed mode
npx playwright test --headed

# Run specific test
npx playwright test auth.spec.ts --headed

# Debug mode
npx playwright test --debug

# Trace viewer
npx playwright show-trace playwright-report/trace.zip
```

---

## 📚 Best Practices

### DO ✅
- Test behavior, not implementation
- Use factories for test data
- Mock external APIs (MSW)
- Test loading and error states
- Keep tests independent
- Use semantic queries (`getByRole`, `getByLabelText`)

### DON'T ❌
- Test implementation details
- Share state between tests
- Mock everything (test real interactions)
- Skip failing tests (fix them)
- Use `getByTestId` as first choice

---

## 🆘 Troubleshooting

### Common Issues

**Tests fail with "window is not defined"**
- Ensure `environment: 'jsdom'` in vitest.config.ts

**Playwright tests timeout**
- Increase timeout in playwright.config.ts
- Check if server is running: `npm run dev`

**Coverage not collecting**
- Check `include` pattern in vitest.config.ts
- Ensure files aren't in `exclude` list

---

## 🔗 Resources

- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Docs](https://playwright.dev/)
- [Testing Patterns](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
