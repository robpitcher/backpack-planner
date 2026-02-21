# Decision: Phase 2 Foundation — Store Schema & Mapbox Setup

**Author:** Pippin  
**Date:** 2026-02-21  
**Items:** WI#21 (Store Schema Extension), WI#1 (Mapbox Integration Setup)

## Store Schema (WI#21)

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

## Mapbox Integration (WI#1)

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
