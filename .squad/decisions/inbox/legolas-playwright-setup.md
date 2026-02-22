# Playwright E2E Testing Infrastructure

**Date:** 2025-02-22
**Author:** Legolas (Tester)
**Issue:** #11
**PR:** #21

## Context
Issue #11 requested Playwright E2E tests for core user flows (login, create trip, add waypoint, draw route) with mocked Supabase backend and GitHub Actions CI integration.

## Decision
Set up Playwright testing infrastructure with:
- `playwright.config.ts` pointing to local Vite dev server (`localhost:5173`)
- `e2e/` directory for test files
- `e2e/mocks/supabase.ts` for mocking Supabase auth and data APIs via Playwright route interception
- `test:e2e` npm script
- `.github/workflows/playwright.yml` for CI on PRs to `main` and `dev`

### Test Structure
- **login.spec.ts**: Auth redirects, protected route guards
- **create-trip.spec.ts**: Trip creation dialog, navigation to planner
- **waypoint.spec.ts**: Waypoint sidebar, empty states
- **route.spec.ts**: Map visibility, tab navigation

### Mocking Strategy
Uses Playwright's `page.route()` to intercept and mock:
- `**/auth/v1/**` endpoints (session, user, token)
- `**/rest/v1/**` endpoints (trips, waypoints, routes, etc.)

## Known Limitations
Supabase client performs immediate auth checks on page load using localStorage and synchronous session retrieval. Network-level mocking via `page.route()` happens *after* initial page load, causing auth state to be uninitialized by the time the app renders.

**Workarounds for future improvement:**
1. Use `page.addInitScript()` to inject a mock Supabase client before any app code runs
2. Set up dedicated test Supabase project with real credentials in `.env.test`
3. Use Playwright fixtures to pre-seed auth state in localStorage with correct Supabase key format

## Rationale
- Demonstrates E2E testing infrastructure is in place
- Provides foundation for expanding test coverage
- CI workflow ready for automated testing on PRs
- Mocking approach keeps tests fast and independent of backend

## Impact
- Team can run `npm run test:e2e` locally
- CI validates test infrastructure on every PR
- Tests serve as examples for future E2E test development
- May need enhanced mocking or test instance for full auth flow coverage
