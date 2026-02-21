# Decision: Gear UI Components — Gimli

**Author:** Gimli  
**Date:** 2026-02-21  
**Items:** 9, 10, 11 — Gear Tab, Gear Form, Gear Templates, Pack Checklist

## Decisions

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

## Impact
- Pippin: Sidebar tab structure exists — can add a Waypoints tab when ready.
- Pippin: GearTab reads preferredUnits from useAuthStore — no auth store changes needed.
- Pre-existing WaypointLayer.tsx unused import warnings fixed (WaypointType, WAYPOINT_STYLES removed).
