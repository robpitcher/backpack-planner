# Decision: Gear API Layer Patterns

**Author:** Gimli  
**Date:** Phase 2  
**Items:** 9, 11, 13, 16

## Decisions

### 1. Optimistic updates for gear toggles (is_packed, is_worn)
Toggle operations update UI state immediately, then sync to Supabase. On failure, the store reverts to the previous state and sets `gearError` for the UI to display. This keeps the checklist UX snappy.

### 2. API files follow trips.ts pattern
All new API files (`gear.ts`, `waypoints.ts`, `days.ts`) use the same `ApiResult<T>` wrapper, typed input types with `Partial<Omit<...>>` for updates, and standard Supabase query builder chains. Consistency across the API layer.

### 3. loadGearTemplate is a two-step client operation
Template loading fetches the template first, then bulk-inserts mapped items. No server-side function needed for MVP. Items are appended to existing gear (not replaced) so users can load multiple templates.

### 4. reorderDays uses parallel client-side updates
Day reordering fires parallel `.update()` calls via `Promise.all` rather than a server-side RPC. Acceptable for MVP since trip days are typically < 30 rows. If performance becomes an issue, we can add a Supabase Edge Function later.

### 5. Store exposes both local and API gear actions
The tripStore keeps the existing local `addGearItem`/`updateGearItem`/`removeGearItem` setters (for Pippin's local-only operations) alongside the new API-backed `addGear`/`updateGear`/`deleteGear` actions. Frontend can choose which to use.

## Impact
- Pippin: New store actions available for gear UI components. Use `fetchGear(tripId)` on mount, `togglePacked`/`toggleWorn` for checklist, `loadTemplate` for template loading.
- Pippin: `gearError` state available to display error toasts.
