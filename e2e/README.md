# E2E Tests

End-to-end tests using Playwright for the Backpack Planner application.

## Setup

```bash
npm install
npx playwright install --with-deps chromium
```

## Running Tests

```bash
npm run test:e2e
```

## Test Structure

- `login.spec.ts` - Authentication flow tests
- `create-trip.spec.ts` - Trip creation from dashboard
- `waypoint.spec.ts` - Waypoint management
- `route.spec.ts` - Route drawing and tab navigation

## Mocking Strategy

The tests use Playwright route interception to mock Supabase API calls in `e2e/mocks/supabase.ts`. This allows tests to run without a real Supabase backend.

### Current Limitations

The Supabase auth mocking approach intercepts network requests, but Supabase's client-side session management checks localStorage and makes immediate auth calls on page load. For fully functional tests, consider:

1. **Test Supabase Instance**: Set up a dedicated test project in Supabase with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in `.env.test`
2. **Enhanced Mocking**: Use Playwright's `page.addInitScript()` to inject a mock Supabase client before any application code runs
3. **Test User Accounts**: Create dedicated test users for E2E flows

## CI/CD

Tests run on every PR to `main` and `dev` via `.github/workflows/playwright.yml`. The workflow:
- Installs dependencies
- Installs Playwright browsers
- Starts Vite dev server
- Runs E2E tests
- Uploads HTML report on failure

## Writing Tests

Focus on user-visible behavior and interactions:
- Use semantic selectors (`getByRole`, `getByText`, `getByLabel`)
- Avoid implementation details (CSS classes, internal state)
- Test critical user flows, not every edge case
- For map interactions, test UI controls rather than pixel-level map rendering (MapLibre may not fully render in headless browsers)
