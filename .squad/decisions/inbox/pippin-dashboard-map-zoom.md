# Dashboard Map: Auto-Zoom on Trip Selection

**Date:** 2026-02-22  
**Author:** Pippin (Frontend Dev)  
**Status:** Implemented  

## Context

The dashboard map (DashboardMap.tsx) was showing trip route lines when a trip was selected from the sidebar, but it wasn't zooming the map to show that route clearly. Users had to manually pan/zoom to see the full selected route. Additionally, waypoint markers (which are stored in the database for each trip) were not visible on the dashboard map.

## Decision

Enhanced `DashboardMap.tsx` with two features:

1. **Auto-zoom on selection:** When a trip is selected, use `map.fitBounds()` with the route's coordinate bounds to smoothly zoom and center the map on that trip's route (800ms animated transition). When deselecting (tripId → null), zoom back out to fit all trip centroids.

2. **Waypoint markers:** Fetch waypoints for the selected trip via `fetchWaypoints()` API and render them as small 8px amber dots. Waypoints are cleared when no trip is selected. No interactivity (dashboard is for overview, not editing).

## Implementation Details

- **Zoom logic:** Calculate bounding box from route GeoJSON coordinates, call `map.fitBounds(bounds, { padding: 80, duration: 800 })`.
- **Waypoint rendering:** Separate `waypointMarkersRef` map tracks waypoint markers independently from trip centroid markers. Waypoints styled as minimal 8px dots with white border (non-interactive).
- **State management:** Added `waypoints` state array to DashboardMap. Waypoints fetched on `selectedTripId` change.
- **Cleanup:** Waypoint markers removed on trip deselection and map unmount.

## Rationale

- **Zoom improves UX:** Users expect the map to focus on the selected trip automatically (consistent with common map app behavior).
- **Waypoints provide context:** Seeing waypoints (campsites, water sources, etc.) on the dashboard gives a quick visual overview of trip structure without opening the planner.
- **Minimal waypoint style:** Dashboard is overview-focused, so waypoints are small and non-interactive (unlike TripPlannerPage where they're draggable and editable).
- **Smooth transitions:** 800ms animated zoom feels polished and helps users track the view change.

## Alternatives Considered

- **No waypoints on dashboard:** Decided against this — waypoints are valuable visual context even in overview mode.
- **Interactive waypoint markers:** Rejected for simplicity. Dashboard is for browsing, not editing. Users can click trip to open planner for full waypoint interaction.
- **Instant zoom (no animation):** Rejected — smooth transitions feel more professional and less jarring.

## Impact

- **UX improvement:** Trip selection now feels responsive and intentional.
- **Visual consistency:** Waypoint markers match the amber (`#D97706`) color scheme used for selected routes and trip markers.
- **No performance concerns:** Waypoint fetch is async and only triggered on selection. Typical trips have 5-20 waypoints (negligible rendering cost).

## Files Changed

- `src/components/map/DashboardMap.tsx` — added waypoint fetching, rendering, and zoom-to-route logic
