# Pippin — History

## Project Context

- **Project:** Backpack Planner — outdoor adventure webapp
- **Stack:** React + TypeScript, Vite, Tailwind CSS, shadcn/ui, MapLibre GL JS, Supabase, Zustand
- **User:** Rob

## Learnings

- Built all Phase 1 frontend: auth UI, profile page, dashboard, trip CRUD UI, unit conversion utility, shared types
- Dashboard uses card grid layout with status filter pills and TripCard components
- TripPlannerPage uses flex h-screen with collapsible sidebar (w-80), tabbed navigation, map takes flex-1
- MapLibre GL JS with OpenFreeMap tiles (liberty style), no API key needed
- Theme system: CSS custom properties (HSL) in src/index.css, ThemeProvider in src/lib/theme.tsx
- Dark mode: layered blue-gray palette, semantic Tailwind classes (bg-background, bg-card, text-foreground)
- Issue #9: Added `cursor-pointer` to `buttonVariants` base classes in `src/components/ui/button.tsx` so all Button instances show pointer cursor on hover. One-line fix, app-wide effect. PR #15.
- Issue #5: Added waypoint context menu (⋮ dropdown) to sidebar. Created WaypointEditDialog.tsx and DeleteWaypointDialog.tsx. Follows TripCard DropdownMenu pattern. PR #16.
- Waypoint CRUD: Store has local `updateWaypoint`/`removeWaypoint`; API calls in `src/lib/api/waypoints.ts` (`updateWaypoint`, `deleteWaypoint`). Use both for optimistic updates + API persistence.
- WAYPOINT_TYPES and WAYPOINT_STYLES live in `src/components/map/waypointUtils.ts` — reuse for type dropdowns.
- Pattern for hover-reveal actions: add `group` class on parent `<li>`, then `opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100` on the trigger button.
- Issue #6: Created shared `src/components/Breadcrumb.tsx` for dynamic breadcrumb navigation. Uses ChevronRight separator, ARIA nav/aria-current, truncation for responsive design. Dashboard shows "TrailForge"; TripPlannerPage shows "TrailForge → {Trip Name}" with optional waypoint segments. PR #17.
- Breadcrumb items use `BreadcrumbItem` interface: `{ label, href?, onClick? }`. Last item gets `aria-current="page"`, others are clickable links/buttons.
- Trip name in TripPlannerPage comes from local `tripName` state synced from `currentTrip` and `getTrip()` API call.

## Session: 2026-02-22T16:45

**Focus:** Issue assignment orchestration — PRs #15, #16, #17 logged and decisions merged.

- Issue #9 (PR #15): cursor-pointer button fix — merged
- Issue #6 (PR #17): breadcrumb navigation — merged
- Issue #5 (PR #16): waypoint context menu — merged

All three frontend issues completed and orchestrated by Scribe. Decisions moved from inbox to decisions.md.

## Session: Breadcrumb Revision (PR #17)

**Focus:** Revise breadcrumb per Rob's spec at `specs/breadcrumb.md`.

- **Breadcrumb.tsx**: Updated to allow last item to be clickable (onClick or href) while keeping aria-current="page". Previously last item was always a plain span.
- **DashboardPage.tsx**: Removed ArrowLeft back button; TrailForge breadcrumb is now clickable (onClick deselects trip).
- **TripPlannerPage.tsx**: Breadcrumb simplified to `TrailForge → Trip Planner` — removed trip name and waypoint-level segments. Extracted `resetMapView` callback (deselects waypoint + fitBounds) shared by breadcrumb click and waypoint toggle.
- **WaypointList.tsx**: Added `onDeselect` prop + flex-1 spacer div below waypoint list; clicking blank area deselects waypoint and resets map.
- Pattern: `resetMapView` extracts the deselect+fitBounds logic for reuse across breadcrumb, waypoint toggle, and sidebar blank-click.

## Session: Adventure Themes (PR #22)

**Focus:** Issue #12 — Add 3 adventure-themed color schemes to theme dropdown.

- Theme type extended: `'dark' | 'light' | 'system' | 'deep-forest' | 'dusk-ridge' | 'canopy'`
- Adventure themes are dark-based: `applyTheme()` adds both `dark` and theme-specific class to `<html>` so `dark:` Tailwind utilities keep working.
- CSS variables use OKLCH color space matching existing pattern in `src/index.css`.
- `applyTheme()` now cleans up all theme classes before applying — uses `ADVENTURE_THEMES` const array for DRY removal.
- ThemeToggle dropdown uses `DropdownMenuSeparator` to visually separate standard (Light/Dark/System) from adventure themes.
- Lucide icons for adventure themes: Trees (Deep Forest), Sunset (Dusk on the Ridge), Leaf (Canopy).
- Hex-to-OKLCH conversion done via manual matrix math in Node.js (no external deps needed).
- Each theme maps 8 spec colors → 30+ CSS variables by deriving muted/accent/sidebar/chart variants from the palette.

## Session: Profile Modal

**Focus:** Convert profile editing from a dedicated page to an in-place modal dialog.

- Created `src/components/ProfileModal.tsx` — reusable Dialog-based profile editor with save/cancel. Uses shadcn Dialog, loads profile on open, closes on save/cancel.
- Profile form extracted from ProfilePage.tsx logic (display name, avatar URL, skill level, unit preference).
- Modal uses `onSelect` on DropdownMenuItem (not `asChild` + Link) to open — avoids navigation, stays on current page.
- Added `backdrop-blur-sm` to `DialogOverlay` in `src/components/ui/dialog.tsx` — applies to all dialogs app-wide for consistent blurred backdrop.
- DashboardPage, TripPlannerPage, AppHeader all updated to open ProfileModal instead of navigating to /profile.
- `/profile` route kept in App.tsx for backwards compatibility.
- User preference: Rob prefers modal-based editing over page navigation so users stay in context.

## Session: Login Modal

**Focus:** Convert login from a dedicated page to a non-dismissable modal over the dashboard.

- Created `src/components/LoginModal.tsx` — non-closeable Dialog-based login form. Uses `showCloseButton={false}`, `onInteractOutside`/`onEscapeKeyDown` with `preventDefault()` to block dismissal. `onOpenChange` is a no-op.
- Updated `src/components/AuthGuard.tsx` — no longer redirects to `/login`. Instead renders children (the page) with `<LoginModal open={!session} />` overlay. Dashboard renders blurred behind it via the existing `backdrop-blur-sm` on DialogOverlay.
- Updated `src/pages/LoginPage.tsx` — simplified to a `<Navigate to="/dashboard" replace />` redirect for backward compatibility.
- On successful auth, the auth store session updates → AuthGuard re-renders → LoginModal closes automatically (open becomes false).
- Pattern: non-dismissable modals use `showCloseButton={false}` + event `preventDefault()` on `onInteractOutside` and `onEscapeKeyDown`.
- Card inside modal uses `border-0 shadow-none` to blend with DialogContent background.

## Session: Guest Preview Mode

**Focus:** Allow visitors to preview the dashboard without signing in.

- Removed AuthGuard from `/dashboard` route in App.tsx — dashboard renders for all visitors.
- Added `isGuest` flag in DashboardPage derived from `!session` (auth store).
- Guest profile button: plain `<Button>` navigating to `/login` instead of a dropdown menu with profile/logout.
- Guest sidebar CTA: "Sign in to Manage Trips" (with LogIn icon, `variant="secondary"`) replaces "Create Trip".
- Theme toggle (ThemeProvider) is auth-independent — works for guests with no changes needed.
- Map (DashboardMap) is fully interactive for guests — no auth dependency in the map component.
- AuthGuard kept on `/profile` and `/trip/:id/plan` routes — those still require login.
- LoginPage.tsx and `/login` route untouched — still works for direct navigation.
- Pattern: use `isGuest` boolean from auth store session to conditionally render auth-aware vs guest UI in the same component.

## Session: Login Modal on Dashboard

**Focus:** Convert login flow from page navigation to a modal dialog overlaying the dashboard.

- Created `src/components/LoginModal.tsx` — Dialog-based login form following ProfileModal pattern. Uses `showCloseButton={false}`, `sm:max-w-md` width, logo at top, all auth methods (Google, email/password, magic link, sign up).
- Updated `src/pages/DashboardPage.tsx` — added `loginOpen` state; replaced 3 `navigate('/login')` calls with `setLoginOpen(true)` (profile button for guests, empty-state link, "Sign in to Manage Trips" button).
- LoginModal closes on successful sign-in via `onOpenChange(false)`. User can also click outside to dismiss.
- Card inside modal uses `border-0 shadow-none` to blend with DialogContent. DialogHeader is sr-only since the Card provides visible headings.
- `/login` route and LoginPage.tsx kept for backward compatibility (AuthGuard redirects, bookmarks).
- `bg-background` used for divider text background instead of `bg-card` since modal content sits on dialog background.

## Session: 2026-02-23T21:57 — Elevation Bug Investigation (Samwise)

**Focus:** Elevation unit mismatch investigation filed by Samwise (Cartographer).

- **Root Cause:** Meters stored in DB/GPX, displayed as feet in all UI components — systemic unit mismatch.
- **Secondary Issues:** Hardcoded unit labels ignore user preference (4 components affected), sea-level detection treats Z=0 as "no data", map-placed waypoints lack elevation queries, no unit documentation.
- **Impact:** WaypointPopup, WaypointList, TripDetailPage, ElevationProfile, WaypointLayer all affected.
- **Decision Required:** Establish **feet** as internal unit (aligns with existing ElevationProfile code and majority of display logic).
- **Fixes Needed:** GPX import/export conversion, replace hardcoded "ft" labels with formatElevation using user preference, fix sea-level check, add unit documentation.
- **Affected Files:** src/lib/gpx/{import,export}.ts, src/components/map/{ElevationProfile,WaypointPopup}.tsx, src/components/sidebar/WaypointList.tsx, src/pages/TripDetailPage.tsx, src/types/index.ts
- **Status:** Decision inbox merged. Awaiting decision implementation.