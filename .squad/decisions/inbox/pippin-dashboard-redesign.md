# Decision: Dashboard Redesign Implementation

**Author:** Pippin (Frontend Dev)
**Date:** 2026-02-22
**Status:** Implemented

## Summary

Rewrote `DashboardPage` from a card-grid layout to a map-centric sidebar+map layout per Galadriel's design spec.

## Components Created

1. **`src/components/TripListItem.tsx`** — Compact list item for the sidebar. Shows title, status badge, date range, and route distance. Supports hover/selected states for map interaction.
2. **`src/components/map/DashboardMap.tsx`** — Multi-trip map component using MapLibre GL JS. Shows markers at route centroids, draws selected trip route, bidirectional hover highlighting.

## Key Decisions

- **DashboardMap is separate from MapView** — no draw tools, no waypoint layer, multi-trip mode only. This avoids adding complexity to the existing MapView.
- **Trip selection is two-step** — first click selects (shows route on map), second click navigates to planner. This encourages map exploration.
- **Route distance uses haversine** — calculated client-side from route_geojson coordinates, no turf dependency in the list item.
- **Sidebar uses `bg-sidebar` CSS variable** — follows existing theme token convention from index.css.
- **TripCard not deleted** — still available for other views; just no longer used on dashboard.

## Files Changed

- `src/pages/DashboardPage.tsx` — Full rewrite
- `src/components/TripListItem.tsx` — New
- `src/components/map/DashboardMap.tsx` — New

## Impact

- No changes to TripPlannerPage, MapView, TripCard, tripStore, or router
- Build passes, 149 tests pass
