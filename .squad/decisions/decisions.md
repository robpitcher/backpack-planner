# Decisions — Backpack Planner / TrailForge MVP

**Last Updated:** 2026-02-21T14:15Z

---

## Decision: PRD Decomposition — TrailForge MVP

**Author:** Strider (Lead)  
**Date:** 2026-02-21  
**Status:** Approved  
**Scope:** Full MVP work item breakdown from specs/mvp.md (v1.1)

### Context

Rob requested decomposition of the TrailForge PRD into concrete, actionable work items for the squad. The PRD defines 11 P0 features and 5 P1 features across a 3-month MVP timeline.

### Architectural Decisions Made During Decomposition

1. **Route geometry storage:** The data model in the PRD has no explicit field for the route polyline. Decision: add a `route_geojson JSONB` column to the `Trip` table to store the Mapbox Draw GeoJSON output. This keeps it simple for the single-route-per-trip MVP constraint.

2. **API contract-first approach:** Gimli and Pippin should agree on TypeScript types/interfaces for all entities (Trip, Day, Waypoint, GearItem) before building independently. This enables parallel work without integration surprises.

3. **Unit conversion is a shared utility, not duplicated:** A single `src/utils/units.ts` module owned by Pippin, tested by Legolas. All UI components import from this module. No conversion logic in backend — DB stores imperial only (per PRD §7, Appendix).

4. **Public share view security:** The share endpoint uses a Supabase Edge Function with service-role key that filters to `is_public = true` trips only. RLS bypassed only in this controlled function. Gimli owns this.

5. **Scaffold includes CI:** The project scaffold should include basic CI (lint + type-check) from day one to prevent drift.

### Work Item Breakdown

#### Phase 1 — Month 1: Foundation & Core CRUD

| # | Title | Owner | Depends On | Size | Done When |
|---|-------|-------|------------|------|-----------|
| 1 | **Database schema + RLS policies** | Gimli | — | M | All tables (User, Trip, Day, Waypoint, GearItem, Conditions) created in Supabase with RLS policies scoped to `user_id`. `route_geojson` JSONB column added to Trip. Migration files committed. |
| 2 | **Project scaffold (Vite + React + TS + Tailwind + shadcn/ui)** | Pippin | — | M | Vite app boots with React 18, TypeScript strict mode, Tailwind CSS, shadcn/ui installed, Zustand store shell, React Router v6 with all routes stubbed, ESLint + Prettier configured, Supabase client initialized. |
| 3 | **Supabase Auth setup (email + Google OAuth)** | Gimli | 1 | S | Supabase Auth configured with email and Google OAuth provider. Auth helpers and session management utilities exported for frontend use. |
| 4 | **Auth UI (login/signup page + auth guard)** | Pippin | 2, 3 | S | Login page with email + Google sign-in buttons. Auth guard redirects unauthenticated users to `/login`. Successful login redirects to `/dashboard`. |
| 5 | **User profile & unit preference** | Pippin | 4 | S | Profile settings page where user can set display name, avatar, skill level, and imperial/metric preference. Preference persisted to Supabase `User` table. |
| 6 | **Unit conversion utility module** | Pippin | 2 | S | `src/utils/units.ts` with pure functions for distance (mi↔km), elevation (ft↔m), weight (oz↔g), temperature (°F↔°C). Exported as a single module. Unit tests passing. |
| 7 | **TypeScript shared types/interfaces** | Pippin | 1 | S | Shared type definitions for Trip, Day, Waypoint, GearItem, Conditions matching the DB schema. Used by both Zustand store and Supabase queries. |
| 8 | **Trip CRUD API layer** | Gimli | 1 | S | Supabase client functions for create, read, update, delete, and archive trips. Includes duplicate-trip deep-clone function stub. |
| 9 | **Dashboard UI** | Pippin | 4, 7, 8 | M | Card grid showing user's trips with title, status badge, dates, thumbnail map placeholder, and quick stats (days, miles). Status filter (draft/planned/active/completed). Empty state for new users. |
| 10 | **Trip CRUD UI (create/rename/delete)** | Pippin | 9, 8 | S | Create trip modal, rename inline, archive and delete with confirmation. All actions update dashboard in real time via Zustand. |

**Parallelization (Month 1):**
- Items 1 (Gimli) and 2 (Pippin) run in parallel — no dependencies.
- Item 3 (Gimli) starts once schema is done; items 6, 7 (Pippin) can proceed in parallel.
- Items 8 (Gimli) and 9 (Pippin) can overlap once types (7) are agreed.

---

#### Phase 2 — Month 2: Map, Route & Itinerary

| # | Title | Owner | Depends On | Size | Done When |
|---|-------|-------|------------|------|-----------|
| 11 | **Mapbox basemap integration** | Pippin | 2 | M | Full-screen Mapbox GL JS map renders on `/trip/:tripId/plan`. Satellite/topo toggle works. Map resizes responsively with sidebar. |
| 12 | **Route drawing (polyline)** | Pippin | 11 | L | User can draw a single continuous route using Mapbox Draw. Route GeoJSON saved to Trip record. Total distance and cumulative elevation gain display in real time (in user's preferred units). |
| 13 | **Waypoint CRUD backend** | Gimli | 1 | S | Supabase client functions for waypoint create, read, update, delete, and reorder. Supports all waypoint types (trailhead, campsite, water_source, summit, hazard, poi, resupply). |
| 14 | **Waypoint placement on map** | Pippin | 11, 13, 7 | M | Click-to-place waypoints with type picker popup. Typed icon markers on map (distinct icon per waypoint type). Draggable markers that update lat/lng on drop. |
| 15 | **Waypoint detail panel** | Pippin | 14 | S | Edit panel for waypoint name, type, notes (free-text for water source reliability, hazard info, etc.). Changes persist to Supabase. Delete waypoint with confirmation. |
| 16 | **Day/Itinerary CRUD backend** | Gimli | 1 | S | Supabase client functions for day create, read, update, delete, reorder. Assign/unassign waypoints to days. Calculate mileage and elevation delta per day. |
| 17 | **Sidebar itinerary panel** | Pippin | 14, 16 | L | Sidebar tab showing day-by-day breakdown. Each day card shows day number, start/end waypoint, mileage, elevation gain/loss (in user's units). Drag-and-drop waypoint reorder within and across days. Add/remove days. Add rest/zero days. |
| 18 | **Responsive trip planner layout** | Pippin | 11, 17 | M | Map + sidebar layout that works on desktop and tablet. Sidebar collapses on smaller screens. Map controls remain accessible. |

**Parallelization (Month 2):**
- Items 13, 16 (Gimli backend) run in parallel with item 11 (Pippin map setup).
- Item 12 (route drawing) and 14 (waypoint placement) can be sequenced after map is ready, while Gimli is available for support/review.
- Item 17 (itinerary panel) is the critical path — depends on both waypoint and day backends.

---

#### Phase 3 — Month 3: Gear, Sharing, P1 Features & Polish

| # | Title | Owner | Depends On | Size | Done When |
|---|-------|-------|------------|------|-----------|
| 19 | **Gear list CRUD backend** | Gimli | 1 | S | Supabase client functions for gear item create, read, update, delete. Category filtering. Weight aggregation queries (base weight, total weight, worn weight). |
| 20 | **Gear list UI** | Pippin | 19, 7 | M | Sidebar tab with gear item list grouped by category. Add/edit/delete items with name, category, weight (oz or g per user pref), quantity. Running weight totals. Pack/check toggle for each item. |
| 21 | **Trip share view backend** | Gimli | 1, 8 | M | Supabase Edge Function using service-role key to serve public trip data (map, itinerary, gear summary) for trips where `is_public = true`. Sanitized response — no user PII beyond display name. |
| 22 | **Trip share view frontend** | Pippin | 21, 11 | M | Read-only page at `/trip/:tripId` showing map with route and waypoints, day-by-day itinerary, gear summary. No auth required. Clean, printable layout. |
| 23 | **Elevation profile chart** (P1) | Pippin | 12 | M | Visual elevation cross-section chart (Recharts or similar) of the route polyline, with day boundary markers overlaid. Renders in user's preferred elevation unit. |
| 24 | **GPX import — backend** (P1) | Gimli | 1 | M | Supabase Edge Function to accept GPX file upload, parse with `gpxparser`, extract route polyline and waypoints, validate, and store. Error handling for malformed files. |
| 25 | **GPX import — frontend** (P1) | Pippin | 24, 11 | S | File upload UI on the trip planner. Uploaded GPX populates route polyline and optionally imports waypoints. Progress indicator and error messages for bad files. |
| 26 | **GPX export** (P1) | Gimli | 13, 16 | S | Endpoint/function to serialize trip route + waypoints to GPX format. Download triggers from trip planner UI. |
| 27 | **Conditions tab — backend** (P1) | Gimli | 1 | M | Supabase Edge Function proxying NWS 7-day forecast API. Caches response in `Conditions` table with 6hr TTL. Returns forecast keyed to trip start location. |
| 28 | **Conditions tab — frontend** (P1) | Pippin | 27 | S | Sidebar tab showing 7-day weather forecast (temp in °F/°C, precipitation, wind). Graceful fallback UI when NWS is unavailable. |
| 29 | **Gear templates** (P1) | Gimli | 19 | S | Seed data for 3 gear templates (3-season ultralight, winter, desert). API to list templates and clone one into a trip's gear list. |
| 30 | **Gear templates UI** (P1) | Pippin | 29, 20 | S | "Start from template" button on gear tab. Template picker modal. Cloned items appear in gear list and are editable. |
| 31 | **Trip duplication** (P1) | Gimli | 8, 13, 16, 19 | M | Deep-clone endpoint that copies trip, route, all waypoints, all days (with assignments), and all gear items into a new trip owned by the same user. |
| 32 | **Analytics setup** | Gimli | 1 | S | Supabase Analytics configured to track key events: trip creation, share link views, gear list creation, GPX imports. Dashboard or queries for success metrics from PRD §7. |
| 33 | **Responsive polish & QA** | Pippin | 18, 20, 22 | M | Final responsive pass on all views. Tablet breakpoint validated. Functional on mobile (not optimal per PRD). Cross-browser check (Chrome, Firefox, Safari). |

**Parallelization (Month 3):**
- Items 19, 21, 24, 27 (Gimli backend) can all proceed in parallel with item 20 (Pippin gear UI).
- GPX and Conditions frontends (25, 28) are small and can slot in once backends land.
- Item 33 (QA polish) is the final gate — Legolas should be heavily involved here.

---

### Technical Risks & Pre-Work Decisions Needed

| # | Risk / Decision | Impact | Action |
|---|----------------|--------|--------|
| R1 | **Route geometry storage** — PRD data model has no route field | High | Decision made: add `route_geojson JSONB` to Trip table. Gimli to include in schema migration (Item 1). |
| R2 | **Mapbox API key management** | Medium | Mapbox token must be environment-variable only, never committed. Pippin to use `VITE_MAPBOX_TOKEN` env var. |
| R3 | **GPX parsing edge cases** | Medium | Use `gpxparser` library (PRD recommendation). Gimli to add validation + sanitization. Legolas to write edge-case tests with malformed GPX files. |
| R4 | **Elevation data source for route** | Medium | MVP can use Mapbox terrain data for display. USGS Elevation API deferred to Phase 2 per PRD. Confirm Mapbox terrain tiles are sufficient for cumulative elevation calculation. |
| R5 | **Supabase free tier limits** | Low (MVP) | Monitor row counts. No action needed until ~500 users. |
| R6 | **Unit conversion correctness** | Medium | Centralized utility (Item 6) must have thorough tests. Legolas to write property-based tests for round-trip conversions. |
| R7 | **Drag-and-drop library choice** | Low | Pippin to evaluate `@dnd-kit/core` vs `react-beautiful-dnd` for itinerary reordering. Decision before Item 17. |

---

### Summary

- **33 work items** total (22 P0, 11 P1)
- **Month 1:** 10 items — foundation, auth, dashboard, CRUD
- **Month 2:** 8 items — map, route, waypoints, itinerary (critical path)
- **Month 3:** 15 items — gear, sharing, P1 polish, QA
- **Gimli and Pippin can work in parallel** for most of the timeline — backend APIs land slightly ahead of frontend consumption
- **Legolas** should begin writing tests in Month 1 (unit conversion, auth flows) and ramp up for integration/E2E in Month 3

---

## Decision: Database Schema & RLS — Gimli (Work Item #1)

**Author:** Gimli (Backend Dev)  
**Date:** 2026-02-21  
**Status:** Implemented  
**Scope:** Supabase schema migrations with RLS policies

### Key Architectural Decisions

1. **Users table extends auth.users via FK**
   - `public.users` uses `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
   - Supabase Auth owns user lifecycle; deleting auth user cascades to profile and downstream data

2. **route_geojson stored as JSONB on trips**
   - Per Strider's architectural gap analysis, added `route_geojson JSONB` to trips table
   - Stores full GeoJSON FeatureCollection/LineString for single route per trip (MVP constraint)
   - No PostGIS extension needed for MVP (spatial queries deferred)

3. **Public trip sharing via RLS (not Edge Function)**
   - RLS policies allow unauthenticated SELECT on trips, days, waypoints, and conditions where `is_public = true`
   - Share view uses standard Supabase anon key — no service-role Edge Function needed for basic reads
   - Gear lists and recommendations remain owner-only (not visible in share view)

4. **Gear items scoped to both user_id and trip_id**
   - Gear items have FKs to both users and trips; RLS checks `auth.uid() = user_id` directly
   - Supports future cross-trip gear management (e.g., "my gear closet") while keeping items trip-scoped for MVP

5. **Day-Waypoint relationship uses SET NULL**
   - Days reference start/end waypoints with ON DELETE SET NULL
   - Waypoints can exist unassigned to any day during initial trip planning before itinerary organized

### Files Created
- `supabase/migrations/20260221090001_create_enums.sql`
- `supabase/migrations/20260221090002_create_tables.sql`
- `supabase/migrations/20260221090003_create_rls_policies.sql`

---

## Decision: Project Scaffold — Pippin (Work Item #2)

**Author:** Pippin (Frontend Dev)  
**Date:** 2026-02-21  
**Status:** Implemented  
**Scope:** Vite + React + TypeScript + Tailwind + shadcn/ui + Zustand + Router

### Key Architectural Decisions

1. **React 19 instead of React 18**
   - Kept React 19 (Vite's current default) — current stable release, backwards-compatible, avoids future migration
   - All PRD features work identically on both versions

2. **Tailwind CSS v4**
   - Using Tailwind CSS v4 with Vite plugin (`@tailwindcss/vite`), not v3 with PostCSS
   - Current stable release; simplifies config (no tailwind.config.js needed); shadcn/ui supports v4 natively

3. **shadcn/ui new-york style**
   - Initialized with "new-york" style variant (default); clean, modern aesthetic fits TrailForge brand
   - Can be themed later via CSS variables

4. **Path alias @/\***
   - Set up `@/*` → `./src/*` path alias across Vite, TypeScript, and shadcn configs
   - Clean imports (`@/lib/supabase` vs `../../../lib/supabase`); standard convention for Vite + shadcn projects

---

## Decision: Auth Setup — Gimli (Work Item #3)

**Author:** Gimli (Backend Dev)  
**Date:** 2026-02-21  
**Status:** Implemented  
**Scope:** Supabase Auth configuration and utilities

### Key Architectural Decisions

1. **Google OAuth callback URL pattern**
   - `${window.location.origin}/auth/callback` used as OAuth redirect target
   - Standard SPA pattern; callback route in app so frontend can handle token exchange and redirect to dashboard
   - Must be registered in Supabase Dashboard → Auth → URL Configuration → Redirect URLs

2. **AuthResult<T> wrapper type**
   - All auth functions return `{ data: T | null, error: AuthError | null }` via `AuthResult<T>`
   - Mirrors Supabase SDK pattern; normalizes shape across sign-up (may return null session if email confirmation required), sign-in, and profile fetch
   - Frontend always destructures `{ data, error }` — no surprises

3. **getUserProfile queries public.users separately from auth**
   - `getUserProfile()` calls `supabase.auth.getUser()` to get auth user id, then queries `public.users` for profile row
   - Supabase Auth metadata (auth.users) and app profile table (public.users) are separate concerns
   - Profile table has app-specific fields (preferred_units, skill_level) that don't belong in auth metadata
   - Requires row in `public.users` for every auth user (post-signup hook future work item)

4. **No auth Zustand store in this item**
   - Auth utilities are pure async functions, not a Zustand store
   - Auth state store is frontend concern (Pippin's domain); these utilities are API layer that store will call

### Functions Exported
- signUpWithEmail(email, password) → AuthResult<AuthSession>
- signInWithEmail(email, password) → AuthResult<AuthSession>
- signInWithGoogle() → redirects to Google OAuth
- signOut() → AuthResult<void>
- resetPassword(email) → AuthResult<void>
- updatePassword(newPassword) → AuthResult<void>
- getUserProfile() → AuthResult<User>

### Files Created
- `src/lib/auth.ts` (74 lines)
- `src/types/auth.ts` (28 lines)

---

## Decision: Types & Units Module Design — Pippin (Work Items #6, #7)

**Author:** Pippin (Frontend Dev)  
**Date:** 2026-02-21  
**Status:** Implemented  
**Scope:** Shared TypeScript interfaces and unit conversion utility

### Work Item #6: Unit Conversion Utility

#### Key Architectural Decision
- **Formatter functions accept imperial values only**
  - Formatters (formatDistance, formatElevation, formatWeight, formatTemperature) always receive imperial values (DB canonical unit) and convert internally based on UnitSystem
  - Matches "store imperial, convert on display" architecture from PRD §6
  - Avoids ambiguity about input units; components never need to know conversion math

#### Functions Exported
- **Distance:** miToKm, kmToMi
- **Elevation:** ftToM, mToFt
- **Weight:** ozToG, gToOz
- **Temperature:** fahrenheitToCelsius, celsiusToFahrenheit
- **Formatters:** formatDistance, formatElevation, formatWeight, formatTemperature

#### Test Coverage
- 39 Vitest unit tests covering:
  - Round-trip conversions (mi↔km, ft↔m, oz↔g, °F↔°C) with tolerance (0.0001)
  - Formatter output (correct unit symbols, decimal places, thousands separator)
  - Edge cases (zero, negative where applicable, very large numbers)
  - All tests passing ✅

### Work Item #7: TypeScript Shared Types

#### Key Architectural Decisions
- **Timestamps as ISO 8601 strings**
  - All `created_at`, `fetched_at`, `expires_at`, `date` fields typed as `string` (not `Date`)
  - Matches Supabase PostgREST JSON serialization; avoids timezone bugs and unnecessary serialization/deserialization

- **JSONB fields as Record<string, unknown>**
  - `route_geojson` on Trip and `data` on Conditions typed as `Record<string, unknown> | null`
  - Keeps types loose for MVP; tighten with GeoJSON and weather-specific types when those features built (Items #11, #28)

- **Vitest for unit testing**
  - Installed Vitest as test runner
  - Vitest shares Vite's config and transform pipeline, giving near-instant test startup
  - Compatible with existing Vite + TypeScript setup with zero additional config

#### Interfaces Exported
1. **User** — id, email, created_at, preferred_units, skill_level
2. **Trip** — id, title, status, date_start, date_end, route_geojson, is_public, created_at, user_id
3. **Day** — id, trip_id, date, distance_miles, elevation_gain_ft, start_waypoint_id, end_waypoint_id
4. **Waypoint** — id, day_id, name, lat, lng, elevation_ft, notes, order, created_at
5. **GearItem** — id, user_id, trip_id, name, weight_oz, category
6. **Conditions** — id, trip_id, weather_forecast, sunrise, sunset, data (JSONB)

#### Enums Exported
1. **UnitSystem** — IMPERIAL, METRIC
2. **SkillLevel** — BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
3. **TripStatus** — DRAFT, PLANNED, ACTIVE, COMPLETED
4. **GearCategory** — BACKPACK, TENT, SLEEPING_BAG, CLOTHING, FOOD, WATER, TOOLS, OTHER
5. **WeatherCondition** — CLEAR, PARTLY_CLOUDY, CLOUDY, RAINY, SNOWY

### Files Created
- `src/utils/units.ts` (112 lines, 8 functions + 4 formatters)
- `src/utils/__tests__/units.test.ts` (182 lines, 39 tests)
- `src/types/index.ts` (108 lines, 6 interfaces + 5 enums)

---

## Decision: Trip CRUD API Layer — Gimli (Work Item #8)

**Author:** Gimli (Backend Dev)  
**Date:** 2026-02-21  
**Status:** Implemented  
**Scope:** Trip CRUD API functions in `src/lib/api/trips.ts`

### Key Architectural Decisions

1. **Separate ApiResult<T> wrapper (not reusing AuthResult<T>)**
   - Data access functions return `PostgrestError`, not `AuthError`
   - Created `ApiResult<T>` type with same `{ data, error }` shape but correct error type
   - Keeps TypeScript honest — consumers get proper error typing without casting

2. **RLS-only auth — no user_id in createTrip input**
   - `createTrip` does not accept a `user_id` parameter
   - Supabase RLS default value (`auth.uid()`) handles user assignment at database level
   - API layer cannot accidentally create trips for other users

3. **duplicateTrip is a shallow stub**
   - Copies trip-level fields only (title, description, dates, region)
   - Does NOT copy days, waypoints, gear items, or conditions (Item #31 scope)
   - Copy resets to `draft` status and `is_public: false` to prevent accidental public exposure

4. **archiveTrip uses 'completed' status**
   - `trip_status` enum has four values: draft, planned, active, completed
   - "Archive" maps to `completed` since schema has no separate archived status
   - Future work item can add distinct archive semantics if needed

5. **API directory established at src/lib/api/**
   - Home for all Supabase data access functions
   - Future modules (days, waypoints, gear) follow same pattern

### Functions Implemented
- createTrip(title, description, dateStart, dateEnd, region) → ApiResult<Trip>
- getTrip(tripId) → ApiResult<Trip>
- getUserTrips(filters) → ApiResult<Trip[]>
- updateTrip(tripId, updates) → ApiResult<Trip>
- deleteTrip(tripId) → ApiResult<void>
- archiveTrip(tripId) → ApiResult<Trip>
- duplicateTrip(tripId, newTitle) → ApiResult<Trip>

### Files Created
- `src/lib/api/trips.ts` (main CRUD module)

---

## Decision: Auth UI Layer — Pippin (Work Item #4)

**Author:** Pippin (Frontend Dev)  
**Date:** 2026-02-21  
**Status:** Implemented  
**Scope:** Login page, auth guard, OAuth callback, Zustand store

### Key Architectural Decisions

1. **Auth state lives in Zustand, not React context**
   - Auth state (user, session, isLoading) managed in Zustand store (`authStore.ts`)
   - Consistent with project stack; simpler than Context + Provider
   - Any component can access auth state without prop drilling

2. **Auth listener initialized in App.tsx useEffect**
   - `useAuthStore.initialize()` called once on mount with cleanup on unmount
   - Ensures auth subscription active globally before any route renders
   - Single point of initialization avoids duplicate listeners

3. **AuthGuard is a wrapper component, not a route layout**
   - `<AuthGuard>` wraps individual route elements rather than layout route
   - More explicit — protected routes visible in route config
   - Simpler to implement without React Router layout patterns

4. **ESLint override for shadcn/ui components**
   - Disabled `react-refresh/only-export-components` for `src/components/ui/**`
   - shadcn components export helper utilities (e.g., buttonVariants) alongside components
   - This is intentional and standard shadcn practice

### Components Implemented
- **LoginPage** — Email + Google OAuth with form validation
- **AuthGuard** — Protected route wrapper with session check
- **/auth/callback** — OAuth redirect handler for token exchange
- **authStore** — Zustand store with session listener

### Files Created
- `src/pages/login.tsx` (LoginPage)
- `src/components/auth-guard.tsx` (AuthGuard wrapper)
- `src/pages/auth/callback.tsx` (/auth/callback route)
- `src/stores/auth.ts` (Zustand store)
- `src/hooks/use-auth.ts` (auth store hook)
