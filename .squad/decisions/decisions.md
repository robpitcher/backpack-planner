# Decisions — Backpack Planner / TrailForge MVP

**Last Updated:** 2026-02-21T14:01Z

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
