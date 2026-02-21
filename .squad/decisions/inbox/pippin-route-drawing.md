# Decision: Route Drawing Implementation — Pippin

**Date:** 2026-02-21
**Work Item:** Phase 2, Item 2 — Route Drawing

## Decisions

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
