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

## 🎉 Phase 1 Complete (10/10 Items)

**Date:** 2026-02-21  
**Status:** ✅ ALL FOUNDATION ITEMS DONE

**Summary:** Phase 1 foundation complete — all 10 items delivered. Built: Supabase schema + RLS, email+Google auth, dashboard with trip cards, Trip CRUD (create/rename/delete/archive), unit system, shared types. All CI checks passing. Ready for Phase 2: map integration, route drawing, waypoints, itinerary panel. Squad synchronized.

### Devcontainer & Local Dev Setup (2026-02-21)
- **Files created:**
  - `.devcontainer/devcontainer.json` — Node 20 image, Docker-in-Docker + Supabase CLI features, port forwarding (5173, 54321-54323), ESLint/Prettier/Tailwind/Supabase VS Code extensions
  - `supabase/config.toml` — Local Supabase config: auth redirect to localhost:5173, email signup enabled, confirmations disabled for dev speed, seed.sql auto-applied
  - `supabase/seed.sql` — Test user (hiker@example.com / testpassword123), 3 trips (planned/draft/completed), 6 waypoints, 4 gear items
  - `.env.local.example` — Local Supabase URL + standard local anon key + Mapbox placeholder
  - `DEVELOPING.md` — Quick start (devcontainer + manual), common commands, DB reset instructions, seed data docs
- **Architecture decisions:**
  - No docker-compose needed — Supabase CLI manages its own Docker stack via `supabase start`
  - Used devcontainer feature `ghcr.io/supabase/devcontainer-features/supabase-cli` for Supabase CLI installation
  - Docker-in-Docker feature required because `supabase start` runs Docker containers inside the devcontainer
  - Auth email confirmations disabled in local config for frictionless dev testing
  - Supabase Studio on port 54323 (Supabase CLI default), API on 54321, DB on 54322
  - Seed data uses deterministic UUIDs for easy reference in tests

### Phase 2 Database Migrations — Work Item #19 (2026-02-21)
- **Migration file:** `supabase/migrations/20260221100001_create_gear_templates.sql`
- **New table:** `gear_templates` — id, name, description, items (JSONB), created_at
- **RLS:** Authenticated users can SELECT gear_templates (shared resource, no anon access)
- **Seed data:** 4 starter templates — "3-Season Ultralight", "Winter 4-Season", "Desert / Arid", "Budget Starter"
- **TypeScript types added:** `GearTemplate` and `GearTemplateItem` interfaces in `src/types/index.ts`
- **Phase 1 coverage verified:** All other Phase 2 tables (trips, days, waypoints, gear_items, conditions) already had complete schemas and RLS from Phase 1 migrations. No additional columns or policies were needed.
- **Key decisions:**
  - `gear_templates.items` stores a JSONB array of template gear items (name, category, weight_oz, quantity)
  - Gear templates are read-only for authenticated users in MVP — admin write access deferred to future iteration
  - `conditions.source` kept as `condition_source` ENUM (not TEXT) — the ENUM provides stronger validation than bare TEXT

### Gear List API + Checklist + Waypoint/Day APIs — Items 9, 11, 13, 16 (Phase 2)
- **Files created:**
  - `src/lib/api/gear.ts` — Full Gear CRUD: fetchGearItems, createGearItem, updateGearItem, deleteGearItem, toggleGearPacked, toggleGearWorn, fetchGearTemplates, loadGearTemplate
  - `src/lib/api/waypoints.ts` — Full Waypoint CRUD: fetchWaypoints, createWaypoint, updateWaypoint, deleteWaypoint, assignWaypointToDay
  - `src/lib/api/days.ts` — Full Day CRUD: fetchDays, createDay, updateDay, deleteDay, reorderDays
- **File updated:** `src/stores/tripStore.ts` — Added API-backed gear actions (fetchGear, addGear, updateGear, deleteGear, togglePacked, toggleWorn, fetchTemplates, loadTemplate) with optimistic updates and rollback on error. Added gearTemplates and gearError state.
- **Types verified:** All types (GearItem, GearTemplate, GearTemplateItem, Day, Waypoint, GearCategory) already present in `src/types/index.ts` — no changes needed.
- **Architecture decisions:**
  - All API files follow the same pattern as `trips.ts`: import supabase client, export ApiResult<T> wrapper, export typed input types, use `.select()` for return data
  - Gear toggle operations (is_packed, is_worn) use optimistic updates in the store: UI updates immediately, DB syncs async, reverts on failure with error state
  - `loadGearTemplate` fetches the template, maps its items array, bulk-inserts via `.insert(rows)`, and appends results to existing gearItems in store
  - `reorderDays` uses `Promise.all` to batch-update `day_number` for each day — no server-side stored procedure needed for MVP
  - Waypoint `assignWaypointToDay` delegates to `updateWaypoint` with `{ day_id }` — keeps it simple
  - Pre-existing `tsc -b` build failure in MapView.tsx (frontend) — not in Gimli's domain. `tsc --noEmit` passes clean.

### Gear List UI — Items 9, 10, 11 (Phase 2 Frontend)
- **Files created:**
  - `src/components/gear/GearTab.tsx` — Main gear panel: grouped-by-category view, sort by name/category, weight summary (base/worn/total), edit/delete actions, is_packed checkbox per item
  - `src/components/gear/GearForm.tsx` — Create/edit gear form with validation (name <50 chars, positive weight, qty ≥ 1), unit-aware weight input (oz/g), category select, is_worn toggle
  - `src/components/gear/GearTemplateModal.tsx` — Template picker dialog: lists templates with preview expand, shows warning when existing items present, bulk-loads template items
  - `src/components/gear/PackChecklist.tsx` — Packing checklist view: progress bar (X of Y packed), optimistic toggle, strikethrough for packed items, sorted unpacked-first
- **File updated:** `src/pages/TripPlannerPage.tsx` — Added sidebar with shadcn Tabs (Map / Gear), GearTab wired to tripId from URL params
- **Pre-existing fix:** Removed unused imports in `WaypointLayer.tsx` (`WaypointType`, `WAYPOINT_STYLES`) to fix `tsc -b` build
- **Architecture decisions:**
  - Sidebar uses shadcn Tabs with Map and Gear tabs; Waypoints tab placeholder deferred for Pippin
  - Weight totals computed via useMemo: base = non-worn items, worn = worn items, total = base + worn
  - GearForm handles unit conversion: displays in user's preferred unit, converts to oz for storage
  - Pack checklist uses optimistic togglePacked from store — no separate API call needed
  - GearItemRow shows edit/delete on hover via group-hover opacity
  - shadcn checkbox component added as dependency

### Trip Share View + GPX Import/Export — Items 8, 14, 15 (Phase 2)
- **Files created:**
  - `src/lib/api/share.ts` — Public trip fetch API: `fetchPublicTrip()` returns trip + days + waypoints + gear summary using anon key. Gear summary shows count/weight only (no individual items per decisions.md)
  - `src/lib/gpx/import.ts` — GPX parser using `@tmcw/togeojson`: parses GPX XML to GeoJSON route + waypoint array. Handles trk, rte, and wpt elements. MultiLineString flattened to LineString.
  - `src/lib/gpx/export.ts` — GPX 1.1 generator: `buildGPX()` converts trip route (GeoJSON) + waypoints to valid GPX XML. `downloadGPX()` triggers browser file download.
  - `src/components/map/GPXImportButton.tsx` — File upload button accepting .gpx files, parses and persists route + waypoints to DB, shows distance + waypoint count in toast
  - `src/components/map/GPXExportButton.tsx` — Export button: generates GPX file from current route/waypoints and triggers download
  - `src/components/ShareToggle.tsx` — Public/private toggle with copy-link URL display
- **Files updated:**
  - `src/pages/TripDetailPage.tsx` — Rewritten as public share view: read-only trip display with stats cards, itinerary, waypoints, gear summary, read-only Mapbox map (no draw controls). Fetches via `fetchPublicTrip()` — no auth required.
  - `src/pages/TripPlannerPage.tsx` — Added GPX import/export buttons and share toggle to header bar
  - `src/App.tsx` — Removed AuthGuard from `/trip/:tripId` route (now public share view)
  - `package.json` — Added `@tmcw/togeojson` dependency
- **Architecture decisions:**
  - Share view uses same Supabase anon client — RLS policies from Phase 1 already allow anon SELECT on public trips/days/waypoints. No service-role key needed.
  - Gear summary in share view shows aggregate count + weight only — individual items are owner-only per RLS and decisions.md
  - ReadOnlyMap component renders route as a GeoJSON source/layer without MapboxDraw — interactive but no editing
  - GPX import persists both route (via `updateTrip`) and waypoints (via `createWaypoint`) to DB in one flow
  - GPX export generates GPX 1.1 with metadata, wpt elements, and trk/trkseg. Filename format: `{safeName}_{date}.gpx`
  - Share toggle uses store's `updateTrip` for optimistic UI — toggles `is_public` field on trips table

### Trip Duplication (Deep Clone) + Responsive Layout — Items 16, 18 (Phase 2)
- **Files created:**
  - `src/lib/api/duplicate.ts` — Deep-clone API: `duplicateTrip(tripId, newTitle)` fetches source trip + all related data (days, waypoints, gear), creates new trip with fresh UUIDs, remaps day→waypoint FKs, resets status to draft and is_public to false, resets is_packed on gear
  - `src/components/DuplicateTripDialog.tsx` — Dialog with title input (default: "{name} (Copy)"), calls deep-clone API, navigates to new trip on success
- **Files updated:**
  - `src/components/TripCard.tsx` — Added "Duplicate" option to trip card dropdown menu (Copy icon), wired to DuplicateTripDialog
  - `src/lib/api/trips.ts` — Removed old shallow `duplicateTrip` stub (replaced by deep-clone in duplicate.ts)
  - `src/pages/TripPlannerPage.tsx` — Responsive layout polish: sidebar toggle button (PanelLeft icon) visible on < lg viewports, sidebar collapsible on narrow screens, full-width sidebar on mobile, min-height on map container, responsive header spacing, hidden trip ID on small screens
- **Architecture decisions:**
  - Deep-clone uses sequential Supabase inserts (not a DB transaction) — acceptable for MVP since partial clones are harmless drafts
  - Day ID mapping (old→new) is built by matching day_number order after bulk insert, then used to remap waypoint day_id FKs
  - Gear items have `is_packed` reset to false in cloned trip — packing status shouldn't carry over
  - Start/end waypoint refs on days are set to null in clone — would need waypoint ID remapping which adds complexity for little value in MVP
  - Sidebar defaults to open on lg+ (1024px), toggle-able on smaller viewports via `lg:flex` + state-controlled visibility
  - DashboardPage grid already used correct responsive classes (`sm:grid-cols-2 lg:grid-cols-3`) — no changes needed
