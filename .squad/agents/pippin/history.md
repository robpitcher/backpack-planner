# Pippin — History

## Project Context

- **Project:** Backpack Planner (TrailForge) — a map-first, day-by-day trip planner for backpackers
- **Stack:** Vite + React 19 + TypeScript (strict), Tailwind CSS v4, shadcn/ui, Zustand, React Router v6, Supabase
- **User:** Rob

## Learnings

- **Scaffold setup (WI#2):** Vite scaffolds React 19 by default (not 18). Kept React 19 since it's backwards-compatible and the current stable version.
- **Tailwind v4:** Uses `@tailwindcss/vite` plugin and `@import "tailwindcss"` in CSS — no tailwind.config.js needed.
- **shadcn/ui init:** Requires `@/*` path alias in the **root** tsconfig.json (not just tsconfig.app.json) for detection. Uses new-york style by default.
- **Path alias:** `@/*` → `./src/*` configured in both tsconfig.json, tsconfig.app.json, and vite.config.ts.
- **Key file paths:**
  - `src/App.tsx` — Router with all route definitions
  - `src/pages/` — LoginPage, DashboardPage, TripPlannerPage, TripDetailPage
  - `src/stores/tripStore.ts` — Zustand shell store (empty, ready to extend)
  - `src/lib/supabase.ts` — Supabase client (env-var-based)
  - `src/lib/utils.ts` — shadcn cn() utility
  - `src/components/` — empty, ready for components (shadcn UI goes in src/components/ui/)
  - `src/utils/` — empty, for unit conversion module
  - `src/types/` — empty, for shared TypeScript types
  - `.env.example` — VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_MAPBOX_TOKEN
  - `components.json` — shadcn/ui configuration
- **CI scripts:** `lint`, `type-check`, `format`, `format:check`, `build` all in package.json
- **ESLint:** Flat config with typescript-eslint + react-hooks + react-refresh + prettier integration
- **Route structure:** / → redirect /dashboard, /login, /dashboard, /trip/:tripId/plan, /trip/:tripId

### PRD Decomposition & Breakdown (2026-02-21)
- PRD decomposed into **33 work items across 3 phases** (22 P0, 11 P1)
- **Phase 1 items 1–10 are ready** for pickup — foundation, auth, dashboard, CRUD
- See `.squad/decisions/decisions.md` for full breakdown with parallelization strategy
- **Tech Stack Confirmed:**
  - Frontend: Vite + React 18 + TypeScript + Tailwind + shadcn/ui + Zustand
  - Backend: Supabase (Auth, Postgres, RLS, Edge Functions)
  - Mapping: Mapbox GL JS
  - State: All units stored in imperial in DB; client-side conversion only
- **Key items for Pippin:**
  - Phase 1: Project scaffold (2), Auth UI (4), User profile (5), Unit conversion utility (6), Shared types (7), Dashboard UI (9), Trip CRUD UI (10)
  - Phase 2: Mapbox integration (11), Route drawing (12), Waypoint placement (14), Waypoint detail panel (15), Itinerary panel (17), Responsive layout (18)
  - Phase 3: Gear list UI (20), Trip share view frontend (22), Elevation profile (23), GPX import UI (25), Conditions UI (28), Gear templates UI (30), QA polish (33)
- **Risk: Mapbox key** must be env var only (VITE_MAPBOX_TOKEN); **Risk: Drag-and-drop library** choice (@dnd-kit/core vs react-beautiful-dnd) needed before Item 17

### WI#6 & WI#7 — Unit Conversion Utility & Shared Types (2026-02-21)
- **Unit conversion module:** `src/utils/units.ts` — pure functions for distance (mi↔km), elevation (ft↔m), weight (oz↔g), temperature (°F↔°C) plus formatter functions that take imperial values + UnitSystem and return display strings.
- **Shared types:** `src/types/index.ts` — all entity interfaces (User, Trip, Day, Waypoint, GearItem, Conditions) and enum types (UnitSystem, TripStatus, WaypointType, GearCategory, ConditionSource) matching the PRD data model.
- **Vitest installed:** Added as devDependency; `npm run test` and `npm run test:watch` scripts added. 39 unit tests covering all conversions + edge cases (zero, negative, large values, round-trip accuracy) + all formatters.
- **Design decisions:**
  - All DB values are stored in imperial; conversion is display-only (per PRD §6).
  - Formatter functions accept imperial values and a UnitSystem, returning formatted strings with unit labels.
  - Elevation/formatElevation uses Math.round (whole numbers) since fractional feet/meters are not meaningful for hiking.
  - Types use `string` for timestamps (ISO 8601 from Supabase) and `Record<string, unknown>` for JSONB fields.
  - Nullable fields match the DB schema (e.g., day_id on Waypoint is nullable for unassigned waypoints per Decision #5).

### WI#4 — Auth UI (Login, AuthGuard, OAuth Callback)
- **Auth store:** `src/stores/authStore.ts` — Zustand store with `user`, `session`, `isLoading`, `setUser`, `setSession`, `logout`, `initialize` actions. `initialize()` fetches session and subscribes to `onAuthStateChange`; returns cleanup function.
- **Login page:** `src/pages/LoginPage.tsx` — full login/signup form using shadcn Card, Input, Button, Label. Google OAuth button, email/password form with toggle between sign-in and sign-up modes. Shows confirmation message after signup. Redirects to /dashboard on success.
- **Auth guard:** `src/components/AuthGuard.tsx` — wrapper component checking `session` from auth store. Shows spinner while loading, redirects to /login if unauthenticated.
- **OAuth callback:** `src/pages/AuthCallbackPage.tsx` — handles `/auth/callback` route, checks session via Supabase client, redirects to /dashboard or /login.
- **App.tsx:** Auth listener initialized via `useEffect` on mount. Protected routes (/dashboard, /trip/:tripId/plan, /trip/:tripId) wrapped with `<AuthGuard>`. `/auth/callback` route added.
- **shadcn components installed:** button, input, card, label (in `src/components/ui/`).
- **ESLint config:** Added override to disable `react-refresh/only-export-components` for `src/components/ui/**` since shadcn components export both components and variant helpers.
- **Auth types:** Uses `Session`, `User`, `AuthError` from `src/types/auth.ts` (Gimli's types). Auth functions from `src/lib/auth.ts`.
