# Decision: Waypoint Placement Implementation — Pippin

**Date:** 2026-02-22
**Work Item:** Phase 2, Item 4 — Waypoint Placement & Types

## Decisions

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
