# Decisions

<!-- Append-only. Scribe merges from decisions/inbox/. -->

## Issue #9: cursor-pointer in Button base classes

**Date:** 2026-02-22
**Author:** Pippin
**Issue:** #9
**PR:** #15

### Context
The shadcn/ui Button component did not include `cursor-pointer` in its base Tailwind classes, so buttons didn't show a pointer cursor on hover (browsers default `<button>` to `cursor: default`).

### Decision
Added `cursor-pointer` to the `buttonVariants` CVA base string in `src/components/ui/button.tsx`. This is a single-point change that applies to every Button variant and size across the app.

### Rationale
- One-line fix with app-wide coverage; no per-component overrides needed.
- Follows user expectation that clickable elements show pointer cursor.

---

## Issue #6: Shared Breadcrumb Component Pattern

**Date:** 2026-02-22
**Author:** Pippin
**Issue:** #6
**PR:** #17

### Decision
Created a shared `src/components/Breadcrumb.tsx` component for page-level breadcrumb navigation in headers. Custom implementation (not shadcn) since no shadcn breadcrumb was available in the project.

### Details
- Uses `BreadcrumbItem[]` prop: each item has `label`, optional `href` (renders Link), optional `onClick` (renders button)
- Last item is always the current page (aria-current="page", no link)
- ChevronRight icon as separator, theme-aware classes, responsive truncation
- Replaces static title text in DashboardPage and TripPlannerPage headers

### Impact
Any future pages should use this Breadcrumb component in their headers for consistent navigation.

---

## Issue #5: Waypoint context menu pattern

**Date:** 2026-02-22
**Author:** Pippin
**Issue:** #5
**PR:** #16

### Decision
Waypoint context menus follow the same DropdownMenu + dialog pattern as TripCard. Each action (Edit, Delete) opens its own dialog component to keep WaypointList.tsx clean. The ⋮ button uses hover-reveal (`group` + `opacity-0 group-hover:opacity-100`).

### Files
- `src/components/sidebar/WaypointList.tsx` — menu trigger + state
- `src/components/sidebar/WaypointEditDialog.tsx` — edit modal
- `src/components/sidebar/DeleteWaypointDialog.tsx` — delete confirmation

### Notes
- Uses optimistic updates with API rollback on failure, matching the gear/day patterns in tripStore.
- Calls API directly from dialog components rather than adding new store actions, since the store already has local `updateWaypoint`/`removeWaypoint`.
