# Gimli — History

## Project Context

- **Project:** Backpack Planner — a webapp for outdoor adventurers with interactive maps
- **Stack:** Web application (frontend + backend + mapping — TBD)
- **User:** Rob

## Learnings

### PRD Decomposition & Breakdown (2026-02-21)
- PRD decomposed into **33 work items across 3 phases** (22 P0, 11 P1)
- **Phase 1 items 1–10 are ready** for pickup — foundation, auth, dashboard, CRUD
- See `.squad/decisions/decisions.md` for full breakdown with parallelization strategy
- **Tech Stack Confirmed:**
  - Frontend: Vite + React 18 + TypeScript + Tailwind + shadcn/ui + Zustand
  - Backend: Supabase (Auth, Postgres, RLS, Edge Functions)
  - Mapping: Mapbox GL JS
  - Data: All units stored in imperial in DB; client-side conversion only
- **Key items for Gimli:**
  - Phase 1: Database schema + RLS (1), Supabase Auth setup (3), Trip CRUD API (8)
  - Phase 2: Waypoint CRUD backend (13), Day/Itinerary CRUD backend (16)
  - Phase 3: Gear list CRUD backend (19), Trip share view backend (21), GPX import backend (24), GPX export (26), Conditions backend (27), Gear templates (29), Trip duplication (31), Analytics (32)
- **Critical decision: Route geometry storage** — add `route_geojson JSONB` to Trip table (Item 1)
- **Risk: Public share security** — use Supabase Edge Function with service-role key, RLS bypass controlled (Item 21)
- **Risk: GPX parsing** — use gpxparser library, handle edge cases and malformed files

### Database Schema — Work Item #1 (2026-02-21)
- **Migration files:** `supabase/migrations/20260221090001_create_enums.sql`, `..._090002_create_tables.sql`, `..._090003_create_rls_policies.sql`
- **Tables created:** users, trips, days, waypoints, gear_items, conditions, recommendations (7 tables)
- **Enums:** unit_preference, trip_status, waypoint_type, gear_category, condition_source, recommendation_type (6 enums)
- **Architecture decisions:**
  - `users` table references `auth.users(id)` via FK with CASCADE delete — extends Supabase Auth
  - `route_geojson JSONB` column on trips table stores full GeoJSON polyline per trip
  - Days→Waypoints FKs use ON DELETE SET NULL (waypoints can exist without a day assignment)
  - Trips→Days/Waypoints/GearItems/Conditions/Recommendations use ON DELETE CASCADE
  - Partial index on `trips.is_public` for efficient public trip lookups
  - Gear items have both `user_id` and `trip_id` FKs for RLS and future cross-trip gear management
- **RLS patterns:**
  - Owner tables (users, gear_items): direct `auth.uid() = user_id` check
  - Trip-child tables (days, waypoints, conditions): EXISTS subquery joining to trips.user_id
  - Public read: trips with `is_public = true` are readable by anyone; days, waypoints, conditions inherit public visibility
  - Gear and recommendations are owner-only (no public read)
- **Indexes:** user_id on all owner-scoped tables, trip_id on all child tables, email on users, status on trips
- **Units:** All numeric values stored in imperial (miles, feet, oz) per PRD Appendix

### Supabase Auth Setup — Work Item #3 (2026-02-21)
- **Files created:** `src/types/auth.ts` (type definitions), `src/lib/auth.ts` (auth utilities)
- **Exports:** signUp, signIn, signInWithGoogle, signOut, getSession, onAuthStateChange, getUserProfile
- **Types exported:** UserProfile (mirrors public.users row), AuthResult<T> wrapper, re-exported Session/User/AuthError from Supabase
- **Architecture decisions:**
  - Auth utilities import from `@/lib/supabase` (Pippin's client from Item #2)
  - Google OAuth redirect set to `${window.location.origin}/auth/callback` — Pippin will need a route for this
  - `getUserProfile()` uses `supabase.auth.getUser()` first, then queries `public.users` — keeps auth and profile concerns separated
  - `onAuthStateChange` returns the raw `Subscription` so the caller can unsubscribe (e.g., in a React useEffect cleanup)
  - `AuthResult<T>` wrapper provides a consistent `{ data, error }` shape across all auth functions
  - No Zustand store created here — that's Pippin's domain (frontend state management)

### Trip CRUD API — Work Item #8 (2026-02-21)
- **File created:** `src/lib/api/trips.ts`
- **Exports:** createTrip, getTrip, getUserTrips, updateTrip, deleteTrip, archiveTrip, duplicateTrip
- **Types exported:** ApiResult<T> (result wrapper), CreateTripInput, UpdateTripInput
- **Architecture decisions:**
  - Created `ApiResult<T>` wrapper separate from `AuthResult<T>` — uses `PostgrestError` not `AuthError`
  - `createTrip` does NOT accept `user_id` — RLS infers it from the authenticated session (Supabase auto-sets via `auth.uid()`)
  - `getUserTrips` orders by `created_at DESC` for dashboard display (newest first)
  - `archiveTrip` delegates to `updateTrip` with `status: 'completed'` — matches the `trip_status` enum from schema
  - `duplicateTrip` is a shallow stub: copies trip-level fields only, resets to draft, sets `is_public: false`. Deep-clone (days, waypoints, gear) deferred to Item #31
  - `UpdateTripInput` uses `Partial<Omit<Trip, 'id' | 'user_id' | 'created_at'>>` — prevents mutation of immutable fields
  - All functions respect RLS — no service-role key, no `.auth.admin` calls
- **Key file paths:** `src/lib/api/trips.ts`, types from `src/types/index.ts`, client from `src/lib/supabase.ts`
