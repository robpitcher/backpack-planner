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
