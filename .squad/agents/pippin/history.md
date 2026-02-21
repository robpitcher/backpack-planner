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

### WI#9 — Dashboard UI (Trip Card Grid)
- **Trip store:** `src/stores/tripStore.ts` — Zustand store with `trips`, `isLoading`, `statusFilter`, `fetchTrips(userId)`, `setFilter()`. Exports `useFilteredTrips()` selector hook that returns trips filtered by current status filter.
- **Auth store extended:** Added `userProfile: UserProfile | null` to `src/stores/authStore.ts`. Fetches user profile via `getUserProfile()` on session init and auth state changes — provides `preferred_units` for unit-aware display.
- **AppHeader:** `src/components/AppHeader.tsx` — shared header with "TrailForge" brand, user email, profile link (UserCircle icon), sign out button (LogOut icon). Used on dashboard (will be reused on trip planner pages).
- **TripCard:** `src/components/TripCard.tsx` — reusable card using shadcn Card + Badge. Shows map placeholder (gray box with MapPin icon), title, color-coded status badge (draft=gray, planned=blue, active=green, completed=purple), date range, day count. Click navigates to `/trip/:tripId/plan`. Accepts `units` prop for unit-aware formatting via `formatDistance()`.
- **DashboardPage:** `src/pages/DashboardPage.tsx` — full dashboard with AppHeader, "My Trips" heading, "Create Trip" button, status filter buttons (All/Draft/Planned/Active/Completed), responsive card grid (1 col mobile, 2 col tablet, 3 col desktop), loading skeleton (6 placeholder cards), empty state with Compass icon + CTA button.
- **shadcn components installed:** badge, skeleton, tabs (tabs not used yet but available for future).
- **Responsive grid:** Uses Tailwind `grid gap-4 sm:grid-cols-2 lg:grid-cols-3` for the 1/2/3 column breakpoints.
- **Date formatting:** Uses `toLocaleDateString('en-US', { month: 'short', day: 'numeric' })` with timezone-safe `T00:00:00` suffix to avoid off-by-one date display.

### WI#5 — User Profile Settings Page
- **Profile API helper:** `src/lib/api/profile.ts` — `getUserProfile(userId)` and `updateUserProfile(userId, data)` functions using Supabase client. Follows same `ApiResult<T>` pattern as trips API.
- **Profile page:** `src/pages/ProfilePage.tsx` — settings form with display_name (text input), avatar_url (URL input), skill_level (select dropdown: beginner/intermediate/advanced), unit preference toggle (Switch: imperial ↔ metric). Save button persists to Supabase `users` table. Uses sonner toast for success/error feedback.
- **Auth store extended:** Added `preferredUnits: UnitSystem` and `setPreferredUnits()` to `src/stores/authStore.ts`. Initialized from profile on login and auth state changes. Available app-wide for all components to read current unit preference.
- **Route added:** `/profile` route in App.tsx, protected by AuthGuard.
- **Dashboard header:** Added header bar to DashboardPage with TrailForge branding, profile settings link, user email display, and sign-out button.
- **Toaster:** Added `<Toaster />` (sonner) to App.tsx for app-wide toast notifications.
- **shadcn components installed:** select, switch, separator, sonner (added to existing button, input, card, label).

### WI#10 — Trip CRUD UI (Create, Rename, Delete, Archive)
- **Trip store extended:** `src/stores/tripStore.ts` — Added `createTrip`, `updateTrip`, `deleteTrip`, `archiveTrip` actions. All call API functions and update local state. `updateTrip`, `deleteTrip`, and `archiveTrip` use optimistic updates with rollback on failure.
- **CreateTripDialog:** `src/components/CreateTripDialog.tsx` — Modal dialog (shadcn Dialog) with title (required), description, start_date, end_date fields. On success, navigates to `/trip/:newTripId/plan`. Resets form on close.
- **RenameTripDialog:** `src/components/RenameTripDialog.tsx` — Small dialog for renaming a trip title. Uses optimistic `updateTrip` store action.
- **DeleteTripDialog:** `src/components/DeleteTripDialog.tsx` — AlertDialog with destructive confirmation. Shows trip title in prompt. Uses optimistic `deleteTrip` store action.
- **TripCard actions menu:** Updated `src/components/TripCard.tsx` — Added kebab (⋮) DropdownMenu with Rename, Archive (hidden when already completed), and Delete options. Menu click stops event propagation to prevent card navigation. Dialogs rendered outside Card to avoid z-index issues.
- **DashboardPage updated:** `src/pages/DashboardPage.tsx` — "Create Trip" button now opens CreateTripDialog instead of navigating to /trip/new/plan. Removed unused `useNavigate` import.
- **shadcn components installed:** dialog, dropdown-menu, alert-dialog.
- **Design decisions:**
  - Optimistic UI for all mutations — update store immediately, rollback on API failure.
  - Archive option hidden on already-completed trips (no-op would confuse users).
  - `e.stopPropagation()` on menu trigger and content to prevent card click-through.
  - Toast notifications via sonner for all CRUD success/failure feedback.

### Settings Page Audit (WI#10 revisit)
- **ProfilePage already complete:** All settings requirements (unit toggle, display name, avatar URL, skill level, save with sonner toasts) were already implemented in WI#5.
- **Consistency fix:** Added `AppHeader` to ProfilePage — previously used an ad-hoc "← Back" button, now uses the shared header matching DashboardPage layout. Removed unused `useNavigate` import.
- **Layout pattern:** All authenticated pages should wrap content in `<div className="min-h-screen bg-background">` with `<AppHeader />` at the top and `<main>` for content. This is the established pattern.

## 🎉 Phase 1 Complete (10/10 Items)

**Date:** 2026-02-21  
**Status:** ✅ ALL FOUNDATION ITEMS DONE

**Summary:** Phase 1 foundation complete — all 10 items delivered. Built: Supabase schema + RLS, email+Google auth, dashboard with trip cards, Trip CRUD (create/rename/delete/archive), unit system, shared types. All CI checks passing. Ready for Phase 2: map integration, route drawing, waypoints, itinerary panel. Squad synchronized.

### WI#21 — Store Schema Extension for Phase 2
- **Trip store extended:** `src/stores/tripStore.ts` — Added `route`, `waypoints`, `days`, `gearItems`, `conditions` state fields.
- **CRUD actions:** Full add/update/remove/set for waypoints, days, gear items. `setRoute()` and `setConditions()` for route and conditions.
- **Selectors:** `getTotalDistance()`, `getTotalElevationGain()`, `getDayMileage(dayId)`, `getGearWeights()` — all read from store state, return computed values.
- **Types reused:** All Phase 1 types (Day, Waypoint, GearItem, Conditions) from `src/types/index.ts` already had the needed fields — no type changes required.
- **Design decisions:**
  - `TripPlannerState` interface separated from `TripState` using `extends` for clarity.
  - Route stored as `Record<string, unknown> | null` matching the Trip.route_geojson type.
  - Gear weight selector returns `{ base, worn, packed, total }` breakdown in oz.
  - Selectors use `getState()` (non-reactive) — components should use `useTripStore(selector)` for reactive updates.

### WI#1 — Mapbox Integration Setup
- **Packages installed:** `mapbox-gl`, `@mapbox/mapbox-gl-draw`, `@types/mapbox-gl`.
- **MapView component:** `src/components/map/MapView.tsx` — full-screen Mapbox GL map using `forwardRef` to expose map instance via `MapViewHandle`. Includes loading spinner, error state (missing token / network failure), nav controls, and `outdoors-v12` default style.
- **MapStyleToggle component:** `src/components/map/MapStyleToggle.tsx` — button in top-right corner to toggle between topo (`outdoors-v12`) and satellite (`satellite-streets-v12`) styles. Uses Mountain/Satellite lucide icons.
- **TripPlannerPage updated:** `src/pages/TripPlannerPage.tsx` — full-height layout with header bar + MapView filling remaining space. Map ref exposed for future parent control.
- **Type declaration:** `src/types/mapbox-gl-draw.d.ts` — ambient module declaration for `@mapbox/mapbox-gl-draw` (no `@types` package available).
- **Token:** Uses `VITE_MAPBOX_TOKEN` from env. `.env.example` already had the placeholder.
- **Default center:** Utah (38.57°N, 111.09°W) at zoom 6 — great hiking territory.

### WI#2 (Phase 2) — Route Drawing
- **Packages installed:** `@turf/length`, `@turf/helpers` for distance calculation from polyline coordinates.
- **DrawControls component:** `src/components/map/DrawControls.tsx` — toolbar with draw toggle, undo last point, clear route, and finish drawing buttons. Buttons appear conditionally based on state (undo/clear only when points exist, finish only when actively drawing).
- **RouteStats component:** `src/components/map/RouteStats.tsx` — bottom-center stats bar showing total route distance (in user's preferred units via `formatDistance`) and point count. Uses Route and MapPin icons from lucide-react.
- **MapView updated:** `src/components/map/MapView.tsx` — integrated MapboxDraw with custom trail-colored styling (orange dashed active line, red-brown solid finished line, white circles with red-brown stroke for vertices). Draw state syncs to trip store via `setRoute()`. Existing route loads from store on map init. Style toggle preserves draw features across style swaps.
- **Route data flow:** Drawn polyline stored as GeoJSON Feature (LineString) in trip store `route` field. Store uses `Record<string, unknown>` type matching the Trip.route_geojson schema. Distance calculated via `@turf/length` in kilometers, converted to miles via `kilometersToMiles()`.
- **Draw interaction model:** Click pencil to enter draw mode → click map to add points → click finish or pencil again to complete. Undo removes last vertex. Clear deletes entire route. After drawing, route is editable (drag vertices via direct_select mode).
- **Design decisions:**
  - Used MapboxDraw's built-in `draw_line_string` mode rather than custom click handlers — provides double-click-to-finish, vertex dragging, and feature editing for free.
  - Custom DRAW_STYLES array overrides MapboxDraw defaults for trail-appropriate appearance.
  - Route coords synced to store on every draw.create, draw.update, and draw.delete event.
  - Style changes save/restore features via `draw.getAll()` / `draw.set()` to survive style swaps.

### WI#4 (Phase 2) — Waypoint Placement & Types
- **WaypointLayer component:** `src/components/map/WaypointLayer.tsx` — manages Mapbox markers for all waypoints, handles placement mode (click map → creation popup), drag-to-reposition, click-to-view/edit/delete. Loads existing waypoints from API on mount.
- **WaypointForm component:** `src/components/map/WaypointForm.tsx` — reusable form for create/edit with name (required), type (select from 7 types), coordinates (read-only), and notes (textarea). Used inside Mapbox popups via `createRoot`.
- **WaypointPopup component:** `src/components/map/WaypointPopup.tsx` — info popup showing name, type, elevation, notes, with Edit and Delete buttons.
- **waypointUtils:** `src/components/map/waypointUtils.ts` — shared constants for waypoint type styles (colors, labels), SVG icon paths, and `createMarkerElement()` for HTML markers.
- **WaypointList sidebar:** `src/components/sidebar/WaypointList.tsx` — waypoint list in the sidebar Map tab. Shows colored dot by type, name, elevation. Click pans the map to the waypoint via `panToWaypoint()`.
- **DrawControls updated:** Added "Place Waypoint" (MapPin) button with purple active state. Waypoint placement and route drawing modes are mutually exclusive.
- **MapView updated:** Added `tripId` prop, `isPlacingWaypoint` state, `mapReady` state, WaypointLayer integration. MapViewHandle now exposes `getIsPlacing`/`setIsPlacing`.
- **TripPlannerPage updated:** Map tab now shows WaypointList instead of placeholder text. Default tab changed to "map". Clicking a waypoint in the list pans the map to it.
- **shadcn components installed:** textarea, popover.
- **Design decisions:**
  - Custom HTML markers via `mapboxgl.Marker({ element })` with SVG circles for each waypoint type — simpler and more flexible than Mapbox symbol layers for interactive use.
  - Markers are draggable; drag-end triggers optimistic store update + API persist with rollback on failure.
  - Waypoint creation uses `createRoot` to render React form inside Mapbox popups — keeps the popup interactive.
  - Placement mode and draw mode are mutually exclusive — entering one cancels the other.
  - Waypoint CRUD flows through existing store actions (addWaypoint/updateWaypoint/removeWaypoint) backed by waypoints API.

### WI#6+7 (Phase 2) — Day-by-Day Itinerary Tab
- **ItineraryTab component:** `src/components/itinerary/ItineraryTab.tsx` — main itinerary panel with unassigned waypoints section, day cards, and "Add Day" button. Fetches days on mount, computes dates from trip start_date + day offset.
- **DayCard component:** `src/components/itinerary/DayCard.tsx` — expandable card for each day showing day number, computed date, per-day stats (miles, elevation gain/loss), assigned waypoints with type-colored dots, waypoint assignment dropdown, move up/down reordering, delete with AlertDialog confirmation, and inline notes editing.
- **Store extensions:** Added API-backed day actions to tripStore: `fetchDays`, `createDayApi`, `updateDayApi`, `deleteDayApi`, `reorderDaysApi`, `assignWaypointToDay`. All use optimistic updates with rollback on failure. `daysLoading` and `daysError` state added.
- **Waypoint assignment:** "Unassigned Waypoints" section at top of itinerary shows waypoints with day_id=null. Each has a "Move to Day X" dropdown. Day cards show a "Remove" button (hover) to unassign. Assignment calls `assignWaypointToDay` API.
- **TripPlannerPage updated:** Sidebar now has 3 tabs: Map, Gear, Itinerary (CalendarDays icon). Itinerary tab gets tripId and currentTrip.start_date.
- **Design decisions:**
  - Used Select dropdown for waypoint assignment instead of drag-and-drop — simpler, more accessible, and avoids adding a DnD library dependency for MVP.
  - Day deletion optimistically unassigns waypoints (sets day_id to null in store) alongside removing the day.
  - Reorder uses move up/down buttons rather than drag-and-drop for consistency with the assignment approach.
  - Notes editing is inline (click to edit) rather than a modal — keeps the UX lightweight.
  - Date computation uses trip start_date + day_number offset with timezone-safe `T00:00:00` parsing.

### WI#12 — Conditions Tab (NWS Weather)
- **API client:** `src/lib/api/conditions.ts` — `fetchWeatherForecast(lat, lng)` fetches 7-day forecast from NWS API. Two-step flow: GET /points/{lat},{lng} → get forecast URL → GET forecast. Parses day/night periods into paired forecast days with high/low temps. In-memory cache with 6-hour TTL. Handles rate limits, invalid coordinates (non-US), and network errors.
- **ConditionsTab component:** `src/components/conditions/ConditionsTab.tsx` — sidebar tab displaying weather forecast cards. Each card shows: weather icon (Lucide), day name, date, high/low temps (unit-aware via formatTemperature), short forecast description, precipitation chance. Trip date overlap highlighted with orange styling and "Trip" badge. Loading spinner, error state with retry button, refresh button with "last updated" timestamp.
- **TripPlannerPage updated:** Added 4th sidebar tab "Conditions" (CloudSun icon). Passes tripId, startDate, endDate props. Uses first waypoint's coordinates as forecast location.
- **Design decisions:**
  - NWS API chosen: free, no API key needed, US-only (sufficient for MVP).
  - User-Agent header set to "TrailForge/1.0" per NWS API requirements.
  - Forecast location uses first waypoint's coordinates — simple and accurate for trail weather.
  - Cache key uses lat/lng rounded to 4 decimal places for consistent hits.
  - Day/night NWS periods paired into single forecast days with high (daytime) and low (nighttime) temps.

### WI#13 — Elevation Profile Chart
- **Packages installed:** `recharts`, `@turf/along` (along not used directly in final impl — interpolation done manually for accuracy).
- **ElevationProfile component:** `src/components/map/ElevationProfile.tsx` — collapsible panel below the map showing elevation vs distance line chart. Uses recharts (ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid).
- **Features:** X-axis distance (mi/km), Y-axis elevation (ft/m) based on user's unit preference. 100-point sampling along route. Day boundaries shown as vertical orange dashed reference lines. Hover tooltip shows formatted distance + elevation. Stats row below chart: total gain, total loss, max elevation, min elevation.
- **Elevation data:** Interpolates from route vertex Z-coordinates (GeoJSON/GPX elevation). Builds cumulative distance for each vertex, finds containing segment, linear interpolation. Assumes elevation in meters (standard GeoJSON), converts to feet for internal storage.
- **Integration:** Rendered in both TripPlannerPage (below map, collapsible) and TripDetailPage (share view, read-only). Only renders when a route with ≥2 points exists. Responsive via recharts ResponsiveContainer.
- **Design decisions:**
  - Collapsible panel (not always visible) to preserve map real estate.
  - 100 sample points for smooth profile without performance issues.
  - Manual elevation interpolation instead of @turf/along (turf's along returns 2D points, doesn't preserve elevation).
  - Stats computed from sampled points (gain/loss via sequential difference summing).

### Dark Mode Theme System (2026-02-22)

- **Theme provider:** `src/lib/theme.tsx` — custom ThemeProvider with ThemeContext and useTheme hook. Supports 3 modes: "dark" (default), "light", "system". Persists to localStorage (key: "theme"). Applies/removes `dark` class on `<html>` element. System mode watches `prefers-color-scheme` media query.
- **ThemeToggle component:** `src/components/ThemeToggle.tsx` — dropdown menu with Sun/Moon icons (lucide-react) and 3 theme options. Icon animates between sun and moon based on current theme using Tailwind dark: variant.
- **AppHeader integration:** Added ThemeToggle button between user email and profile icon in `src/components/AppHeader.tsx`.
- **Default dark mode:** `index.html` has `class="dark"` on `<html>` element — ensures dark mode loads immediately on first visit (no flash of light theme).
- **App.tsx:** Wrapped entire app with ThemeProvider at the root level (outside BrowserRouter).
- **Design decisions:**
  - Used custom theme provider instead of next-themes library (which was already installed but unused) — simpler, no external deps beyond React Context.
  - Dark is the default theme — first-time visitors see dark mode. Light and system modes available via toggle.
  - localStorage key "theme" (standard convention).
  - Sun/Moon icon transition uses Tailwind classes with absolute positioning for smooth swap.
  - Theme applies immediately on load via HTML class (no FOUC) and syncs with localStorage changes.

---

## Team Update: Session 2026-02-21T21:24:38Z

**Status:** Orchestration log and session log written. Decisions merged into decisions.md. Dark mode implementation decision recorded.

**Impact on Pippin:**
- Dark mode implementation decision (6 sub-decisions) recorded in team decisions.md for future reference
- Dark mode default established as team standard — all future UI work respects this choice
- Custom ThemeProvider pattern now team standard (avoiding next-themes dependency)

**Cross-team:** Legolas completed 32 new theme component tests covering ThemeProvider and ThemeToggle, validating Pippin's implementation.
