# Legolas — History

## Project Context

- **Project:** Backpack Planner — outdoor adventure webapp
- **Stack:** React + TypeScript, Vite, Tailwind CSS, shadcn/ui, MapLibre GL JS, Supabase, Zustand
- **User:** Rob

## Learnings

- Created ThemeProvider tests (18 tests) in src/lib/theme.test.tsx
- Created ThemeToggle tests (14 tests) in src/components/ThemeToggle.test.tsx
- Installed @testing-library/jest-dom for test matchers
- All 149 tests pass as of last run
- **Issue #11**: Set up Playwright E2E testing infrastructure
  - Installed @playwright/test and configured playwright.config.ts
  - Created e2e/ directory with test files for 4 core flows:
    * login.spec.ts - auth redirects and protected routes
    * create-trip.spec.ts - trip creation dialog and navigation
    * waypoint.spec.ts - waypoint sidebar and empty states
    * route.spec.ts - map visibility and tab navigation
  - Created e2e/mocks/supabase.ts for mocking Supabase auth and data APIs using Playwright route interception
  - Added GitHub Actions workflow (.github/workflows/playwright.yml) to run tests on PRs
  - Added test:e2e script to package.json
  - Documented test structure and mocking approach in e2e/README.md
  - **Challenge**: Supabase's client-side session checks happen immediately on page load, making network-level mocking insufficient. Tests demonstrate infrastructure but need enhanced mocking or test Supabase instance for full functionality.
  - Branch: squad/11-playwright-tests, PR #21
