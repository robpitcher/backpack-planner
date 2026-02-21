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

---

## Phase 2 Foundation — Pippin (2026-02-21)

Work Items #21 (Store Schema Extension), #1 (Mapbox Integration Setup)

### 1. TripPlannerState extends TripState
- Separated Phase 2 planner state into its own interface (`TripPlannerState`) that `TripState` extends.
- Keeps the store type definition organized as it grows.

### 2. Selectors use getState() (non-reactive)
- `getTotalDistance()`, `getTotalElevationGain()`, `getDayMileage()`, `getGearWeights()` are plain functions using `useTripStore.getState()`.
- For reactive usage in components, consumers should use `useTripStore(s => ...)` selectors.
- This avoids hook constraints in non-component contexts (event handlers, callbacks).

### 3. Gear weight breakdown
- `getGearWeights()` returns `{ base, worn, packed, total }` in ounces.
- `base` = packed weight, `worn` = worn weight, `total` = worn + packed.
- Items can be both worn and packed (e.g., worn clothing that's also "packed" in the list).

### 4. MapView uses forwardRef for parent control
- Exposes `MapViewHandle` with `getMap()` so parent components can access the raw `mapboxgl.Map` instance.
- Needed for future drawing tools (WI#2) and waypoint placement (WI#14).

### 5. Map error handling is inline, not ErrorBoundary
- Invalid token / network errors are caught via `map.on('error')` and displayed in-place.
- React ErrorBoundary would be overkill here since Mapbox errors are async, not render-time throws.

### 6. Default map center: Utah
- Center: 38.57°N, 111.09°W, zoom 6. Great hiking territory for demo purposes.
- Will be overridden by trip route data once loaded.

### 7. @mapbox/mapbox-gl-draw types
- No `@types` package exists for mapbox-gl-draw, so a minimal ambient declaration was added at `src/types/mapbox-gl-draw.d.ts`.
- Covers the API surface we'll need for WI#2 (route drawing).

---

## Route Drawing Implementation — Pippin (2026-02-21)

Work Item #2 — Route Drawing

### 1. MapboxDraw with custom styles (not manual click handling)
- **Decision:** Used `@mapbox/mapbox-gl-draw` built-in `draw_line_string` mode with custom DRAW_STYLES array, rather than implementing manual map click → polyline logic.
- **Rationale:** MapboxDraw provides double-click-to-finish, vertex dragging, feature selection, and undo support natively. Custom click handling would require reimplementing all of this. The only trade-off is the draw CSS bundle (~20KB), which is negligible.
- **Impact:** Draw UI is a thin wrapper over MapboxDraw modes. Waypoint placement (WI#3) will need to coordinate with draw mode state.

### 2. Turf.js for route distance calculation
- **Decision:** Installed `@turf/length` and `@turf/helpers` for geodesic distance calculation from LineString coordinates.
- **Rationale:** Turf.js is the standard geospatial library for GeoJSON. Calculating distance from lat/lng arrays requires geodesic math (Haversine/Vincenty) — turf handles this correctly. Only installed the specific modules needed (tree-shakeable).
- **Impact:** Additional turf modules can be installed later for elevation profile (WI#23) and GPX import (WI#25).

### 3. Route GeoJSON stored as Feature, not FeatureCollection
- **Decision:** The route is stored as a single GeoJSON `Feature` with `LineString` geometry in the trip store's `route` field.
- **Rationale:** A backpacking trip has one route. Storing as a single Feature simplifies read/write logic. The DB column (`route_geojson JSONB`) accepts any JSON shape.
- **Impact:** If multi-segment routes are needed later, could wrap in a FeatureCollection. Current consumers just need to check `geometry.coordinates`.

### 4. Draw features survive style toggles
- **Decision:** On map style change, save `draw.getAll()` before `setStyle()` and restore via `draw.set()` on `style.load` event.
- **Rationale:** Mapbox GL JS removes all sources/layers on style change, which would erase drawn features. The save/restore pattern preserves the user's route across topo↔satellite toggles.

---

## Waypoint Placement Implementation — Pippin (2026-02-22)

Work Item #4 — Waypoint Placement & Types

### 1. Custom HTML markers (not symbol layers)
- **Decision:** Used `mapboxgl.Marker` with custom HTML elements (SVG circles) rather than Mapbox symbol layers or image sprites.
- **Rationale:** Custom markers support native drag-and-drop (`draggable: true`), click event handlers, and per-marker React popup rendering. Symbol layers would require hit-testing, custom drag logic, and separate popup management.
- **Impact:** Each waypoint creates one DOM element. For typical trip waypoint counts (<50), this is fine. If hundreds of waypoints were needed, switching to a symbol layer would be better.

### 2. React in Mapbox popups via createRoot
- **Decision:** Used `createRoot` to render React components (WaypointForm, WaypointPopup) inside Mapbox GL popup DOM containers.
- **Rationale:** Mapbox popups operate outside React's render tree. Using `createRoot` lets us render interactive React forms (with state, event handlers, shadcn components) inside popups. Alternative would be plain HTML strings with manual DOM event binding.
- **Impact:** Popup content has full React capability. Trade-off: doesn't share React context with the main tree (store access via `useTripStore` import works fine since Zustand is module-scoped).

### 3. Placement and draw modes are mutually exclusive
- **Decision:** Entering waypoint placement mode exits draw mode, and vice versa.
- **Rationale:** Both modes use map click events. Allowing both simultaneously would cause conflicting behavior (clicks would try to add route points AND open waypoint forms).
- **Impact:** UI clearly indicates active mode via button color (orange = drawing, purple = placing waypoint).

### 4. Waypoint type color scheme
- **Decision:** Each waypoint type gets a distinct color: trailhead=green, campsite=orange, water_source=blue, summit=red, hazard=yellow, poi=purple, resupply=brown.
- **Rationale:** Colors match the semantic meaning of each type (blue=water, red=summit/danger, green=start, etc.). Consistent across map markers and sidebar list.

### 5. Sidebar defaults to Map tab
- **Decision:** Changed sidebar default tab from "gear" to "map" so waypoints are immediately visible.
- **Rationale:** The map is the primary view on the trip planner page. Waypoint list should be front and center for the map-first workflow.

---

## Day-by-Day Itinerary Tab — Pippin (2026-02-22)

Work Items #6+7 — Itinerary Panel & Waypoint-to-Day Assignment

### 1. Select dropdowns for waypoint assignment (not drag-and-drop)
- **Decision:** Used shadcn Select dropdowns for "Move to Day X" and "Assign waypoint" instead of implementing drag-and-drop.
- **Rationale:** DnD libraries (dnd-kit, react-beautiful-dnd) add bundle weight and complexity. Select dropdowns are more accessible (keyboard-friendly, screen reader support) and work on mobile without touch event wrangling. Can upgrade to DnD later if UX feedback warrants it.
- **Impact:** No new dependencies added. Simple, predictable UX.

### 2. Move up/down buttons for day reordering
- **Decision:** Days are reordered via ArrowUp/ArrowDown buttons in the day card header, not drag-and-drop.
- **Rationale:** Consistent with the dropdown approach for waypoint assignment. Uses the existing `reorderDays` API which does parallel `Promise.all` updates (per Gimli's decision).

### 3. Optimistic day deletion unassigns waypoints
- **Decision:** When a day is deleted, the store optimistically sets `day_id = null` for all waypoints previously assigned to that day, in addition to removing the day.
- **Rationale:** The database uses ON DELETE SET NULL for the day-waypoint FK relationship. Doing it optimistically in the store keeps the UI consistent without waiting for a refetch.

### 4. Inline notes editing
- **Decision:** Day notes are edited inline (click text to edit, save/cancel buttons) rather than via a modal dialog.
- **Rationale:** Keeps the itinerary panel lightweight. Notes are a secondary feature — a modal would be heavyweight for a text field.

### 5. Date computed from trip start_date + offset
- **Decision:** Day dates are computed client-side as `start_date + (day_number - 1)` rather than stored on each day record.
- **Rationale:** The Day model has a `date` column but it's nullable and not consistently populated. Computing from trip start_date ensures all days show correct sequential dates. Uses `T00:00:00` suffix to avoid timezone off-by-one issues (established pattern from dashboard).

### 6. Three sidebar tabs: Map, Gear, Itinerary
- **Decision:** Added "Itinerary" as the third tab (with CalendarDays icon) after Map and Gear.
- **Rationale:** Natural grouping — Map (spatial), Gear (equipment), Itinerary (temporal planning). Default tab remains "map" per previous decision.

---

## Trip Share View + GPX Import/Export — Gimli (2026-02-21)

Work Items #8, #14, #15

### 1. Share view uses anon key + existing RLS (no Edge Function)
- The public share view at `/trip/:tripId` uses the standard Supabase anon client. Phase 1 RLS policies already allow anonymous SELECT on trips/days/waypoints where `is_public = true`. No service-role Edge Function was needed.

### 2. Gear summary shows aggregates only in share view
- Per decisions.md: gear is owner-only. The share view shows item count, base weight, and total weight — but NOT individual gear items. If RLS blocks anon reads on `gear_items`, the summary gracefully shows zero.

### 3. GPX parsing via @tmcw/togeojson
- Used `@tmcw/togeojson` instead of `gpx-parser-builder` — it produces GeoJSON directly which aligns with our `route_geojson JSONB` storage format. No intermediate conversion needed.

### 4. ReadOnlyMap is a separate component (not MapView with flags)
- The share view uses a lightweight `ReadOnlyMap` component that renders route as a GeoJSON source/layer without MapboxDraw. This avoids adding complexity to the existing MapView with readonly flags.

### 5. GPX import persists to DB immediately
- When importing a GPX file, both the route and waypoints are persisted to Supabase immediately (not just in-memory). This ensures data isn't lost if the user navigates away.

---

## Conditions Tab + Elevation Profile — Pippin (2026-02-22)

Work Items #12, #13

### 1. NWS API for weather (no API key needed)
- **Decision:** Use the National Weather Service API directly (api.weather.gov) instead of a third-party weather service.
- **Rationale:** Free, no API key required, well-documented. US-only limitation is acceptable for MVP (most backpacking trips in this app are US-based).
- **Impact:** Non-US trip locations will show "Location not supported" error. Can add OpenWeatherMap or similar as a fallback later.

### 2. In-memory weather cache (6-hour TTL)
- **Decision:** Weather forecasts are cached in a module-level Map with 6-hour TTL, not persisted to Supabase conditions table.
- **Rationale:** NWS forecasts update every ~6 hours. In-memory cache is simpler and avoids unnecessary DB writes. The conditions store/table can be used later for more sophisticated caching if needed.

### 3. First waypoint as forecast location
- **Decision:** Weather forecast uses the first waypoint's lat/lng coordinates rather than trip center or route centroid.
- **Rationale:** First waypoint (usually trailhead) is the most meaningful weather location for trip planning. Route centroid could be in the middle of wilderness with no weather station.

### 4. Recharts for elevation chart
- **Decision:** Used recharts library for the elevation profile chart.
- **Rationale:** Well-maintained, tree-shakeable, good React integration, responsive containers built-in. Lighter than D3 for this use case.

### 5. Manual elevation interpolation (not @turf/along)
- **Decision:** Built custom elevation interpolation using cumulative segment distances rather than using @turf/along.
- **Rationale:** @turf/along returns 2D points (lat/lng only), doesn't preserve the Z-coordinate (elevation) from the source LineString. Manual interpolation correctly handles 3D coordinates.

### 6. Collapsible elevation panel below map
- **Decision:** Elevation profile renders as a collapsible panel below the map, not inside the sidebar or as a modal.
- **Rationale:** Horizontal chart needs width to be useful. Below-map placement gives full container width. Collapsible toggle preserves map real estate when not needed.

---

## Gear API Layer Patterns — Gimli (Phase 2)

Work Items #9, #11, #13, #16

### 1. Optimistic updates for gear toggles (is_packed, is_worn)
- Toggle operations update UI state immediately, then sync to Supabase. On failure, the store reverts to the previous state and sets `gearError` for the UI to display. This keeps the checklist UX snappy.

### 2. API files follow trips.ts pattern
- All new API files (`gear.ts`, `waypoints.ts`, `days.ts`) use the same `ApiResult<T>` wrapper, typed input types with `Partial<Omit<...>>` for updates, and standard Supabase query builder chains. Consistency across the API layer.

### 3. loadGearTemplate is a two-step client operation
- Template loading fetches the template first, then bulk-inserts mapped items. No server-side function needed for MVP. Items are appended to existing gear (not replaced) so users can load multiple templates.

### 4. reorderDays uses parallel client-side updates
- Day reordering fires parallel `.update()` calls via `Promise.all` rather than a server-side RPC. Acceptable for MVP since trip days are typically < 30 rows. If performance becomes an issue, we can add a Supabase Edge Function later.

### 5. Store exposes both local and API gear actions
- The tripStore keeps the existing local `addGearItem`/`updateGearItem`/`removeGearItem` setters (for Pippin's local-only operations) alongside the new API-backed `addGear`/`updateGear`/`deleteGear` actions. Frontend can choose which to use.

---

## Gear UI Components — Gimli (2026-02-21)

Work Items #9, #10, #11 — Gear Tab, Gear Form, Gear Templates, Pack Checklist

### 1. TripPlannerPage sidebar with shadcn Tabs
- Added a 320px sidebar to TripPlannerPage with Map and Gear tabs.
- Map tab is a placeholder for future map controls / waypoints (Pippin's domain).
- Gear tab mounts GearTab component when tripId is available.
- Default tab set to "gear" since map controls are not yet implemented.

### 2. Weight breakdown: base = non-worn, worn = worn items
- Base weight = sum of all items NOT marked as worn (the pack weight you carry on your back).
- Worn weight = sum of items marked as worn (clothing, shoes on your body).
- Total = base + worn. This matches standard backpacking weight conventions.
- Computed via useMemo in GearTab, separate from the store's getGearWeights() selector.

### 3. GearForm handles unit conversion at the boundary
- Weight is displayed and entered in the user's preferred unit (oz or g).
- Conversion to oz (storage format) happens only on submit via gramsToOunces().
- When editing, stored oz value is converted to display units on mount.
- This keeps the store and API layer unit-agnostic (always oz).

### 4. Pack checklist is a view mode, not a separate route
- GearTab toggles between "All Items" and "Checklist" views via a button pair.
- Checklist view (PackChecklist component) shows unpacked items first with progress bar.
- Uses the same optimistic togglePacked store action as the main list.

### 5. Template modal warns about existing items
- If the trip already has gear items, a warning is shown before loading a template.
- Templates append items (don't replace) — consistent with the loadGearTemplate API decision.

### 6. shadcn checkbox added as new UI dependency
- Installed via `npx shadcn add checkbox` for gear item packed/worn toggles.
- Used in GearItemRow, PackChecklist, and GearForm.

---

## Phase 2 Database Migrations & RLS — Gimli (2026-02-21)

Work Item #19

### 1. gear_templates table is a shared read-only resource
- All authenticated users can SELECT from gear_templates (RLS policy uses `auth.role() = 'authenticated'`).
- No INSERT/UPDATE/DELETE policies for regular users — templates are seeded via migration.
- Future: admin role can manage templates if needed.

### 2. Phase 1 schema already covered most Phase 2 needs
- Reviewed all existing migrations. The Phase 1 schema (tables, columns, RLS) already includes everything needed for trips, days, waypoints, gear_items, and conditions.
- Only `gear_templates` was missing. No ALTER TABLE migrations were needed.

### 3. conditions.source kept as ENUM
- Task spec listed `source TEXT`, but Phase 1 created it as `condition_source` ENUM (`NWS`, `USGS`, `recreation_gov`).
- Kept the ENUM — it provides stronger validation. If new sources are needed, we add enum values via `ALTER TYPE`.

### 4. Gear template items structure
- `items` JSONB column stores an array of objects: `{name, category, weight_oz, quantity}`.
- `category` values match the `gear_category` enum for consistency when importing into `gear_items`.
- Templates do NOT include `is_worn` or `is_packed` — those are user-specific choices set at import time.

---

## Trip Duplication Deep Clone Strategy — Gimli (2026-02-21)

Work Items #16, #18

### 1. Trip Duplication uses sequential inserts (not transaction)
- Deep-clone uses sequential Supabase client-side inserts rather than a server-side transaction or stored procedure. If any step fails mid-clone, you get a partial draft trip — which is harmless and can be deleted. This keeps the implementation simple and avoids needing a Supabase Edge Function just for transactional writes.

### 2. Day→Waypoint FK remapping
- When cloning days and waypoints, we build a `Map<oldDayId, newDayId>` by matching on `day_number` order after bulk insert. Waypoints' `day_id` references are then remapped to the new day IDs. Start/end waypoint refs on days are set to null (avoiding the complexity of a second remapping pass for minimal value).

### 3. Gear packing status reset
- Cloned gear items have `is_packed` reset to `false`. Packing status is ephemeral and shouldn't carry from one trip to another.

### 4. Responsive sidebar strategy
- TripPlannerPage sidebar uses a state-controlled toggle instead of a CSS-only approach. On `lg:` (1024px+) the sidebar is always visible via `lg:flex`. On narrower viewports, the toggle button shows/hides it. The sidebar takes full width on mobile (`w-full`) and fixed width on tablet+ (`sm:w-72 md:w-80`).

---

## Dark Mode Implementation — Pippin (2026-02-22)

Work Item #20

### 1. Default dark class in HTML
- Added `class="dark"` to `<html>` element in `index.html` — ensures dark mode loads immediately on first visit (no flash of unstyled content).

### 2. Custom theme provider over next-themes
- **Decision:** Implemented custom `ThemeProvider` and `useTheme` hook in `src/lib/theme.tsx` instead of using the existing next-themes dependency.
- **Rationale:** Lightweight, full control over behavior, no external dependencies needed for this use case. Manages theme state, localStorage sync, and HTML class application with three modes: "dark" (default), "light", "system".

### 3. System mode watches prefers-color-scheme
- System theme mode watches `prefers-color-scheme` media query and updates dynamically. Listener is properly cleaned up on unmount to prevent memory leaks.

### 4. Theme persistence via localStorage
- Theme preference stored in localStorage under key "theme". System mode is the only stateless mode (computed from OS preference). Dark/light selections persist across sessions.

### 5. ThemeToggle component with icon animation
- Created `src/components/ThemeToggle.tsx` — dropdown menu with Sun/Moon icons (lucide-react). Three options: Light, Dark, System. Icons animate via Tailwind dark: variant.

### 6. ThemeToggle positioned in AppHeader
- Added ThemeToggle between user email and profile icon in the header. Uses ghost button variant and matches existing icon sizing.

---

## Testing Framework Expansion — Legolas (2026-02-21)

Work Item #22 — Test Setup & Patterns

### 1. happy-dom for test environment
- **Decision:** Use happy-dom as the Vitest DOM environment instead of jsdom.
- **Rationale:** Lighter and faster than jsdom, sufficient for component testing with @testing-library/react, recommended by Vitest documentation.

### 2. Global Supabase mock in setup file
- Supabase client mocked globally in `src/test/setup.ts` rather than per-test-file mocks. Prevents real API calls, ensures consistent mock structure, allows tests to override specific method behaviors with `vi.mocked()`.

### 3. Test files co-located with source files
- Test files placed next to source files (e.g., `tripStore.test.ts` next to `tripStore.ts`), not in separate `__tests__/` directory. Follows Vitest convention and aligns with existing project pattern.

### 4. Direct state access for non-reactive selectors
- Computed selectors (getTotalDistance, getGearWeights, etc.) tested using `useTripStore.getState()` directly, not by calling the hook. These are plain functions that cannot be called outside components anyway.

### 5. Avoid testing useFilteredTrips hook directly
- Filter logic tested by accessing store state directly rather than calling the `useFilteredTrips()` hook. Hook integration covered by component tests when added.

### 6. Property-based edge case testing
- Follow explicit edge case enumeration pattern (zero, negative, null, empty arrays) rather than generative property-based testing. Matches existing project style and is sufficient for current scope.

### 7. GPX tests use inline XML fixtures
- GPX tests embed XML strings directly as template literals rather than loading external fixture files. Self-contained, easier to read and modify, avoids fixture file management.

---

## Theme Component Testing — Legolas (2026-02-22)

Work Item #23 — ThemeProvider & ThemeToggle Tests

### 1. Installed @testing-library/jest-dom
- **Decision:** Added `@testing-library/jest-dom` for DOM matchers (toBeInTheDocument, toHaveTextContent, toHaveAttribute).
- **Rationale:** Resolves "Invalid Chai property" errors when using DOM matchers. Imported in `src/test/setup.ts` via `import '@testing-library/jest-dom/vitest'`.

### 2. userEvent instead of direct click()
- **Decision:** Used `userEvent` for interactions instead of calling `click()` directly or using `fireEvent`.
- **Rationale:** More realistic user interactions with proper event sequencing. Async/await handling eliminates React act() warnings.

### 3. Mocked window.matchMedia for system theme testing
- window.matchMedia stubbed globally to control system theme preference in tests. Mock returns proper MediaQueryList shape with addEventListener/removeEventListener. Tests both dark and light preferences and verify listener cleanup.

### 4. Async assertions with waitFor
- Used `waitFor` for testing mediaQuery listener registration and state updates. Handles async useEffect lifecycle in ThemeProvider.

### 5. Test isolation via beforeEach
- Each test clears localStorage, resets document.documentElement.className, and resets matchMedia to default dark preference. Prevents test pollution across test suite.

### 6. ThemeProvider tests focus on state management
- 18 tests covering initialization (default dark, localStorage loading, system theme detection), setTheme behavior, DOM manipulation, edge cases.

### 7. ThemeToggle tests focus on UI interaction
- 14 tests covering rendering, dropdown menu behavior, theme switching, accessibility, integration with ThemeProvider, error handling without provider.
