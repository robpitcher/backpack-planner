# Decisions

_Team decisions are recorded here. Append-only._

---

## Schema Decisions — Gimli (2026-02-21)

Work Item #1: Database Schema & RLS

### 1. Users table extends auth.users via FK
The `public.users` table uses `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`. This means Supabase Auth owns the user lifecycle — deleting an auth user cascades to our profile row and all downstream data.

### 2. route_geojson stored as JSONB on trips
Per Strider's architectural gap analysis, added `route_geojson JSONB` to the trips table. Stores a full GeoJSON FeatureCollection/LineString. No PostGIS extension needed for MVP — spatial queries are not required yet.

### 3. Public trip sharing via RLS (not Edge Function)
RLS policies allow unauthenticated SELECT on trips, days, waypoints, and conditions where `is_public = true`. This means the share view can use the standard Supabase anon key — no service-role Edge Function needed for basic reads. Gear lists and recommendations are owner-only (not visible in share view).

### 4. Gear items scoped to both user_id and trip_id
Gear items have FKs to both users and trips. RLS checks `auth.uid() = user_id` directly. This supports future cross-trip gear management (e.g., "my gear closet") while keeping items trip-scoped for MVP.

### 5. Day-Waypoint relationship uses SET NULL
Days reference start/end waypoints with ON DELETE SET NULL. Waypoints can exist unassigned to any day (e.g., during initial trip planning before itinerary is organized).

---

## Scaffold Decisions — Pippin (2026-02-21)

Work Item #2: Project Scaffold

### 1. React 19 instead of React 18
- **Decision:** Kept React 19 (Vite's current default) instead of downgrading to React 18.
- **Rationale:** React 19 is the current stable release, backwards-compatible with React 18 patterns, and will avoid a future migration. All PRD features work identically on both versions.
- **Impact:** None — all React Router, Zustand, and shadcn/ui APIs are compatible.

### 2. Tailwind CSS v4
- **Decision:** Using Tailwind CSS v4 with the Vite plugin (`@tailwindcss/vite`), not v3 with PostCSS.
- **Rationale:** v4 is the current stable release and simplifies config (no tailwind.config.js needed). shadcn/ui supports v4 natively.

### 3. shadcn/ui new-york style
- **Decision:** Initialized shadcn/ui with the "new-york" style variant (its default).
- **Rationale:** Clean, modern aesthetic fits the TrailForge brand. Can be themed later via CSS variables.

### 4. Path alias @/*
- **Decision:** Set up `@/*` → `./src/*` path alias across Vite, TypeScript, and shadcn configs.
- **Rationale:** Clean imports (`@/lib/supabase` vs `../../../lib/supabase`). Standard convention for Vite + shadcn projects.

---

## Profile & Dashboard Decisions — Pippin (2026-02-21)

Work Items #5 & #9: User profile settings, Dashboard UI

### 1. Sonner for toast notifications (not shadcn Toast)
- **Decision:** Used `sonner` (via shadcn's sonner wrapper) for success/error toast feedback instead of the lower-level shadcn Toast component.
- **Rationale:** Sonner has a simpler API (`toast.success()` / `toast.error()`), auto-dismisses, and is the recommended approach in shadcn/ui v2+. No need for a ToastProvider or imperative hook.

### 2. preferredUnits as top-level auth store field
- **Decision:** Added `preferredUnits: UnitSystem` as a top-level field in the auth store alongside the existing `userProfile` object.
- **Rationale:** Components that only need the unit preference can subscribe to `preferredUnits` without depending on the full profile object. Keeps selectors simple: `useAuthStore(s => s.preferredUnits)`.

### 3. Auth store extended with UserProfile
- **Decision:** Added `userProfile: UserProfile | null` to the auth store, fetched alongside session initialization.
- **Rationale:** `preferred_units` lives on `public.users`, not the Supabase Auth `User` object. The auth store is the natural home for user profile data since it already manages auth lifecycle. Fetching on auth init ensures units are available before any dashboard render.
- **Impact:** Minimal — added one field and one fetch call. No breaking changes to existing auth store consumers.

### 4. Status filter uses buttons, not shadcn Tabs
- **Decision:** Used a row of `Button` components with `variant` toggling for status filtering instead of shadcn `Tabs`.
- **Rationale:** Buttons are more flexible for mobile (horizontal scroll), visually compact, and don't imply tab panel content switching. The filter just controls which cards appear in the same grid.

### 5. Map thumbnail is a placeholder
- **Decision:** Trip cards show a gray `MapPin` icon box instead of a real map thumbnail.
- **Rationale:** Per spec — real map thumbnails depend on Mapbox integration (Phase 2). Placeholder is clean and clearly intentional.
