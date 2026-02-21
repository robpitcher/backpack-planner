# Decision: Day-by-Day Itinerary Tab — Pippin

**Author:** Pippin  
**Date:** 2026-02-22  
**Items:** Phase 2, Items 6+7 — Itinerary Panel & Waypoint-to-Day Assignment

## Decisions

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

## Impact
- Sidebar now has 3 tabs — future tabs should be added to the TabsList in TripPlannerPage.
- Store has full API-backed day CRUD + waypoint assignment. Other components can use `assignWaypointToDay` for waypoint management.
- No new npm dependencies required.
