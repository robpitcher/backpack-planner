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
